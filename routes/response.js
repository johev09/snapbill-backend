const config = require('../config');
var express = require('express');

const auth = require('basic-auth');
const jwtUtils = require('../controllers/jwt-utils');

var response = {
    message: function (res) {
        return _message.bind(res);
    },
    error: function (res) {
        return _error.bind(res);
    },
    paramMissing: function(res) {
        res.status(400)
        .json({
            message: 'missing params'
        });
    }
};

function _message(result) {
    this.status(result.status).json({
        message: result.message
    });
}

function _error(err) {
    console.log(err);
    var message = err.message ? err.message : 'internal server error';
    this.status(500).json({
        message: message
    })
}

module.exports = response;
