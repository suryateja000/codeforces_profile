const problemSchema = new mongoose.Schema({
  codeHandle: String,
  time: Date,
  rating: Number,
  problemId: String
});

const Problem = mongoose.model('Problem', problemSchema);