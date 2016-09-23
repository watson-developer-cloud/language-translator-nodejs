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

// security.js
var secure = require('express-secure-only');
var rateLimit = require('express-rate-limit');
var helmet = require('helmet');

module.exports = function(app) {

    // 1. redirects http to https
    app.enable('trust proxy'); // required when running on bluemix or similar to know if users originally came in on HTTPS and avoid endless redirects
    app.use(secure());

    // 2. helmet with custom CSP header
    var cspReportUrl = '/report-csp-violation';
    app.use(helmet({
        contentSecurityPolicy: {
            // Specify directives as normal.
            directives: {
                defaultSrc: ["'self'"], // default value for unspecified directives that end in -src
                scriptSrc: ["'self'", 'www.google-analytics.com', 'https://cdnjs.cloudflare.com', 'netdna.bootstrapcdn.com'], // jquery cdn, etc. try to avid "'unsafe-inline'"
                styleSrc: ["'self'", "'unsafe-inline'"], // no inline css
                imgSrc: ["'self'", 'www.google-analytics.com'], // should be "'self'" and possibly 'data:' for most apps, but vr demo loads random user-supplied image urls, and apparently * doesn't include data: URIs
                connectSrc: ["'self'", '*.watsonplatform.net'], // ajax domains
                // fontSrc: ["'self'"], // cdn?
                objectSrc: [], // embeds (e.g. flash)
                // mediaSrc: ["'self'", '*.watsonplatform.net'], // allow watson TTS streams
                childSrc: [], // child iframes
                frameAncestors: [], // parent iframes
                formAction: ["'self'"], // where can forms submit to
                pluginTypes: [], // mime-types, e.g. 'application/pdf'
                // sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin'], // options: allow-forms allow-same-origin allow-scripts allow-top-navigation
                reportUri: cspReportUrl
            },

            // Set to true if you only want browsers to report errors, not block them.
            // You may also set this to a function(req, res) in order to decide dynamically
            // whether to use reportOnly mode, e.g., to allow for a dynamic kill switch.
            reportOnly: false,

            // Set to true if you want to blindly set all headers: Content-Security-Policy,
            // X-WebKit-CSP, and X-Content-Security-Policy.
            setAllHeaders: false,

            // Set to true if you want to disable CSP on Android where it can be buggy.
            disableAndroid: false,

            // Set to false if you want to completely disable any user-agent sniffing.
            // This may make the headers less compatible but it will be much faster.
            // This defaults to `true`.
            browserSniff: true
        }
    }));
    // endpoint to report CSP violations
    app.post(cspReportUrl, function(req, res) {
        console.log('Content Security Policy Violation:\n', req.body);
        res.status(204).send(); // 204 = No Content
    });

    // 3. rate limiting
    var translateLimiter = rateLimit({
        windowMs: 60 * 1000,
        delayMs: 1,
        max: 10
    });
    app.use('/api/translate', translateLimiter);

    var identifyLimiter = rateLimit({
        windowMs: 60 * 1000,
        delayMs: 1,
        max: 10
    });
    app.use('/api/identify', identifyLimiter);

};
