const express = require('express');
const router = express.Router();
const db = require('../database');

// POST 요청: 일정 추가
router.post('/', (req, res) => {
    const { name, payDay, startTime, endTime, hourlyWage, repeatDays, includesRestPay, includesRepeat, color } = req.body;

    const sql = `INSERT INTO Schedules (name, payDay, startTime, endTime, hourlyWage, repeatDays, includesRestPay, includesRepeat, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [name, payDay, startTime, endTime, hourlyWage, repeatDays, includesRestPay, includesRepeat, color], (err, result) => {
        if (err) {
            console.error('Error adding schedule:', err);
            res.status(500).send('Failed to add schedule');
            return;
        }
        console.log('Schedule added:', result);
        res.status(201).send('Schedule added');
    });
});

// GET 요청: 특정 날짜의 일정 조회
router.get('/', async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Date parameter is required.' });
        }

        const formattedDate = new Date(date);
        const dayOfWeek = formattedDate.getDay(); // 0 (Sunday) to 6 (Saturday)

        const sql = `
            SELECT name, startTime, endTime, hourlyWage
            FROM Schedules 
            WHERE 
                (includesRepeat = 1 AND repeatDays LIKE CONCAT('%', ?, '%')) 
                OR 
                (includesRepeat = 0 AND DATE(date) = ?)
        `;
        const params = [dayOfWeek.toString(), formattedDate];

        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('Failed to execute query:', err.stack);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

module.exports = router;
