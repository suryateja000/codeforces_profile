const axios = require('axios');

class CodeforcesAPI {
    constructor() {
        this.baseURL = 'https://codeforces.com/api/';
        this.delay = 1000;
    }

    async makeRequest(endpoint) {
        try {
            const response = await axios.get(`${this.baseURL}${endpoint}`, {
                timeout: 10000,
                headers: { 'User-Agent': 'CodeforcesProfileApp/1.0' }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 400) {
                throw new Error(`Invalid handle or request: ${error.response.data?.comment || 'Bad request'}`);
            }
            throw new Error(`API request failed: ${error.message}`);
        }
    }

    async getUserRating(handle) {
        return await this.makeRequest(`user.rating?handle=${encodeURIComponent(handle)}`);
    }

    async getUserInfo(handle) {
        return await this.makeRequest(`user.info?handles=${encodeURIComponent(handle)}`);
    }

    async getUserStatus(handle, count = 1000) {
        return await this.makeRequest(`user.status?handle=${encodeURIComponent(handle)}&count=${count}`);
    }

    async sleep(ms = this.delay) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class CodeforcesDataCollector {
    constructor() {
        this.api = new CodeforcesAPI();
    }

    async collectAllUserData(handle) {
        const userData = { handle };

        try {
            const userInfo = await this.api.getUserInfo(handle);
            if (userInfo.status === 'OK') {
                userData.profile = userInfo.result[0];
            } else {
                throw new Error(`Failed to get user info: ${userInfo.comment}`);
            }

            await this.api.sleep();

            try {
                const userStatus = await this.api.getUserStatus(handle, 10000);
                userData.submissions = userStatus.status === 'OK' ? userStatus.result : [];
            } catch (error) {
                userData.submissions = [];
            }

            await this.api.sleep();

            try {
                const userRating = await this.api.getUserRating(handle);
                userData.ratingHistory = userRating.status === 'OK' ? userRating.result : [];
            } catch (error) {
                userData.ratingHistory = [];
            }

            return userData;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = {
    CodeforcesAPI,
    CodeforcesDataCollector
};