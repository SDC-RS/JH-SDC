const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const cassandra = require('cassandra-driver');

const client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1',
  keyspace: 'sdc'
});

fs.createReadStream(path.resolve(__dirname, '../data/answers_photos_simple.csv'))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {
    // console.log(row);
    const query = 'INSERT INTO photos(id, answer_id, url) VALUES(?, ?, ?)';
    const values = [Number(row.id), Number(row.answer_id), row.url];
    // console.log(values);
    client.execute(query, values, { prepare : true }, (err, res) => {
      if (err) {
        console.error(err);
      }
    })
  })
  .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));