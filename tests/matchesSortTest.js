const fs = require("fs");

let data = JSON.parse(fs.readFileSync("./extra.json"));


// Сортировка быков по короткой кличке 
let sortedextraParentsIDs = data.map(bullData => {
    bullData.matches.sort((a,b) => (a.Name > b.Name) ? 1 : ((b.Name > a.Name) ? -1 : 0));
    return bullData
})


fs.writeFileSync("./sortedExtra.json", JSON.stringify(sortedextraParentsIDs));

