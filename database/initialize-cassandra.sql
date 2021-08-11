CREATE KEYSPACE sdc
WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };

USE sdc;

CREATE TABLE IF NOT EXISTS questions (
  question_id int PRIMARY KEY,
  product_id int,
  question_body varchar,
  question_date timestamp,
  asker_name varchar,
  asker_email varchar,
  question_helpfulness int,
  reported boolean
);

CREATE TABLE IF NOT EXISTS answers (
  id int PRIMARY KEY,
  question_id int,
  body varchar,
  date timestamp,
  answerer_name varchar,
  answerer_email varchar,
  helpfulness int,
  reported boolean
);

CREATE TABLE IF NOT EXISTS photos (
  id int PRIMARY KEY,
  answer_id int,
  url varchar
);

describe tables;