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
$wgAutoloadClasses['TICategoryPicker'] = $ticpDir . 'TICategoryPicker.class.php';

$egTICPScriptPath = $wgExtensionAssetsPath === false ? $wgScriptPath . '/extensions/TI-Category-Picker' : $wgExtensionAssetsPath . '/TI-Category-Picker';

if ( defined( 'MW_SUPPORTS_RESOURCE_MODULES' ) ) {
	$moduleTemplate = array(
		'localBasePath' => dirname( __FILE__ ),
		'remoteBasePath' => $egTICPScriptPath
	);
	$wgResourceModules['ext.ticp'] = $moduleTemplate + array(
		'scripts' => array(
			'ticp.js'
		),
		'dependencies' => array(
				'ext.semanticforms.main'
		),
	);
}

$wgExtensionFunctions[] = "addSFHook";

function addSFHook() {
	global $sfgFormPrinter;
	$sfgFormPrinter->registerInputType( 'TICategoryPicker' );
};