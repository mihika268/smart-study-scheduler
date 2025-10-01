const express = require('express');
const database = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Connect to database
database.connect().catch(console.error);

// Get user preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const preferences = await database.get(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    if (!preferences) {
      // Create default preferences if none exist
      await database.run(
        'INSERT INTO user_preferences (user_id) VALUES (?)',
        [userId]
      );

      const newPreferences = await database.get(
        'SELECT * FROM user_preferences WHERE user_id = ?',
        [userId]
      );

      return res.json({
        success: true,
        preferences: newPreferences
      });
    }

    res.json({
      success: true,
      preferences
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      pomodoro_duration,
      short_break_duration,
      long_break_duration,
      notifications_enabled,
      sound_enabled,
      daily_goal_hours,
      preferred_difficulty,
      auto_reschedule
    } = req.body;

    await database.run(
      `UPDATE user_preferences SET 
        pomodoro_duration = COALESCE(?, pomodoro_duration),
        short_break_duration = COALESCE(?, short_break_duration),
        long_break_duration = COALESCE(?, long_break_duration),
        notifications_enabled = COALESCE(?, notifications_enabled),
        sound_enabled = COALESCE(?, sound_enabled),
        daily_goal_hours = COALESCE(?, daily_goal_hours),
        preferred_difficulty = COALESCE(?, preferred_difficulty),
        auto_reschedule = COALESCE(?, auto_reschedule),
        updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [
        pomodoro_duration, short_break_duration, long_break_duration,
        notifications_enabled, sound_enabled, daily_goal_hours,
        preferred_difficulty, auto_reschedule, userId
      ]
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get daily motivational quote
router.get('/quote', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;

    let query = 'SELECT * FROM quotes';
    let params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY RANDOM() LIMIT 1';

    const quote = await database.get(query, params);

    if (!quote) {
      return res.json({
        success: true,
        quote: {
          text: "The journey of a thousand miles begins with one step.",
          author: "Lao Tzu",
          category: "motivation"
        }
      });
    }

    res.json({
      success: true,
      quote
    });

  } catch (error) {
    console.error('Get quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all quote categories
router.get('/quote-categories', authenticateToken, async (req, res) => {
  try {
    const categories = await database.all(
      'SELECT DISTINCT category FROM quotes ORDER BY category'
    );

    res.json({
      success: true,
      categories: categories.map(c => c.category)
    });

  } catch (error) {
    console.error('Get quote categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user achievements
router.get('/achievements', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const achievements = await database.all(
      'SELECT * FROM achievements WHERE user_id = ? ORDER BY earned_at DESC',
      [userId]
    );

    // Get achievement statistics
    const stats = await database.get(`
      SELECT 
        COUNT(*) as total_achievements,
        COUNT(DISTINCT badge_type) as unique_badges
      FROM achievements 
      WHERE user_id = ?
    `, [userId]);

    res.json({
      success: true,
      achievements,
      stats: {
        total: stats.total_achievements || 0,
        uniqueBadges: stats.unique_badges || 0
      }
    });

  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user streaks
router.get('/streaks', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const streaks = await database.get(
      'SELECT * FROM streaks WHERE user_id = ?',
      [userId]
    );

    if (!streaks) {
      // Create default streak record
      await database.run(
        'INSERT INTO streaks (user_id) VALUES (?)',
        [userId]
      );

      const newStreaks = await database.get(
        'SELECT * FROM streaks WHERE user_id = ?',
        [userId]
      );

      return res.json({
        success: true,
        streaks: newStreaks
      });
    }

    res.json({
      success: true,
      streaks
    });

  } catch (error) {
    console.error('Get streaks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get study subjects
router.get('/subjects', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const subjects = await database.all(
      'SELECT DISTINCT subject FROM tasks WHERE user_id = ? ORDER BY subject',
      [userId]
    );

    res.json({
      success: true,
      subjects: subjects.map(s => s.subject)
    });

  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Export user data
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user profile
    const user = await database.get(
      'SELECT id, name, email, theme, color_scheme, preferred_study_hours, created_at FROM users WHERE id = ?',
      [userId]
    );

    // Get tasks
    const tasks = await database.all(
      'SELECT * FROM tasks WHERE user_id = ?',
      [userId]
    );

    // Get study sessions
    const sessions = await database.all(
      'SELECT * FROM study_sessions WHERE user_id = ?',
      [userId]
    );

    // Get achievements
    const achievements = await database.all(
      'SELECT * FROM achievements WHERE user_id = ?',
      [userId]
    );

    // Get preferences
    const preferences = await database.get(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    // Get streaks
    const streaks = await database.get(
      'SELECT * FROM streaks WHERE user_id = ?',
      [userId]
    );

    const exportData = {
      user,
      tasks: tasks.map(task => ({
        ...task,
        tags: task.tags ? JSON.parse(task.tags) : []
      })),
      sessions,
      achievements,
      preferences,
      streaks,
      exportedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: exportData
    });

  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete user account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { confirmPassword } = req.body;

    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation required'
      });
    }

    // Verify password
    const user = await database.get(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(confirmPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Delete user (cascade will handle related records)
    await database.run('DELETE FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
