// Firebase Cloud Functions - 25-HD Movie Streaming Website

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// CORS middleware
const cors = require('cors')({ origin: true });

// Admin configuration
const ADMIN_EMAILS = process.env.ADMIN_EMAILS || 'duy.kan1234@gmail.com';

// ===== PUBLIC API FUNCTIONS =====

// Get all movies (public)
exports.getMovies = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const db = admin.firestore();
      const moviesSnapshot = await db
        .collection('movies')
        .orderBy('createdAt', 'desc')
        .get();

      const movies = moviesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json(movies);
    } catch (error) {
      console.error('Error getting movies:', error);
      res.status(500).json({ error: 'Failed to get movies' });
    }
  });
});

// Get single movie (public)
exports.getMovie = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const { movieId } = req.params;
      const db = admin.firestore();
      const movieDoc = await db.collection('movies').doc(movieId).get();

      if (!movieDoc.exists) {
        return res.status(404).json({ error: 'Movie not found' });
      }

      res.json({ id: movieDoc.id, ...movieDoc.data() });
    } catch (error) {
      console.error('Error getting movie:', error);
      res.status(500).json({ error: 'Failed to get movie' });
    }
  });
});

// Get website stats (public)
exports.getStats = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const db = admin.firestore();

      // Get movie count
      const moviesSnapshot = await db.collection('movies').get();
      const movieCount = moviesSnapshot.size;

      // Get today's movies
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayMoviesSnapshot = await db
        .collection('movies')
        .where('createdAt', '>=', today)
        .get();
      const todayCount = todayMoviesSnapshot.size;

      // Mock user and view counts (in real app, track these properly)
      const stats = {
        totalMovies: movieCount,
        todayMovies: todayCount,
        totalUsers: 1204, // Mock data
        totalViews: 15420, // Mock data
        lastUpdated: new Date().toISOString()
      };

      res.json(stats);
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  });
});

// ===== ADMIN API FUNCTIONS =====

// Admin movie management (CRUD)
exports.adminMovies = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    // Check admin authentication
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    try {
      // Verify admin token (simplified - in production, use proper Firebase Auth)
      // const token = req.headers.authorization.split('Bearer ')[1];
      // TODO: Implement proper token verification

      const db = admin.firestore();

      if (req.method === 'GET') {
        // Get all movies for admin
        const moviesSnapshot = await db
          .collection('movies')
          .orderBy('createdAt', 'desc')
          .get();

        const movies = moviesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        res.json(movies);

      } else if (req.method === 'POST') {
        // Add new movie
        const movieData = req.body;

        // Validate required fields
        if (!movieData.title || !movieData.year || !movieData.youtubeId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const movieRef = await db.collection('movies').add({
          ...movieData,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: 'admin' // TODO: Get from auth token
        });

        res.json({ success: true, id: movieRef.id });

      } else if (req.method === 'PUT') {
        // Update movie
        const { movieId } = req.params;
        const movieData = req.body;

        if (!movieId) {
          return res.status(400).json({ error: 'Movie ID required' });
        }

        await db.collection('movies').doc(movieId).update({
          ...movieData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: 'admin' // TODO: Get from auth token
        });

        res.json({ success: true });

      } else if (req.method === 'DELETE') {
        // Delete movie
        const { movieId } = req.params;

        if (!movieId) {
          return res.status(400).json({ error: 'Movie ID required' });
        }

        await db.collection('movies').doc(movieId).delete();

        res.json({ success: true });

      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }

    } catch (error) {
      console.error('Admin movies error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// ===== CALLABLE FUNCTIONS =====

// Add movie (callable function for admin)
exports.addMovie = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userEmail = context.auth.token.email;
  const adminEmails = ADMIN_EMAILS.split(',').map(email => email.trim());

  if (!adminEmails.includes(userEmail)) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  try {
    const db = admin.firestore();
    const movieRef = await db.collection('movies').add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: userEmail
    });

    return { success: true, id: movieRef.id };
  } catch (error) {
    console.error('Error adding movie:', error);
    throw new functions.https.HttpsError('internal', 'Failed to add movie');
  }
});

// Update movie (callable function for admin)
exports.updateMovie = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userEmail = context.auth.token.email;
  const adminEmails = ADMIN_EMAILS.split(',').map(email => email.trim());

  if (!adminEmails.includes(userEmail)) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { movieId, movieData } = data;
  if (!movieId) {
    throw new functions.https.HttpsError('invalid-argument', 'Movie ID is required');
  }

  try {
    const db = admin.firestore();
    await db.collection('movies').doc(movieId).update({
      ...movieData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: userEmail
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating movie:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update movie');
  }
});

// Delete movie (callable function for admin)
exports.deleteMovie = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userEmail = context.auth.token.email;
  const adminEmails = ADMIN_EMAILS.split(',').map(email => email.trim());

  if (!adminEmails.includes(userEmail)) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { movieId } = data;
  if (!movieId) {
    throw new functions.https.HttpsError('invalid-argument', 'Movie ID is required');
  }

  try {
    const db = admin.firestore();
    await db.collection('movies').doc(movieId).delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting movie:', error);
    throw new functions.https.HttpsError('internal', 'Failed to delete movie');
  }
});

// ===== SCHEDULED FUNCTIONS =====

// Update daily stats
exports.updateDailyStats = functions.pubsub
  .schedule('0 0 * * *') // Daily at midnight
  .timeZone('Asia/Bangkok')
  .onRun(async () => {
    try {
      const db = admin.firestore();
      const moviesSnapshot = await db.collection('movies').get();
      const movieCount = moviesSnapshot.size;

      // Store daily stats
      await db.collection('stats').add({
        type: 'daily',
        date: new Date().toISOString().split('T')[0],
        movieCount: movieCount,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('Daily stats updated successfully');
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  });
