'use strict';

const UserMgmt = require(__dirname + '/../../common/UserMgmt.js')

module.exports = {
  method: "POST",
  dir: "/v2/auth/create",
  authRequired: false,
  func: function(req, res) {
    var Output = UserMgmt.createUser(req.body.username);
    res.send(Output);
  }
}
