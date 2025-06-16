const { CodeforcesAPI, CodeforcesDataCollector } = require('../services/codeforcesService');
const {filterContestsByDays,processContestHistory,createSubmissionHeatMap,filterSubmissionsByDays,processProblemSolvingData,createRatingGraph,getContestProblemsUnsolved} = require('../utils/codeforceutils')
const api = new CodeforcesAPI();
const collector = new CodeforcesDataCollector();
const {combineContestDataByName} = require('../utils/cronutils')
const Contest = require('../models/contests.model')

const ContestHistory = async (req, res) => {
    try {
        const rawHandle = req.params.handle;
        const handle = rawHandle.startsWith(':') ? rawHandle.substring(1) : rawHandle;
        const days = parseInt(req.query.days) || 365;
        
        if (!handle || !handle.trim()) {
            return res.status(400).json({ 
                success: false,
                error: 'Please provide a valid handle' 
            });
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

        res.json({
            success: true,
            data: contestHistory,
            filter: { days }
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


const contestData= async (req,res)=>{

   try {
    
    const {handle} = req.params 
   const days = parseInt(req.query.days)


       if(!handle || !days){
           return res.status(400).json({messages:"not found"}) 
       }
       const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      const contests = await Contest.find({ codeHandle:handle,date: { $gte: dateThreshold } })

      if(contests){
        return res.status(200).json(contests)
      }
      return res.status(200).json({message:"no data"})

}
catch(e){
    return res.status(500).json({message:"problem with backend"})
}

}

module.exports = {
    ContestHistory,
   contestData
};