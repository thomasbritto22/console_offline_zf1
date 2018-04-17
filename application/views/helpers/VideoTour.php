<?php
class Zend_View_Helper_VideoTour extends Zend_View_Helper_Abstract
{
   public function videoTour($videoItems)
   {
      $text = '';
      $videoText = isset($videoItems['text']) ? $videoItems['text'] :'';
      $videoTitle = isset($videoItems['title']) ? $videoItems['title'] :'';
      $videoThumbnail = isset($videoItems['thumbnail']) ? $videoItems['thumbnail'] :'';


      if(is_array($videoItems) && isset($videoItems['customfile']))
      {
         //hidden values for video tag
         $text .=  '<div>';
         $text .=     '<input id="videoText" type="hidden" value="' .htmlentities($videoText, ENT_QUOTES | ENT_IGNORE, "UTF-8"). '">';
         $text .=     '<input id="videoTitle" type="hidden" value="' .htmlentities($videoTitle, ENT_QUOTES | ENT_IGNORE, "UTF-8"). '">';
         $text .=     '<input id="videoPath" type="hidden" value="' .htmlentities($videoItems['customfile']). '">';
         $text .=     '<input id="videoThumbnail" type="hidden" value="' .htmlentities($videoThumbnail). '">';
         $text .=  '</div>';
      }

      return $text;

   }
}
?>