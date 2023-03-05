import React from 'react';
import Header from '../../components/Header/Header';

import "../Login/Login.css"

const Registration = () => {
    return (
        <>
        <Header />
        <section class="login-container ">
            <h1 className="login-container__title">Регистрация</h1>
            <form action="/registration" method="post" class="login-container__form">
                <input required autocomplete="new-password" type="text" placeholder="Ваше имя" name="name" class="login-container__form-input form-input" />
                <input required autocomplete="new-password" type="email" placeholder="Электронная почта" name="email" class="login-container__form-input form-input" />
                <input required autocomplete="new-password" type="password" placeholder="Пароль" name="password" class="login-container__form-input form-input" />
                {/* <input type="password" placeholder="Повторение пароля" name="passwordAgain" class="login-container__form-input form-input"> */}
                <button type="submit" class="login-container__form-submit form-button">Регистрация</button>
                <div class="login-container__errors-field login-container__errors-field_hidden"></div>
            
            </form>


        </section>
            
        </>
    );
};

export default Registration;