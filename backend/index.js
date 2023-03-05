import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import multer from "multer";
import path from "path"
import bodyParser from "body-parser"
import fs from "fs"

import { getDataFromTable, getFirstNRowsFromTable } from "./controllers/ExcelController.js"
import { evaluate, fullEvaluate, getUniqueBullsDataFromDB } from "./controllers/EvaluateController.js"; 
import { DIRNAME } from "./utils/generals.js";

import "./utils/dateExtender.js"


// Получение всех данных из файла .env
dotenv.config()


// Создание express сервера
let app = express();

// Создаю multer хранилище для загрузки файлов
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./files/uploadedFiles")
    },
    filename: (req, file, cb) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')

        req.translatedFilename = file.originalname
        req.savedFilename = new Date().getStrDate() + " " + file.originalname

        cb(null, new Date().getStrDate() + " " + file.originalname)
    }
})

// Переменные 
let PORT = process.env.SERVER_PORT || 3005
let upload = multer({storage: storage})

// Middlewares
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log("Запрос ", req.method, req.url);
    next();
})
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));

app.use("/result", express.static(path.join(DIRNAME, "backend", "files", "resultFiles")))


// Обработчики
app.post("/uploadFile", upload.single("file"), async (req, res) => {
    try {


        res.status(200).json({
            status: "Success", 
            msg: "Файл сохранен на сервере", 
            savedFilename: req.savedFilename, 
            tableData: await getFirstNRowsFromTable(req.savedFilename)
        })
    
    } catch (error) {
        console.log("ошибка сохранения файла", error)
        res.status(500).json({status: "Error", msg: "Ошибка сохранения файла", error})

    }

})

app.post("/findBullsInFile", async (req, res) => {
    try {
        console.log("Body:", req.body)


        // Запускаю функцию, которая парсит из таблицы данные уникальных предков и данные потомков и их предков
        // Функция возвращает оба массива, поэтому тут я их получаю
        let { uniqueBullsMarkersFromTable } = await getDataFromTable(req.body.filename, req.body.parentsMarkers, req.body.childColumnSymbol)


        // Получаю данные быков из базы данных
        let [uniqueBullsDataFromDB, undefinedBullsMarkers, extraMatchesBullsMarkers] = await getUniqueBullsDataFromDB(
            uniqueBullsMarkersFromTable, 
            path.join(DIRNAME, "backend", "files", "resultFiles", path.parse(req.body.filename).name)
        )


        res.status(200).json({
            status: "Success", 
            msg: "Запрос к БД успешно завершен", 
            extraMatchesBullsMarkers, 
            undefinedBullsMarkers
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({status: "Error", msg: "Ошибка запроса к БД", error})

    }

})

app.post("/testSecondStep", async (req, res) => {
    try {

        let pathToResultFolder = path.join(
            DIRNAME, 
            "backend", 
            "files", 
            "resultFiles", 
            path.parse(req.body.filename).name
        )

        let extraMatchesBullsMarkers = JSON.parse(fs.readFileSync(path.join(
            pathToResultFolder, 
            "extraMatchesBullsMarkers.json"
        )))

        

        let undefinedBullsMarkers = JSON.parse(fs.readFileSync(path.join(
            pathToResultFolder, 
            "undefinedBullsMarkers.json"
        )))



        res.status(200).json({
            status: "Success", 
            msg: "Запрос к БД успешно завершен", 
            extraMatchesBullsMarkers, 
            undefinedBullsMarkers
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({status: "Error", msg: "Ошибка запроса к БД", error})

    }
})

app.post("/evaluate", async (req, res) => {
    try {

        let resultFilename = path.parse(req.body.filename).name + " evaluated" + path.parse(req.body.filename).ext
        let pathToResultFolder = path.join(
            DIRNAME, 
            "backend", 
            "files", 
            "resultFiles", 
            path.parse(req.body.filename).name
        )


        // Открыть файл с данными extraMatchesBullsMarkers и uniqueBullsDataFromDB
        // Пройтись по всем быкам из uniqueBullsDataFromDB и если у него параметр status === "extra" и для его name есть данные в req.body - то 
        // добавить в этот файл DBdata данные из файла extraMatchesBullsMarkers по его имени из свойства matches по номеру req.body["имя"]

        // Открываю файлы с данными из таблицы и БД в JSON формате
        let extraMatchesBullsMarkers = JSON.parse(fs.readFileSync(path.join(
            pathToResultFolder, 
            "extraMatchesBullsMarkers.json"
        )))
        
        let uniqueBullsDataFromDB = JSON.parse(fs.readFileSync(path.join(
            pathToResultFolder, 
            "uniqueBullsDataFromDB.json"
        )))
        
        let undefinedBullsMarkers = JSON.parse(fs.readFileSync(path.join(
            pathToResultFolder, 
            "undefinedBullsMarkers.json"
        )))


        // Заменяю инфу о быках, данные о которых пользователь указал на втором шаге
        uniqueBullsDataFromDB.forEach(bullData => {

            // Нахожу в extraMatchesBullsMarkers быка с именем bullData.name
            let extraBullDataFromDB = extraMatchesBullsMarkers.find(bull => bull.name === bullData.name)


            
            if (bullData.status === "Extra" && req.body[bullData.name] && extraBullDataFromDB.matches.length) {
                // console.log(bullData.name)

                bullData.DBdata = extraBullDataFromDB.matches[req.body[bullData.name]]
                bullData.status = "Chosen"

            }
        })


        fs.writeFileSync(path.join(pathToResultFolder, "uniqueBullsDataFromDB.json"), JSON.stringify(uniqueBullsDataFromDB))

        await fullEvaluate(pathToResultFolder, resultFilename)

        res.status(200).json({
            status: "Success", 
            msg: "Расчет произведен", 
            linkToFile: `http://localhost:${PORT}/` + path.join("result", path.parse(req.body.filename).name, resultFilename)
        })
    
    } catch (error) {
        console.log(error)
        res.status(500).json({status: "Error", msg: "Ошибка расчета"})

    }
})

app.post("/:link", (req, res) => {
    res.json({status: "Error", msg: "Несуществующий api route"})
})


// Запуск сервера
app.listen(PORT, (e) => {
    if (e) {
        return console.log(e)
    }

    console.log(`Сервер запущен на порту ${PORT}`)
    // console.log(`Сервер запущен на порту ${}`)
})