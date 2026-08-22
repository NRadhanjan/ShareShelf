const express = require('express');
const Item = require('../models/Item');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, pricePerLoan, maxLoanDays } = req.body;

    if (!title || !description || !pricePerLoan || !maxLoanDays) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const item = await Item.create({
      title,
      description,
      pricePerLoan,
      maxLoanDays,
      owner: req.userId,
    });

    res.status(201).json({ message: 'Item listed successfully', item });
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get all available items (public - no auth needed to browse), with optional search
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;

    const filter = { status: 'available' };
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const items = await Item.find(filter).populate('owner', 'name email');
    res.json({ items });
  } catch (err) {
    console.error('Get items error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get a single item by ID (also public)
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name email');
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ item });
  } catch (err) {
    console.error('Get item error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;