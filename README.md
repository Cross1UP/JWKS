# Basic JWKS Server
A basic JWKS server that can serve public keys with expiry and unique kid to verify JWTs. The server authenticates fake user requests, issues JWTs upon successful authentication, and handles the “expired” query parameter to issue JWTs signed with an expired key.
Part of UNT CSCE 3550.002 assignment. 
