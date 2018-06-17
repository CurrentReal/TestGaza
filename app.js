var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// extra module start
var session = require('express-session');
var FileStore = require('session-file-store')(session);
// var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require("body-parser");
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
var topicRouter = require('./routes/topic');
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

// var options = require('./config/dbinfo');
app.use(session({
  secret: '123!@#QWE',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
  // store: new MySQLStore(options)
}));
// var passport = require ('./config/passport')(app);
var authRouter = require('./routes/auth')();
//var topicRouter = require('./routes/topic');

app.use('/auth', authRouter);
//app.use('/topic', topicRouter);

app.get('/upload', (req, res) => {
  res.render('sampleUpload');
});
app.post('/upload', upload.single('userfile'), (req, res) => {
  console.log(req.file);
  res.send('Uploaded: '+req.file.originalname);
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
