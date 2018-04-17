
//function checkResourceTypeValidation(){	
//	var resourceType = $('#newResourceType').val();
//
//	$(".newItem").val(resourceType);
//	$(".newItem").removeClass(".newItem");
//	
//	$("#newResourceValue").rules("remove", "url");
//	$("#newResourceValue").rules("remove", "email");
//	
//	switch(resourceType){
//	case 'email':
//		$("#newResourceValue").rules("add", {
//			email: true,
//		      maxlength: 40
//		});
//		break;
//	case 'phone':
//		$("#newResourceValue").rules("add", {
//			maxlength: 25
//		});
//		break;
//	case 'url':
//		$("#newResourceValue").rules("add", {
//			regex: "^(http|https)://"
//		});
//		break;
//	}
//	
//	$('#resourceMgrForm').validate().form();
//	$('#resourceMgrForm').submit();
//	
//}



$(document).ready(function() {
//	$.validator.addMethod(
//	        "regex",
//	        function(value, element, regexp) {
//	            var re = new RegExp(regexp);
//	            return this.optional(element) || re.test(value);
//	        },
//	        "Please check your input."
//	);
//	var validateSet = $('#resourceMgrForm').validate({
//		rules:{
//			newResourceVisibility : {
//				required: true
//			},
//			newResourceType : {
//				required: true
//			},
//			newResourceLabel : {
//				required: true
//			},
//			newResourceValue : {
//				required: true
//			}
//			
//		},
//		submitHandler: function(){
//			var li = '<p class="resourceRow">\
//						<span class="resourceIcon">\
//							<span class="resourceRowSelect">\
//								<input type="checkbox" class="resourceListItem" name="resourceListItem[]" value="" id="" />\
//							</span>\
//			        		<span class="resourceRowTitle">\
//			        			<input type="text" class="resourceLabel resourceCenterInput" name="resourceLabel[]" value="'+escapeHtml($("#newResourceLabel").val())+'" readonly/>\
//			        			<input type="hidden" class="resourceLabel_id" name="resourceLabel_id[]" value="" />\
//			        		</span>\
//			        		<span class="resourceRowResource">\
//			        			<input type="text" class="resourceValue resourceCenterInput" name="resourceValue[]" value="'+escapeHtml($("#newResourceValue").val())+'" readonly/>\
//			        			<input type="hidden" class="resourceValue_id" name="resourceValue_id[]" value="" />\
//			        		</span>\
//			        		<span class="resourceRowDescription">\
//			        			<input type="text" class="resourceDescription resourceCenterInput" name="resourceDescription[]" value="'+escapeHtml($("#newResourceDescription").val())+'" readonly/>\
//			        			<input type="hidden" class="resourceDescription_id" name="resourceDescription_id[]" value="" />\
//		        			</span>\
//			        		<span class="resourceRowVisibility">\
//			        			<input type="text" name="resourceVisibility[]" class="resourceVisibility resourceCenterInput" value="'+escapeHtml($('#newResourceVisibility').find(":selected").text())+'" readonly/>\
//								<input type="hidden" class="resourceVisibility_id" name="resourceVisibility_id[]" value="" />\
//							</span>\
//							<span class="resourceRowType">\
//			        			<input type="text" name="resourceType[]" class="resourceType resourceCenterInput" value="'+ escapeHtml($('#newResourceType').find(":selected").text())+'" readonly/>\
//								<input type="hidden" class="resourceType_id" name="resourceType_id[]" value="" />\
//								<input type="hidden" name="resourcecentercustomfile[]" id="resourcecentercustomfile" value="' + escapeHtml($('.newresourcecentercustomfile').val()) + '"/>\
//								<input type="hidden" name="resourcecentercustomfile_id[]" id="resourcecentercustomfile_id[]" value=""/>\
//			        		</span>\
//	        		     </span>\
//        		       </p>';
//			var header = $('.resourcesHeader');
//			header.removeClass('hidden');
//			var actions = $('#actionSet');
//			actions.removeClass('hidden');
//			$('#noResources').hide();
//			$("#resourceItems").append($(li));
//			$('#submitResources').trigger('click');
//			$('#newresourcecentercustomfile').html('add document');
//			return false;
//		},
//		showErrors: function(errorMap, errorList) {
//		       this.defaultShowErrors();
//		  }
//	
//	});
	//make the resource items sortable
	$( "#resourceItems" ).sortable();
        
    //removes selected resource    
	$('.removeResourceBtn').live("click", function(e){
		e.preventDefault();
		var thisObj = $(this);
		thisObj.parent().parent().parent().remove();
	});
	
	//remove all the resources (note, you must press update for this to work)
	$('.removeAll').live("click", function(e){
		e.preventDefault();
		$('#resourceItems > li').remove();
	})
	
	//validate the new resource form	
//	$("#addResource").on("click", function(e){ 
//		e.preventDefault();
//		if($('#newResourceType').val() == 'doc'){
//			var filename = $('#newResourceValue').val();
//			if(filename.indexOf("?time") !== -1){
//				filename = filename.substring(0,filename.indexOf("?time"));
//			}
//			var extension = filename.substr( (filename.lastIndexOf('.') +1) );
//				if(extension != 'doc' && extension != 'docx' && extension != 'pdf'){
//					$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/error.png"  width=50 height=50/></span>Please select or upload a document resource.</p>');
//	        		$("#messageModal").dialog({
//	 	    		   resizable: false,
//	 	    		   width : 320,
//	 	    		   height : 150,
//	 	    		   closeOnEscape: false,
//	 	    		   open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
//	 	    		   $(".ui-dialog-titlebar", ui.dialog).hide();}
//	 	    		});
//	        		setTimeout(function(){
//	            		$("#messageModal").dialog("close");
//	            	}, 1000);
//	        		return false;		        		
//				}
//		}
//		$('#origin').val('AddRes');
//		checkResourceTypeValidation();
//		
//	})
//	$('#newResourceType').on("change", function(e){
//		if($('#newResourceType').val() == 'email')
//			$('#newResourceValue').attr('maxlength',40);
//		else if($('#newResourceType').val() == 'phone')
//			$('#newResourceValue').attr('maxlength',25);
//		else 
//			$('#newResourceValue').removeAttr('maxlength');
//		var settings = $('#resourceMgrForm').validate().settings;
//		if(settings.rules){
//			$.each(settings.rules, function(index, element) {
//				$("#"+index).rules("remove");				
//			});
//		}		
//	if($('#newResourceType').val()=='doc'){
//			$('#fileuploaddiv').show();
//		}else {
//			$('#fileuploaddiv').hide();
//		}
//	});
	$("#submitResources").on("click", function(e){
		e.preventDefault();
		var errorSet = 'No';
//		var selected = new Array();
//    	$('#resourceItems input:checked').each(function() {
//    	    selected.push($(this).attr('id'));
//    	});console.log(selected);
		if($('#origin').val() != 'AddRes'){
	        var action  = $('#resourceAction').val();
	        if(action == '') {
        		$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/error.png"  width=50 height=50/></span>Please select an action.</p>');
        		$("#messageModal").dialog({
 	    		   resizable: false,
 	    		   width : 250,
 	    		   height : 150,
 	    		   closeOnEscape: false,
 	    		   open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
 	    		   $(".ui-dialog-titlebar", ui.dialog).hide();}
 	    		});
        		setTimeout(function(){
            		$("#messageModal").dialog("close");
            	}, 1000);
        		errorSet = 'Yes';
    			
        	} else {
        		var i=0;
	        	$('#resourceItems input:checked').each(function() {
	        		i++;
	        	});
	        	if(i==0){
		        	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/error.png"  width=50 height=50/></span>Please select a resource to change.</p>');
	        		$("#messageModal").dialog({
	 	    		   resizable: false,
	 	    		   width : 320,
	 	    		   height : 150,
	 	    		   closeOnEscape: false,
	 	    		   open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
	 	    		   $(".ui-dialog-titlebar", ui.dialog).hide();}
	 	    		});
	        		setTimeout(function(){
	            		$("#messageModal").dialog("close");
	            	}, 1000);
	        		errorSet = 'Yes';
		        }
		        if(action == 'delete') {
		        	$('#resourceItems input:checked').each(function() {
		        		$(this).parent().parent().parent().remove();
		        	});
		        	var numItems = $('.resourceIcon').length;
		        	if(numItems == 0){
		        		var header = $('.resourcesHeader');
		    			header.addClass('hidden');
		    			var actions = $('#actionSet');
		    			actions.addClass('hidden');
		    			$('#noResources').show();
		        	}		        	
		        } else {		        	
	        		$('#resourceItems input:checked').each(function() {
	        			$(this).removeAttr('checked');
			        	$(this).parent().parent().find('.resourceVisibility').val(action); 
			        });			        
		        }
			}
		} 
		if(errorSet == 'No') {
			$('#origin').val('NotSet');
	        var form = $(this).parents('form');
	        $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/ajax-loader.gif"  width=50 height=50/></span>Saving</p>');
	    	$("#messageModal").dialog({
	    		   resizable: false,
	    		   width : 150,
	    		   height : 150,
	    		   closeOnEscape: false,
	    		   open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
	    		   $(".ui-dialog-titlebar", ui.dialog).hide();}
	    		});
	       // console.log(form);
	    	var selLanguage = $('#fieldLanguagesRC').val();
        	if(selLanguage == undefined){
        		selLanguage = 'en';
        	}
        	var data = form.serialize();
        	data = data+'&Language='+selLanguage;
	        $.ajax({
	            type: form.attr('method'),
	            url: form.attr('action'),
	            data: data,
	            success: function(response){
	            	var settings = $('#resourceMgrForm').validate().settings;
	        		if(settings.rules){
	        			$.each(settings.rules, function(index, element) {
	        				$("#"+index).rules("remove");				
	        			});
	        		}
	            	$('#resourceMgrForm :text').val('');
	            	$('#resourceMgrForm :text').removeClass('valid');
	            	$('.newresourcecentercustomfile').val('');
	            	//$('.error').remove();alert("dfgdf");
	            	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/done.jpg"  width=50 height=50/>Saved</p>');
	    			setTimeout(function(){
	            		$("#messageModal").dialog("close");
	            		//$("#resourceItems").find(".resourceListItem").prop('checked',false);
	            	}, 1000);
	    			
	                //console.log(response);
	            },
	            error: function(response){
	                //console.log(response);
	            }
	        });
		}
	})
	
//	 $('#fieldLanguagesRC').on('change', function(e){ 
//	    	var selLanguage= $('#fieldLanguagesRC').val();
//	    	var data = 'lang='+selLanguage + '&sections[0][section]=global_component&sections[0][subsection]=resource_center';
//	    	$('#langNotification').html('<p>Note: You are currently editing in '+$('#fieldLanguagesRC').find(":selected").text()+'</p>');
//	    	$('#langNotification').show();
//	    	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/ajax-loader.gif"  width=50 height=50/></span>Loading</p>');
//	    	$("#messageModal").dialog({
//	    		   resizable: false,
//	    		   width : 150,
//	    		   height : 150,
//	    		   closeOnEscape: false,
//	    		   open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
//	    		   $(".ui-dialog-titlebar", ui.dialog).hide();}
//	    		});
//	    	var actions = $('#actionSet');
//			
//	    	$.ajax({
//	            type: 'post',
//	            url: 'componentsdata',
//	            data: data,
//	            dataType: 'json',
//	            success: function(response){
//	            	//console.log(response);
//	            	$('div#resourceItems').children("p.resourceRow").remove();
//	            	$('#noResources').hide();
//	            	if(response.length > 0){
//		            	for(var i  = 0; i < response.length; i++){
//		            		var customfileId = '';
//		            		var customfileValue = '';
//		            		if(response[i].customfile){
//		            			customfileId = response[i].customfile.id;
//		            			customfileValue = response[i].customfile.value;
//		            		}		            			
//		            		//console.log(response[i]);
//		            		var resourceStr = '<p class="resourceRow">\
//					        	<span class="resourceIcon">\
//						        	<span class="resourceRowSelect">\
//		            					<input type="checkbox" class="resourceListItem" name="resourceListItem[]" value="" id="'+ response[i].rc_type.groupId +'" />\
//		            					</span>\
//		            					<span class="resourceRowTitle">\
//		            					<input type="text" class="resourceLabel resourceCenterInput" name="resourceLabel[]" value="'+ escapeHtml(response[i].title.value) +'" readonly />\
//						        		<input type="hidden" class="resourceLabel_id" name="resourceLabel_id[]" value="'+ response[i].title.id +'" />\
//						        	</span>\
//						        	<span class="resourceRowResource">\
//						        		<input type="text" class="resourceValue resourceCenterInput" name="resourceValue[]" value="'+ escapeHtml(response[i].text.value) +'" readonly />\
//						        		<input type="hidden" class="resourceValue_id" name="resourceValue_id[]" value="'+ response[i].text.id +'" />\
//						        	</span>\
//					        		<span class="resourceRowDescription">\
//						        		<input type="text" class="resourceDescription resourceCenterInput" name="resourceDescription[]" value="'+ escapeHtml(response[i].description.value) +'" readonly />\
//						        		<input type="hidden" class="resourceDescription_id" name="resourceDescription_id[]" value="'+ response[i].description.id +'" />\
//				        			</span>\
//						        	<span class="resourceRowVisibility">\
//						        		<input type="text" name="resourceVisibility[]" id="resourceVisibility[]" class="resourceVisibility resourceCenterInput" value="'+ escapeHtml(response[i].toggle.value) +'" readonly />\
//										<input type="hidden" class="resourceVisibility_id" name="resourceVisibility_id[]" value="'+response[i].toggle.id+'" />\
//						        	</span>\
//						        	<span class="resourceRowType">\
//						        		<input type="text" name="resourceType[]" class="resourceType resourceCenterInput" value="'+ escapeHtml(response[i].rc_type.value) +'" readonly/>\
//										<input type="hidden" class="resourceType_id" name="resourceType_id[]" value="'+ response[i].rc_type.id +'" />\
//										<input type="hidden" name="resourcecentercustomfile[]" id="resourcecentercustomfile[]" value="' + customfileValue + '"/>\
//										<input type="hidden" name="resourcecentercustomfile_id[]" id="resourcecentercustomfile_id[]" value="'+ customfileId +'"/>\
//						        	</span>\
//					        		<span>\
//							    		<input type="hidden" class="resourcegroupId" name="groupId[]" value="'+ response[i].rc_type.groupId +'"/>\
//							    		</span>\
//							    		</span>\
//					        	</p>';
//		            		$('#resourceItems').append(resourceStr);
//		            	}
//		            	actions.removeClass('hidden');
//	            	} else {
//	            		$('#noResources').show();
//	            	    actions.addClass('hidden');
//	            	}
//	            	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/done.jpg"  width=50 height=50/></span>Done</p>');
//	        		setTimeout(function(){
//	            		$("#messageModal").dialog("close");
//	            	}, 200);
//	            },
//	            error: function(jqXHR, textStatus, errorThrown){
//	            	button.removeAttr("disabled");
//	            	$('#slideVal').val('NotSet');
//	            	//do something with this
//	            }
//	        }); 
//	    });
});




