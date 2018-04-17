<?php
require_once ('_LrnService.php');

class SiteSoapModel extends LrnServiceSoapModel {

	function SiteSoapModel() {
		$this->init();
	}

	public function getSiteConfigs() {
	    if(!empty($this->client)){
	        $response = $this->client->getSiteConfigs(array(
	        	'in0' => $this->siteId
	        ))->out;

	        // clean up the response for easier parsing
	        // DO NOT OMIT ANY DATA!!
	        $cleanResponse = array();
	        if(!empty($response->dataObject->anyType)){
		        foreach($response->dataObject->anyType as $c){
		            $cleanResponse[$c->configName] = $c->configValue;
		        }
	        }
	        return $cleanResponse;
	    }
	    else return false;
	}

	public function getSite() {
	    if(!empty($this->client)){
	        $response = $this->client->getSite(array(
	        	'in0' => $this->siteName
	        ))->out;
	        return $response->siteId;
	    }
	    else return false;
	}

	public function addOrUpdateSiteConfigs($siteConfigDTO) {
	    if(!empty($this->client)){
	        $response = $this->client->addOrUpdateSiteConfigs(array(
	        	'in0' => $this->siteId,
	        	'in1' => array($siteConfigDTO)
	        ))->out;
    		return $response->success;
	    }
	    else return false;
	}
        
	public function setSiteSettingsList($siteConfigDTO) {
//            print_r($siteConfigDTO);exit;
	    if(!empty($this->client)){
	        $response = $this->client->setSiteSettingsList(array(
	        	'in0' => array($siteConfigDTO)
	        ))->out;
    		return $response->success;
	    }
	    else return false;
	}
        
	public function getSiteBranding() {
	    if(!empty($this->client)){
    	    $response = $this->client->getSiteBranding(array(
    	    	'in0' => $this->siteId
    	    ))->out;
    		return $response->dataObject;
	    }
	    else return false;
	}

	public function getSiteLabels($langId) {
		if(!empty($this->client)) {
			$response = $this->client->getCustomLabelsByCompanyAndLanguage(array(
				'in0' => $this->siteId,
				'in1' => $langId
			))->out;
			return $response->dataObject;
		}
		else return false;
	}

    public function getSiteSettings($settingName) {
        if(!empty($this->client)){
	        $response = $this->client->getSiteSettings(array(
	        	'in0' =>$this->siteName,
	        	'in1' => $settingName
	        ))->out;
            return $response;
        }
	    else return false;
	}
	
	public function getRsaKeysBySiteId(){
		if(!empty($this->client)){
			$response = $this->client->getRsaKeysBySiteId(array(
					'in0' =>$this->siteId
			))->out;
			return $response;
		}
		else return false;
	}

	public function getCustomLabels($company, $lang) {
		if(!empty($this->client)) {
			$response = $this->client->getCustomLabelsByCompanyAndLanguage(array(
				'in0' => $this->siteName,
				'in1' => $lang
			))->out;

			if(isset($response->dataObject->userLabelList->UserLabelDTO)) {
				return $response->dataObject->userLabelList->UserLabelDTO;
			}
			else if(isset($response->dataObject->userLabelList)) {
				if(empty($response->dataObject->userLabelList)){
					return (array)null;
				}
				
				return (array)$response->dataObject->userLabelList;
			}
			else {
				return $response->dataObject;
			}
		}
		else return false;
	}

	public function getPartnerNameBySiteId() {
		if(!empty($this->client)){
			$response = $this->client->getPartnerNameBySiteId(array(
					'in0' => $this->siteId
			))->out;
			return $response->dataObject;
		}
		else return false;
	}
	
	public function getSitePassword() {
		if(!empty($this->client)){
			$response = $this->client->getSitePassword(array(
					'in0' => $this->siteName
			))->out;
			return $response->dataObject;
		}
		else return false;
	}

	public function getAvailableLanguagesBySiteId() {
		if(!empty($this->client))
		{
			$response = $this->client->getAvailableLanguagesBySiteId(array(
					'in0' => $this->siteId
			))->out;

			if (isset($response->dataObject->languagesList->LanguageDTO))
			{
				if(isset($response->dataObject->languagesList->LanguageDTO->code)){
					$responseArr = array($response->dataObject->languagesList->LanguageDTO);
					return $responseArr;
				}
				return (array) $response->dataObject->languagesList->LanguageDTO;
			}
		}

		return false;
	}

	public function getCourseCatalogList(){
		if(!empty($this->client)){
			$response = $this->client->getCourseCatalogList(array(
					'in0' => $this->siteId
			))->out;

			if (isset($response->dataObject->courseLookupDTOList->CourseLookupDTO)){
				$cleanResponse = array();

				//this is fault back solution when there is only one object passed from service
				if(!is_array($response->dataObject->courseLookupDTOList->CourseLookupDTO))
				{
				   return array(
				          $response->dataObject->courseLookupDTOList->CourseLookupDTO->moduleId=> array($response->dataObject->courseLookupDTOList->CourseLookupDTO)
				          );
				}

				foreach($response->dataObject->courseLookupDTOList->CourseLookupDTO as $dto){
					if(!isset($cleanResponse[$dto->moduleId]))
						$cleanResponse[$dto->moduleId] = array();

					$cleanResponse[$dto->moduleId][] = $dto;
				}
				return $cleanResponse;
			}
		}

		return false;
	}

	public function getAllCoursesBySiteId(){
		if(!empty($this->client)){
			$response = $this->client->getAllCoursesBySiteId(array(
					'in0' => $this->siteId
			))->out;
			if (isset($response->dataObject->courseLookupDTOList->CourseLookupDTO)){
				$cleanResponse = array();

				//this is fault back solution when there is only one object passed from service
				if(!is_array($response->dataObject->courseLookupDTOList->CourseLookupDTO))
				{
					return array(
							$response->dataObject->courseLookupDTOList->CourseLookupDTO->moduleId=> array($response->dataObject->courseLookupDTOList->CourseLookupDTO)
					);
				}

				foreach($response->dataObject->courseLookupDTOList->CourseLookupDTO as $dto){
					if(!isset($cleanResponse[$dto->moduleId]))
						$cleanResponse[$dto->moduleId] = array();

					$cleanResponse[$dto->moduleId][] = $dto;
				}
				return $cleanResponse;
			}
			}

			return false;
	}
	
	public function getRevisionNumber(){
	   if(!empty($this->client)){
	      $response = $this->client->getRevisionNumber()->out;
	      
	      if (isset($response->dataObject)){
	         return $response->dataObject;
	      }
	   }
	   
	   return false;
	}

	public function getSiteSettingsForSAML($siteName = NULL){
	   $cleanResponseArray = array();
	   
	   if(!empty($this->client)){
	      $response = $this->client->getSiteSettingsForSAML(array(
              'in0' => is_null($siteName) ? $this->siteName : $siteName
	      ))->out;
	      
	      if (isset($response->dataObject) && isset($response->dataObject->siteSettingsDTOList->SiteSettingsDTO)){
	         foreach ($response->dataObject->siteSettingsDTOList->SiteSettingsDTO as $config){
	            $cleanResponseArray[$config->settingName] = $config->settingValue;
	         }
	         
	         return $cleanResponseArray;
	      }
	   }
	   
	   return false;
	}
	
	public function getSAMLAuthnRequestXML($siteName = NULL){
	   if(!empty($this->client)){
	      $response = $this->client->getSAMLAuthnRequestXML(array(
	               'in0' => $this->siteId,
	               'in1' => is_null($siteName) ? $this->siteName : $siteName
	      ))->out;
	       
	      if (isset($response->dataObject)){
	         return $response->dataObject;
	      }
	   }
	   
	   return false;
	}

}
