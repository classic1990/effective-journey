// 25-HD Style - Movie Streaming Website JavaScript

// ===== CONFIGURATION =====
const CONFIG = {
  API_URL: 'https://firestore.googleapis.com/v1/projects/classic-e8ab7/databases/(default)/documents/movies',
  FIREBASE_PROJECT: 'classic-e8ab7',
  MOVIES_PER_PAGE: 12,
  FALLBACK_DATA: [
    { id: 'fallback1', title: 'The Matrix', year: 1999, poster: 'https://img.youtube.com/vi/vKQi3bBA1y8/maxresdefault.jpg', url: 'vKQi3bBA1y8', quality: 'HD', category: 'action' },
    { id: 'fallback2', title: 'Interstellar', year: 2014, poster: 'https://img.youtube.com/vi/zSWdZVtXT7E/maxresdefault.jpg', url: 'zSWdZVtXT7E', quality: 'HD', category: 'sci-fi' },
    { id: 'fallback3', title: 'Inception', year: 2010, poster: 'https://img.youtube.com/vi/YoHD9XEInc0/maxresdefault.jpg', url: 'YoHD9XEInc0', quality: 'HD', category: 'thriller' },
    { id: 'fallback4', title: 'Blade Runner 2049', year: 2017, poster: 'https://img.youtube.com/vi/gCcx85zbxz4/maxresdefault.jpg', url: 'gCcx85zbxz4', quality: 'HD', category: 'sci-fi' },
    { id: 'fallback5', title: 'The Dark Knight', year: 2008, poster: 'https://img.youtube.com/vi/EXeTwQWrcwY/maxresdefault.jpg', url: 'EXeTwQWrcwY', quality: 'HD', category: 'action' },
    { id: 'fallback6', title: 'Pulp Fiction', year: 1994, poster: 'https://img.youtube.com/vi/s7EdQ4FqbhY/maxresdefault.jpg', url: 's7EdQ4FqbhY', quality: 'HD', category: 'crime' },
    { id: 'fallback7', title: 'The Shawshank Redemption', year: 1994, poster: 'https://img.youtube.com/vi/6hB3S9bIaco/maxresdefault.jpg', url: '6hB3S9bIaco', quality: 'HD', category: 'drama' },
    { id: 'fallback8', title: 'Fight Club', year: 1999, poster: 'https://img.youtube.com/vi/P0AoKs_1_qM/maxresdefault.jpg', url: 'P0AoKs_1_qM', quality: 'HD', category: 'drama' }
  ]
};

// ===== GLOBAL STATE =====
let allMovies = [];
let displayedMovies = [];
let currentPage = 1;
let isLoading = false;

// ===== UTILITY FUNCTIONS =====
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[c]));
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '%22');
}

function showError(message) {
  const errorEl = document.getElementById('error-message');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(() => errorEl.style.display = 'none', 5000);
  } else {
    console.error(message);
  }
}

function showSuccess(message) {
  const successEl = document.getElementById('success-message');
  if (successEl) {
    successEl.textContent = message;
    successEl.style.display = 'block';
    setTimeout(() => successEl.style.display = 'none', 3000);
  } else {
    console.log(message);
  }
}

function showWarning(message) {
  const warningEl = document.getElementById('warning-message');
  if (warningEl) {
    warningEl.textContent = message;
    warningEl.style.display = 'block';
    setTimeout(() => warningEl.style.display = 'none', 5000);
  } else {
    console.warn(message);
  }
}

function showLoading(show = true) {
  const loadingEl = document.getElementById('loading');
  const statusEl = document.getElementById('status');

  if (loadingEl) {
    loadingEl.style.display = show ? 'flex' : 'none';
  }

  if (statusEl) {
    statusEl.style.display = show ? 'flex' : 'none';
  }
}

// ===== MOVIE FUNCTIONS =====
async function fetchMovies(signal) {
  try {
    const res = await fetch(CONFIG.API_URL, {
      signal,
      headers: { 'accept': 'application/json' }
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    // Convert Firestore format to our format
    const movies = data.documents?.map(doc => {
      const fields = doc.fields || {};
      return {
        id: doc.name.split('/').pop(),
        title: fields.title?.stringValue || 'Untitled',
        poster: fields.poster?.stringValue || fields.thumbnail?.stringValue || '/placeholder.jpg',
        url: fields.url?.stringValue || fields.youtubeId?.stringValue || '',
        desc: fields.desc?.stringValue || '',
        category: fields.category?.stringValue || 'general',
        year: fields.year?.integerValue || null,
        quality: fields.quality?.stringValue || 'HD',
        viewCount: fields.viewCount?.integerValue || 0,
        createdAt: fields.createdAt?.timestampValue || new Date().toISOString()
      };
    }) || [];

    return movies;
  } catch (err) {
    console.warn('Falling back to mock data:', err?.message || err);
    return CONFIG.FALLBACK_DATA;
  }
}

function renderMovieCard(movie) {
  return `
    <div class="movie-card" data-movie-id="${movie.id}">
      <div class="movie-poster-container">
        <img class="movie-poster" 
             src="${escapeAttr(movie.poster || '/placeholder.jpg')}" 
             alt="${escapeHtml(movie.title || 'Movie')}"
             loading="lazy"
             data-src="${escapeAttr(movie.poster || '/placeholder.jpg')}" />
        
        <div class="movie-overlay">
          <button class="play-btn" onclick="playMovie('${escapeAttr(movie.url)}', '${escapeAttr(movie.title)}')">
            ▶
          </button>
          <button class="info-btn" onclick="showMovieInfo('${escapeAttr(movie.id)}')">
            ℹ
          </button>
        </div>
      </div>
      
      <div class="movie-info">
        <h3 class="movie-title">${escapeHtml(movie.title || 'Untitled')}</h3>
        <div class="movie-meta">
          <span class="movie-year">${movie.year || '—'}</span>
          <span class="movie-quality">${movie.quality || 'HD'}</span>
          <span class="movie-views">👁 ${movie.viewCount || 0}</span>
        </div>
      </div>
    </div>
  `;
}

function renderMovies(movies, containerId = 'moviesGrid') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (movies.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <p style="color: var(--text-muted); font-size: 1.1rem;">
          ${containerId === 'moviesGrid' ? 'ไม่พบหนังที่ค้นหา' : 'ไม่พบข้อมูลหนัง'}
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = movies.map(movie => renderMovieCard(movie)).join('');

  // Setup lazy loading for images
  setupLazyLoading();
}

function placeholderThumb(url) {
  return url
    ? `https://img.youtube.com/vi/${encodeURIComponent(url)}/maxresdefault.jpg`
    : 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22336%22 height=%22189%22 viewBox=%220 0 336 189%22%3E%3Crect width=%22336%22 height=%22189%22 fill=%22%23111827%22/%3E%3C/svg%3E';
}

// ===== MOVIE ACTIONS =====
function playMovie(url, title) {
  if (!url) {
    showError('ไม่พบลิงก์วิดีโอ');
    return;
  }

  // Open watch page with YouTube ID or URL
  window.open(`watch.html?id=${encodeURIComponent(url)}`, '_blank');
  showSuccess(`กำลังเปิด: ${title}`);
}

function showMovieInfo(movieId) {
  const movie = allMovies.find(m => m.id == movieId);
  if (!movie) return;

  // Create modal or show movie details
  const info = `
    ข้อมูลหนัง:
    
    ชื่อ: ${movie.title}
    ปี: ${movie.year || 'ไม่ระบุ'}
    คุณภาพ: ${movie.quality || 'HD'}
    หมวดหมู่: ${movie.category || 'ไม่ระบุ'}
    ยอดวิว: ${movie.viewCount || 0} ครั้ง
    ${movie.desc ? `\nคำอธิบาย: ${movie.desc}` : ''}
  `;

  alert(info);
}

// ===== SEARCH FUNCTIONALITY =====
function searchMovies(query) {
  if (!query.trim()) {
    displayedMovies = [...allMovies];
  } else {
    const searchTerm = query.toLowerCase().trim();
    displayedMovies = allMovies.filter(movie =>
      (movie.title || '').toLowerCase().includes(searchTerm) ||
      (movie.year && movie.year.toString().includes(searchTerm)) ||
      (movie.category && movie.category.toLowerCase().includes(searchTerm)) ||
      (movie.desc && movie.desc.toLowerCase().includes(searchTerm))
    );
  }

  currentPage = 1;
  renderMovies(getMoviesForCurrentPage());
  updateLoadMoreButton();
}

function getMoviesForCurrentPage() {
  const startIndex = (currentPage - 1) * CONFIG.MOVIES_PER_PAGE;
  const endIndex = startIndex + CONFIG.MOVIES_PER_PAGE;
  return displayedMovies.slice(startIndex, endIndex);
}

function updateLoadMoreButton() {
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const hasMoreMovies = currentPage * CONFIG.MOVIES_PER_PAGE < displayedMovies.length;

  if (loadMoreBtn) {
    loadMoreBtn.style.display = hasMoreMovies ? 'inline-block' : 'none';
    loadMoreBtn.textContent = isLoading ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม';
    loadMoreBtn.disabled = isLoading;
  }
}

function loadMoreMovies() {
  if (isLoading) return;

  isLoading = true;
  currentPage++;

  const currentMovies = getMoviesForCurrentPage();
  const container = document.getElementById('moviesGrid');

  if (container) {
    const newMoviesHtml = currentMovies.map(movie => renderMovieCard(movie)).join('');
    container.insertAdjacentHTML('beforeend', newMoviesHtml);

    // Setup lazy loading for new images
    setupLazyLoading();
  }

  updateLoadMoreButton();
  isLoading = false;
}

// ===== LAZY LOADING =====
function setupLazyLoading() {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src && img.src !== img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px'
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// ===== AI YOUTUBE DATA EXTRACTION WITH GEMINI =====

// YouTube API configuration - API calls now go through Cloud Functions
const YOUTUBE_API_CONFIG = {
  BASE_URL: '/api/youtube', // Use Cloud Functions proxy
  QUOTA_LIMITS: {
    DAILY: 10000, // Free tier daily quota
    SEARCH: 100,   // Search costs 100 units
    VIDEO: 1      // Video details costs 1 unit
  },
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes cache
  RETRY_DELAY: 1000 // 1 second between requests
};

// Gemini AI configuration - API calls now go through Cloud Functions
const GEMINI_CONFIG = {
  BASE_URL: '/api/gemini', // Use Cloud Functions proxy
  MODEL: 'gemini-1.5-flash',
  CACHE_DURATION: 10 * 60 * 1000 // 10 minutes cache for AI responses
};

// Cache for API responses to reduce quota usage
const apiCache = new Map();
const geminiCache = new Map();
let lastRequestTime = 0;
let lastGeminiRequestTime = 0;

// Rate limiting to respect API quotas
async function rateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < YOUTUBE_API_CONFIG.RETRY_DELAY) {
    await new Promise(resolve => setTimeout(resolve, YOUTUBE_API_CONFIG.RETRY_DELAY - timeSinceLastRequest));
  }

  lastRequestTime = Date.now();
}

// Rate limiting for Gemini API
async function rateLimitGemini() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastGeminiRequestTime;

  if (timeSinceLastRequest < 1000) { // 1 second between Gemini requests
    await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastRequest));
  }

  lastGeminiRequestTime = Date.now();
}

// Check cache first to reduce API calls
function getCachedData(cacheKey) {
  const cached = apiCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < YOUTUBE_API_CONFIG.CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

// Check Gemini cache
function getCachedGeminiData(cacheKey) {
  const cached = geminiCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < GEMINI_CONFIG.CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

// Store data in cache
function setCachedData(cacheKey, data) {
  apiCache.set(cacheKey, {
    data: data,
    timestamp: Date.now()
  });
}

// Store Gemini cache
function setCachedGeminiData(cacheKey, data) {
  geminiCache.set(cacheKey, {
    data: data,
    timestamp: Date.now()
  });
}



// Enhanced movie description generation with Gemini AI through Cloud Functions
async function generateMovieDescription(title, channelTitle, duration) {
  try {
    const cacheKey = `desc_${title.substring(0, 50)}`;
    const cached = getCachedGeminiData(cacheKey);
    if (cached) {
      return cached;
    }

    await rateLimitGemini();

    const response = await fetch(`${GEMINI_CONFIG.BASE_URL}/description`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        channelTitle,
        duration
      })
    });

    if (!response.ok) {
      console.error('Gemini description generation error:', response.status);
      return `${title} - หนังเรื่องที่น่าสนใจจาก ${channelTitle || 'YouTube'}`;
    }

    const data = await response.json();
    const aiDescription = data.description?.trim();

    if (!aiDescription) {
      return `${title} - หนังเรื่องที่น่าสนใจจาก ${channelTitle || 'YouTube'}`;
    }

    // Cache the result
    setCachedGeminiData(cacheKey, aiDescription);

    console.log('AI generated description:', aiDescription);
    return aiDescription;

  } catch (error) {
    console.error('Error generating description with AI:', error);
    return `${title} - หนังที่ควรควรมาจาก ${channelTitle || 'YouTube'}`;
  }
}

// Extract year from video title with AI assistance through Cloud Functions
async function extractYearWithAI(title, description) {
  try {
    const cacheKey = `year_${title.substring(0, 30)}`;
    const cached = getCachedGeminiData(cacheKey);
    if (cached) {
      return cached;
    }

    await rateLimitGemini();

    const response = await fetch(`${GEMINI_CONFIG.BASE_URL}/extract-year`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description
      })
    });

    if (!response.ok) {
      console.error('Gemini year extraction error:', response.status);
      return extractYearFromTitle(title); // fallback
    }

    const data = await response.json();
    const extractedYear = data.year || extractYearFromTitle(title);

    // Cache the result
    setCachedGeminiData(cacheKey, extractedYear);

    console.log('AI extracted year:', extractedYear);
    return extractedYear;

  } catch (error) {
    console.error('Error extracting year with AI:', error);
    return extractYearFromTitle(title); // fallback
  }
}

// Extract YouTube video ID from various URL formats
function extractYouTubeId(urlOrId) {
  if (!urlOrId) return null;

  // If it's already a video ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId;
  }

  // Extract from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = urlOrId.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Generate YouTube embed URL
function generateEmbedUrl(youtubeId) {
  if (!youtubeId) return null;

  const params = new URLSearchParams({
    autoplay: 1,
    rel: 0,
    modestbranding: 1,
    controls: 1,
    disablekb: 0,
    fs: 1,
    cc_load_policy: 1,
    cc_lang_pref: 'th',
    hl: 'th'
  });

  return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`;
}

// Generate YouTube watch URL
function generateWatchUrl(youtubeId) {
  if (!youtubeId) return null;
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

// Fetch video data from YouTube API through Cloud Functions
async function fetchYouTubeData(youtubeId) {
  try {
    // Check cache first
    const cacheKey = `video_${youtubeId}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log('Using cached data for:', youtubeId);
      return cachedData;
    }

    // Rate limiting
    await rateLimit();

    console.log('Fetching YouTube data for:', youtubeId);

    // Use Cloud Functions proxy
    const response = await fetch(`${YOUTUBE_API_CONFIG.BASE_URL}/video?id=${youtubeId}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API Error:', response.status, errorText);

      if (response.status === 403) {
        throw new Error('API quota exceeded. Please try again later.');
      } else if (response.status === 400) {
        throw new Error('Invalid request. Please check the YouTube video ID.');
      } else {
        throw new Error(`YouTube API error: ${response.status}`);
      }
    }

    const data = await response.json();

    if (!data) {
      throw new Error('Video not found or private');
    }

    // Cache result
    setCachedData(cacheKey, data);

    return data;

  } catch (error) {
    console.error('Error fetching YouTube data:', error);

    // Fallback to mock data for testing
    if (error.message.includes('quota') || error.message.includes('API')) {
      showWarning('YouTube API quota exceeded. Using cached data or demo data.');
      return await fetchYouTubeDataMock(youtubeId);
    }

    throw error;
  }
}

// Search YouTube videos through Cloud Functions
async function searchYouTubeVideos(query, maxResults = 10) {
  try {
    const cacheKey = `search_${query}_${maxResults}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log('Using cached search results for:', query);
      return cachedData;
    }

    await rateLimit();

    console.log('Searching YouTube for:', query);

    const response = await fetch(`${YOUTUBE_API_CONFIG.BASE_URL}/search?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube Search API Error:', response.status, errorText);

      if (response.status === 403) {
        throw new Error('Search quota exceeded. Please try again later.');
      }
      throw new Error(`YouTube search error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data)) {
      return [];
    }

    // Cache search results
    setCachedData(cacheKey, data);

    return data;

  } catch (error) {
    console.error('Error searching YouTube:', error);
    throw error;
  }
}

// Mock YouTube data (for testing without API key)
async function fetchYouTubeDataMock(youtubeId) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock data based on common YouTube videos
  const mockData = {
    'vKQi3bBA1y8': {
      title: 'The Matrix (1999) - Official Trailer',
      description: 'Welcome to the Real World. The Matrix is a 1999 science fiction action film written and directed by the Wachowskis.',
      thumbnail: 'https://i.ytimg.com/vi/vKQi3bBA1y8/hqdefault.jpg',
      channelTitle: 'Warner Bros. Pictures',
      publishedAt: '2019-06-27T00:00:00Z',
      duration: 'PT2M31S',
      viewCount: 25000000,
      likeCount: 150000,
      tags: ['matrix', 'sci-fi', 'keanu reeves', 'action']
    },
    'zSWdZVtXT7E': {
      title: 'Interstellar (2014) - Official Trailer',
      description: 'Interstellar is a 2014 epic science fiction film directed by Christopher Nolan.',
      thumbnail: 'https://i.ytimg.com/vi/zSWdZVtXT7E/hqdefault.jpg',
      channelTitle: 'Paramount Pictures',
      publishedAt: '2014-12-12T00:00:00Z',
      duration: 'PT2M49S',
      viewCount: 45000000,
      likeCount: 280000,
      tags: ['interstellar', 'christopher nolan', 'space', 'sci-fi']
    }
  };

  // Return mock data or default
  return mockData[youtubeId] || {
    title: `YouTube Video ${youtubeId}`,
    description: 'Video description not available. Please add manually.',
    thumbnail: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    channelTitle: 'Unknown Channel',
    publishedAt: new Date().toISOString(),
    duration: 'PT0M0S',
    viewCount: 0,
    likeCount: 0,
    tags: []
  };
}

// Enhanced movie form with AI extraction
function setupAIExtraction() {
  const youtubeInput = document.getElementById('movieYoutubeId');
  const titleInput = document.getElementById('movieTitle');
  const thumbnailInput = document.getElementById('movieThumbnail');
  const descriptionInput = document.getElementById('movieDescription');
  const categorySelect = document.getElementById('movieCategory');

  if (youtubeInput) {
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '0.5rem';
    buttonContainer.style.marginTop = '0.5rem';

    // Add extract button
    const extractButton = document.createElement('button');
    extractButton.type = 'button';
    extractButton.className = 'action-btn secondary';
    extractButton.innerHTML = '🤖 AI ดึงข้อมูล';
    extractButton.onclick = () => extractVideoData();

    // Add search button for finding videos
    const searchButton = document.createElement('button');
    searchButton.type = 'button';
    searchButton.className = 'action-btn';
    searchButton.innerHTML = '🔍 ค้นหาวิดีโอ';
    searchButton.onclick = () => searchAndSelectVideo();

    buttonContainer.appendChild(extractButton);
    buttonContainer.appendChild(searchButton);

    // Add buttons after input
    youtubeInput.parentNode.appendChild(buttonContainer);

    // Auto-extract on paste/change
    youtubeInput.addEventListener('change', () => {
      const id = extractYouTubeId(youtubeInput.value);
      if (id) {
        extractVideoData();
      }
    });

    // Add paste event listener
    youtubeInput.addEventListener('paste', (e) => {
      setTimeout(() => {
        const id = extractYouTubeId(youtubeInput.value);
        if (id) {
          extractVideoData();
        }
      }, 100);
    });

    // Add search functionality to title input
    if (titleInput) {
      const searchTitleButton = document.createElement('button');
      searchTitleButton.type = 'button';
      searchTitleButton.className = 'action-btn';
      searchTitleButton.innerHTML = '🔍 ค้นหาจากชื่อ';
      searchTitleButton.style.marginLeft = '0.5rem';
      searchTitleButton.onclick = () => searchByTitle();

      titleInput.parentNode.appendChild(searchTitleButton);
    }
  }
}

// Search by title
async function searchByTitle() {
  const titleInput = document.getElementById('movieTitle');
  const searchQuery = titleInput ? titleInput.value.trim() : '';

  if (!searchQuery) {
    showError('กรุณาใส่ชื่อหนังที่ต้องการค้นหา');
    return;
  }

  try {
    showLoading(true);
    showSuccess('🔍 กำลังค้นหาวิดีโอจากชื่อ...');

    const videos = await searchYouTubeVideos(searchQuery, 5);

    if (videos.length === 0) {
      showError('ไม่พบวิดีโอที่ตรงกับการค้นหา');
      return;
    }

    // Show video selection modal
    showVideoSelectionModal(videos);

  } catch (error) {
    showError('ไม่สามารถค้นหาวิดีโอได้: ' + error.message);
  } finally {
    showLoading(false);
  }
}

// Search and select video
async function searchAndSelectVideo() {
  const titleInput = document.getElementById('movieTitle');
  const searchQuery = titleInput ? titleInput.value.trim() : '';

  if (!searchQuery) {
    showError('กรุณาใส่ชื่อหนังที่ต้องการค้นหา');
    return;
  }

  try {
    showLoading(true);
    showSuccess('🔍 กำลังค้นหาวิดีโอ...');

    const videos = await searchYouTubeVideos(searchQuery, 5);

    if (videos.length === 0) {
      showError('ไม่พบวิดีโอที่ตรงกับการค้นหา');
      return;
    }

    // Show video selection modal
    showVideoSelectionModal(videos);

  } catch (error) {
    showError('ไม่สามารถค้นหาวิดีโอได้: ' + error.message);
  } finally {
    showLoading(false);
  }
}

// Show video selection modal
function showVideoSelectionModal(videos) {
  // Remove existing modal
  const existingModal = document.getElementById('videoSelectionModal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'videoSelectionModal';
  modal.className = 'modal';
  modal.style.display = 'flex';

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 800px; max-height: 80vh; overflow-y: auto;">
      <div class="modal-header">
        <h3>🔍 เลือกวิดีโอที่ต้องการ</h3>
        <button class="modal-close" onclick="closeVideoSelectionModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
          ${videos.map(video => `
            <div class="video-option" onclick="selectVideo('${video.videoId}', '${escapeHtml(video.title)}', '${video.thumbnail}', '${escapeHtml(video.description)}')" style="cursor: pointer; padding: 1rem; border: 1px solid var(--border-primary); border-radius: var(--radius-md); transition: var(--transition-fast);">
              <img src="${video.thumbnail}" alt="${escapeHtml(video.title)}" style="width: 100%; border-radius: var(--radius-sm); margin-bottom: 0.5rem;">
              <h5 style="margin: 0.5rem 0; font-size: 0.9rem;">${escapeHtml(video.title)}</h5>
              <p style="margin: 0; color: var(--text-secondary); font-size: 0.8rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(video.description)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Select video from modal
function selectVideo(videoId, title, thumbnail, description) {
  const youtubeInput = document.getElementById('movieYoutubeId');
  const titleInput = document.getElementById('movieTitle');
  const thumbnailInput = document.getElementById('movieThumbnail');
  const descriptionInput = document.getElementById('movieDescription');

  if (youtubeInput) youtubeInput.value = videoId;
  if (titleInput && !titleInput.value) titleInput.value = title;
  if (thumbnailInput && !thumbnailInput.value) thumbnailInput.value = thumbnail;
  if (descriptionInput && !descriptionInput.value) descriptionInput.value = description;

  closeVideoSelectionModal();
  extractVideoData();
}

// Close video selection modal
function closeVideoSelectionModal() {
  const modal = document.getElementById('videoSelectionModal');
  if (modal) {
    modal.remove();
  }
}

// Show warning message
function showWarning(message) {
  const warningDiv = document.createElement('div');
  warningDiv.className = 'warning-message';
  warningDiv.textContent = message;
  warningDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f59e0b;
    color: white;
    padding: 1rem;
    border-radius: var(--radius-md);
    z-index: 10000;
    max-width: 300px;
  `;

  document.body.appendChild(warningDiv);

  setTimeout(() => {
    warningDiv.remove();
  }, 5000);
}

// Extract video data and fill form with AI enhancement
async function extractVideoData() {
  const youtubeInput = document.getElementById('movieYoutubeId');
  const titleInput = document.getElementById('movieTitle');
  const thumbnailInput = document.getElementById('movieThumbnail');
  const descriptionInput = document.getElementById('movieDescription');
  const categorySelect = document.getElementById('movieCategory');
  const yearInput = document.getElementById('movieYear');

  if (!youtubeInput) return;

  const urlOrId = youtubeInput.value.trim();
  const youtubeId = extractYouTubeId(urlOrId);

  if (!youtubeId) {
    showError('รูปแบบ YouTube URL ไม่ถูกต้อง');
    return;
  }

  // Update input to clean ID
  youtubeInput.value = youtubeId;

  try {
    showLoading(true);
    showSuccess('🤖 AI กำลังดึงข้อมูลจาก YouTube...');

    const videoData = await fetchYouTubeData(youtubeId);

    // Use AI to enhance the data
    const enhancedCategory = await detectCategoryWithAI(
      videoData.title,
      videoData.description,
      videoData.tags
    );

    const enhancedDescription = await generateMovieDescription(
      videoData.title,
      videoData.channelTitle,
      videoData.duration
    );

    const enhancedYear = await extractYearWithAI(
      videoData.title,
      videoData.description
    );

    // Fill form with enhanced data
    if (titleInput && !titleInput.value) {
      titleInput.value = videoData.title;
    }

    if (yearInput && !yearInput.value) {
      yearInput.value = enhancedYear;
    }

    if (thumbnailInput && !thumbnailInput.value) {
      thumbnailInput.value = videoData.thumbnail;
    }

    if (descriptionInput && !descriptionInput.value) {
      descriptionInput.value = enhancedDescription;
    }

    // Auto-detect category from AI analysis
    if (categorySelect && !categorySelect.value) {
      categorySelect.value = enhancedCategory;
    }

    showSuccess('✅ AI ดึงข้อมูลสำเร็จ! หมวดหมู่: ' + enhancedCategory);

    // Show enhanced preview
    showVideoPreview({
      ...videoData,
      category: enhancedCategory,
      description: enhancedDescription,
      year: enhancedYear
    });

  } catch (error) {
    showError('ไม่สามารถดึงข้อมูลได้: ' + error.message);
  } finally {
    showLoading(false);
  }
}

// Detect movie category from title and tags
function detectCategory(title, tags) {
  const keywords = {
    'action': ['action', 'fight', 'battle', 'war', 'gun', 'explosion'],
    'horror': ['horror', 'scary', 'ghost', 'monster', 'fear', 'terror'],
    'comedy': ['comedy', 'funny', 'laugh', 'humor', 'joke'],
    'romance': ['romance', 'love', 'romantic', 'kiss', 'heart'],
    'sci-fi': ['sci-fi', 'science fiction', 'space', 'future', 'alien', 'robot'],
    'thriller': ['thriller', 'suspense', 'mystery', 'detective', 'crime'],
    'drama': ['drama', 'emotional', 'family', 'relationship'],
    'crime': ['crime', 'criminal', 'police', 'detective', 'murder']
  };

  const searchText = (title + ' ' + (tags || []).join(' ')).toLowerCase();

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => searchText.includes(word))) {
      return category;
    }
  }

  return 'action'; // Default category
}

// Show enhanced video preview with AI data
function showVideoPreview(videoData) {
  const existingPreview = document.getElementById('videoPreview');
  if (existingPreview) {
    existingPreview.remove();
  }

  const form = document.getElementById('movieForm');
  if (!form) return;

  const previewDiv = document.createElement('div');
  previewDiv.id = 'videoPreview';
  previewDiv.className = 'admin-card';
  previewDiv.style.marginBottom = '1.5rem';
  previewDiv.innerHTML = `
    <h4 style="margin-bottom: 1rem; color: var(--accent-primary);">📹 ตัวอย่างวิดีโอ (AI Enhanced)</h4>
    <div style="display: grid; grid-template-columns: 200px 1fr; gap: 1rem;">
      <img src="${videoData.thumbnail}" alt="Video thumbnail" style="width: 100%; border-radius: var(--radius-md);">
      <div>
        <h5 style="margin-bottom: 0.5rem;">${escapeHtml(videoData.title)}</h5>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.85rem;">
          <span style="background: var(--accent-primary); color: white; padding: 0.2rem 0.5rem; border-radius: var(--radius-sm);">
            ${videoData.year || 'N/A'}
          </span>
          <span style="background: var(--accent-blue); color: white; padding: 0.2rem 0.5rem; border-radius: var(--radius-sm);">
            ${videoData.quality || 'HD'}
          </span>
          ${videoData.category ? `
            <span style="background: var(--accent-green); color: white; padding: 0.2rem 0.5rem; border-radius: var(--radius-sm);">
              ${videoData.category.toUpperCase()}
            </span>
          ` : ''}
        </div>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; line-height: 1.4;">
          ${escapeHtml(videoData.description.substring(0, 300))}
        </p>
        <div style="display: flex; gap: 1rem; font-size: 0.85rem; color: var(--text-muted);">
          <span>👁 ${(videoData.viewCount || 0).toLocaleString()} views</span>
          <span>👍 ${(videoData.likeCount || 0).toLocaleString()} likes</span>
          <span>📺 ${escapeHtml(videoData.channelTitle)}</span>
          ${videoData.duration ? `<span>⏱️ ${videoData.duration}</span>` : ''}
        </div>
        <div style="margin-top: 0.5rem; padding: 0.5rem; background: var(--bg-secondary); border-radius: var(--radius-sm); font-size: 0.8rem;">
          <strong style="color: var(--accent-primary);">🤖 AI Enhanced Data:</strong>
          <ul style="margin: 0.25rem 0; padding-left: 1rem; color: var(--text-secondary);">
            <li>Category: <strong style="color: var(--text-primary);">${videoData.category || 'N/A'}</strong></li>
            <li>Year: <strong style="color: var(--text-primary);">${videoData.year || 'N/A'}</strong></li>
            <li>Description: <strong style="color: var(--text-primary);">AI Generated</strong></li>
          </ul>
        </div>
      </div>
    </div>
  `;

  form.insertBefore(previewDiv, form.firstChild);
}

// Enhanced watch page with better YouTube integration
function initWatchPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const youtubeId = urlParams.get('id');
  const videoContainer = document.getElementById('videoContainer');
  const videoWrapper = document.getElementById('videoWrapper');
  const movieDetails = document.getElementById('movieDetails');
  const status = document.getElementById('status');
  const movieTitle = document.getElementById('movieTitle');
  const youtubeLink = document.getElementById('youtubeLink');

  if (!youtubeId) {
    if (status) {
      status.textContent = 'ไม่พบรหัสวิดีโอ (id)';
      status.style.display = 'block';
    }
    return;
  }

  // Hide status and show video player
  if (status) status.style.display = 'none';

  // Setup video player with enhanced options
  if (videoContainer && videoWrapper) {
    const embedUrl = generateEmbedUrl(youtubeId);
    videoContainer.innerHTML = `
      <iframe src="${embedUrl}" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen 
              title="YouTube player">
      </iframe>
    `;
    videoWrapper.style.display = 'block';
  }

  // Load enhanced movie details
  if (movieDetails) {
    movieDetails.style.display = 'grid';

    // Try to load from our database first
    const movie = window.MovieFlix?.allMovies?.find(m => m.youtubeId === youtubeId);

    if (movie) {
      updateWatchPageDetails(movie);
    } else {
      // Fallback to YouTube data
      loadYouTubeWatchData(youtubeId);
    }
  }
}

// Load YouTube data for watch page
async function loadYouTubeWatchData(youtubeId) {
  try {
    const videoData = await fetchYouTubeData(youtubeId);

    const movie = {
      title: videoData.title,
      description: videoData.description,
      year: extractYearFromTitle(videoData.title),
      quality: 'HD',
      category: detectCategory(videoData.title, videoData.tags),
      thumbnail: videoData.thumbnail,
      youtubeId: youtubeId
    };

    updateWatchPageDetails(movie);

  } catch (error) {
    console.error('Error loading YouTube data:', error);
    // Fallback to basic info
    updateWatchPageDetails({
      title: `YouTube Video ${youtubeId}`,
      description: 'Video information not available',
      year: new Date().getFullYear(),
      quality: 'HD',
      category: 'general',
      youtubeId: youtubeId
    });
  }
}

// Update watch page details
function updateWatchPageDetails(movie) {
  const movieTitle = document.getElementById('movieTitle');
  const movieDescription = document.getElementById('movieDescription');
  const youtubeLink = document.getElementById('youtubeLink');

  if (movieTitle) movieTitle.textContent = movie.title;
  if (movieDescription) movieDescription.textContent = movie.description;
  if (youtubeLink) {
    youtubeLink.href = generateWatchUrl(movie.youtubeId);
    youtubeLink.textContent = 'ดูใน YouTube';
  }
}

// Extract year from video title
function extractYearFromTitle(title) {
  const yearMatch = title.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
}

// ===== INITIALIZATION =====
async function initApp() {
  try {
    showLoading(true);

    // Load all movies
    allMovies = await fetchMovies(new AbortController().signal);
    displayedMovies = [...allMovies];

    // Render initial movies
    renderMovies(getMoviesForCurrentPage());
    updateLoadMoreButton();

    showLoading(false);
    showSuccess(`โหลดหนังสำเร็จ ${allMovies.length} เรื่อง`);

  } catch (error) {
    console.error('Error initializing app:', error);
    showError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    showLoading(false);
  }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Search functionality
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchMovies(e.target.value);
      }, 300);
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchMovies(e.target.value);
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchMovies(searchInput.value);
      }
    });
  }

  // Load more button
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', loadMoreMovies);
  }

  // Navigation active state
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      navLinks.forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  // Category cards
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const categoryName = card.querySelector('.category-name').textContent;
      searchMovies(categoryName);
      showSuccess(`กรองหมวดหมู่: ${categoryName}`);

      // Scroll to movies section
      const moviesSection = document.getElementById('movies');
      if (moviesSection) {
        moviesSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Smooth scroll for anchor links
  const videoWrapper = document.getElementById('videoWrapper');
  const movieDetails = document.getElementById('movieDetails');
  const status = document.getElementById('status');
  const movieTitle = document.getElementById('movieTitle');
  const youtubeLink = document.getElementById('youtubeLink');

  if (!youtubeId) {
    if (status) {
      status.textContent = 'ไม่พบรหัสวิดีโอ (id)';
      status.style.display = 'block';
    }
    return;
  }

  // Hide status and show video player
  if (status) status.style.display = 'none';

  // Setup video player
  if (videoContainer && videoWrapper) {
    const embed = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&rel=0&modestbranding=1`;
    videoContainer.innerHTML = `
      <iframe src="${embed}" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen 
              title="YouTube player">
      </iframe>
    `;
    videoWrapper.style.display = 'block';
  }

  // Setup movie details
  if (movieDetails) {
    movieDetails.style.display = 'grid';

    // Try to find movie info from the main movie data
    const movie = window.MovieFlix?.allMovies?.find(m => m.youtubeId === youtubeId);

    if (movie) {
      if (movieTitle) movieTitle.textContent = movie.title;
      if (youtubeLink) {
        youtubeLink.href = `https://www.youtube.com/watch?v=${encodeURIComponent(youtubeId)}`;
        youtubeLink.textContent = 'ดูใน YouTube';
      }
    } else {
      if (movieTitle) movieTitle.textContent = 'กำลังเล่นวิดีโอ';
      if (youtubeLink) {
        youtubeLink.href = `https://www.youtube.com/watch?v=${encodeURIComponent(youtubeId)}`;
        youtubeLink.textContent = 'ดูใน YouTube';
      }
    }
  }
}

// ===== ADMIN FUNCTIONS =====
function initAdminDashboard() {
  // Load movies from storage first
  loadMoviesFromStorage();

  // Load dashboard data
  loadDashboardData();

  // Setup event listeners
  setupAdminEventListeners();

  // Setup AI extraction
  setupAIExtraction();

  // Show dashboard section by default
  showAdminSection('dashboard');
}

function loadDashboardData() {
  // Mock data for admin dashboard
  const mockData = {
    totalMovies: allMovies.length || 8,
    todayMovies: 2,
    totalUsers: 1204,
    totalViews: 15420,
    recentActivity: [
      { time: '2 นาทีที่แล้ว', action: 'เพิ่มหนัง', details: 'The Matrix', user: 'Admin' },
      { time: '15 นาทีที่แล้ว', action: 'แก้ไขหนัง', details: 'Inception', user: 'Admin' },
      { time: '1 ชั่วโมงที่แล้ว', action: 'ลบหนัง', details: 'Old Movie', user: 'Admin' },
      { time: '2 ชั่วโมงที่แล้ว', action: 'ดูหนัง', details: 'Interstellar', user: 'User123' }
    ]
  };

  // Update metrics
  updateElement('total-movies', mockData.totalMovies.toLocaleString());
  updateElement('today-movies', mockData.todayMovies);
  updateElement('total-users', mockData.totalUsers.toLocaleString());
  updateElement('total-views', mockData.totalViews.toLocaleString());

  // Update activity table
  const activityRows = document.getElementById('activity-rows');
  if (activityRows) {
    activityRows.innerHTML = mockData.recentActivity.map(activity => `
      <tr>
        <td>${activity.time}</td>
        <td>${activity.action}</td>
        <td>${activity.details}</td>
        <td>${activity.user}</td>
      </tr>
    `).join('');
  }
}

function setupAdminEventListeners() {
  // Navigation
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      showAdminSection(targetId);

      // Update active state
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Refresh dashboard
  const refreshBtn = document.getElementById('refreshDashboard');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'กำลังรีเฟรช...';
      setTimeout(() => {
        loadDashboardData();
        refreshBtn.disabled = false;
        refreshBtn.textContent = '🔄 รีเฟรช';
        showSuccess('รีเฟรชข้อมูลสำเร็จ');
      }, 1000);
    });
  }

  // Movie search
  const movieSearch = document.getElementById('movieSearch');
  if (movieSearch) {
    movieSearch.addEventListener('input', (e) => {
      searchAdminMovies(e.target.value);
    });
  }

  // Movie form
  const movieForm = document.getElementById('movieForm');
  if (movieForm) {
    movieForm.addEventListener('submit', handleMovieFormSubmit);
  }
}

function showAdminSection(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll('.admin-section');
  sections.forEach(section => section.style.display = 'none');

  // Show target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';

    // Load section-specific data
    if (sectionId === 'movies') {
      loadAdminMovies();
    }
  }
}

function loadAdminMovies() {
  const container = document.getElementById('adminMoviesGrid');
  if (!container) return;

  if (allMovies.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <p style="color: var(--text-muted);">ไม่มีข้อมูลหนัง</p>
        <button class="action-btn" onclick="showAddMovieForm()" style="margin-top: 1rem;">
          ➕ เพิ่มหนังแรก
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = allMovies.map(movie => renderAdminMovieCard(movie)).join('');
}

function renderAdminMovieCard(movie) {
  return `
    <div class="admin-movie-card" data-movie-id="${movie.id}">
      <img class="admin-movie-poster" 
           src="${movie.thumbnail || placeholderThumb(movie.youtubeId)}" 
           alt="${escapeHtml(movie.title)}"
           loading="lazy" />
      
      <div class="admin-movie-info">
        <h3 class="admin-movie-title">${escapeHtml(movie.title)}</h3>
        <div class="admin-movie-meta">
          <span class="movie-year">${movie.year}</span>
          <span class="movie-quality">${movie.quality || 'HD'}</span>
          <span class="status-badge active">${movie.category || 'general'}</span>
        </div>
        
        <div class="admin-movie-actions">
          <button class="admin-btn edit" onclick="editMovie('${movie.id}')">
            ✏️ แก้ไข
          </button>
          <button class="admin-btn delete" onclick="confirmDeleteMovie('${movie.id}')">
            🗑️ ลบ
          </button>
        </div>
      </div>
    </div>
  `;
}

function searchAdminMovies(query) {
  const container = document.getElementById('adminMoviesGrid');
  if (!container) return;

  if (!query.trim()) {
    loadAdminMovies();
    return;
  }

  const filtered = allMovies.filter(movie =>
    (movie.title || '').toLowerCase().includes(query.toLowerCase()) ||
    (movie.year && movie.year.toString().includes(query)) ||
    (movie.category && movie.category.toLowerCase().includes(query))
  );

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <p style="color: var(--text-muted);">ไม่พบหนังที่ค้นหา: "${escapeHtml(query)}"</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(movie => renderAdminMovieCard(movie)).join('');
}

function showAddMovieForm() {
  // Clear form
  clearMovieForm();

  // Update submit button text
  updateElement('submitBtnText', '💾 บันทึกหนัง');

  // Show add movie section
  showAdminSection('add-movie');
}

function editMovie(movieId) {
  const movie = allMovies.find(m => m.id == movieId);
  if (!movie) return;

  // Fill form with movie data
  updateElement('movieId', movie.id);
  updateElement('movieTitle', movie.title);
  updateElement('movieYear', movie.year);
  updateElement('movieCategory', movie.category || '');
  updateElement('movieQuality', movie.quality || 'HD');
  updateElement('movieYoutubeId', movie.youtubeId);
  updateElement('movieThumbnail', movie.thumbnail || '');
  updateElement('movieDescription', movie.description || '');

  // Update submit button text
  updateElement('submitBtnText', '💾 อัปเดตหนัง');

  // Show add movie section
  showAdminSection('add-movie');
}

function handleMovieFormSubmit(e) {
  e.preventDefault();

  const movieId = document.getElementById('movieId').value;
  const movieData = {
    title: document.getElementById('movieTitle').value,
    year: parseInt(document.getElementById('movieYear').value),
    category: document.getElementById('movieCategory').value,
    quality: document.getElementById('movieQuality').value,
    youtubeId: document.getElementById('movieYoutubeId').value,
    thumbnail: document.getElementById('movieThumbnail').value,
    description: document.getElementById('movieDescription').value
  };

  // Validate required fields
  if (!movieData.title || !movieData.year || !movieData.youtubeId) {
    showError('กรุณากรอกข้อมูลที่จำเป็นทั้งหมด');
    return;
  }

  // Generate thumbnail if not provided
  if (!movieData.thumbnail) {
    movieData.thumbnail = `https://i.ytimg.com/vi/${movieData.youtubeId}/hqdefault.jpg`;
  }

  if (movieId) {
    // Update existing movie
    updateMovie(movieId, movieData);
  } else {
    // Add new movie
    addMovie(movieData);
  }
}

function addMovie(movieData) {
  const newMovie = {
    id: Date.now().toString(),
    ...movieData,
    createdAt: new Date().toISOString()
  };

  allMovies.push(newMovie);
  saveMoviesToStorage();

  showSuccess(`เพิ่มหนัง "${movieData.title}" สำเร็จ`);

  // Update dashboard and go to movies list
  loadDashboardData();
  showAdminSection('movies');
  loadAdminMovies();
}

function updateMovie(movieId, movieData) {
  const movieIndex = allMovies.findIndex(m => m.id == movieId);
  if (movieIndex === -1) return;

  allMovies[movieIndex] = {
    ...allMovies[movieIndex],
    ...movieData,
    updatedAt: new Date().toISOString()
  };

  saveMoviesToStorage();

  showSuccess(`อัปเดตหนัง "${movieData.title}" สำเร็จ`);

  // Update displayed movies if on movies page
  if (document.getElementById('adminMoviesGrid')) {
    loadAdminMovies();
  }

  // Go back to movies list
  showAdminSection('movies');
}

function confirmDeleteMovie(movieId) {
  const movie = allMovies.find(m => m.id == movieId);
  if (!movie) return;

  // Show confirmation modal
  const modal = document.getElementById('movieModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');

  if (modal && modalTitle && modalContent) {
    modalTitle.textContent = 'ยืนยันการลบหนัง';
    modalContent.innerHTML = `
      <div style="text-align: center; padding: 1rem;">
        <h4 style="color: var(--text-primary); margin-bottom: 1rem;">
          คุณต้องการลบหนัง "${escapeHtml(movie.title)}" ?
        </h4>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
          การกระทำนี้ไม่สามารถย้อนกลับได้
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button class="action-btn secondary" onclick="closeModal()">
            ยกเลิก
          </button>
          <button class="admin-btn delete" onclick="deleteMovie('${movieId}')">
            🗑️ ลบหนัง
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }
}

function deleteMovie(movieId) {
  const movie = allMovies.find(m => m.id == movieId);
  if (!movie) return;

  // Remove movie from array
  allMovies = allMovies.filter(m => m.id != movieId);
  saveMoviesToStorage();

  showSuccess(`ลบหนัง "${movie.title}" สำเร็จ`);

  // Close modal
  closeModal();

  // Update movies list
  loadAdminMovies();
  loadDashboardData();
}

function cancelMovieForm() {
  clearMovieForm();
  showAdminSection('movies');
}

function clearMovieForm() {
  const form = document.getElementById('movieForm');
  if (form) {
    form.reset();
    document.getElementById('movieId').value = '';
  }
}

function closeModal() {
  const modal = document.getElementById('movieModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function saveMoviesToStorage() {
  // Save to localStorage (in real app, this would save to backend)
  try {
    localStorage.setItem('admin_movies', JSON.stringify(allMovies));

    // Also update the main movie list for frontend
    if (window.MovieFlix) {
      window.MovieFlix.allMovies = [...allMovies];
      window.MovieFlix.displayedMovies = [...allMovies];
    }
  } catch (error) {
    console.error('Error saving movies:', error);
  }
}

function loadMoviesFromStorage() {
  // Load from localStorage (in real app, this would load from backend)
  try {
    const stored = localStorage.getItem('admin_movies');
    if (stored) {
      allMovies = JSON.parse(stored);
      return true;
    }
  } catch (error) {
    console.error('Error loading movies:', error);
  }
  return false;
}

function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

// Make admin functions globally available
window.AdminFunctions = {
  showAddMovieForm,
  editMovie,
  confirmDeleteMovie,
  deleteMovie,
  cancelMovieForm,
  closeModal
};

// ===== PAGE DETECTION & INIT =====
document.addEventListener('DOMContentLoaded', function () {
  // Detect current page and initialize accordingly
  const currentPath = window.location.pathname;
  const isWatchPage = currentPath.includes('watch.html');
  const isAdminPage = currentPath.includes('admin.html');

  if (isWatchPage) {
    initWatchPage();
  } else if (isAdminPage) {
    initAdminDashboard();
  } else {
    // Frontend page
    initApp();
    setupEventListeners();
  }
});

// ===== EXPORTS =====
window.MovieFlix = {
  fetchMovies,
  renderMovies,
  searchMovies,
  playMovie,
  showMovieInfo,
  showError,
  showSuccess,
  showLoading,
  CONFIG,
  allMovies,
  displayedMovies
};
