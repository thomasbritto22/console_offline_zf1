<?php
class Zend_View_Helper_SamlRedirectPostForm extends Zend_View_Helper_Abstract 
{	
   public function samlRedirectPostForm($postURI, $targetURI, $SAMLResponse, $targetFrame='')
   {
	  $postForm = '<form action="' .$postURI. '" method="post" id="samlredirectform" '.('' !== $targetFrame ? 'target="' .$targetFrame. '"':'').' style="display: none">
                     <fieldset>
                        <input type="hidden" value="' .htmlspecialchars( $targetURI, ENT_QUOTES ). '" name="TARGET_URI" />
                        <input type="hidden" value="' .$SAMLResponse. '" name="SAMLResponse" />
                        <input type="hidden" value="1" name="isConsole" />      
                     </fieldset>
                  </form>';
	
      return $postForm;    
   }
}
?>