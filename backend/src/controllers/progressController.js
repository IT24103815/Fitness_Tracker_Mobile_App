const Goal = require('../models/Goal');
const User = require('../models/User');

const enrichGoal = (goalDoc) => {
  const goal = goalDoc.toObject ? goalDoc.toObject() : goalDoc;
  const progressPercentage = goalDoc.calculateProgress ? goalDoc.calculateProgress() : 0;
  const badge = goalDoc.getBadge ? goalDoc.getBadge() : 'Starter';
  const motivationMessage = goalDoc.getMotivationMessage ? goalDoc.getMotivationMessage() : 'Keep going!';
  return { ...goal, progressPercentage, badge, motivationMessage };
};

const canAccessGoal = (user, goal) => {
  if (user.role === 'admin' || user.role === 'trainer') return true;
  return goal.client.toString() === user._id.toString();
};

const createGoal = async (req, res) => {
  try {
    const { title, type, targetValue, startValue, currentValue, targetUnit, priority, description, deadline, client } = req.body;

    if (!title || !type || targetValue === undefined || !targetUnit) {
      return res.status(400).json({ success: false, message: 'Title, type, target value, and unit are required' });
    }

    const selectedClient = (req.user.role === 'admin' || req.user.role === 'trainer') && client ? client : req.user._id;
    const start = startValue !== undefined && startValue !== '' ? Number(startValue) : 0;

    const goal = await Goal.create({
      title,
      type,
      targetValue: Number(targetValue),
      startValue: start,
      currentValue: currentValue !== undefined && currentValue !== '' ? Number(currentValue) : start,
      targetUnit,
      priority: priority || 'medium',
      description: description || '',
      deadline: deadline || undefined,
      client: selectedClient,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, goal: enrichGoal(goal) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGoals = async (req, res) => {
  try {
    const query = req.user.role === 'client' ? { client: req.user._id } : {};
    const goals = await Goal.find(query).sort({ createdAt: -1 });
    res.json({ success: true, goals: goals.map(enrichGoal) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    if (!canAccessGoal(req.user, goal)) return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, goal: enrichGoal(goal) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    if (!canAccessGoal(req.user, goal)) return res.status(403).json({ success: false, message: 'Access denied' });

    const allowed = ['title', 'type', 'targetValue', 'startValue', 'currentValue', 'targetUnit', 'priority', 'status', 'description', 'deadline'];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (['targetValue', 'startValue', 'currentValue'].includes(field)) {
          goal[field] = Number(req.body[field]);
        } else {
          goal[field] = req.body[field];
        }
      }
    });

    if (goal.calculateProgress() >= 100) goal.status = 'completed';
    if (goal.status === 'completed' && goal.calculateProgress() < 100 && req.body.status === undefined) goal.status = 'active';

    await goal.save();
    res.json({ success: true, goal: enrichGoal(goal) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateGoalProgress = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    if (!canAccessGoal(req.user, goal)) return res.status(403).json({ success: false, message: 'Access denied' });

    if (req.body.currentValue === undefined || isNaN(Number(req.body.currentValue))) {
      return res.status(400).json({ success: false, message: 'Valid current value is required' });
    }

    goal.currentValue = Number(req.body.currentValue);
    if (goal.calculateProgress() >= 100) goal.status = 'completed';
    await goal.save();

    const user = await User.findById(goal.client);
    if (user) {
      const progress = goal.calculateProgress();
      if (progress >= 25 && !user.badges.includes('Strong Start')) user.badges.push('Strong Start');
      if (progress >= 50 && !user.badges.includes('Halfway Hero')) user.badges.push('Halfway Hero');
      if (progress >= 100 && !user.badges.includes('Goal Crusher')) user.badges.push('Goal Crusher');
      user.xp = (user.xp || 0) + 10;
      user.level = Math.floor(user.xp / 500) + 1;
      await user.save();
    }

    res.json({ success: true, goal: enrichGoal(goal) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    if (!canAccessGoal(req.user, goal)) return res.status(403).json({ success: false, message: 'Access denied' });

    await goal.deleteOne();
    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const goals = await Goal.find(req.user.role === 'client' ? { client: req.user._id } : {}).sort({ createdAt: -1 });
    const user = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      user,
      goals: goals.map(enrichGoal),
      summary: {
        totalGoals: goals.length,
        activeGoals: goals.filter(g => g.status === 'active').length,
        completedGoals: goals.filter(g => g.status === 'completed').length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
  getDashboard
};
