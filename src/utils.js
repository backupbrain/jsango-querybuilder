
const escape = (str) => {
    return str.replace(/\'/g,"''")
}

const getDataType = (value) => {
    let typeOfValue = typeof(value)
    if (typeOfValue == 'object') {
        if (value instanceof Array) {
            typeOfValue = 'array'
        } else if (value instanceof Date) {
            typeOfValue = 'date'
        } else if (value === null) {
            typeOfValue = 'null'
        } else if (value === undefined) {
            typeOfValue = 'undefined'
        }
    } else if (typeOfValue == 'number') {
        if (value % 1 === 0) {
            typeOfValue = 'integer'
        } else {
            typeOfValue = 'float'
        }
    }
    return typeOfValue
}

exports.escape = escape
exports.getDataType = getDataType