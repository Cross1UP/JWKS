//ENSURE YOU HAVE THE FOLLOWING INSTALLED:
//npm install --save-dev jest supertest

// Import the `request` module from Supertest to make HTTP requests
const request = require('supertest');
const app = require('./JWKSapp.js'); // Update this with your actual file name

// Test suite for the app
describe('Test suite for your Express app', () => {
  // Test case for GET request to /.well-known/jwks.json
  it('GET /.well-known/jwks.json should return a valid JWKS', async () => {
    const response = await request(app).get('/.well-known/jwks.json');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body.keys.length).toBeGreaterThan(0);
  });

  // Test case for POST request to /auth
  it('POST /auth should return a valid JWT token', async () => {
    const response = await request(app).post('/auth');
    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  // Test case for non-GET request to /.well-known/jwks.json
  it('GET /.well-known/jwks.json should return Method Not Allowed for non-GET requests', async () => {
    const response = await request(app).put('/.well-known/jwks.json');
    expect(response.statusCode).toBe(405);
    expect(response.text).toBe('Method Not Allowed');
  });

  // Test case for non-POST request to /auth
  it('POST /auth should return Method Not Allowed for non-POST requests', async () => {
    const response = await request(app).get('/auth');
    expect(response.statusCode).toBe(405);
    expect(response.text).toBe('Method Not Allowed');
  });
});