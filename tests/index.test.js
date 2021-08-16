const { Pool } = require('pg');
const { app, handleParam } = require('../server/index.js');
const supertest = require("supertest");

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sdc',
  password: '123',
  port: 5432,
})

describe('Server Test', () => {
  const date = new Date();

  beforeAll(async () => {
    await pool.query('TRUNCATE questions');
    await pool.query('TRUNCATE answers');
    await pool.query('TRUNCATE photos');
    await pool.query('INSERT INTO questions(question_id, product_id, question_body, question_date, asker_name, asker_email, question_helpfulness, reported) VALUES($1, $2, $3, $4, $5, $6, $7, $8)', [1, 2, "testBody", date, "testName", "testEmail", 3, false]);
    await pool.query('INSERT INTO answers(id, question_id, body, date, answerer_name, answerer_email, helpfulness, reported) VALUES($1, $2, $3, $4, $5, $6, $7, $8)', [1, 1, "testAnswer", date, "testAnswerName", "testAnswerEmail", 2, false]);
  });

  it('should create questions in database', async () => {
    const result = await pool.query('SELECT * FROM questions');

    expect(result.rows.length).toStrictEqual(1);
    expect(result.rows[0].question_id).toStrictEqual(1);
    expect(result.rows[0].product_id).toStrictEqual(2);
    expect(result.rows[0].question_body).toStrictEqual('testBody');
    expect(result.rows[0].question_date).toStrictEqual(date);
    expect(result.rows[0].asker_name).toStrictEqual('testName');
    expect(result.rows[0].asker_email).toStrictEqual('testEmail');
    expect(result.rows[0].question_helpfulness).toStrictEqual(3);
    expect(result.rows[0].reported).toStrictEqual(false);
  });

  it('should GET /qa/questions without product_id and return error', async () => {
    const response = await supertest(app)
      .get("/qa/questions")
      .expect(500);
    expect(response.body).toStrictEqual({
      message: "product_id is undefined"
    })
  });

  it('should GET /qa/questions', async () => {
    const response = await supertest(app)
      .get("/qa/questions?product_id=2")
      .expect(200);
    expect(response.body).toStrictEqual({
      "product_id": "2",
      "results": [
        {
          "answers": {
            "1": {
              "answerer_name": "testAnswerName",
              "body": "testAnswer",
              "date": date.toISOString(),
              "helpfulness": 2,
              "id": 1,
              "photos": [],
            },
          },
          "asker_name": "testName",
          "question_body": "testBody",
          "question_date": date.toISOString(),
          "question_helpfulness": 3,
          "question_id": 1,
          "reported": false,
        },
      ],
    });
  });

  it('should create answers in database', async () => {
    const result = await pool.query('SELECT * FROM answers');

    expect(result.rows.length).toStrictEqual(1);
    expect(result.rows[0].id).toStrictEqual(1);
    expect(result.rows[0].question_id).toStrictEqual(1);
    expect(result.rows[0].body).toStrictEqual('testAnswer');
    expect(result.rows[0].date).toStrictEqual(date);
    expect(result.rows[0].answerer_name).toStrictEqual('testAnswerName');
    expect(result.rows[0].answerer_email).toStrictEqual('testAnswerEmail');
    expect(result.rows[0].helpfulness).toStrictEqual(2);
    expect(result.rows[0].reported).toStrictEqual(false);
  });


  it('should GET /qa/questions/:question_id/answers', async () => {
    const response = await supertest(app)
      .get("/qa/questions/1/answers")
      .expect(200);
    expect(response.body).toStrictEqual({
      "count": 5,
      "page": 1,
      "question": "1",
      "results":[
          {
          "answerer_name": "testAnswerName",
          "body": "testAnswer",
          "date": date.toISOString(),
          "helpfulness": 2,
          "id": 1,
          "photos":[],
        },
      ],
    });
  });

  it('should increment question helful count', async () => {
    const responseBefore = await supertest(app)
      .get("/qa/questions?product_id=2")
    expect(responseBefore.body.results[0].question_helpfulness).toBe(3)

    const response = await supertest(app)
      .put("/qa/questions/1/helpful")
      .expect(204);
    expect(response.body).toStrictEqual({});

    const responseAfter = await supertest(app)
      .get("/qa/questions?product_id=2")
    expect(responseAfter.body.results[0].question_helpfulness).toBe(4)
  });

  it('should report the question', async () => {
    const responseBefore = await supertest(app)
      .get("/qa/questions?product_id=2")
    expect(responseBefore.body.results.length).toBe(1)

    const response = await supertest(app)
      .put("/qa/questions/1/report")
      .expect(204);
    expect(response.body).toStrictEqual({});

    const responseAfter = await supertest(app)
      .get("/qa/questions?product_id=2")
    expect(responseAfter.body.results.length).toBe(0)
  });

  it('should increment answer helful count', async () => {
    const responseBefore = await supertest(app)
      .get("/qa/questions/1/answers")
    expect(responseBefore.body.results[0].helpfulness).toBe(2)

    const response = await supertest(app)
      .put("/qa/answers/1/helpful")
      .expect(204);
    expect(response.body).toStrictEqual({});

    const responseAfter = await supertest(app)
      .get("/qa/questions/1/answers")
    expect(responseAfter.body.results[0].helpfulness).toBe(3)
  });

  it('should report the question', async () => {
    const responseBefore = await supertest(app)
      .get("/qa/questions/1/answers")
    expect(responseBefore.body.results.length).toBe(1)

    const response = await supertest(app)
      .put("/qa/answers/1/report")
      .expect(204);
    expect(response.body).toStrictEqual({});

    const responseAfter = await supertest(app)
      .get("/qa/questions/1/answers")
    expect(responseAfter.body.results.length).toBe(0)
  });

  it('should return param', () => {
    expect(handleParam(3, 5)).toBe(3);
  });

  it('should return defaultValue', () => {
    expect(handleParam(undefined, 5)).toBe(5);
  });

});