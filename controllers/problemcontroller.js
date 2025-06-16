const { CodeforcesAPI, CodeforcesDataCollector } = require('../services/codeforcesService');

const api = new CodeforcesAPI();
const collector = new CodeforcesDataCollector();

const {createSubmissionHeatMap,filterSubmissionsByDays,processProblemSolvingData} = require('../utils/problemutils')
const Problem = require('../models/problem.model')



const ProblemsSloved = async (req, res) => {
    try {
        const rawHandle = req.params.handle;
        const handle = rawHandle.startsWith(':') ? rawHandle.substring(1) : rawHandle;
        const days = parseInt(req.query.days) || 90;

        if (!handle || !handle.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid handle'
            });
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

        return res.json({
            success: true,
            data: problemSolvingData,
            filter: { days }
        });

    } catch (error) {
        console.error('Error in ProblemsSloved:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const Submissions = async (req, res) => {
    try {
        const { handle } = req.params;
        const count = parseInt(req.query.count) || 1000;
        
        const submissionData = await api.getUserStatus(handle, count);
        
        if (submissionData.status !== 'OK') {
            return res.status(404).json({
                success: false,
                error: 'Submissions not found'
            });
        }

        res.json({
            success: true,
            data: submissionData.result,
            count: submissionData.result.length
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const DifficultProblem = async (req, res) => {
    try {
        const { handle } = req.params;
        const days = parseInt(req.query.days) || 90;

        const userData = await collector.collectAllUserData(handle);
        const submissionData = filterSubmissionsByDays(userData.submissions || [], days);
        
        const uniqueProblems = new Map();
        submissionData.solvedSubmissions.forEach(submission => {
            const problemKey = `${submission.problem.contestId}-${submission.problem.index}`;
            if (!uniqueProblems.has(problemKey)) {
                uniqueProblems.set(problemKey, submission);
            }
        });

        const problemsWithRating = Array.from(uniqueProblems.values())
            .filter(s => s.problem.rating);

        if (problemsWithRating.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: 'No rated problems solved in the given period'
            });
        }

        const mostDifficult = problemsWithRating.reduce((max, current) => 
            (current.problem.rating || 0) > (max.problem.rating || 0) ? current : max
        );

        res.json({
            success: true,
            data: {
                name: mostDifficult.problem.name,
                contestId: mostDifficult.problem.contestId,
                index: mostDifficult.problem.index,
                rating: mostDifficult.problem.rating,
                tags: mostDifficult.problem.tags || [],
                submissionTime: new Date(mostDifficult.creationTimeSeconds * 1000).toISOString()
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
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

const getProblems = async (req,res)=>{
       
        const handle = req.params.handle 

        if(!handle){
            return res.status(400).json({messages:"hooo no handle how i should give data idiot"})
        }

        const data = await Problem.findOne({handle}) 
             
        return res.status(200).json(data)


}




module.exports = {
    ProblemsSloved,
    Submissions,
    DifficultProblem,
    SubmissionsByDays,getProblems
};