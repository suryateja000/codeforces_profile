const { CodeforcesAPI, CodeforcesDataCollector } = require('../services/codeforcesService');

const api = new CodeforcesAPI();
const collector = new CodeforcesDataCollector();
const {filterContestsByDays,processContestHistory,createSubmissionHeatMap,filterSubmissionsByDays,processProblemSolvingData,createRatingGraph,getContestProblemsUnsolved} = require('../utils/codeforceutils')
const nodemailer = require('nodemailer');
const Problem = require('../models/problem.model') 
const Student = require('../models/student.model')
const Contest = require('../models/contests.model')






function combineContestDataByName({contests, ratingGraph}) {
  const graphMap = new Map();

  // Create a map from contestName to { date, rating }
  for (const entry of ratingGraph) {
    graphMap.set(entry.contestName, { date: entry.date, rating: entry.rating });
  }

  // Combine date and rating into contests
  const combined = contests.map(contest => {
    const match = graphMap.get(contest.contestName);
    if (match) {
      return {
        ...contest,
        Date: match.date,
        Rating: match.rating
      };
    } else {
      return contest; // If no match found, leave it unchanged
    }
  });

  return combined;
}





const Contestcron = async (handle,days) => {
    try {
       
        
        if (!handle || !handle.trim()) {
            return { 
                success: false,
                error: 'Please provide a valid handle' 
            };
        }

        const userData = await collector.collectAllUserData(handle.trim());
        const contestHistory = await processContestHistory(userData, days);

        const temp= combineContestDataByName(contestHistory) 
        
        function saveAllContests(temp, codeHandle) {  

  const savePromises = temp.map(contest => {
    const newContest = new Contest({
      codeHandle,
      contestId: contest.contestId,
      contestName: contest.contestName,
      rank: contest.rank,
      oldRating: contest.oldRating,
      newRating: contest.newRating,
      ratingChange: contest.ratingChange,
      date: contest.date,
      Date: contest.Date,
      Rating: contest.Rating,
      problemsUnsolved: contest.problemsUnsolved || 0
    });

    return newContest.save();
  });

  
  Promise.allSettled(savePromises)
    .then(results => {
      console.log('All contests processed:', results.length);
      const errors = results.filter(r => r.status === 'rejected');
      if (errors.length) {
        console.error('Some contests failed to save:', errors);
      }
    });
}
        saveAllContests(temp,handle)

        return {
            success: true,
            data: contestHistory,
            filter: { days }
        }

    } catch (error) {
        console.log(error)
        return error
    }
};



const ProblemsCron = async (handle,days) => {
    try {
       

        if (!handle || !handle.trim()) {
            return {success:false}
        }

        const userData = await collector.collectAllUserData(handle.trim());
        const problemSolvingData = processProblemSolvingData(userData, days);
        
        
        const existing = await Problem.findOne({ handle});

        const problemPayload = {
            handle,
            days,
            mostDifficultProblemSolved: problemSolvingData.mostDifficultProblemSolved || null,
            mostDifficultProblemDetails: problemSolvingData.mostDifficultProblemDetails || null,
            totalProblemsSolved: problemSolvingData.totalProblemsSolved || 0,
            totalSubmissions: problemSolvingData.totalSubmissions || 0,
            averageRating: problemSolvingData.averageRating || 0,
            averageProblemsPerDay: problemSolvingData.averageProblemsPerDay || 0,
            problemsPerRatingBucket: problemSolvingData.problemsPerRatingBucket || {},
            ratingDistribution: problemSolvingData.ratingDistribution || [],
            submissionHeatMap: problemSolvingData.submissionHeatMap || {}
        };
console.log(problemPayload)
        if (!existing) {
            const newStats = new Problem(problemPayload);
            await newStats.save();
            console.log(`New stats saved for ${handle}`);
        } else {
            await Problem.updateOne({ handle:handle}, problemPayload);
            console.log(`Stats updated for ${handle}`);
        }

        return {
            success: true,
            data: problemSolvingData,
            filter: { days }
        }

    } catch (error) {
        console.error('Error in ProblemsSloved:', error);
        return error
    }
};

const SubmissionsByDays = (submissions, days) => {
    const currentTimestamp = Math.floor(new Date('2025-06-14T06:19:00Z').getTime() / 1000);
    const cutoffTimestamp = currentTimestamp - (days * 24 * 60 * 60);
    
    const dateFiltered = submissions.filter(submission => {
        return submission.creationTimeSeconds >= cutoffTimestamp;
    });
    
    const solvedSubmissions = dateFiltered.filter(submission => 
        submission.verdict === 'OK'
    );
    
    return {
        allSubmissions: dateFiltered,
        solvedSubmissions: solvedSubmissions
    };
};








async function sendMail({ to }) {
  
  const transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
      port: 587,
      secure: false,
    auth: {
      user: process.env.SENDER_MAIL, 
      pass: process.env.SENDER_PASS  
    }
  });
  const subject='comeback and start'
  const text = ' motinivation is a just like a stroke for a bike you need engine like discipline to go forwrd to reach destination'
  
  const mailOptions = {
    from: `"Your Name" codeforces`,
    to,
    subject,
    text,  
    
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}




const getStudents = async ()=>{

      const students = await Student.find({}) 

      return students
}

const updateContests = async ()=>{
     const students = await getStudents() 

     for(i=0;i<students.length;i++){
       await  Contestcron(students[i].codeHandle)
     }
}

const updateProblems = async ()=>{
    const students = await getStudents() 
    
    for(i=0;i<students.length;i++){
       const handle=students[i].codeHandle 
       const data = await ProblemsCron(handle,7) 

       if(data.averageProblemsPerDay==0 && students[i].mail){ 
           sendMail(students.email) 
           students[i].mailsent = new Date()
          await students[i].save() ;
           
       }
       else{
              await ProblemsCron(handle,365) 
       }

     }

}

module.exports ={combineContestDataByName,Contestcron,ProblemsCron,SubmissionsByDays,sendMail,getStudents,updateProblems,updateContests}