/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express');
var app = express();
var LanguageTranslatorV2 = require('watson-developer-cloud/language-translator/v2');

// Bootstrap application settings
require('./config/express')(app);

var translator = new LanguageTranslatorV2({
  // If unspecified here, the LANGUAGE_TRANSLATOR_USERNAME and LANGUAGE_TRANSLATOR_PASSWORD environment properties will be checked
  // After that, the SDK will fall back to the ibm-cloud-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>'
  url: 'https://gateway.watsonplatform.net/language-translator/api',
  headers: {
    'X-Watson-Technology-Preview': '2017-07-01',
    'X-Watson-Learning-Opt-Out': true,
  },
});

// render index page
app.get('/', function(req, res) {
  // If hide_header is found in the query string and is set to 1 or true,
  // the header should be hidden. Default is to show header
  res.render('index', {
    hideHeader: !!(req.query.hide_header == 'true' || req.query.hide_header == '1'),
    analytics: !!process.env.BLUEMIX_ANALYTICS,
  });
});

app.get('/api/models', function(req, res, next) {
  console.log('/v2/models');
  translator.listModels({}, function(err, models) {
    if (err) return next(err);
    else res.json(models);
  });
});

app.post('/api/identify', function(req, res, next) {
  console.log('/v2/identify');
  translator.identify(req.body, function(err, models) {
    if (err) return next(err);
    else res.json(models);
  });
});

app.get('/api/identifiable_languages', function(req, res, next) {
  console.log('/v2/identifiable_languages');
  translator.listIdentifiableLanguages({}, function(err, models) {
    if (err) return next(err);
    else res.json(models);
  });
});

app.post('/api/translate', function(req, res, next) {
  console.log('/v2/translate');
  translator.translate(req.body, function(err, models) {
    if (err) return next(err);
    else res.json(models);
  });
});

// express error handler
require('./config/error-handler')(app);
module.exports = app;