const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 80;

// MySQL 데이터베이스 연결 설정
const db = mysql.createConnection({
 host: '34.22.96.26', // 데이터베이스 호스트 주소
    user: 'sara',          // 데이터베이스 사용자 이름
    password: '1105',      // 데이터베이스 비밀번호
    database: 'albami_db'  // 사용할 데이터베이스 이름
});
// MySQL 데이터베이스 연결
db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 오류:', err);
    process.exit(1); // 연결 실패 시 서버 종료
  }
  console.log('Connected to MySQL Database');
});

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// body-parser 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Schedules 테이블에 데이터를 삽입하는 라우트
app.post('/save-job', (req, res) => {
  const {
    name, startTime, endTime, hourlyWage, includesRestPay, color, idAlba, repeatDays, payDay, date, includesRepeat
  } = req.body;

  console.log('Received data:', req.body); // 수신된 데이터 로그

  const query = `
    INSERT INTO Schedules (name, startTime, endTime, hourlyWage, includesRestPay, color, idAlba, repeatDays, payDay, date, includesRepeat)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [name, startTime, endTime, hourlyWage, includesRestPay, color, idAlba, repeatDays, payDay, date, includesRepeat], (err, result) => {
    if (err) {
      console.error('데이터 삽입 오류:', err);
      res.status(500).json({ success: false, message: 'Error inserting data into Schedules table', error: err });
      return;
    }
    res.json({ success: true, message: 'Data successfully inserted into Schedules table' });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});
