const { QueryBuilder } = require('./QueryBuilder')
const { Q, AND, OR, NOT } = require ('./Q')


console.log(Q({email__startswith: "john"}))
console.log(Q({name__in: ["john", "tony"]}))
console.log(Q({name: "john"}))
console.log(Q({name__contains: "john"}))
console.log(Q({name__isnull: true}))
console.log(Q({name__isnull: false}))
console.log(Q({name: {id: 1, name: "tony"}}))
console.log(Q({validated: false}))
console.log(Q({age__gte: 18}))
console.log(Q({age__lt: 21, age__gte: 18}))
console.log(Q({age__ne: 21}))
/* */


const q = Q({email__startswith: "john"}) + OR + Q({email__startswith: "john"}) + AND + NOT + Q({email__startswith: "john"})
console.log(q)
/*
const tableName = 'users'
qb1 = new QueryBuilder(tableName).get(conditions).columns(['email', 'name', 'id']).orderBy(['email', '-name']).selectRelated(['account'])
qb2 = new QueryBuilder(tableName).filter(conditions).update({ email: 'email1@example.com'})
qb2 = new QueryBuilder(tableName).create({ email: 'email1@example.com', id: 1, validated: true})
console.log(String(qb1))
*/