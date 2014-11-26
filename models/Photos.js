var mongoose = require('mongoose')
/*var thumbnailPluginLib = require('mongoose-thumbnail')
var thumbnailPlugin = thumbnailPluginLib.thumnailPlugin;
var make_upload_to_model = thumbnailPluginLib.make_upload_to_model;

var uploads_base = path.join(__dirname, "uploads");
var uploads = path.join(uploads_base, "u");
*/
var PhotoSchema = new mongoose.Schema({
  title: String,
  posted: { type: Date, default: Date.now },
  expire_in: { type: Date },
  uniq_token: { type: String, unique: true, required: true, dropDups: true},
  address: String,
  longtitude: Number,
  latitude: Number,
  img_url: String,
  upvoted: [{type: String}],
  upvotes: { type: Number, default: 0 }});

  PhotoSchema.static('findByDegrees', function(longitude,latitude,callback){
    return this.find({ longitude: { $gte: longitude-0.05, $lte: longitude }, latitude: { $gte: latitude-0.05, $lte: latitude } }, callback);
  });

  PhotoSchema.static('findByToken', function(token, callback){
    return this.find({ uniq_token: token }, callback);
  });

  PhotoSchema.methods.upvote = function upvote(cb){
    this.upvotes += 1;
    this.save(cb);
  };
/*PhotoSchema.plugin(thumnailPlugin, {
  name: "photo",
  format: "png",
  size: "80",
  inline: false,
  save: true,
  upload_to: make_upload_to_model(uploads, 'photos'),
      relative_to: uploads_base
});*/
mongoose.model("Photo", PhotoSchema);


