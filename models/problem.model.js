const mongoose = require('mongoose')

const problemSchema = new mongoose.Schema({
  codeHandle: {type:String,required:true,unique:true},
  time: Date,
  rating: Number,
  problemId: String
});

const Problem = mongoose.model('Problem', problemSchema);