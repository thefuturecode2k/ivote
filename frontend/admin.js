// Admin management system
class AdminManager {
    constructor() {
        this.currentSection = 'posts';
        this.charts = {};
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        console.log('Initializing Admin Manager');
        this.setupNavigation();
        this.setupModals();
        this.setupForms();
        this.loadInitialData();
        this.initialized = true;
        console.log('Admin Manager initialized successfully');
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        console.log('Setting up navigation, found buttons:', navButtons.length);
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                console.log('Navigation clicked:', section);
                this.showSection(section);
                
                // Update active button
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Load section-specific data
            switch (sectionId) {
                case 'posts':
                    this.loadPosts();
                    break;
                case 'candidates':
                    this.loadCandidates();
                    break;
                case 'voters':
                    this.loadVoters();
                    break;
                case 'results':
                    this.loadResults();
                    break;
            }
        }
    }

    setupModals() {
        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.classList.remove('show');
                    this.resetFileUploadPreviews();
                }
            });
        });

        // Modal background clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                    this.resetFileUploadPreviews();
                }
            });
        });

        // Add buttons
        document.getElementById('add-post-btn')?.addEventListener('click', () => {
            this.showModal('add-post-modal');
        });

        document.getElementById('add-candidate-btn')?.addEventListener('click', () => {
            this.showModal('add-candidate-modal');
            this.populatePostsSelect();
            this.setupFileUploads();
        });

        document.getElementById('add-voter-btn')?.addEventListener('click', () => {
            this.showModal('add-voter-modal');
        });
    }

    setupForms() {
        // Add Post Form
        document.getElementById('add-post-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddPost(e);
        });

        // Add Candidate Form
        document.getElementById('add-candidate-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddCandidate(e);
        });

        // Add Voter Form
        document.getElementById('add-voter-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddVoter(e);
        });

        // Reset Votes Form
        document.getElementById('reset-votes-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleResetVotes(e);
        });

        // Refresh Results Button
        document.getElementById('refresh-results')?.addEventListener('click', () => {
            this.loadResults();
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    loadInitialData() {
        this.loadPosts();
    }

    // Posts Management
    loadPosts() {
        const posts = window.dataManager.getPosts();
        const container = document.getElementById('posts-list');
        
        if (!container) return;

        container.innerHTML = '';

        if (posts.length === 0) {
            container.innerHTML = '<p class="empty-state">No voting posts created yet. Add your first post to get started.</p>';
            return;
        }

        posts.forEach(post => {
            const postCard = this.createPostCard(post);
            container.appendChild(postCard);
        });
    }

    createPostCard(post) {
        const card = document.createElement('div');
        card.className = 'card';
        
        const candidates = window.dataManager.getCandidatesForPost(post.id);
        
        card.innerHTML = `
            <h4>${post.title}</h4>
            <p>${post.description}</p>
            <div class="post-stats">
                <span><i class="fas fa-users"></i> ${candidates.length} candidates</span>
                <span><i class="fas fa-calendar"></i> ${new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="card-actions">
                <button onclick="adminManager.deletePost('${post.id}')" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        return card;
    }

    handleAddPost(e) {
        const formData = new FormData(e.target);
        const postData = {
            title: formData.get('title') || document.getElementById('post-title').value,
            description: formData.get('description') || document.getElementById('post-description').value
        };

        try {
            window.dataManager.addPost(postData);
            this.hideModal('add-post-modal');
            e.target.reset();
            this.loadPosts();
            this.showSuccessMessage('Post created successfully!');
        } catch (error) {
            this.showErrorMessage('Failed to create post: ' + error.message);
        }
    }

    deletePost(postId) {
        if (confirm('Are you sure you want to delete this post? This will also remove all candidates and votes for this post.')) {
            window.dataManager.deletePost(postId);
            this.loadPosts();
            this.showSuccessMessage('Post deleted successfully!');
        }
    }

    // Candidates Management
    loadCandidates() {
        const candidates = window.dataManager.getCandidates();
        const posts = window.dataManager.getPosts();
        const container = document.getElementById('candidates-list');
        
        if (!container) return;

        container.innerHTML = '';

        if (candidates.length === 0) {
            container.innerHTML = '<p class="empty-state">No candidates added yet. Add candidates to your voting posts.</p>';
            return;
        }

        candidates.forEach(candidate => {
            const post = posts.find(p => p.id === candidate.postId);
            const candidateCard = this.createCandidateCard(candidate, post);
            container.appendChild(candidateCard);
        });
    }

    createCandidateCard(candidate, post) {
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <div class="candidate-header">
                <h4>${candidate.name}</h4>
                <span class="post-badge">${post ? post.title : 'Unknown Post'}</span>
            </div>
            <p class="candidate-slogan">"${candidate.slogan}"</p>
            ${candidate.image ? `<img src="${candidate.image}" alt="${candidate.name}" class="candidate-image" onerror="this.style.display='none'">` : ''}
            ${candidate.bio ? `<p class="candidate-bio">${candidate.bio}</p>` : ''}
            ${candidate.video ? `<video src="${candidate.video}" class="candidate-video" controls></video>` : ''}
            <div class="card-actions">
                <button onclick="adminManager.deleteCandidate('${candidate.id}')" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        return card;
    }

    populatePostsSelect() {
        const select = document.getElementById('candidate-post');
        if (!select) return;

        const posts = window.dataManager.getPosts();
        select.innerHTML = '<option value="">Select Post</option>';
        
        posts.forEach(post => {
            const option = document.createElement('option');
            option.value = post.id;
            option.textContent = post.title;
            select.appendChild(option);
        });
    }

    handleAddCandidate(e) {
        const candidateData = {
            postId: document.getElementById('candidate-post').value,
            name: document.getElementById('candidate-name').value,
            slogan: document.getElementById('candidate-slogan').value,
            image: this.candidateImageData || document.getElementById('candidate-image-url').value,
            video: this.candidateVideoData || document.getElementById('candidate-video-url').value,
            bio: document.getElementById('candidate-bio').value
        };

        if (!candidateData.postId) {
            this.showErrorMessage('Please select a post for the candidate');
            return;
        }

        try {
            window.dataManager.addCandidate(candidateData);
            this.hideModal('add-candidate-modal');
            e.target.reset();
            this.resetFileUploadPreviews();
            this.loadCandidates();
            this.showSuccessMessage('Candidate added successfully!');
        } catch (error) {
            this.showErrorMessage('Failed to add candidate: ' + error.message);
        }
    }

    deleteCandidate(candidateId) {
        if (confirm('Are you sure you want to delete this candidate?')) {
            window.dataManager.deleteCandidate(candidateId);
            this.loadCandidates();
            this.showSuccessMessage('Candidate deleted successfully!');
        }
    }

    // Voters Management
    loadVoters() {
        const voters = window.dataManager.getVoters();
        const container = document.getElementById('voters-list');
        
        if (!container) return;

        container.innerHTML = '';

        if (voters.length === 0) {
            container.innerHTML = '<p class="empty-state">No voters registered yet. Add student voters to enable voting.</p>';
            return;
        }

        voters.forEach(voter => {
            const voterCard = this.createVoterCard(voter);
            container.appendChild(voterCard);
        });
    }

    createVoterCard(voter) {
        const card = document.createElement('div');
        card.className = 'card';
        
        const hasVoted = window.dataManager.hasVoted(voter.id);
        
        card.innerHTML = `
            <h4>${voter.name}</h4>
            <p><strong>Student Code:</strong> ${voter.studentCode}</p>
            <p><strong>Status:</strong> ${hasVoted ? '✅ Voted' : '⏳ Not Voted'}</p>
            <p><strong>Registered:</strong> ${new Date(voter.createdAt).toLocaleDateString()}</p>
            <div class="card-actions">
                <button onclick="adminManager.deleteVoter('${voter.id}')" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        return card;
    }

    handleAddVoter(e) {
        const formData = new FormData(e.target);
        const voterData = {
            name: formData.get('name') || document.getElementById('voter-name').value,
            studentCode: formData.get('studentCode') || document.getElementById('voter-code').value,
            password: formData.get('password') || document.getElementById('voter-password').value
        };

        // Check for duplicate student code
        const existingVoters = window.dataManager.getVoters();
        if (existingVoters.find(v => v.studentCode === voterData.studentCode)) {
            this.showErrorMessage('Student code already exists');
            return;
        }

        try {
            window.dataManager.addVoter(voterData);
            this.hideModal('add-voter-modal');
            e.target.reset();
            this.loadVoters();
            this.showSuccessMessage('Voter added successfully!');
        } catch (error) {
            this.showErrorMessage('Failed to add voter: ' + error.message);
        }
    }

    deleteVoter(voterId) {
        if (confirm('Are you sure you want to delete this voter?')) {
            window.dataManager.deleteVoter(voterId);
            this.loadVoters();
            this.showSuccessMessage('Voter deleted successfully!');
        }
    }

    // Results Management
    loadResults() {
        const results = window.dataManager.getResults();
        const container = document.getElementById('results-container');
        
        if (!container) return;

        container.innerHTML = '';

        if (results.length === 0) {
            container.innerHTML = '<p class="empty-state">No voting results available yet.</p>';
            return;
        }

        results.forEach(result => {
            const resultCard = this.createResultCard(result);
            container.appendChild(resultCard);
        });
    }

    createResultCard(result) {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        const cardId = `result-${result.post.id}`;
        
        card.innerHTML = `
            <div class="result-header">
                <h4>${result.post.title}</h4>
                <span class="total-votes">${result.totalVotes} total votes</span>
            </div>
            
            <div class="result-stats">
                <div class="stat-item">
                    <div class="stat-value">${result.totalVotes}</div>
                    <div class="stat-label">Total Votes</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${result.candidates.length}</div>
                    <div class="stat-label">Candidates</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${result.leadingCandidate ? result.leadingCandidate.name : 'None'}</div>
                    <div class="stat-label">Leading Candidate</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${result.leadingVotes}</div>
                    <div class="stat-label">Leading Votes</div>
                </div>
            </div>
            
            <div class="chart-container">
                <canvas id="${cardId}-chart"></canvas>
            </div>
        `;

        // Create chart after DOM is updated
        setTimeout(() => {
            this.createChart(cardId, result);
        }, 100);

        return card;
    }

    // Analytics System
    setupAnalytics() {
        // Refresh analytics button
        const refreshBtn = document.getElementById('refresh-analytics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadAnalytics();
            });
        }

        // Export report button
        const exportBtn = document.getElementById('export-report');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportAnalyticsReport();
            });
        }
    }

    loadAnalytics() {
        this.updateAnalyticsOverview();
        this.createAnalyticsCharts();
        this.generateDetailedStats();
    }

    updateAnalyticsOverview() {
        const results = window.dataManager.getResults();
        const voters = window.dataManager.getVoters();
        const posts = window.dataManager.getPosts();
        const candidates = window.dataManager.getCandidates();
        
        // Calculate metrics
        const totalVotes = results.reduce((sum, result) => sum + result.totalVotes, 0);
        const votedStudents = window.dataManager.getData().votedStudents || [];
        const voterTurnout = voters.length > 0 ? Math.round((votedStudents.length / voters.length) * 100) : 0;
        
        // Update overview cards
        document.getElementById('total-votes-count').textContent = totalVotes;
        document.getElementById('voter-turnout-rate').textContent = `${voterTurnout}%`;
        document.getElementById('active-positions-count').textContent = posts.length;
        document.getElementById('total-candidates-count').textContent = candidates.length;
    }

    createAnalyticsCharts() {
        this.createVotingProgressChart();
        this.createParticipationChart();
        this.createVoteDistributionChart();
        this.createEngagementTimelineChart();
    }

    createVotingProgressChart() {
        const canvas = document.getElementById('voting-progress-chart');
        if (!canvas) return;

        // Destroy existing chart
        if (this.analyticsCharts.votingProgress) {
            this.analyticsCharts.votingProgress.destroy();
        }

        const results = window.dataManager.getResults();
        const labels = results.map(r => r.post.title);
        const data = results.map(r => r.totalVotes);
        const maxVotes = Math.max(...data) || 1;

        this.analyticsCharts.votingProgress = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Votes Cast',
                    data: data,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: Math.max(maxVotes + 5, 10)
                    }
                }
            }
        });
    }

    createParticipationChart() {
        const canvas = document.getElementById('participation-chart');
        if (!canvas) return;

        if (this.analyticsCharts.participation) {
            this.analyticsCharts.participation.destroy();
        }

        const voters = window.dataManager.getVoters();
        const votedStudents = window.dataManager.getData().votedStudents || [];
        const voted = votedStudents.length;
        const notVoted = voters.length - voted;

        this.analyticsCharts.participation = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Voted', 'Not Voted'],
                datasets: [{
                    data: [voted, notVoted],
                    backgroundColor: [
                        'rgba(67, 233, 123, 0.8)',
                        'rgba(245, 87, 108, 0.8)'
                    ],
                    borderColor: [
                        'rgba(67, 233, 123, 1)',
                        'rgba(245, 87, 108, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createVoteDistributionChart() {
        const canvas = document.getElementById('vote-distribution-chart');
        if (!canvas) return;

        if (this.analyticsCharts.voteDistribution) {
            this.analyticsCharts.voteDistribution.destroy();
        }

        const results = window.dataManager.getResults();
        const allCandidates = [];
        const allVotes = [];

        results.forEach(result => {
            result.candidates.forEach(candidateResult => {
                if (candidateResult.votes > 0) {
                    allCandidates.push(`${candidateResult.candidate.name} (${result.post.title})`);
                    allVotes.push(candidateResult.votes);
                }
            });
        });

        this.analyticsCharts.voteDistribution = new Chart(canvas, {
            type: 'pie',
            data: {
                labels: allCandidates.slice(0, 8), // Limit to top 8 for readability
                datasets: [{
                    data: allVotes.slice(0, 8),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 159, 64, 0.8)',
                        'rgba(199, 199, 199, 0.8)',
                        'rgba(83, 102, 255, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });
    }

    createEngagementTimelineChart() {
        const canvas = document.getElementById('engagement-timeline-chart');
        if (!canvas) return;

        if (this.analyticsCharts.engagement) {
            this.analyticsCharts.engagement.destroy();
        }

        // Simulate hourly engagement data
        const hours = [];
        const engagement = [];
        for (let i = 0; i < 24; i++) {
            hours.push(`${i}:00`);
            // Simulate realistic voting patterns with peaks during typical hours
            let baseEngagement = 0;
            if (i >= 8 && i <= 11) baseEngagement = 15; // Morning peak
            else if (i >= 13 && i <= 16) baseEngagement = 20; // Afternoon peak
            else if (i >= 18 && i <= 21) baseEngagement = 12; // Evening
            else baseEngagement = Math.random() * 5; // Low activity
            
            engagement.push(Math.floor(baseEngagement + Math.random() * 5));
        }

        this.analyticsCharts.engagement = new Chart(canvas, {
            type: 'line',
            data: {
                labels: hours,
                datasets: [{
                    label: 'Votes per Hour',
                    data: engagement,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    generateDetailedStats() {
        this.generatePositionPerformanceTable();
        this.generateCandidateRankingsTable();
        this.generateVotingPatternsAnalysis();
    }

    generatePositionPerformanceTable() {
        const container = document.getElementById('position-performance-table');
        if (!container) return;

        const results = window.dataManager.getResults();
        const voters = window.dataManager.getVoters();
        
        let html = '<table class="stats-table">';
        html += '<thead><tr><th>Position</th><th>Total Votes</th><th>Participation Rate</th><th>Leading Candidate</th><th>Margin</th></tr></thead><tbody>';
        
        results.forEach(result => {
            const participationRate = voters.length > 0 ? Math.round((result.totalVotes / voters.length) * 100) : 0;
            const sortedCandidates = result.candidates.sort((a, b) => b.votes - a.votes);
            const leader = sortedCandidates[0];
            const runnerUp = sortedCandidates[1];
            const margin = leader && runnerUp ? leader.votes - runnerUp.votes : leader ? leader.votes : 0;
            
            html += `<tr>
                <td>${result.post.title}</td>
                <td>${result.totalVotes}</td>
                <td>
                    ${participationRate}%
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${participationRate}%"></div>
                    </div>
                </td>
                <td>${leader ? leader.candidate.name : 'No votes yet'}</td>
                <td>${margin} vote${margin !== 1 ? 's' : ''}</td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    generateCandidateRankingsTable() {
        const container = document.getElementById('candidate-rankings-table');
        if (!container) return;

        const results = window.dataManager.getResults();
        const allCandidates = [];
        
        results.forEach(result => {
            result.candidates.forEach(candidateResult => {
                allCandidates.push({
                    ...candidateResult,
                    position: result.post.title,
                    percentage: result.totalVotes > 0 ? Math.round((candidateResult.votes / result.totalVotes) * 100) : 0
                });
            });
        });
        
        allCandidates.sort((a, b) => b.votes - a.votes);
        
        let html = '<table class="stats-table">';
        html += '<thead><tr><th>Rank</th><th>Candidate</th><th>Position</th><th>Votes</th><th>Share</th></tr></thead><tbody>';
        
        allCandidates.slice(0, 10).forEach((candidate, index) => {
            let rankBadge = '';
            if (index === 0) rankBadge = '<span class="ranking-badge gold">1st</span>';
            else if (index === 1) rankBadge = '<span class="ranking-badge silver">2nd</span>';
            else if (index === 2) rankBadge = '<span class="ranking-badge bronze">3rd</span>';
            else rankBadge = `<span class="ranking-badge">${index + 1}th</span>`;
            
            html += `<tr>
                <td>${rankBadge}</td>
                <td>${candidate.candidate.name}</td>
                <td>${candidate.position}</td>
                <td>${candidate.votes}</td>
                <td>${candidate.percentage}%</td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    generateVotingPatternsAnalysis() {
        const container = document.getElementById('voting-patterns-analysis');
        if (!container) return;

        const results = window.dataManager.getResults();
        const voters = window.dataManager.getVoters();
        const votedStudents = window.dataManager.getData().votedStudents || [];
        
        const insights = [];
        
        // Overall participation insight
        const overallParticipation = voters.length > 0 ? Math.round((votedStudents.length / voters.length) * 100) : 0;
        if (overallParticipation > 80) {
            insights.push({
                title: 'High Voter Engagement',
                description: `Excellent turnout with ${overallParticipation}% of registered voters participating.`
            });
        } else if (overallParticipation > 50) {
            insights.push({
                title: 'Moderate Participation',
                description: `${overallParticipation}% voter turnout indicates room for improvement in engagement.`
            });
        } else {
            insights.push({
                title: 'Low Participation',
                description: `Only ${overallParticipation}% turnout suggests need for increased voter outreach.`
            });
        }
        
        // Competitive races
        const competitiveRaces = results.filter(result => {
            const sorted = result.candidates.sort((a, b) => b.votes - a.votes);
            return sorted.length > 1 && sorted[0].votes - sorted[1].votes <= 2;
        });
        
        if (competitiveRaces.length > 0) {
            insights.push({
                title: 'Competitive Elections',
                description: `${competitiveRaces.length} position(s) have very close margins, indicating strong competition.`
            });
        }
        
        // Unopposed candidates
        const unopposedRaces = results.filter(result => 
            result.candidates.filter(c => c.votes > 0).length <= 1
        );
        
        if (unopposedRaces.length > 0) {
            insights.push({
                title: 'Unopposed Positions',
                description: `${unopposedRaces.length} position(s) have clear winners or limited competition.`
            });
        }
        
        let html = '';
        insights.forEach(insight => {
            html += `
                <div class="pattern-insight">
                    <h5>${insight.title}</h5>
                    <p>${insight.description}</p>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    exportAnalyticsReport() {
        const results = window.dataManager.getResults();
        const voters = window.dataManager.getVoters();
        const posts = window.dataManager.getPosts();
        const candidates = window.dataManager.getCandidates();
        const votedStudents = window.dataManager.getData().votedStudents || [];
        
        const report = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalVotes: results.reduce((sum, result) => sum + result.totalVotes, 0),
                voterTurnout: voters.length > 0 ? Math.round((votedStudents.length / voters.length) * 100) : 0,
                activePositions: posts.length,
                totalCandidates: candidates.length,
                votedStudents: votedStudents.length,
                registeredVoters: voters.length
            },
            results: results,
            detailedAnalysis: {
                positionPerformance: results.map(result => ({
                    position: result.post.title,
                    totalVotes: result.totalVotes,
                    participationRate: voters.length > 0 ? Math.round((result.totalVotes / voters.length) * 100) : 0,
                    candidates: result.candidates.map(c => ({
                        name: c.candidate.name,
                        votes: c.votes,
                        percentage: result.totalVotes > 0 ? Math.round((c.votes / result.totalVotes) * 100) : 0
                    }))
                }))
            }
        };
        
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `voting-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    createChart(cardId, result) {
        const canvas = document.getElementById(`${cardId}-chart`);
        if (!canvas) return;

        // Destroy existing chart
        if (this.charts[cardId]) {
            this.charts[cardId].destroy();
        }

        const labels = result.candidates.map(c => c.candidate.name);
        const data = result.candidates.map(c => c.votes);
        const colors = this.generateColors(labels.length);

        this.charts[cardId] = new Chart(canvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace('0.8', '1')),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} votes (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    generateColors(count) {
        const colors = [
            'rgba(37, 99, 235, 0.8)',   // blue
            'rgba(34, 197, 94, 0.8)',   // green
            'rgba(239, 68, 68, 0.8)',   // red
            'rgba(245, 158, 11, 0.8)',  // yellow
            'rgba(139, 92, 246, 0.8)',  // purple
            'rgba(236, 72, 153, 0.8)',  // pink
            'rgba(20, 184, 166, 0.8)',  // teal
            'rgba(251, 146, 60, 0.8)'   // orange
        ];
        
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
        }
        return result;
    }

    // Reset Votes
    handleResetVotes(e) {
        const password = document.getElementById('reset-password').value;
        
        const isValidAdmin = window.dataManager.verifyAdmin('admin', password);
        if (!isValidAdmin) {
            this.showErrorMessage('Invalid admin password');
            return;
        }

        if (confirm('Are you absolutely sure you want to reset all votes? This action cannot be undone.')) {
            window.dataManager.resetVotes();
            e.target.reset();
            this.loadResults();
            this.showSuccessMessage('All votes have been reset successfully!');
        }
    }

    // Utility Methods
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageEl);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    // File Upload Management
    setupFileUploads() {
        this.candidateImageData = null;
        this.candidateVideoData = null;

        // Image upload button
        const uploadImageBtn = document.getElementById('upload-image-btn');
        const imageFileInput = document.getElementById('candidate-image-file');
        const imagePreview = document.getElementById('image-preview');
        const imageUrlInput = document.getElementById('candidate-image-url');

        uploadImageBtn?.addEventListener('click', () => {
            imageFileInput.click();
        });

        imageFileInput?.addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0], imagePreview);
        });

        imageUrlInput?.addEventListener('input', () => {
            if (imageUrlInput.value) {
                this.candidateImageData = null;
                this.showImagePreview(imageUrlInput.value, imagePreview, false);
            }
        });

        // Video upload button
        const uploadVideoBtn = document.getElementById('upload-video-btn');
        const videoFileInput = document.getElementById('candidate-video-file');
        const videoPreview = document.getElementById('video-preview');
        const videoUrlInput = document.getElementById('candidate-video-url');

        uploadVideoBtn?.addEventListener('click', () => {
            videoFileInput.click();
        });

        videoFileInput?.addEventListener('change', (e) => {
            this.handleVideoUpload(e.target.files[0], videoPreview);
        });

        videoUrlInput?.addEventListener('input', () => {
            if (videoUrlInput.value) {
                this.candidateVideoData = null;
                this.showVideoPreview(videoUrlInput.value, videoPreview, false);
            }
        });
    }

    handleImageUpload(file, previewContainer) {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showErrorMessage('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showErrorMessage('Image file size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.candidateImageData = e.target.result;
            this.showImagePreview(e.target.result, previewContainer, true, file);
            // Clear URL input
            document.getElementById('candidate-image-url').value = '';
        };
        reader.readAsDataURL(file);
    }

    handleVideoUpload(file, previewContainer) {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('video/')) {
            this.showErrorMessage('Please select a valid video file');
            return;
        }

        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            this.showErrorMessage('Video file size must be less than 50MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.candidateVideoData = e.target.result;
            this.showVideoPreview(e.target.result, previewContainer, true, file);
            // Clear URL input
            document.getElementById('candidate-video-url').value = '';
        };
        reader.readAsDataURL(file);
    }

    showImagePreview(src, container, isFile = false, file = null) {
        container.innerHTML = '';
        container.classList.add('show');

        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Candidate Image Preview';

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-file';
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', () => {
            this.removeImagePreview(container);
        });

        container.appendChild(img);
        container.appendChild(removeBtn);

        if (file) {
            const sizeInfo = document.createElement('div');
            sizeInfo.className = 'file-size-info';
            sizeInfo.textContent = `${file.name} (${this.formatFileSize(file.size)})`;
            container.appendChild(sizeInfo);
        }
    }

    showVideoPreview(src, container, isFile = false, file = null) {
        container.innerHTML = '';
        container.classList.add('show');

        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.preload = 'metadata';

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-file';
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', () => {
            this.removeVideoPreview(container);
        });

        container.appendChild(video);
        container.appendChild(removeBtn);

        if (file) {
            const sizeInfo = document.createElement('div');
            sizeInfo.className = 'file-size-info';
            sizeInfo.textContent = `${file.name} (${this.formatFileSize(file.size)})`;
            container.appendChild(sizeInfo);
        }
    }

    removeImagePreview(container) {
        container.classList.remove('show');
        container.innerHTML = '';
        this.candidateImageData = null;
        document.getElementById('candidate-image-file').value = '';
        document.getElementById('candidate-image-url').value = '';
    }

    removeVideoPreview(container) {
        container.classList.remove('show');
        container.innerHTML = '';
        this.candidateVideoData = null;
        document.getElementById('candidate-video-file').value = '';
        document.getElementById('candidate-video-url').value = '';
    }

    resetFileUploadPreviews() {
        const imagePreview = document.getElementById('image-preview');
        const videoPreview = document.getElementById('video-preview');
        
        if (imagePreview) this.removeImagePreview(imagePreview);
        if (videoPreview) this.removeVideoPreview(videoPreview);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize admin manager
window.adminManager = new AdminManager();

// Add CSS for message animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .empty-state {
        text-align: center;
        color: var(--text-secondary);
        font-style: italic;
        padding: 2rem;
        background-color: var(--bg-primary);
        border-radius: 1rem;
        border: 2px dashed var(--border-color);
    }
    
    .post-badge {
        background-color: var(--primary-color);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.8rem;
    }
    
    .candidate-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .candidate-slogan {
        font-style: italic;
        color: var(--text-secondary);
        margin-bottom: 1rem;
    }
    
    .post-stats {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    
    .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }
`;
document.head.appendChild(style);
