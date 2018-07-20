#!/usr/bin/env node
'use strict';

require('dotenv').config({silent: true});

var server = require('./app');
var port = process.env.PORT || 3000;

var startServer = server.listen(port, function() {
  console.log('Server running on port: %d', port);
});

function close() {
  startServer.close();
}

module.exports = {
  close: close
};
