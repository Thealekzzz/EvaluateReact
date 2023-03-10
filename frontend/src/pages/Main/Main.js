import React from 'react';

import Header from '../../components/Header/Header';

import mainCow from "../../imgs/mainCow.svg";

import "./Main.css";

const Main = () => {
    return (
        <>
            <Header />

            <div className="main main-container">
                <div className="main__lead lead">
                    <img src={mainCow} alt="" width={500}/>
                    
                    <div className="lead__title-wrapper">
                        <h1 className='lead__section-title'>Evaluate</h1>
                        <p className="lead__section-subtitle">Расчет показателей потомства на основе информации о предках.</p>

                        <div className="lead__buttons">
                            <a href="/createrequest" className="button button_accent">Попробовать</a>
                            <a href="/howitworks" className="button">Как это работает?</a>

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
};

export default Main;