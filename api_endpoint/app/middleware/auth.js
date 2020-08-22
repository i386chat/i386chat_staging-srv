'use strict';

const db = require('better-sqlite3')('chat.db');
const fs = require('fs')
const jwt = require('jsonwebtoken');

const UserMgmt = require(__dirname + '/../../common/UserMgmt.js')

module.exports = function(req, res, next) {
  // Authenticate.
  if (typeof req.headers.authorization !== "undefined") {
    // Get JWT
    let token = req.headers.authorization.split(" ")[0];
    let privateKey = fs.readFileSync('./private.pem', 'utf8');
    // Here we validate that the JSON Web Token is valid and has been
    // created using the same private pass phrase
    jwt.verify(token, privateKey, { algorithm: "HS256" }, (err, user) => {
        //console.log(err);
        // if there has been an error...
        if (err) {
            // shut them out!
            res.status(500).json({ error: "Not Authorized" });
            throw new Error("Not Authorized");
        }
        // do more auth
        var userCheck = UserMgmt.getUser(user.userId);

        if (!userCheck) {
            // shut them out!
            res.status(500).json({ error: "Not Authorized" });
            throw new Error("Not Authorized");
        }

        // allow hitting of endpoint
        return next()
    });
  }
}
