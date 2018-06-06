const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const history = require('connect-history-api-fallback');
const home = require('./routes/index');
const auth = require('./routes/auth');
const app = express();

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/passport_auth_jwt_mevn', { promiseLibrary: require('bluebird') })
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

app.use(history());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'false'}));
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/api/home', home);
app.use('/api/auth', auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// restful api error handler
app.use(function(err, req, res, next) {
  console.log(err);
  if (req.app.get('env') !== 'development') {
    delete err.stack;
  }
  res.status(err.statusCode || 500).json(err);
});

module.exports = app;
