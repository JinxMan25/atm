var express = require('express');
var crypto = require('crypto')
var router = express.Router();
var mongoose = require('mongoose');
var Photo = mongoose.model('Photo');
var fs = require('fs-extra');
var formidable = require('formidable');

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
  var data = {};
  var token = randomValueBase64(5);
  var form = new formidable.IncomingForm();

  form.parse(req, function(err,fields, files){
    if (err){
      return next(err);
    } else {
      data = fields;
    }
  });

  form.on("progress", function(bytesRecieved, bytesExpected){
  });

  form.on('end', function(fields, files){
    if (this.openedFiles.length === 0){
      return next( new Error ("You forgot the image!"));
    } 
    if (this.openedFiles[0].type != 'image/png'){
      return next (new Error ("You have to choose an image"));
    }
    var tmp_loc = this.openedFiles[0].path;
    var file_name = this.openedFiles[0].name;
    var new_loc = './static/images/';
    data['img_url'] = 'static/images/' + file_name;
    data['uniq_token'] = token;

    fs.copy(tmp_loc, new_loc + file_name, function(err){
      if (err){
        console.log(err);
      } else {
        console.log(file_name + ' uploaded to ' + new_loc);
      }
      console.log(data);
    });


    var photo = new Photo(data)
    photo.save(function(err,post){
      if(err){
        console.log("in the error");
        return next(err);
      }
      res.json(photo);
    });
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
