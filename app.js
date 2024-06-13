const express = require('express')
const ejs = require('ejs')
const path = require('path')
const bodyParser = require('body-parser')
const db = require('./db')
const app = express()
const port = 80

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, "views"))

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))

// 총 급여 설정 (예시로 1,063,400원 설정, 아직 유미님께 못 받아옴)
const totalIncome = 1063400;

// 라우팅 (일단 root가 지출계획서)
app.get('/', (req, res) => {
  const sql = 'SELECT * FROM spending'
  db.query(sql, function (err, result, fields) {
    if(err) throw err;

    // 예상 지출 계산
    const totalAmount = result.reduce((acc, item) => acc + item.amount, 0);

    // 현재 잔여 급여 계산
    const remainingIncome = totalIncome - totalAmount;

    // ./views/index/ejs 라는 파일을 불러와서 렌더, 데이터 베이스 내용(result)와 예상 지출, 남은 급여를 ejs에 전달
    res.render('index', {data: result, totalIncome, totalAmount, remainingIncome })
  })
})

app.post('/spendingProc', (req, res) => {
  const { fix, title, date, category, amount } = req.body;
  const sql = 'INSERT INTO spending (fix, title, date, category, amount) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [fix, title, date, category, amount], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data: ' + err.message);
      return;
    }
    res.send("<script>alert('지출 내역이 저장되었습니다.'); location.href='/';</script>");
  });
})

app.delete('/deleteSpending/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM spending WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).send('Error deleting data: ' + err.message);
      return;
    }
    res.send("지출 내역이 삭제되었습니다");
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})