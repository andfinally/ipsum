<?php

/**
 * Class Texts
 * Writes the initial text into the page
 * And fetches the data rendered in the API
 */

class Texts {

	/*
	 * Master text list
	 * slug must have a-z and - only
	 * numberOfPages is number of JSON files we have for each text
	 */
	public $texts = [
		'diary-of-samuel-pepys' => [
			'slug'          => 'diary-of-samuel-pepys',
			'title'         => 'Diary of Samuel Pepys',
			'numberOfPages' => 894
		],
		'middlemarch'           => [
			'slug'          => 'middlemarch',
			'title'         => 'Middlemarch',
			'numberOfPages' => 280
		],
		'war-and-peace'         => [
			'slug'          => 'war-and-peace',
			'title'         => 'War and Peace',
			'numberOfPages' => 402
		],
	];
	public $text_data;          // Data about the currently selected text
	public $page_array;         // Array of the current page of text nodes
	private $cwd_prefix;         // Prefix to add to the path used in this include when included from a directory

	public function __construct( $add_path_prefix = false ) {
		if ( true === $add_path_prefix ) {
			$this->cwd_prefix = '../';
		}
	}

	/**
	 * If no $slug load a random page from a text
	 * If $slug is provided get a page from that text
	 *
	 * @param null $slug
	 */
	function get_page( $slug = null ) {
		if ( ! $slug ) {
			$this->slug = array_rand( $this->texts );
		} else {
			$this->slug = $slug;
		}
		$this->text_data = $this->texts[ $this->slug ];
		$page_index      = rand( 0, $this->text_data['numberOfPages'] - 1 );
		$path            = $this->cwd_prefix . 'texts/' . $this->slug . '/' . $page_index . '.json';
		$this->page_array = file_get_contents( $path );
		$this->page_array = json_decode( $this->page_array );
	}

	/**
	 * Write script tag with data for initial text in page
	 */
	function output_data() {
		echo '<script>' . "\n";
		echo "\t\t" . 'var ipsum = {};' . "\n";
		echo "\t\t" . 'ipsum.texts = ' . json_encode( $this->texts ) . ";\n";
		echo "\t\t" . 'ipsum.slug = ' . json_encode( $this->text_data['slug'] ) . ";\n";
		echo "\t\t" . 'ipsum.paras = ' . json_encode( count( $this->page_array ) ) . ";\n";
		echo "\t\t" . 'ipsum.page = ' . json_encode( $this->page_array ) . ";\n";
		echo "\t" . '</script>' . "\n";
	}

	/**
	 * Output paras wrapped in p tags
	 */
	function output_text() {
		foreach ( $this->page_array as $para ) {
			echo '<p>' . htmlspecialchars( $para, ENT_COMPAT, 'UTF-8' ) . '</p>';
		}
	}

	/**
	 * Output text buttons at top
	 */
	function text_buttons() {
		foreach ( $this->texts as $text ) {
			$selected = '';
			if ( $text['slug'] === $this->slug ) {
				$selected = ' selected';
			}
			echo '<button class="text-buttons__button button ' . htmlspecialchars( $text['slug'] . $selected, ENT_COMPAT, 'UTF-8' ) . '" value="' . htmlspecialchars( $text['slug'], ENT_COMPAT, 'UTF-8' ) . '">' . htmlspecialchars( $text['title'], ENT_COMPAT, 'UTF-8' ) . '</button>';
		}
	}

}
