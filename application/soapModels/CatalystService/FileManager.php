<?
include_once('_CatalystService.php');

/**
 * --- FILE MANAGER SOAP MODEL ---
 * For the storage and retrieval of files
 */
class FileManagerSoapModel extends CatalystServiceSoapModel {

 	/**
     * --- INITALIZE ---
     * Initializes the Catalyst Service model... fairly self explanitory.
     */
    public function FileManagerSoapModel(){
        $this->init();
    }

    /**
     * --- GET ALL FILE TYPES ---
     * Gets a list of all the file types (from type table).
     */
    public function getAllFileTypes(){
        if($this->client){
			$response = $this->client->getAllFileTypes()->out;
			return response;
		}
		return false;
    }

    /**
     * --- SAVE CUSTOM FILE ---
     * Takes a list of files and saves them to the database.
     * Returns a response of the file as it exists in the db.
     */
    public function saveCustomFile($fileList){
        if($this->client){
	        $response = $this->client->saveCustomFile(array(
	            'in0'=> $fileList
	        ))->out;
	        return $response;
	    }
	    return false;
    }

    /**
     * --- GET CUSTOM FILES ---
     * Gets a list of the files from the db.
     */
    public function getCustomFiles($type){
        if($this->client){
            $response = $this->client->getCustomFiles(array(
                'in0' => $this->sess->siteId,
                'in1' => $type
            ))->out;

            // strip out the wrapper objects, return the meat
            $cleanResponse = null;
            if(isset($response->dataObject->customFilesDTO->CustomFileDTO)){
                $cleanResponse = $response->dataObject->customFilesDTO->CustomFileDTO;
                // make sure we are ALWAYS sending back an array.
                if(!is_array($cleanResponse)) $cleanResponse = array($cleanResponse);
            }
            return $cleanResponse;
        }
        return false;
    }

    /**
     * --- DELETE CUSTOM FILE ---
     * Takes a list of files and deletes them from the database.
     */
    public function deleteCustomFiles($fileList){
        if($this->client){
	        $response = $this->client->deleteCustomFiles(array(
	            'in0'=> $fileList
	        ))->out;
	        return $response;
	    }
	    return false;
    }

     /**
	 * return custom tag info as an array
	 * each element of the array contains in turn three elements 
	 * 1. customFile - this element is another array where each element is one column name/column value of CUSTOM_FILE table
	 * 2. custom tag id
	 * 3. custom tag
	 */
    public function getCustomFileTagsBySiteId() {
        if($this->client) {
	        $response = $this->client->getCustomFileTagsBySiteId(array(
	            'in0'=> $this->sess->siteId
	        ))->out;
	        return $response;
	    }
	    return false;
    }

    /**
     * --- Get Custom File Tags By Site ---
     */
    public function getCustomFilesWithCustomTagsBySiteid($type) {
        if($this->client) {
	        $response = $this->client->getCustomFilesWithCustomTagsBySiteId(array(
	            'in0'=> $this->sess->siteId,
	            'in1' => $type
	        ))->out;
	        
	        $cleanResponse = false;
	        if(isset($response->dataObject->customFilesDTO->CustomFileDTO)){
	           $cleanResponse = $response->dataObject->customFilesDTO->CustomFileDTO;
	           // make sure we are ALWAYS sending back an array.
	           if(!is_array($cleanResponse)) $cleanResponse = array($cleanResponse);
	        }
	        return $cleanResponse;
	    }
	    return false;
    }
    
    /**
     * --- Replace Custom File Tags By Custom File ---
     */
    public function replaceCustomFileTagsForCustomFile($customFileId, $customTags) {
    	if($this->client) {
	        $response = $this->client->replaceCustomTagsForACustomFile(array(
	            'in0'=> $customFileId,
	            'in1'=> $customTags
	        ))->out;
	        return $response;
	    }
	    return false;
    }
    
    public function checkCustomFileInUse($customFileId){
       if($this->client){
          $response = $this->client->checkCustomFileInUse(array(
                   'in0' => $this->sess->siteId,
                   'in1' => $customFileId
          ))->out;

          if(isset($response->dataObject)){
               return $response->dataObject;
          }
       }
       
       return null;
    }
}