const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema(
  {
    accountName: { type: String, required: true, trim: true },
    balance: { type: Number, required: true, min: 0 },    
    category: { type: String, required: true, trim: true },    
    description: { type: String, trim: true },    
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Account ?? mongoose.model('Account', AccountSchema);
