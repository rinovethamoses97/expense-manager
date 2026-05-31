const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name:   { type: String, required: true, trim: true },
    email:  { type: String, trim: true, lowercase: true },
    avatarUrl: { type: String, trim: true },

    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    locale:   { type: String, default: 'en-IN', trim: true },
    timezone: { type: String, default: 'Asia/Kolkata', trim: true },

    monthlyIncome: { type: Number, min: 0, default: 0 },
    payday:        { type: Number, min: 1, max: 31, default: 1 },
    fiscalYearStart: { type: Number, min: 1, max: 12, default: 4 },

    savingsGoalPercent:        { type: Number, min: 0, max: 100, default: 20 },
    emergencyFundTargetMonths: { type: Number, min: 0, default: 6 },
    dependents:                { type: Number, min: 0, default: 0 },

    notifications: {
      email:               { type: Boolean, default: true },
      weeklyDigest:        { type: Boolean, default: true },
      budgetAlerts:        { type: Boolean, default: true },
      lowBalanceAlerts:    { type: Boolean, default: false },
      lowBalanceThreshold: { type: Number, min: 0, default: 5000 },
    },

    theme:                { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    onboardingCompleted:  { type: Boolean, default: false },
    lastActiveAt:         { type: Date },
  },
  { timestamps: true }
);


module.exports = mongoose.models.Profile ?? mongoose.model('Profile', ProfileSchema);
