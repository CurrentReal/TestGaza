module.exports = function(passport) {
  var express = require('express');
  var router = express.Router();
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var dbmode = '1';
  const db = require('../config/database')(dbmode);
  router.post('/register', (req, res) => {
    hasher({ password: req.body.password }, (err, pass, salt, hash) => {
      var user = {
        authId: 'local:'+req.body.username,
        username: req.body.username,
        password: hash,
        salt: salt,
        displayName: req.body.displayName
      };
      db('users')
        .insert(user)
        .then(result => {
          req.login(user, function(err) {
            req.session.save(() => {
              res.redirect('/welcome');
            });
          });
        })
        .catch(err => {
          console.log(err);
          res.status(500).send('Internal Server Error');
        });
    });
  });
  router.get('/register', (req, res) => {
    db.select('id', 'title').from('topic')
      .then(rows => {
        res.render('auth/sampleRegist', {topics: rows});
      });
  });
  router.post('/login',
    passport.authenticate('local', { successRedirect: '/topic',
                                     failureRedirect: '/auth/login',
                                     failureFlash: false })
  );
  router.get('/login', (req, res) => {
    db.select('id', 'title').from('topic')
      .then(rows => {
        res.render('auth/sampleLogin', {topics: rows});
      });
  });

  router.get('/logout', (req, res) => {
    req.logout();
    req.session.save(() => {
      res.redirect('/topic');
    });
  });

  router.get('/facebook',
    passport.authenticate('facebook', { scope: 'email'})
  );
  router.get('/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/topic',
                                        failureRedirect: '/auth/login' }));

  return router;
}
