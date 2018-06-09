var express = require('express');
var router = express.Router();

var dbmode = '1';
const db = require('../config/database')(dbmode);
router.get('/:id/delete', (req, res, next) => {
  db.select('id', 'title').from('topic')
    .then(topics => {
      var id = req.params.id;
      db('topic').whereRaw('id=?', [id])
      .then(topic => {
        if(topic.length == 0) {
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else {
          res.render('topic/sampleDel', {topics: topics, topic: topic[0], user: req.user});
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
router.post('/:id/delete', (req, res, next) => {
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
router.get(['/:id/edit'], (req, res, next) => {
  db.select('id', 'title').from('topic')
    .then(topics => {
      var id = req.params.id;
      if(id) {
        db('topic').whereRaw('id=?', [id])
          .then(topic => { res.render('topic/sampleEdit', {topics: topics, topic:topic[0], user: req.user}); })
          .catch(err => {
            console.log(err);
            res.status(500).send('Internal Server Error');
          });
      } else {
        res.render('topic/sampleList', {topics: topics, user: req.user});
      }
    })
    .catch(err => {
      console.log("There is no id.");
      res.status(500).send('Internal Server Error');
    });
});
router.post(['/:id/edit'], (req, res, next) => {
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
router.get('/add', (req, res, next) => {
  db.select('id', 'title').from('topic')
    .then(rows => { res.render('topic/sampleAdd', {topics: rows, user: req.user}); })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});
router.post('/add', (req, res, next) => {
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
router.get(['/', '/:id'], (req, res, next) => {
  db.select('id', 'title').from('topic')
    .then( rows => {
      var id = req.params.id;
      if(id) {
        db('topic').whereRaw('id=?', [id])
          .then(result => {
            res.render('topic/sampleList', {topics: rows, topic: result[0], user: req.user});
          })
          .catch(err => {
            console.log(err);
            res.status(500).send('Internal Server Error');
          });
      } else {
        res.render('topic/sampleList', {topics: rows, user: req.user});
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});

module.exports = router;
