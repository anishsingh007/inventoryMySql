const express = require('express');
const mysql = require('mysql');
const axios = require('axios');

const app = express();
const port = 3000;

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '180828',
  database: 'inventory',
});

// Connect to the MySQL database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }

  console.log('Connected to the database as id ' + connection.threadId);
});

// Serve static files
app.use(express.static('public'));

// Parse JSON request bodies
app.use(express.json());

// Handle form submission
app.post('/items', (req, res) => {
  const item = req.body.itemName;
  const desc = req.body.description;
  const price = req.body.price;
  const qty = req.body.quantity;

  const sql = 'INSERT INTO items (item, description, price, quantity) VALUES (?, ?, ?, ?)';
  connection.query(sql, [item, desc, price, qty], (err, results) => {
    if (err) {
      console.error('Error inserting item into the database: ' + err.stack);
      res.status(500).json({ error: 'Failed to add item' });
      return;
    }

    const itemId = results.insertId;
    const newItem = { id: itemId, item, desc, price, qty };
    res.status(201).json(newItem);
  });
});

// Get all items
app.get('/items', (req, res) => {
  const sql = 'SELECT * FROM items';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving items from the database: ' + err.stack);
      res.status(500).json({ error: 'Failed to retrieve items' });
      return;
    }

    res.json(results);
  });
});

// Update item quantity
app.put('/items/:id', (req, res) => {
  const itemId = req.params.id;
  const updatedQty = req.body.qty;

  const sql = 'UPDATE items SET quantity = ? WHERE id = ?';
  connection.query(sql, [updatedQty, itemId], (err, results) => {
    if (err) {
      console.error('Error updating item quantity in the database: ' + err.stack);
      res.status(500).json({ error: 'Failed to update item quantity' });
      return;
    }

    res.sendStatus(200);
  });
});

// Delete item
app.delete('/items/:id', (req, res) => {
  const itemId = req.params.id;

  const sql = 'DELETE FROM items WHERE id = ?';
  connection.query(sql, [itemId], (err, results) => {
    if (err) {
      console.error('Error deleting item from the database: ' + err.stack);
      res.status(500).json({ error: 'Failed to delete item' });
      return;
    }

    res.sendStatus(200);
  });
});

// Create the items table if it doesn't exist
const createTableQuery = `
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL
)`;

connection.query(createTableQuery, (err) => {
  if (err) {
    console.error('Error creating table: ' + err.stack);
    return;
  }

  console.log('Table created or already exists');
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
