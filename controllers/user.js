const userModel = require('../models/user');
const fbUserModel = require('../models/fb-user')
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const common = require('./common')
var emailValidator = require("email-validator");

const config = require('../config');

const randomstring = require("randomstring");

const mailer = require('./mailer');

var controller = {
    register: (name, email, password) => {
        return new Promise((resolve, reject) => {
            if (!emailValidator.validate(email)) {
                reject({
                    status: 401,
                    message: 'Invalid Email'
                })
            } else {

                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(password, salt);

                const newUser = new userModel({
                    name: name,
                    email: email,
                    hashed_password: hash,
                    created_at: new Date(),
                    activated: false
                });
                newUser.save()
                    .then(() => {
                        controller.sendActivationMail(newUser);
                        resolve({
                            status: 201,
                            message: 'User registered sucessfully'
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        if (err.code == 11000) {
                            reject({
                                status: 409,
                                message: 'User already registered'
                            });
                        } else {
                            reject({
                                status: 500,
                                message: 'Internal server error'
                            });
                        }
                    });

            }
        });
    },
    registerFB: (name, email, pictureUrl) => {
        return new Promise((resolve, reject) => {
            if (!emailValidator.validate(email)) {
                reject({
                    status: 401,
                    message: 'Invalid Email'
                })
            } else {
                //looking for user in base user table 
                userModel.fromEmail(email)
                    .then(user => {
                        //user exists in base table
                        //checking if already Fb Auth'd
                        if (user.fb_user) {
                            resolve({
                                status: 200,
                                message: email
                            })
                        }
                        //not already fb auth'd
                        //need to add to fb_user 
                        //store ref to base user table
                        else {
                            fbUserModel.add(name, email, pictureUrl)
                                .then((fbUser) => {
                                    user.fb_user = fbUser;
                                    user.save().then(() => {
                                        resolve({
                                            status: 200,
                                            message: "user saved"
                                        })
                                    })
                                })
                                .catch(common.internalServerError.bind(reject))
                        }
                    })
                    //create a new User document in
                    //fb-user with ref in user
                    .catch(err => {
                        fbUserModel.add(name, email, pictureUrl)
                            .then((fbUser) => {
                                userModel.addFromFB(fbUser)
                                    .then(() => {
                                        resolve({
                                            status: 200,
                                            message: email
                                        })
                                    })
                                    .catch((err) => {
                                        reject({
                                            status: 500,
                                            message: "Internal Server error"
                                        })
                                    })
                            })
                            .catch(common.internalServerError(reject))
                    })
            }
        });

    },
    sendActivationMail: (user) => {
        const salt = bcrypt.genSaltSync(10);
        const random = randomstring.generate({
            length: 6,
            charset: 'numeric'
        });
        const temp_hash = bcrypt.hashSync(random, salt);

        user.temp_password = temp_hash;
        user.temp_password_time = new Date();
        user.save();

        console.log("sending activation mail...");
        var info = mailer.sendActivationMail(random, user);
        console.log(info);
        console.log("sent activation mail...");
    },
    activate: (email, token) => {
        return new Promise((resolve, reject) => {
            controller.getWritable(email)
                .then(user => {
                    console.log("activating...");
                    console.log(user);
                    const diff = new Date() - new Date(user.temp_password_time);
                    const seconds = Math.floor(diff / 1000);
                    console.log(`Seconds : ${seconds}`);

                    if (seconds <= config.activationTimeout) {
                        return user;
                    } else {
                        reject({
                            status: 401,
                            message: 'Time Out, Try again'
                        });
                    }
                }).then(user => {
                    if (bcrypt.compareSync(token, user.temp_password)) {
                        user.activated = true;
                        user.save();
                        resolve({
                            status: 200,
                            message: email
                        })
                    } else {
                        reject({
                            status: 401,
                            message: 'Invalid Token'
                        });
                    }
                })
                .catch(err => reject({
                    status: 500,
                    message: err.message
                }));
        });
    },
    login: (email, password) => {
        return new Promise((resolve, reject) => {
            controller.getWritable(email)
                .then(user => {
                    const hashed_password = user.hashed_password;
                    //password correct
                    if (bcrypt.compareSync(password, hashed_password)) {
                        //user not activated
                        if (!user.activated) {
                            controller.sendActivationMail(user)
                            reject({
                                status: 401,
                                message: 'User not activated'
                            });
                        }
                        //user activated
                        else {
                            resolve({
                                status: 200,
                                message: email
                            });
                        }
                    }
                    //email or password incorrect
                    else {
                        reject({
                            status: 401,
                            message: 'Invalid Credentials'
                        });
                    }
                })
                .catch(common.internalServerError(reject))
        });
    },
    get: (email) => {
        return new Promise((resolve, reject) => {
            userModel.fromEmailReadOnly(email)
                .then(user => resolve(user))
                .catch(common.internalServerError(reject))
        });
    },
    getWritable: (email) => {
        return new Promise((resolve, reject) => {
            userModel.find({
                    email: email
                })
                .then(users => {
                    if (users.length === 0) {
                        reject({
                            status: 400,
                            message: 'User Not Found'
                        })
                    } else {
                        resolve(users[0])
                    }
                })
                .catch(common.internalServerError(reject))
        });
    },
    changePassword: (email, password, newPassword) => {
        return new Promise((resolve, reject) => {
            userModel.find({
                    email: email
                })
                .then(users => {
                    let user = users[0];
                    const hashed_password = user.hashed_password;
                    if (bcrypt.compareSync(password, hashed_password)) {
                        const salt = bcrypt.genSaltSync(10);
                        const hash = bcrypt.hashSync(newPassword, salt);
                        user.hashed_password = hash;
                        return user.save();
                    } else {
                        reject({
                            status: 401,
                            message: 'Invalid Old Password'
                        });
                    }
                })
                .then(user => resolve({
                    status: 200,
                    message: 'Password updated sucessfully'
                }))
                .catch(common.internalServerError(reject))
        });
    },
    resetPasswordInit: (email) => {
        return new Promise((resolve, reject) => {
            const random = randomstring.generate(8);
            controller.getWritable(email)
                .then(user => {
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(random, salt);
                    user.temp_password = hash;
                    user.temp_password_time = new Date();
                    return user.save();
                })
                .then(user => {
                    return mailer.sendResetPasswordMail(random, user);
                })
                .then(info => {
                    console.log(info);
                    resolve({
                        status: 200,
                        message: 'Check mail for instructions'
                    })
                })
                .catch(common.internalServerError(reject))
        });
    },
    resetPasswordFinish: (email, token, password) => {
        return new Promise((resolve, reject) => {
            controller.getWritable(email)
                .then(user => {
                    console.log(user);
                    const diff = new Date() - new Date(user.temp_password_time);
                    const seconds = Math.floor(diff / 1000);
                    console.log(`Seconds : ${seconds}`);

                    if (seconds < config.password.resetTimeout) {
                        return user;
                    } else {
                        reject({
                            status: 401,
                            message: 'Time Out, Try again'
                        });
                    }
                }).then(user => {
                    if (bcrypt.compareSync(token, user.temp_password)) {
                        const salt = bcrypt.genSaltSync(10);
                        const hash = bcrypt.hashSync(password, salt);
                        user.hashed_password = hash;
                        user.temp_password = undefined;
                        user.temp_password_time = undefined;
                        return user.save();
                    } else {
                        reject({
                            status: 401,
                            message: 'Invalid Token'
                        });
                    }
                })
                .then(user => resolve({
                    status: 200,
                    message: 'Password Changed Successfully '
                }))
                .catch(err => reject({
                    status: 500,
                    message: err.message
                }));
        });
    }
}

module.exports = controller;
