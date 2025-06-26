// Authentication management system
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.init();
    }

    init() {
        // Check for existing session
        this.checkSession();
        
        // Setup login form when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupLoginForm());
        } else {
            this.setupLoginForm();
        }
    }

    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        const roleButtons = document.querySelectorAll('.role-btn');
        const usernameLabel = document.getElementById('username-label');

        // Role selection
        roleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                roleButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const role = btn.dataset.role;
                usernameLabel.textContent = role === 'admin' ? 'Username' : 'Student Code';
            });
        });

        // Login form submission with proper async handling
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitButton = loginForm.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                
                try {
                    // Add loading state
                    submitButton.disabled = true;
                    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                    
                    await this.handleLogin(e);
                } catch (error) {
                    console.error('Form submission error:', error);
                    this.showError(error.message);
                } finally {
                    // Restore button state
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                }
            });
        }

        // Logout buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('#admin-logout, #voter-logout')) {
                this.logout();
            }
        });
    }

    async handleLogin(e) {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const role = document.querySelector('.role-btn.active').dataset.role;

        this.clearError();

        // Basic validation
        if (!username || !password) {
            this.showError('Please enter both username and password');
            return false;
        }

        console.log('Starting login process for role:', role);
        if (role === 'admin') {
            return await this.loginAdmin(username, password);
        } else {
            return await this.loginVoter(username, password);
        }
    }

    async loginAdmin(username, password) {
        console.log('Attempting admin login with:', { username });
        
        if (!window.dataManager) {
            throw new Error('System not properly initialized');
        }
        
        const isValid = window.dataManager.verifyAdmin(username, password);
        console.log('Admin verification result:', isValid);
        
        if (!isValid) {
            throw new Error('Invalid admin credentials');
        }

        this.currentUser = { username, role: 'admin' };
        this.currentRole = 'admin';
        this.saveSession();
        
        console.log('Admin login successful, switching to admin page');
        this.showPage('admin-page');
        
        // Initialize admin interface with delay to ensure DOM is ready
        setTimeout(() => {
            if (window.adminManager) {
                console.log('Initializing admin manager');
                window.adminManager.init();
            } else {
                console.error('Admin manager not available');
            }
        }, 50);
        
        return true;
    }

    async loginVoter(studentCode, password) {
        const result = window.dataManager.verifyVoter(studentCode, password);
        
        if (!result) {
            throw new Error('Invalid student credentials');
        }

        if (result.error) {
            throw new Error(result.error);
        }

        this.currentUser = result;
        this.currentRole = 'voter';
        this.saveSession();
        this.showPage('voter-page');
        
        // Initialize voter interface
        if (window.voterManager) {
            window.voterManager.init(result);
        }
    }

    logout() {
        this.currentUser = null;
        this.currentRole = null;
        this.clearSession();
        this.showPage('login-page');
        this.clearLoginForm();
    }

    saveSession() {
        sessionStorage.setItem('evoting_session', JSON.stringify({
            user: this.currentUser,
            role: this.currentRole
        }));
    }

    clearSession() {
        sessionStorage.removeItem('evoting_session');
    }

    checkSession() {
        const session = sessionStorage.getItem('evoting_session');
        if (session) {
            const { user, role } = JSON.parse(session);
            this.currentUser = user;
            this.currentRole = role;
            
            // Show appropriate page
            if (role === 'admin') {
                this.showPage('admin-page');
                // Initialize admin interface
                setTimeout(() => {
                    if (window.adminManager) {
                        window.adminManager.init();
                    }
                }, 100);
            } else if (role === 'voter') {
                this.showPage('voter-page');
                // Initialize voter interface
                setTimeout(() => {
                    if (window.voterManager) {
                        window.voterManager.init(user);
                    }
                }, 100);
            }
        }
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    showError(message) {
        const errorElement = document.getElementById('login-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    clearError() {
        const errorElement = document.getElementById('login-error');
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    }

    clearLoginForm() {
        const form = document.getElementById('login-form');
        if (form) {
            form.reset();
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentRole() {
        return this.currentRole;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.currentRole === 'admin';
    }

    isVoter() {
        return this.currentRole === 'voter';
    }
}

// Initialize authentication manager
window.authManager = new AuthManager();
