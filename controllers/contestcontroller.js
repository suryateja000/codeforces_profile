const { CodeforcesAPI, CodeforcesDataCollector } = require('../services/codeforcesService');

const api = new CodeforcesAPI();
const collector = new CodeforcesDataCollector();

const getUserContests = async (req, res) => {
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

        res.json({
            success: true,
            data: contestHistory,
            filter: { days }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const getUserRating = async (req, res) => {
    try {
        const { handle } = req.params;
        
        const ratingData = await api.getUserRating(handle);
        
        if (ratingData.status !== 'OK') {
            return res.status(404).json({
                success: false,
                error: 'Rating data not found'
            });
        }

        res.json({
            success: true,
            data: ratingData.result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const getContestRatingGraph = async (req, res) => {
    try {
        const { handle } = req.params;
        const days = parseInt(req.query.days) || 365;

        const userData = await collector.collectAllUserData(handle);
        const filteredContests = filterContestsByDays(userData.ratingHistory || [], days);
        const ratingGraph = createRatingGraph(filteredContests);

        res.json({
            success: true,
            data: {
                ratingGraph,
                totalContests: filteredContests.length
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const getContestDetails = async (req, res) => {
    try {
        const { handle, contestId } = req.params;

        const userData = await collector.collectAllUserData(handle);
        const contest = userData.ratingHistory?.find(c => c.contestId == contestId);
        
        if (!contest) {
            return res.status(404).json({
                success: false,
                error: 'Contest not found for this user'
            });
        }

        const problemsUnsolved = await getContestProblemsUnsolved(
            handle, 
            contestId, 
            userData.submissions || []
        );

        res.json({
            success: true,
            data: {
                contestId: contest.contestId,
                contestName: contest.contestName,
                rank: contest.rank,
                oldRating: contest.oldRating,
                newRating: contest.newRating,
                ratingChange: contest.newRating - contest.oldRating,
                problemsUnsolved
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    getUserContests,
    getUserRating,
    getContestRatingGraph,
    getContestDetails
};