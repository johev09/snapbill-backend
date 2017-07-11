const config = require('../config');
var express = require('express');
var router = express.Router();

const bill = require('../controllers/bill.js');
const jwtUtils = require('../controllers/jwt-utils');

const response = require('./response');

router.post('/add/:id', jwtUtils.checkToken, (req, res) => {
    console.log(req.body);
    // checking if any required param
    // is missing
    if (!req.body.merchant ||
        !req.body.amount ||
        !req.body.currency ||
        !req.body.category ||
        !req.body.date) {
        response.paramMissing(res);
    } else {
        bill.add({
                id: req.params.id,
                merchant: req.body.merchant,
                amount: req.body.amount,
                currency: req.body.currency,
                category: req.body.category,
                date: req.body.date,
            })
            .then(response.message(res))
            .catch(response.error(res));
    }
});

router.get('/getall/:id', jwtUtils.checkToken, (req, res) => {
    bill.getAll(req.params.id)
        .then(bills => {
            res.status(200).json({
                bills: bills
            })
        })
        .catch(response.error(res));
});

router.get('/get/:id/after/:date', jwtUtils.checkToken, (req, res) => {
    var afterDate = new Date(req.params.date);
    bill.getAfter(req.params.id, afterDate)
        .then(bills => {
            res.status(200).json({
                bills: bills
            })
        })
        .catch(response.error(res));
});

router.get('/get/:id/:billid', jwtUtils.checkToken, (req, res) => {
    bill.get(req.params.billid)
        .then(bill => {
            res.status(200).json({
                bill: bill
            })
        })
        .catch(response.error(res));
});

router.post('/update/:id/:billid', jwtUtils.checkToken, (req, res) => {
    // billid required and
    // at least one of other bill params should be present
    if (req.body.merchant ||
        req.body.amount ||
        req.body.currency ||
        req.body.category ||
        req.body.date) {
    bill.update({
            billid: req.params.billid,
            merchant: req.body.merchant,
            amount: req.body.amount,
            currency: req.body.currency,
            category: req.body.category,
            date: req.body.date,
        })
        .then(response.message(res))
        .catch(response.error(res))
} else {
    response.paramMissing(res);
}
});

router.post('/delete/:id/:billid', jwtUtils.checkToken, (req, res) => {
    bill.delete(req.params.billid)
        .then(response.message(res))
        .catch(response.error(res));
})

module.exports = router;
