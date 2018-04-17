<?
include_once('_CatalystService.php');

/**
 * --- MESSAG BOARD SOAP MODEL ---
 * Extends Catalyst Service to get and set dialog
 * for a particular module, on a particular site. 
 * @author seema.akre
 *
 */
class MessageBoardSoapModel extends CatalystServiceSoapModel {

    /**
     * --- INITALIZE ---
     * Initializes the Catalyst Service model... fairly self explanitory.
     */
    public function MessgaeBoardSoapModel(){
        $this->init();
    }
    
    /**
     * --- GET MODULE DIALOG/MESSAGES ---
     * Requests the list of messages 
     * for a particular module, on a particular site.
     * Returns false if no client
     * @param string $systemId
     * @param int $siteId
     */
    public function getMessagesByModule($siteId, $systemId){
        if(!empty($this->client)){
            $response = $this->client->getMessagesBySiteIdSystemId(array(
                'in0'=>$siteId, 
                'in1'=>$systemId
            ))->out;
            return $response;
        }
        else return false;
    }
    
    
    /**
     * --- SAVE USER MODULE MESSAGE ---
     * Passes the user message to the services for creating.
     * Returns false if no client
     * @param String $userId
     * @param Long $siteId
     * @param String $systemId
     * @param String $pageId	
     * @param String $messageText
     * 
     */
    public function saveUserMessage($userId, $siteId, $systemId, $pageId, $messageText){
        if(!empty($this->client)){
            $response = $this->client->saveMessage(array(
                'in0' => $userId,
                'in1' => $siteId,
                'in2' => $systemId,
                'in3' => $pageId,
                'in4' => $message
            ))->out;
            return $response;
        }
        else return false;
    }
    
	/**
     * --- UPDATE MESSAGE ---
     * Passes the user message to the services for updating.
     * Returns false if no client
     * @param String $messageId
     * @param Long $messageText
     * 
     */
    public function updateMessage($messageId, $messageText){
        if(!empty($this->client)){
            $response = $this->client->updateMessage(array(
                'in0' => $messageId,
                'in1' => $messageText
            ))->out;
            return $response;
        }
        else return false;
    }
    
    /**
     * --- DELETE MESSAGE ---
     * deletes the a particular message from message board.
     * Returns false if no client
     * @param String $messageId
     * 
     */
    public function deleteMessage($messageId){
        if(!empty($this->client)){
            $response = $this->client->deleteMessage(array(
                'in0' => $messageId
            ))->out;
            return $response;
        }
        else return false;
    }
    
}
