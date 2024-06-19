const express = require('express')
const ejs = require('ejs')
const path = require('path')

const db = require('./db')
const app = express()
const port = 3000
const bcrypt = require('bcrypt')

var bodyParser = require('body-parser')
var session = require('express-session')


app.set('view engine', 'ejs')
app.set('views', './views')

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({secret:'keyboard cat', cookie: {maxAge: 60000}, resave: true, saveUninitialized: true}))

app.use((req, res, next) => {

    res.locals.email = "";
    res.locals.name = "";

    if (req.session.User) {
        res.locals.email = req.session.User.email
        res.locals.name = req.session.User.name
    }
    next()
})



app.get('/', (req, res) => {
    console.log(req.session.User);
    res.render('index')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/emailSearch', (req, res) => {
    res.render('emailSearch')
})

app.get('/passwordSearch', (req, res) => {
    res.render('passwordSearch')
})

app.get('/passwordReset', (req, res) => {
    res.render('passwordReset')
})

app.post('/loginProc', (req, res) => {
    const email = req.body.email;
    const passWord = req.body.passWord;

    const sql = `SELECT * FROM User WHERE email=?`;
    const values = [email];

    db.query(sql, values, function (err, result) {
        if (err) throw err;

        if (result.length == 0) {
            res.send("<script> alert('입력하신 정보를 다시 확인해주세요.'); location.href='/login';</script>")
        } else {
            const user = result[0];
            bcrypt.compare(passWord, user.passWord, (err, isMatch) => {
                if (err) throw err;

                if (isMatch) {
                    req.session.User = user;
                    res.send("<script> alert('로그인 되었습니다.'); location.href='/';</script>")
                } else {
                    res.send("<script> alert('입력하신 정보를 다시 확인해주세요.'); location.href='/login';</script>")
                }
            });
        }
    });
});


app.get('/logout', (req, res) => {
    req.session.User = null;
    res.send("<script> alert('로그아웃 되었습니다.'); location.href='/';</script>")

})

app.post('/registerProc', (req, res) => {
    const email = req.body.email;
    const number = req.body.number;    
    const name = req.body.name;
    const nickName = req.body.nickName;
    const passWord = req.body.passWord;

    const saltRounds = 10;
    bcrypt.hash(passWord, saltRounds, (err, hashedPassword) => {
        if (err) {
            return res.send("<script> alert('회원가입 중 오류가 발생했습니다.'); location.href='/register';</script>");
        }

        const sql = `INSERT INTO User (email, number, name, nickName, passWord) VALUES (?,?,?,?,?)`;
        const values = [email, number, name, nickName, hashedPassword];

        db.query(sql, values, function (err, result) {
            if (err) {
                res.send("<script> alert('이미 등록된 회원정보입니다.'); location.href='/register';</script>")
            } else {
                console.log(result[0]);
                res.send("<script> alert('회원가입 되었습니다.'); location.href='/login';</script>")
            }
        });
    });
});

app.post('/emailSearchProc', (req, res) => {
    const name = req.body.name;
    const number = req.body.number;

    const sql = `SELECT * from User where name=? AND number=?`;

    const values = [name, number];

    db.query(sql, values, function (err, result) {
        if (err) throw err;

        if (result.length == 0) {
            res.send("<script> alert('일치하는 회원정보가 없습니다.'); location.href='/emailSearch';</script>")
        }
        else
        {
            console.log(result[0]);
            req.session.User = result[0]
            const email = result[0].email;
            res.send(`<script> alert('회원님의 이메일은 ${email}입니다. 로그인을 진행해 주세요.'); location.href='/login';</script>`)
            //res.send(result);
        }
    })
})

app.post('/passwordSearchProc', (req, res) => {
    const email = req.body.email;
    const number = req.body.number;
    
    const sql = `SELECT * from User where email=? AND number=?`;

    const values = [email, number];

    db.query(sql, values, function (err, result) {
        if (err) throw err;

        if (result.length == 0) {
            res.send("<script> alert('일치하는 회원정보가 없습니다.'); location.href='/passwordSearch';</script>")
        }
        else
        {
            console.log(result[0]);
            req.session.User = result[0]
            res.send("<script> alert('비밀번호 재설정 화면으로 이동합니다.'); location.href='/passwordReset';</script>")
            //res.send(result);
        }
    })
})

app.post('/passwordResetProc', (req, res) => {
    if (!req.session.User) {
        res.send("<script> alert('잘못된 접근입니다.'); location.href='/login';</script>");
        return;
    }

    const newPassword = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;

    if (newPassword !== passwordConfirm) {
        res.send("<script> alert('비밀번호가 일치하지 않습니다.'); location.href='/passwordReset';</script>");
        return;
    }

    const email = req.session.User.email;

    const saltRounds = 10;
    bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
        if (err) {
            res.send("<script> alert('비밀번호 재설정 중 오류가 발생했습니다.'); location.href='/passwordReset';</script>");
            return;
        }

        const sql = `UPDATE User SET passWord=? WHERE email=?`;
        const values = [hashedPassword, email];

        db.query(sql, values, function (err, result) {
            if (err) throw err;

            req.session.destroy(); // 세션 파기
            res.send("<script> alert('비밀번호가 성공적으로 변경되었습니다.'); location.href='/login';</script>");
        });
    });
});



app.listen(port, () => {
    console.log(`서버 실행; 접속 주소: http://localhost:${port}`)
})