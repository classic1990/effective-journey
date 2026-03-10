// Firestore Database Functions for 25-HD Movie Streaming
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// CORS middleware
const cors = require('cors')({ origin: true });

// ===== MOVIES FROM FIRESTORE =====

// Get all movies from Firestore
exports.getFirestoreMovies = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const db = admin.firestore();
      const { category, limit = 50, offset = 0 } = req.query;
      
      let query = db.collection('movies').orderBy('createdAt', 'desc');
      
      // Filter by category if specified
      if (category && category !== 'all') {
        query = query.where('category', '==', category);
      }
      
      // Apply pagination
      query = query.limit(parseInt(limit)).offset(parseInt(offset));
      
      const snapshot = await query.get();
      
      const movies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure required fields
        title: doc.data().title || 'Untitled',
        poster: doc.data().poster || doc.data().thumbnail || '/placeholder.jpg',
        url: doc.data().url || doc.data().youtubeId || '',
        viewCount: doc.data().viewCount || 0,
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
      res.json(movies);
    } catch (error) {
      console.error('Error fetching movies from Firestore:', error);
      res.status(500).json({ error: 'Failed to fetch movies' });
    }
  });
});

// Get single movie from Firestore
exports.getFirestoreMovie = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const { movieId } = req.query;
      
      if (!movieId) {
        return res.status(400).json({ error: 'Movie ID is required' });
      }
      
      const db = admin.firestore();
      const doc = await db.collection('movies').doc(movieId).get();
      
      if (!doc.exists) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      
      const movie = {
        id: doc.id,
        ...doc.data(),
        // Ensure required fields
        title: doc.data().title || 'Untitled',
        poster: doc.data().poster || doc.data().thumbnail || '/placeholder.jpg',
        url: doc.data().url || doc.data().youtubeId || '',
        viewCount: doc.data().viewCount || 0,
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      };
      
      // Increment view count
      await doc.ref.update({
        viewCount: admin.firestore.FieldValue.increment(1),
        lastViewed: admin.firestore.FieldValue.serverTimestamp()
      });
      
      res.json(movie);
    } catch (error) {
      console.error('Error fetching movie from Firestore:', error);
      res.status(500).json({ error: 'Failed to fetch movie' });
    }
  });
});

// Get series from Firestore
exports.getFirestoreSeries = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const db = admin.firestore();
      const { limit = 50, offset = 0 } = req.query;
      
      const snapshot = await db
        .collection('series')
        .orderBy('createdAt', 'desc')
        .limit(parseInt(limit))
        .offset(parseInt(offset))
        .get();
      
      const series = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure required fields
        title: doc.data().title || 'Untitled',
        poster: doc.data().poster || '/placeholder.jpg',
        episodes: doc.data().episodes || [],
        viewCount: doc.data().viewCount || 0,
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
      res.json(series);
    } catch (error) {
      console.error('Error fetching series from Firestore:', error);
      res.status(500).json({ error: 'Failed to fetch series' });
    }
  });
});

// Search movies and series
exports.searchFirestore = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const { q, type = 'all', limit = 20 } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const db = admin.firestore();
      const searchQuery = q.toLowerCase();
      const results = [];
      
      // Search movies
      if (type === 'all' || type === 'movies') {
        const moviesSnapshot = await db
          .collection('movies')
          .orderBy('title')
          .limit(100) // Limit for performance
          .get();
        
        const matchingMovies = moviesSnapshot.docs
          .filter(doc => {
            const data = doc.data();
            return data.title?.toLowerCase().includes(searchQuery) ||
                   data.desc?.toLowerCase().includes(searchQuery);
          })
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: 'movie',
            poster: doc.data().poster || doc.data().thumbnail || '/placeholder.jpg',
            url: doc.data().url || doc.data().youtubeId || '',
            viewCount: doc.data().viewCount || 0
          }))
          .slice(0, parseInt(limit));
        
        results.push(...matchingMovies);
      }
      
      // Search series
      if (type === 'all' || type === 'series') {
        const seriesSnapshot = await db
          .collection('series')
          .orderBy('title')
          .limit(100) // Limit for performance
          .get();
        
        const matchingSeries = seriesSnapshot.docs
          .filter(doc => {
            const data = doc.data();
            return data.title?.toLowerCase().includes(searchQuery) ||
                   data.desc?.toLowerCase().includes(searchQuery);
          })
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: 'series',
            poster: doc.data().poster || '/placeholder.jpg',
            viewCount: doc.data().viewCount || 0
          }))
          .slice(0, parseInt(limit));
        
        results.push(...matchingSeries);
      }
      
      // Sort by relevance and limit results
      const sortedResults = results
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, parseInt(limit));
      
      res.json(sortedResults);
    } catch (error) {
      console.error('Error searching Firestore:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });
});

// Get categories/genres
exports.getCategories = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const db = admin.firestore();
      
      // Get unique categories from movies
      const moviesSnapshot = await db.collection('movies').select('category').get();
      const categories = new Set();
      
      moviesSnapshot.docs.forEach(doc => {
        const category = doc.data().category;
        if (category) {
          categories.add(category);
        }
      });
      
      // Add common categories
      const allCategories = [
        ...Array.from(categories),
        'action', 'drama', 'comedy', 'horror', 'sci-fi', 'thriller', 'romance', 'crime'
      ].filter(cat => cat && typeof cat === 'string');
      
      // Remove duplicates and sort
      const uniqueCategories = [...new Set(allCategories)].sort();
      
      res.json(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });
});

// Get popular movies (by view count)
exports.getPopularMovies = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const db = admin.firestore();
      const { limit = 20 } = req.query;
      
      const snapshot = await db
        .collection('movies')
        .orderBy('viewCount', 'desc')
        .limit(parseInt(limit))
        .get();
      
      const movies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        poster: doc.data().poster || doc.data().thumbnail || '/placeholder.jpg',
        url: doc.data().url || doc.data().youtubeId || '',
        viewCount: doc.data().viewCount || 0
      }));
      
      res.json(movies);
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      res.status(500).json({ error: 'Failed to fetch popular movies' });
    }
  });
});

// Get latest movies
exports.getLatestMovies = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const db = admin.firestore();
      const { limit = 20 } = req.query;
      
      const snapshot = await db
        .collection('movies')
        .orderBy('createdAt', 'desc')
        .limit(parseInt(limit))
        .get();
      
      const movies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        poster: doc.data().poster || doc.data().thumbnail || '/placeholder.jpg',
        url: doc.data().url || doc.data().youtubeId || '',
        viewCount: doc.data().viewCount || 0
      }));
      
      res.json(movies);
    } catch (error) {
      console.error('Error fetching latest movies:', error);
      res.status(500).json({ error: 'Failed to fetch latest movies' });
    }
  });
});
