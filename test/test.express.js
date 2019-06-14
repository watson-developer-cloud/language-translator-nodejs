'use strict';

require('dotenv').config({ silent: true });

if (!process.env.LANGUAGE_TRANSLATOR_IAM_APIKEY) {
  console.log('Skipping unit test because LANGUAGE_TRANSLATOR_IAM_APIKEY is null');
  return;
}

const bodyParser = require('body-parser');
const request = require('supertest');
const assert = require('assert');
const app = require('../app');

app.use(bodyParser.json());

describe('Basic API tests', function() {
  it('GET to / should load the home page', function(done) {
    request(app)
      .get('/')
      .expect(200, done);
  });

  it('GET to /api/models should return the models', function(done) {
    request(app)
      .get('/api/models')
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) throw err;

        assert(res.body.models);
        assert(res.body.models.length > 1);
        done();
      });
  });

  it('POST to /api/translate should translate text', function(done) {
    request(app)
      .post('/api/translate')
      .send({
        modelId: 'en-es',
        text: 'Messi is the best soccer player in the world',
      })
      .end(function(err, res) {
        if (err) throw err;
        assert(res.body.translations);
        assert.equal(res.body.word_count, 9);
        assert.equal(res.body.character_count, 44);
        done();
      });
  });

  it('GET to /api/identifiable_languages should the identifiable languages', function(done) {
    request(app)
      .get('/api/identifiable_languages')
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) throw err;

        assert(res.body.languages);
        assert(res.body.languages.length > 1);
        done();
      });
  });

  it('POST to /api/identify should identify the given text', function(done) {
    request(app)
      .post('/api/identify')
      .send({
        text: 'Messi es el mejor del mundo',
      })
      .end(function(err, res) {
        if (err) throw err;

        assert(res.body.languages);
        assert(res.body.languages.length > 1);
        done();
      });
  });

  it('GET to /not-a-real-page should return 404', function(done) {
    request(app)
      .get('/not-a-real-page')
      .expect(404, done);
  });
});
