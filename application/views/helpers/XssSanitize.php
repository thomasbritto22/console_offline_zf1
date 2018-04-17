<?php
class Zend_View_Helper_XssSanitize extends Zend_View_Helper_Abstract
{
   public function xssSanitize($sourceText, $espAll=true, $whiteList=array())
   {
      if (true===$espAll){
         $htmlFilter = new Console_Filter_XSS();
         
         return $htmlFilter->filter($sourceText);
      }

      $htmlFilter = new Console_Filter_XSS($whiteList);
      
      return $htmlFilter->filter($sourceText);
   }
}
?>