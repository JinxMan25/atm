var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var fs = require('fs-extra');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var crypto = require('crypto')


var users = require('./routes/users');

var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/test');
require('./models/Photos');

var Photo = mongoose.model('Photo');

var routes = require('./routes/index');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.locals.delimiters = '<% %>';

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static/images',express.static(path.join(__dirname, 'static/images')));

app.use('/', routes);
app.use('/users', users);

var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
  socket.emit("connected", "You are connected");
  socket.on("hello", function(){
    console.log("emit from client side recieved");
  });
  console.log("lkajsdf");
});

http.listen(3000,function(socket){
  console.log("connected");
});


function randomValueBase64 (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')   // convert to base64 format
        .slice(0, len)        // return required number of characters
        .replace(/\+/g, '0')  // replace '+' with '0'
        .replace(/\//g, '0'); // replace '/' with '0'
}


app.post('/create', function(req,res){

  var data = {};
  var token = randomValueBase64(5);
  var form = new formidable.IncomingForm();

  form.parse(req, function(err,fields, files){
    if (err){
      return next(err);
    } else {
      data = fields;
      var coords = [];
      coords[0] = Number(fields.longitude);
      coords[1] = Number(fields.latitude);
      data['coordinates'] = coords;
      delete data['longitude'];
      delete data['latitude'];
      console.log(data);
    }
  });

  form.on('progress', function(bytesRecieved, bytesExpected){
      io.sockets.emit("uploadProgress", ((bytesRecieved*100)/ bytesExpected));
      console.log((bytesRecieved*100/bytesExpected));
  });

  form.on('end', function(fields, files){
    if (this.openedFiles.length === 0){
      return next( new Error ("You forgot the image!"));
    } 
    console.log(this.openedFiles[0].type);

    var filetype = this.openedFiles[0].type;
    console.log(filetype.match(/image/)[0]);

    if (!filetype.match(/image/)){
      return next (new Error ("You have to choose an image"));
    }
    var date = Date.now();
    var tmp_loc = this.openedFiles[0].path;
    var file_name = this.openedFiles[0].name;
    var new_loc = './static/images/';
    data['img_url'] = 'static/images/' + date + '-' + file_name;
    data['uniq_token'] = token;

    fs.copy(tmp_loc, new_loc + date + '-' + file_name, function(err){
      if (err){
        console.log(err);
      } else {
        console.log(file_name + ' uploaded to ' + new_loc);
      }
    });

    var self = this;
    var photo = new Photo(data)
    photo.save(function(err,post){
      if(err){
        console.log("in the error");
        console.log(err);
        res.send(500);
      }
      res.json(photo);
    });
  });

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: err
    });
    return;
});
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
