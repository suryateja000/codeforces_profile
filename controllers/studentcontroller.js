const Student = require('../models/student.model')

const addStudent = async (req,res)=>{
      
      try {
        const {name,email,phno,codeHandle}=req.body 

       if(!name||!email||!codechefhandle){
        return res.status(400).json({message:"no valid credentials"})
       }
       const valid = Student.findOne({codeHandle:codeHandle}) 
       if(!valid){
        return res.status(401).json({message:"codeHandle already present"})
       }

       const student = new Student({
            name:name,
            email:email,
            phone:phno,
            codeHandle:codeHandle
       })

       const stud = await student.save() ;
       return res.status(200).json({stud})
    }
    catch(e){
        console.log(e)
    }
}



module.exports = {addStudent}