const jwt = require("jsonwebtoken");


exports.isAuthenticated = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) return res.status(401).json({ 
        error:error.massage, 
        message: "Authentication failed" 
    });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) return res.status(401).json({
        error:error.massage, 
        message: "Authentication failed"
     });

    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ 
        error:error.message,
        message: "Authentication failed 🔒🔒🔒🔒🔒🔒🔒",
     });
  }
};
