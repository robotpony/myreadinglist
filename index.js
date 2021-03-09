#!/usr/bin/env node

const chalk = require('chalk')
const reader = require('line-reader')
var csv = require('csv-parse')

const source = {
	csvFile: "data/instapaper-export.csv",
	maxEntries: 20,
	sinceDate: 1611763846,
	excludeFolders: [],
	onlyFolder: ''
}
var totalLinks = 0;
var done = false
var latestLinkDate;
var firstLinkDate;


try {

	reader.eachLine(source.csvFile, function(line) {
		csv(
			line,
			{}, 
			function(err, row) {
				if (row) {
					row = row[0] // row object is nested
					
					if (done) return
					if (!row || row.length != 5) return // skip invalid/incomplete rows
					
					if (totalLinks >= source.maxEntries) {
						done = true
						console.log()
						console.log(`Links from: ${firstLinkDate} - ${latestLinkDate}`)
						return
					}
					
					// grab link elements from row
					
					var url = row[0]
					var title = row[1]
					var description = row[2]
					var folder = row[3]
					var date = row[4]

					// filter
					
					if (url == 'URL') return // skip header line
					if (folder == 'Archive') return // skip archived links
					
					// generate simple HTML output

					totalLinks ++
		
					if (description.length > 0) description = ` <p>${description}</p> `
					var output = `<li data-link-number="${totalLinks}" data-link-date="${date}"><a href="${url}">${title}</a>${description}</li>`
					
					console.log(output) // dump to console to be pipe-able
					
					latestLinkDate = date		
					if (!firstLinkDate) firstLinkDate = date
				}
			})
	})
} catch (e) {
	// ignored
	console.log(e)
}



// var instapaper = require('instapaper');
// var key, secret, username, password;
// var feed = instapaper(key, secret);
// feed.setUserCredentials(username, password);
