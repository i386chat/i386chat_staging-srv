'use strict';

module.exports = function(req,res,next) {
    console.log("[ENDPOINT] User " + req.method + " " + req.route.path + " HTTP 1.0");
    next();
}
