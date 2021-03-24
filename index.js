#!/usr/bin/env node
var argv = require('yargs/yargs')(process.argv.slice(2))
	.usage('Usage: $0 command --file [name] --max [num] --since [unix time] --filter [category]')
	.command('htmlize', 'Convert links to simple HTML')
	.default('file', 'data/instapaper-export.csv')
	.default('max', 150)
	.default('since', 0)
	.default('filter', 'unread')
	.alias('f', 'file')
	.alias('m', 'max')
	.alias('F', 'filter')
	.demandCommand(1)
	.argv;

const reader = require('line-reader')
var csv = require('csv-parse')

// the reading list source
var source = {
	csvFile: argv.file,
	maxEntries: argv.max,
	sinceDate: argv.since,
	filter: null,
	rowLen: 5
}
var totalLinks = 0;
var done = false
var latestLinkDate;
var firstLinkDate;

// allow an array of filters
if (argv.filter) {
	if (!Array.isArray(argv.filter)) {
		source.filter = [argv.filter]
	} else {
		source.filter = argv.filter
	}
}

function isFiltered(value, filters) {
	if (!filters) return false
	let found = false
	filters.every(function(v) {
		found = (v.toLowerCase() == value.toLowerCase())
	})
	return found
}


try {

	reader.eachLine(source.csvFile, function(line) {
		csv(
			line,
			{},
			function(err, row) {
				if (row) {
					row = row[0] // row object is nested

					if (done) return
					if (!row || row.length != source.rowLen) return // skip invalid/incomplete rows

					if (totalLinks >= source.maxEntries) {
						done = true
						console.log()
						console.log(`<!-- Links from: ${firstLinkDate} - ${latestLinkDate} (${source.maxEntries} total) -->`)
						if (source.filter) console.log(`<!-- Filter: ${source.filter} -->`)
						return
					}

					// grab link elements from row

					var url = row[0]
					var title = row[1]
					var description = row[2]
					var folder = row[3]
					var date = row[4]

					folder = folder.toLowerCase()

					// filter

					if (url == 'URL') return // skip header line
					if (isFiltered(folder, source.filter)) return // skip archived links

					// generate simple HTML output

					totalLinks ++

					if (description.length > 0) description = `\n\t<p>${description}</p> `
					var output = `<li class="${folder}">\n\t<a href="${url}">${title}</a>${description}\n</li>`

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
