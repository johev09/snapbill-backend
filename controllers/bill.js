const billModel = require('../models/bill');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const config = require('../config');

const users = require('./user');

var controller = {
    add: (values) => {
        return new Promise((resolve, reject) => {
            if (isNaN(values.amount)) {
                reject({
                    status: 400,
                    message: 'amount must be a number'
                })
            } else {
                users.get(values.id)
                    .then(user => {
                        if (!controller.isDate(values.date)) {
                            reject({
                                status: 500,
                                message: 'bill date invalid'
                            });
                        } else {
                            var newBill = new billModel({
                                user: user._id,
                                merchant: values.merchant,
                                amount: values.amount,
                                currency: values.currency,
                                category: values.category,
                                date: new Date(values.date),
                                created_at: new Date()
                            });

                            newBill.save()
                                .then(() => {
                                    resolve({
                                        status: 200,
                                        message: 'bill saved successfully'
                                    })
                                })
                                .catch(err => {
                                    console.log('ERROR: bill save');
                                    console.log(err);
                                    reject({
                                        status: 401,
                                        message: 'bill save failed'
                                    });
                                });
                        }
                    })
                    .catch(err => reject(err));
            }
        });
    },

    get: (billid) => {
        return new Promise((resolve, reject) => {
            billModel.find({
                    _id: billid
                }, {
                    user: 0,
                    __v: 0,
                    created_at: 0
                })
                .then(bills => resolve(bills[0]))
                .catch(err => reject(err));
        });
    },
    getAll: (userid) => {
        return new Promise((resolve, reject) => {
            users.get(userid)
                .then(user => {
                    billModel.find({
                            user: user._id
                        }, {
                            _id: 1,
                            merchant: 1,
                            amount: 1,
                            currency: 1,
                            category: 1,
                            date: 1,
                        })
                        .then(bills => resolve(bills))
                        .catch(err => reject(err))
                })
                .catch(err => reject(err));

        });
    },

    update: (values) => {
        return new Promise((resolve, reject) => {
            billModel.find({
                    _id: values.billid
                })
                .then(bills => {
                    if (!bills || bills.length == 0) {
                        reject({
                            status: 400,
                            message: 'bill does not exist'
                        });
                    } else {
                        var bill = bills[0];
                        if (values.merchant)
                            bill.merchant = values.merchant;
                        if (values.amount)
                            bill.amount = values.amount;
                        if (values.currency)
                            bill.currency = values.currency;
                        if (values.category)
                            bill.category = values.category;
                        if (values.date) {
                            if (controller.isDate(values.date)) {
                                bill.date = bill.date;
                            } else {
                                return reject({
                                    status: 400,
                                    message: 'bill date invalid'
                                })
                            }
                        }

                        return bill.save();
                    }
                })
                .then(bill => {
                    resolve({
                        status: 200,
                        message: 'bill updated successfully'
                    })
                })
                .catch(err => reject(err));
        });
    },
    isDate: (str) => {
        var date = new Date(str);
        return date == 'Invalid Date' ? null : date;
    },

    delete: (billid) => {
        return new Promise((resolve, reject) => {
            billModel.remove({
                    _id: billid
                })
                .then(() => resolve({
                    status: 200,
                    message: 'bill deleted'
                }))
                .catch(err => reject(err))
        })
    }
}

module.exports = controller;
