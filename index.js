#!/usr/bin/env node

const chalk = require("chalk");
var instapaper = require('instapaper');

var feed = instapaper(CONSUMER_KEY, CONSUMER_SECRET);
feed.setUserCredentials(USERNAME, PASSWORD);

const greeting = chalk.white.bold("Hello!");

console.log(greeting);