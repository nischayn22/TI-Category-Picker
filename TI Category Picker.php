<?php

/**
 * Initialization file for the TI Category Picker extension.
 *
 * On MediaWiki.org: 		http://www.mediawiki.org/wiki/Extension:TI Category Picker
 * Official documentation: 	http://mapping.referata.com/wiki/TI Category Picker
 * Examples/demo's: 		http://mapping.referata.com/wiki/TI Category Picker_examples
 *
 * @licence GNU GPL v2+
 * @author Nischayn22 < nischayn22@gmail.com > for WikiWorks.com for TexasInstruments
 */

if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'Not an entry point.' );
}

if ( version_compare( $wgVersion, '1.18c', '<' ) ) {
	die( '<b>Error:</b> This version of TI Category Picker requires MediaWiki 1.18 or above; use TI Category Picker 1.0.x for MediaWiki 1.17 and TI Category Picker 0.7.x for older versions.' );
}

// Show a warning if Semantic MediaWiki is not loaded.
if ( ! defined( 'SMW_VERSION' ) ) {
	die( '<b>Error:</b> You need to have <a href="https://semantic-mediawiki.org/wiki/Semantic_MediaWiki">Semantic MediaWiki</a> installed in order to use <a href="http://www.mediawiki.org/wiki/Extension:TI Category Picker">TI Category Picker</a>.<br />' );
}

// Version check for SMW, which needs to be at 1.8 or greater.
if ( version_compare( SMW_VERSION, '1.8c', '<' ) ) {
	die(
		'<b>Error:</b> This version of TI Category Picker needs <a href="https://semantic-mediawiki.org/wiki/Semantic_MediaWiki">Semantic MediaWiki</a> 1.8 or later.
		You are currently using version ' . SMW_VERSION . '.
	 	If for any reason you are stuck at SMW 1.7.x or 1.6.x, you can use TI Category Picker 1.0.x instead.<br />'
	);
}

if ( !defined( 'SF_VERSION' ) ) {
	die( '<b>Error:</b> You need to have Semantic Forms installed in order to use <a href="http://www.mediawiki.org/wiki/Extension:TI Category Picker">TI Category Picker</a>.<br />' );
}

$wgExtensionCredits['ticp'][] = array(
	'path' => __FILE__,
	'name' => 'TI Category Picker',
	'version' => 'beta',
	'author' => array(
		'[http://www.mediawiki.org/wiki/User:Nischayn22 Nischay Nahata]',
		'[http://www.wikiworks.com for wikiworks]',
		'[http://www.texasinstruments.com for TI]'
	),
	'url' => 'https://www.mediawiki.org/wiki/Extension:TI_Category_Picker',
	'descriptionmsg' => 'TI-Category-Picker-desc'
);

$ticpDir 		= __DIR__ . '/';

$wgExtensionMessagesFiles['TI Category Picker'] = $ticpDir . 'TI Category Picker.i18n.php';

$egTICPScriptPath = $wgExtensionAssetsPath === false ? $wgScriptPath . '/extensions/TI Category Picker' : $wgExtensionAssetsPath . '/TI Category Picker';

$moduleTemplate = array(
	'localBasePath' => dirname( __FILE__ ),
	'remoteBasePath' => $egTICPScriptPath
);

$wgResourceModules['ext.ticp'] = $moduleTemplate + array(
	'scripts' => array(
		'ticp.js'
	)
);

$wgExtensionFunctions[] = function () {
	global $sfgFormPrinter;
	$sfgFormPrinter->setInputTypeHook( 'TI_Category_Picker', 'ticp', array()  );
};

/**
 *
 * @param string $
 * @param string $input_name
 * @param boolean $is_mandatory
 * @param boolean $is_disabled
 * @param array $field_args
 * 
 * @return array
 */
function ticp( $cur_value, $input_name, $is_mandatory, $is_disabled, array $field_args ) {
	global $wgOut;

	$wgOut->addModules( 'ext.ticp' );

	$topCategory = $field_args['top_category'];
	$categoryList = array();
	if( $cur_value !== '' ) {
		traverseUp( $cur_value, $topCategory, $categoryList );
		$categoryList = array_reverse( $categoryList );
		$categoryList[] = str_replace( ' ','_' ,$cur_value );
	}

	$html = '
		<div class="ticp" top_cat="'. $topCategory .'" current_category_tree=' . FormatJson::encode( $categoryList ) . '>
			<input class="ticp-input" value="' . $cur_value . '" name="' . htmlspecialchars( $input_name ) . '" cols="4" rows="2" style= "display:none;"></input>
		</div>';

	return $html;
}

function traverseUp( $startCategory, $topCategory, &$categoryList ) {
	global $wgRequest;
	$api = new ApiMain(
			new DerivativeRequest(
				$wgRequest,
				array(
					'action' => 'query',
					'prop' => 'categories',
					'titles' => 'Category:' . $startCategory,
					'limit' => 1
				),
				false // was posted?
			),
			false // enable write?
		);

	$api->execute();
	$data = $api->getResultData();
	$presentCategory = array_shift( $data['query']['pages'] )['categories'][0]['title'];
	$presentCategory = str_replace( 'Category:', '', $presentCategory );
	if( $presentCategory !== $topCategory ) {
		$categoryList[] = str_replace( ' ', '_',$presentCategory );
		traverseUp( $presentCategory,$topCategory, $categoryList );
	}
}