import myDatabse from 'better-sqlite3'
// 创建一个名为mydatabse.db的SQLite数据库
const db = new myDatabse('mydatabase.db')
// 建表语句
// const createTableSql = `
//     CREATE TABLE IF NOT EXISTS users (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         username TEXT,
//         email TEXT
//     )
// `
// // 执行sql语句
// db.exec(createTableSql)

// const insertSql = 'INSERT INTO users (username, email) VALUES (?, ?)'
// const stmt = db.prepare(insertSql)
// const res = stmt.run('zhangsan', 'abc@qq.com')

// 当参数比较多时， 可以使用具名参数的方式，传入对象，用法如下
const insertSql = 'INSERT INTO users (username, email) VALUES (@username, @email)'
const stmt = db.prepare(insertSql)
stmt.run({ username: 'lisi', email: '12345@qq.com' })

// 执行sql语句方式二
// const stmt = db.prepare(createTableSql)
// stmt.run()
// 此方式可以减少在每次执行查询时重新编译SQL语句的开销，当需要多次执行查询时，可以通过stmt对象的get(), all()等方法来执行查询
