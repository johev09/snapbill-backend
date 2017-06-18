const common = {
    internalServerError: function (reject) {
        return internalServerError.bind(reject)
    }
}

function internalServerError(err) {
    this({
        status: 500,
        message: err.message
    })
}

module.exports = common;
