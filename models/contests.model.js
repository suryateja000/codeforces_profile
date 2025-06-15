const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  codeHandle: String,
  time: Date,
  rating: Number,
  rank: Number,
  totalQ: Number,
  noQ: Number
});

const Contest = mongoose.model('Contest', contestSchema);