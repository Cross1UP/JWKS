const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const jose = require('node-jose');
const app = express();
const bodyParser = require('body-parser');

let keys;
let expiredKeys;
let token;
let expiredToken;

app.use(bodyParser.json());

// Function to generate RSA key pair
async function keyPairsGen() {
    keys = await jose.JWK.createKey('RSA', 2048, { alg: 'RS256', use: 'sig' });
    expiredKeys = await jose.JWK.createKey('RSA', 2048, { alg: 'RS256', use: 'sig' });
}

// Sample tokens 
function tokensGen() {
    // Payload that holds the user data
    const payload = {
        user: 'JanDeLaCruz',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
  };
    //JWT signing information of the algorithm and header
    const options = {
        algorithm: 'RS256',
        header: {
            typ: 'JWT',
            alg: 'RS256',
            kid: keys.kid
    }
  }; token = jwt.sign(payload, keys.toPEM(true), options);
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
app.get('/.well-known/jwks.json', (req, res) => {
    const validKeys = [keys].filter(key => !key.expired);
    res.setHeader('Content-Type', 'application/json');
    res.json({ keys: validKeys.map(key => key.toJSON()) });
  });

// Endpoint to issue JWT
app.post('/auth', (req, res) => {
    if (req.query.expired === 'true'){
        return res.send(expiredToken);
      }
    res.json({ token });
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
keyPairsGen().then(() => {
    tokensGen()
    expiredJWT()
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });    
});
  