module.exports = function() {
  var express = require('express');
  var router = express.Router();
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var dbmode = '2';
  const db = require('../config/database')(dbmode);
  router.post('/register', function(req, res) {
    hasher({ password: req.body.password }, function(err, pass, salt, hash) {
      var user = {
        authId: 'local:'+req.body.username,
        username: req.body.username,
        password: hash,
        salt: salt,
        displayName: req.body.displayName
      };
      res.send(user);
      // db('users')
      //   .insert(user)
      //   .then(result => {
      //     req.login(user, function(err) {
      //       req.session.save(function() {
      //         res.redirect('/welcome');
      //       });
      //     });
      //   })
      //   .catch(err => {
      //     console.log(err);
      //     res.status(500).send('Internal Server Error');
      //   });
    });
  });
  router.get('/register', function(req, res) {
    // db.select('id', 'title').from('topic')
    //   .then(rows => {
    //     res.render('auth/sampleRegist', {topics: rows});
    //   });
      res.render('auth/sampleRegist');
  });
  // router.post('/login',
  //   passport.authenticate('local', { successRedirect: '/topic',
  //                                    failureRedirect: '/auth/login',
  //                                    failureFlash: false })
  // );
  router.get('/login', function(req, res) {
    // db.select('id', 'title').from('topic')
    //   .then(rows => {
    //     res.render('auth/sampleLogin', {topics: rows});
    //   });
      res.render('auth/sampleLogin');
  });

  router.get('/logout', function(req, res) {
    req.logout();
    req.session.save(function() {
      res.redirect('/auth/login');
    });
  });

  // router.get('/facebook',
  //   passport.authenticate('facebook', { scope: 'email'})
  // );
  // router.get('/facebook/callback',
  //   passport.authenticate('facebook', { successRedirect: '/topic',
  //                                       failureRedirect: '/auth/login' }));

  return router;
}
