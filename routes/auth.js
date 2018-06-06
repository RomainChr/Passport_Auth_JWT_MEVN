const mongoose = require('mongoose')
const passport = require('passport')
const settings = require('../config/settings')
require('../config/passport')(passport)
const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const User = require("../models/user")

router.post('/register', function(req, res) {

  let newUser = new User({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    firstname: req.body.firstname,
    surname: req.body.surname
  })

  // save the user
  newUser.save(function(err) {
    if (err) {
      console.log(err.message)

      // email already exist
      if (err.message.includes('email')) {
        return res.json({success: false, msg: 'email already exists'})
      }

      // username already exist
      if (err.message.includes('user')) {
        return res.json({success: false, msg: 'username already exists'})
      }
    }
    res.json({success: true, msg: 'Successful created new user.'})
  })
})


router.post('/login', function (req, res) {

  //check username or email
  User.findOne( {$or:[{ username: req.body.username }, { email: req.body.username }]}, function (err, user) {
    if (err) {
      throw err
    }

    // user not find
    if (user === null) {
      return res.json({success: false, msg: 'email or username not found'})
    }

    user.comparePassword(req.body.password, function (err, isMatch) {
      if (isMatch && !err) {
        let token = jwt.sign(user.toJSON(), settings.secret)
        return res.json({success: true, token: 'JWT ' + token})
      }

      return res.json({success: false, msg: 'wrong password'})
    })
  })
})


router.get('/profile/:id', passport.authenticate('jwt', { session: false }), function (req, res) {

  if( !getToken(req.headers) ) {
    return res.status(401).send({success: false, msg: 'Unauthorized.'})
  }

  let userObj = Object.assign({}, req.user._doc)
  delete userObj['password']

  res.json({user: userObj})
})


router.post('/profile/:id/comparepassword', passport.authenticate('jwt', { session: false }), function (req, res) {

  if ( !getToken(req.headers) ) {
    return res.status(401).send({success: false, msg: 'Unauthorized.'})
  }

  User.findOne({ username: req.user.username }, function (err, user) {
    if (err) {
      throw err
    }

    // user not find
    if (user === null) {
      return res.status(401).send({success: false, msg: 'Unauthorized.'})
    }

    user.comparePassword(req.body.oldPassword, function (err, isMatch) {
      if (isMatch && !err) {
        return res.json({success: true, msg: 'correct password'})
      }

      return res.json({success: false, msg: 'wrong password'})
    })
  })
})


router.put('/profile/:id/edit', passport.authenticate('jwt', { session: false }), function (req, res) {

  if ( !getToken(req.headers) ) {
    return res.status(401).send({success: false, msg: 'Unauthorized.'})
  }

  User.findById(req.user._id, function (err, user) {
    if (err) {
      throw err
    }

    // user not find
    if (user === null) {
      return res.status(401).send({success: false, msg: 'Unauthorized.'})
    }

    // check which field edited
    if (req.body.email !== user.email) {
      user.email = req.body.email
    }
    if (req.body.username !== user.username) {
      user.username = req.body.username
    }
     if (req.body.password !== '' && req.body.password !== undefined) {
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

        // email already exist
        if (err.message.includes('email')) {
          return res.json({success: false, msg: 'email already exists'})
        }

        // username already exist
        if (err.message.includes('user')) {
          return res.json({success: false, msg: 'username already exists'})
        }
      }
      return res.json({success: true, msg: 'Successful updated user.'})
    })
  })
})

getToken = function (headers) {
  if (headers && headers.authorization) {
    let parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports = router
