'use strict';

const config = require('../config');
const mongoose = require('mongoose');
//const Schema = mongoose.Schema;

const fbUserSchema = mongoose.Schema({
    name: String,
    email: String,
    pictureUrl: String
});

fbUserSchema.statics.fromEmail = (email) => {
    return fbUserModel.find({
            email: email
        })
        .then(users => {
            if (users.length === 0) {
                throw new Error("user not found: " + email);
            }

            return users[0];
        });
}

fbUserSchema.statics.add = (name, email, pictureUrl) => {
    const newUser = new fbUserModel({
        name: name,
        email: email,
        pictureUrl: pictureUrl
    });
    return newUser.save()
        .then(() => {
            return newUser
        })
}

const fbUserModel = mongoose.model('fb_user', fbUserSchema);

module.exports = fbUserModel;
