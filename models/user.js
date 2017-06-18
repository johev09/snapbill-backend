'use strict';

const config = require('../config');
const mongoose = require('mongoose');
//const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    mobile: String,
    fb_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fb_user'
    },
    hashed_password: String,
    created_at: Date,
    temp_password: String,
    temp_password_time: Date,
    activated: Boolean,
});

userSchema.statics.fromEmail = (email) => {
    return userModel.find({
            email: email
        })
        .then(users => {
            if (users.length === 0) {
                throw new Error("user not found: " + email);
            }

            return users[0];
        });
};

userSchema.statics.fromEmailReadOnly = (email) => {
    return userModel.find({
        email: email
    }, {
        name: 1,
        email: 1,
        created_at: 1,
        temp_password: 1,
        temp_password_time: 1,
        activated: 1,
        _id: 1
    }).then(users => {
        if (users.length === 0) {
            throw new Error("user not found: " + email);
        }

        return users[0];
    })
}

userSchema.statics.addFromFB = (fbUser) => {
    const newUser = new userModel({
        name: fbUser.name,
        email: fbUser.email,
        created_at: new Date(),
        activated: true,
        fb_user: fbUser
    });
    return newUser.save()
}


const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
