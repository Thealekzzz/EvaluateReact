import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import path from "path";
import bodyParser from "body-parser";
import fs from "fs";

import { getDataFromTable, getFirstNRowsFromTable } from "./controllers/ExcelController.js";
import { evaluate, fullEvaluate, getUniqueBullsDataFromDB } from "./controllers/EvaluateController.js"; 
import { DIRNAME } from "./utils/generals.js";

import "./utils/dateExtender.js";



// Получение всех данных из файла .env
dotenv.config();



// Создание express сервера
let app = express();

// Создаю multer хранилище для загрузки файлов
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./files/uploadedFiles");
    },
    filename: (req, file, cb) => {
        // Изначально имя файла приходит на английском языке, поэтому тут оно переводится на русский
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

        // Сохранение имени файла в объект req
        req.translatedFilename = file.originalname;
        req.savedFilename = new Date().getStrDate() + " " + file.originalname;

        // Указание имени файла
        cb(null, req.savedFilename);
    }
});



// Переменные 
let PORT = process.env.SERVER_PORT || 3005;
let upload = multer({storage: storage});



// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));
app.use((req, res, next) => {
    // Middleware для показа пришедшего запроса
    console.log("Запрос ", req.method, req.url);
    next();
});

// Если приходит запрос на /result, то запрос будет выполнятся из папки resultFiles
app.use("/result", express.static(path.join(DIRNAME, "backend", "files", "resultFiles")));



// Обработчики
app.post("/createRequest", upload.single("file"), async (req, res) => {
    console.log(req.body);
    try {
        res.status(200).json({
            status: "Success", 
            msg: "Файл сохранен на сервере",
        });
    
    } catch (error) {
        console.log("ошибка сохранения файла", error);
        res.status(500).json({status: "Error", msg: "Ошибка сохранения файла", error});

    }

})






// Несуществующий путь api 
app.post("/:link", (req, res) => {
    res.json({status: "Error", msg: "Несуществующий api route"});
})


app.post("/", (req, res) => {
    res.json({status: "Error", msg: "Несуществующий api route"});
})



// Запуск сервера
app.listen(PORT, (e) => {
    if (e) {
        return console.log(e);
    }

    console.log(`Сервер запущен на порту ${PORT}`);
    // console.log(`Сервер запущен на порту ${}`)
})