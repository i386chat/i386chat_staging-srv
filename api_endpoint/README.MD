![i386 Chat Banner](https://github.com/i386chat/i386_chatclient/raw/master/final_banner.png)
  
API Endpoint for i386chat.

This API Endpoint handles:
  - JSON Web Token based authentication
  - Database for simpler user management
  - User Creation
  - User Deletion

The only data stored by the endpoint is:
- a unique user ID (based off the "i386chat" epoch plus a random number between 1 and the "i386chat" epoch)
- your nickname
- whether or not you are an admin
- whether or not you are banned

No other data is retained unless you are banned, otherwise your IP will be added to an array on the main server.
