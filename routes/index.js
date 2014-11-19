var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Photo = mongoose.model('Photo');

/* GET home page. */
router.get('/', function(req, res, next) {
  Photo.find(function(err, photos){
    if (err) { return next(err); }

    res.json(photos);
  });
});

module.exports = router;
