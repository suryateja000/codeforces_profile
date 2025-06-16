const mongoose = require('mongoose')



const submissionHeatMapSchema = new mongoose.Schema({
    Sunday: { type: Map, of: Number, default: {} },
    Monday: { type: Map, of: Number, default: {} },
    Tuesday: { type: Map, of: Number, default: {} },
    Wednesday: { type: Map, of: Number, default: {} },
    Thursday: { type: Map, of: Number, default: {} },
    Friday: { type: Map, of: Number, default: {} },
    Saturday: { type: Map, of: Number, default: {} },
});

const problemSchema = new mongoose.Schema({
    name: String,
    contestId: Number,
    index: String,
    rating: Number,
    tags: [String],
    submissionTime: Date
});

const ratingBucketSchema = new mongoose.Schema({
    rating: String,
    count: Number
});


const ProblemSchema= new mongoose.Schema({
    handle: { type: String, required: true },
    days: { type: Number, required: true },
    mostDifficultProblemSolved: { type: String, default: null },
    mostDifficultProblemDetails: { type: problemSchema, default: null },
    totalProblemsSolved: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    averageProblemsPerDay: { type: Number, default: 0 },
    problemsPerRatingBucket: { type: Map, of: Number, default: {} },
    ratingDistribution: { type: [ratingBucketSchema], default: [] },
    submissionHeatMap: { type: submissionHeatMapSchema, default: () => ({}) },
}, { timestamps: true });




const Problem = mongoose.model('Problem', ProblemSchema);

module.exports = Problem