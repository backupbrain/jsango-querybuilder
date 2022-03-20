# JavaScript SQL Query Builder

This is a query builder, built in JavaScript.

It is inspired by [Django](https://www.djangoproject.com/)'s amazing query builder, which allows developers to quickly chain commands together to create powerful queries, including multi-table joins.

## Why does this exist

You may find that working with SQL databases challenging, especially when converting between functional or object-oriented programming to SQL statements. Writing SQL statements by hand is slow, messy, and error-prone. Many Database relational Management Systems (DBRMS) have not-so-great query builders.

Since many good DBRMS have the ability to input raw queries, it seems useful to be able to use an external query builder library.

My goal here is to create one that is intuitive yet powerful, especially allowing features such as joins.

## Examples

Of course it goes without saying that you must include the library from somewhere.

```javascript
const { QueryBuilder } = require('./queryBuilder/QueryBuilder')
```


### Select queries

Example 1: Select all
```javascript
const query = new QueryBuilder('user').all()
console.log(String(query))
```

```sql
SELECT * FROM `user`;
```

Example 2: Filter Users by email
```javascript
const query = new QueryBuilder('user')
    .filter({ email: 'user1@example.com' })
console.log(String(query))
```

```sql
SELECT * FROM `user` WHERE ( `email` IS `user1@example.com` );
```

Example 3: Get a single Users by email
```javascript
const query = new QueryBuilder('user')
    .get({ email: 'user1@example.com' })
console.log(String(query))
```

```sql
SELECT * FROM `user` WHERE ( `email` IS "user1@example.com" ) LIMIT 1;
```

Example 4: Filter Users by email and name, and only select the name and age columns.
```javascript
const query = new QueryBuilder('user')
    .filter({ email: 'user1@example.com', name: 'John' })
    .columns(['name', 'age'])
console.log(String(query))
```

```sql
SELECT `name`, `age` FROM `user` WHERE ( `email` IS "user1@example.com" AND `name` IS "John" );
```


Example 5: Filter Users where age >= 21
```javascript
const query = new QueryBuilder('user')
    .filter({ age__gte: 31 })
console.log(String(query))
```

```sql
SELECT * FROM `user` WHERE ( `age` >= 21 );
```

Example 6: Ordering results
```javascript
const query = new QueryBuilder('user')
    .all()
    .orderBy(['age', '-height'])
console.log(String(query))
```

```sql
SELECT * FROM `user` ORDER BY ( `age` ASC, `height` DESC );
```

Example 6: Find all users and any posts that match that user
```javascript
const query = new QueryBuilder('user')
    .all()
    .selectRelated(['post'])
console.log(String(query))
```

```sql
SELECT * FROM `user` LEFT JOIN ( `post` );
```

Example 6: Fetching a single user's name a post where the email is known, ordering by descending height.
```javascript
const query = new QueryBuilder('user')
    .get({ email__endswith: '@example.com', age__gt: 21 })
    .selectRelated(['post'])
    .orderBy(['-height'])
console.log(String(query))
```

```sql
SELECT * FROM `user` WHERE ( `email` LIKE "%@example.com" AND `age` > 21 ) LEFT JOIN ( `post` ) ORDER_BY ( `height` DESC ) LIMIT 1;
```

### Insert Queries

Example 1: Insert an object.

```javascript
const user = { email: 'email@example.com', name: 'John', age: 33 }
const query = new QueryBuilder('user')
    .insert([user])
```

```sql
INSERT INTO `user` ( `email`, `name`, `age`) VALUES ( "email@example.com", "John", 21 );
```

Example 2: Insert multiple object.

```javascript
const user1 = { email: 'email1@example.com', name: 'Ada', age: 45 }
const user2 = { email: 'email2@example.com', name: 'Beck', age: 56 }
const query = new QueryBuilder('user')
    .insert([user1, user2])
```

```sql
INSERT INTO `user` ( `email`, `name`, `age`) VALUES ( "email1@example.com", "Ada", 45 ), ( "email2@example.com", "Beck", 56 );
```

### Update Queries

Example 1: Update all users named "Jon" to "John"

```javascript
const query = new QueryBuilder('user')
    .filter({ name: 'Jon'})
    .update({ name: 'John' })
```

```sql
UPDATE `user` SET ( `name` = "John" ) WHERE ( `name` = "Jon" );
```

### Delete Queries

Example 1: Delete users who are under 21

```javascript
const query = new QueryBuilder('user')
    .filter({ age__lt: 21 })
    .delete()
```

```sql
DELETE FROM `user` WHERE ( `age` < 21 );
```

Example 2: Delete all users

```javascript
const query = new QueryBuilder('user')
    .delete()
```

```sql
DELETE FROM `user`;
```

## Advanced Conditions

You can create advanced conditions using the `Q()` function.

`Q()` takes an object and attempts to convert it into an SQL condition which could go inside a `WHERE () ` clause.

It uses [Django Query](https://docs.djangoproject.com/en/4.0/topics/db/queries/)-style syntax, where it relies on the `__` string segment to join a column name and the equivalence function.

For exaample, take these:

Example 1: Exact matches
```javascript
const { Q } = require('./queryBuilder/Q')

Q({name: "john"})
Q({age: 21})
Q({validated: false})
Q({name__isnull: true})
Q({name__isnull: false})
```
```sql
( `name` = "john" )
( `age` = 21 )
( `validated` IS FALSE )
( `name` IS NULL )
( `name` IS NOT NULL )
```

Example 2: Text matching
```javascript
Q({email__startswith: "john"})
Q({name__contains: "john"})
```
```sql
( `email` LIKE "john%" )
( `name` LIKE "%john%" )
```

Example 3: Matching arrays
```javascript
Q({name__in: ["john", "tony"]})
```
```sql
( 'name` IN ["john", "tony"] )
```

Example 4: Other types of matches
```javascript
Q({name: {id: 1, name: "tony"}})
Q({age__gte: 18})
Q({age__lt: 21, age__gte: 18})
Q({age__ne: 21})
```

```sql
( `name_id` = 1 )
( `age` >= 18 )
( `age` < 21 AND `age` >= 18 )
( `age` = 21 )
```

### Joining Conditions

```javascript
const { Q, AND, OR, NOT } = require('./queryBuilder/Q')

Q({email__startswith: "john"}) + OR + Q({email__startswith: "john"}) + AND + NOT + Q({email__startswith: "john"})
```
```sql
( `email` LIKE "john%" ) OR ( `email` LIKE "john%" ) AND  NOT ( `email` LIKE "john%" )
```

## Known issues:

* Due to a limitation in Javascript, we can't assign the `.values()` method, so we are using `.columns()` instead.
* This dosen't yet support querying other table's columns with the `__` divider