'use strict';

module.exports = {
  method: "GET",
  dir: "/test",
  authRequired: true,
  func: function(req, res) {
    res.send("Gaming")
  }
}
