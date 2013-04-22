<?php
/**
 * API module to fetch categories that are child and leaf
 * for use in the JS application
 *
 * @author Nischayn22
 */
class ApiChildAndLeafCategory extends ApiBase {

	public function execute() {
		$requestParams = $this->extractRequestParams();
		global $wgRequest;
		$members = array();
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
			$params = new DerivativeRequest(
					$wgRequest,
					array(
					  'action' => 'query',
					  'list' => 'categorymembers',
					  'cmtitle' => $category,
					  'cmnamespace' => 14,
					  'cmlimit' => 10
					)
			);
			$api = new ApiMain( $params, true ); // default is false
			$api->execute();
			$newdata = & $api->getResultData();

			if ( count( $newdata['query']['categorymembers'] ) < 1 ) {
				$category = str_replace( 'Category:', '', $category);
				$members[] = $category;
			}
		}
		$this->getResult()->setIndexedTagName( $members, 'category' );
		// Output the results
		$result = array( 'result' => 'success', 'categorymembers' => $members );
		$this->getResult()->addValue( null, $this->getModuleName(), $result );
	}

	public function getAllowedParams() {
		return array(
			'title' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			)
		);
	}

	public function getParamDescription() {
		return array(
			'title' => "Which category to enumerate (required). Must include Category: prefix.",
		);
	}

	public function getDescription() {
		return 'Fetch child and leaf categories.';
	}

	public function getExamples() {
		return array(
			'api.php?action=childandleafcategory&title=Category:Hello',
		);
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}
}
