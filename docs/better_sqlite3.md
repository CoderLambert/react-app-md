## better-sqlite3

> Node.js 中最快、最简单的 SQLite3 库。

+ 全面的交易支持
+ 高性能、高效、安全
+ 易于使用 （提供了一组简单的方法，使得创建数据库、执行查询、绑定参数等操作非常简单）
+ 跨平台支持（在windows、macOS和Linux等主要平台使用）

## 使用

+ 安装依赖

```bash
npm i better-sqlite3
// 目前使用的是 better-sqlite3@9.5.0版本
```

+ 创建数据库，并建表

```js
const myDatabse = require('better-sqlite3');
// 创建一个名为mydatabse.db的SQLite数据库
const db = new Database('mydatabase.db');
// 建表语句
const createTableSql = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        email TEXT
    )
`;
// 执行sql语句
db.exec(createTableSql);

// 执行sql语句方式二
const stmt = db.prepare(createTableSql)
stmt.run()
// 此方式可以减少在每次执行查询时重新编译SQL语句的开销，当需要多次执行查询时，可以通过stmt对象的get(), all()等方法来执行查询
```

+ 插入数据

```js
const insertSql = 'INSERT INTO users (username, email) VALUES (?, ?)';
const stmt = db.prepare(insertSql);
const res = stmt.run("zhangsan", "abc@qq.com");

// 当参数比较多时， 可以使用具名参数的方式，传入对象，用法如下
const insertSql = 'INSERT INTO users (username, email) VALUES (@username, @email)';
  const stmt = db.prepare(insertSql);
  stmt.run({ username: "lisi", email: "12345@qq.com" });
```

+ 更新数据

```js
const updateSql = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
const stmt = db.prepare(updateSql);
const res = stmt.run("zhangsan", "abc@qq.com", 1);

// 具名参数用法(针对更新字段较多时）
const updateSql = 'UPDATE users SET username = @username, email = @email WHERE id = @id';
const stmt = db.prepare(updateSql);
stmt.run({ username: "xxx", email: "abc@qq.com", id: 2});
```

+ 删除数据

```scss
 db.prepare('DELETE FROM users WHERE id = ?').run(2);
```

+ 查询数据

```csharp
// 查询所有数据
db.prepare('SELECT * FROM users').all();

// 根据条件查询(查询用户名为张三的数据)
db.prepare('SELECT * FROM users where username = ?').get('zhangsan')
```

+ 事务(transaction)

```php
// 批量插入用户数据
const insert = db.prepare('INSERT INTO users (username, email) VALUES (@username, @email)');

const insertMany = db.transaction((users) => {
  for (const user of users) insert.run(user);
});

try {
    insertMany([
      { username: 'Joey', email: 2 },
      { username: 'Sally', email: 4 },
      { username: 'Junior', email: 1 },
    ]);
    console.log("批量执行成功...")
} catch(err) {
    // 当批量执行失败， 则会回滚事务
    console.log(err)
}
```

## 封装better-sqlite3常用操作

+ 封装database (myDb.js),并进行数据库的初始化操作

```javascript
/**
 * 封装better-sqlite3
 */

const Datebase = require('better-sqlite3');

class MyDatabase {
  constructor(dbPath) {
    // 建立数据库连接
    this.db = new Datebase(dbPath);
    this.initialize();
  }
  // 创建表
  initialize() {
    // 初始化脚本
    const createTableSql = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            email TEXT
        )
    `;
    this.db.exec(createTableSql);
  }
}

const myDb = new MyDatabase('data.db');
export default myDb.db;

```

+ 增删改查 (userDao.js)

```php
/**
 * 封装better-sqlite3的增删改查方法
 */

import db from './myDb';

/**
 * 插入用户 - 多参数方式传入
 * @param {*} username
 * @param {*} email
 */
export function insertUser(username, email) {
  const insertSql = 'INSERT INTO users (username, email) VALUES (?, ?)';
  const stmt = db.prepare(insertSql);
  const res = stmt.run(username, email);
  return res;
}

/**
 * 插入用户 - 对象形式传入
 * @param {*} user { username: xxx, email: xxx }
 * @returns
 */
export function insertUserObject(user) {
  const insertSql = 'INSERT INTO users (username, email) VALUES (@username, @email)';
  const stmt = db.prepare(insertSql);
  const res = stmt.run(user);
  return res;
}

/**
 * 批量插入
 * @param {*} users [ {username: xxx, email: xxx}, {username: xxx, email: xxx}]
 * @returns
 */
export function batchInsertUser(users) {
  try {
    db.transaction(() => {
      const insert = db.prepare('INSERT INTO users (username, email) VALUES (@username, @email)');
      for (const item of users) {
        insert.run(item);
      }
    })();
    return true;
  } catch (err) {
    return null;
  }
}

/**
 * 查询所有
 * @returns
 */
export function getUsers() {
  const res = db.prepare('SELECT * FROM users').all();
  return res;
}

/**
 * 根据用户名查询
 * @param {*} username
 * @returns
 */
export function getUsersByName(username) {
  const res = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  return res;
}
/**
 * 更新用户
 * @param {*} user { id: xxx, username: xxx, email: xxxx}
 * @returns
 */
export function updateUser(user) {
  const res = db.prepare('UPDATE users SET username = @username, email = @email WHERE id = @id').run(user);
  return res;
}

/**
 * 删除用户
 * @param {*} id
 * @returns
 */
export function deleteUser(id) {
  const res = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return res;
}

```

## 在electron中使用better-sqlite3的问题

+ electron启动报错

![1.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9ef464f15d594f99a09b3761ea2049a3~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp#?w=560&h=113&s=10786&e=png&b=fce9e9)

## 解决方案

```csharp
// 安装electron-rebuild依赖包(当前版本3.2.9)
yarn add electron-rebuild -D

// 编写脚本 package.json
{
    ...
    "scripts": {
        "rebuild": "electron-rebuild -f -w better-sqlite3"
    }
}

// 执行脚本
yarn rebuild

// 可以在dev的增加预编译脚本 package.json
{
    "dev": "yarn rebuild && chcp 65001 && vite  --host 0.0.0.0",
    "rebuild": "electron-rebuild -f -w better-sqlite3"
}

```
