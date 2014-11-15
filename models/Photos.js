var mongoose = require('mongoose')

var PhotoSchema = new mongoose.Schema({
  title: String,
  posted: Date.now,
  link: String,
  upvotes: {type: Number, default: 0});

