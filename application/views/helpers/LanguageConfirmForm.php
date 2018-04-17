<?php
class Zend_View_Helper_LanguageConfirmForm extends Zend_View_Helper_Abstract 
{	
	public function languageConfirmForm($siteConfigs, $siteLangs, $siteLabels, $userLangArr)
	{
	   $languageConfirmBox = '';
	   
	   if($siteConfigs['isSiteInternationalized']){
	     if($userLangArr['siteDefLang'] != $userLangArr['userProfileLangVal']){
	        
	        $options = '';
	        if(!empty($siteLangs) && count($siteLangs)> 0) {
	           foreach ($siteLangs as $key=>$lang){
	              $options .= '<option value="' .$lang->language. '" ' .($lang->language == $userLangArr['siteDefLang'] ? 'selected' : ''). '>' .$lang->enName. '</option>';
	           }
	        }
	        
	   	    $languageConfirmBox = '<div id="userLangSelection">'.
         		   '<form name="userProfileLangForm" action="/profile/updatelang" method="post">'.
         			  '<fieldset>'.
         				 '<p class="contentTextIcons font-style3">Please confirm your profile setting :</p>'.
         				 '<p class="contentTextIcons font-style3"> Language :'.
         					'<select name="fieldLanguagesUser" id="fieldLanguagesUser">' .$options. '</select>'.
         		       '</p>'.
         		       '</fieldset>'.
         		       '<fieldset class="updateButtons">'.
         		   	      '<input type="hidden" name="siteDefLang" id="siteDefLang" value="' .$userLangArr['siteDefLang']. '" />'.
         		   		  '<input type="hidden" name="userProfileLang" id="userProfileLang" value="' .$userLangArr['userProfileLangVal']. '" />'.
         		   		  '<input type="hidden" name="pushClose" id="pushClose" value="Yes" />'.
         			      '<button type="submit" id="langSelSubmit" class="customButton">' .$siteLabels['Save']. '</button>'.
         		       '</fieldset>'.
         		   '</form>'.
         	    '</div>';
	     }
	  }
		
      return $languageConfirmBox;    
   }
}
?>