const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../config/passport')(passport);

/* GET home page. */
router.get('/', passport.authenticate('jwt', { session: false}), function(req, res) {

  if ( !getToken(req.headers) ) {
    return res.status(401).send({success: false, msg: 'Unauthorized.'})
  }

  res.json({user: {username: req.user.username, userId: req.user.id}})

});

module.exports = router;
