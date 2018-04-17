<?php
require_once ('_SamlService.php');

class SamlServiceSoapModel extends SamlServiceServerSoapModel {

	function SamlServiceSoapModel() {
		$this->init();
	}

	public function genResponse( $userName, $siteId  ) {
		if(!empty($this->client)){
			//signingRequired and encryptionRequired are set to 1 so that encryption is implemented
			$response = $this->client->genResponse(array(
					'in0' => $userName,
					'in1' => $siteId,
					'in2' => 1,
					'in3' => 1
			))->out;
			return $response->dataObject;
		}
		else return false;
	}

	public function consumeSaml($metadataUrl, $samlResponse,$privateKey, $passPhrase,$encrypted) {
		if(!empty($this->client)){
			$response = $this->client->consumeSaml(array(
					'in0' =>(string)$metadataUrl,
					'in1' => (string)$samlResponse,
					'in2' => $privateKey,
					'in3' => $passPhrase,
					'in4' => $encrypted
			))->out;
                
			return $response;
		}
		else return false;
	}
	public function consumeSamlWithValidation($metadataUrl, $samlResponse,$privateKey, $passPhrase,$encrypted) {
		if(!empty($this->client)){
			$response = $this->client->consumeSamlWithValidation(array(
					'in0' =>(string)$metadataUrl,
					'in1' => (string)$samlResponse,
					'in2' => $privateKey,
					'in3' => $passPhrase,
					'in4' => $encrypted,
					'in5' => $this->siteName,
					'in6' => isset($this->sess->samlAssertionId) ? $this->sess->samlAssertionId : NULL
			))->out;
                
			return $response;
		}
		else return false;
	}
}
