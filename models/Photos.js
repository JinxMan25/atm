var mongoose = require('mongoose')
var thumbnailPluginLib = require('mongoose-thumnail')
var thumbnailPlugin = thumbnailPluginLib.thumnailPlugin;
var make_upload_to_model = thumbnailPluginLib.make_upload_to_model;

var uploads_base = path.join(__dirname, "uploads");
var uploads = path.join(uploads_base, "u");

var PhotoSchema = new mongoose.Schema({
  title: String,
  posted: Date.now,
  link: String,
  upvotes: {type: Number, default: 0});

/*PhotoSchema.plugin(thumnailPlugin, {
  name: "photo",
  format: "png",
  size: "80",
  inline: false,
  save: true,
  upload_to: make_upload_to_model(uploads, 'photos'),
      relative_to: uploads_base
});*/
var SampleModel = db.model("Photo", PhotoSchema);

