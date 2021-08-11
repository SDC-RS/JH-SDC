CREATE DATABASE sdc;

\c sdc;

CREATE TABLE IF NOT EXISTS questions (
  question_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  question_body VARCHAR(512) NOT NULL,
  question_date TIMESTAMP NOT NULL,
  asker_name VARCHAR(128) NOT NULL,
  asker_email VARCHAR(128) NOT NULL,
  question_helpfulness INTEGER NOT NULL,
  reported BOOLEAN NOT NULL,
  PRIMARY KEY (question_id)
);

CREATE TABLE IF NOT EXISTS answers (
  id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  body VARCHAR(512) NOT NULL,
  date TIMESTAMP NOT NULL,
  answerer_name VARCHAR(128) NOT NULL,
  answerer_email VARCHAR(128) NOT NULL,
  helpfulness INTEGER NOT NULL,
  reported BOOLEAN NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS photos (
  id INTEGER NOT NULL,
  answer_id INTEGER NOT NULL,
  url VARCHAR(512) NOT NULL,
  PRIMARY KEY (id)
);

\dt;