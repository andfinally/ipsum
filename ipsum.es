/**
 * Handles ajax requests
 */
class XHR {

	constructor() {

	}

	get(url) {
		const xhr = new XMLHttpRequest();
		return new Promise((resolve, reject) => {
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						resolve(xhr.responseText);
					} else {
						reject(xhr.responseText);
					}
				}
			};
			xhr.open('GET', url);
			xhr.send();
		});
	}

}

/**
 * Manages the selection and display of a text
 */
class Ipsum {

	constructor() {
		this.bodyEl = document.querySelector('body');
		this.previewEl = document.getElementById('preview');
		this.xhr = new XHR();
		this.texts = window.ipsum.texts;
		this.slugs = Object.keys(this.texts);
		this.slug = window.ipsum.slug;
		this.tag = 'text';
		this.page = window.ipsum.page;
		this.textButtonsContainer = document.getElementById('text-buttons');
		this.initSlider();
		this.registerEventHanders();
	}

	initSlider() {
		this.input = $('#slider');
		this.input.ionRangeSlider({
			min      : 1,
			max      : window.ipsum.paras,
			from     : Math.round(window.ipsum.paras / 2),
			grid     : false,
			grid_snap: true,
			grid_num : window.ipsum.paras,
			keyboard : true,
			onChange : this.selectNodes.bind(this),
			onFinish : this.copySelected.bind(this),
		});
		this.slider = this.input.data('ionRangeSlider');
		document.getElementById('slider-container').classList.remove('invisible');
		this.selectNodes();
	}

	/**
	 * Add click handlers to buttons to reset the current text
	 */
	registerEventHanders() {
		this.textButtonsArr = this.textButtonsContainer.querySelectorAll('.button');
		for (let button of this.textButtonsArr) {
			button.addEventListener('click', (e) => {
				this.bodyEl.classList.remove(this.slug);
				// Set this.slug based on clicked button value
				if (!this.slugs.includes(e.target.value)) {
					this.slug = this.slugs[this.getRandomIndex(this.slugs.length)];
				} else {
					this.slug = e.target.value;
				}
				this.bodyEl.classList.add(this.slug);
				this.setTextButtonState();
				this.getTextFromSlug(this.slug);
			});
		}
		this.tagButtons = document.querySelectorAll('.tag-buttons__button');
		for (let button of this.tagButtons) {
			button.addEventListener('click', (e) => {
				this.bodyEl.classList.remove(this.tag);
				if (!['text', 'p', 'li'].includes(e.target.value)) {
					this.tag = 'text';
				} else {
					this.tag = e.target.value;
				}
				localStorage.setItem('tag', this.tag);
				this.bodyEl.classList.add(this.tag);
				this.setTagButtonState();
				this.displayText(false);
			});
		}
		const navMenu = document.getElementById('nav-menu');
		const navMenuLinks = navMenu.querySelectorAll('.nav-menu__link');
		for (let link of navMenuLinks) {
			link.addEventListener('click', (e) => {
				document.body.classList.add('show-' + e.target.getAttribute('data-target'));
			})
		}

		const closeButtons = document.querySelectorAll('.help-modal__close-button');
		for (let button of closeButtons) {
			button.addEventListener('click', (e) => {
				document.body.classList.remove('show-' + e.target.getAttribute('data-target'));
			});
		}

		const modalOverlay = document.getElementById('modal-overlay');
		modalOverlay.addEventListener('click', (e) => {
			document.body.classList.remove('show-help-about');
			document.body.classList.remove('show-help-how-to');
			document.body.classList.remove('show-help-api');
		})
	}

	/**
	 * Adjust the height of the preview element to fit within the viewport
	 * on screens that are at least 568 high
	 */
	adjustPreviewHeight() {
		// Don't adjust if viewport height is too small to show much
		if (window.innerHeight < 568) {
			return;
		}
		if (window.innerHeight >= 768) {
			return;
		}
		const previewRect = this.previewEl.getBoundingClientRect();
		let margin = 8;
		if (previewRect.bottom < window.innerHeight) {
			const difference = (window.innerHeight - margin) - previewRect.bottom;
			if (difference > 0) {
				let newHeight = previewRect.height + difference;
				this.previewEl.style.height = newHeight + 'px';
			}
		}
	}

	setTextButtonState() {
		for (let button of this.textButtonsArr) {
			button.classList.remove('selected');
			if (button.classList.contains(this.slug)) {
				button.classList.add('selected');
			}
		}
	}

	setTagButtonState() {
		for (let button of this.tagButtons) {
			button.classList.remove('selected');
			if (button.classList.contains(this.tag)) {
				button.classList.add('selected');
			}
		}
	}

	/**
	 * Given a slug, trigger fetch and display of a random page from the corresponding text
	 * @param slug
	 */
	getTextFromSlug(slug) {
		let textData = this.getTextData(slug);
		this.getText(textData);
	}

	/**
	 * Get the data object for a particular text from the texts array
	 * @param slug
	 * @returns {*}
	 */
	getTextData(slug) {
		return this.texts[slug];
	}

	/**
	 * Request a random page from the chosen text, trigger display when it's fetched
	 * @param textData
	 */
	getText(textData) {
		let page = this.getRandomIndex(textData.numberOfPages);
		this.xhr.get('texts/' + textData.slug + '/' + page).then(
			(value) => {
				this.page = value;
				this.displayText();
			}
		);
	}

	/**
	 * Get a random index for the given array length
	 * @returns {number}
	 */
	getRandomIndex(arrayLength) {
		return Math.floor(Math.random() * arrayLength);
	}

	/**
	 * Inject paragraphs for current page of text into previewEl
	 * @param updateSlider - use existing slider value for selection or update it for a new text
	 */
	displayText(updateSlider = true) {
		if (typeof this.page === 'object') {
			this.json = this.page;
		} else {
			this.json = JSON.parse(this.page);
		}
		if (updateSlider) {
			this.slider.update({
				from    : Math.round(this.json.length / 2),
				max     : this.json.length,
				grid_num: this.json.length
			});
		}
		let startTag, endTag;
		switch (this.tag) {
			case 'p':
				startTag = '<p>';
				endTag = '</p>';
				break;
			case 'li':
				startTag = '<li>';
				endTag = '</li>';
				break;
			default:
				startTag = '';
				endTag = '';
		}
		// Assemble the paragraphs
		let fragment = document.createDocumentFragment();
		for (let chunk of this.json) {
			// Skip empty chunks
			chunk = chunk.trim();
			if (chunk.length === 0) {
				continue;
			}
			let p = document.createElement('p');
			p.textContent = startTag + chunk + endTag;
			fragment.appendChild(p);
		}
		this.previewEl.innerHTML = '';
		this.previewEl.appendChild(fragment);
		this.selectNodes();
	}

	/**
	 * Select the number of nodes in previewEl equal to the slider value
	 */
	selectNodes() {
		let sliderValue = parseInt(this.input[0].value);
		let endNode = this.previewEl.childNodes[sliderValue - 1];
		this.selectTextRangeFromNodes(endNode);
	}

	/**
	 * Select the text in previewEl up to endNode
	 * @param endNode
	 */
	selectTextRangeFromNodes(endNode) {
		const startNode = this.previewEl.firstChild;
		if (!endNode) endNode = this.previewEl.lastChild;
		startNode.innerText = startNode.innerText.trim();
		endNode.innerText = endNode.innerText.trim();
		let range = document.createRange();
		range.setStart(startNode, 0);
		range.setEnd(endNode, endNode.childNodes.length);
		const sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	}

	/**
	 * Copy selected text
	 */
	copySelected() {
		try {
			var successful = document.execCommand('copy');
			if (successful) {
				this.bodyEl.classList.add('has-copied');
				setTimeout(() => {
					this.bodyEl.classList.remove('has-copied');
				}, 750);
			}
		} catch (err) {
			console.log('Couldn\'t copy');
		}
	}

}

new Ipsum();
