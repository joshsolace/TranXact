const mongoose = require("mongoose");


const transactionSchema=mongoose.Schema ({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Wallet",
    },
    transactionType: {
        type: String,
        enum: ["Credit", "Debit", "Transfer", "Withdrawal"],
    },
    status: {
        type: String,
        enum: ["Pending", "Compeleted", "Failed"],
        default: "Pending",
    }
},{
    timestamps: true
})

module.exports = mongoose.model("Transaction", transactionSchema);

const https = require('https')

const params = JSON.stringify({
  "email": "customer@email.com",
  "amount": "20000"
})

const options = {
  hostname: 'api.paystack.co',
  port: 443,
  path: '/transaction/initialize',
  method: 'POST',
  headers: {
    Authorization: 'Bearer SECRET_KEY',
    'Content-Type': 'application/json'
  }
}

const req = https.request(options, res => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  });

  res.on('end', () => {
    console.log(JSON.parse(data))
  })
}).on('error', error => {
  console.error(error)
})

req.write(params)
req.end()