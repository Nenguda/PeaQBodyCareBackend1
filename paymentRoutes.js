const express = require('express');
const pool = require('../db');
const router = express.Router();

// ✅ Add Payment Method
router.post('/add', async (req, res) => {
  try {
    const { user_id, method_type, provider, account_number, expiry_date } = req.body;

    const result = await pool.query(
      `INSERT INTO payment_methods (user_id, method_type, provider, account_number, expiry_date)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [user_id, method_type, provider, account_number, expiry_date]
    );

    res.status(201).json({ message: 'Payment method added successfully', payment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding payment method' });
  }
});

// ✅ Get User Payment Methods
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query('SELECT * FROM payment_methods WHERE user_id = $1', [user_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payment methods' });
  }
});

module.exports = router;
