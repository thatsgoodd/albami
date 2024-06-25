// const express = require('express');
// const router = express.Router();
// const db = require('../database');
//
// // 특정 요일의 MyAlba 정보 조회
// router.get('/api/alba', (req, res) => {
//     const { days } = req.query; // 클라이언트에서 days 파라미터를 받음
//
//     try {
//         const sql = 'SELECT * FROM MyAlba WHERE FIND_IN_SET(?, fixedWorkDays)';
//         const params = [days];
//
//         db.query(sql, params, (err, results) => {
//             if (err) {
//                 console.error('쿼리 실행 실패:', err.stack);
//                 res.status(500).send('서버 오류');
//                 return;
//             }
//             res.json(results);
//         });
//     } catch (error) {
//         console.error('서버 오류:', error);
//         res.status(500).json({ error: 'Failed to fetch data' });
//     }
// });
//
// module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/all', (req, res) => {
    const sql = `SELECT name, payDay FROM MyAlba`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Failed to fetch MyAlba data:', err.stack);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});


// 특정 요일의 MyAlba 정보 조회
router.get('/', (req, res) => {
    const { days } = req.query; // 클라이언트에서 days 파라미터를 받음

    try {
        const sql = 'SELECT * FROM MyAlba WHERE FIND_IN_SET(?, fixedWorkDays)';
        const params = [days];

        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('쿼리 실행 실패:', err.stack);
                res.status(500).send('서버 오류');
                return;
            }
            res.json(results);
        });
    } catch (error) {
        console.error('서버 오류:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

module.exports = router;