const express = require('express');
const LoanRequest = require('../models/LoanRequest');
const Item = require('../models/Item');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { itemId, proposedDays, agreedPrice } = req.body;

    if (!itemId || !proposedDays || !agreedPrice) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.owner.toString() === req.userId) {
      return res.status(400).json({ error: 'You cannot request your own item' });
    }

    if (item.status !== 'available') {
      return res.status(400).json({ error: 'Item is not available right now' });
    }

    const existingRequest = await LoanRequest.findOne({
      item: itemId,
      borrower: req.userId,
      status: { $in: ['requested', 'approved', 'pending_pickup', 'active'] },
    });
    if (existingRequest) {
      return res.status(409).json({ error: 'You already have an active request for this item' });
    }

    const loanRequest = await LoanRequest.create({
      item: itemId,
      borrower: req.userId,
      owner: item.owner,
      proposedDays,
      agreedPrice,
    });

    res.status(201).json({ message: 'Request sent', loanRequest });
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;