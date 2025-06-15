const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {type:String,required:true},
  email:{type:String,required:true},
  phone: String,
  codeHandle: {type:String,required:true,unique:true},
  currRating: Number,
  maxRating: Number
});

const Student = mongoose.model('Student', studentSchema);