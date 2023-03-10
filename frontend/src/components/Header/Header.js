import React from 'react';

import logo from "./imgs/logo.svg"

import "./Header.css"
import "../../ui/Container/Container.css"
import "../../ui/Container/Container_justify_sides.css"
import "../../ui/Button/Button.css"
import "../../ui/Button/Button_accent.css"

const Header = () => {

    return (
        <header className="header">
            <div className="header__container container container_justify_sides">
                <div className="header__logo-side">
                    <a href="/" className="header__logo-link"><img src={logo} alt="Лого" width="36px" height="36px" /><p>Evaluate</p></a>

                    

                </div>

                <nav className="header__nav">
                    <a href="/createrequest" className="button button_accent">Провести расчет</a>

                </nav>
                {/* <nav className="header__nav">
                    
                        <a href="/evaluate" className="button button_accent">Провести расчет</a>

                        <a href="/account" className="header__user-wrapper">
                            
                            
                            <div className="header__image-wrapper">
                                <img src="../src/userImgs/<% if (user.photo) {%><%=user.photo%> <% } else { %>sample.svg<% } %> " alt="Иконка пользователя" className="header__user-image">
            
                            </div>

                        </a>
                        
                        
                        <a href="/login" className="header__login-button button button_accent">Войти</a>   
                        <a href="/registration" className="header__registration-button button">Создать аккаунт</a>



                </nav> */}

            </div>
        </header>
    );
};

export default Header;