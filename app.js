var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var topicRouter = require('./routes/topic');

// extra module start
var session = require('express-session');
// var FileStore = require('session-file-store')(session);
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require("body-parser");
var fs = require('fs');
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })
// extra module end

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('123!@#QWE'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/topic', topicRouter);

// sample use code
app.locals.pretty = true;
app.use('/user', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var options = require('./config/dbinfo');
app.use(session({
  secret: '123!@#QWE',
  resave: false,
  saveUninitialized: true,
  //store: new FileStore()
  store: new MySQLStore(options)
}));
var passport = require ('./config/passport')(app);
var authRouter = require('./routes/auth')(passport);
app.use('/auth', authRouter);

app.get('/upload', (req, res) => {
  res.render('sampleUpload');
});
app.post('/upload', upload.single('userfile'), (req, res) => {
  console.log(req.file);
  res.send('Uploaded: '+req.file.originalname);
});
app.get('/count', (req, res) => {
  if(req.signedCookies.count) {
    var count = parseInt(req.signedCookies.count);
  } else {
    var count = 0;
  }
  count = count + 1;
  res.cookie('count', count, {signed: true});
  res.send('Count : '+  count);
});
var products = {
  1:{title:'The history of web 1'},
  2:{title:'The next web'}
};
app.get('/products', function(req, res){
  var output = '';
  for(var name in products) {
    output += `
      <li>
        <a href="/cart/${name}">${products[name].title}</a>
      </li>`
  }
  res.send(`<h1>Products</h1><ul>${output}</ul><a href="/cart">Cart</a>`);
});
app.get('/cart/:id', function(req, res){
  var id = req.params.id;
  if(req.signedCookies.cart) {
    var cart = req.signedCookies.cart;
  } else {
    var cart = {};
  }
  if(!cart[id]){
    cart[id] = 0;
  }
  cart[id] = parseInt(cart[id]) + 1;
  res.cookie('cart', cart, {signed: true});
  res.redirect('/cart');
});
app.get('/cart', function(req, res){
  var cart = req.signedCookies.cart;
  if(!cart) {
    res.send('Empty!');
  } else {
    var output = '';
    for(var id in cart){
      output += `<li>${products[id].title} (${cart[id]})</li>`;
    }
  }
  res.send(`
    <h1>Cart</h1>
    <ul>${output}</ul>
    <a href="/products">Products List</a>
  `);
});
app.get('/welcome', (req, res) => {
  if(req.user && req.user.displayName) {
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">logout</a>`);
  } else {
    res.send(`
      <h1>Welcome</h1>
      <ul>
        <li><a href="/auth/login">Login</a></li>
        <li><a href="/auth/register">Register</a></li>
      </ul>
      `);
  }
});

var users = [
  {
    authId: 'local:lee',
    username: 'lee',
    password: 'meQHism6KZ7lBcU3kmi6smYd+MKwdJgZr19KLIdSRU6UAktRly25UosDh9YMTHNXnc3rpqDMp5kVG92vYmr1o1eHjitCPOgt0oSPMKI3rqX6XuCHOe/ypwJGHD+UowlxDDd4walnUmIFacnEdo/5tkv5g81PAZkyYZ7wx28PuzY=',
    salt: 'K7/xBDuOBUNTWuv3AIiWW5HoSkF9d0WlGBqqXsbtCQn4JP+2Pa3O1x0PTZX8WsTqAAAROi8TUtEZPn2X69QZnA==',
    displayName: 'LEE'
  }
];
// app.post('/auth/login', (req, res) => {
//   var uname = req.body.username;
//   var pwd = req.body.password;
//   for(var i = 0; i < users.length; i++) {
//     var user = users[i];
//     if(uname == user.username) {
//       return hasher({ password:pwd, salt: user.salt }, (err, pass, salt, hash) => {
//         if(hash == user.password) {
//           req.session.displayName = user.displayName;
//           req.session.save(() => {
//             res.redirect('/welcome');
//           });
//         } else {
//           res.send('who are you? <a href="/auth/login">login</a>');
//         }
//       });
//     }
//     // if(uname == user.username && sha256(pwd+user.salt) == user.password) {
//     //   req.session.displayName = user.displayName;
//     //   return req.session.save(() => {
//     //     res.redirect('/welcome');
//     //   });
//     // }
//   }
//   res.send('who are you? <a href="/auth/login">login</a>');
// });
// test sample code end

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
