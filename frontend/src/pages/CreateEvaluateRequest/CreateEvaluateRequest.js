import React from 'react';
import Header from '../../components/Header/Header';
import PageHeading from '../../ui/PageHeading/PageHeading';
import SectionHeading from '../../ui/SectionHeading/SectionHeading';

import infoIcon_blue from "../../imgs/info_blue.svg";
import infoIcon_white from "../../imgs/info.svg";
import questionIcon from "../../imgs/question.svg";

import "./CreateEvaluateRequest.css";
import ButtonAccent from '../../ui/Button/ButtonAccent';
import capitalize from '../../utils/capitalize';
import InfoPopup from '../../ui/InfoPopup/InfoPopup';

const CreateEvaluateRequest = () => {

    const fileInput = React.useRef();
    const filenameParagraph = React.useRef();
    const evaluationNameInput = React.useRef();
    const sectionTitleInfoPopup = React.useRef();
    const filenameInfoPopup = React.useRef();
    const submitStatusBlock = React.useRef();
    const submitStatusMsg = React.useRef();
    const submitButton = React.useRef();

    let [sectionTitleInfoPopupVisible, setSectionTitleInfoPopupVisible] = React.useState(false);
    let [filenameInfoPopupVisible, setFilenameInfoPopupVisible] = React.useState(false);

    function handleSelectFileButtonClick() {
        // console.log(fileInput.current.files[0]);
        fileInput.current.click();
    }

    function handleFileInputChange(e) {
        if (e.target.files && e.target.files.length > 0) {
            filenameParagraph.current.textContent = "Файл: " + e.target.files[0].name;
            evaluationNameInput.current.value = capitalize(e.target.files[0].name.split(".")[0]);
        
        }
    }

    function handleSectionTitleInfoButtonClick() {
        setSectionTitleInfoPopupVisible((prev) => !prev);
    }

    function handleFilenameInfoButtonClick() {
        setFilenameInfoPopupVisible((prev) => !prev);
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        submitButton.current.disabled = true;

        const formData = new FormData();
        formData.append("file", fileInput.current.files[0]);
        formData.append("evaluationName", evaluationNameInput.current.value);

        fetch("http://localhost:3005/createRequest", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(res => {
            console.log(res);
            submitStatusBlock.current.classList.remove("create-request__submit-status_hidden");

            if (res.status === "Success") {
                submitStatusBlock.current.classList.remove("create-request__submit-status_error");
                submitStatusMsg.current.textContent = "Запрос создан";

            } else {
                submitStatusBlock.current.classList.add("create-request__submit-status_error");
                submitStatusMsg.current.textContent = res.msg;

                setTimeout(() => {
                    submitButton.current.disabled = false;
                    
                }, 1000);

            }
        })
    }



    return (
        <>
            <Header />

            <section className="create-request section">
                <PageHeading>Провести расчет</PageHeading>

                <div className="create-request__content">
                    <aside className='section__aside white-container create-request__aside'>
                        <img src={infoIcon_blue} alt="Информация, иконка." />

                        <div className="create-request__aside-texts">
                            <p className="create-request__aside-text">Для проведения расчета показателей потомства необходимо только <b>загрузить файл с данными о предках</b> потомства. </p>
                            <p className="create-request__aside-text">Оплату расчета можно будет произвести после проведения расчета. <a href='/howitworks' className='link'>Подробнее &rarr;</a></p>

                        </div>

                    </aside>

                    <form action="/" className='create-request__form white-container' onSubmit={handleFormSubmit}>
                        <div className="create-request__section-title-wrapper">
                            <SectionHeading>Создание заявки на выполнение расчета</SectionHeading>

                            <img src={questionIcon} alt="Узнать дополнительную информацию, кнопка." className='create-request__icon' onClick={handleSectionTitleInfoButtonClick}/>
                            
                            <InfoPopup style={{right: -310, top: 5}} ref={sectionTitleInfoPopup} visible={sectionTitleInfoPopupVisible}>
                                <p className='info-popup__text_size_L'>Вы создаете заявку — мы настраиваем систему и она производит расчет</p>
                                <p className='info-popup__text_size_S'><a href="/howitworks" className='link'>Узнать, как это работает &rarr;</a></p>
                            </InfoPopup>

                        </div>

                        <div className="create-request__file-input-wrapper">
                            <input type="file" className="create-request__file-input" ref={fileInput} onInput={handleFileInputChange} accept=".xlsx, .csv, .xls" />
                            <ButtonAccent onClick={handleSelectFileButtonClick}>Выбрать файл</ButtonAccent>
                            <p className="create-request__filename" ref={filenameParagraph}></p>

                        </div>

                        <div className="create-request__name-input-wrapper">                                        
                            <div className="input-field">
                                <input type="text" name="evaluateName" id="evaluateName" className="input-field__input" placeholder=" " autoComplete="nope" ref={evaluationNameInput}/>
                                <label htmlFor="evaluateName" className="input-field__label">Название расчета</label>
                            </div>

                            <img src={questionIcon} alt="Узнать дополнительную информацию, кнопка." className='create-request__icon' onClick={handleFilenameInfoButtonClick}/>

                            <InfoPopup style={{right: -310, top: 10}} ref={filenameInfoPopup} visible={filenameInfoPopupVisible}>
                                <p className='info-popup__text_size_L'>Название необходимо чтобы не запутаться в своих расчетах, когда их станет много</p>
                                <p className='info-popup__text_size_S'>Оно будет отображаться в списке ваших расчетов, а также использовано как название для итогового файла.</p>
                            </InfoPopup>

                        </div>

                        <div className="create-request__submit-button-wrapper ">
                            <div className="create-request__submit-status create-request__submit-status_hidden" ref={submitStatusBlock}>
                                <img src={infoIcon_white} alt="" width={16} height={16}/>
                                <p ref={submitStatusMsg}>Файл сохранен</p>
                            </div>
                            
                            <ButtonAccent ref={submitButton} style={{alignSelf: "flex-end"}} className="create-request__submit-button" type="submit">Создать запрос</ButtonAccent>

                        </div>
                    </form>

                </div>
            </section>
        </>
    );
};

export default CreateEvaluateRequest;