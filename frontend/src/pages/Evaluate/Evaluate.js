import infoIcon from "../../imgs/info.svg";
import doneIcon from "../../imgs/done.svg";
import loadingIcon from "../../imgs/loading.gif";

import React, { useEffect, useRef, useState } from 'react';

import "./Evaluate.css";

import Header from '../../components/Header/Header';
import ColumnPickerTable from "../../components/ColumnPickerTable/ColumnPickerTable";
import ExtraBullsList from "../../components/ExtraBullsList/ExtraBullsList";

import PageHeading from '../../ui/PageHeading/PageHeading.js';
import SectionHeading from "../../ui/SectionHeading/SectionHeading";
import Paragraph from '../../ui/Paragraph/Paragraph.js';
import ButtonAccent from '../../ui/Button/ButtonAccent';
import PreviewTable from "../../components/PreviewTable/PreviewTable";
// import Button from '../../ui/Button/Button.js';

const Evaluate = () => {
    const fileInput = useRef();
    const uploadFileButton = useRef();
    const continueButton = useRef();
    // const childColumnInput = useRef();
    const pickForm = useRef();
    const downloadButton = useRef();
    // const uploadFileButton = useRef();


    const classesByStatus = {
        "Success": "status-wrapper_success",
        "Error": "status-wrapper__error",
        "Loading": "",
    }

    const iconsByStatus = {
        "Success": doneIcon,
        "Error": infoIcon,
        "Loading": loadingIcon,
    }


    let [uploadFileStatus, setUploadFileStatus] = useState({visible: false, status: "", msg: ""});
    let [secondStepStatus, setSecondStepStatus] = useState({visible: false, status: "", msg: ""});
    let [thirdStepStatus, setThirdStepStatus] = useState({visible: false, status: "", msg: ""});
    // let [fourthStepStatus, setFourthStepStatus] = useState({visible: false, status: "", msg: ""});

    let [secondStepVisible, setSecondStepVisible] = useState(false)
    let [thirdStepVisible, setThirdStepVisible] = useState(false)
    let [fourthStepVisible, setFourthStepVisible] = useState(false)

    let [childColumnInputValue, setChildColumnInputValue] = useState("A")
    // let [childColumnInputDisabled, setChildColumnInputDisabled] = useState(false)

    let [tableData, setTableData] = useState([])
    let [savedFilename, setSavedFilename] = useState("")
    let [extraMatchesBullsMarkers, setExtraMatchesBullsMarkers] = useState([])
    let [thirdStepText, setThirdStepText] = useState([])

    // Слушатели для проверки правильности данных для настройки расчета
    // Для расчета нужна инфа о колонке клички потомка, кличках предков и хотя бы один их идентификатор
    useEffect(() => {
        continueButton.current.setAttribute("disabled", true)

        let parentColumnsInputs = [...document.querySelectorAll(".table__input"), document.querySelector(".child-column-picker__input")]
    
        parentColumnsInputs.forEach(parentColumnsInput => {
            parentColumnsInput.addEventListener("input", e => {
                if (parentColumnsInputs.slice(0, 3).every(input => input.value) && parentColumnsInputs[12].value) {
                    if (
                        parentColumnsInputs.slice(3, 6).every(input => input.value) ||
                        parentColumnsInputs.slice(6, 9).every(input => input.value) ||
                        parentColumnsInputs.slice(9).every(input => input.value)
                    ) {
                        continueButton.current.removeAttribute("disabled")

                    } else {
                        continueButton.current.setAttribute("disabled", true)

                    }
                } else {
                    continueButton.current.setAttribute("disabled", true)

                }
            })
        })
    }, [])


    function uploadFileButtonClick() {
        fileInput.current.click();

    }

    function uploadFileInputChange() {
        if (!fileInput.current.files.length) {
            console.log("Файл не выбран");
            return;
        }

        
        let formData = new FormData()
        formData.append("file", fileInput.current.files[0])
        formData.append("filename", fileInput.current.files[0].name)
        

        setUploadFileStatus({visible: true, status: "Loading", msg: "Загрузка файла"})
        uploadFileButton.current.setAttribute("disabled", true)
        

        fetch("http://localhost:3005/uploadFile", {
            method: "POST",
            body: formData,
            // headers: {
            //     "Content-Type": "multipart/form-data"
            // }
        })
        .then(data => data.json())
        .then(data => {
            if (data.status === "Success") {
                // Сохраняю название сохраненного на сервер файла
                setSavedFilename(data.savedFilename)

                // Сохраняю данные первых строк загруженной таблицы
                setTableData(data.tableData)

                // Показываю следующий этап с задержкой
                setTimeout(() => {
                    setSecondStepVisible(true)
                    
                }, 500);
                
            } else {
                uploadFileButton.current.removeAttribute("disabled")
                
            }

            setUploadFileStatus({visible: true, status: data.status, msg: data.msg})
        })

    }

    function continueButtonClick({target}) {
        setSecondStepStatus({visible: true, status: "Loading", msg: "Поиск быков в БД"})
        target.setAttribute("disabled", true)

        let objectData = {}
        objectData.filename = savedFilename
        objectData.childColumnSymbol = childColumnInputValue
        // objectData.filename = "2023_02_13_16_07_33 В комитет.xlsx"

        let inputs = [...document.querySelectorAll(".table__input")]

        objectData.parentsMarkers = {}
        objectData.parentsMarkers.parentsNames = inputs.slice(0, 3).map(cell => cell.value)
        objectData.parentsMarkers.parentsNAABs = inputs.slice(3, 6).map(cell => cell.value)
        objectData.parentsMarkers.parentsIDs = inputs.slice(6, 9).map(cell => cell.value)
        objectData.parentsMarkers.parentsInvs = inputs.slice(9, 12).map(cell => cell.value)

        console.log(objectData)

        fetch("http://localhost:3005/findBullsInFile", {
            method: "POST",
            body: JSON.stringify(objectData),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(data => data.json())
        .then(data => {
            if (data.status === "Success") {

                setExtraMatchesBullsMarkers(data.extraMatchesBullsMarkers)

                if (data.extraMatchesBullsMarkers?.length && data.undefinedBullsMarkers.length) {
                    setThirdStepText({
                        title: "Уточнение данных",
                        paragraph: `Некоторых предков невозможно однозначно идентифицировать по имеющимся данным. Поэтому ниже для каждого такого предка нужно выбрать верного, найдя его по кличке. Также в базе не было найдено ${data.undefinedBullsMarkers.length} быков: ${data.undefinedBullsMarkers.map(el => el.name).join(", ")}.`
                    })

                } else if (data.extraMatchesBullsMarkers?.length) {
                    setThirdStepText({
                        title: "Уточнение данных",
                        paragraph: `Некоторых предков невозможно однозначно идентифицировать по имеющимся данным. Поэтому ниже для каждого такого предка нужно выбрать верного, найдя его по кличке.`
                    })

                } else if (data.undefinedBullsMarkers?.length) {
                    setThirdStepText({
                        title: "Не все данные найдены",
                        paragraph: `В базе данных не было найдено ${data.undefinedBullsMarkers.length} быков: ${data.undefinedBullsMarkers.map(el => el.name).join(", ")}.`
                    })

                } else {
                    setThirdStepText({
                        title: "Все быки найдены в базе",
                        paragraph: `Данные всех быков найдены. Можно переходить к расчету показателей потомства.`
                    })

                }


                // Показываю следующий этап с задержкой
                setTimeout(() => {
                    setThirdStepVisible(true)
                    
                }, 500);


            } else {
                target.removeAttribute("disabled")
            }


            console.log(data)

            setSecondStepStatus({visible: true, status: data.status, msg: data.msg})

        })

        // Отправить запрос на поиск всех быков в заданных столбцах
        // Вернуть информацию о том, были ли данные всех быков, или данные каких-то быков нужно учточнить
    }

    function evaluateButtonClick(e) {
        setThirdStepStatus({visible: true, status: "Loading", msg: "Происходит расчет"})
        e.target.setAttribute("disabled", true)

        // Получаю данные всех инпутов
        let fd = new FormData(pickForm.current)
        let temp = [...fd.entries()] // Переделываю их в массив
        
        // Создаю объект с данными инпутов
        let formData = {}
        temp.forEach(inputData => {
            formData[inputData[0]] = inputData[1].split("__")[1]
        })

        formData.filename = savedFilename
        console.log(formData)

        fetch("http://localhost:3005/evaluate", {
            method: "POST",
            body: JSON.stringify(formData),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(data => data.json())
        .then(data => {

            console.log(data)

            setThirdStepStatus({visible: true, status: data.status, msg: data.msg})

            if (data.status === "Success") {
                // Задаю href для кнопки
                downloadButton.current.setAttribute("href", data.linkToFile)
    
                // Показываю следующий этап с задержкой
                setTimeout(() => {
                    setFourthStepVisible(true)
                    
                }, 500);

            } else {
                e.target.removeAttribute("disabled")

            }

        })


    }

    function downloadButtonClick(e) {
        e.target.setAttribute("disabled", true)

        setTimeout(() => {
            e.target.removeAttribute("disabled")
            
        }, 1000);
    }


    return (
        <>
            <Header />
            <section className="evaluate-container">
                <div className="text-block">
                    <PageHeading>Расчет показателей потомства</PageHeading>
                    <SectionHeading style={{marginBottom: 10}}>1. Загрузка файла</SectionHeading>
                    <Paragraph style={{maxWidth: 600}}>Ниже можно загрузить таблицу с данными предков и расчитать прогнозируемые показатели потомства</Paragraph>

                </div>
                <input type="file" name="file" id="file" hidden ref={fileInput} onChange={uploadFileInputChange}/>
                <div className="button-wrapper">
                    <ButtonAccent onClick={uploadFileButtonClick} ref={uploadFileButton} >Загрузить файл</ButtonAccent>
                    <div className={`status-wrapper ${classesByStatus[uploadFileStatus.status]} ${uploadFileStatus.visible ? "" : "hidden"}`} >
                        <img src={uploadFileStatus.status === "Success" ? doneIcon : infoIcon} alt="" width={20} height={20} />
                        <p>{uploadFileStatus.msg}</p>
                    </div>
                </div>
            </section>

            <section className={["evaluate-container", "animated", secondStepVisible ? "" : "hidden"].join(" ")}>
                <div className="text-block">
                    <SectionHeading style={{marginBottom: 10}}>2. Настройка расчета</SectionHeading>
                    <Paragraph style={{maxWidth: 800}}>Теперь необходимо указать, в каких колонках таблицы расположены данные о предках, такие как кличка, семенной код, идентификационный или инвентарный номер.</Paragraph>
                    <Paragraph style={{maxWidth: 700}}>При отсутствии каки-либо показателей поля нужно оставить пустыми.</Paragraph>
                    <Paragraph style={{maxWidth: 700}}>Для удобства ниже находятся первые строки загруженной таблицы.</Paragraph>

                    <PreviewTable tableData={tableData} style={{marginTop: 50}} />

                    <div className="child-column-picker" style={{marginTop: 50}} >
                        <div className="child-column-picker__title">Столбец с кличкой или инвентарным номером потомка</div>
                        <input 
                            type="text" 
                            name="child-column" 
                            className="child-column-picker__input" 
                            value={childColumnInputValue} 
                            onChange={(e) => setChildColumnInputValue(e.target.value)} 
                        />
                    </div>
                    
                    <ColumnPickerTable style={{marginTop: 50}}/>
                    
                </div>

                <div className="button-wrapper">
                    <ButtonAccent onClick={continueButtonClick} ref={continueButton}>Продолжить</ButtonAccent>

                    <div className={`status-wrapper ${classesByStatus[secondStepStatus.status]} ${secondStepStatus.visible ? "" : "hidden"}`} >
                        <img src={iconsByStatus[secondStepStatus.status]} alt="" width={20} height={20} />
                        <p>{secondStepStatus.msg}</p>
                    </div>
                </div>

            </section>

            <section className={["evaluate-container", "animated", thirdStepVisible ? "" : "hidden"].join(" ")}>
                <div className="text-block">
                    <SectionHeading style={{marginBottom: 10}}>3. {thirdStepText.title}</SectionHeading>
                    <Paragraph style={{maxWidth: 800}}>{thirdStepText.paragraph}</Paragraph>
                    
                    <ExtraBullsList extraMatchesBullsMarkers={extraMatchesBullsMarkers} ref={pickForm}/>
                    
                </div>

                <div className="button-wrapper">
                    <ButtonAccent onClick={evaluateButtonClick}>Продолжить</ButtonAccent>

                    <div className={`status-wrapper ${classesByStatus[thirdStepStatus.status]} ${thirdStepStatus.visible ? "" : "hidden"}`} >
                        <img src={iconsByStatus[thirdStepStatus.status]} alt="" width={20} height={20} />
                        <p>{thirdStepStatus.msg}</p>
                    </div>
                </div>

            </section>

            <section className={["evaluate-container", "animated", fourthStepVisible ? "" : "hidden"].join(" ")}>
                <div className="text-block">
                    <SectionHeading style={{marginBottom: 10}}>4. Файл готов к скачиванию</SectionHeading>
                    <Paragraph style={{maxWidth: 800}}>Показатели потомства расчитаны, и теперь их можно скачать.</Paragraph>
                    
                </div>

                <div className="button-wrapper">

                    <a href="#temp" download className='button button_accent' onClick={downloadButtonClick} ref={downloadButton}>
                        Скачать
                    </a>
                </div>

            </section>
        </>
    );
};

export default Evaluate;