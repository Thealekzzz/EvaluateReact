import React from 'react';
import Header from '../../components/Header/Header';

import "./HowItWorks.css"

import devPhoto from "../../imgs/developer.png";

const HowItWorks = () => {
    return (
        <div>
            <Header />


            <div className="main-container">

                <div className="lead">
                    <img src={devPhoto} alt="" width={500} />

                    <div className="lead__title-wrapper">
                        <h1 className='lead__section-title'>Страница в разработке</h1>
                        <p className="lead__section-subtitle">Разработчик уже трудится над созданием этой страницы.</p>

                        <div className="lead__buttons">
                            <a href="/" className="button button_accent">На главную</a>

                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
};

export default HowItWorks;