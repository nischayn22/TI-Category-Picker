<?php
/**
 * API module to fetch a category tree with offset leaving the leaf categories
 * for use in the JS application
 *
 * @author Nischayn22
 */
class ApiCategoryTree extends ApiBase {

	public function execute() {
		$requestParams = $this->extractRequestParams();
		global $wgRequest;
		$this->members = array();
		$params = new DerivativeRequest(
				$wgRequest,
				array(
				  'action' => 'query',
				  'list' => 'categorymembers',
				  'cmtitle' => $requestParams['title'],
				  'cmnamespace' => 14,
				  'cmlimit' => 1000000
				)
		);
		$api = new ApiMain( $params, true ); // default is false
		$api->execute();
		$data = & $api->getResultData();
		foreach( $data['query']['categorymembers'] as $category ) {
			$category = $category['title'];
			$this->buildList( $category, '' );
		}
		$this->getResult()->setIndexedTagName( $this->members, 'category' );
		// Output the results
		$result = array( 'result' => 'success', 'categorymembers' => $this->members );
		$this->getResult()->addValue( null, $this->getModuleName(), $result );
	}

	public function buildList( $category, $offset ) {
		global $wgRequest;
		$params = new DerivativeRequest(
				$wgRequest,
				array(
				  'action' => 'query',
				  'list' => 'categorymembers',
				  'cmtitle' => $category,
				  'cmnamespace' => 14,
				  'cmlimit' => 100000
				)
		);
		$api = new ApiMain( $params, true ); // default is false
		$api->execute();
		$newdata = & $api->getResultData();
		if ( count( $newdata['query']['categorymembers'] ) >= 1 ) {
			$category = str_replace( 'Category:', '', $category);
			$this->members[] = array( 'offset' => $offset , 'title' => $category );
			foreach( $newdata['query']['categorymembers'] as $subCategory ) {
				$subCategory = $subCategory['title'];
				$this->buildList( $subCategory, $offset . '__' );
			}
		}
	}

	public function getAllowedParams() {
		return array(
			'title' => array(
				ApiBase::PARAM_TYPE => 'string',
			)
		);
	}

	public function getParamDescription() {
		return array(
			'title' => "Which category to enumerate (required). Must include Category: prefix.",
		);
	}

	public function getDescription() {
		return 'Fetch category tree without leaf categories.';
	}

	public function getExamples() {
		return array(
			'api.php?action=categorytree&title=Category:Hello',
		);
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}
}
