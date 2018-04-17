<?php
class Zend_View_Helper_AuthSelfRegistration extends Zend_View_Helper_Abstract {
	
	public function authSelfRegistration($fieldVal, $frontEnd = true, $lang = '',$selectLabel = ''){
        if (true === $frontEnd){
      		$fieldHtml = $this->selfRegField($fieldVal,$lang,$selectLabel);
        }else{
           $fieldHtml = $this->adminFieldBuild($fieldVal);
        }
		
		return $fieldHtml;	
	}
	
	private function adminFieldBuild($fieldVal){
	   $field = '';
	   
	   if(isset($fieldVal->userCustomColumnEnum)  && !empty($fieldVal->userCustomColumnEnum))
	   {
	      $field = '<select disabled><option>Please select</option></select>';
	   }
	   else if(2 == $fieldVal->fieldType)
	   {
	      $field = '<select disabled style="width: auto;"><option>MM</option></select> <select disabled style="width: auto;"><option>DD</option></select> <select disabled style="width: auto;"><option>YYYY</option></select><i class="glyphicon glyphicon-calendar"></i>';
	   }
	   else
	   {
	      $field = '<input disabled/>';
	   }
	   
	   $adminFieldHtml = '<div class="formRow clearfix">
	                        <p class="labelText">' .(1 == $fieldVal->requiredField ? "* ":"").$fieldVal->displayName. ':</p>
	                        <p class="userInput">' .$field. '</p>
	                        <div class="editableInstructions dataElement" data-prop=\'{"groupName":"fieldLists", "fieldName":"' .$fieldVal->columnName. '"}\' placeholder="Enter instructional text here" displayplaceholder="Type in your instructional text here (100 charactersmaximum)." length="100" >Enter instructional text here</div>
	                        <div class="formPreview tooltip" title="" ></div>
	                   </div>';
	   
	   //add the password and confirm password
	   if ("Login_name" == $fieldVal->columnName){
	      $adminFieldHtml .= $this->passwordFields();
	   }
	   
	   return $adminFieldHtml;
	}

	private function selfRegField($fieldVal,$lang,$selectLabel){
		$field = '';
		$tooltipsterClass= (1 == $fieldVal->userColumnInstructionIsActive && $fieldVal->instructionText != '' ? 'tooltipster' :'');
	    $tooltipText = (1 == $fieldVal->userColumnInstructionIsActive && $fieldVal->instructionText != '' ? $fieldVal->instructionText :'');
		if (isset($fieldVal->userCustomColumnEnum) && !empty($fieldVal->userCustomColumnEnum->entry)) {
			$field = '<select name="'.$fieldVal->columnName.'" id="'.$fieldVal->columnName.'" class="formField '. $tooltipsterClass .'" title="'. htmlentities($tooltipText, ENT_QUOTES | ENT_IGNORE, "UTF-8") .'">';
			$field .= '<option value="">'. $selectLabel .'</option>';
			$labelClass = '';
			if(!is_array($fieldVal->userCustomColumnEnum->entry))
				$fieldVal->userCustomColumnEnum->entry = array($fieldVal->userCustomColumnEnum->entry);
			foreach ($fieldVal->userCustomColumnEnum->entry as $value) {
				$sel = '';
				if($fieldVal->columnName == 'Language' && $value->key == $lang)
					$sel = 'selected';
				$field .= '<option value="'.$value->key.'" '.$sel.'>'.$value->value.'</option>';
			}
			$field .= '</select>';
		 } else if(isset($fieldVal->fieldType) && $fieldVal->fieldType == 2){
			$field = $this->getDateHTML($fieldVal->columnName, $tooltipsterClass, $tooltipText,$fieldVal->dateTextFormat);
			$labelClass = ''; 
		} else {
			$passType = '';
			if(isset($fieldVal->fieldType) && $fieldVal->fieldType == 11){
				$passType = 'type="password"';				
			}
			if(isset($fieldVal->fieldLength) && $fieldVal->fieldLength > 0)
				$passType .= ' maxlength="'.$fieldVal->fieldLength.'"';
			$field = '<input name="'.$fieldVal->columnName.'" id="'.$fieldVal->columnName.'" ' .$passType. ' class="formField '. $tooltipsterClass .'" title="'. htmlentities($tooltipText, ENT_QUOTES | ENT_IGNORE, "UTF-8") .'" />';
		}
	   $selfRegFieldHtml = '<div class="form-group" id="Grp'.$fieldVal->columnName.'">
      						<label for="'.$fieldVal->columnName.'"  '.$labelClass.' class="contentTextIcons">'. (1 == $fieldVal->requiredField ? "* ":"").$fieldVal->displayName .':</label>
      						'.$field.'
      						</div>';
	   return $selfRegFieldHtml;
	}
	
	private function getDateHTML($name, $tooltipsterClass, $tooltipText,$dateTextFormat){
		$field = '<div data-field="'.$name.'" ' .$passType. ' class="dateField formField '. $tooltipsterClass .'" title="'. htmlentities($tooltipText, ENT_QUOTES | ENT_IGNORE, "UTF-8") .'" >';
		$monthsArr = array('JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC');
		$monthsArr1 = array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
		$formatArr = array('DD/MM/YYYY'=>date('d').'/'.date('m').'/'.date("Y"),'MM/DD/YYYY'=>date('m').'/'.date('d').'/'.date("Y"),
				'YYYY/MM/DD'=>date('Y').'/'.date('m').'/'.date("d"),'DD-MON-YYYY'=>date('d').'-'.$monthsArr[(int)date('m')-1].'-'.date("Y"),
				'MON-DD-YYYY'=>$monthsArr[(int) date('m') - 1].'-'.date('d').'-'.date("Y"));
		$month = date('m');
        $field .= '<select class="m" id="'.$name.'_m" >';
        $field .= '<option value="">Month</option>';
        foreach($monthsArr1 as $key => $val){
        	$i = $key + 1;
        	$field .= '<option value="'.$i.'" >'.$val.'</option>';
        }
        $field .= '</select>';
        $day = date('d');
        $field .= '<select class="d" id="'.$name.'_d">';
        $field .= '<option value="">Day</option>';
        for($i = 1; $i <= 31; $i++)
        	$field .= '<option value="'.$i.'">'.$i.'</option>';
        $field .= '</select>';
        $field .= '<select class="y" id="'.$name.'_y">';
        $field .= '<option value="">Year</option>';
        $maxYear = 2050; 
        $thisYear = date("Y");
        for($i = 1900; $i <= $maxYear; $i++)
        	$field .= '<option value="'.$i.'">'.$i.'</option>';
        $field .= '</select>';
        $glue = '/';
        $date = $month . $glue . $day . $glue . $thisYear;
        $format = 'mm'. $glue .'dd'. $glue .'yyyy';
        $field .= '<div class="input-append date" style="overflow: visible"  data-date-format="'.$format.'">
			<input type="hidden" id="'.$name.'_val" name="'.$name.'_val" data-id="'.$name.'" value="'.$date.'" class="date-hiddenField"><span class="add-on"><i class="fa fa-calendar"></i><i class="material-icons">&#xE916;</i></span>
			</div><input type="hidden" id="'.$name.'" name="'.$name.'" value="" data-format="'.$dateTextFormat.'">';
        $field .= '</div>';

        return $field;
		 
	}
	
	private function passwordFields(){
	   $adminFieldHtml = '<div class="formRow clearfix"><p class="labelText">* Password:</p><p class="userInput"><input disabled/></p><p class="defaultInstrText">Instructional text for this field can be modified under Global tab in Password instructions.</p></div>
	                      <div class="formRow clearfix"><p class="labelText">* Confirm password:</p><p class="userInput"><input disabled/></p><p class="defaultInstrText">Instructional text for this field can be modified under Global tab in Password instructions.</p></div>';
	   
	   return $adminFieldHtml;
	}
}
?>