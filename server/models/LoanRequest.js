const mongoose = require('mongoose');

const loanRequestSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'rejected', 'pending_pickup', 'active', 'returned'],
    default: 'requested',
  },
  proposedDays: {
    type: Number,
    required: true,
  },
  agreedPrice: {
    type: Number,
    required: true,
  },
  borrowerConfirmedHandover: {
    type: Boolean,
    default: false,
  },
  ownerConfirmedHandover: {
    type: Boolean,
    default: false,
  },
  dueDate: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('LoanRequest', loanRequestSchema);