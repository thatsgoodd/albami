const express = require('express');
const bodyParser = require('body-parser');
const albaInfoRoute = require('./routes/albaInfo');
const scheduleRoute = require('./routes/schedules');
const cors = require('cors');
const db = require('./database');
const wageRouter = require('./routes/wageRouter');

const app = express();
app.use(bodyParser.json());

app.use(cors());

app.use('/api', wageRouter);
app.use('/api/alba', albaInfoRoute);
app.use('/api/schedule', scheduleRoute );



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server.js 문제없다 ${PORT}`);
});

