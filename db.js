const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '34.64.40.118',
  user: 'sara',
  password: '1105',
  database: 'albami_db',
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

module.exports = connection;
