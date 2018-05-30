var mongoose = require('mongoose');
var passport = require('passport');
var settings = require('../config/settings');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");

router.post('/register', function(req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({success: false, msg: 'Please pass username and password.'});
  } else {
    var newUser = new User({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      firstname: req.body.firstname,
      surname: req.body.surname
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        console.log(err.message)
        if (err.message.includes('email')) {
          return res.json({success: false, msg: 'email already exists'});
        } else if (err.message.includes('user')) {
          return res.json({success: false, msg: 'username already exists'});
        }
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });
  }
});

router.post('/login', function (req, res) {

  //check username
  User.findOne({ username: req.body.username }, function (err, user) {
    if (err) {
      throw err;
    }
    if (!user) {
      //check email
      User.findOne({ email: req.body.username }, function (err, user) {
        if (err) {
          throw err;
        }
        if (!user) {
          res.json({success: false, msg: 'email or username not found'});
        } else {
          checkPassword(user, req, res)
        }
      });
    } else {
      checkPassword(user, req, res)
    }
  });
});

function checkPassword (user, req, res) {
  user.comparePassword(req.body.password, function (err, isMatch) {
    if (isMatch && !err) {
      var token = jwt.sign(user.toJSON(), settings.secret);
      res.json({success: true, token: 'JWT ' + token});
    } else {
      res.json({success: false, msg: 'wrong password'});
    }
  })
}

router.get('/profile/:id', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    res.json({user: req.user});
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.post('/profile/:id/comparepassword', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers)
  if (token) {
    User.findOne({ username: req.user.username }, function (err, user) {
      if (err) {
        throw err;
      }
      if (!user) {
        return res.status(403).send({success: false, msg: 'Unauthorized.'});
      } else {
        user.comparePassword(req.body.oldPassword, function (err, isMatch) {
          if (isMatch && !err) {
            res.json({success: true, msg: 'correct password'});
          } else {
            res.json({success: false, msg: 'wrong password'});
          }
        });
      }
    })
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.put('/profile/:id/edit', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers)
  if (token) {
    User.findById(req.user._id, function (err, user) {
      if (err) {
        throw err;
      }
      if (!user) {
        return res.status(403).send({success: false, msg: 'Unauthorized.'})
      } else {
        if (req.body.email !== user.email) {
          user.email = req.body.email
        }
        if (req.body.username !== user.username) {
          user.username = req.body.username
        }
        if (req.body.password !== '') {
          user.password = req.body.password
        }
        if (req.body.firstname !== user.firstname) {
          user.firstname = req.body.firstname
        }
        if (req.body.surname !== user.surname) {
          user.surname = req.body.surname
        }

        // save the user
        user.save(function(err) {
          if (err) {
            console.log(err.message)
          }
          res.json({success: true, msg: 'Successful updated user.'});
        });
      }
    })
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

module.exports = router;
