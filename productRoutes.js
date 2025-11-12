const express = require('express');
const pool = require('../db');
const router = express.Router();

// ✅ Get All Active Products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE is_deleted = FALSE ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// ✅ Add a Product
router.post('/add', async (req, res) => {
  try {
    const { name, description, category, size, stock_quantity, price, image_url } = req.body;

    const result = await pool.query(
      `INSERT INTO products (name, description, category, size, stock_quantity, price, image_url, total_added)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$5) RETURNING *`,
      [name, description, category, size, stock_quantity, price, image_url]
    );

    res.json({ message: 'Product added successfully', product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding product' });
  }
});

// ✅ Soft Delete Product
router.put('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('UPDATE products SET is_deleted = TRUE WHERE id = $1', [id]);
    res.json({ message: 'Product marked as deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// ✅ Update Product Stock & Sold Count
router.put('/update-stock/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantitySold } = req.body;

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

    res.json({ message: 'Product stock updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating stock' });
  }
});

module.exports = router;
