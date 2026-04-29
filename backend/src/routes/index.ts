import { Router } from 'express';
import { createActivity, listActivities } from '../controllers/activityController';
import { getThreshold, setThreshold } from '../controllers/thresholdController';
import { listAlerts, markAlertRead } from '../controllers/alertController';
import { getDashboard } from '../controllers/dashboardController';
import { getWeeklyAnalytics } from '../controllers/analyticsController';
import { getRecommendations } from '../controllers/recommendationController';
import { simulate } from '../controllers/simulationController';
import { getLeaderboard } from '../controllers/leaderboardController';
import { getTeamView } from '../controllers/teamController';
import { listUsers, createUser, getUser } from '../controllers/userController';
import { handleChat } from '../controllers/chatController';
import { exportActivitiesCsv } from '../controllers/exportController';
import { signup, login, me } from '../controllers/authController';
import { attachUser, requireAuth } from '../middleware/auth';

const r = Router();

// Make req.userId available to all routes when a Bearer token is present
r.use(attachUser);

// auth
r.post('/auth/signup', signup);
r.post('/auth/login', login);
r.get('/auth/me', requireAuth, me);

// users
r.get('/users', listUsers);
r.post('/users', createUser);
r.get('/users/:id', getUser);

// activities
r.post('/activities', createActivity);
r.get('/activities/:userId', listActivities);

// threshold
r.get('/threshold/:userId', getThreshold);
r.post('/threshold', setThreshold);

// alerts
r.get('/alerts/:userId', listAlerts);
r.patch('/alerts/:id/read', markAlertRead);

// dashboard
r.get('/dashboard/:userId', getDashboard);

// analytics
r.get('/analytics/weekly/:userId', getWeeklyAnalytics);

// AI recommendations
r.get('/recommendations/:userId', getRecommendations);

// simulator
r.post('/simulate', simulate);

// leaderboard
r.get('/leaderboard', getLeaderboard);

// team / company
r.get('/team/:company', getTeamView);

// AI chat coach
r.post('/chat', handleChat);

// CSV export
r.get('/export/:userId/csv', exportActivitiesCsv);

export default r;
