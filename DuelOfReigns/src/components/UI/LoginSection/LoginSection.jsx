import {Container, Row, Col, Form, Button} from 'reactstrap';
import {useLocation, useNavigate} from "react-router-dom";
import './LoginSection.css';
import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
import {getAppInstance} from "../../../utils/firebase.js";
import {useAuth} from "../../../AuthProvider.jsx";
import imgSrc from '../../../assets/images/boardgame-back.jpg'

const LoginSection = () => {
    const auth = useAuth(),
        {t} = useTranslation(),
        navigate = useNavigate(),
        location = useLocation(),
        [email, setEmail] = useState(""),
        [password, setPassword] = useState(""),
        [apiError, setApiError] = useState(""),
        [authInstance, setAuthInstance] = useState(undefined);
    const from = location.state?.from?.pathname || "/";


    useEffect(() => {
        getAppInstance()
            .then((app) => {
                // Initialize Firebase Authentication and get a reference to the service
                const auth = getAuth(app);
                setAuthInstance(auth);
            })
            .catch((error) => {
                console.error("Failed to initialize Firebase app:", error);
            });
    }, []);

    useEffect(() => {

    }, [apiError])

    const handleLogin = (event) => {
        event.preventDefault();
        if (authInstance) {
            signInWithEmailAndPassword(authInstance, email, password)
                .then((userCredential) => {
                    // Adapt the Firebase user object to match with User type
                    const user = {
                        email: userCredential.user.email,
                        displayName: userCredential.user.displayName,
                    };
                    auth?.signin(user, () => {
                        // Send them back to the page they tried to visit when they were
                        // redirected to the login page.
                        navigate(from, {replace: true});
                    });
                })
                .catch((error) => {
                    if (error.code === "auth/wrong-password") {
                        setApiError(`${t("login.form.error.wrongPassword")}`);
                    } else if (error.code === "auth/invalid-email") {
                        setApiError(`${t("login.form.error.invalidEmail")}`);
                    } else {
                        setApiError(`${error.message}`);
                    }
                    console.error(`Erreur FIREBASE ${error.code} ${error.message}`);
                });
        } else {
            alert("Erreur lors de la récupération de l'instance de Firebase");
        }
    };

    return (
        <section className="login__section">
            <Container fluid>
                <Row>
                    <Col lg="6" className="image__section">
                        <div className="login__image">
                            <img src={imgSrc} alt="Image de connexion" className="w-100"/>
                        </div>
                    </Col>
                    <Col lg="6" className="form__section d-flex align-items-center">
                        <div className="login__form">
                            <h2>Bienvenue!</h2>
                            <Form onSubmit={(ev) => handleLogin(ev)}>
                                {/*<div className="mb-3">*/}
                                {/*    <label htmlFor="pseudo" className="form-label">Pseudonyme</label>*/}
                                {/*    <input type="text" className="form-control" id="pseudo" />*/}
                                {/*</div>*/}
                                <span className={"login-error"}>{apiError}</span>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Adresse Mail</label>
                                    <input onChange={(ev) => setEmail(ev.target.value)} type="email"
                                           className="form-control" id="email"/>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Mot de passe</label>
                                    <input onChange={(ev) => setPassword(ev.target.value)} type="password"
                                           className="form-control" id="password"/>
                                </div>
                                <Button
                                    color={"warning"}
                                    outline={true}
                                    type="submit"
                                    className="btn__account">
                                    Se connecter
                                </Button>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default LoginSection;
