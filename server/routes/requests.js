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


// Get requests where I'm the borrower
router.get('/my-requests', authMiddleware, async (req, res) => {
  try {
    const requests = await LoanRequest.find({ borrower: req.userId })
      .populate('item', 'title pricePerLoan')
      .populate('owner', 'name email');
    res.json({ requests });
  } catch (err) {
    console.error('Get my requests error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get requests where I'm the owner (incoming requests on my items)
router.get('/incoming', authMiddleware, async (req, res) => {
  try {
    const requests = await LoanRequest.find({ owner: req.userId })
      .populate('item', 'title pricePerLoan')
      .populate('borrower', 'name email');
    res.json({ requests });
  } catch (err) {
    console.error('Get incoming requests error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Owner approves or rejects a request
router.patch('/:id/respond', authMiddleware, async (req, res) => {
  try {
    const { action } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be approve or reject' });
    }

    const loanRequest = await LoanRequest.findById(req.params.id);
    if (!loanRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (loanRequest.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the item owner can respond to this request' });
    }

    if (loanRequest.status !== 'requested') {
      return res.status(400).json({ error: 'This request has already been responded to' });
    }

    if (action === 'approve') {
      const item = await Item.findById(loanRequest.item);
      if (!item || item.status !== 'available') {
        return res.status(400).json({ error: 'Item is no longer available' });
      }

      loanRequest.status = 'approved';
      await Item.findByIdAndUpdate(loanRequest.item, { status: 'requested' });

      // Auto-reject all other pending requests for this item
      await LoanRequest.updateMany(
        { item: loanRequest.item, status: 'requested', _id: { $ne: loanRequest._id } },
        { status: 'rejected' }
      );
    } else {
      loanRequest.status = 'rejected';
    }

    await loanRequest.save();

    res.json({ message: `Request ${loanRequest.status}`, loanRequest });
  } catch (err) {
    console.error('Respond to request error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Confirm handover (either borrower or owner side)
router.patch('/:id/confirm-handover', authMiddleware, async (req, res) => {
  try {
    const loanRequest = await LoanRequest.findById(req.params.id);
    if (!loanRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (loanRequest.status !== 'approved' && loanRequest.status !== 'pending_pickup') {
      return res.status(400).json({ error: 'This loan is not ready for handover confirmation' });
    }

    const isBorrower = loanRequest.borrower.toString() === req.userId;
    const isOwner = loanRequest.owner.toString() === req.userId;

    if (!isBorrower && !isOwner) {
      return res.status(403).json({ error: 'You are not part of this loan' });
    }

    if (isBorrower) {
      loanRequest.borrowerConfirmedHandover = true;
    }
    if (isOwner) {
      loanRequest.ownerConfirmedHandover = true;
    }

    // Move to pending_pickup once at least one side has confirmed
    if (loanRequest.status === 'approved') {
      loanRequest.status = 'pending_pickup';
    }

    // Once BOTH sides confirm, activate the loan
    if (loanRequest.borrowerConfirmedHandover && loanRequest.ownerConfirmedHandover) {
      loanRequest.status = 'active';
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + loanRequest.proposedDays);
      loanRequest.dueDate = dueDate;

      await Item.findByIdAndUpdate(loanRequest.item, { status: 'lent' });
    }

    await loanRequest.save();

    res.json({ message: 'Handover confirmed', loanRequest });
  } catch (err) {
    console.error('Confirm handover error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Confirm return (either borrower or owner side)
router.patch('/:id/confirm-return', authMiddleware, async (req, res) => {
  try {
    const loanRequest = await LoanRequest.findById(req.params.id);
    if (!loanRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (loanRequest.status !== 'active') {
      return res.status(400).json({ error: 'This loan is not currently active' });
    }

    const isBorrower = loanRequest.borrower.toString() === req.userId;
    const isOwner = loanRequest.owner.toString() === req.userId;

    if (!isBorrower && !isOwner) {
      return res.status(403).json({ error: 'You are not part of this loan' });
    }

    if (isBorrower) {
      loanRequest.borrowerConfirmedReturn = true;
    }
    if (isOwner) {
      loanRequest.ownerConfirmedReturn = true;
    }

    if (loanRequest.borrowerConfirmedReturn && loanRequest.ownerConfirmedReturn) {
      loanRequest.status = 'returned';
      await Item.findByIdAndUpdate(loanRequest.item, { status: 'available' });
    }

    await loanRequest.save();

    res.json({ message: 'Return confirmed', loanRequest });
  } catch (err) {
    console.error('Confirm return error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get a single loan request by ID (only borrower or owner can view)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const loanRequest = await LoanRequest.findById(req.params.id)
      .populate('item', 'title')
      .populate('borrower', 'name')
      .populate('owner', 'name');

    if (!loanRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const isBorrower = loanRequest.borrower._id.toString() === req.userId;
    const isOwner = loanRequest.owner._id.toString() === req.userId;
    if (!isBorrower && !isOwner) {
      return res.status(403).json({ error: 'You are not part of this loan' });
    }

    res.json({ loanRequest });
  } catch (err) {
    console.error('Get request error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


module.exports = router;