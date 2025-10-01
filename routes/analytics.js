const express = require('express');
const database = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');
const { analyzeStudyPatterns } = require('../utils/aiScheduler');

const router = express.Router();

// Connect to database
database.connect().catch(console.error);

// Get dashboard analytics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = '7' } = req.query; // days
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));
    const dateFilter = daysAgo.toISOString().split('T')[0];

    // Get basic stats
    const stats = await database.get(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'missed' THEN 1 END) as missed_tasks,
        AVG(CASE WHEN status = 'completed' AND actual_duration > 0 THEN actual_duration END) as avg_session_length,
        SUM(CASE WHEN status = 'completed' THEN actual_duration ELSE 0 END) as total_study_time
      FROM tasks 
      WHERE user_id = ? AND created_at >= ?
    `, [userId, dateFilter]);

    // Get study sessions data
    const sessions = await database.all(`
      SELECT 
        DATE(start_time) as date,
        SUM(duration) as daily_minutes,
        AVG(focus_rating) as avg_focus,
        AVG(mood_after - mood_before) as mood_improvement,
        COUNT(*) as session_count
      FROM study_sessions 
      WHERE user_id = ? AND start_time >= ?
      GROUP BY DATE(start_time)
      ORDER BY date DESC
    `, [userId, dateFilter]);

    // Get subject performance
    const subjectStats = await database.all(`
      SELECT 
        subject,
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        AVG(CASE WHEN status = 'completed' AND actual_duration > 0 THEN actual_duration END) as avg_time,
        AVG(difficulty_level) as avg_difficulty
      FROM tasks 
      WHERE user_id = ? AND created_at >= ?
      GROUP BY subject
      ORDER BY completed_tasks DESC
    `, [userId, dateFilter]);

    // Get streaks info
    const streaks = await database.get(`
      SELECT current_streak, longest_streak, total_study_days
      FROM streaks 
      WHERE user_id = ?
    `, [userId]);

    // Get recent achievements
    const achievements = await database.all(`
      SELECT badge_type, badge_name, description, earned_at
      FROM achievements 
      WHERE user_id = ?
      ORDER BY earned_at DESC
      LIMIT 5
    `, [userId]);

    // Calculate completion rate
    const completionRate = stats.total_tasks > 0 
      ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) 
      : 0;

    // Calculate productivity score (0-100)
    const productivityScore = calculateProductivityScore(stats, sessions, streaks);

    res.json({
      success: true,
      analytics: {
        overview: {
          totalTasks: stats.total_tasks || 0,
          completedTasks: stats.completed_tasks || 0,
          pendingTasks: stats.pending_tasks || 0,
          inProgressTasks: stats.in_progress_tasks || 0,
          missedTasks: stats.missed_tasks || 0,
          completionRate,
          totalStudyTime: Math.round((stats.total_study_time || 0) / 60 * 10) / 10, // hours
          avgSessionLength: Math.round(stats.avg_session_length || 0),
          productivityScore
        },
        streaks: {
          current: streaks?.current_streak || 0,
          longest: streaks?.longest_streak || 0,
          totalDays: streaks?.total_study_days || 0
        },
        dailyProgress: sessions.map(session => ({
          date: session.date,
          studyTime: Math.round((session.daily_minutes || 0) / 60 * 10) / 10,
          focusRating: Math.round((session.avg_focus || 0) * 10) / 10,
          moodImprovement: Math.round((session.mood_improvement || 0) * 10) / 10,
          sessionCount: session.session_count || 0
        })),
        subjectPerformance: subjectStats.map(subject => ({
          subject: subject.subject,
          totalTasks: subject.total_tasks,
          completedTasks: subject.completed_tasks,
          completionRate: subject.total_tasks > 0 
            ? Math.round((subject.completed_tasks / subject.total_tasks) * 100) 
            : 0,
          avgTime: Math.round(subject.avg_time || 0),
          avgDifficulty: Math.round((subject.avg_difficulty || 0) * 10) / 10
        })),
        recentAchievements: achievements
      }
    });

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get detailed study patterns analysis
router.get('/patterns', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = '30' } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));
    const dateFilter = daysAgo.toISOString().split('T')[0];

    // Get study sessions for pattern analysis
    const sessions = await database.all(`
      SELECT * FROM study_sessions 
      WHERE user_id = ? AND start_time >= ?
      ORDER BY start_time DESC
    `, [userId, dateFilter]);

    // Get tasks for analysis
    const tasks = await database.all(`
      SELECT * FROM tasks 
      WHERE user_id = ? AND created_at >= ?
    `, [userId, dateFilter]);

    // Analyze patterns using AI scheduler utility
    const patterns = analyzeStudyPatterns(sessions, tasks);

    // Get hourly productivity data
    const hourlyData = await database.all(`
      SELECT 
        CAST(strftime('%H', start_time) AS INTEGER) as hour,
        AVG(focus_rating) as avg_focus,
        AVG(duration) as avg_duration,
        COUNT(*) as session_count
      FROM study_sessions 
      WHERE user_id = ? AND start_time >= ?
      GROUP BY CAST(strftime('%H', start_time) AS INTEGER)
      ORDER BY hour
    `, [userId, dateFilter]);

    // Get weekly patterns
    const weeklyData = await database.all(`
      SELECT 
        CASE CAST(strftime('%w', start_time) AS INTEGER)
          WHEN 0 THEN 'Sunday'
          WHEN 1 THEN 'Monday'
          WHEN 2 THEN 'Tuesday'
          WHEN 3 THEN 'Wednesday'
          WHEN 4 THEN 'Thursday'
          WHEN 5 THEN 'Friday'
          WHEN 6 THEN 'Saturday'
        END as day_of_week,
        AVG(focus_rating) as avg_focus,
        SUM(duration) as total_duration,
        COUNT(*) as session_count
      FROM study_sessions 
      WHERE user_id = ? AND start_time >= ?
      GROUP BY CAST(strftime('%w', start_time) AS INTEGER)
      ORDER BY CAST(strftime('%w', start_time) AS INTEGER)
    `, [userId, dateFilter]);

    res.json({
      success: true,
      patterns: {
        ...patterns,
        hourlyProductivity: hourlyData.map(h => ({
          hour: h.hour,
          avgFocus: Math.round((h.avg_focus || 0) * 10) / 10,
          avgDuration: Math.round(h.avg_duration || 0),
          sessionCount: h.session_count
        })),
        weeklyPatterns: weeklyData.map(w => ({
          dayOfWeek: w.day_of_week,
          avgFocus: Math.round((w.avg_focus || 0) * 10) / 10,
          totalDuration: Math.round((w.total_duration || 0) / 60 * 10) / 10, // hours
          sessionCount: w.session_count
        }))
      }
    });

  } catch (error) {
    console.error('Patterns analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Start a study session
router.post('/session/start', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId, moodBefore, energyLevel } = req.body;

    const result = await database.run(`
      INSERT INTO study_sessions (user_id, task_id, start_time, mood_before, energy_level)
      VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?)
    `, [userId, taskId || null, moodBefore || null, energyLevel || null]);

    // Update task status to in_progress if provided
    if (taskId) {
      await database.run(
        'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        ['in_progress', taskId, userId]
      );
    }

    res.json({
      success: true,
      message: 'Study session started',
      sessionId: result.id
    });

  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// End a study session
router.put('/session/:sessionId/end', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessionId = req.params.sessionId;
    const { moodAfter, focusRating, notes, breakCount } = req.body;

    // Get session start time to calculate duration
    const session = await database.get(
      'SELECT start_time, task_id FROM study_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Study session not found'
      });
    }

    const startTime = new Date(session.start_time);
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / (1000 * 60)); // minutes

    // Update session
    await database.run(`
      UPDATE study_sessions SET 
        end_time = CURRENT_TIMESTAMP,
        duration = ?,
        mood_after = ?,
        focus_rating = ?,
        notes = ?,
        break_count = ?
      WHERE id = ? AND user_id = ?
    `, [duration, moodAfter, focusRating, notes, breakCount || 0, sessionId, userId]);

    // Update task actual duration if task was provided
    if (session.task_id) {
      await database.run(
        'UPDATE tasks SET actual_duration = actual_duration + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [duration, session.task_id]
      );
    }

    // Check for achievements
    await checkAndAwardAchievements(userId, duration, focusRating);

    res.json({
      success: true,
      message: 'Study session completed',
      duration,
      sessionData: {
        duration,
        moodAfter,
        focusRating,
        notes
      }
    });

  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get study session history
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, period = '30' } = req.query;
    const offset = (page - 1) * limit;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));
    const dateFilter = daysAgo.toISOString().split('T')[0];

    const sessions = await database.all(`
      SELECT 
        s.*,
        t.title as task_title,
        t.subject as task_subject
      FROM study_sessions s
      LEFT JOIN tasks t ON s.task_id = t.id
      WHERE s.user_id = ? AND s.start_time >= ?
      ORDER BY s.start_time DESC
      LIMIT ? OFFSET ?
    `, [userId, dateFilter, parseInt(limit), offset]);

    const { total } = await database.get(
      'SELECT COUNT(*) as total FROM study_sessions WHERE user_id = ? AND start_time >= ?',
      [userId, dateFilter]
    );

    res.json({
      success: true,
      sessions: sessions.map(session => ({
        ...session,
        duration: session.duration || 0,
        focusRating: session.focus_rating || 0,
        moodImprovement: (session.mood_after || 0) - (session.mood_before || 0)
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to calculate productivity score
function calculateProductivityScore(stats, sessions, streaks) {
  let score = 0;

  // Completion rate (40% of score)
  if (stats.total_tasks > 0) {
    score += (stats.completed_tasks / stats.total_tasks) * 40;
  }

  // Current streak (30% of score)
  const streakScore = Math.min((streaks?.current_streak || 0) * 5, 30);
  score += streakScore;

  // Average focus rating (20% of score)
  if (sessions.length > 0) {
    const avgFocus = sessions.reduce((sum, s) => sum + (s.avg_focus || 0), 0) / sessions.length;
    score += (avgFocus / 5) * 20;
  }

  // Consistency (10% of score)
  const studyDays = sessions.length;
  const consistencyScore = Math.min(studyDays * 2, 10);
  score += consistencyScore;

  return Math.round(Math.min(score, 100));
}

// Helper function to check and award achievements
async function checkAndAwardAchievements(userId, sessionDuration, focusRating) {
  try {
    const achievements = [];

    // First session achievement
    const sessionCount = await database.get(
      'SELECT COUNT(*) as count FROM study_sessions WHERE user_id = ?',
      [userId]
    );

    if (sessionCount.count === 1) {
      achievements.push({
        type: 'first_session',
        name: 'Getting Started',
        description: 'Completed your first study session!'
      });
    }

    // Focus master achievement
    if (focusRating >= 4) {
      const highFocusSessions = await database.get(
        'SELECT COUNT(*) as count FROM study_sessions WHERE user_id = ? AND focus_rating >= 4',
        [userId]
      );

      if (highFocusSessions.count === 10) {
        achievements.push({
          type: 'focus_master',
          name: 'Focus Master',
          description: 'Maintained high focus for 10 sessions!'
        });
      }
    }

    // Marathon session achievement
    if (sessionDuration >= 120) { // 2 hours
      achievements.push({
        type: 'marathon',
        name: 'Marathon Studier',
        description: 'Completed a 2+ hour study session!'
      });
    }

    // Insert achievements
    for (const achievement of achievements) {
      await database.run(
        'INSERT INTO achievements (user_id, badge_type, badge_name, description) VALUES (?, ?, ?, ?)',
        [userId, achievement.type, achievement.name, achievement.description]
      );
    }

  } catch (error) {
    console.error('Achievement check error:', error);
  }
}

module.exports = router;
