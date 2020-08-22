'use strict';

// User Manangement Commands

const db = require('better-sqlite3')('chat.db');
const fs = require('fs')
const jwt = require('jsonwebtoken');


module.exports._SNOWFLAKE = 10615104001061510400; // Start of "Funey" epoch.

module.exports.createSnowflake = function() {
  return module.exports._SNOWFLAKE + Math.floor((Math.random() * module.exports._SNOWFLAKE) + 1);
}

module.exports.getUser = function(id) {
  const row = db.prepare('SELECT * FROM users WHERE userId = ?').get(id);

  if (row === undefined) {
    return false;
  }

  return row;
}

module.exports.createUser = function(username) {
  // We're creating a user.
  var possibleID = module.exports.createSnowflake();

  // Check if our User Snowflake already exists. If so, recreate. Do this until we have a unique ID (PK-friendly).
  var bRunning = true;

  while (bRunning) {
    if (module.exports.getUser(possibleID)) {
      // User ID exists. Recreate and reiterate.
      possibleID = module.exports.createSnowflake();
    } else {
      // Not existing. Exit loop.
      bRunning = false;
    }
  }

  //console.log("got unique id")

  // Unique user ID. Create User.
  const insert = db.prepare('INSERT INTO users (userid, username, admin, banned) VALUES (@userId, @username, @admin, @banned)');

  try {
    insert.run({ userId: possibleID, username: username, admin: 0, banned: 0 });

    let privateKey = fs.readFileSync('./private.pem', 'utf8');
    let token = jwt.sign({ userId: possibleID }, privateKey, { algorithm: 'HS256'});
    //console.log(token)
    return { userId: possibleID, username: username, token: token };
  } catch (e) {
    console.log(e)
    return false;
  }
}
