
const processProblemSolvingData = (userData, days) => {
    const submissionData = filterSubmissionsByDays(userData.submissions || [], days);
    const { allSubmissions, solvedSubmissions } = submissionData;

    if (solvedSubmissions.length === 0) {
        return {
            mostDifficultProblemSolved: null,
            mostDifficultProblemDetails: null,
            totalProblemsSolved: 0,
            averageRating: 0,
            averageProblemsPerDay: 0,
            problemsPerRatingBucket: {},
            submissionHeatMap: createSubmissionHeatMap(allSubmissions),
            ratingDistribution: [],
            totalSubmissions: allSubmissions.length
        };
    }

    const uniqueProblems = new Map();
    solvedSubmissions.forEach(submission => {
        const problemKey = `${submission.problem.contestId}-${submission.problem.index}`;
        if (!uniqueProblems.has(problemKey) || 
            submission.creationTimeSeconds < uniqueProblems.get(problemKey).creationTimeSeconds) {
            uniqueProblems.set(problemKey, submission);
        }
    });

    const uniqueSubmissions = Array.from(uniqueProblems.values());
    const problemsWithRating = uniqueSubmissions.filter(s => s.problem.rating);
    let mostDifficult = null;
    let mostDifficultDetails = null;

    if (problemsWithRating.length > 0) {
        mostDifficult = problemsWithRating.reduce((max, current) => 
            (current.problem.rating || 0) > (max.problem.rating || 0) ? current : max
        );

        mostDifficultDetails = {
            name: mostDifficult.problem.name,
            contestId: mostDifficult.problem.contestId,
            index: mostDifficult.problem.index,
            rating: mostDifficult.problem.rating,
            tags: mostDifficult.problem.tags || []
        };
    }

    const ratingsSum = problemsWithRating.reduce((sum, s) => sum + (s.problem.rating || 0), 0);
    const averageRating = problemsWithRating.length > 0 ? ratingsSum / problemsWithRating.length : 0;
    const averageProblemsPerDay = uniqueSubmissions.length / days;

    const ratingBuckets = {};
    uniqueSubmissions.forEach(submission => {
        const rating = submission.problem.rating || 0;
        if (rating > 0) {
            const bucket = Math.floor(rating / 100) * 100;
            ratingBuckets[bucket] = (ratingBuckets[bucket] || 0) + 1;
        }
    });

    const heatMap = createSubmissionHeatMap(allSubmissions);
    const ratingDistribution = Object.keys(ratingBuckets)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(bucket => ({
            rating:` ${bucket}-${parseInt(bucket) + 99}`,
            count: ratingBuckets[bucket]
        }));

    return {
        mostDifficultProblemSolved: mostDifficult ? mostDifficult.problem.rating : null,
        mostDifficultProblemDetails: mostDifficultDetails,
        totalProblemsSolved: uniqueSubmissions.length,
        averageRating: Math.round(averageRating * 100) / 100,
        averageProblemsPerDay: Math.round(averageProblemsPerDay * 100) / 100,
        problemsPerRatingBucket: ratingBuckets,
        submissionHeatMap: heatMap,
        ratingDistribution: ratingDistribution,
        totalSubmissions: allSubmissions.length
    };
};

const filterSubmissionsByDays = (submissions, days) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
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

const createSubmissionHeatMap = (submissions) => {
    const heatMap = {};
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    daysOfWeek.forEach(day => {
        heatMap[day] = {};
        for (let hour = 0; hour < 24; hour++) {
            heatMap[day][hour] = 0;
        }
    });

    submissions.forEach(submission => {
        const date = new Date(submission.creationTimeSeconds * 1000);
        const dayOfWeek = daysOfWeek[date.getDay()];
        const hour = date.getHours();
        heatMap[dayOfWeek][hour]++;
    });

    return heatMap;
};

const processContestHistory = async (userData, days) => {
    const filteredContests = filterContestsByDays(userData.ratingHistory || [], days);
    const ratingGraph = createRatingGraph(filteredContests);

    const contestsWithDetails = await Promise.all(
        filteredContests.map(async (contest) => {
            const problemsUnsolved = await getContestProblemsUnsolved(
                userData.handle, 
                contest.contestId, 
                userData.submissions || []
            );

            return {
                contestId: contest.contestId,
                contestName: contest.contestName,
                rank: contest.rank,
                oldRating: contest.oldRating,
                newRating: contest.newRating,
                ratingChange: contest.newRating - contest.oldRating,
                date: new Date(contest.ratingUpdateTimeSeconds * 1000).toISOString(),
                problemsUnsolved: problemsUnsolved
            };
        })
    );

    return {
        contests: contestsWithDetails,
        ratingGraph: ratingGraph,
        totalContests: filteredContests.length,
        averageRatingChange: filteredContests.length > 0 ? 
            filteredContests.reduce((sum, c) => sum + (c.newRating - c.oldRating), 0) / filteredContests.length : 0
    };
};


const filterContestsByDays = (ratingHistory, days) => {
    const currentTimestamp = Math.floor(new Date('2025-06-14T06:19:00Z').getTime() / 1000);
    const cutoffTimestamp = currentTimestamp - (days * 24 * 60 * 60);
    
    return ratingHistory.filter(contest => {
        return contest.ratingUpdateTimeSeconds >= cutoffTimestamp;
    });
};

const createRatingGraph = (contests) => {
    return contests.map(contest => ({
        date: new Date(contest.ratingUpdateTimeSeconds * 1000).toISOString().split('T')[0],
        rating: contest.newRating,
        contestName: contest.contestName,
        ratingChange: contest.newRating - contest.oldRating,
        rank: contest.rank
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
};
const getContestProblemsUnsolved = async (handle, contestId, submissions) => {

    const contestSubmissions = submissions.filter(s => s.contestId === contestId);

    

    const solvedProblems = new Set();

    contestSubmissions.forEach(submission => {

        if (submission.verdict === 'OK') {

            solvedProblems.add(submission.problem.index);

        }

    });



    let maxProblemIndex = 0;

    contestSubmissions.forEach(submission => {

        const index = submission.problem.index.charCodeAt(0) - 'A'.charCodeAt(0);

        maxProblemIndex = Math.max(maxProblemIndex, index);

    });



    const estimatedTotalProblems = maxProblemIndex + 1;

    return Math.max(0, estimatedTotalProblems - solvedProblems.size);

};


module.exports = {filterContestsByDays,processContestHistory,createSubmissionHeatMap,filterSubmissionsByDays,processProblemSolvingData,createRatingGraph,getContestProblemsUnsolved}
