var express = require('express');
var app = express();
const { Pool } = require('pg');

app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sdc',
  password: '123',
  port: 5432,
})

app.get('/qa/questions', (req, res) => {
  let productId = req.query.product_id;

  if (productId === undefined) {
    res.status(500).send({message: "product_id is undefined"});
    return;
  } else {
    productId = Number(productId);
  }
  const page = Number(handleParam(req.query.page, 1));
  const count = Number(handleParam(req.query.count, 5));

  const query = 'SELECT ' +
    'q.question_id q_question_id, ' +
    'q.product_id q_product_id, ' +
    'q.question_body q_question_body, ' +
    'q.question_date q_question_date, ' +
    'q.asker_name q_asker_name, ' +
    'q.asker_email q_asker_email, ' +
    'q.question_helpfulness q_question_helpfulness, ' +
    'q.reported q_reported, ' +
    'a.id a_id, ' +
    'a.question_id a_question_id, ' +
    'a.body a_body, ' +
    'a.date a_date, ' +
    'a.answerer_name a_answerer_name, ' +
    'a.answerer_email a_answerer_email, ' +
    'a.helpfulness a_helpfulness, ' +
    'a.reported a_reported, ' +
    'p.id p_id, ' +
    'p.answer_id p_answer_id, ' +
    'p.url p_url ' +
    'FROM questions q ' +
    'LEFT JOIN answers a ON q.question_id=a.question_id ' +
    'LEFT JOIN photos p ON a.id=p.answer_id ' +
    'WHERE product_id=$1';
  pool.query(query, [productId], (err, result) => {
    if (err) {
      console.error(err)
    } else {
      // console.log(result.rows)
      const questions = {};
      result.rows.forEach(row => {
        if (questions[row.q_question_id] === undefined) {
          questions[row.q_question_id] = {
            question_id: row.q_question_id,
            question_body: row.q_question_body,
            question_date: row.q_question_date,
            asker_name: row.q_asker_name,
            question_helpfulness: row.q_question_helpfulness,
            reported: row.q_reported,
            answers: {}
          }
        }
        if (row.a_id !== null && questions[row.q_question_id].answers[row.a_id] === undefined) {
          const answer = {
            id: row.a_id,
            body: row.a_body,
            date: row.a_date,
            answerer_name: row.a_answerer_name,
            helpfulness: row.a_helpfulness,
            photos: []
          }
          questions[row.q_question_id].answers[row.a_id] = answer;
        }
        if (row.p_id !== null) {
          const photo = {
            id: row.p_id,
            url: row.p_url
          }
          questions[row.q_question_id].answers[row.a_id].photos.push(photo);
        }
      })
      console.log(questions)
      res.send({
        product_id: req.query.product_id,
        results: Object.values(questions)
      })
    }
  })
});

app.get('/qa/questions/:question_id/answers', (req, res) => {
  let questionId = req.params.question_id;

  if (questionId === undefined) {
    res.status(500).send({message: "question_id is undefined"});
    return;
  } else {
    questionId = Number(questionId);
  }
  const page = Number(handleParam(req.query.page, 1));
  const count = Number(handleParam(req.query.count, 5));

  const query = 'SELECT ' +
    'a.id a_id, ' +
    'a.question_id a_question_id, ' +
    'a.body a_body, ' +
    'a.date a_date, ' +
    'a.answerer_name a_answerer_name, ' +
    'a.answerer_email a_answerer_email, ' +
    'a.helpfulness a_helpfulness, ' +
    'a.reported a_reported, ' +
    'p.id p_id, ' +
    'p.answer_id p_answer_id, ' +
    'p.url p_url ' +
    'FROM answers a ' +
    'LEFT JOIN photos p ON a.id=p.answer_id ' +
    'WHERE a.question_id=$1';
  pool.query(query, [questionId], (err, result) => {
    if (err) {
      console.error(err)
    } else {
      console.log(result.rows)
      const answers = {};
      result.rows.forEach(row => {
        if (answers[row.a_id] === undefined) {
          const answer = {
            id: row.a_id,
            body: row.a_body,
            date: row.a_date,
            answerer_name: row.a_answerer_name,
            helpfulness: row.a_helpfulness,
            photos: []
          }
          answers[row.a_id] = answer;
        }
        if (row.p_id !== null) {
          const photo = {
            id: row.p_id,
            url: row.p_url
          }
          answers[row.a_id].photos.push(photo);
        }
      })
      res.send({
        question: req.params.question_id,
        page: page,
        count: count,
        results: Object.values(answers)
      })
    }
  })
});

app.post('/qa/questions', async (req, res) => {
  const questionIdResult = await pool.query('SELECT MAX(question_id) FROM questions');
  const newQuestionId = questionIdResult.rows[0].max + 1;

  const query = 'INSERT INTO questions(question_id, product_id, question_body, question_date, asker_name, asker_email, question_helpfulness, reported) VALUES($1, $2, $3, $4, $5, $6, $7, $8)'
  pool.query(query, [newQuestionId, Number(req.body.product_id), req.body.body, new Date(), req.body.name, req.body.email, 0, false], (err, result) => {
    if (err) {
      console.error(err);
    } else {
      res.status(201).send('CREATED');
    }
  })
});

app.post('/qa/questions/:question_id/answers', async (req, res) => {
  const answerIdResult = await pool.query('SELECT MAX(id) FROM answers');
  const newAnswerId = answerIdResult.rows[0].max + 1;
  const questionId = req.params.question_id;

  const query = 'INSERT INTO answers(id, question_id, body, date, answerer_name, answerer_email, helpfulness, reported) VALUES($1, $2, $3, $4, $5, $6, $7, $8)';
  await pool.query(query, [newAnswerId, Number(questionId), req.body.body, new Date(), req.body.name, req.body.email, 0, false]);
  const photos = req.body.photos;
  if (photos !== undefined) {
    for (let i = 0; i < photos.length; i++) {
      const photoIdResult = await pool.query('SELECT MAX(id) FROM photos');
      const newPhotoId = photoIdResult.rows[0].max + 1;
      await pool.query('INSERT INTO photos(id, answer_id, url) VALUES($1, $2, $3)', [newPhotoId, newAnswerId, photos[i]]);
    }
  }
  res.status(201).send('CREATED');
});

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  console.log(req.params);
  const query = 'UPDATE questions SET question_helpfulness=question_helpfulness+1 WHERE question_id=$1';
  pool.query(query,[Number(req.params.question_id)], (err, result) => {
    if (err) {
      console.error(err);
    } else {
      res.status(204).send('NO CONTENT');
    }
  })
});

app.put('/qa/questions/:question_id/report', (req, res) => {
  const query = 'UPDATE questions SET reported=true WHERE question_id=$1';
  pool.query(query,[Number(req.params.question_id)], (err, result) => {
    if (err) {
      console.error(err);
    } else {
      res.status(204).send('NO CONTENT');
    }
  })
});

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  const query = 'UPDATE answers SET helpfulness=helpfulness+1 WHERE id=$1';
  pool.query(query,[Number(req.params.answer_id)], (err, result) => {
    if (err) {
      console.error(err);
    } else {
      res.status(204).send('NO CONTENT');
    }
  })
});

app.put('/qa/answers/:answer_id/report', (req, res) => {
  console.log(req.params);
  const query = 'UPDATE answers SET reported=true WHERE id=$1';
  pool.query(query,[Number(req.params.answer_id)], (err, result) => {
    if (err) {
      console.error(err);
    } else {
      res.status(204).send('NO CONTENT');
    }
  })
});


const handleParam = (param, defaultValue) => {
  if (param === undefined) {
    return defaultValue;
  } else {
    return param;
  }
};

const port = 3000;
app.listen(port, function() {
  console.log(`listening on port ${port}`);
});