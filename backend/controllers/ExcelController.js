import exceljs from "exceljs";
import path from "path";
import fs from "fs";

import { DIRNAME } from "../utils/generals.js";


export async function openExcel(filePath) {

    let ext = path.extname(filePath)
    const workbook = new exceljs.Workbook();

    if (ext === ".csv") {
        return await workbook.csv.readFile(filePath);  // Возвращает лист

    } else if (ext === ".xlsx") {
        let temp = await workbook.xlsx.readFile(filePath);  // Возвращает книгу
        return temp.worksheets[0]  // Возвращает лист

    }

}


export async function getFirstNRowsFromTable(filename) {
    let pathToResultFolder = path.join(DIRNAME, "backend", "files", "uploadedFiles", filename)

    let sheet = await openExcel(pathToResultFolder)

    let res = []

    for (let i = 1; i < 5; i++) {
        res.push(sheet.getRow(i).values.slice(1))
    }

    return res

}


export async function getAllUniqueBullsMarkersFromTable(filename, parentsMarkers) {
    let sheet = await openExcel(path.join(DIRNAME, "backend", "files", "uploadedFiles", filename))
    let sheetData = sheet.getSheetValues()

    let numberOfRows = sheet.getColumn(1).values.length - 1
    let uniqueBullsMarkersFromTable = []
    let tempUniqueBullsNames = []

    parentsMarkers = transformColumnCharsToNumbers(parentsMarkers)

    // Для каждого уровня предков
    for (let parentsLevel = 0; parentsLevel < 3; parentsLevel++) {

        // Для каждой строки в таблице
        for (let rowIndex = 2; rowIndex <= numberOfRows; rowIndex++) {
            let tempRow = sheetData[rowIndex]
            let tempBullDataFromTable

            // Если кличка текущего быка еще не была добавлена во временный массив
            if (!tempUniqueBullsNames.includes(tempRow[parentsMarkers[0][parentsLevel]])) {

                // Добавляю кличку во временный массив
                tempUniqueBullsNames.push(tempRow[parentsMarkers[0][parentsLevel]])

                // Создаю временный объект с его данными из таблицы
                tempBullDataFromTable = {name: tempRow[parentsMarkers[0][parentsLevel]]}

                // Есил есть инфа про семенной код - добавляю о нем инфу
                if (tempRow[parentsMarkers[1][parentsLevel]]) {
                    tempBullDataFromTable.NAAB = tempRow[parentsMarkers[1][parentsLevel]]
                }

                // Есил есть инфа про идентификационный номер - добавляю о нем инфу
                if (tempRow[parentsMarkers[2][parentsLevel]]) {
                    tempBullDataFromTable.ID = tempRow[parentsMarkers[2][parentsLevel]]
                }

                // Есил есть инфа про инвентарный номер - добавляю о нем инфу
                if (tempRow[parentsMarkers[3][parentsLevel]]) {
                    tempBullDataFromTable.inv = tempRow[parentsMarkers[3][parentsLevel]]
                }

                // Добавляю временный объект в общий массив
                uniqueBullsMarkersFromTable.push(tempBullDataFromTable)
            }

        }
        
    }

    return uniqueBullsMarkersFromTable

}


export async function getChildsDataFormTable(filename, parentsMarkers){
    let sheet = await openExcel(path.join(DIRNAME, "backend", "files", "uploadedFiles", filename))
    let sheetData = sheet.getSheetValues()

    
    let numberOfRows = sheet.getColumn(1).values.length - 1
    let uniqueBullsMarkersFromTable = []
    let childsData = {}

    parentsMarkers = transformColumnCharsToNumbers(parentsMarkers)

    

    // Для каждой строки в таблице
    for (let rowIndex = 2; rowIndex <= numberOfRows; rowIndex++) {
        let tempRow = sheetData[rowIndex]

        // Для ключа tempRow[1] (Это кличка или номер потомка) задаю значение пустой массив
        childsData[tempRow[1]] = []

        // Для каждого уровня предков
        for (let parentsLevel = 0; parentsLevel < 3; parentsLevel++) {
            let tempBullDataFromTable

            // Создаю временный объект с его данными из таблицы
            tempBullDataFromTable = {name: tempRow[parentsMarkers[0][parentsLevel]]}

            // Есил есть инфа про семенной код - добавляю о нем инфу
            if (tempRow[parentsMarkers[1][parentsLevel]]) {
                tempBullDataFromTable.NAAB = tempRow[parentsMarkers[1][parentsLevel]]
            }

            // Есил есть инфа про идентификационный номер - добавляю о нем инфу
            if (tempRow[parentsMarkers[2][parentsLevel]]) {
                tempBullDataFromTable.ID = tempRow[parentsMarkers[2][parentsLevel]]
            }

            // Есил есть инфа про инвентарный номер - добавляю о нем инфу
            if (tempRow[parentsMarkers[3][parentsLevel]]) {
                tempBullDataFromTable.inv = tempRow[parentsMarkers[3][parentsLevel]]
            }

            // Добавляю предка в текущего потомка на текущий уровень предков
            childsData[tempRow[1]].push(tempBullDataFromTable)

        }
        
    }

    return childsData

}


export async function getDataFromTable(filename, parentsMarkers, childColumnSymbol) {

    async function getAllUniqueBullsMarkersFromTable(sheetData, parentsMarkers) {
        let numberOfRows = sheet.getColumn(1).values.length - 1
        let uniqueBullsMarkersFromTable = []
        let tempUniqueBullsNames = []
    
        parentsMarkers = transformColumnCharsToNumbers(parentsMarkers)
    
        // Для каждого уровня предков
        for (let parentsLevel = 0; parentsLevel < 3; parentsLevel++) {
    
            // Для каждой строки в таблице
            for (let rowIndex = 2; rowIndex <= numberOfRows; rowIndex++) {
                let tempRow = sheetData[rowIndex]
                let tempBullDataFromTable
    
                // Если кличка текущего быка еще не была добавлена во временный массив
                if (!tempUniqueBullsNames.includes(tempRow[parentsMarkers[0][parentsLevel]])) {
    
                    // Добавляю кличку во временный массив
                    tempUniqueBullsNames.push(tempRow[parentsMarkers[0][parentsLevel]])
    
                    // Создаю временный объект с его данными из таблицы
                    tempBullDataFromTable = {name: tempRow[parentsMarkers[0][parentsLevel]]}
    
                    // Есил есть инфа про семенной код - добавляю о нем инфу
                    if (tempRow[parentsMarkers[1][parentsLevel]]) {
                        tempBullDataFromTable.NAAB = tempRow[parentsMarkers[1][parentsLevel]]
                    }
    
                    // Есил есть инфа про идентификационный номер - добавляю о нем инфу
                    if (tempRow[parentsMarkers[2][parentsLevel]]) {
                        tempBullDataFromTable.ID = tempRow[parentsMarkers[2][parentsLevel]]
                    }
    
                    // Есил есть инфа про инвентарный номер - добавляю о нем инфу
                    if (tempRow[parentsMarkers[3][parentsLevel]]) {
                        tempBullDataFromTable.inv = tempRow[parentsMarkers[3][parentsLevel]]
                    }
    
                    // Добавляю временный объект в общий массив
                    uniqueBullsMarkersFromTable.push(tempBullDataFromTable)
                }
    
            }
            
        }
    
        return uniqueBullsMarkersFromTable
    
    }
    
    
    async function getChildsDataFormTable(sheetData, parentsMarkers){       
        let numberOfRows = sheet.getColumn(1).values.length - 1
        let uniqueBullsMarkersFromTable = []
        let childsData = {}
    
        parentsMarkers = transformColumnCharsToNumbers(parentsMarkers)
    
        
    
        // Для каждой строки в таблице
        for (let rowIndex = 2; rowIndex <= numberOfRows; rowIndex++) {
            let tempRow = sheetData[rowIndex]
    
            // Для ключа tempRow[getColumnNumberByChar(childColumnSymbol) + 1]] (Это кличка или номер потомка) задаю значение пустой массив
            childsData[tempRow[getColumnNumberByChar(childColumnSymbol)]] = []
    
            // Для каждого уровня предков
            for (let parentsLevel = 0; parentsLevel < 3; parentsLevel++) {
                let tempBullDataFromTable
    
                // Создаю временный объект с его данными из таблицы
                tempBullDataFromTable = {name: tempRow[parentsMarkers[0][parentsLevel]]}
    
                // Есил есть инфа про семенной код - добавляю о нем инфу
                if (tempRow[parentsMarkers[1][parentsLevel]]) {
                    tempBullDataFromTable.NAAB = tempRow[parentsMarkers[1][parentsLevel]]
                }
    
                // Есил есть инфа про идентификационный номер - добавляю о нем инфу
                if (tempRow[parentsMarkers[2][parentsLevel]]) {
                    tempBullDataFromTable.ID = tempRow[parentsMarkers[2][parentsLevel]]
                }
    
                // Есил есть инфа про инвентарный номер - добавляю о нем инфу
                if (tempRow[parentsMarkers[3][parentsLevel]]) {
                    tempBullDataFromTable.inv = tempRow[parentsMarkers[3][parentsLevel]]
                }
    
                // Добавляю предка в текущего потомка на текущий уровень предков
                childsData[tempRow[getColumnNumberByChar(childColumnSymbol)]].push(tempBullDataFromTable)
    
            }
            
        }
    
        return childsData
    
    }

    let sheet = await openExcel(path.join(DIRNAME, "backend", "files", "uploadedFiles", filename))
    let sheetData = sheet.getSheetValues()

    let uniqueBullsMarkersFromTable = await getAllUniqueBullsMarkersFromTable(sheetData, parentsMarkers)
    let childDataFromTable = await getChildsDataFormTable(sheetData, parentsMarkers)

    let pathToResultFolder = path.join(DIRNAME, "backend", "files", "resultFiles", path.parse(filename).name)

    if (!fs.existsSync(pathToResultFolder)) {
        fs.mkdirSync(pathToResultFolder)
    }

    setTimeout(() => {
        fs.writeFileSync(
            path.join(pathToResultFolder, "uniqueBullsMarkersFromTable.json"), 
            JSON.stringify(uniqueBullsMarkersFromTable)
        )
    
        fs.writeFileSync(
            path.join(pathToResultFolder, "childDataFromTable.json"), 
            JSON.stringify(childDataFromTable)
        )
        
    }, 1000);


    return {uniqueBullsMarkersFromTable, childDataFromTable}

} 


export function transformColumnCharsToNumbers(obj) {
    // Функция переводит символы колонок, которые ввел пользователь в числа
    // Шаблон входных данных:
    // {
    //     parentsNames: [ 'e', 'g', 't' ],
    //     parentsNAABs: [ 'h', 'j', '' ],
    //     parentsIDs: [ '', '', '' ],
    //     parentsInvs: [ '', '', '' ]
    // }

    return Object.keys(obj).map(key => obj[key].map(el => getColumnNumberByChar(el)))
}


export function getColumnNumberByChar(char) {
    if (!char) return 0
    return char.toUpperCase().charCodeAt(0) - "A".charCodeAt(0) + 1
}


export async function identifyColumns(worksheet) {

    const parentsColumnMarkers = [
        [["Кличка", "O", "О"], ["Кличка", "OM", "ОМ"], ["Кличка", "OMM", "ОММ"]], 
        [["Идентиф", "O", "О"], ["Идентиф", "OM", "ОМ"], ["Идентиф", "OMM", "ОММ"]], 
        [["Инв", "O", "О"], ["Инв", "OM", "ОМ"], ["Инв", "OMM", "ОММ"]]]

    const parentsColumns = []


    // Убираю первый элемент, тк он пустой
    const firstRow = worksheet.getRow(1).values.splice(1)

    // Заполняю массив с номерами колонок с данными о naab, ID и инвентарным номером
    // [[<naab О>, <naab ОМ>, <naab ОММ>], [<ID О>, <ID ОМ>, <ID ОММ>], [<Инвентарный номер О>, <Инвентарный номер ОМ>, <Инвентарный номер ОММ>]]
    for (let i = 0; i < 3; i++) {
        parentsColumns.push([])

        for (let j = 0; j < 3; j++) {

            parentsColumns[i].push(firstRow.findIndex(el => {

                // console.log(el, "INCLUDES", parentsColumnMarkers[i][j][0], "AND", parentsColumnMarkers[i][j][1], "OR", parentsColumnMarkers[i][j][1], "-", el.includes(parentsColumnMarkers[i][j][0]) && (el.includes(parentsColumnMarkers[i][j][1]) || el.includes(parentsColumnMarkers[i][j][2])))
                
                // console.log(parentsColumnMarkers[i][j][0], parentsColumnMarkers[i][j][1], el)
                return el.includes(parentsColumnMarkers[i][j][0]) && (el.includes(parentsColumnMarkers[i][j][1]) || el.includes(parentsColumnMarkers[i][j][2]))
            }))


            // parentsColumns[i].push([])

            
        }
    }

    return parentsColumns

}


export function getAllParentsMarkers(worksheet, columns) {
    let parentsMarkers = []

    // console.log(worksheet.values)

    // for (let i = 1; i < 5; i++) {
    //     let row = worksheet.getRow(i).values

    //     for (let markers of columns) {
    //         for (let k = 0; k < 3; k++) {
    //             if (markers[k] === -1) {
    //                 continue
    //             }

    //             if (row[k]) {
    //                 parentsMarkers.push(row[k])

    //             }
    
    
    //         }
    
    //     }

    // }

    console.log(parentsMarkers)


    // console.log(worksheet.getRow(1).values)
    console.log(columns)
}

