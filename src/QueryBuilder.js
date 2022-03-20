const { escape, getDataType } = require('./utils')
const { Q } = require('./Q')

class QueryBuilder {
    constructor (table) {
        this.method = 'SELECT'
        this.values = ['*']
        this.table = table
        this.conditions = null
        this.updates = null
        this.order = null
        this.relatedTables = null
        this.limit = null
        this.offset = null
    }

    _getOrders (rawOrders) {
        const orders = []
        for (let i = 0; i < rawOrders.length; i++) {
            const order = rawOrders[i]
            if (order[0] == '-') {
                orders.push(`\`${escape(order.substr(1))}\` DESC`)
            } else {
                orders.push(`\`${escape(order)}\` ASC`)
            }
        }
        return orders
    }

    /**
     * Get the type of value
     * @param {*} value 
     * @returns object, array, date, string, integer, float
     */
     _getValueType (value) {
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

    open () {
        console.log('Opening')
        return this
    }
    close () {
        console.log('Closing')
        return this
    }
    all () {
        this.conditions = null
        return this
    }
    get (conditions) {
        this.conditions = conditions
        this.limit = 1
        return this
    }
    filter (conditions) {
        this.conditions = conditions
        this.limit = null
        return this
    }
    orderBy (orderArray) {
        this.order = orderArray
        return this
    }
    limit (limit) {
        this.limit = limit
        return this
    }
    offset (offset) {
        this.offset = offset
        return this
    }

    columns (values) {
        this.values = values
        return this
    }

    delete () {
        this.method = 'DELETE'
        return this
    }
    update (updates) {
        this.method = 'UPDATE'
        this.updates = updates
        return this
    }
    create (updates) {
        this.method = 'INSERT'
        this.updates = updates
        return this
    }

    selectRelated (relatedTableNames) {
        this.relatedTables = relatedTableNames
        return this
    }
    
    toString () {
        const cleanedTableName = escape(this.table)
        let query = ''
        const cleanedValues = []
        // build column values
        if (this.method == 'SELECT' ||  this.method == 'UPDATE' || this.method == 'UPDATE') {
            for (let i = 0; i < this.values.length; i++) {
                const value = this.values[i]
                if (value == '*') {
                    cleanedValues.push(value)
                } else {
                    cleanedValues.push(`\`${escape(value)}\``)
                }
            }
        }
        if (this.method == 'SELECT') {
            query = `SELECT ${cleanedValues.join(', ')} FROM ${cleanedTableName}`
        } else if (this.method == 'UPDATE') {
            const updateSet = []
            // build update
            Object.keys(this.updates).forEach(key => {
                let newValue = this.updates[key]
                const typeOfValue = getDataType(newValue)
                let cleanedNewValue = null
                if (typeOfValue == 'integer' || typeOfValue == 'float') {
                    cleanedNewValue = newValue
                } else if (typeOfValue == 'boolean' || typeOfValue == 'null') {
                    cleanedNewValue = String(newValue).toUpperCase()
                } else {
                    cleanedNewValue = `"${escape(newValue)}"`
                }
                const updateItem = `\`${escape(key)}\` = ${cleanedNewValue}`
                updateSet.push(updateItem)
            })
            query = `UPDATE ${cleanedTableName} SET ( ${updateSet.join(', ')} )`
        } else if (this.method == 'INSERT') {
            const columns = []
            const values = []
            Object.keys(this.updates).forEach(key => {
                let newValue = this.updates[key]
                const typeOfValue = getDataType(newValue)
                let cleanedNewValue = null
                if (typeOfValue == 'integer' || typeOfValue == 'float') {
                    cleanedNewValue = newValue
                } else if (typeOfValue == 'boolean' || typeOfValue == 'null') {
                    cleanedNewValue = String(newValue).toUpperCase()
                } else {
                    cleanedNewValue = `"${escape(newValue)}"`
                }
                columns.push(`\`${escape(key)}\``)
                values.push(cleanedNewValue)
            })
            query = `INSERT INTO ${cleanedTableName} ( ${columns.join(', ')} ) VALUES ( ${values.join(', ')} )`
        } else if (this.method == 'DELETE') {
            query = `DELETE FROM ${cleanedTableName}`
        } else {
            throw Error(`Unsupported query type: ${this.method}`)
        }
        // build conditions
        if (this.method == 'SELECT' || this.method == 'DELETE' || this.method == 'UPDATE') {
            if (this.conditions != null) {
                const conditions = Q(this.conditions)
                query += ` WHERE ${conditions}`
            }
        }
        // left join related tables
        if (this.method == 'SELECT' && this.relatedTables != null) {
            const cleanedTableNames = []
            this.relatedTables.forEach(relatedTableName => {
                cleanedTableNames.push(`\`${escape(relatedTableName)}\``)
            })
            query += ` LEFT JOIN ( ${cleanedTableNames.join(', ')} )`
        }
        // order by
        if (this.method == 'SELECT' && this.orderBy != null) {
            const orders = this._getOrders(this.order)
            query += ` ORDER BY ( ${orders.join(', ')} )`
        }
        // limit and offset
        if (this.method == 'SELECT' || this.method == 'DELETE' || this.method == 'UPDATE') {
            if (this.limit != null) {
                query += ` LIMIT ${parseInt(this.limit)}`
                if (this.offset != null) {
                    query += `, ${parseInt(this.offset)}`
                }
            }
        }
        query += ';'
        return query
    }
}

exports.QueryBuilder = QueryBuilder
