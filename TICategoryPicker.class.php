<?php

/**
 * The TICategoryPicker class.
 *
 * @ingroup SemanticFormsInputs
 * @author Nischay Nahata for Wikiworks for TI
 */
class TICategoryPicker extends SFFormInput {

	/**
	 * Constructor.
	 *
	 * @param String $input_number
	 *		The number of the input in the form.
	 * @param String $cur_value
	 *		The current value of the input field.
	 * @param String $input_name
	 *		The name of the input.
	 * @param String $disabled
	 *		Is this input disabled?
	 * @param Array $other_args
	 *		An associative array of other parameters that were present in the
	 *		input definition.
	 */
	public function __construct( $input_number, $cur_value, $input_name, $disabled, $other_args ) {

		parent::__construct( $input_number, $cur_value, $input_name, $disabled, $other_args );

		$this->addJsInitFunctionData( 'TICP', $input_number );
	}

	/**
	 * Returns the name of the input type this class handles.
	 *
	 * This is the name to be used in the field definition for the "input type"
	 * parameter.
	 *
	 * @return String The name of the input type this class handles.
	 */
	public static function getName() {
		return 'TI Category Picker';
	}

	/**
	 * Returns the names of the resource modules this input type uses.
	 * 
	 * Returns the names of the modules as an array or - if there is only one 
	 * module - as a string.
	 * 
	 * @return null|string|array
	 */
	public function getResourceModuleNames() {
		return array( 'ext.ticp' );
	}

	/**
	 * Returns the set of parameters for this form input.
	 * 
	 */
	public static function getParameters() {

		$params = parent::getParameters();
		$params['top category'] = array(
			'name' => 'top category',
			'type' => 'string',
			'description' => wfMsg( 'yet-to-be-created' )
		);
		return $params;
	}

	protected function traverseUp( $startCategory, $topCategory, &$categoryList ) {
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
			$this->traverseUp( $presentCategory,$topCategory, $categoryList );
		}
	}

	/**
	 * Returns the HTML code to be included in the output page for this input.
	 *
	 * Ideally this HTML code should provide a basic functionality even if the
	 * browser is not JavaScript capable. I.e. even without JavaScript the user
	 * should be able to input values.
	 *
	 */
	public function getHtmlText() {

		$topCategory = $this->mOtherArgs['top category'];
		$categoryList = array();
		if( $this->mCurrentValue !== '' ) {
			$this->traverseUp( $this->mCurrentValue, $topCategory, $categoryList );
			$categoryList = array_reverse( $categoryList );
			$categoryList[] = str_replace( ' ','_' ,$this->mCurrentValue );
		}

		$html = '
			<div class="ticp" top_cat="'. $topCategory .'" current_category_tree=' . FormatJson::encode( $categoryList ) . '>
				<input class="ticp-input" id="input_' . $this->mInputNumber . '" value="' . $this->mCurrentValue . '" name="' . htmlspecialchars( $this->mInputName ) . '" cols="4" rows="2" style= "display:none;"></input>
			</div> <div class="ticp-warning"  style="display:none;" ><b style="color:grey; display:block; padding:3px;" > No more categories </b></div>';

		return $html;
	}
}

