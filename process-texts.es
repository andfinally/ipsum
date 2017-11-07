const fs = require('fs');

/**
 * Breaks texts up into separate page files
 * of about 5,000 words each. We assume the texts
 * are cleaned up - titles, introductions, chapter headings, notes removed
 * and no line breaks except between paragraphs.
 */
class BreakUpText {

	constructor() {
		this.texts = ['diary-of-samuel-pepys', 'middlemarch', 'war-and-peace'];
		this.pageSize = 1250;
		for (let textName of this.texts) {
			this.getData(textName)
				.then(this.processData.bind(this))
				.then(this.writeToFile.bind(this))
				.catch(error => console.log(error));
		}
	}

	/**
	 * Retrieve raw text file
	 * @param textName
	 * @returns {Promise}
	 */
	getData(textName) {
		const filename = './texts-prepared/' + textName + '.txt';
		return new Promise((resolve, reject) => {
			fs.readFile(filename, 'utf8', (error, data) => {
				return error ? reject(error) : resolve({'textName': textName, 'data': data});
			});
		});
	}

	/**
	 * Break up text into pages of at least this.pageSize words
	 * @param data - content of a book file
	 */
	processData(obj) {
		let textName = obj.textName;
		let data = obj.data;
		return new Promise((resolve, reject) => {
				if (!data) {
					reject("Couldn't get any data");
				}
				let page = '';
				let pages = [];
				let jsonPage = [];
				let jsonPages = [];
				let wordsInPage = 0;
				// Remove double carriage returns
				data = data.replace(/\r\n\r\n|\n\n\n\n/g, '\n\n');
				// Replace linebreaks with placeholder character
				data = data.replace(/(\n\n|\r\n|\n)/g, '§');
				// Split into array of paras
				let paragraphs = data.split('§');
				for (let paragraph of paragraphs) {
					// Add number of words in this paragraph to the page total
					let paraArray = paragraph.split(' ');
					if (wordsInPage + paraArray.length <= this.pageSize) {
						// We've not reached the limit of our page yet
						if (wordsInPage === 0) {
							// First para on first page - don't prefix linebreak
							page = paragraph.trim();
							jsonPage = new Array(paragraph.trim());
							wordsInPage = paraArray.length;
							continue;
						}
						page += ('\n\n' + paragraph.trim());
						jsonPage.push(paragraph.trim());
						wordsInPage += paraArray.length;
					} else {
						// Start a new page
						pages.push(page);
						jsonPages.push(jsonPage);
						page = paragraph.trim();
						jsonPage = new Array(paragraph.trim());
						wordsInPage = paraArray.length;
					}
				}
				// Skip the final page, because it's too short. If we wanted to add it we would do pages.push(page);
				if (pages.length > 0) {
					resolve({'textName': textName, 'pages': pages, 'jsonPages': jsonPages});
				} else {
					reject('Nothing in pages array');
				}
			}
		);
	};

	/**
	 * Write each page of the broken-up text to a separate file in a folder corresponding
	 * to the text
	 * @param obj
	 * @returns {Promise}
	 */
	writeToFile(obj) {
		let textName = obj.textName;
		let pages = obj.pages;
		let jsonPages = obj.jsonPages;
		let dir = 'html/texts/' + textName;
		return new Promise((resolve, reject) => {
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}
			for (let pageNumber in jsonPages) {
				try {
					fs.writeFileSync(dir + '/' + pageNumber + '.json', JSON.stringify(jsonPages[pageNumber]), 'utf8', (error) => {
						if (error) {
							reject(error);
						}
					});
				} catch (e) {
					reject(error);
				}
			}
			resolve(pages);
		});
	}

}

new BreakUpText();
