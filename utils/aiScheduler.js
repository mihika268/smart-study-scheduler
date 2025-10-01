// AI-powered scheduling utilities

/**
 * Generate smart schedule based on tasks, user preferences, and constraints
 */
function generateSmartSchedule(tasks, userPrefs, targetDate, customPrefs = {}) {
  const schedule = {
    date: targetDate,
    scheduledTasks: [],
    breaks: [],
    totalStudyTime: 0,
    recommendations: []
  };

  if (!tasks || tasks.length === 0) {
    return schedule;
  }

  // Default preferences
  const prefs = {
    pomodoroLength: userPrefs?.pomodoro_duration || 25,
    shortBreak: userPrefs?.short_break_duration || 5,
    longBreak: userPrefs?.long_break_duration || 15,
    dailyGoalHours: userPrefs?.daily_goal_hours || 2,
    preferredDifficulty: userPrefs?.preferred_difficulty || 3,
    startTime: customPrefs.startTime || '09:00',
    endTime: customPrefs.endTime || '18:00',
    ...customPrefs
  };

  // Sort tasks by priority and due date
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityWeight[a.priority] || 2;
    const bPriority = priorityWeight[b.priority] || 2;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }
    
    // If same priority, sort by due date
    const aDue = new Date(a.due_date || '2099-12-31');
    const bDue = new Date(b.due_date || '2099-12-31');
    return aDue - bDue;
  });

  let currentTime = parseTime(prefs.startTime);
  const endTime = parseTime(prefs.endTime);
  let totalScheduledMinutes = 0;
  const maxDailyMinutes = prefs.dailyGoalHours * 60;

  for (const task of sortedTasks) {
    if (totalScheduledMinutes >= maxDailyMinutes) {
      schedule.recommendations.push(
        `Daily goal of ${prefs.dailyGoalHours} hours reached. Remaining tasks moved to next day.`
      );
      break;
    }

    const taskDuration = Math.min(task.estimated_duration, maxDailyMinutes - totalScheduledMinutes);
    
    // Break task into Pomodoro sessions if longer than pomodoro length
    const sessions = breakIntoSessions(taskDuration, prefs.pomodoroLength);
    
    for (let i = 0; i < sessions.length; i++) {
      const sessionDuration = sessions[i];
      
      // Check if we have enough time before end of day
      if (currentTime + sessionDuration > endTime) {
        schedule.recommendations.push(
          `Task "${task.title}" partially scheduled. Remaining time moved to next day.`
        );
        break;
      }

      const sessionStart = formatTime(currentTime);
      const sessionEnd = formatTime(currentTime + sessionDuration);

      schedule.scheduledTasks.push({
        taskId: task.id,
        title: task.title,
        subject: task.subject,
        priority: task.priority,
        difficulty: task.difficulty_level,
        start: `${targetDate}T${sessionStart}:00`,
        end: `${targetDate}T${sessionEnd}:00`,
        duration: sessionDuration,
        sessionNumber: i + 1,
        totalSessions: sessions.length,
        type: 'study'
      });

      currentTime += sessionDuration;
      totalScheduledMinutes += sessionDuration;

      // Add break after session (except for last session of the day)
      if (i < sessions.length - 1 || totalScheduledMinutes < maxDailyMinutes) {
        const breakDuration = (i + 1) % 4 === 0 ? prefs.longBreak : prefs.shortBreak;
        
        if (currentTime + breakDuration <= endTime) {
          const breakStart = formatTime(currentTime);
          const breakEnd = formatTime(currentTime + breakDuration);

          schedule.breaks.push({
            start: `${targetDate}T${breakStart}:00`,
            end: `${targetDate}T${breakEnd}:00`,
            duration: breakDuration,
            type: (i + 1) % 4 === 0 ? 'long' : 'short'
          });

          currentTime += breakDuration;
        }
      }
    }
  }

  schedule.totalStudyTime = totalScheduledMinutes;
  
  // Add motivational recommendations
  if (totalScheduledMinutes >= maxDailyMinutes) {
    schedule.recommendations.push("Excellent! You've planned a full productive day. Remember to take breaks!");
  } else if (totalScheduledMinutes >= maxDailyMinutes * 0.8) {
    schedule.recommendations.push("Great schedule! You're on track to meet your daily goals.");
  } else {
    schedule.recommendations.push(`You have ${Math.round((maxDailyMinutes - totalScheduledMinutes) / 60 * 10) / 10} more hours available for additional tasks.`);
  }

  return schedule;
}

/**
 * Suggest optimal time for a single task
 */
function suggestOptimalTime(duration, dueDate, userPrefs) {
  const now = new Date();
  const due = dueDate ? new Date(dueDate) : null;
  
  // Default to next available slot (current time + 1 hour)
  let suggestedStart = new Date(now.getTime() + 60 * 60 * 1000);
  
  // Round to next hour
  suggestedStart.setMinutes(0, 0, 0);
  
  // If due date is soon, prioritize earlier time
  if (due) {
    const hoursUntilDue = (due - now) / (1000 * 60 * 60);
    if (hoursUntilDue < 24) {
      // Due within 24 hours - suggest ASAP
      suggestedStart = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
    } else if (hoursUntilDue < 72) {
      // Due within 3 days - suggest within next few hours
      suggestedStart = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    }
  }

  // Adjust for user's preferred study hours
  const hour = suggestedStart.getHours();
  if (hour < 8) {
    suggestedStart.setHours(9, 0, 0, 0); // Not too early
  } else if (hour > 20) {
    // Too late, schedule for tomorrow morning
    suggestedStart.setDate(suggestedStart.getDate() + 1);
    suggestedStart.setHours(9, 0, 0, 0);
  }

  const suggestedEnd = new Date(suggestedStart.getTime() + duration * 60 * 1000);

  return {
    start: suggestedStart.toISOString(),
    end: suggestedEnd.toISOString(),
    reasoning: generateSchedulingReasoning(duration, dueDate, userPrefs)
  };
}

/**
 * Break a long task into Pomodoro sessions
 */
function breakIntoSessions(totalMinutes, pomodoroLength) {
  const sessions = [];
  let remaining = totalMinutes;

  while (remaining > 0) {
    const sessionLength = Math.min(remaining, pomodoroLength);
    sessions.push(sessionLength);
    remaining -= sessionLength;
  }

  return sessions;
}

/**
 * Parse time string (HH:MM) to minutes from midnight
 */
function parseTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Format minutes from midnight to HH:MM
 */
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Generate reasoning for scheduling decisions
 */
function generateSchedulingReasoning(duration, dueDate, userPrefs) {
  const reasons = [];
  
  if (dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const hoursUntilDue = (due - now) / (1000 * 60 * 60);
    
    if (hoursUntilDue < 24) {
      reasons.push("Scheduled urgently due to approaching deadline");
    } else if (hoursUntilDue < 72) {
      reasons.push("Prioritized due to upcoming deadline");
    }
  }

  if (duration > 60) {
    reasons.push("Broken into focused sessions for better retention");
  }

  if (userPrefs?.preferred_difficulty) {
    reasons.push("Scheduled considering your preferred difficulty level");
  }

  return reasons.length > 0 ? reasons.join(". ") : "Optimally scheduled based on your preferences";
}

/**
 * Analyze user's study patterns and suggest improvements
 */
function analyzeStudyPatterns(studySessions, tasks) {
  const analysis = {
    averageSessionLength: 0,
    mostProductiveHours: [],
    subjectPerformance: {},
    recommendations: []
  };

  if (!studySessions || studySessions.length === 0) {
    analysis.recommendations.push("Start tracking your study sessions to get personalized insights!");
    return analysis;
  }

  // Calculate average session length
  const totalDuration = studySessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  analysis.averageSessionLength = Math.round(totalDuration / studySessions.length);

  // Find most productive hours
  const hourlyProductivity = {};
  studySessions.forEach(session => {
    if (session.start_time && session.focus_rating) {
      const hour = new Date(session.start_time).getHours();
      if (!hourlyProductivity[hour]) {
        hourlyProductivity[hour] = { total: 0, count: 0 };
      }
      hourlyProductivity[hour].total += session.focus_rating;
      hourlyProductivity[hour].count += 1;
    }
  });

  const productiveHours = Object.entries(hourlyProductivity)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      avgFocus: data.total / data.count
    }))
    .sort((a, b) => b.avgFocus - a.avgFocus)
    .slice(0, 3);

  analysis.mostProductiveHours = productiveHours.map(h => h.hour);

  // Generate recommendations
  if (analysis.averageSessionLength < 20) {
    analysis.recommendations.push("Try longer study sessions (25-30 minutes) for better focus and retention.");
  } else if (analysis.averageSessionLength > 60) {
    analysis.recommendations.push("Consider breaking long sessions into smaller chunks with breaks.");
  }

  if (analysis.mostProductiveHours.length > 0) {
    const topHour = analysis.mostProductiveHours[0];
    const timeString = topHour < 12 ? `${topHour}:00 AM` : `${topHour - 12 || 12}:00 PM`;
    analysis.recommendations.push(`Your most productive time is around ${timeString}. Schedule important tasks then!`);
  }

  return analysis;
}

module.exports = {
  generateSmartSchedule,
  suggestOptimalTime,
  breakIntoSessions,
  analyzeStudyPatterns
};
