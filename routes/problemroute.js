const express = require('express')
const Problem = require('../models/problem.model')
const ProblemRouter= express.Router()
const {addStudent} = require('../controllers/studentcontroller')



const {
    ProblemsSloved,
    Submissions,
    DifficultProblem,getProblems
} = require('../controllers/problemcontroller');



ProblemRouter.post('/:handle/problems-solved', ProblemsSloved);
ProblemRouter.get('/data/:handle',getProblems)



module.exports = ProblemRouter;
