<?
include_once('_CatalystService.php');

/**
 * --- MODULE REVIEW SOAP MODEL ---
 * Extends Catalyst Service to get and set module ratings and reviews
 * for a particular module, on a particular site.
 * @author seema.akre
 *
 */
class ReviewAndRatingSoapModel extends CatalystServiceSoapModel {

    /**
     * --- INITALIZE ---
     * Initializes the Catalyst Service model... fairly self explanitory.
     */
    public function ReviewAndRatingSoapModel(){
        $this->init();
    }
    
    /**
     * --- GET MODULE REVIEWS ---
     * Requests the list of reviews (incl. comments)
     * for a particular module, on a particular site.
     * Returns false if no client
     * @param string $systemId
     */
    public function getModuleReviewsAndRatings($systemId){
        if(!empty($this->client)){
            $response = $this->client->getReviewAndRatingBySystemIdSiteId(array(
                'in0'=> $systemId,
                'in1'=> $this->sess->siteId
            ))->out;
            
            // we always want to return an array here.
            // if not already an arary convert to an array
            $cleanResponse = array();
            if(!empty($response->dataObject->reviewAndRatingDTOList)){
                $dto = $response->dataObject->reviewAndRatingDTOList->ReviewAndRatingDTO;
                $cleanResponse = !is_array($dto) ? array($dto) : $dto;
            }
            return $cleanResponse;
        }
        else return false;
    }
    
    /**
     * --- GET MODULE AVERAGE RATINGS
     * gets average rating of a module for a particular site
     * @param string $systemId
     */
    public function getModuleAverageRatings($systemId){
        if(!empty($this->client)){
            $response = $this->client->getAverageRatingBySystemIdSiteId(array(
                'in0' => $systemId,
                'in1' => $this->sess->siteId
            ))->out;
            
            // clean it up (move our important data up the heirarchy)
            $cleanResponse = array();
            if(!empty($response->dataObject->averageRatingDTOList)){
                $cleanResponse = (object) array(
                    'averageRatingDTOList' => is_array($response->dataObject->averageRatingDTOList->AverageRatingDTO) ? $response->dataObject->averageRatingDTOList->AverageRatingDTO : array($response->dataObject->averageRatingDTOList->AverageRatingDTO),
                    'totalRatings' => $response->dataObject->totalRatings
                );
            }
            // else return empty stuff
            else {
                $cleanResponse = (object) array(
                    'averageRatingDTOList' => array(),
                    'totalRatings' => 0
                );
            }
            
            return $cleanResponse;
        }
        else return false;
    }
    
    /**
     * --- GET LIST OF MODULE AVERAGE RATINGS
     * gets average rating of a list of modules for a particular site
     * @param string $systemIdArr
     */
    public function getListOfModuleAverageRatings($systemIdArr) {
    	if(!empty($this->client)){
    		$response = $this->client->getAverageRatingBySystemIdListSiteId(array(
				'in0' => $systemIdArr,
				'in1' => $this->sess->siteId
    		))->out;
    		
    		$cleanResponse = array();
    		if(!empty($response->dataObject->averageRatingDTOSystemDTO)){
    			$cleanResponse = $response->dataObject->averageRatingDTOSystemDTO->AverageRatingDTOSystemDTO;
    		}
    		return $cleanResponse;
    	}
    	else return false;
    }
    
    /**
     * --- GET USER MODULE REVIEW
     * Gets the module and rating values for a single review
     * from a particular user, on a particular site. as userid
     * is unique, you dont need to specify siteId.
     * Returns false if no client
     * @param string $userId
     * @param string $systemId
     */
    public function getUserReviewAndRating($systemId){
        if(!empty($this->client)){
            $response = $this->client->getReviewAndRatingByUserIdSystemId(array(
                'in0' => $this->sess->user->userId,
                'in1' => $systemId
            ))->out;
            
            // clean it up (move our important data up the heirarchy)
            $cleanResponse = $response;
            if(!empty($response->dataObject->reviewDTO)){
                 $cleanResponse = (object) array(
                    'rating' => (!empty($response->dataObject->ratingDTOList)) ? $response->dataObject->ratingDTOList->RatingDTO : null,
                    'review' => $response->dataObject->reviewDTO
                );
            }
            
            return $cleanResponse;
        }
        else return false;
    }
    
    /**
     * --- SAVE USER MODULE REVIEW ---
     * Passes the user review to the services for creating/updating.
     * Returns false if no client
     * @param String $systemId
     * @param String $userId
     * @param String $review
     * @param Long $commentThreadId (for now we will be sending null till we figure out what to send)
     */
    public function saveUserReview($systemId, $userId, $review, $commentThreadId){
        if(!empty($this->client)){
            $response = $this->client->saveReview(array(
                'in0' => $systemId,
                'in1' => $userId,
                'in2' => $review,
                'in3' => $commentThreadId,
                'in4' => $this->sess->siteId
            ))->out;
            return $response;
        }
        else return false;
    }
    
    /**
     * --- SAVE USER RATINGS ---
     * Passes the user ratings object to services for adding/ updating ratings
     * Returns false if no client
     * @param String $systemId
     * @param String $userId
     * @param Long $siteId
     * @param Object $ratingDTOList
     */
    public function saveUserRatings($reviewId, $ratings){
        if(!empty($this->client)){
            $response = $this->client->saveRatings(array(
                'in0' => $reviewId,
                'in1' => $ratings
            ))->out;
            return $response;
        }
        else return false;
    }
    
    /**
     * --- SAVE USER REVIEW AND RATINGS ---
     * saves reviews and ratings together
     * still needs to do some work from services
     * (this function is incomplete)
     */
    public function saveUserReviewAndRatings($systemId, $review, $ratings) {
        if(!empty($this->client)){
            $response = $this->client->saveReviewAndRatings(array(
                'in0' => $this->sess->siteId,
                'in1' => $systemId,
                'in2' => $this->sess->user->userId,
                'in3' => $review,
                'in4' => null,
                'in5' => $ratings
            ))->out;
            return $response;
        }
        else return false;
    }
    
	/**
     * --- DELETE USER MODULE REVIEW ---
     * Passes information to service to remove a review and
     * it's related ratings from the module.
     * Returns false if no client
     * @param string $systemId
     * @param int $userId
     */
    public function deleteUserReviewAndRating($systemId){
        if(!empty($this->client)){
            $response = $this->client->deleteReviewAndRatingByUserIdSystemId(array(
                'in0' => $this->sess->user->userId,
                'in1' => $systemId
            ))->out;
            return $response;
        }
        else return false;
    }
    
    /**
     * --- GET SITE RATING TYPES
     * get the rating type available for a site
     */
    public function getSiteRatingTypes() {
        if(!empty($this->client)){
            $response = $this->client->getSiteRatingTypes(array(
                'in0' => $this->sess->siteId
            ))->out;
            
            // return a cleaned response, otherwise return the whole thing
            // so we can pull out errors and what not.
            $cleanResponse = $response;
            if($response->success){
                if(!empty($response->dataObject->siteRatingTypeDTOList->SiteRatingTypeDTO)){
                    $cleanResponse = $response->dataObject->siteRatingTypeDTOList->SiteRatingTypeDTO;
                }
                else $cleanResponse = null;
            }
            return $cleanResponse;
        }
        else return false;
    }
   
    /**
     * --- GET RESPONSE TYPES ---
     * get the response type available
     */
    public function getResponseTypes() {
        if(!empty($this->client)){
            $response = $this->client->getResponseTypes()->out;
            return $response;
        }
        else return false;
    }
    
	/**
     * --- GET SWITCH NAMES ---
     * get the switch names of the switches available on admin page
     */
    public function getSwitchNames() {
        if(!empty($this->client)){
            $response = $this->client->getSwitchNames()->out;
            return $response;
        }
        else return false;
    }
}
