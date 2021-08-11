const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const cassandra = require('cassandra-driver');

const client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1',
  keyspace: 'sdc'
});

fs.createReadStream(path.resolve(__dirname, '../data/answers_simple.csv'))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {
    // console.log(row);
    const query = 'INSERT INTO answers(id, question_id, body, date, answerer_name, answerer_email, helpfulness, reported) VALUES(?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [Number(row.id), Number(row.question_id), row.body, new Date(Number(row.date_written)), row.answerer_name, row.answerer_email, Number(row.helpful) ,!!Number(row.reported)];
    // console.log(values);
    client.execute(query, values, { prepare : true }, (err, res) => {
      if (err) {
        console.error(err);
      }
    })
  })
  .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));