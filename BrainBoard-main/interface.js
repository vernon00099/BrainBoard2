// Global variables
const userEmail = 'john.doe@example.com';
const userName = userEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
const userInitial = userName.charAt(0).toUpperCase();

let isQuestionMode = false;
let selectedFiles = [];
let postIdCounter = 0;

// Comments storage
const commentsData = {};

// Search data
const searchData = [
  { title: 'Calculus 101', type: 'Course', desc: 'Advanced calculus and derivatives' },
  { title: 'Physics Study Group', type: 'Group', desc: 'Weekly physics problem solving' },
  { title: 'Alice Cooper', type: 'Student', desc: 'Mathematics major, 3rd year' },
  { title: 'Bob Wilson', type: 'Student', desc: 'Biology major, 2nd year' },
  { title: 'Chemistry Lab Report', type: 'Discussion', desc: 'Need help with organic chemistry lab' },
  { title: 'Linear Algebra Help', type: 'Question', desc: 'Matrix multiplication confusion' },
  { title: 'Study Tips for Finals', type: 'Tip', desc: 'Effective preparation strategies' },
  { title: 'Computer Science Club', type: 'Group', desc: 'Programming and algorithms discussion' },
  { title: 'Statistics 201', type: 'Course', desc: 'Probability and statistical inference' },
  { title: 'Carol Smith', type: 'Student', desc: 'Psychology major, 4th year' }
];

// Initialize user interface
function initializeUI() {
  // Set user info
  document.getElementById('userAvatar').textContent = userInitial;
  document.getElementById('profileAvatarLarge').textContent = userInitial;
  document.getElementById('profileName').textContent = userName;
  document.getElementById('profileEmail').textContent = userEmail;
  document.querySelector('.composer-avatar').textContent = userInitial;
}

// Search functionality
function performSearch(query) {
  if (!query || query.length < 2) {
    hideSearchResults();
    return;
  }

  const results = searchData.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase()) ||
    item.type.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  displaySearchResults(results, query);
}

function displaySearchResults(results, query) {
  const searchResults = document.getElementById('searchResults');
  
  if (results.length === 0) {
    searchResults.innerHTML = `
      <div class="search-result-item">
        <div class="search-result-title">No results found</div>
        <div class="search-result-desc">Try searching for courses, students, or discussions</div>
      </div>
    `;
  } else {
    searchResults.innerHTML = results.map(result => `
      <div class="search-result-item" onclick="selectSearchResult('${result.title}', '${result.type}')">
        <div class="search-result-title">${highlightQuery(result.title, query)} <span style="color: #667eea; font-size: 12px;">${result.type}</span></div>
        <div class="search-result-desc">${highlightQuery(result.desc, query)}</div>
      </div>
    `).join('');
  }
  
  searchResults.classList.add('show');
}

function highlightQuery(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<strong style="background: rgba(102, 126, 234, 0.2);">$1</strong>');
}

function selectSearchResult(title, type) {
  document.getElementById('searchInput').value = title;
  hideSearchResults();
  showNotification(`Opening ${type.toLowerCase()}: ${title}`, 'info');
}

function hideSearchResults() {
  document.getElementById('searchResults').classList.remove('show');
}

// Profile functions
function toggleProfile() {
  const dropdown = document.getElementById('profileDropdown');
  dropdown.classList.toggle('show');
}

function editProfile() {
  toggleProfile();
  showNotification('Profile editing feature coming soon!', 'info');
}

function viewSettings() {
  toggleProfile();
  showNotification('Settings panel coming soon!', 'info');
}

function viewNotifications() {
  toggleProfile();
  showNotification('You have 3 new notifications 🔔', 'info');
}

// Media upload functions
function uploadMedia(type) {
  const inputMap = {
    'photo': 'photoInput',
    'video': 'videoInput',
    'document': 'documentInput'
  };
  
  const input = document.getElementById(inputMap[type]);
  if (input) {
    input.click();
  }
}

function handleFileUpload(input, type) {
  const file = input.files[0];
  if (!file) return;

  // Check file size (limit to 10MB)
  if (file.size > 10 * 1024 * 1024) {
    showNotification('File size must be less than 10MB', 'error');
    return;
  }

  selectedFiles.push({
    file: file,
    type: type,
    url: URL.createObjectURL(file)
  });

  displaySelectedFile(file, type);
  showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} selected: ${file.name}`, 'success');
}

function displaySelectedFile(file, type) {
  const composer = document.querySelector('.post-composer');
  let preview = composer.querySelector('.file-preview');
  
  if (!preview) {
    preview = document.createElement('div');
    preview.className = 'file-preview';
    preview.style.cssText = `
      margin: 10px 0;
      padding: 10px;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    composer.insertBefore(preview, composer.querySelector('.composer-actions'));
  }

  const fileInfo = document.createElement('div');
  fileInfo.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 10px;
    background: white;
    border-radius: 5px;
    margin-right: 10px;
  `;

  const icon = type === 'photo' ? '📷' : type === 'video' ? '📹' : '📄';
  fileInfo.innerHTML = `
    <span>${icon}</span>
    <span style="font-size: 12px;">${file.name}</span>
    <button onclick="removeFile(this)" style="background: none; border: none; cursor: pointer; color: #ff6b6b;">✕</button>
  `;

  preview.appendChild(fileInfo);
}

function removeFile(button) {
  const fileInfo = button.parentElement;
  const fileName = fileInfo.querySelector('span:nth-child(2)').textContent;
  
  selectedFiles = selectedFiles.filter(f => f.file.name !== fileName);
  fileInfo.remove();

  const preview = document.querySelector('.file-preview');
  if (preview && preview.children.length === 0) {
    preview.remove();
  }
}

// Post functions
function toggleQuestionMode() {
  isQuestionMode = !isQuestionMode;
  const questionBtn = document.querySelector('.media-btn:last-child');
  const textArea = document.querySelector('.composer-input');

  if (isQuestionMode) {
    questionBtn.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
    questionBtn.style.color = 'white';
    textArea.placeholder = 'Ask a question to the community...';
    showNotification('Question mode activated! 💡', 'info');
  } else {
    questionBtn.style.background = 'rgba(102, 126, 234, 0.1)';
    questionBtn.style.color = 'inherit';
    textArea.placeholder = 'Share your thoughts, ask questions, or post study tips...';
    showNotification('Question mode deactivated', 'info');
  }
}

function filterPosts(type, event) {
  const posts = document.querySelectorAll('.post');
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  posts.forEach(post => {
    if (type === 'all' || post.dataset.type === type) {
      post.style.display = 'block';
      post.style.animation = 'fadeInUp 0.6s ease-out';
    } else {
      post.style.display = 'none';
    }
  });
}

function sortPosts(sortType) {
  const feedContainer = document.getElementById('feedContainer');
  const posts = Array.from(feedContainer.querySelectorAll('.post'));

  posts.sort((a, b) => {
    switch (sortType) {
      case 'popular':
        const aLikes = parseInt(a.querySelector('.like-count')?.textContent || '0');
        const bLikes = parseInt(b.querySelector('.like-count')?.textContent || '0');
        return bLikes - aLikes;
      case 'commented':
        const aComments = parseInt(a.querySelector('.comment-count')?.textContent || '0');
        const bComments = parseInt(b.querySelector('.comment-count')?.textContent || '0');
        return bComments - aComments;
      default:
        return 0;
    }
  });

  posts.forEach(post => feedContainer.appendChild(post));
  showNotification(`Posts sorted by ${sortType}`);
}

function toggleLike(button) {
  const isLiked = button.classList.contains('liked');
  const likeCountElement = button.querySelector('.like-count');
  let currentCount = parseInt(likeCountElement.textContent);

  if (isLiked) {
    button.classList.remove('liked');
    likeCountElement.textContent = currentCount - 1;
  } else {
    button.classList.add('liked');
    likeCountElement.textContent = currentCount + 1;
  }
}

// Enhanced comment functionality
function toggleComments(postId) {
  const post = document.querySelector(`[data-post-id="${postId}"]`);
  let commentsSection = post.querySelector('.comments-section');
  
  if (!commentsSection) {
    // Create comments section if it doesn't exist
    commentsSection = createCommentsSection(postId);
    post.appendChild(commentsSection);
    
    // Initialize comments data if not exists
    if (!commentsData[postId]) {
      commentsData[postId] = [];
    }
    
    // Display existing comments
    displayComments(postId);
  } else {
    // Toggle visibility
    if (commentsSection.style.display === 'none') {
      commentsSection.style.display = 'block';
      commentsSection.style.animation = 'fadeInUp 0.3s ease-out';
    } else {
      commentsSection.style.display = 'none';
    }
  }
}

function createCommentsSection(postId) {
  const commentsSection = document.createElement('div');
  commentsSection.className = 'comments-section';
  commentsSection.style.cssText = `
    border-top: 1px solid #e0e0e0;
    padding: 15px 0 0 0;
    margin-top: 15px;
  `;
  
  commentsSection.innerHTML = `
    <div class="comments-list" id="comments-${postId}"></div>
    <div class="comment-composer" style="display: flex; gap: 10px; margin-top: 15px; align-items: flex-start;">
      <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(45deg, #ff6b6b, #ee5a24); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0;">${userInitial}</div>
      <div style="flex: 1;">
        <textarea 
          placeholder="Write a comment..." 
          id="comment-input-${postId}"
          style="width: 100%; min-height: 60px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; resize: vertical; font-family: inherit; font-size: 14px;"
        ></textarea>
        <div style="display: flex; justify-content: flex-end; margin-top: 8px; gap: 8px;">
          <button onclick="cancelComment('${postId}')" style="padding: 6px 12px; background: #f5f5f5; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">Cancel</button>
          <button onclick="addComment('${postId}')" style="padding: 6px 12px; background: linear-gradient(45deg, #667eea, #764ba2); color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">Comment</button>
        </div>
      </div>
    </div>
  `;
  
  return commentsSection;
}

function addComment(postId) {
  const commentInput = document.getElementById(`comment-input-${postId}`);
  const commentText = commentInput.value.trim();
  
  if (!commentText) {
    showNotification('Please write a comment before posting!', 'error');
    return;
  }
  
  // Create comment object
  const comment = {
    id: Date.now().toString(),
    author: userName,
    avatar: userInitial,
    content: escapeHTML(commentText),
    timestamp: new Date(),
    likes: 0
  };
  
  // Add to comments data
  if (!commentsData[postId]) {
    commentsData[postId] = [];
  }
  commentsData[postId].unshift(comment);
  
  // Update comment count in post
  updateCommentCount(postId);
  
  // Display updated comments
  displayComments(postId);
  
  // Clear input
  commentInput.value = '';
  
  showNotification('Comment added!', 'success');
}

function cancelComment(postId) {
  const commentInput = document.getElementById(`comment-input-${postId}`);
  commentInput.value = '';
}

function displayComments(postId) {
  const commentsList = document.getElementById(`comments-${postId}`);
  const comments = commentsData[postId] || [];
  
  if (comments.length === 0) {
    commentsList.innerHTML = '<div style="text-align: center; color: #999; padding: 20px; font-style: italic;">No comments yet. Be the first to comment!</div>';
    return;
  }
  
  commentsList.innerHTML = comments.map(comment => `
    <div class="comment" style="display: flex; gap: 10px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0;">
      <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(45deg, #4ecdc4, #44a08d); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0;">${comment.avatar}</div>
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
          <strong style="font-size: 14px;">${comment.author}</strong>
          <span style="color: #999; font-size: 12px;">${formatTimeAgo(comment.timestamp)}</span>
        </div>
        <div style="color: #333; font-size: 14px; line-height: 1.4; margin-bottom: 8px;">${comment.content}</div>
        <div style="display: flex; gap: 15px; align-items: center;">
          <button onclick="toggleCommentLike('${postId}', '${comment.id}')" class="comment-like-btn" style="background: none; border: none; cursor: pointer; font-size: 12px; color: #666; display: flex; align-items: center; gap: 4px;">
            <span>👍</span> <span class="comment-like-count">${comment.likes}</span>
          </button>
          <button onclick="replyToComment('${postId}', '${comment.id}')" style="background: none; border: none; cursor: pointer; font-size: 12px; color: #666;">Reply</button>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleCommentLike(postId, commentId) {
  const comment = commentsData[postId].find(c => c.id === commentId);
  if (comment) {
    // Simple toggle - in real app, you'd track user likes
    comment.likes = comment.likes > 0 ? comment.likes - 1 : comment.likes + 1;
    displayComments(postId);
  }
}

function replyToComment(postId, commentId) {
  const commentInput = document.getElementById(`comment-input-${postId}`);
  const comment = commentsData[postId].find(c => c.id === commentId);
  if (comment) {
    commentInput.value = `@${comment.author} `;
    commentInput.focus();
  }
}

function updateCommentCount(postId) {
  const post = document.querySelector(`[data-post-id="${postId}"]`);
  const commentCountElement = post.querySelector('.comment-count');
  const commentCount = commentsData[postId] ? commentsData[postId].length : 0;
  
  if (commentCountElement) {
    commentCountElement.textContent = commentCount;
  }
}

function formatTimeAgo(timestamp) {
  const now = new Date();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, match => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[match]));
}

function createPost() {
  const textArea = document.querySelector('.composer-input');
  const content = textArea.value.trim();
  if (content === '' && selectedFiles.length === 0) {
    showNotification('Please write something or attach a file before posting!', 'error');
    return;
  }

  const safeContent = escapeHTML(content);
  const feed = document.getElementById('feedContainer');
  const newPost = document.createElement('article');
  const postId = `post-${++postIdCounter}`;
  
  newPost.className = 'post';
  newPost.dataset.type = isQuestionMode ? 'questions' : 'discussions';
  newPost.dataset.postId = postId;
  newPost.style.animation = 'fadeInUp 0.6s ease-out';

  let mediaContent = '';
  selectedFiles.forEach(fileObj => {
    if (fileObj.type === 'photo') {
      mediaContent += `<div class="post-media"><img src="${fileObj.url}" alt="Uploaded image"></div>`;
    } else if (fileObj.type === 'video') {
      mediaContent += `<div class="post-media"><video controls><source src="${fileObj.url}" type="${fileObj.file.type}"></video></div>`;
    } else if (fileObj.type === 'document') {
      mediaContent += `<div class="post-media" style="padding: 10px; background: #f5f5f5; border-radius: 8px;">📄 ${fileObj.file.name}</div>`;
    }
  });

  const postType = isQuestionMode ? '❓ Question' : '💭 Discussion';
  
  newPost.innerHTML = `
    <div class="post-header">
      <div class="post-avatar" style="background: linear-gradient(45deg, #ff6b6b, #ee5a24); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">${userInitial}</div>
      <div class="post-info">
        <h4>You ${isQuestionMode ? '• ' + postType : ''}</h4>
        <div class="post-time">Just now</div>
      </div>
    </div>
    <div class="post-content">${safeContent}</div>
    ${mediaContent}
    <div class="post-actions">
      <button class="action-btn" onclick="toggleLike(this)">
        <span>👍</span> <span class="like-count">0</span> Like
      </button>
      <button class="action-btn" onclick="toggleComments('${postId}')">
        <span>💬</span> <span class="comment-count">0</span> Comment
      </button>
      <button class="action-btn">
        <span>📤</span> Share
      </button>
    </div>
  `;

  feed.insertBefore(newPost, feed.firstChild);
  
  // Reset form
  textArea.value = '';
  selectedFiles = [];
  const preview = document.querySelector('.file-preview');
  if (preview) preview.remove();
  
  if (isQuestionMode) {
    toggleQuestionMode(); // Reset question mode
  }

  showNotification('Post created successfully! 🎉', 'success');
}

// Utility functions
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function focusComposer() {
  document.querySelector('.composer-input').focus();
  window.scrollTo({
    top: document.querySelector('.post-composer').offsetTop - 100,
    behavior: 'smooth'
  });
}

function logout() {
  showNotification('Logging out...', 'info');
  setTimeout(() => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = 'login.html';
  }, 1500);
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  const colors = {
    success: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
    error: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
    info: 'linear-gradient(45deg, #667eea, #764ba2)'
  };

  notification.style.cssText = `
    position: fixed;
    top: 90px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    z-index: 1001;
    animation: fadeInUp 0.3s ease-out;
    max-width: 300px;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Generate sample posts with comments
function generateSamplePosts() {
  const samplePosts = [
    {
      type: 'discussions',
      author: 'Alice Cooper',
      avatar: 'AC',
      time: '2 hours ago',
      content: 'Just finished my calculus assignment! The integration problems were challenging but I finally got the hang of it. Anyone else working on similar topics?',
      likes: 15,
      comments: 3
    },
    {
      type: 'questions',
      author: 'Bob Wilson',
      avatar: 'BW',
      time: '4 hours ago',
      content: 'Can someone help me understand the difference between mitosis and meiosis? I keep getting confused about the phases.',
      likes: 8,
      comments: 12
    },
    {
      type: 'tips',
      author: 'Carol Smith',
      avatar: 'CS',
      time: '1 day ago',
      content: 'Study tip: Use the Pomodoro Technique! 25 minutes of focused study, then a 5-minute break. It really helps with concentration and retention.',
      likes: 42,
      comments: 7
    }
  ];

  const feed = document.getElementById('feedContainer');
  samplePosts.forEach((post, index) => {
    const postElement = document.createElement('article');
    const postId = `sample-post-${index}`;
    postElement.className = 'post';
    postElement.dataset.type = post.type;
    postElement.dataset.postId = postId;
    
    const typeIcon = post.type === 'questions' ? '❓' : post.type === 'tips' ? '💡' : '💭';
    const typeLabel = post.type === 'questions' ? 'Question' : post.type === 'tips' ? 'Study Tip' : 'Discussion';
    
    postElement.innerHTML = `
      <div class="post-header">
        <div class="post-avatar" style="background: linear-gradient(45deg, #4ecdc4, #44a08d); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">${post.avatar}</div>
        <div class="post-info">
          <h4>${post.author} • ${typeIcon} ${typeLabel}</h4>
          <div class="post-time">${post.time}</div>
        </div>
      </div>
      <div class="post-content">${post.content}</div>
      <div class="post-actions">
        <button class="action-btn" onclick="toggleLike(this)">
          <span>👍</span> <span class="like-count">${post.likes}</span> Like
        </button>
        <button class="action-btn" onclick="toggleComments('${postId}')">
          <span>💬</span> <span class="comment-count">${post.comments}</span> Comment
        </button>
        <button class="action-btn">
          <span>📤</span> Share
        </button>
      </div>
    `;
    
    feed.appendChild(postElement);
    
    // Add sample comments for some posts
    if (index === 1) { // Bob's question about mitosis/meiosis
      commentsData[postId] = [
        {
          id: 'comment-1',
          author: 'Dr. Sarah Johnson',
          avatar: 'SJ',
          content: 'Great question! Mitosis produces two identical diploid cells, while meiosis produces four genetically different haploid gametes. Think of mitosis as "copy" and meiosis as "shuffle".',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          likes: 8
        },
        {
          id: 'comment-2',
          author: 'Mike Chen',
          avatar: 'MC',
          content: 'I found it helpful to remember: Mitosis = Same, Meiosis = Mix. Also, meiosis has two divisions while mitosis has one.',
          timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
          likes: 5
        }
      ];
    }
  });
}

// Event listeners and initialization
document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI
  initializeUI();
  
  // Search functionality
  document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.trim();
    performSearch(searchTerm);
  });

  document.getElementById('searchInput').addEventListener('focus', function(e) {
    if (e.target.value.trim().length >= 2) {
      performSearch(e.target.value.trim());
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    const profileDropdown = document.getElementById('profileDropdown');
    const userAvatar = document.getElementById('userAvatar');
    const searchResults = document.getElementById('searchResults');
    const searchInput = document.getElementById('searchInput');

    if (!userAvatar.contains(e.target) && !profileDropdown.contains(e.target)) {
      profileDropdown.classList.remove('show');
    }

    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      hideSearchResults();
    }
  });

  // Welcome message
  setTimeout(() => {
    showNotification('Welcome back to BrainBoard! 👋', 'success');
  }, 1000);

  // Generate sample posts on load
  generateSamplePosts();
});