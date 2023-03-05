import mysql from "mysql";

export function connectToDB() {
    const conn = mysql.createConnection({
        host: "localhost",
        user: "root",
        database: "bulls",
        password: "",
    })
    
    conn.connect(e => {
        if (e) {
            console.log("Ошибка подключения к БД")
            // reject(e)
    
        } else {
            console.log("DB - OK")
            // resolve()
        }
    
    })

    return conn
}

export function makeRequest(conn, req) {
    // checkQuerry = `SELECT COUNT(NAAB) FROM allDataDairy where NAAB LIKE '%${tempRow[1]}%'`

    // Проверка, есть ли бычок с таким NAAB
    return new Promise((resolve, reject) => {
        conn.query(req, (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        
        })
        
    })

    
}

export function getBullFromDB(conn, searchString) {
    return new Promise((resolve, reject) => {
        makeRequest(conn, searchString)
        .then(data => {
            resolve(data)
        })
        .catch(e => {
            reject(e)
        })
    })
}

