const express = require('express')
const Contest = require('../models/contest.model')
const ContestRouter= express.Router()
const {ContestHistory} = require('../controllers/contestcontroller')
const {RatingHistory} = require('../controllers/contestcontroller')
const {ContestRatingGraph} = require('../controllers/contestcontroller')
const {ContestDetails} = require('../controllers/contestcontroller')


StudentRouter.post('/ContestHistory',ContestHistory) 
StudentRouter.post('/RatingHistory',RatingHistory) 
StudentRouter.post('/ContestRatingGraph',ContestRatingGraph) 
StudentRouter.post('/ContestDetails',ContestDetails) 



module.exports= StudentRouter