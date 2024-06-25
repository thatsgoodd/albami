const mysql = require('mysql');
require('dotenv').config();

const db = mysql.createConnection({
    host: '34.22.96.26', // 데이터베이스 호스트 주소
    user: 'sara',          // 데이터베이스 사용자 이름
    password: '1105',      // 데이터베이스 비밀번호
    database: 'albami_db'  // 사용할 데이터베이스 이름
});

db.connect((err) => {
    if (err) {
        console.error('database.js 문제있다 :', err);
        throw err;
    }
    console.log('database.js 문제없음');
});

module.exports = db;
