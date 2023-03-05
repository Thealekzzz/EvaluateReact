import { connectToDB, makeRequest } from "./DBController.js";
// import { getColumnNumberByChar } from "./proccessExcel.js"

import exceljs from "exceljs"
import fs from "fs"
import path from "path"

import { DIRNAME } from "../utils/generals.js";

function trimID(ID) {
    if (!ID) return ""

    ID = String(ID)

    // Ищу первый цифровой символ
    let counter = 0
    while (isNaN(+ID[counter]) || +ID[counter] === 0) {
        counter++
    }

    return ID.slice(counter)
}

function trimNAAB(NAAB) {
    if (!NAAB) return ""
    
    NAAB = String(NAAB)

    // Ищу первый нецифровой символ
    let counter = 0
    while (!isNaN(+NAAB[counter])) {
        counter++
    }

    // Ищу первый цифровой символ
    while (isNaN(+NAAB[counter]) || +NAAB[counter] === 0) {
        counter++
    }

    return NAAB.slice(counter)
}

function getUniqueParents(parentsIDs) {
    // Функция возвращает данные всех уникальных предков из parentsIDs
    // parentsIDs: [{name:, NAAB:, ID:, inv:}...]

    let tempParentsIDs = []
    let uniqueParentsIDs = []
    
    for (let ancestorLevelRow of parentsIDs) {
        for (let parent of ancestorLevelRow) {
            if (!tempParentsIDs.includes(parent.name)) {
                tempParentsIDs.push(parent.name)
                uniqueParentsIDs.push(parent)
    
            }
        }
    }

    return uniqueParentsIDs

}

function createQuery(uniqueParentsIDs) {
    // Функция создает SQL запрос сразу для всех быков из uniqueParentsIDs с учетом имеющихся там данных
    // uniqueParentsIDs: [{name:, NAAB:, ID:, inv:}...]
    
    let DBName = "AltaGenDecNew";
    let query = `SELECT DISTINCT * FROM \`${DBName}\` WHERE \`Full Name\` <> "" AND (`
    // let t = performance.now()

    // console.log(uniqueParentsIDs.length)
    
    for (let i = 0; i < uniqueParentsIDs.length; i++) {

        // console.log(i, uniqueParentsIDs[i])
    
        if (uniqueParentsIDs[i].NAAB && uniqueParentsIDs[i].ID && typeof uniqueParentsIDs[i].NAAB === "string") {
            query += `(\`NAAB Code\` LIKE '%${trimNAAB(uniqueParentsIDs[i].NAAB)}' AND \`InterRegNumber\` LIKE '%${trimID(uniqueParentsIDs[i].ID)}%')`
        
        } else if (uniqueParentsIDs[i].NAAB && typeof uniqueParentsIDs[i].NAAB === "string") {
            query += `(\`NAAB Code\` LIKE '%${trimNAAB(uniqueParentsIDs[i].NAAB)}%')`
    
        } else if (uniqueParentsIDs[i].ID) {
            query += `(\`InterRegNumber\` LIKE '%${trimID(uniqueParentsIDs[i].ID)}%')`
    
        } else if (uniqueParentsIDs[i].inv) {
            query += `(\`NAAB Code\` LIKE '%${uniqueParentsIDs[i].inv}%' OR \`InterRegNumber\` LIKE '%${uniqueParentsIDs[i].inv}%')`
    
        } else {
            continue
        }
    
        if (i !== uniqueParentsIDs.length - 1) {
            query += " OR "
        }
    }

    if (query.endsWith(" OR ")) {
        query = query.slice(0, query.length - 4)
    }

    
    query += ")" 

    // console.log(query)
    // console.log("Сортировка за", performance.now() - t)
    return query
}


export async function getUniqueBullsDataFromDB(uniqueParentsIDs, pathToResultFolder) {
    // Массив ненайденных предков
    let undefinedParentsIDs = []

    // Массив предков, для которых найдено больше одной уникальной записи
    let extraParentsIDs = []

    // Создание запроса к БД со всеми животными
    let query = createQuery(uniqueParentsIDs)


    // Получение данных из БД
    let conn = connectToDB()
    let recievedData = await makeRequest(conn, query)
    conn.end((err) => {
        if (err) {
            return "Ошбика закрытия БД" + console.log(err)
        }

        console.log("БД закрыта")

    })
    
    // Записываю все полученные данные в файл
    // fs.writeFileSync(path.join(pathToResultFolder, "AllDataFromDB.json"), JSON.stringify(recievedData))

    // let recievedData = JSON.parse(fs.readFileSync(path.join(dirname, "test", "result.json")))

    // console.log(uniqueParentsIDs)

    // Из полученных данных нахожу подходящие данные для каждого уникального быка
    for (let i = 0; i < uniqueParentsIDs.length; i++) {
        let tempSuitable = []

        if (uniqueParentsIDs[i].NAAB && uniqueParentsIDs[i].ID && typeof uniqueParentsIDs[i].NAAB === "string") {
            tempSuitable = recievedData.filter(parentData => parentData["NAAB Code"].includes(trimNAAB(uniqueParentsIDs[i].NAAB)) && parentData["InterRegNumber"].includes(trimID(uniqueParentsIDs[i].ID)))

        } else if (uniqueParentsIDs[i].NAAB && typeof uniqueParentsIDs[i].NAAB === "string") {
            tempSuitable = recievedData.filter(parentData => parentData["NAAB Code"].includes(trimNAAB(uniqueParentsIDs[i].NAAB)))
            
        } else if (uniqueParentsIDs[i].ID) {
            tempSuitable = recievedData.filter(parentData => parentData["InterRegNumber"].includes(trimID(uniqueParentsIDs[i].ID)))

        } else if (uniqueParentsIDs[i].inv) {
            tempSuitable = recievedData.filter(parentData => String(parentData["NAAB Code"]).includes(String(uniqueParentsIDs[i].inv)) || String(parentData["InterRegNumber"]).includes(String(uniqueParentsIDs[i].inv)))
        
        } else {
            // Данных про быка вообще нет
            uniqueParentsIDs[i].status = "NF"

        }
        
        // console.log('String(parentData["inv"])', String(recievedData[0]["inv"]), String(uniqueParentsIDs[i].NAAB))
        // console.log(uniqueParentsIDs[i].name, uniqueParentsIDs[i].NAAB, uniqueParentsIDs[i].ID, uniqueParentsIDs[i].inv, tempSuitable.length)

        if (tempSuitable.length > 1) {
            if (tempSuitable.every(bullData => bullData.Name === tempSuitable[0].Name)) {
                // Все данные одинаковые

                // Добавляю только одного
                uniqueParentsIDs[i].DBdata = tempSuitable[0]
                uniqueParentsIDs[i].status = "Unique"

            } else {
                // Все данные разные
                uniqueParentsIDs[i].status = "Extra"
                extraParentsIDs.push({...uniqueParentsIDs[i], matches: tempSuitable})
        
            }
        } else if (tempSuitable.length === 1) {
            // Найден только 1 был

            // Добавляю только одного
            uniqueParentsIDs[i].DBdata = tempSuitable[0]
            uniqueParentsIDs[i].status = "Unique"
        
        } else {
            // Не найдено ни одного быка
            uniqueParentsIDs[i].status = "NF"
            undefinedParentsIDs.push(uniqueParentsIDs[i])

        }

    }

    // Сортировка быков по короткой кличке 
    let sortedextraParentsIDs = extraParentsIDs.map(bullData => {
        bullData.matches.sort((a,b) => (a.Name > b.Name) ? 1 : ((b.Name > a.Name) ? -1 : 0));
        return bullData
    })

    setTimeout(() => {
        fs.writeFileSync(path.join(pathToResultFolder, "uniqueBullsDataFromDB.json"), JSON.stringify(uniqueParentsIDs))
        fs.writeFileSync(path.join(pathToResultFolder, "undefinedBullsMarkers.json"), JSON.stringify(undefinedParentsIDs))
        fs.writeFileSync(path.join(pathToResultFolder, "extraMatchesBullsMarkers.json"), JSON.stringify(sortedextraParentsIDs))
        
    }, 1000);

        


    return [uniqueParentsIDs, undefinedParentsIDs, extraParentsIDs]
}


export async function evaluate(sheet, parentsColumnsNumbers, pathToResultFolder) {

    // let DBName = "AltaGenDecNew";
    // let filename = "ЭМБРИОНЫ КОРОВЫ 2023.01.xlsx"                     // Название файла
    // let filename = "Быки от первотелок 10.10.22.xlsx"           // Название файла
    // let parentsNAABColumnSymbol = ["", "", ""]               // Буквы столбцов с семенным кодом предков
    // let parentsIDColumnSymbol = ["F", "I", "L"]                 // Буквы столбцов с ID предков
    // let parentsinvColumnSymbol = ["D", "G", "K"]                   // Буквы столбцов с инвентарным номером предков
    // let parentsNameColumnSymbol = ["E", "H", "J"]               // Буквы столбцов с кличкой предков


    // const dirname = url.fileURLToPath(new URL('.', import.meta.url));
    let childinvNumbers = sheet.getColumn("A").values.slice(2)



    // const pathToDataFolder = "../data"
    // const pathToDataFile = path.join(dirname, pathToDataFolder, filename)
    // const parentsColumnsNumbers = [parentsNAABColumnSymbol, parentsIDColumnSymbol, parentsinvColumnSymbol, parentsNameColumnSymbol]
    // const conn = connectToDB()
    


    // let promices = []
    let parentsIDs = [[], [], []]           // Массив объектами {имя, идентификатор} с разделением на степень родства
    // let parentsData = {}                    // Объект для хранения данных всех быков (независимо от степени родства)
    // let notFound = []
    // let parentsWithManyMathcesInDB = []     // Массив с быками, для которых найдено много уникальных строк в БД  
    // let sheet = await openExcel(pathToDataFile)
    
    // let requestsCount = 0
    // let lastResponseTime                    // Для хранения времени прихода последнего ответа БД (для подсчета оставшегося времени)
    // let averageTimeToResponse = 500         // Для хранения среднего времени ответа БД


    // Заменяю все символы на числа
    for (let i = 0; i < 4; i++) {
        for (let k = 0; k < 3; k++) {
            // parentsColumnsNumbers[i][k] = getColumnNumberByChar(parentsColumnsNumbers[i][k])

        }
    }


    // Получаю все данные быков из таблицы
    // Прохожу по всем строкам
    for (let rowIndex = 2; rowIndex <= sheet.actualRowCount; rowIndex++) {
        // Прохожу по поколениям предков
        for (let parentLevel = 0; parentLevel < 3; parentLevel++) {
            
            parentsIDs[parentLevel].push({
                name: sheet.getRow(rowIndex).values[parentsColumnsNumbers[3][parentLevel]], 
                NAAB: trimNAAB(sheet.getRow(rowIndex).values[parentsColumnsNumbers[0][parentLevel]]),
                ID: trimID(sheet.getRow(rowIndex).values[parentsColumnsNumbers[1][parentLevel]]),
                inv: sheet.getRow(rowIndex).values[parentsColumnsNumbers[2][parentLevel]] || ""
            })

        }
    }


    let childsData = []

    // Создаю массив с объектами родословной потомков
    // Прохожу по всем строкам
    for (let i = 0; i <= sheet.actualRowCount - 2; i++) {
        childsData.push({invNumber: childinvNumbers[i], parentsData:[parentsIDs[0][i], parentsIDs[1][i], parentsIDs[2][i]]})

    }

    fs.writeFileSync(path.join(pathToResultFolder, "childsData.json"), JSON.stringify(childsData))


    let uniqueParentsIDs = getUniqueParents(parentsIDs)

    // console.table(uniqueParentsIDs)

    let [parentsData] = await getUniqueBullsDataFromDB(uniqueParentsIDs, pathToResultFolder)
        

    return [pathToResultFolder, parentsData]
        
        
    // Функция записала json файлы, но расчет пока не проводила
    
}


export async function fullEvaluate(pathToResultFolder, finalFilename) {

    let predictedData = []                  // Массив для хранения рассчитанных данных бычков / тёлок
    
    
    const digitalCharacheristics = ['TPI', 'NM$', 'CM$', 'FM$', 'GM$', 'Milk', 'Protein', 'Prot%', 'Fat', 'Fat %', 'CFP', 'FE', 'Feed Saved', 'Prel', 'PL', 'C-LIV', 'H-LIV', 'DPR', 'SCS', 'SCE', 'SCE Rel', 'SCE Obs', 'DCE', 'SSB', 'DSB', 'CCR', 'HCR', 'EFC', 'GL', 'MAST', 'KET', 'RP', 'MET', 'DA', 'MF', 'DWP$', 'WT$', 'CW$', 'PTAT', 'UDC', 'FLC', 'BWC', 'DC', 'TRel', 'Stature', 'Strength', 'Body Depth', 'Dairy form', 'Rump Angle', 'Thurl Width', 'RLSV', 'RLRV', 'Foot Angle', 'FLS', 'F. Udder Att.', 'R Udder Height', 'Rear Udder Width', 'Udder Cleft', 'Udder Depth', 'FTP', 'RTP', 'Teat Length', 'RHA', 'EFI']
    const outCharacteristics = ['NAAB Code', 'InterRegNumber', 'Full Name', 'TPI', 'Milk', 'NM$', 'CM$', 'FM$', 'GM$', 'Protein', 'Prot%', 'Fat', 'Fat %', 'CFP', 'FE', 'Feed Saved', 'Prel', 'D / H', 'PL', 'C-LIV', 'H-LIV', 'DPR', 'SCS', 'SCE', 'SCE Rel', 'SCE Obs', 'DCE', 'SSB', 'DSB', 'CCR', 'HCR', 'EFC', 'GL', 'MAST', 'KET', 'RP', 'MET', 'DA', 'MF', 'MS', 'DWP$', 'WT$', 'CW$', 'PTAT', 'UDC', 'FLC', 'BWC', 'DC', 'TRel', 'D / H2', 'Stature', 'Strength', 'Body Depth', 'Dairy form', 'Rump Angle', 'Thurl Width', 'RLSV', 'RLRV', 'Foot Angle', 'FLS', 'F. Udder Att.', 'R Udder Height', 'Rear Udder Width', 'Udder Cleft', 'Udder Depth', 'FTP', 'RTP', 'RTP SV', 'Teat Length', 'Pedigree', 'aAa', 'DMS', 'Kappa-Casein', 'Beta-Casein', 'BBR', 'B-LACT', 'Genetic Codes', 'Haplotypes', 'RHA', 'EFI', 'Birth Date', 'Proof', 'ADV', 'GS', 'FS', 'CP511', 'EDGE', 'CP',  '511']
    const digitalIntegerCharacteristics = ["TPI", "Milk"]


    // Инфа о потомках и их предках
    let childsData = JSON.parse(fs.readFileSync(path.join(pathToResultFolder, "childDataFromTable.json")))

    // Инфа об уникальных быках с данными из БД
    let parentsData = JSON.parse(fs.readFileSync(path.join(pathToResultFolder, "uniqueBullsDataFromDB.json")))


    let columnWidths = [17, 9, 13, 12, 22, 34]

    let childNames = Object.keys(childsData)
    let childsNumber = childNames.length

    
    // Для каждой строки в таблице получаю данные предков и прогнозирую характеристики
    for (let i = 0; i < childsNumber; i++) {    
        let parentData1 = parentsData.find(parentData => parentData.name === childsData[childNames[i]][0].name)
        let parentData2 = parentsData.find(parentData => parentData.name === childsData[childNames[i]][1].name)
        let parentData3 = parentsData.find(parentData => parentData.name === childsData[childNames[i]][2].name)

        
        let predictedTempData = {}

        
        predictedTempData["inv"] = childNames[i]
        
        // Для каждой характеристики расчитывается прогноз для потомка
        for (let characteristic of digitalCharacheristics) {
            let parentChar1 = (parentData1.status === "Unique" || parentData1.status === "Chosen") ? (+parentData1.DBdata?.[characteristic] || 0) : 0
            let parentChar2 = (parentData2.status === "Unique" || parentData2.status === "Chosen") ? (+parentData2.DBdata?.[characteristic] || 0) : 0
            let parentChar3 = (parentData3.status === "Unique" || parentData3.status === "Chosen") ? (+parentData3.DBdata?.[characteristic] || 0) : 0

            // if (!parentChar1 || !parentChar2 || ! parentChar3) {
            //     console.log(parentData1.name, parentData2.name, parentData3.name);
            //     console.log(parentData1.DBdata, parentData2.DBdata, parentData3.DBdata);
            // }


            predictedTempData[characteristic] = Math.round((parentChar1 * 0.5 + parentChar2 * 0.25 + parentChar3 * 0.125) / 0.875 * 100) / 100
            
            if (digitalIntegerCharacteristics.includes(characteristic)) {
                predictedTempData[characteristic] = Math.round(predictedTempData[characteristic])
            }

        }
        
        predictedData.push(predictedTempData)

    }

    // Записываю вычисленные данные
    fs.writeFileSync(path.join(pathToResultFolder, "predictedData.json"), JSON.stringify(predictedData))
    
    
    // Сохранение данных в таблицу
    let outputWorkbook = new exceljs.Workbook();                                                            // Создаю таблицу
    
    
    let childSheet = outputWorkbook.addWorksheet("childs")                                                  // Создаю лист с данными потомков
    
    childSheet.addRow(["Потомок", ...digitalCharacheristics])                                               // добавляю заголовки
    childSheet.addRows(predictedData.map(row => Object.values(row)))                                        // Добавляю данные
    
    
    let parentsAndSonsSheet = outputWorkbook.addWorksheet("parents and childs")                                             // Создаю лист с данными предков и потомков
    parentsAndSonsSheet.addRow(["Потомок", "Уровень", "Имя предка", ...outCharacteristics])                                 // добавляю заголовки

    let parentsAndSonsAllSheet = outputWorkbook.addWorksheet("all parents and childs")                                      // Создаю лист с данными предков и потомков
    parentsAndSonsAllSheet.addRow(["Потомок", "Уровень", "Имя предка", ...outCharacteristics])                              // добавляю заголовки

    let undefinedParentsSheet = outputWorkbook.addWorksheet("undefined parents")                                            // Создаю лист с данными ненайденных предков
    undefinedParentsSheet.addRow(["Кличка", "Семенной код", "Идентификационный номер", "Инвентарный номер", "Статус"])      // добавляю заголовки


    // Переменная с количеством потомков, которых я не добавил в итоговый лист из-за неполных данных о предках
    let skipped = 0 
    
    // Для каждой строки пишу строки с предками и данными потомка
    let parentLevels = ["О", "ОМ", "ОММ"]
    for (let i = 0; i < predictedData.length; i++) {

        let tempParentsForBull = [
            parentsData.find(parentData => parentData.name === childsData[childNames[i]][0].name),
            parentsData.find(parentData => parentData.name === childsData[childNames[i]][1].name),
            parentsData.find(parentData => parentData.name === childsData[childNames[i]][2].name)
        ]

        if (!tempParentsForBull[0].DBdata || !tempParentsForBull[1].DBdata || !tempParentsForBull[2].DBdata) {
            skipped++
        }


        for (let j = 0; j < 3; j++) {
            // console.log(parentsData.find(parentData => parentData.name === childsData[i].parentsData[j].name).DBdata)

            // Добавляю в массив необходимую инфу чтобы потом просто добавить в excel весь массив за 1 раз
            let tempArr = [
                parentLevels[j], 
                childsData[childNames[i]][j].name,
                ...(outCharacteristics.map(char => tempParentsForBull[j].DBdata ? 
                    +tempParentsForBull[j].DBdata[char] 
                    || tempParentsForBull[j].DBdata[char] 
                    || "" : "")) 
            ]

            if (tempParentsForBull[0].DBdata && tempParentsForBull[1].DBdata && tempParentsForBull[2].DBdata) {
                // Если есть все предки - ставлю на лист инвентарный номер потомка
                parentsAndSonsSheet.getCell(2 + (i - skipped) * 4, 1).value = childNames[i]

                // Для каждого элемента данных записываю их в отдельные ячейки второго листа, если есть все предки
                for (let k = 0; k < tempArr.length; k++) {
                    parentsAndSonsSheet.getCell(2 + j + 4 * (i - skipped), 2 + k).value = tempArr[k]
                }  

            }


            // Ставлю на общий лист инвентарный номер потомка
            parentsAndSonsAllSheet.getCell(2 + i * 4, 1).value = childNames[i]

            // Для каждого элемента данных записываю их в отдельные ячейки третьего листа
            for (let k = 0; k < tempArr.length; k++) {
                parentsAndSonsAllSheet.getCell(2 + j + 4 * i, 2 + k).value = tempArr[k]
            }  
            

            // console.log(tempArr)
        }

        
        
        // Добавляю в массив РАСЧИТАННУЮ инфу о потомке чтобы потом просто добавить в excel весь массив за 1 раз
        let tempArr = [
            "Расч. показатели",
            "", "",
            ...outCharacteristics.map(char => predictedData[i][char] || "") 
        ]

        if (tempParentsForBull[0].DBdata && tempParentsForBull[1].DBdata && tempParentsForBull[2].DBdata) {
            // Записываю полученные данные на соответствующую строку если есть все предки
            parentsAndSonsSheet.getRow(5 + (i - skipped) * 4).values = tempArr
            
            // Добавляю стили 
            parentsAndSonsSheet.getRow(5 + (i - skipped) * 4).font = {bold: true}
            parentsAndSonsSheet.getRow(5 + (i - skipped) * 4).fill = {type: 'pattern', pattern:'solid', fgColor: {argb: "FFCCDDFF"}}
            parentsAndSonsSheet.getRow(5 + (i - skipped) * 4).border = {bottom: {style: "thin", color: "FF000000"}}
        
        }

        // Записываю полученные данные на соответствующую строку
        parentsAndSonsAllSheet.getRow(5 + i * 4).values = tempArr
        
        // Добавляю стили 
        parentsAndSonsAllSheet.getRow(5 + i * 4).font = {bold: true}
        parentsAndSonsAllSheet.getRow(5 + i * 4).fill = {type: 'pattern', pattern:'solid', fgColor: {argb: "FFCCDDFF"}}
        parentsAndSonsAllSheet.getRow(5 + i * 4).border = {bottom: {style: "thin", color: "FF000000"}}
        
        
        
    }

    // Читаю файлы undefined и extra.
    // Пишу данные оттуда данные в лист undefinedParentsSheet. Пятым столбцом указываю статус

    let undefinedBullsMarkers = JSON.parse(fs.readFileSync(path.join(pathToResultFolder, "undefinedBullsMarkers.json")))
    let uniqueBullsDataFromDB = JSON.parse(fs.readFileSync(path.join(pathToResultFolder, "uniqueBullsDataFromDB.json")))
    
    let rowCounter = 1
    let undefinedParentsColumnsWidth = [20, 20, 30, 20, 40]
    let textByStatus = {
        "NF": "Не найден в базе",
        "Extra": "Слишком много совпадений базе",
        "Chosen": "Выбран пользователем"
    }

    for (let bullData of undefinedBullsMarkers) {
        let tempArray = [bullData.name || "", bullData.NAAB || "", bullData.ID || "", bullData.inv || "", textByStatus[bullData.status] || "Причина неизвестна"]

        undefinedParentsSheet.addRow(tempArray)
    }

    for (let bullData of uniqueBullsDataFromDB) {
        if (bullData.status !== "Unique") {
            let tempArray = [bullData.name || "", bullData.NAAB || "", bullData.ID || "", bullData.inv || "", textByStatus[bullData.status] || "Причина неизвестна"]
    
            undefinedParentsSheet.addRow(tempArray)

        }
    }


    
    // Основные стили
    for (let i = 0; i < columnWidths.length; i++) {
        parentsAndSonsSheet.getColumn(i + 1).width = columnWidths[i]
        parentsAndSonsAllSheet.getColumn(i + 1).width = columnWidths[i]
    }

    for (let i = 0; i < undefinedParentsColumnsWidth.length; i++) {
        undefinedParentsSheet.getColumn(i + 1).width = undefinedParentsColumnsWidth[i]
    }
    
    parentsAndSonsSheet.getRow(1).font = {bold: true}
    parentsAndSonsSheet.getRow(1).border = {bottom: {style: "medium", color: "FF000000"}}
    parentsAndSonsSheet.getRow(1).height = 30
    parentsAndSonsSheet.getRow(1).alignment = {horizontal: "center", vertical: "middle"}

    parentsAndSonsAllSheet.getRow(1).font = {bold: true}
    parentsAndSonsAllSheet.getRow(1).border = {bottom: {style: "medium", color: "FF000000"}}
    parentsAndSonsAllSheet.getRow(1).height = 30
    parentsAndSonsAllSheet.getRow(1).alignment = {horizontal: "center", vertical: "middle"}
    
    childSheet.getRow(1).font = {bold: true}
    childSheet.getRow(1).border = {bottom: {style: "medium", color: "FF000000"}}
    childSheet.getRow(1).height = 30
    childSheet.getRow(1).alignment = {horizontal: "center", vertical: "middle"}
    
    parentsAndSonsSheet.getColumn(1).border = {right: {style: "thin", color: "FF000000"}}
    parentsAndSonsSheet.getColumn(6).border = {right: {style: "thin", color: "FF000000"}}
    
    parentsAndSonsAllSheet.getColumn(1).border = {right: {style: "thin", color: "FF000000"}}
    parentsAndSonsAllSheet.getColumn(6).border = {right: {style: "thin", color: "FF000000"}}
    
    // Сохраняю таблицу в файл
    let outputFilename = path.join(pathToResultFolder, finalFilename)
    console.log("Запись в файл", outputFilename)

    await outputWorkbook.xlsx.writeFile(outputFilename)

    // console.log("Ненайденные быки")
    // console.table(notFound)
}



// TODO     
//          Продумать как отсортировать объект по TPI и молоку (Чтобы наилучшие быки были сверху csv)

//          Сделать лист с предками, которые не были найдены в БД (чтобы потом ручками добавить их в БД)

//          Сделать расчет среднего времени прихода ответа с сервера, чтобы расчитывать оставшееся время


