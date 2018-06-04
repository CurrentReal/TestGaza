module.exports = function(app) {
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var passport = require('passport')
  var LocalStrategy = require('passport-local').Strategy;
  var FacebookStrategy = require('passport-facebook').Strategy;
  var dbmode = '1';
  const db = require('./database')(dbmode);

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, done) {
    // console.log('serializeUser', user);
    done(null, user.authId);
  });
  passport.deserializeUser(function(id, done) {
    db('users').where({authId: id})
      .then(results => {
        // console.log('deserializeUser', id);
        done(null, results[0]);
      })
      .catch(err => {
        console.log(err);
        return done('There is no user.');
      });
  });

  passport.use(new LocalStrategy(
    function(username, password, done) {
      var uname = username;
      var pwd = password;

      db('users').where({authId: ['local:'+uname]})
      //db('users').whereRaw('authId=?', ['local:'+uname])
        .then(result => {
          var user = result[0];
          if(user) {
          return hasher({ password:pwd, salt: user.salt }, (err, pass, salt, hash) => {
              if(hash === user.password) {
                // console.log('LocalStrategy', user);
                done(null, user);
              } else {
                done(null, false);
              }
            });
          } else {
            done(null, false);
          }
        })
        .catch(err => {
          console.log(err);
          return done('There is no user.');
        });
    }
  ));
  passport.use(new FacebookStrategy({
      clientID: 'FACEBOOK_APP_ID',
      clientSecret: 'FACEBOOK_APP_SECRET',
      callbackURL: "/auth/facebook/callback",
      profileFields: ['id', 'email', 'gender', 'link', 'locale',
      'name', 'timezone', 'updated_time', 'verified', 'displayName']
    },
    function(accessToken, refreshToken, profile, done) {
      var authId = 'facebook:'+profile.id;
      db('users').whereRaw('authId=?', [authId])
        .then(result => {
          if(result.length > 0) {
            done(null, result[0]);
          } else {
            var newuser = {
              'authId': authId,
              'displayName': profile.displayName,
              'email': profile.emails[0].value
            };
            db('users').insert()
              .then(row => {
                done(null, newuser);
              })
              .catch(err => {
                console.log(err);
                done('Error');
              });
          }
        })
        .catch(err => {
          console.log(err);
          return done('There is no user.');
        });

    //   for(var i = 0; i < users.length; i++) {
    //     var user = users[i];
    //     if(user.authId == authId) {
    //       return done(null, user);
    //     }
    //   }
    //   var newuser = {
    //     'authId': authId,
    //     'displayName': profile.displayName,
    //     'email': profile.emails[0].value
    //   };
    //   users.push(newuser);
    //   done(null, newuser);
    }
  ));

  return passport;
}
