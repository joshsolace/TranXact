const mongoose= require ("mongoose");

const walletSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    walletId: {
        type: String,
    },
    balance: {
        type: Number,
        default: 0,
    },
},{
    timestamps: true
});

module.exports = mongoose.model("Wallet", walletSchema)