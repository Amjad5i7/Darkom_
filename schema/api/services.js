var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var serviceSchema = new Schema({
    providerId: { type: mongoose.Schema.ObjectId, ref: 'User', default: "" },
    serviceType: { type: String, enum: ['plan', 'activity'] },
    serviceName: { type: String, default: '' },
    description: { type: String, default: '' },
    numOfVisitors: { type: Number, default: '' },
    fromDate: { type: String, default: '' },
    toDate: { type: String, default: '' },
    price: { type: Number, default: null },
    images: { type: String, default: null },
    activities: [{ type: String, default: '' }],
    isDelete: { type: Boolean, default: false },
},
    {
        timestamps: true

    });
module.exports = mongoose.model('Service', serviceSchema);

// Plan name						Activity Name
// Description						Description
// Max. Number of Visitors				Max. Number of Visitors
// Available Dates From (date)			Available Dates From (date)
// To (date)						To (date)
// $ Price						$ Price
// Images 						Images
// Activities