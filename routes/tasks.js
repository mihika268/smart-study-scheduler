const express = require('express');
const database = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');
const { generateSmartSchedule, suggestOptimalTime } = require('../utils/aiScheduler');

const router = express.Router();

// Connect to database
database.connect().catch(console.error);

// Get all tasks for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, subject, priority, page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    let params = [userId];

    // Add filters
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (subject) {
      query += ' AND subject LIKE ?';
      params.push(`%${subject}%`);
    }
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const tasks = await database.all(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM tasks WHERE user_id = ?';
    let countParams = [userId];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    if (subject) {
      countQuery += ' AND subject LIKE ?';
      countParams.push(`%${subject}%`);
    }
    if (priority) {
      countQuery += ' AND priority = ?';
      countParams.push(priority);
    }

    const { total } = await database.get(countQuery, countParams);

    res.json({
      success: true,
      tasks: tasks.map(task => ({
        ...task,
        tags: task.tags ? JSON.parse(task.tags) : []
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single task
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.userId;

    const task = await database.get(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      task: {
        ...task,
        tags: task.tags ? JSON.parse(task.tags) : []
      }
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      priority = 'medium',
      estimated_duration,
      due_date,
      difficulty_level = 3,
      tags = []
    } = req.body;

    const userId = req.user.userId;

    // Validation
    if (!title || !subject || !estimated_duration) {
      return res.status(400).json({
        success: false,
        message: 'Title, subject, and estimated duration are required'
      });
    }

    // Get user preferences for smart scheduling
    const userPrefs = await database.get(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    // Suggest optimal scheduling time
    const suggestedTime = suggestOptimalTime(estimated_duration, due_date, userPrefs);

    const result = await database.run(
      `INSERT INTO tasks (
        user_id, title, description, subject, priority, 
        estimated_duration, due_date, difficulty_level, tags,
        scheduled_start, scheduled_end
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, title, description, subject, priority,
        estimated_duration, due_date, difficulty_level, JSON.stringify(tags),
        suggestedTime.start, suggestedTime.end
      ]
    );

    const newTask = await database.get(
      'SELECT * FROM tasks WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: {
        ...newTask,
        tags: newTask.tags ? JSON.parse(newTask.tags) : []
      },
      suggestion: {
        message: 'Optimal study time suggested based on your preferences',
        scheduledTime: suggestedTime
      }
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.userId;
    const {
      title,
      description,
      subject,
      priority,
      status,
      estimated_duration,
      actual_duration,
      due_date,
      scheduled_start,
      scheduled_end,
      difficulty_level,
      tags
    } = req.body;

    // Check if task exists and belongs to user
    const existingTask = await database.get(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Update task
    await database.run(
      `UPDATE tasks SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        subject = COALESCE(?, subject),
        priority = COALESCE(?, priority),
        status = COALESCE(?, status),
        estimated_duration = COALESCE(?, estimated_duration),
        actual_duration = COALESCE(?, actual_duration),
        due_date = COALESCE(?, due_date),
        scheduled_start = COALESCE(?, scheduled_start),
        scheduled_end = COALESCE(?, scheduled_end),
        difficulty_level = COALESCE(?, difficulty_level),
        tags = COALESCE(?, tags),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [
        title, description, subject, priority, status,
        estimated_duration, actual_duration, due_date,
        scheduled_start, scheduled_end, difficulty_level,
        tags ? JSON.stringify(tags) : null,
        taskId, userId
      ]
    );

    // If task is completed, update streaks
    if (status === 'completed' && existingTask.status !== 'completed') {
      await updateUserStreaks(userId);
    }

    const updatedTask = await database.get(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: {
        ...updatedTask,
        tags: updatedTask.tags ? JSON.parse(updatedTask.tags) : []
      }
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.userId;

    const result = await database.run(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Generate AI-powered schedule
router.post('/generate-schedule', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date, preferences } = req.body;

    // Get user's pending tasks
    const tasks = await database.all(
      `SELECT * FROM tasks 
       WHERE user_id = ? AND status = 'pending' 
       ORDER BY due_date ASC, priority DESC`,
      [userId]
    );

    // Get user preferences
    const userPrefs = await database.get(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    // Generate smart schedule
    const schedule = generateSmartSchedule(tasks, userPrefs, date, preferences);

    // Update tasks with new schedule
    for (const item of schedule.scheduledTasks) {
      await database.run(
        'UPDATE tasks SET scheduled_start = ?, scheduled_end = ? WHERE id = ?',
        [item.start, item.end, item.taskId]
      );
    }

    res.json({
      success: true,
      message: 'Smart schedule generated successfully',
      schedule
    });

  } catch (error) {
    console.error('Generate schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get today's schedule
router.get('/schedule/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];

    const tasks = await database.all(
      `SELECT * FROM tasks 
       WHERE user_id = ? 
       AND DATE(scheduled_start) = ?
       ORDER BY scheduled_start ASC`,
      [userId, today]
    );

    res.json({
      success: true,
      schedule: tasks.map(task => ({
        ...task,
        tags: task.tags ? JSON.parse(task.tags) : []
      }))
    });

  } catch (error) {
    console.error('Get today schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to update user streaks
async function updateUserStreaks(userId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const streak = await database.get(
      'SELECT * FROM streaks WHERE user_id = ?',
      [userId]
    );

    if (streak) {
      const lastStudyDate = new Date(streak.last_study_date);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate - lastStudyDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let newCurrentStreak = streak.current_streak;
      
      if (diffDays === 1) {
        // Consecutive day
        newCurrentStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken, reset
        newCurrentStreak = 1;
      }

      const newLongestStreak = Math.max(streak.longest_streak, newCurrentStreak);

      await database.run(
        `UPDATE streaks SET 
          current_streak = ?,
          longest_streak = ?,
          last_study_date = ?,
          total_study_days = total_study_days + 1,
          updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [newCurrentStreak, newLongestStreak, today, userId]
      );
    }
  } catch (error) {
    console.error('Update streaks error:', error);
  }
}

module.exports = router;
