var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// extra module start
var session = require('express-session');
//var FileStore = require('session-file-store')(session);
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
const db = require('./config/database');
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

// sample use code
app.use('/user', express.static('uploads'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var options = require('./config/dbinfo.js');
app.use(session({
  secret: '123!@#QWE',
  resave: false,
  saveUninitialized: true,
  //store: new FileStore()
  store: new MySQLStore(options)
}));
app.locals.pretty = true;

// test sample code start
app.get('/topic/add', (req, res) => {
  db.select('id', 'title').from('topic')
    .then(topics => { res.render('sampleAdd', {topics: topics}); })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});
app.post('/topic/add', (req, res) => {
  var title = req.body.title;
  var description = req.body.description;
  var author = req.body.author;
  db('topic')
    .insert({title: title, description: description, author: author})
    .then(result => { res.redirect('/topic/'+result); })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});
app.get(['/topic', '/topic/:id'], (req, res) => {
  db.select('id', 'title').from('topic')
    .then(topics => {
      var id = req.params.id;
      if(id) {
        db('topic').whereRaw('id=?', [id])
          .then(topic => { res.render('sampleList', {topics: topics, topic:topic[0]}); })
          .catch(err => {
            console.log(err);
            res.status(500).send('Internal Server Error');
          });
      } else {
        res.render('sampleList', {topics: topics});
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});
app.get(['/topic/:id/edit'], (req, res) => {
  db.select('id', 'title').from('topic')
    .then(topics => {
      var id = req.params.id;
      if(id) {
        db('topic').whereRaw('id=?', [id])
          .then(topic => { res.render('sampleEdit', {topics: topics, topic:topic[0]}); })
          .catch(err => {
            console.log(err);
            res.status(500).send('Internal Server Error');
          });
      } else {
        res.render('sampleList', {topics: topics});
      }
    })
    .catch(err => {
      console.log("There is no id.");
      res.status(500).send('Internal Server Error');
    });
});
app.post(['/topic/:id/edit'], (req, res) => {
  var id = req.params.id;
  var title = req.body.title;
  var description = req.body.description;
  var author = req.body.author;
  db('topic')
    .where({id: id})
    .update({title: title, description: description, author: author})
    .then(result => { res.redirect('/topic/'+id); })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});
app.get('/topic/:id/delete', (req, res) => {
  db.select('id', 'title').from('topic')
    .then(topics => {
      var id = req.params.id;
      db('topic').whereRaw('id=?', [id])
      .then(topic => {
        if(topic.length == 0) {
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else {
          res.render('sampleDel', {topics: topics, topic: topic[0]});
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).send('Internal Server Error');
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});
app.post('/topic/:id/delete', (req, res) => {
  var id = req.params.id;
  db('topic')
    .whereRaw('id=?', [id])
    .del()
    .then(result => { res.redirect('/topic'); })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});
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
app.post('/auth/login', (req, res) => {
  var user = {
    username: 'lee',
    password: '111',
    displayName: 'Lee'
  };
  var uname = req.body.username;
  var pwd = req.body.password;
  if(uname = user.username && pwd == user.password) {
    req.session.displayName = user.displayName;
    req.session.save(() => {
      res.redirect('/welcome');
    });
  } else {
    res.send('who are you? <a href="/auth/login">login</a>');
  }
});
app.get('/welcome', (req, res) => {
  if(req.session.displayName) {
    res.send(`
      <h1>Hello, ${req.session.displayName}</h1>
      <a href="/auth/logout">logout</a>`);
  } else {
    res.send(`
      <h1>Welcome</h1>
      <a href="/auth/login">Login</a>`);
  }
});
app.get('/auth/login', (req, res) => {
  var output = `
  <h1>Login</h1>
  <form action="/auth/login" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="text" name="password" placeholder="password">
    </P>
    <p>
      <input type="submit">
    </p>
  </form>`;
  res.send(output);
});
app.get('/auth/logout', (req, res) => {
  delete req.session.displayName;
  req.session.save(() => {
    res.redirect('/welcome');
  });
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
