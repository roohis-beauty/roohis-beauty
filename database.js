const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'roohis.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

db.serialize(() => {
    // 1. Create Products Table
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            sale_price REAL,
            description TEXT,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 2. Create Orders Table
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            trx_id TEXT,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 3. Seed Initial Demo Data
    db.get(`SELECT COUNT(*) as count FROM products`, (err, row) => {
        if (err) return console.error(err.message);
        
        if (row.count === 0) {
            const stmt = db.prepare(`
                INSERT INTO products (name, category, price, sale_price, description, image_url)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            
            stmt.run(
                'Clinical Gentle Cleanser',
                'Cleansers',
                24.00,
                19.99,
                'Dermatologist-tested foaming cleanser for daily industrial hydration.',
                'https://via.placeholder.com/300x300?text=Gentle+Cleanser'
            );
            stmt.run(
                'Hydrating Barrier Serum',
                'Serums',
                45.00,
                38.00,
                'High-potency hyaluronic acid formulation restoring skin barrier function.',
                'https://via.placeholder.com/300x300?text=Barrier+Serum'
            );
            stmt.run(
                'Restorative Night Cream',
                'Moisturizers',
                32.00,
                null,
                'Deeply hydrating lipid cream designed for overnight skin recovery.',
                'https://via.placeholder.com/300x300?text=Night+Cream'
            );

            stmt.finalize();
            console.log('Database seeded with initial product catalog.');
        }
    });
});

module.exports = db;