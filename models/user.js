'use strict';

const config = require('../config');
const mongoose = require('mongoose');
//const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    hashed_password: String,
    created_at: Date,
    temp_password: String,
    temp_password_time: Date,
    activated: Boolean,
});

module.exports = mongoose.model('user', userSchema);
