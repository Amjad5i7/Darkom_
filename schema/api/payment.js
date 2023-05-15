var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var paymentSchema = new Schema({
    userId: { type: mongoose.Schema.ObjectId, ref: 'User', default: "" },
    accountOwnerName: { type: String, default: '' },
    accountNumberOrIBAN: { type: String,  unique: true, default: '' },
    isDelete: { type: Boolean, default: false },
},
    {
        timestamps: true

    });
module.exports = mongoose.model('Payment', paymentSchema);