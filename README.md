# Extended JWKS Server Update
A basic JWKS server that can serve public keys with expiry and unique kid to verify JWTs. The server authenticates fake user requests, issues JWTs upon successful authentication, and handles the “expired” query parameter to issue JWTs signed with an expired key.

UPDATE: The JWKS server is now fortified with an SQLite database to store private keys. This will not only enhance the functionality of the program,but also act as a safeguard from attacks that prevent query manipulation. Thus, the authentication process remains resilient and trustworthy.

Part of UNT CSCE 3550.002 assignment. 

To run the files, ensure you have all the files in the same directory. 
1) Open your IDE (Preferably Visual Studio Code)
2) In the terminal, have both a command prompt and a PowerShell opened.
3) In the command prompt, write **node JWKSapp.js** and select enter.
4) If the terminal returns with "Server is running on port 8080", continue with the next step.
      Otherwise, check to see if your terminal is in the same directory as your files.
5) Go to your powershell, write **./gradebot project2**, and select enter.
      This is the test client, and it should return a list of tests that it performed on the program.
6) Once you are finished, ensure you press any key in the PowerShell to exit gradebot and crtl+C in the command prompt to exit JWKSapp.js
      
  
