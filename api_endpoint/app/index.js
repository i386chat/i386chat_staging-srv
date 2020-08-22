'use strict';
// API Endpoint for Authentication

const express = require('express')
const fs = require('fs')
const jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');

// instantise db
const db = require('better-sqlite3')('chat.db');

const app = express()
const port = 3000

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

// Stuff for handling endpoints in the bootstrapper.

const path = require('path');
const os = require('os');

// MIDDLE WARE //

// Commands shall be loaded the same way as old Jolastu, but executed slightly differently.
const middlewareDir = fs.readdirSync('./app/middleware/').filter(file => file.endsWith('.js'));

const middleware = [];

for (const middlewareReq of middlewareDir) {
  middleware[middlewareReq.split('.').slice(0, -1).join('.')] = require("../app/middleware/" + middlewareReq);
}

// ENDPOINTS //

// Commands shall be loaded the same way as old Jolastu, but executed slightly differently.
const endpointsDir = fs.readdirSync('./app/endpoints/').filter(file => file.endsWith('.js'));

const endpoints = [];

for (const endpoints of endpointsDir) {
    var tmp = require("../app/endpoints/" + endpoints);
    if (tmp.method == "POST") {
      if (tmp.authRequired) {
        // Authentication required! Use a middleware function.
        app.post(tmp.dir, middleware["auth"], middleware["logging"], tmp.func)
      } else {
        // No authentication required.
        app.post(tmp.dir, middleware["logging"], tmp.func)
      }
    } else if (tmp.method == "GET") {
      if (tmp.authRequired) {
        // Authentication required! Use a middleware function.
        app.get(tmp.dir, middleware["auth"], middleware["logging"], tmp.func)
      } else {
        // No authentication required.
        app.get(tmp.dir, middleware["logging"], tmp.func)
      }
    }
}



app.get('/', (req,res) => {
  res.send("<h1>i386chat API Endpoint</h1><p>Running on server with hostname: " + os.hostname() + "</p>")
})

app.listen(port, () => {
  console.log(`i386chat API Endpoint running on http://localhost:${port}`)
})
