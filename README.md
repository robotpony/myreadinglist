# myreadinglist

A command line tool to grab Instapaper links and turn them into HTML or Markdown, to make it easier to post my reading list for anyone who wants it.

This utility currently reads CSV, but will eventually pull entries using the Instapaper API.

## Command

```
➜ ./insta2html.js --help
Usage: insta2html.js --file [name] --max [num] --since [unix time] --filter
[category]

Options:
	  --help     Show help                                             [boolean]
	  --version  Show version number                                   [boolean]
  -f, --file     Specify an import file  [default: "data/instapaper-export.csv"]
  -m, --max      Maximum number of lines                          [default: 100]
  -s, --since    Since time (UNIX)                                  [default: 0]
  -F, --filter   Filter out this folder (can be repeated)    [default: "unread"]
```