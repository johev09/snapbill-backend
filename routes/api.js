const config = require('../config');
var express = require('express');
var router = express.Router();

const auth = require('basic-auth');

const jwtUtils = require('../controllers/jwt-utils');
const userApi = require('./user');
const billApi = require('./bill');

router.use('/v1/user', userApi)
router.use('/v1/bill', billApi)

module.exports = router;
