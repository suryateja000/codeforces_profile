const express = require('express')
const Student = require('../models/student.model')
const Contest = require('../models/contests.model')
const StudentRouter= express.Router()
const {addStudent,updateCodeHandle} = require('../controllers/studentcontroller')

StudentRouter.post('/addStudent',addStudent) 

StudentRouter.put('/updateHandle',updateCodeHandle)

StudentRouter.post('/mailupdate',async (req,res)=>{
       
       try   {
         const {value,handle} = req.body 

           if(!(value==0 || value==1)){
                 return res.status(400).json({message:"no correct value"})
           }
           else{

                   if(value==0){
                       await Student.findOneAndUpdate({codeHandlehandle:handle},{$set:{mail:false}})
                   }
                   else{
                    await Student.findOneAndUpdate({codeHandlehandle:handle},{$set:{mail:true}})
                   }

                return res.status(200).json({message:"success dont cry inside"})
           }
        }
        catch(e){

            return res.status(400).json({message:"error ok error go away sometime and take rest"})
        }
})
module.exports= StudentRouter