const express = require ("express");
const { userSignup, userLogin, userLogout, forgotPassword, resetPassword, verifyAccount, transferFunds, transferToOtherBanks } = require("../controller/userController");
const { validateRequest, schemas } = require("../validation/validate");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");

const path = require("path");

// Render the signup form
router.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/signup.html"));
});

// Handle the form submission
router.post("/signup", validateRequest(schemas.signupSchema), userSignup);
router.post("/login", validateRequest(schemas.loginSchema), userLogin); 
router.get("/logout", userLogout);
router.put("/forgetpassword",forgotPassword);
router.get ("/resetpassword/:token", resetPassword)
router.get('/verify/:token', verifyAccount);
router.post('/transfer', isAuthenticated, transferFunds);
router.post('/transfertootherbanks', isAuthenticated, transferToOtherBanks);

// export routes
module.exports=router