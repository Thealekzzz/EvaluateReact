export default function trimLeft(str) {
    let counter = 0

    while (Number.isNaN(+str[counter]) || str[counter] === "0") {
        counter++
    }

    return str.slice(counter)
}