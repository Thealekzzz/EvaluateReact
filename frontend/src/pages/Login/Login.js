import React, { useRef } from 'react';
import Header from '../../components/Header/Header';

import "./Login.css"

const Login = () => {

    let form = useRef()
    let emailInput = useRef()
    let passwordInput = useRef()

    function submitLoginHandler(e) {
        e.preventDefault()

        if (emailInput.current.value.trim() === "" || passwordInput.current.value.trim() === "") {
            console.log("Данные не введены")
            return
        }

        let fd = new FormData(form.current)

        console.log([...fd.entries()])

        // fetch("/login")
    }

    return (
        <>
            <Header />
            <section className="login-container">
                <h1 className="login-container__title">Вход</h1>
                <form action="/login" method="post" className="login-container__form" ref={form}>

                    <input required type="email" placeholder="Электронная почта" name="email" className="login-container__form-input form-input" ref={emailInput} />
                    <input required type="password" placeholder="Пароль" name="password" className="login-container__form-input form-input" ref={passwordInput} />
                    <button type="submit" className="login-section__form-submit form-button" onClick={submitLoginHandler}>Войти</button>
                    <div className="login-container__errors-field login-container__errors-field_hidden"></div>
                
                </form>


            </section>
        </>
    );
};

export default Login;