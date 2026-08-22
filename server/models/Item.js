const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  pricePerLoan: {
    type: Number,
    required: true,
  },
  maxLoanDays: {
    type: Number,
    required: true,
  },
  photoUrl: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['available', 'requested', 'pending_pickup', 'lent', 'returned'],
    default: 'available',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);