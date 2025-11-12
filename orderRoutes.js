const express = require('express');
const pool = require('../db');
const router = express.Router();

// ✅ Create New Order
router.post('/create', async (req, res) => {
  try {
    const {
      order_number,
      user_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      customer_city,
      total_price,
      items
    } = req.body;

    // Create order
    const orderResult = await pool.query(
      `INSERT INTO orders (order_number, user_id, customer_name, customer_email, customer_phone, customer_address, customer_city, total_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [order_number, user_id, customer_name, customer_email, customer_phone, customer_address, customer_city, total_price]
    );

    const orderId = orderResult.rows[0].id;

    // Add order items
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price]
      );

      try {
  await pool.query(
    `UPDATE products 
     SET stock_quantity = stock_quantity - $1, 
         total_sold = total_sold + $1 
     WHERE id = $2`,
    [item.quantity, item.product_id]
  );
} catch (error) {
  console.error('Error updating product stock:', error);
}
    }

    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// ✅ Get All Orders
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// ✅ Update Order Status
router.put('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    await pool.query('UPDATE orders SET order_status = $1 WHERE id = $2', [order_status, id]);
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status' });
  }
});

module.exports = router;
