const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {type:String,required:true},
  email:{type:String,required:true},
  phone: String,
  codeHandle: {type:String,required:true,unique:true},
  currRating: Number,
  maxRating: Number,
  mail:{type:Boolean,default:true},
  mailsent:Date
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student