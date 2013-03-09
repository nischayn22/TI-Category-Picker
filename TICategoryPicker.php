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

if ( version_compare( $wgVersion, '1.16c', '<' ) ) {
	die( '<b>Error:</b> This version of TI Category Picker requires MediaWiki 1.16 or above.' );
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
		'for [http://www.wikiworks.com wikiworks]',
		'for [http://www.texasinstruments.com TI]'
	),
	'url' => 'https://www.mediawiki.org/wiki/Extension:TI_Category_Picker',
	'descriptionmsg' => 'ticp-desc'
);

$ticpDir 		= dirname( __FILE__ ) . '/';

$wgExtensionMessagesFiles['TI Category Picker'] = $ticpDir . 'TICategoryPicker.i18n.php';

$egTICPScriptPath = $wgExtensionAssetsPath === false ? $wgScriptPath . '/extensions/TICategoryPicker' : $wgExtensionAssetsPath . '/TICategoryPicker';

$moduleTemplate = array(
	'localBasePath' => dirname( __FILE__ ),
	'remoteBasePath' => $egTICPScriptPath
);

$wgResourceModules['ext.ticp'] = $moduleTemplate + array(
	'scripts' => array(
		'ticp.js'
	)
);

$wgExtensionFunctions[] = "addSFHook";

function addSFHook() {
	global $sfgFormPrinter;
	$sfgFormPrinter->setInputTypeHook( 'TI Category Picker', 'ticp', array()  );
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
	global $wgOut, $egTICPScriptPath;

	if ( class_exists( 'ResourceLoader' ) ) {
		$wgOut->addModules( 'ext.ticp' );
	} else {
		$wgOut->addScriptFile( "$egTICPScriptPath/ticp.js" );
	}

	$topCategory = $field_args['top category'];
	$categoryList = array();
	if( $cur_value !== '' ) {
		traverseUp( $cur_value, $topCategory, $categoryList );
		$categoryList = array_reverse( $categoryList );
		$categoryList[] = str_replace( ' ','_' ,$cur_value );
	}

	$html = '
		<div class="ticp" top_cat="'. $topCategory .'" current_category_tree=' . FormatJson::encode( $categoryList ) . '>
			<input class="ticp-input" value="' . $cur_value . '" name="' . htmlspecialchars( $input_name ) . '" cols="4" rows="2" style= "display:none;"></input>
		</div> <div class="ticp-warning"  style="display:none;" ><b style="color:grey; display:block; padding:3px;" > No more categories </b></div>';

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
	$pageData = array_shift( $data['query']['pages'] );

	if( !array_key_exists( 'categories', $pageData ) ) {
		return;
	}

	$presentCategory = $pageData['categories'][0]['title'];
	$presentCategory = str_replace( 'Category:', '', $presentCategory );
	if( $presentCategory !== $topCategory ) {
		$categoryList[] = str_replace( ' ', '_',$presentCategory );
		traverseUp( $presentCategory,$topCategory, $categoryList );
	}
}