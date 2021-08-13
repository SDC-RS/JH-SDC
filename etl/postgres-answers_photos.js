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

fs.createReadStream(path.resolve(__dirname, '../data/answers_photos_simple.csv'))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {
    // console.log(row);
    const query = 'INSERT INTO photos(id, answer_id, url) VALUES($1, $2, $3)';
    const values = [Number(row.id), Number(row.answer_id), row.url];
    // console.log(values);
    pool.query(query, values, (err, res) => {
      if (err) console.error(err)
    })
  })
  .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));