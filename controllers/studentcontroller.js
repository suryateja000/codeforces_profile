const Student = require('../models/student.model')
const {Contestcron,ProblemsCron} = require('../utils/cronutils')
const Contest = require('../models/contests.model')
const Problem = require('../models/problem.model')
const addStudent = async (req,res)=>{
      
      try {
        const {name,email,phno,codeHandle}=req.body 

       if(!name||!email||!codeHandle){
        return res.status(400).json({message:"no valid credentials"})
       }
             

       const valid = Student.findOne({codeHandle:codeHandle,email:email}) 
       if(!valid){
        return res.status(401).json({message:"codeHandle already present"})
       }
       
       await Contestcron(codeHandle,365)
       await ProblemsCron(codeHandle,365)

       const latestRatingEntry = await Contest.findOne({ codeHandle: codeHandle})
  .sort({ date: -1 })
  .limit(1);

  const highestRatingEntry = await Contest.findOne({ codeHandle:codeHandle })
  .sort({ newRating: -1 })
  .limit(1);
                  console.log(latestRatingEntry,highestRatingEntry)
       const student = new Student({
            name:name,
            email:email,
            phone:phno,
            codeHandle:codeHandle,
            currRating:latestRatingEntry.newRating,
            maxRating: highestRatingEntry.newRating,
            mail:true
       })
  
       const stud = await student.save() ;
       return res.status(200).json({stud})
    }
    catch(e){
        console.log(e)
        return res.status(500).json({message:"problem with backend idiots you dont worry"})
    }
}

const updateCodeHandle = async (req,res)=>{
         
    
   try {
    const {codeHandle,email,newhandle}=req.body;

          if(!email||!codeHandle){
        return res.status(400).json({message:"no valid credentials"})
       }

       const valid = Student.findOne({codeHandle:codeHandle,email:email}) 
       
console.log(newhandle)

       if(!valid){
        return res.status(401).json({message:"codeHandle already present"})
       }
      await Contest.deleteMany({codeHandle:codeHandle}) 
      await Problem.deleteMany({handle:codeHandle})
      await Contestcron(newhandle,365)
      await ProblemsCron(newhandle,365)

       const latestRatingEntry = await Contest.findOne({ codeHandle: newhandle})
  .sort({ date: -1 })
  .limit(1);

  const highestRatingEntry = await Contest.findOne({ codeHandle:newhandle })
  .sort({ newRating: -1 })
  .limit(1);
  console.log(latestRatingEntry,highestRatingEntry)
       const stud = await Student.findOneAndUpdate({email:email,codeHandle:codeHandle},{$set:{codeHandle:newhandle,currRating:latestRatingEntry.newRating,
            maxRating: highestRatingEntry.newRating}},{updated:true}) 

       return res.status(200).json({stud})}
       catch(e){
        console.log(e) 
        return res.status(500).json({message:"wrong with backend idiots, you dont worry"})
       }

}






module.exports = {addStudent,updateCodeHandle}