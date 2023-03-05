export default function genStr(num) {

    let res = ""

    for (let i = 0; i < num; i++) {
        res += String.fromCharCode(Math.floor(Math.random() * 25 + 65))
    }

    return res

}
