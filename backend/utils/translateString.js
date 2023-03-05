export function translateString(str) {
    const letters = {"/": "", " ":"", "а":"a", "б":"b", "в":"v", "г":"g", "д":"d", "е":"e", "ё":"e", "ж":"zh", "з":"z", "и":"i", "й":"i", "к":"k", "л":"l", "м":"m", "н":"n", "о":"o", "п":"p", "р":"r", "с":"s", "т":"t", "у":"u", "ф":"f", "х":"h", "ц":"tc", "ч":"ch", "ш":"sh", "щ":"sch", "ъ":"", "ы":"i", "ь":"", "э":"e", "ю":"y", "я":"ya"}

    let res = ""

    for (let letter of str.toLowerCase()) {
        if (letters[letter]) {
            res += letters[letter]

        } else {
            res += letter

        }
    }

    return res
}