export default function genTimestamp() {
    let res = new Date().toISOString()
    return res.slice(0, res.length - 5)
}
