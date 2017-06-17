'use strict';

const config = require('../config');
const mongoose = require('mongoose');
const userModel = require('./user');
//const Schema = mongoose.Schema;

const billSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    merchant: String,
    amount: Number,
    currency: String,
    date: Date,
    category: String,
    created_at: Date
});


billSchema.statics.fromEmail = function (email) {
    return userModel
        .fromEmail(email)
        .then(user => {
            return billModel.find({
                user: user
            }, {
                user: 0,
                __v: 0
            })
        })
};

billSchema.statics.getAfter = (email, date) => {
    return userModel
        .fromEmail(email)
        .then(user => {
            return billModel.find({
                user: user,
                created_at: {
                    $gt: date
                }
            }, {
                user: 0,
                __v: 0
            })
        })
};

billSchema.statics.getEditable = (billid) => {
    return billModel.find({
        _id: billid
    })
};
billSchema.statics.getReadable = (billid) => {
    return billModel.find({
        _id: billid
    }, {
        user: 0,
        __v: 0
    })
};

billSchema.statics.delete = (billid) => {
    return billModel.remove({
        _id: billid
    })
};

const billModel = mongoose.model('bill', billSchema);

module.exports = billModel;
