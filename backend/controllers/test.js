// import { getAllUniqueBullsMarkersFromTable, getChildsDataFormTable, getDataFromTable } from "./ExcelController.js"

// await getDataFromTable("2023_02_13_12_00_48 Телки Рабитицы Short.xlsx", { parentsNames: [ 'e', 'g', 'i' ], parentsNAABs: [ '', '', '' ], parentsIDs: [ '', '', '' ], parentsInvs: [ 'd', 'f', 'h' ] })


import { getFirstNRowsFromTable } from "./ExcelController.js";

console.log(await getFirstNRowsFromTable("2023_02_13_12_00_48 Телки Рабитицы Short.xlsx"))