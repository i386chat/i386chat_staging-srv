'use strict';

// Chat System.
// Funey, 2020.

const express = require('express')
const fs = require('fs')
const jwt = require('jsonwebtoken');

// instantise db
const db = require('better-sqlite3')('chat.db');

const app = express()
const port = 3000

const _SNOWFLAKE = 10615104001061510400; // Start of "Funey" epoch.

function createSnowflake() {
  return _SNOWFLAKE + Math.floor((Math.random() * _SNOWFLAKE) + 1);
}


var bodyParser = require('body-parser');
const e = require('express');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

function validateID(id) {
  const row = db.prepare('SELECT * FROM users WHERE userId = ?').get(id);

  if (row === undefined) {
    return false;
  }
  
  return row;
}

console.log(createSnowflake());

function createUser(req, res) {
  // We're creating a user.
  var possibleID = createSnowflake();

  // Check if our User Snowflake already exists. If so, recreate. Do this until we have a unique ID (PK-friendly).
  var bRunning = true;

  while (bRunning) {
    if (validateID(possibleID)) {
      // User ID exists. Recreate and reiterate.
      possibleID = createSnowflake();
    } else {
      // Not existing. Exit loop.
      bRunning = false;
    }
  }

  //console.log("got unique id")

  // Unique user ID. Create User.
  const insert = db.prepare('INSERT INTO users (userid, username, admin, banned) VALUES (@userId, @username, @admin, @banned)');

  try {
    insert.run({ userId: possibleID, username: req.body.username, admin: 0, banned: 0 });

    let privateKey = fs.readFileSync('./private.pem', 'utf8');
    let token = jwt.sign({ userId: possibleID }, privateKey, { algorithm: 'HS256'});
    //console.log(token)
    res.json({ userId: possibleID, username: req.body.username, token: token });
  } catch (e) {
    console.log(e)
    return false;
  }

}

function changeNickname(req, res) {
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
        var userCheck = validateID(user.userId);
        if (!userCheck) {
            // shut them out!
            
            res.status(500).json({ error: "Not Authorized" });
            throw new Error("Not Authorized");
        }

        // allow hitting of endpoint

        const upd = db.prepare('UPDATE users SET username = @username WHERE userid = @userid;');

        try {
          var t = upd.run({ userid: user.userId, username: req.headers.newnick});
          console.log("ran with success?")
          console.log(t)
          //let privateKey = fs.readFileSync('./private.pem', 'utf8');
          //let token = jwt.sign({ userId: possibleID }, privateKey, { algorithm: 'HS256'});
          //console.log(token)
          res.json({ status: "Success" });
        } catch (e) {
          console.log(e)
          return false;
        }
    });
  }
}

function isAuthenticated(req, res, next) {
    if (typeof req.headers.authorization !== "undefined") {
        // retrieve the authorization header and parse out the
        // JWT using the split function
        let token = req.headers.authorization.split(" ")[0];
        console.log(token);
        let privateKey = fs.readFileSync('./private.pem', 'utf8');
        // Here we validate that the JSON Web Token is valid and has been
        // created using the same private pass phrase
        jwt.verify(token, privateKey, { algorithm: "HS256" }, (err, user) => {
            console.log(err);
            // if there has been an error...
            if (err) {
                // shut them out!
                res.status(500).json({ error: "Not Authorized" });
                throw new Error("Not Authorized");
            }
            // if the JWT is valid, allow them to hit
            // the intended endpoint
            console.log(user)
            return next();
        });
    } else {
        // No authorization header exists on the incoming
        // request, return not authorized and throw a new error
        res.status(500).json({ error: "Not Authorized" });
        throw new Error("Not Authorized");
    }
}

function auth(req, res, next) {
  // Authenticate.
  if (typeof req.headers.authorization !== "undefined") {
    // Get JWT
    let token = req.headers.authorization.split(" ")[0];
    let privateKey = fs.readFileSync('./private.pem', 'utf8');
    // Here we validate that the JSON Web Token is valid and has been
    // created using the same private pass phrase
    jwt.verify(token, privateKey, { algorithm: "HS256" }, (err, user) => {
        console.log(err);
        // if there has been an error...
        if (err) {
            // shut them out!
            res.status(500).json({ error: "Not Authorized" });
            throw new Error("Not Authorized");
        }
        // do more auth
        var userCheck = validateID(user.userId);
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

function getInfo(req, res) {
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
        var userCheck = validateID(user.userId);
        if (!userCheck) {
            // shut them out!
            res.status(500).json({ error: "Not Authorized" });
            throw new Error("Not Authorized");
        }

        // allow hitting of endpoint
        res.json(userCheck)
    });
  }
}

app.get('/', (req, res) => {
   // Root of the API
   res.send('<html><head><title>Chat</title></head><body><h1>Chat Server</h1><br /><a href="signup">Create a login token</a><br /><a href="login">Login with existing token</a></body></html>');
});

app.post('/api/v1/auth/login', getInfo);

app.post('/api/v1/auth/create', createUser);

app.post('/api/v1/nickname/change', changeNickname);

app.get('/api/v1/auth/get', isAuthenticated, (req, res) => {
  res.json({ auth: "OK" })
});

app.get('/signup', (req, res) => {
  res.send(`
  <html>
  <head>
      <title>Sign Up</title>
  </head>
  <body>
      <form id="signup">
          <h1>Sign Up</h1>
          <p id="demo">All we need is a username, and nothing else.</p>
          <input type="text" id="username" name="username" value="Username"><br>
          <input type="submit" value="Submit">
        </form>
  </body>

  <script>
  document.querySelector("#signup").addEventListener("submit", function(e){
    e.preventDefault();
    var xhttp = new XMLHttpRequest();
  
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var jason = JSON.parse(this.responseText);
        document.getElementById("signup").innerHTML = "<h1>Account Created</h1><p>Your login token is:</p><p> " + jason.token + "</p></br><p><strong>DO NOT LOSE THIS TOKEN, OR YOU WILL LOSE YOUR ACCOUNT!<br>KEEP THIS TOKEN SAFE, AS ANYONE WITH THIS TOKEN CAN ACT AS YOU!</strong></p>";
      }
    };

    xhttp.open("POST", "/api/v1/auth/create", true);
    xhttp.setRequestHeader('Content-type', 'application/json')
    xhttp.send(JSON.stringify({ username: document.getElementById('username').value})) // Make sure to stringify   
  });

  </script>
</html>
  `)
});

app.get('/login', (req, res) => {
  res.send(`
  <html>
  <head>
      <title>Login</title>
  </head>
  <body>
      <form id="login">
          <h1>Login</h1>
          <p id="demo">Please insert your token.</p>
          <input type="text" id="token" name="token" value="token"><br>
          <input type="submit" value="Submit">
        </form>
  </body>

  <script>
  document.querySelector("#signup").addEventListener("submit", function(e){
    e.preventDefault();
    var xhttp = new XMLHttpRequest();
  
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var jason = JSON.parse(this.responseText);
        document.getElementById("signup").innerHTML = "<h1>Account Created</h1><p>Your login token is:</p><p> " + jason.token + "</p></br><p><strong>DO NOT LOSE THIS TOKEN, OR YOU WILL LOSE YOUR ACCOUNT!<br>KEEP THIS TOKEN SAFE, AS ANYONE WITH THIS TOKEN CAN ACT AS YOU!</strong></p>";
      }
    };

    xhttp.open("POST", "/api/v1/auth/login", true);
    xhttp.setRequestHeader('Content-type', 'application/json')
    xhttp.send(JSON.stringify({ username: document.getElementById('username').value })) // Make sure to stringify   
  });

  </script>
</html>
  `)
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
