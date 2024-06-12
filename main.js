const express = require("express");
const path = require("path");
const router = require("./router");
const app = express();
require('dotenv').config();
const mysql = require('mysql2/promise');
const partTimeJobs = [
    {job: 'Waiter', hours: 8, rate: 9000, weekIncome: 7000, nightIncome: 600, etc: 110, detail: 'zzxczxc'},
    {job: 'Tutor', hours: 8, rate: 200000, weekIncome: 400, nightIncome: 70, etc: 0},
    {job: 'Cashier', hours: 8, rate: 1800, weekIncome: 8000, nightIncome: 0, etc: 0},
    {job: 'Delivery Driver', hours: 8, rate: 18800, weekIncome: 1200, nightIncome: 0, etc: 0},
    {job: 'Retail Assistant', hours: 8, rate: 13020, weekIncome: 6300, nightIncome: 3000, etc: 0}
];

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    waitForConnections: true,
    insecureConnections: true
});

// 데이터베이스 연결 테스트를 위한 엔드포인트
app.get('/test-db', async (req, res) => {
    try {
        const [results, fields] = await db.query('SELECT 1 + 1 AS solution');
        res.json({
            message: 'Database connection is successful',
            solution: results[0].solution
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database connection failed', error: err });
    }
});


// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// POST 요청의 본문을 파싱하기 위한 미들웨어
app.use(express.urlencoded({extended: true}));

// 루트 경로에 대한 GET 요청에 대한 응답
app.get("/", (req, res) => {
    // 클라이언트에게 index.html 파일을 그대로 전송
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 알바 별 목록을 반환하는 GET 요청 처리
app.get('/jobs', (req, res) => {
    res.json(partTimeJobs);
});
/*
// users 테이블의 모든 데이터를 반환하는 GET 요청 처리
app.get('/myJob', async (req, res) => {
    try {
        const [results, fields] = await db.query('SELECT * FROM myJob');

        let totalHourlyRate = 0;
        results.forEach(job => {
            totalHourlyRate += job.hourlyRate;
        });

        // 계산된 총합과 테이블의 모든 데이터를 JSON 형식으로 응답
        res.json({
            jobs: results,
            totalHourlyRate: totalHourlyRate
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});*/



// 총 수입을 반환하는 GET 요청 처리
app.get('/jobs/total-income', (req, res) => {
    let totalIncome = 0;
    let income = 0;
    let totalWeekIncome = 0;
    let totalNightIncome = 0;
    let totalEtcIncome = 0;


    partTimeJobs.forEach(job => {
        income = job.hours * job.rate;
        totalIncome += income;
        totalWeekIncome += job.weekIncome;
        totalNightIncome += job.nightIncome;
        totalEtcIncome += job.etc;
    });

    res.json({
        totalIncome: totalIncome,
        totalWeekIncome: totalWeekIncome,
        totalNightIncome: totalNightIncome,
        totalEtcIncome: totalEtcIncome
    });
});

// Use the router
app.use("/", router);

// Start the server
app.listen(process.env.PORT || 5000, () => {
    console.log(`서버가 포트 번호 ${process.env.PORT || 5000}에서 작동 중입니다.`);
});