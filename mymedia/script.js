// Admin Configuration
const ADMIN_PASSWORD = "admin123";

// Check if admin is logged in
let isAdminLoggedIn = false;

// Analytics Data
let analyticsData = {
    visitors: [],
    totalClicks: 0,
    clicksByPlatform: {
        instagram: 0,
        facebook: 0,
        tiktok: 0,
        whatsapp: 0,
        phone: 0,
        email: 0
    }
};

let clicksChart = null;

// Social Media Links
const socialLinks = {
    instagram: "https://www.instagram.com/daily_thoughts__storie?igsh=OGIycW10ZDU3bmlv",
    facebookProfile: "https://www.facebook.com/MacMacable",
    facebookPage: "https://www.facebook.com/profile.php?id=61577824584195",
    tiktok: "https://www.tiktok.com/@macable_002"
};

// Contact Info - YOUR INFORMATION
const contactInfo = {
    phone: "+254758558755",
    email: "omarimawaya02@gmail.com",
    whatsapp: "+254758558755"
};

// Stories Data
let stories = [];

// Load analytics data
function loadAnalytics() {
    const savedAnalytics = localStorage.getItem('dailyThoughtsAnalytics');
    if (savedAnalytics) {
        analyticsData = JSON.parse(savedAnalytics);
    }
    updateVisitorCountDisplay();
}

// Save analytics data
function saveAnalytics() {
    localStorage.setItem('dailyThoughtsAnalytics', JSON.stringify(analyticsData));
}

// Track visitor
function trackVisitor() {
    const visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
        const newVisitor = {
            id: 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            ip: getSimulatedIP(),
            timestamp: new Date().toISOString(),
            clicks: 0,
            platform: getPlatform()
        };
        analyticsData.visitors.unshift(newVisitor);
        if (analyticsData.visitors.length > 30) {
            analyticsData.visitors = analyticsData.visitors.slice(0, 30);
        }
        localStorage.setItem('visitorId', newVisitor.id);
        saveAnalytics();
        updateVisitorCountDisplay();
    }
}

function getSimulatedIP() {
    const ipList = [
        '41.90.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
        '105.163.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
        '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
        '10.0.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255)
    ];
    return ipList[Math.floor(Math.random() * ipList.length)];
}

function getPlatform() {
    return navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';
}

// Track click
function trackClick(platform) {
    analyticsData.totalClicks++;
    if (analyticsData.clicksByPlatform[platform] !== undefined) {
        analyticsData.clicksByPlatform[platform]++;
    }
    
    const visitorId = localStorage.getItem('visitorId');
    const visitor = analyticsData.visitors.find(v => v.id === visitorId);
    if (visitor) {
        visitor.clicks = (visitor.clicks || 0) + 1;
    }
    
    saveAnalytics();
    updateVisitorCountDisplay();
    if (isAdminLoggedIn) {
        updateAnalyticsDashboard();
        renderVisitorList();
        updateClicksChart();
    }
}

function updateVisitorCountDisplay() {
    const visitorCountEl = document.getElementById('visitorCount');
    if (visitorCountEl) {
        visitorCountEl.innerHTML = `<i class="fas fa-eye"></i> ${analyticsData.visitors.length}`;
    }
}

function updateAnalyticsDashboard() {
    document.getElementById('totalVisitors').textContent = analyticsData.visitors.length;
    document.getElementById('totalClicks').textContent = analyticsData.totalClicks;
    const totalLikes = stories.reduce((sum, s) => sum + (s.likes || 0), 0);
    document.getElementById('totalLikes').textContent = totalLikes;
    updateClicksChart();
}

function updateClicksChart() {
    const ctx = document.getElementById('clicksChart');
    if (!ctx) return;
    
    const labels = ['IG', 'FB', 'TT', 'WA', 'Call', 'Email'];
    const data = [
        analyticsData.clicksByPlatform.instagram,
        analyticsData.clicksByPlatform.facebook,
        analyticsData.clicksByPlatform.tiktok,
        analyticsData.clicksByPlatform.whatsapp,
        analyticsData.clicksByPlatform.phone,
        analyticsData.clicksByPlatform.email
    ];
    
    if (clicksChart) {
        clicksChart.data.datasets[0].data = data;
        clicksChart.update();
    } else {
        clicksChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#e4405f', '#1877f2', '#000', '#25D366', '#667eea', '#ea4335'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }
}

function renderVisitorList() {
    const listEl = document.getElementById('visitorList');
    if (!listEl) return;
    
    if (analyticsData.visitors.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;padding:1rem;color:#a0aec0;">No visitors yet</div>';
        return;
    }
    
    listEl.innerHTML = analyticsData.visitors.map(v => `
        <div class="visitor-item">
            <div class="visitor-info">
                <span class="visitor-ip">${v.ip}</span>
                <span class="visitor-time">${formatTime(v.timestamp)}</span>
            </div>
            <div class="visitor-clicks">${v.clicks || 0} clicks</div>
        </div>
    `).join('');
}

// Load stories
function loadStories() {
    const saved = localStorage.getItem('dailyThoughtsStories');
    if (saved) {
        stories = JSON.parse(saved);
    } else {
        stories = [{
            id: Date.now(),
            author: "Daily_Thoughts",
            content: "Welcome! Share your story of the day here. 📌📌",
            date: new Date().toISOString(),
            likes: 3
        }];
        saveStories();
    }
    updateStoryCount();
    renderStories();
}

function saveStories() {
    localStorage.setItem('dailyThoughtsStories', JSON.stringify(stories));
    updateStoryCount();
}

function updateStoryCount() {
    const countEl = document.getElementById('storyCount');
    if (countEl) countEl.innerHTML = `<i class="fas fa-comment"></i> ${stories.length}`;
}

function renderStories() {
    const listEl = document.getElementById('storiesList');
    const emptyEl = document.getElementById('emptyStories');
    
    if (!listEl) return;
    
    if (stories.length === 0) {
        listEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }
    
    if (emptyEl) emptyEl.style.display = 'none';
    
    listEl.innerHTML = stories.map(story => `
        <div class="story-card">
            <div class="story-header">
                <div class="story-author">
                    <i class="fas fa-user-circle"></i> ${escapeHtml(story.author)}
                </div>
                <div class="story-date">${formatTime(story.date)}</div>
            </div>
            <div class="story-content">${escapeHtml(story.content)}</div>
            <div class="story-footer">
                <button class="like-btn" data-id="${story.id}">
                    <i class="fas fa-heart"></i>
                    <span class="like-count">${story.likes || 0}</span>
                </button>
                ${isAdminLoggedIn ? `<button class="delete-story" data-id="${story.id}"><i class="fas fa-trash-alt"></i></button>` : ''}
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', () => likeStory(parseInt(btn.dataset.id)));
    });
    
    if (isAdminLoggedIn) {
        document.querySelectorAll('.delete-story').forEach(btn => {
            btn.addEventListener('click', () => deleteStory(parseInt(btn.dataset.id)));
        });
    }
}

function likeStory(id) {
    const story = stories.find(s => s.id === id);
    if (story) {
        story.likes = (story.likes || 0) + 1;
        saveStories();
        renderStories();
        if (isAdminLoggedIn) updateAnalyticsDashboard();
        showToast('❤️ Liked!');
    }
}

function deleteStory(id) {
    if (confirm('Delete this story?')) {
        stories = stories.filter(s => s.id !== id);
        saveStories();
        renderStories();
        if (isAdminLoggedIn) updateAnalyticsDashboard();
        showToast('🗑️ Deleted');
    }
}

function addStory(author, content) {
    if (!content.trim()) {
        showToast('Write something first!', true);
        return false;
    }
    if (content.length > 300) {
        showToast('Max 300 characters', true);
        return false;
    }
    
    stories.unshift({
        id: Date.now(),
        author: author.trim() || 'Anonymous',
        content: content.trim(),
        date: new Date().toISOString(),
        likes: 0
    });
    saveStories();
    renderStories();
    return true;
}

// Setup Social Icons with Usernames
function setupSocialIcons() {
    const instagram = document.getElementById('instagramIcon');
    const fbProfile = document.getElementById('facebookProfileIcon');
    const fbPage = document.getElementById('facebookPageIcon');
    const tiktok = document.getElementById('tiktokIcon');
    
    if (instagram) {
        instagram.href = socialLinks.instagram;
        instagram.addEventListener('click', () => trackClick('instagram'));
    }
    if (fbProfile) {
        fbProfile.href = socialLinks.facebookProfile;
        fbProfile.addEventListener('click', () => trackClick('facebook'));
    }
    if (fbPage) {
        fbPage.href = socialLinks.facebookPage;
        fbPage.addEventListener('click', () => trackClick('facebook'));
    }
    if (tiktok) {
        tiktok.href = socialLinks.tiktok;
        tiktok.addEventListener('click', () => trackClick('tiktok'));
    }
}

// Setup Contacts
function setupContacts() {
    const whatsapp = document.getElementById('whatsappContact');
    const phone = document.getElementById('phoneContact');
    const email = document.getElementById('emailContact');
    
    if (whatsapp) {
        whatsapp.addEventListener('click', () => {
            trackClick('whatsapp');
            window.open(`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
            showToast('Opening WhatsApp...');
        });
    }
    if (phone) {
        phone.addEventListener('click', () => {
            trackClick('phone');
            window.location.href = `tel:${contactInfo.phone}`;
            showToast('Opening dialer...');
        });
    }
    if (email) {
        email.addEventListener('click', async () => {
            trackClick('email');
            try {
                await navigator.clipboard.writeText(contactInfo.email);
                showToast(`📧 ${contactInfo.email} copied!`);
            } catch (err) {
                const textarea = document.createElement('textarea');
                textarea.value = contactInfo.email;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showToast(`📧 Email copied!`);
            }
        });
    }
}

// Admin Functions
function setupAdminLogin() {
    const avatar = document.getElementById('avatarContainer');
    const adminPanel = document.getElementById('adminPanel');
    const closeBtn = document.getElementById('closeAdmin');
    const logoutBtn = document.getElementById('logoutAdmin');
    
    if (avatar) {
        avatar.addEventListener('click', () => {
            if (!isAdminLoggedIn) {
                const password = prompt('Enter admin password:');
                if (password === ADMIN_PASSWORD) {
                    isAdminLoggedIn = true;
                    adminPanel.classList.add('open');
                    updateAnalyticsDashboard();
                    renderVisitorList();
                    renderStories();
                    showToast('🔓 Admin access granted');
                } else if (password !== null) {
                    showToast('❌ Wrong password', true);
                }
            } else {
                adminPanel.classList.add('open');
                updateAnalyticsDashboard();
                renderVisitorList();
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            adminPanel.classList.remove('open');
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            isAdminLoggedIn = false;
            adminPanel.classList.remove('open');
            renderStories();
            showToast('🔒 Logged out');
        });
    }
}

// Profile Picture Upload
function setupProfileUpload() {
    const uploadInput = document.getElementById('avatarUpload');
    const profileImage = document.getElementById('profileImage');
    const defaultIcon = document.getElementById('defaultIcon');
    const uploadBtn = document.querySelector('.upload-admin-btn');
    
    const savedImage = localStorage.getItem('profilePicture');
    if (savedImage) {
        profileImage.src = savedImage;
        profileImage.style.display = 'block';
        defaultIcon.style.display = 'none';
    }
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            if (isAdminLoggedIn) {
                uploadInput.click();
            } else {
                showToast('Admin access required', true);
            }
        });
    }
    
    if (uploadInput) {
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                if (file.size > 2 * 1024 * 1024) {
                    showToast('Image too large! Max 2MB', true);
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    profileImage.src = event.target.result;
                    profileImage.style.display = 'block';
                    defaultIcon.style.display = 'none';
                    localStorage.setItem('profilePicture', event.target.result);
                    showToast('✨ Profile updated!');
                };
                reader.readAsDataURL(file);
            } else {
                showToast('Please select an image file', true);
            }
        });
    }
}

// Clear Analytics
function setupClearAnalytics() {
    const clearBtn = document.getElementById('clearAnalyticsBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('⚠️ Clear all analytics data? This cannot be undone.')) {
                analyticsData = {
                    visitors: [],
                    totalClicks: 0,
                    clicksByPlatform: { instagram: 0, facebook: 0, tiktok: 0, whatsapp: 0, phone: 0, email: 0 }
                };
                localStorage.removeItem('visitorId');
                saveAnalytics();
                updateAnalyticsDashboard();
                renderVisitorList();
                showToast('📊 Analytics cleared');
            }
        });
    }
}

// Story Submission
function setupStorySubmission() {
    const submitBtn = document.getElementById('submitStory');
    const authorInput = document.getElementById('storyAuthor');
    const contentInput = document.getElementById('storyContent');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (addStory(authorInput.value, contentInput.value)) {
                authorInput.value = '';
                contentInput.value = '';
                showToast('✨ Story shared!');
            }
        });
    }
}

// Toast
let toastTimeout;
function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    if (toastTimeout) clearTimeout(toastTimeout);
    toast.textContent = msg;
    toast.classList.add('show');
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2000);
}

// Helper Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Initialize
function init() {
    loadAnalytics();
    trackVisitor();
    loadStories();
    setupSocialIcons();
    setupContacts();
    setupAdminLogin();
    setupProfileUpload();
    setupClearAnalytics();
    setupStorySubmission();
}

document.addEventListener('DOMContentLoaded', init);