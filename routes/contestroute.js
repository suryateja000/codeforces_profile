const express = require('express')
const Contest = require('../models/contests.model')
const ContestRouter= express.Router()
const {ContestHistory,contestData} = require('../controllers/contestcontroller')



ContestRouter.post('/ContestHistory/:handle',ContestHistory) 
ContestRouter.get('/contestsdata/:handle',contestData)



module.exports= ContestRouter