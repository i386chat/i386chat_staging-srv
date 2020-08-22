'use strict';
// API for i386chat API endpoint.

const request = require('sync-request');

var API = [];

API.authenticate = function(token, api_srv) {
  try {
    var res = request('POST', api_srv || 'http://localhost:3000/api/v1/auth/login', {
        headers: {
          'authorization': token,
        },
    });

    return JSON.parse(res.getBody('utf8'));
  } catch (e) {
    return { error: "Not Authorised" };
    console.log("[API] User has been rejected by server.")
  }
}

API.create = function(username, api_srv) {
  try {
    var req_body = { username: username }

    var res = request('POST', api_srv || 'http://localhost:3000/api/v1/auth/create', {
        json: req_body,
    });

    return return JSON.parse(res.getBody('utf8'));
  } catch (e) {
    return { error: "Not Authorised" };
    console.log("[API] User has been rejected by server.")
  }
}


API.changeNickname = function(token, newNickname, api_srv) {
  try {
    var res = request('POST', api_srv || 'http://localhost:3000/api/v1/nickname/change', {
        headers: {
          'authorization': token,
          'newnick': newNickname
        },
    });

    return JSON.parse(res.getBody('utf8'));
  } catch (e) {
    return { error: "Not Authorised" };
    console.log("[API] User has been rejected by server.")
  }
}

API.getNickname = function(token, userId, api_srv) {
  try {
    var res = request('POST', api_srv || 'http://localhost:3000/api/v1/nickname/get', {
        headers: {
          'authorization': token,
          'userid': userId
        },
    });

    return JSON.parse(res.getBody('utf8'));
  } catch (e) {
    return { error: "Not Authorised" };
    console.log("[API] User has been rejected by server.")
  }
}

API.changeBio = function(token, newBio, api_srv) {
  try {
    var res = request('POST', api_srv || 'http://localhost:3000/api/v1/bio/change', {
        headers: {
          'authorization': token,
          'newbio': newBio
        },
    });

    return JSON.parse(res.getBody('utf8'));
  } catch (e) {
    return { error: "Not Authorised" };
    console.log("[API] User has been rejected by server.")
  }
}

API.getBio = function(token, userid, api_srv) {
  try {
    var res = request('POST', api_srv || 'http://localhost:3000/api/v1/bio/get', {
        headers: {
          'authorization': token,
          'userid': userid
        },
    });

    return JSON.parse(res.getBody('utf8'));
  } catch (e) {
    return { error: "Not Authorised" };
    console.log("[API] User has been rejected by server.")
  }
}


API.authenticate("test")
