const mongoose = require('mongoose')



const contestSchema = new mongoose.Schema({
  codeHandle: { type: String, required: true},  
  contestId: { type: Number, required: true },
  contestName: { type: String, required: true },
  rank: Number,
  oldRating: Number,
  newRating: Number,
  ratingChange: Number,

  date: { type: Date },        
  Date: { type: String },  
  Rating: Number,          
  problemsUnsolved: Number      
});


const Contest = mongoose.model('Contest', contestSchema);
module.exports = Contest