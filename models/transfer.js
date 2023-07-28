const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  senderBalanceBefore: {
    type: Number,
    required: true,
    default: 0,
  },
  senderBalanceAfter: {
    type: Number,
    required: true,
    default: 0,
  },
  receiverBalanceBefore: {
    type: Number,
    required: true,
    default: 0,
  },
  receiverBalanceAfter: {
    type: Number,
    required: true,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transfer', transferSchema);
