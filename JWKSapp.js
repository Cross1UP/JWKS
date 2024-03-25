//Ensure you have the following installed:
//npm install express crypto jsonwebtoken node-jose body-parser sqlite3

const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const jose = require('node-jose');
const sqlite3 = require('sqlite3').verbose(); // Import SQLite
const app = express();
const bodyParser = require('body-parser');

const db = new sqlite3.Database('totally_not_my_privateKeys.db'); // Create or connect to the SQL database

app.use(bodyParser.json());

// Function to generate RSA key pair and store it in SQLite
async function keyPairsGen() {
    let keys = await jose.JWK.createKey('RSA', 2048, { alg: 'RS256', use: 'sig' });
    expiredKeys = await jose.JWK.createKey('RSA', 2048, { alg: 'RS256', use: 'sig' });
}
// Function to generate RSA key pair and save to the database
async function generateAndSaveKeyPairs() {
    const key = await jose.JWK.createKey('RSA', 2048, { alg: 'RS256', use: 'sig' });
    const serializedKey = key.toJSON(true); // Serialize key
    const expiry = Math.floor(Date.now() / 1000) + 3600; // Key expires 1 hour
    db.run('INSERT INTO keys (key, exp) VALUES (?, ?)', [JSON.stringify(serializedKey), expiry]);
}

// Database retrieval of a private key
async function getPrivateKey(expired = false) {
    return new Promise((resolve, reject) => {
        const now = Math.floor(Date.now() / 1000);
        const condition = expired ? 'WHERE exp <= ?' : 'WHERE exp > ?'; // Get expired or unexpired key
        db.get(`SELECT * FROM keys ${condition} ORDER BY exp DESC LIMIT 1`, [now], (err, row) => {
            if (err) {
                reject(err);
            } else {
                const key = jose.JWK.asKey(JSON.parse(row.key)); // Deserialize key
                resolve(key);
            }
        });
    });
}

// Generate a JWT
async function generateJWT(privateKey) {
    const payload = {
        user: 'JanDeLaCruz',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
    };
    const options = {
        algorithm: 'RS256',
        header: {
            typ: 'JWT',
            alg: 'RS256',
            kid: privateKey.kid
        }
    };
    return jwt.sign(payload, privateKey.toPEM(true), options);
}


function expiredJWT() {
    // Payload that holds the user data
    const payload = {
        user: 'JanDeLaCruz',
        iat: Math.floor(Date.now() / 1000) - 30000,
        exp: Math.floor(Date.now() / 1000) - 3600
    };

    //JWT signing information of the algorithm and header
    const options = {
        algorithm: 'RS256',
        header: {
            typ: 'JWT',
            alg: 'RS256',
            kid: expiredKeys.kid
      }
    }; expiredToken = jwt.sign(payload, expiredKeys.toPEM(true), options);
}

// Endpoint to serve JWKS
app.get('/.well-known/jwks.json', async (req, res) => {
    const now = Math.floor(Date.now() / 1000);
    db.all('SELECT * FROM keys WHERE exp > ?', [now], (err, rows) => {
        if (err) {
            res.status(500).send('Internal Server Error');
        } else {
            const validKeys = rows.map(row => jose.JWK.asKey(JSON.parse(row.key)));
            res.setHeader('Content-Type', 'application/json');
            res.json({ keys: validKeys.map(key => key.toJSON()) });
        }
    });
});

// Endpoint to issue JWT
app.post('/auth', async (req, res) => {
    const expired = req.query.expired === 'true';
    try {
        const privateKey = await getPrivateKey(expired);
        const jwtToken = await generateJWT(privateKey);
        res.json({ token: jwtToken });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Handling other HTTP methods on the specified routes
app.all('/.well-known/jwks.json', (req, res, next) => {
    if (req.method !== 'GET') {
        res.status(405).send('Method Not Allowed');
    } else {
        next();
    }
});

app.all('/auth', (req, res, next) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
    } else {
        next();
    }
});

const PORT = 8080;

// Start server
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS keys (kid INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL, exp INTEGER NOT NULL)');
    generateAndSaveKeyPairs().then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    });
});
