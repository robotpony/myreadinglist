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
		.option('cleanup', {
			alias: 'C',
			boolean: true,
			describe: 'Clean up titles and URLs',
			default: false
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
	cleanupTitlePattern: /\s+\|\s+.*?$/,
	cleanupURLPattern: /\?.*?$/,
	rowLen: 5,
	locale: 'en-CA'
}
var totalLinks = 0
var done = false
var lastestLink
var firstLink

// allow an array of filters (e.g., -F "1" -F "2") by treating
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

// Simple Link struct
link = {
	url: '',
	title: '',
	description: '',
	folder: '',
	id: '',
	date: '',
	time: '',
	totalLinks: 0,

	set: function(url, title, description, folder, id, date, time) {
		this.url = url
		this.title = title
		this.description = description
		this.folder = folder
		this.id = id
		this.date = date
		this.time = time
		this.totalLinks++
		// lack of error checking, input files
	},

	html: function() {
		let description = this.description.length > 0 ? `\n\t\t<p>${this.description}</p> ` : ''
		let niceTitle = this.title
		let url = this.url

		if (argv.cleanup) {
			niceTitle = niceTitle.replace(source.cleanupTitlePattern, '')
			url = url.replace(source.cleanupURLPattern, '')
		}

		return `\t<li class="${this.folder}" id="${this.id}" data-date="${this.date}">\n\t\t<a href="${url}">\n\t\t\t${niceTitle}\n\t\t</a>${description}\n\t</li>`
	},

	skip: function() {
		this.totalLinks--
	}
}

try {
	console.log()

	reader.eachLine(source.csvFile, function(line, isLast) {

		if (isLast || link.totalLinks >= source.maxEntries) {
			var from = new Date(firstLink * 1000).toLocaleDateString(source.locale)
			var to = new Date(lastestLink * 1000).toLocaleDateString(source.locale)

			console.log()
			console.log(`\t<!-- Links from: ${from} - ${to} (${link.totalLinks} matched / ${source.maxEntries} max) -->`)
			if (source.sinceDate) console.log(`\t<!-- Starting  : ${source.sinceDate} -->`)
			if (source.filter)    console.log(`\t<!-- Filter out: ${source.filter} -->`)
			if (argv.cleanup)     console.log(`\t<!-- Cleanup   : titles, URLs -->`)

			return false // done reading
		}

		csv(
			line, {
				comment: 'URL' // skips comment lines starting with URL
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

				if (isFiltered(link.folder, source.filter)) return link.skip()
				if (source.sinceDate && (link.id < (source.sinceDate + 1))) return link.skip()

				// generate simple HTML output

				console.log(link.html()) // dump to console to be pipe-able

				lastestLink = link.id
				if (!firstLink) firstLink = link.id
			})
		})
} catch (e) {
	// ignored
	console.log(e)
}

