#!/usr/bin/env node

const chalk = require("chalk");
var instapaper = require('instapaper');

var key, secret, username, password;

var feed = instapaper(key, secret);
feed.setUserCredentials(username, password);
