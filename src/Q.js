const { escape, getDataType } = require('./utils')

const AND = ' AND '
const OR = ' OR '
const NOT = ' NOT '

function Q (queryPairs) {
    const conditionsBuilder = new ConditionBuilder(queryPairs)
    const query = `( ${conditionsBuilder.buildConditions()} )`
    return query
}

class ConditionBuilder {
    constructor(queryPairs = {}) {
        this.queryPairs = queryPairs
    }

    _getStringCondition (key, rawEquivalence, value) {
        const cleanedValue = escape(value)
        let condition = ''
        switch (rawEquivalence) {
            case 'startswith':
                condition = `\`${key}\` LIKE "${cleanedValue}%"`
            break
            case 'endswith':
                condition = `\`${key}\` LIKE "%${cleanedValue}"`
            break
            case 'contains':
                condition = `\`${key}\` LIKE "%${cleanedValue}%"`
            break
            default:
                condition = `\`${key}\` = "${cleanedValue}"`
        }
        return condition
    }

    _getArrayCondition (key, rawEquivalence, value) {
        let condition = ''
        switch (rawEquivalence) {
            case 'in':
                // check for numbers or 
                let arrayData = []
                for (let i = 0; i < value.length; i++) {
                    const itemValue = value[i]
                    const typeOfValue = getDataType(value)
                    if (typeOfValue == 'integer' || typeOfValue == 'float') {
                        arrayData.push(itemValue)
                    } else if (typeOfValue == 'boolean' || typeOfValue == 'null') {
                        arrayData.push(String(itemValue).toUpperCase())
                    } else {
                        arrayData.push(`"${escape(String(itemValue))}"`)
                    }
                }
                condition = `\'${key}\` IN [${arrayData.join(', ')}]`
            break
            default:
                throw Error("Invalid equivalence for string")
        }
        return condition
    }

    _getNumericCondition (key, rawEquivalence, value) {
        let condition = ''
        switch (rawEquivalence) {
            case 'gte':
                condition = `\`${key}\` >= ${value}`
            break
            case 'gt':
                condition = `\`${key}\` > ${value}`
            break
            case 'lte':
                condition = `\`${key}\` <= ${value}`
            break
            case 'lt':
                condition = `\`${key}\` < ${value}`
            break
            default:
                condition = `\`${key}\` = ${value}`
        }
        return condition
    }

    _getBooleanCondition (key, rawEquivalence, value) {
        let condition = ''
        switch (rawEquivalence) {
            case 'isnull':
                if (value === true) {
                    condition = `\`${key}\` IS NULL`
                } else {
                    condition = `\`${key}\` IS NOT NULL`
                }
            break
            case 'exact':
            default:
                condition = `\`${key}\` IS ${String(value).toUpperCase()}`
        }
        return condition
    }

    _getObjectCondition (key, rawEquivalence, value) {
        let condition = ''
        if (value.id > 0) {
            const id = parseInt(value.id)
            if (isNaN(id) || id != id) {
                throw Error('Objects must have an numeric `id` field')
            }
            condition = `\`${key}_id\` = ${value.id}`
        } else {
            throw Error('Objects must have an numeric `id` field')
        }
        return condition
    }

    buildConditions () {
        // https://stackoverflow.com/a/1155013/5671180
        const searchParameters = []
        Object.keys(this.queryPairs).forEach(rawKey => {
            const value = this.queryPairs[rawKey]
            const keyEquivalence = rawKey.split('__', 2)
            const key = escape(keyEquivalence[0])
            let rawEquivalence = '='
            if (keyEquivalence.length > 1) {
                rawEquivalence = keyEquivalence[1]
            }
            let typeOfValue = getDataType(value)
            let condition = ''
            if (typeOfValue == 'string') {
                condition = this._getStringCondition(key, rawEquivalence, value)
            } else if (typeOfValue == 'array') {
                condition = this._getArrayCondition(key, rawEquivalence, value)
            } else if (typeOfValue == 'float' || typeOfValue == 'integer') {
                condition = this._getNumericCondition(key, rawEquivalence, value)
            } else if (typeOfValue == 'boolean') {
                condition = this._getBooleanCondition(key, rawEquivalence, value)
            } else if (typeOfValue == 'object') {
                condition = this._getObjectCondition(key, rawEquivalence, value)
            }
            searchParameters.push(condition)
        })
        const searchParameterString = searchParameters.join(' AND ')
        return searchParameterString
    }
}

exports.AND = AND
exports.OR = OR
exports.NOT = NOT
exports.Q = Q
exports.ConditionBuilder = ConditionBuilder
