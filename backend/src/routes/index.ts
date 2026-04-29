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

const r = Router();

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
