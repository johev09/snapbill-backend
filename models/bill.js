'use strict';

const config = require('../config');
const mongoose = require('mongoose');
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

module.exports = mongoose.model('bill', billSchema);
