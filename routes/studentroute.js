const express = require('express')
const Student = require('../models/student.model')
const StudentRouter= express.Router()
const {addStudent} = require('../controllers/studentcontroller')

StudentRouter.post('/addStudent',addStudent) 



module.exports= StudentRouter