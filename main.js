const port = 5000;
const express = require("express");
const bodyParser = require('body-parser');
const path = require("path");
const router = require("./router");
const app = express();
require('dotenv').config();
const mysql = require('mysql2/promise');

let test = async () => {
    const db = mysql.createPool({
        host: '34.22.96.26',
        user: 'sara',
        password: '1105',
        database: 'albami_db',
    });

// 정적 파일 제공
    app.use(express.static(path.join(__dirname, 'public')));

// POST 요청의 본문을 파싱하기 위한 미들웨어
    app.use(express.urlencoded({extended: true}));

    app.use(bodyParser.json());

// 루트 경로에 대한 GET 요청에 대한 응답
    app.get("/", (req, res) => {
        // 클라이언트에게 index.html 파일을 그대로 전송
        res.sendFile(path.join(__dirname, 'views', 'index.html'));
    });

    let tSalary = 0;
    let totalholidayAllowance = 0;
    let totalnightAllowance = 0;
    let totalNightHours = 0;

    const pWorkingHours = 15; //소정근로시간
    const nightStartHour = 22;
    const nightEndHour = 5;
    let totalWorkHours =0;
    let payDay;

// 알바 별 목록을 반환하는 GET 요청 처리
    app.get('/jobs', (req, res) => {
        db.query(`
        SELECT 
            idAlba,
            name,
            hourlyWage, 
            startTime,
            endTime,
            payDay
        FROM 
            MyAlba
        GROUP BY idAlba
        ORDER BY idAlba;
    `, (err, results) => {
            if (err) {
                console.error('Error fetching data from database: ', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            // 각 직업별로 계산된 정보를 담기 위한 배열
            const jobsWithIncome = results.map((row) => {
                // 시작 시간과 종료 시간을 기반으로 근무 시간을 계산
                const startTime = new Date(`1970-01-01T${row.startTime}`);
                let endTime = new Date(`1970-01-01T${row.endTime}`);
                if (endTime < startTime) {
                    endTime.setDate(endTime.getDate() + 1);
                }
                const hoursDiff = (endTime - startTime) / (1000 * 60 * 60);

                // 야간 근무 시간을 계산하기 위한 변수 설정
                const nightStartHour = 22; // 야간 근무 시작 시간 (예: 22시)
                let nightHours = 0;
                for (let hour = startTime.getHours(); hour < startTime.getHours() + hoursDiff; hour++) {
                    const currentHour = hour % 24;
                    if (currentHour >= nightStartHour || currentHour < 6) { // 야간 근무 시간 (22시부터 6시)
                        nightHours += 1 / hoursDiff;
                    }
                }

                // 일반 수당 계산
                const normalHours = hoursDiff - nightHours;
                const normalAllowance = normalHours * row.hourlyWage;

                // 주휴 수당 계산
                const pWorkingHours = 40; // 예상 주휴근무 시간
                const holidayAllowance = (pWorkingHours / 40) * 8 * row.hourlyWage;

                // 야간 수당 계산
                const nightAllowance = nightHours * row.hourlyWage * 1.5;

                // 기타 수당 계산 (세금 등)
                const otherAllowance = normalAllowance * 0.033;

                // 총 급여 계산
                const totalSalary = normalAllowance + holidayAllowance + nightAllowance + otherAllowance;

                // payDay에서 일자만 추출 (JavaScript에서 처리)
                const payDay = new Date(row.payDay).getDate();

                // 계산된 정보를 객체로 반환
                return {
                    idAlba: row.idAlba,
                    name: row.name,
                    totalSalary: totalSalary.toFixed(0), // 소수점 2자리까지 반올림
                    payDay: payDay,
                    totalWorkHours: hoursDiff.toFixed(1), // 소수점 2자리까지 근무 시간 표시
                    holidayAllowance: holidayAllowance.toFixed(0),
                    nightAllowance: nightAllowance.toFixed(0),
                    otherAllowance: otherAllowance.toFixed(0)
                };
            });
            res.json(jobsWithIncome);
        });
    });


//월별 총급여
    app.get('/jobs/total-income', (req, res) => {
        const { selectedMonth } = req.query; // 클라이언트에서 선택한 연도와 월 정보 (예: '2023-01')
        console.log(`received ${selectedMonth}`);
        // 쿼리에서 선택한 월 정보를 기반으로 데이터를 필터링하고 계산
        db.query(`
        SELECT 
            DATE_FORMAT(Schedules.date, '%Y-%m') AS work_month,
            ROUND(MyAlba.hourlyWage, 0) AS hourlyWage,
            ROUND(SUM(
                CASE
                    WHEN HOUR(Schedules.startTime) >= 22 OR HOUR(Schedules.endTime) <= 6 THEN
                        TIMESTAMPDIFF(HOUR, Schedules.startTime, Schedules.endTime) * MyAlba.hourlyWage * 1.5 -- 야간수당
                    ELSE
                        TIMESTAMPDIFF(HOUR, Schedules.startTime, Schedules.endTime) * MyAlba.hourlyWage
                END
            ), 0) AS monthly_salary_with_night_shift,
            ROUND(CASE 
                WHEN SUM(TIMESTAMPDIFF(HOUR, Schedules.startTime, Schedules.endTime)) >= 40 THEN -- 주휴수당 기준 (예: 주 40시간 이상 근무)
                    SUM(TIMESTAMPDIFF(HOUR, Schedules.startTime, Schedules.endTime) * MyAlba.hourlyWage) / 40 * 8 -- 주휴수당 계산 예: 주 8시간 추가 지급
                ELSE
                    0
            END, 0) AS weekly_holiday_allowance,
            ROUND(
                SUM(
                    CASE
                        WHEN HOUR(Schedules.startTime) >= 22 OR HOUR(Schedules.endTime) <= 6 THEN
                            TIMESTAMPDIFF(HOUR, Schedules.startTime, Schedules.endTime) * MyAlba.hourlyWage * 1.5
                        ELSE
                            TIMESTAMPDIFF(HOUR, Schedules.startTime, Schedules.endTime) * MyAlba.hourlyWage
                    END
                ) +
                CASE 
                    WHEN SUM(TIMESTAMPDIFF(HOUR, Schedules.startTime, Schedules.endTime)) >= 40 THEN
                        SUM(TIMESTAMPDIFF(HOUR, Schedules.startTime, Schedules.endTime) * MyAlba.hourlyWage) / 40 * 8
                    ELSE
                        0
                END, 0
            ) AS total_salary
        FROM Schedules
        JOIN MyAlba ON Schedules.idAlba = MyAlba.idAlba  
        WHERE DATE_FORMAT(Schedules.date, '%Y-%m') = ?
        GROUP BY work_month, MyAlba.hourlyWage
        ORDER BY work_month;
    `,   [selectedMonth], (err, results) => {
            if (err) {
                console.error('Error fetching data from database: ', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            // 해당 월의 데이터가 없을 경우 빈 배열을 반환하거나 다른 처리를 수행할 수 있음
            if (results.length === 0) {
                res.status(404).send('No data found for the selected month.');
                return;
            }

            // 해당 월의 합계 급여 계산
            const monthlyIncome = {
                totalIncome: 0,
                totalWeekIncome: 0,
                totalNightIncome: 0,
                totalEtcIncome: 0
            };

            results.forEach(row => {
                const totalSalary = Number(row.total_salary);
                const holidayAllowance = Number(row.weekly_holiday_allowance);
                const nightAllowance = Number(row.monthly_salary_with_night_shift);
                const otherAllowance =Number(totalSalary) * 0.033;

                monthlyIncome.totalIncome += totalSalary;
                monthlyIncome.totalWeekIncome += holidayAllowance;
                monthlyIncome.totalNightIncome += nightAllowance;
                monthlyIncome.totalEtcIncome += otherAllowance;
            });

            // 소수점 제거
            monthlyIncome.totalEtcIncome = monthlyIncome.totalEtcIncome.toFixed(0);

            res.json(monthlyIncome);
        });
    });

//     app.get('/jobs/total-income', (req, res) => {
//         // const { yearMonth } = req.query; // HTML 폼에서 제출된 연도와 월 값
//         // console.log(`Received yearMonth: ${yearMonth}`);
//         db.query(`
//         SELECT
//         hourlyWage,
//         startTime,
//         endTime
//         FROM MyAlba
//     `, (err, results) => {
//             if (err) {
//                 console.error('Error fetching data from database: ', err);
//                 res.status(500).send('Internal Server Error');
//                 return;
//             }
//
//             results.forEach((row) => {
//                 //야간수당계산
//                 const startTime = new Date(`1970-01-01T${row.startTime}`);
//                 let endTime = new Date(`1970-01-01T${row.endTime}`);
//
//                 // 종료 시간이 시작 시간보다 이른 경우 다음 날로 처리
//                 if (endTime < startTime) {
//                     endTime.setDate(endTime.getDate() + 1);
//                 }
//
//                 const hoursDiff = (endTime - startTime) / (1000 * 60 * 60);
//                 // 야간 근무 시간 계산
//                 let nightHours = 0;
//
//                 for (let hour = startTime.getHours(); hour < startTime.getHours() + hoursDiff; hour++) {
//                     const currentHour = hour % 24;
//                     if (currentHour >= nightStartHour || currentHour < nightEndHour) {
//                         nightHours += 1 / hoursDiff;
//                     }
//                 }
//                 totalNightHours += nightHours;
//                 totalnightAllowance = totalNightHours * row.hourlyWage * 1.5;
//                 //일반수당
//                 const salary = row.hourlyWage * (hoursDiff - nightHours);
//                 tSalary += salary;
//                 //주휴수당
//                 totalholidayAllowance += (pWorkingHours / 40) * 8 * row.hourlyWage;
//             });
//
//             // 주휴수당, 야간수당, 기타 수당 계산
//             const totalSalary = tSalary + totalholidayAllowance + totalnightAllowance + tSalary * 0.033;
//             const holidayAllowance = totalholidayAllowance;
//             const nightAllowance = totalnightAllowance;
//             const otherAllowance = tSalary * 0.033;
//
//             res.send({
//                 totalIncome: totalSalary.toFixed(0),
//                 totalWeekIncome: holidayAllowance.toFixed(0),
//                 totalNightIncome: nightAllowance.toFixed(0),
//                 totalEtcIncome: otherAllowance.toFixed(0)
//             });
//         });
//     });

// Use the router
    app.use("/", router);

// Start the server
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });

}
test();