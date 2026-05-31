const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Account = require('../models/Account');
const Profile = require('../models/Profile');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.post('/addAccount', async (req, res) => {
  try {
    const account = await Account.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: account });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || 'Failed to create account' });
  }
});


router.post('/updateProfile', async (req, res) => {
  try {

    let profile = await Profile.findOne({userId: req.user.id });
    if(profile){
      profile.name = req.body.name;
      profile.email = req.body.email;
      profile.monthlyIncome = req.body.monthlyIncome;
      await profile.save();
    }
    else{
      await Profile.create({ ...req.body, userId: req.user.id });
    }   
    res.status(201).json({ success: true, data: profile });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || 'Failed to Update Profile' });
  }
});



router.get('/getProfile', async (req, res) => {
  try {    
    const filter = { userId: req.user.id };
    const profile = await Profile.findOne(filter);
    res.status(201).json({ success: true, data: profile });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || 'Failed to Fetch profile' });
  }
});

router.get('/getAccounts', async (req, res) => {
  try {
    const filter = { userId: req.user.id };
    const accounts = await Account.find(filter);
    res.status(201).json({ success: true, data: accounts });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || 'Failed to Fetch accounts' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { month } = req.query;
    const userId = req.user.id;

    const dateFilter = { userId };
    if (month) {
      const [year, m] = month.split('-').map(Number);
      dateFilter.date = {
        $gte: new Date(year, m - 1, 1),
        $lt: new Date(year, m, 1),
      };
    }

    const [totals, byCategory, byMonth] = await Promise.all([
      Expense.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { ...dateFilter, type: 'expense' } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate([
        {
          $match: {
            userId,
            date: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 5, 1)),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              type: '$type',
            },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const income = totals.find((t) => t._id === 'income')?.total ?? 0;
    const expense = totals.find((t) => t._id === 'expense')?.total ?? 0;

    res.json({
      success: true,
      data: {
        income,
        expense,
        balance: income - expense,
        byCategory: byCategory.map((c) => ({ name: c._id, value: c.total })),
        byMonth,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch summary' });
  }
});

module.exports = router;
