const jwt = require('jsonwebtoken');

// The JWT to verify
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWNlOTBlY2IyZjI0YmVkZjUyODYxYyIsImlhdCI6MTY4MzgxMjgzOSwiZXhwIjoxNjgzODEzMTM5fQ.wq4mW85Z3-LKW_9pSWKpUU-QnqUNFqzNNq63aoFl8ZQ';

// The secret key used to sign the JWT
const secretKey = 'oiuytrekjhsksxcvbnm,nbvcvbn';

// Verify the JWT signature
jwt.verify(token, secretKey, (err, decoded) => {
  if (err) {
    console.log(err.message);
    // Handle the error here
  } else {
    console.log(decoded);
    // The JWT is valid
  }
});
