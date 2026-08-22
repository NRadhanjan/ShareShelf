const express = require('express');
const Message = require('../models/Message');
const LoanRequest = require('../models/LoanRequest');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all messages for a specific request
router.get('/:requestId', authMiddleware, async (req, res) => {
  try {
    const loanRequest = await LoanRequest.findById(req.params.requestId);
    if (!loanRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const isBorrower = loanRequest.borrower.toString() === req.userId;
    const isOwner = loanRequest.owner.toString() === req.userId;
    if (!isBorrower && !isOwner) {
      return res.status(403).json({ error: 'You are not part of this loan' });
    }

    const messages = await Message.find({ loanRequest: req.params.requestId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Send a message on a specific request
router.post('/:requestId', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const loanRequest = await LoanRequest.findById(req.params.requestId);
    if (!loanRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const isBorrower = loanRequest.borrower.toString() === req.userId;
    const isOwner = loanRequest.owner.toString() === req.userId;
    if (!isBorrower && !isOwner) {
      return res.status(403).json({ error: 'You are not part of this loan' });
    }

    const message = await Message.create({
      loanRequest: req.params.requestId,
      sender: req.userId,
      text: text.trim(),
    });

    const populatedMessage = await message.populate('sender', 'name');

    res.status(201).json({ message: populatedMessage });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;