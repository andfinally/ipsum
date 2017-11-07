# Ipsum

Parts of a lorem ipsum generator using classic texts.

September 2017

https://github.com/andfinally/ipsum

## Files

`process-texts.es` prepares texts for display, breaking them up into chunks of 1,250 words

`ipsum.es` handles requests for a chunk and clipboard copy action

## To process texts

To add a new text:

* Remove all chapter titles, prefaces and other non-textual elements.
* Replace all paragraph breaks with `\n\n`.
* Remove all multiple empty lines. 
* Remove all line breaks.
* Save the book as a text file in `/texts`.
* Update the `texts` array in `process-texts.es` to the slug for your new text. The slug corresponds to the filename of the text file, and should be a short snake case name.
* Run the processing script `node process-texts.es`.
* This splits the text up into JSON files of 2,500 words each, numbered from `0.json`, and saves them in the `texts-procssed` folder. This is the data folder for the site.
* Add an object for your new text to the `texts` array in `public/js/ipsum.es`.

## Development

* `gulp browserify` transpiles `ipsum.es`
* `gulp css` bundles and minifies the CSS files
* `gulp js` bundles and minifies the JS files
* To run local server `node server.js`
