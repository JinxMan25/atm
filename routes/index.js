var express = require('express');
var im = require('imagemagick');
var crypto = require('crypto')
var router = express.Router();
var mongoose = require('mongoose');
var Photo = mongoose.model('Photo');
var fs = require('fs-extra');
var formidable = require('formidable');
var levenshtein = require('levenshtein');

/* GET home page. */
router.get('/atm/get', function(req, res, next) {

  var limit = req.query.limit || 10;
  var maxDistance = req.query.distance || 100;

  maxDistance =  maxDistance/6371;


  if (req.query.latitude){
    console.log("here");
    var coords = [];
    coords[0] = req.query.longitude;
    coords[1] = req.query.latitude;

    var query = Photo.find({
      'coordinates': { 
        $near: coords,
        $maxDistance: maxDistance
      }
    }).limit(limit);

    query.exec(function(err,photo){
      if (err) { 
        console.log("err");
        return next(err); 
      }
      if (!photo){ 
        console.log("can't find photo");
        return next(new Error ("Can't find photo")); 
      }
      res.json(photo);
    });
  } else {
    Photo.find(function(err, photos){
      if (err) { return next(err); }
      res.json(photos);
    });
  }
});

/*router.get('/search', function(req,res,next){
  Photo.find(function(err, photos){
    if (err){ 
      return next(err);
    }
    photos.forEach(function(photo){
      var l = new Levenshtein(req.query.title, photo.title);
    });

  });
  res.json(
});*/

router.get('/deleteall', function(req,res,next){
  Photo.find(function(err, photos){
    photos.forEach(function(photo){
      photo.remove();
      fs.unlink('./' + photo.img_url, function(err){
        if (err){
          return next(err);
        }
        console.log("successfully deleted");
      });
    });
    res.json("removed all");
  });
});

router.get('/', function(req,res,next){
  res.render('index');
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
  Photo.findOne({uniq_token:req.params.uniq_token}, function(err, photo){
    if (photo.email == req.body.email){
      photo.remove().exec();
      res.json("removed");
    }
  });
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

router.put('/get/:uniq_token/downvote', function(req,res, next){
  //grab first from array, otherwise method won't work
  req.photo[0].downvote(function(err, photo){
    if (err) { return next(err); }

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
