const auth = require('basic-auth');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

router.post('/authenticate', (req, res) => {

    const credentials = auth(req);

    if (!credentials) {

        res.status(400).json({
            message: 'Invalid Request !'
        });

    } else {

        login.loginUser(credentials.name, credentials.pass)

            .then(result => {

                const token = jwt.sign(result, config.secret, {
                    expiresIn: 1440
                });

                res.status(result.status).json({
                    message: result.message,
                    token: token
                });

            })

            .catch(err => res.status(err.status).json({
                message: err.message
            }));
    }
});

module.exports = router;
