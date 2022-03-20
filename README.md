# JavaScript SQL Query Builder

This is a query builder, built in JavaScript.

It is inspired by [Django](https://www.djangoproject.com/)'s amazing query builder, which allows developers to quickly chain commands together to create powerful queries, including multi-table joins.

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


## Known issues:

* Due to a limitation in Javascript, we can't assign the `.values()` method, so we are using `.columns()` instead.
* This dosen't yet support querying other table's columns with the `__` divider