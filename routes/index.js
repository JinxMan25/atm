var express = require('express');
var crypto = require('crypto')
var router = express.Router();
var mongoose = require('mongoose');
var Photo = mongoose.model('Photo');
var fs = require('fs-extra');
var multer = require('multer');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.query.latitude && req.query.longtitude){
    var query = Photo.find({'latitude':{ $gte: req.query.latitude-3, $lte: req.query.latitude+3}, 'longtitude': { $gte: req.query.longtitude-3, $lte: req.query.longtitude+3 }});
    query.exec(function(err,photo){
      if (err) { return next(err); }
      if (!photo){ return next(new Error ("Can't find photo")); }
      res.json(photo);
    });
  } else {
    Photo.find(function(err, photos){
      if (err) { return next(err); }
      res.json(photos);
    });
  }
});

router.get('/deleteall', function(req,res,next){
  Photo.find(function(err, photos){
    photos.forEach(function(photo){
      photo.remove();
    });
    res.json("removed all");
  });
});

router.get('/angulartest', function(req,res,next){
  res.render('index');
});

router.get('/test', function(req,res,next){
  res.render('test');
});

router.param('uniq_token', function(req, res, next, uniq_token){
  var query = Photo.findByToken(uniq_token);

  query.exec(function(err, photo){
    if (err) { return next(err); }
    if (!photo) {
      return next(new Error ("cant find photo"));
    }
    req.photo = photo;
    return next();
    });
});

router.delete('/get/:uniq_token/delete', function(req,res){
  Photo.find({uniq_token:req.params.uniq_token}).remove().exec();
  res.json("removed");
});

router.get('/get/:uniq_token/', function(req,res){
  res.json(req.photo);
});

router.put('/get/:uniq_token/upvote', function(req,res, next){
  //grab first from array, otherwise method won't work
  req.photo[0].upvote(function(err, photo){
    if (err) { return next(err); }

    res.json(photo);
  });
});

router.post('/create', function(req, res, next){
  if (!req.body.files.file.path){
    return next(new Error ("The file you chose is not of an image property"));
  }
  var token = randomValueBase64(5);
  var data = req.body;
  console.log(req.body.title.length);
  if (req.body.title.length >= 5) {
    return next(new Error ("Keep below 30 characters for the title!"));
  } else if (req.body.description.length > 160) {
    return next(new Error ("Keep below 160 characters for the description!"));
  }

  var filePath = req.files.file.path;

  data['uniq_token'] = token;
  data['img_url'] = '/' + filePath;


  var photo = new Photo(data)
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
