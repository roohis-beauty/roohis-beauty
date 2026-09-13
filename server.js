const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint to fetch all products dynamically
app.get('/api/products', async (req, res) => {
    try {
        const result = await db.execute('SELECT * FROM products');
        res.json({ products: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running live on http://localhost:${PORT}`);
});