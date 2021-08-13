const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sdc',
  password: '123',
  port: 5432,
})

fs.createReadStream(path.resolve(__dirname, '../data/answers_simple.csv'))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {
    // console.log(row);
    const query = 'INSERT INTO answers(id, question_id, body, date, answerer_name, answerer_email, reported, helpfulness) VALUES($1, $2, $3, $4, $5, $6, $7, $8)';
    const values = [Number(row.id), Number(row.question_id), row.body, new Date(Number(row.date_written)), row.answerer_name, row.answerer_email, !!Number(row.reported), Number(row.helpful)];
    // console.log(values);
    pool.query(query, values, (err, res) => {
      if (err) console.error(err)
    })
  })
  .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));