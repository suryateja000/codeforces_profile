const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  codeHandle: String,
  currRating: Number,
  maxRating: Number
});

const Student = mongoose.model('Student', studentSchema);