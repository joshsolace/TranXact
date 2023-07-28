const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const Transfer = require('../models/transfer');
const bcrypt = require("bcrypt");
const axios = require('axios');


const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const generateOTP = require("../utils/generateOtp");
require ("dotenv").config()

exports.userSignup = async (req, res) => {
  const { firstname, lastname, email, phoneNumber, password } = req.body;
  try {
    // Check if user already exists
    const userAlreadyExist = await User.findOne({ email });
    if (userAlreadyExist) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const secretKey = process.env.VERIFICATION_SECRET_KEY;
    const token = jwt.sign({ email }, secretKey, { expiresIn: '5m' });

    // Hash the verification token
    const hashedToken = await bcrypt.hash(token, salt);

    // Create user with verification token
    const user = await User.create({
      firstname,
      lastname,
      email,
      phoneNumber,
      password: hashedPassword,
      verificationToken: hashedToken,
    });

    // Sending verification email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationUrl = `http://localhost:5461/api/v1/users/verify/${token}`;

    const mailOptions = {
      from: {
        name: "TranXact",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Account Verification",
      text: `Hello ${firstname}, Welcome to TranXact! Please click the link below to verify your account:
      ${verificationUrl}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({
          message: "Something went wrong",
          error: error.message,
        });
      } else {
        return res.status(200).json({
          message: "Account created successfully. Please check your email for verification.",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.verifyAccount = async (req, res) => {
  const { token } = req.params;

  try {
    // Verify the token
    const secretKey = process.env.VERIFICATION_SECRET_KEY;
    const decodedToken = jwt.verify(token, secretKey);

    // Find user with the specified email
    const user = await User.findOne({ email: decodedToken.email });

    if (!user) {
      return res.status(404).json({
        message: "User not found or verification token expired",
      });
    }

    // Check if the user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        message: "Account already verified",
      });
    }

    // Update user's verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    let walletID = "";

    while (true) {
      // Generate random 8-digit number
      const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
      walletID = "07" + randomNumber.toString();
    
      // Check if wallet ID already exists in the database
      const existingWallet = await Wallet.findOne({ walletId: walletID });
      if (!existingWallet) {
        // Wallet ID is unique, break the loop
        break;
      }
    }
    
    // Create WalletID
    const wallet = await Wallet.create({
      userId: user._id,
      walletId: walletID,
    });
    


    // Sending a welcoming email with wallet ID
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: {
        name: "TranXact",
        address: process.env.EMAIL_USER,
      },
      to: user.email,
      subject: "Welcome to TranXact",
      text: `Hello ${user.firstname}, Welcome to TranXact! Your account with wallet ID ${walletID} has been created and verified successfully.
      We hope you have a great experience with TranXact.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({
          message: "Something went wrong",
          error: error.message,
        });
      } else {
        return res.status(200).json({
          message: "Account verified successfully. Wallet ID sent to your email.",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const userExistInDB = await User.findOne({ email });
    if (!userExistInDB) {
      return res.status(404).json({
        message: "User does not exist, please sign up",
      });
    }
    // Check if password matches the one in the database
    const isPasswordValid = await bcrypt.compare(
      password,
      userExistInDB.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    // tokenize user
    const token = await jwt.sign(
      {
        email: userExistInDB.email,
        id: userExistInDB._id,
        firstname: userExistInDB.firstname,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXP,
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 3, // 3 minutes
    });

    return res.status(200).json({
      message: "Login Successful",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.userLogout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      message: "Logout Successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const otpDigits = 6; // Specify the desired number of digits for the OTP
  const expiration = 600000; // Specify the expiration time for the password reset token (in milliseconds)

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Generate the OTP with the specified number of digits
    const otp = generateOTP(otpDigits);

    // Save the token and OTP in the user document
    user.passwordResetToken = otp;
    user.passwordResetExpires = Date.now() + parseInt(expiration);
    await user.save();

    // Sending the OTP to the user's email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: {
        name: "TranXact",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({
          message: "Something went wrong",
          error: error.message,
        });
      } else {
        return res.status(200).json({
          message: "OTP sent successfully",
          otp,
        });
      }
    });
    console.log(otp);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { newPassword, confirmPassword, otp } = req.body;
  const { token } = req.params;

  try {
    // Verify OTP
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(404).json({
        error: "User not found or OTP has expired",
      });
    }

    // Verify OTP
    const verifyOTP = await verifyUserOTP(user, otp);
    if (!verifyOTP) {
      return res.status(400).json({
        error: "Invalid OTP",
      });
    }

    // Check if the new password matches the confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }


    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong while trying to reset the password",
      error: error.message,
    });
  }
};

exports.transferFunds = async (req, res) => {
  const { receiverWalletId, amount } = req.body;
  const senderId = req.user.id; // Assuming the sender's ID is available in the authenticated user's object

  try {
    // Find the sender's wallet based on the logged-in user's ID
    const senderWallet = await Wallet.findOne({ userId: senderId });
    if (!senderWallet) {
      return res.status(404).json({ message: 'Sender wallet not found' });
    }

    // Check if sender has sufficient balance
    if (senderWallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Find the receiver's wallet
    const receiverWallet = await Wallet.findOne({ walletId: receiverWalletId });
    if (!receiverWallet) {
      return res.status(404).json({ message: 'Receiver wallet not found' });
    }

    // Save balance before transfer
    const senderBalanceBefore = senderWallet.balance;
    const receiverBalanceBefore = receiverWallet.balance;

    // Perform the transfer
    senderWallet.balance -= amount;
    await senderWallet.save();

    receiverWallet.balance += amount;
    await receiverWallet.save();

    // Update balance after transfer
    const senderBalanceAfter = senderWallet.balance;
    const receiverBalanceAfter = receiverWallet.balance;

    // Create transfer record
    const transfer = new Transfer({
      senderId,
      recipientId: receiverWallet.userId,
      amount,
      senderBalanceBefore,
      senderBalanceAfter,
      receiverBalanceBefore,
      receiverBalanceAfter,
    });

    // Save the transfer to the database
    await transfer.save();

    return res.status(200).json({ message: 'Funds transferred successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

