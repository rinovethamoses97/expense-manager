const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { type, category, month, sort = '-date' } = req.query;

    const filter = { userId: req.user.id };
    if (type && type !== 'all') filter.type = type;
    if (category && category !== 'all') filter.category = category;
    if (month) {
      const [year, m] = month.split('-').map(Number);
      filter.date = {
        $gte: new Date(year, m - 1, 1),
        $lt: new Date(year, m, 1),
      };
    }

    const expenses = await Expense.find(filter).sort(sort).lean();
    res.json({ success: true, data: expenses });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch expenses' });
  }
});

router.post('/', async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || 'Failed to create expense' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!expense) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: expense });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch expense' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || 'Failed to update expense' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to delete expense' });
  }
});

module.exports = router;
