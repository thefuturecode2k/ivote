// Data management system using localStorage
class DataManager {
    constructor() {
        this.initializeData();
        console.log('DataManager initialized with localStorage support');
    }

    // Initialize default data structure
    initializeData() {
        if (!localStorage.getItem('evoting_system')) {
            const defaultData = {
                admin: {
                    username: 'admin',
                    password: 'admin123'
                },
                posts: [],
                candidates: [],
                voters: [],
                votes: {},
                votedStudents: []
            };
            this.saveData(defaultData);
        }
    }

    // Get all data
    getData() {
        const data = localStorage.getItem('evoting_system');
        return data ? JSON.parse(data) : null;
    }

    // Save data to localStorage
    saveData(data) {
        localStorage.setItem('evoting_system', JSON.stringify(data));
    }

    // Get admin credentials
    getAdminCredentials() {
        const data = this.getData();
        return data.admin;
    }

    // Verify admin login
    verifyAdmin(username, password) {
        const admin = this.getAdminCredentials();
        return admin.username === username && admin.password === password;
    }

    // Get all posts
    getPosts() {
        const data = this.getData();
        return data.posts || [];
    }

    // Add new post
    addPost(post) {
        const data = this.getData();
        const newPost = {
            id: Date.now().toString(),
            title: post.title,
            description: post.description,
            createdAt: new Date().toISOString()
        };
        data.posts.push(newPost);
        this.saveData(data);
        return newPost;
    }

    // Delete post
    deletePost(postId) {
        const data = this.getData();
        data.posts = data.posts.filter(post => post.id !== postId);
        // Also remove candidates for this post
        data.candidates = data.candidates.filter(candidate => candidate.postId !== postId);
        // Remove votes for this post
        if (data.votes[postId]) {
            delete data.votes[postId];
        }
        this.saveData(data);
    }

    // Get all candidates
    getCandidates() {
        const data = this.getData();
        return data.candidates || [];
    }

    // Get candidates for specific post
    getCandidatesForPost(postId) {
        const candidates = this.getCandidates();
        return candidates.filter(candidate => candidate.postId === postId);
    }

    // Add new candidate
    addCandidate(candidate) {
        const data = this.getData();
        const newCandidate = {
            id: Date.now().toString(),
            postId: candidate.postId,
            name: candidate.name,
            slogan: candidate.slogan,
            image: candidate.image || '',
            video: candidate.video || '',
            bio: candidate.bio || '',
            createdAt: new Date().toISOString()
        };
        data.candidates.push(newCandidate);
        this.saveData(data);
        return newCandidate;
    }

    // Delete candidate
    deleteCandidate(candidateId) {
        const data = this.getData();
        data.candidates = data.candidates.filter(candidate => candidate.id !== candidateId);
        this.saveData(data);
    }

    // Get all voters
    getVoters() {
        const data = this.getData();
        return data.voters || [];
    }

    // Add new voter
    addVoter(voter) {
        const data = this.getData();
        const newVoter = {
            id: Date.now().toString(),
            name: voter.name,
            studentCode: voter.studentCode,
            password: voter.password,
            createdAt: new Date().toISOString()
        };
        data.voters.push(newVoter);
        this.saveData(data);
        return newVoter;
    }

    // Delete voter
    deleteVoter(voterId) {
        const data = this.getData();
        data.voters = data.voters.filter(voter => voter.id !== voterId);
        this.saveData(data);
    }

    // Verify voter login
    verifyVoter(studentCode, password) {
        const voters = this.getVoters();
        const voter = voters.find(v => v.studentCode === studentCode && v.password === password);
        
        if (!voter) {
            return null;
        }

        // Check if student has already voted
        const data = this.getData();
        if (data.votedStudents.includes(voter.id)) {
            return { error: 'Student has already voted' };
        }

        return voter;
    }

    // Check if student has voted
    hasVoted(studentId) {
        const data = this.getData();
        return data.votedStudents.includes(studentId);
    }

    // Submit votes
    submitVotes(studentId, votes) {
        const data = this.getData();
        
        // Mark student as voted
        if (!data.votedStudents.includes(studentId)) {
            data.votedStudents.push(studentId);
        }

        // Initialize votes structure if needed
        if (!data.votes) {
            data.votes = {};
        }

        // Record votes
        Object.keys(votes).forEach(postId => {
            const candidateId = votes[postId];
            if (!data.votes[postId]) {
                data.votes[postId] = {};
            }
            if (!data.votes[postId][candidateId]) {
                data.votes[postId][candidateId] = 0;
            }
            data.votes[postId][candidateId]++;
        });

        this.saveData(data);
    }

    // Get voting results
    getResults() {
        const data = this.getData();
        const posts = this.getPosts();
        const candidates = this.getCandidates();
        const votes = data.votes || {};

        return posts.map(post => {
            const postCandidates = candidates.filter(c => c.postId === post.id);
            const postVotes = votes[post.id] || {};
            
            let totalVotes = 0;
            let leadingCandidate = null;
            let maxVotes = 0;

            const candidateResults = postCandidates.map(candidate => {
                const candidateVotes = postVotes[candidate.id] || 0;
                totalVotes += candidateVotes;
                
                if (candidateVotes > maxVotes) {
                    maxVotes = candidateVotes;
                    leadingCandidate = candidate;
                }

                return {
                    candidate,
                    votes: candidateVotes
                };
            });

            return {
                post,
                candidates: candidateResults,
                totalVotes,
                leadingCandidate,
                leadingVotes: maxVotes
            };
        });
    }

    // Reset all votes
    resetVotes() {
        const data = this.getData();
        data.votes = {};
        data.votedStudents = [];
        this.saveData(data);
    }

    // Get voting progress for a student
    getVotingProgress(studentVotes) {
        const posts = this.getPosts();
        const totalPosts = posts.length;
        const votedPosts = Object.keys(studentVotes).length;
        return {
            total: totalPosts,
            voted: votedPosts,
            percentage: totalPosts > 0 ? (votedPosts / totalPosts) * 100 : 0
        };
    }
}

// Create global instance
window.dataManager = new DataManager();
