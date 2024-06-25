const express = require('express');
const router = express.Router();
const db = require('../database'); // 데이터베이스 연결

// Helper function to convert time to minutes
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Helper function to calculate the duration in minutes
function calculateDuration(startTime, endTime) {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    return endMinutes - startMinutes;
}

// GET 요청: 이번 달 총 월급 계산
router.get('/calculate-monthly-wage', async (req, res) => {
    try {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');

        const startDate = `${year}-${month}-01`;
        const endDate = `${year}-${month}-31`;

        const sql = `
            SELECT s.name, s.startTime, s.endTime, s.date, a.hourlyWage
            FROM Schedules s
            JOIN MyAlba a ON s.name = a.name
            WHERE s.date BETWEEN ? AND ?
        `;

        db.query(sql, [startDate, endDate], (err, results) => {
            if (err) {
                console.error('Failed to execute query:', err.stack);
                return res.status(500).json({ error: 'Internal server error' + err });
            }

            const workHours = {};

            results.forEach(row => {
                const { name, date, startTime, endTime, hourlyWage } = row;
                const key = `${name}-${date}`;
                const duration = calculateDuration(startTime, endTime);

                if (!workHours[key]) {
                    workHours[key] = { hourlyWage, totalMinutes: 0 };
                }

                workHours[key].totalMinutes += duration;
            });

            let totalWage = 0;

            Object.values(workHours).forEach(work => {
                const { hourlyWage, totalMinutes } = work;
                const hoursWorked = totalMinutes / 60;
                totalWage += hoursWorked * hourlyWage;
            });

            res.json({ totalWage });
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

module.exports = router;
