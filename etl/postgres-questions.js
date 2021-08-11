const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const { Pool, Client } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sdc',
  password: '123',
  port: 5432,
})

fs.createReadStream(path.resolve(__dirname, '../data/questions_simple.csv'))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {
    // console.log(row)
    const query = 'INSERT INTO questions(question_id, product_id, question_body, question_date, asker_name, asker_email, question_helpfulness, reported) VALUES($1, $2, $3, $4, $5, $6, $7, $8)';
    const values = [Number(row.id), Number(row.product_id), row.body, new Date(Number(row.date_written)), row.asker_name, row.asker_email, Number(row.helpful), !!Number(row.reported)];
    // console.log(values);
    pool.query(query, values, (err, res) => {
      if (err) console.error(err)
    })
  })
  .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));