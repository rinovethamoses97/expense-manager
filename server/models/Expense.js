const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    description: { type: String, trim: true },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Expense ?? mongoose.model('Expense', ExpenseSchema);
