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

router.post('/create', function(req, res, next){
  var photo = new Photo(req.body)
  var token = randomValueBase64(5);
  photo.push({'uniq_token': token});
  photo.save(function(err,post){
    if(err){
      return next(err);
    }
    res.json(photo);
  });
});

function randomValueBase64 (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')   // convert to base64 format
        .slice(0, len)        // return required number of characters
        .replace(/\+/g, '0')  // replace '+' with '0'
        .replace(/\//g, '0'); // replace '/' with '0'
}

module.exports = router;
