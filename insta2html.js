#!/usr/bin/env node
var argv = require('yargs/yargs')(process.argv.slice(2))
	.usage('Usage: $0 --file [name] --max [num] --since [unix time] --filter [category]')
		.option('file', {
			alias: 'f',
			describe: 'Specify an import file',
			default: 'data/instapaper-export.csv'
  		})
		.option('max', {
			alias: 'm',
			describe: 'Maximum number of lines',
			default: 100
		})
		.option('since', {
			alias: 's',
			describe: 'Since time (UNIX)',
			default: 0
		})
		.option('filter', {
			alias: 'F',
			describe: 'Filter out this folder (can be repeated)',
			default: "unread"
		})
	.argv

const reader = require('line-reader')
var csv = require('csv-parse')

// the reading list source
var source = {
	csvFile: argv.file,
	maxEntries: argv.max,
	sinceDate: argv.since,
	filter: null,
	rowLen: 5,
	locale: 'en-CA'
}
var totalLinks = 0
var done = false
var lastestLink
var firstLink

// allow an array of filters
if (argv.filter) {
	if (!Array.isArray(argv.filter)) {
		source.filter = [argv.filter]
	} else {
		source.filter = argv.filter
	}
}

// check if a value is in [filters]
function isFiltered(value, filters) {
	if (!filters) return false
	let found = false
	filters.every(function(v) {
		found = (v.toLowerCase() == value.toLowerCase())
	})
	return found
}

try {

	reader.eachLine(source.csvFile, function(line, isLast /*, readMore */) {

		let link = {
			url: '',
			title: '',
			description: '',
			folder: '',
			id: '',
			date: '',
			time: '',

			set: function(url, title, description, folder, id, date, time) {
				this.url = url
				this.title = title
				this.description = description
				this.folder = folder
				this.id = id
				this.date = date
				this.time = time
			},

			html: function() {
				let description = this.description.length > 0 ? `\n\t\t<p>${this.description}</p> ` : ''

				return `\t<li class="${this.folder}" id="${this.id}" data-date="${this.date}">\n\t\t<a href="${this.url}">\n\t\t\t${this.title}\n\t\t</a>${description}\n\t</li>`
			}
		}

		if (isLast || totalLinks >= source.maxEntries) {
			var from = new Date(firstLink * 1000).toLocaleDateString(source.locale)
			var to = new Date(lastestLink * 1000).toLocaleDateString(source.locale)

			console.log()
			console.log(`\t<!-- Links from: ${from} - ${to} (${source.maxEntries} total) -->`)
			if (source.filter) console.log(`\t<!-- Filtered: ${source.filter} -->`)
			if (source.sinceDate) console.log(`\t<!-- Starting: ${source.sinceDate} -->`)
			return false
		}

		csv(
			line, {
				comment: 'URL'
			},
			function(err, row) {
				if (err || !row) return

				row = row[0] // row object is nested

				if (!row || row.length != source.rowLen) return // skip invalid/incomplete rows

				link.set(
					row[0], row[1], row[2], row[3].toLowerCase(), row[4],
					new Date(row[4] * 1000).toLocaleDateString(source.locale),
					new Date(row[4] * 1000).toLocaleTimeString(source.locale)
				)

				// filter

				if (isFiltered(link.folder, source.filter)) return // skip archived links
				if ((source.sinceDate && link.date) < (source.sinceDate + 1)) return // skip older

				// generate simple HTML output

				totalLinks ++
				console.log(link.html()) // dump to console to be pipe-able

				lastestLink = link.id
				if (!firstLink) firstLink = link.id
			})
		})
} catch (e) {
	// ignored
	console.log(e)
}

