var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// extra module start
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
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// sample use code
app.use('/user', express.static('uploads'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// test sample code start
app.get('/topic/new', (req, res) => {
  fs.readdir('data', (err, files) => {
    if(err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    res.render('sampleAdd', {topics: files});
  });
});
app.get(['/topic', '/topic/:id'], (req, res) => {
  fs.readdir('data', (err, files) => {
    if(err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    var id = req.params.id;
    if(id) {
      fs.readFile('data/'+id, 'utf8', (err, data) => {
        if(err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
        }
        res.render('sampleList', {topics: files, title: id, description: data});
      });
    }
    else {
      res.render('sampleList', {topics: files, title: 'Welcome', description: 'JS'});
    }
  });
});
app.post('/topic', (req, res) => {
  var title = req.body.title;
  var description = req.body.description;
  fs.writeFile('data/'+title, description, (err) => {
    if(err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    res.redirect('/topic/'+title);
  });
});
app.get('/upload', (req, res) => {
  res.render('sampleUpload');
});
app.post('/upload', upload.single('userfile'), (req, res) => {
  console.log(req.file);
  res.send('Uploaded: '+req.file.originalname);
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
