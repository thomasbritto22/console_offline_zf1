if(typeof Lrn == 'undefined') Lrn = {};
if(typeof Lrn.Widget == 'undefined') Lrn.Widget = {};

Lrn.Widget.FileTool = function(config){
    // set up the default values. Do not add to
    // prototype because it will affect ALL instances.
    this.config = {
        id: 'fileTool',
        targetWidth: 350,
        targetHeight: 350,
        previewWidth: 125,
        previewHeight: 125,
        cropWidth: 300,
        cropHeight: 300,
        returnField: null,
        returnImg: null,
        getfile: null,        
        docConfig: {
	        errorText: {
	            largeSize: '<p><strong>This file size exceeds 20 MB.</strong></p><p>Please reduce the file size or choose another file.</p>',
	            smallSize: '<p><strong>This file size is less than ?.</strong></p><p>Please increase the file size or choose another file.</p>',
	            invalidType: '<p><strong>This type of file is not supported.</strong></p><p>Please convert the file into a supported type or choose another file.</p>'
	        },
	        maxFileSize: 20971520,
	        acceptFileTypes: /(\.|\/)(pdf|docx?)$/i,
	        htmlAcceptFileTypes: "application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/pdf",
	        uploadRequirements://"Your document should meet the following requirements:."+
                        "<p>Allowed document file types: pdf, doc and docx. Maximum file size is 20 MB.</p>",
            modalTimeout: 15000,
            type:'doc'
        },
        imgConfig: {
	        errorText: {
	            largeSize: '<p><strong>This file size exceeds 1 MB.</strong></p><p>Please reduce the file size or choose another file.</p>',
	            smallSize: '<p><strong>This file size is less than 1kB.</strong></p><p>Please increase the file size or choose another file.</p>',
	            invalidType: '<p><strong>This type of file is not supported.</strong></p><p>Please convert the file into a supported type or choose another file.</p>'
	        },
	        maxFileSize: 1048576,
	        canvas: false,
	        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
	        htmlAcceptFileTypes: "image/jpeg,image/jpg,image/gif,image/png",
	        uploadRequirements: "Recommended image size is <span class=\"uploadWidth\"></span> x <span class=\"uploadHeight\"></span> pixels."+
                        "<p>Allowed image file types: jpg, jpeg, gif and png. Maximum file size is 1 MB.</p>",
            modalTimeout: 15000,
            type:'img'
        },
        vidConfig: {
	        errorText: {
	            largeSize: '<p><strong>This file size exceeds 100 MB.</strong></p><p>Please reduce the file size or choose another file.</p>',
	            smallSize: '<p><strong>This file size is less than 1kB.</strong></p><p>Please increase the file size or choose another file.</p>',
	            invalidType: '<p><strong>This type of file is not supported.</strong></p><p>Please convert the file into a supported type or choose another file.</p>'
	        },
	        maxFileSize: 104857600,
	        acceptFileTypes: /(\.|\/)(mp4|webm)$/i,
	        htmlAcceptFileTypes: "video/mp4,video/webm",
	        uploadRequirements://'Your video should be <span class="uploadWidth">120</span> x <span class="uploadHeight">160</span> pixels.'+
            '<p>Allowed video file types: mp4 and webm. Maximum file size is 100MB.</p>',
            modalTimeout: 15000,
            type:'vid'
        },
        allConfig: {
	        errorText: {
	            largeSize: '<p><strong>This file size exceeds 100 MB.</strong></p><p>Please reduce the file size or choose another file.</p>',
	            smallSize: '<p><strong>This file size is less than 1kB.</strong></p><p>Please increase the file size or choose another file.</p>',
	            invalidType: '<p><strong>This type of file is not supported.</strong></p><p>Please convert the file into a supported type or choose another file.</p>'
	        },
	        maxFileSize: 104857600,
	        acceptFileTypes: /(\.|\/)(mp4|webm|gif|jpe?g|png|pdf|docx?)$/i,
	        htmlAcceptFileTypes: "video/mp4,video/webm,image/jpeg,image/jpg,image/gif,image/png",
	        uploadRequirements: 'Allowed image file types: jpg, jpeg, gif and png. Maximum file size is 1 MB.'+
            '<p>Allowed document file types: pdf, doc and docx. Maximum file size is 20 MB.</p>'+
            '<p>Allowed video file types: mp4 and webm. Maximum file size is 100MB.</p>',
            modalTimeout: 15000,
            dataObj:[{msg:'<p><strong>This file size exceeds 100 MB.</strong></p><p>Please reduce the file size or choose another file.</p>',
            			allow:['video/mp4','video/webm'],size:104857600},
                      {msg:'<p><strong>This file size exceeds 1 MB.</strong></p><p>Please reduce the file size or choose another file.</p>',
            			allow:['image/jpeg','image/jpg','image/gif','image/png'],size:1048576},
                      {msg:'<p><strong>This file size exceeds 20 MB.</strong></p><p>Please reduce the file size or choose another file.</p>',
            			allow:['application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword','application/pdf'],size:20971520}],
            type:'All'
        },
        config: null,
        configType: 'all',//can be 'img', 'doc', or 'vid'
        setConfig: function(type){
        	this.config.config = ((type === 'img' || type === 'doc' || type === 'vid' || type === 'all') ? this.config[this.config.configType+'Config'] : null);
        	this.updateFileLibraryLink();
        }.bind(this)
    };
    
    // if any config values are passed in, override defaults
    if(config)
    	for(var c in config) 
    		if(config.hasOwnProperty(c))
    			this.config[c] = config[c];

    this.config.setConfig(this.config.configType);
    
    // set up a variable to hold cropping values
    this.cropParams = null;

    // set up a variable to hold croppers (for easy destroying later)
    this.cropTargets = [];
    
    // set up a variable to hold files to delete
    this.deleteList = {};
    
    
};

Lrn.Widget.FileTool.prototype = new Lrn.Widget();
Lrn.Widget.FileTool.prototype.superclass = Lrn.Widget.prototype;

/**
 * --- INIT FILE TOOL ---
 */
Lrn.Widget.FileTool.prototype.init = function(){
    // call the superclass init method to extend
    this.superclass.init.apply(this);

    var controller = this;
    var cancelled = false;
    
    $('#fileTool').dialog({
        autoOpen: false,
        modal: true,
        title: 'File tool',
        width: 795,
        height : 750,
        initted: false,
        resizable: false,
        buttons: {
            'Close': function(){            	
            	//controller.cancelUploadItems(true);
            	cancelled = true;
            	controller.cancelUploadItems(true);
            	$('#fileTool').dialog('close');	            	
            }
        },
        open: function(){
            // enable the tabs for upload/library views
            $('#fileTool').tabs({
                beforeLoad: function(e,ui){
                    // hide the tab panel while loading
                    $('#fileTool #tabCurtain').fadeIn();
                },
                load: function(e,ui){
                    // show the tab panel after loaded
                    $('#fileTool #tabCurtain').fadeOut();
                    if($('#fileupload .files').children().length != $('.uploadQueue').parent().find('.error').length){	        
            	        $('#fileupload .fileupload-start').removeAttr('disabled').removeClass('disabled');
            	        $('.uploadQueue').find('.fileupload-cancel')
                    	.removeAttr("disabled")
                    	.removeClass('disabled');
                	}
//                    if($(ui.tab).is('#tab-library')) controller.initLibrary();
                }
            });
            
            //alway at the first table when open
            $('#tab-upload').click();
          //set selected file to null
            controller.selectedFileId = null;
            controller.selectedFileImg = '';
            controller.initLibrary();
        },
        
        // on close, clean up the dialog by removing 
        // any upload queue items, library view, and any croppers
        // or other plugins left over.
        close: function(e){
            // destroy all the croppers, jcrop is a bit
            // unusual in how it handles being interacted with
        	
            if(controller.cropTargets.length > 0){
                for(var i in controller.cropTargets -1){
                    $(controller.cropTargets[i]).data('Jcrop').destroy();
                }
                controller.cropTargets = [];
            }
            
            // destroy the fileupload plugin
            $('#fileupload').data('fileupload').destroy();
            // remove HTML elements for library view
            $('.editingArea').remove();
            $('.expandable').remove();
//            // remove any items still left in the upload queue
//            $('.files').empty();
            // destroy the tabs and all their related content 
            // ... includes the library view
            $('#fileTool').tabs('destroy');
           // $('.ui-widget-content').hide();	
            // if there is a return field (a hidden input element) then it is
            // expecting the file ID for the selected file. This is how the file
            // gets attached to whatever other entry (slideshow slide, etc.).
            
            var type = 'image';
        	switch(controller.config.configType){
    	    	case 'doc': 
    	    		type = 'document';
    	    		break;
    	    	case 'vid':
    	    		type = 'video';
    	    		break;
        	}
        	var button = $("button[name='"+$(controller.config.returnField).attr('name')+"']");
        	if(controller.config.returnField){
        		
                if(controller.selectedFileId != undefined){
                	button.html('Replace ' + type);
                }
                if('undefined' != typeof controller.selectedFileId && '' != controller.selectedFileId && null != controller.selectedFileId){
                	$(controller.config.returnField).val(controller.selectedFileId);
                	$(controller.config.returnField).change();
                }
            }

            if(!cancelled){
	            // if there is a return image space, then update the src attribute to
	            // show this image as a preview.
	            if(controller.config.returnImg && "" != controller.selectedFileImg && "undefined" != typeof controller.selectedFileImg){
	            	//get the file path
	            	var sourcefile = '';
	            	if(true == controller.config.returnSourceFile){
	            		if(controller.config.configType == 'vid'){
	            			sourcefile = controller.selectedFileSource+'?title='+controller.selectedFileTitle;
	            		}else{
	            			sourcefile = controller.selectedFileSource;
	            		}
	            	}else{
	            		sourcefile = controller.selectedFileImg;
	            	}
	            	
	            	if(controller.config.getfile == 'Yes'){
	            		if ("undefined" != typeof(controller.config.returnFileNameField) && controller.selectedFileImg != undefined){
	            			controller.config.returnFileNameField.val(sourcefile);
	            			controller.config.returnFileNameField.change();
	            		}else{
	            			$('.getfilepath').val(sourcefile);
	            		}
	            	}
	            	
	            	var $returnImg = $(controller.config.returnImg);
	            	if(!$returnImg.attr('oldsrc'))
	            		$returnImg.attr('oldsrc', $returnImg.attr('src'));
	            	$('#videoFile').val(controller.selectedFileAlt);
	            	
            		if(controller.config.configType == 'vid'){
            			var oldText = '';
            			if($(' [name="video_tourcustomfile"]').attr('oldtext') != undefined)
            				oldText = $('input[name="video_tourcustomfile"]').attr('oldtext');
            			if($('input[name="video_tourcustomfile"]').val() =='' && oldText =='')
            				$('#video_tourcustomfile').html('Add video');
                		else
                			$('#video_tourcustomfile').html('Replace video');
            		}
            		
            		$returnImg.attr('src', controller.selectedFileImg);

                    $returnImg.change();
            		
	            	if(controller.config.configType == 'vid' && controller.selectedFileImg != undefined){
	            		
		            	//set the empty custom thumbnail when select other video
	            		$(controller.config.returnFieldThumb).val('');
	            		$(controller.config.clickThumbnailButton).removeClass("disabledBtn").removeAttr("disabled");
	            		$returnImg.data('defaultimage', controller.selectedFileImg);
		            	
//	            		var initval = 1;
//	            		var sfiBase = controller.selectedFileImg.substr( 0,(controller.selectedFileImg.lastIndexOf('.') ) );
//	            		controller.selectedFileImg = sfiBase + '-00002.jpg';
//	            		if(!this.initted){
//	    	            	$returnImg.on('load',function(e){
//	    	            		e.originalEvent.stopPropagation();
//	    	            		e.originalEvent.preventDefault();
//	    	            		initval = 1;
//	    	            		return false;
//	    	            	});
//	    	            	$(controller.config.returnImg).on('error',function(e){
//	    	            		e.originalEvent.stopPropagation();
//	    	            		e.originalEvent.preventDefault();
//	    	            		++initval;
//	    	            		if(initval < 3){
//	    	            			controller.selectedFileImg = sfiBase + '-' + String("0000" + initval).slice(-5) + '.jpg';
//		    	            		setTimeout( function(){
//		    	            			$returnImg.attr('src', controller.selectedFileImg);
//		    	            		}, 1500);
//	    	            		}else{
//	    	            			initval = 1;
//	    	            			$returnImg.attr('src', '/images/placeholders/video-placeholder.png');
//	    	            		}
//	    	            		return false;
//	    	            	});
//	    	            	this.initted = true;
//	                	}
	            	}else{
// 	            		$returnImg.on('load', function(){
// //	                    	Lrn.Application.prototype.scaleImage.call(Lrn.Application.prototype,null,controller.config.returnImg);
	                    	
// 	                    	var $parent = $(this).parent();
// 	            			var $rw = $(this).width();
// 	            			var $rh = $(this).height();
// 	            			var $pw = $parent.width();
// 	            			var $ph = $parent.height();
	            			
// 	            			var $w = Math.ceil(($pw-$rw)/2);
// 	            			var $h = Math.ceil(($ph-$rh)/2);
	            			
// 	            			$(this).css('margin-left',$w+'px');
// 	            			$(this).css('margin-top',$h+'px');
// 	            			console.log($parent,'image loaded');
// 	            		});
	            	}
	            	if(button.hasClass('adminFormSubmit'))
	            		Lrn.Application.Admin.initClearLinkEachClearLink(0,button[0]);
	            	
	            	Lrn.Application.Admin.initSetClearImageObject();
	            	button.parents('fieldset').find('[name="clearSlideShowImage"]').click(Lrn.Application.Admin.initAdminListOnclickClearSlideShowImage.bind(Lrn.Application.Admin));
	            	
	            	//set the selectedFile to empty
	            	controller.selectedFileImg = "";
	            }
	            
            }else{
            	cancelled = false;
            }
            
        	//this is just only for addnew resource document type
            if ("" == $('#newResourceValue').val()){
            	$('#newresourcecentercustomfile').html('Add document');	
            }
        }
    });
    // we want to style the dialog just right
    // so this removes the title bar rounded corners
    // then puts in only the top corners to match the
    // main dialog curves, instead of sticking out.
    $('#fileTool').prev('.ui-dialog-titlebar').removeClass('ui-corner-all').addClass('ui-corner-top');
    $('#fileTool').parent('.ui-dialog').addClass('nd-width');
    
    // enable file uploading via our plugin.
    this.initFileUpload();
};

Lrn.Widget.FileTool.prototype.updateFileLibraryLink = function(){
	var href = $('#tab-library');

    if(href.length > 0){
    	href = href.attr('href');
	    var hrefsplit = href.split('?');
	    if(hrefsplit.length > 1){
	    	var subsplit = hrefsplit[1].split('=');
	    	hrefsplit[1] = subsplit[0]+'='+this.config.configType;
	    	$('#tab-library').attr('href',hrefsplit[0]+'?'+hrefsplit[1]);
	    }else{
	    	$('#tab-library').attr('href',href+'?type='+this.config.configType+"&width="+this.config.cropWidth+"&height="+this.config.cropHeight);
	    }
    }
};
/**
 * --- INIT FILE UPLOADER ---
 * Initializes the fileupload plugin so users can upload files.
 */
Lrn.Widget.FileTool.prototype.initFileUpload = function(){
    // change the width/height values in our instructions to reflect the
    // image size that we're looking for.
	$('#fileupload').find('.uploadRequirements').html(this.config.config.uploadRequirements);

    $('#fileTool .uploadRequirements .uploadWidth').html(this.config.cropWidth);
    $('#fileTool .uploadRequirements .uploadHeight').html(this.config.cropHeight);

    //sets the accept for browsers that support it
    $('#fileupload').children('.fileupload-buttonbar').children('div').children('span').children('input').attr('accept',this.config.config.htmlAcceptFileTypes);
    $('#filetype').val(this.config.configType);
    // using most of the demo script for jquery-file-upload
    // but added the ability to set the messages from here
    // so as to maybe use translated ones.
    this.config.config.url = '/files/upload?type='+this.config.configType+'&width='+this.config.cropWidth+'&height='+this.config.cropHeight;
    
    // on upload complete, send the user to the library views
    this.config.config.complete = function(response){
    	//we're checking to see if the AJAX request was cancelled
    	//if not, show the library...

    	response = typeof(response.responseText) === "undefined" ? response : response.responseText;
    	var t = new Date().getTime();
    	this.config.config.numfiles = this.config.config.numfiles-1;
    	//allow enough time to show the error message 
		if(this.config.config.numfiles == 0){
			var onmc = function(){
		    	$("#messageModal").off('modalclosed',onmc);

		    	setTimeout(function(){
			    	$("#messageModal").show();
		    		$('#tab-libraryload').click();
			    	$('#fileupload .selectAllBar').hide();
			    	$('#fileupload .files').hide();
		    	},100);
			};
			if ($("#messageModal").is(":visible")) {
				$("#messageModal").on('modalclosed',onmc);
			}else {
				setTimeout(function(){
					$('#tab-libraryload').click();
			    	$('#fileupload .selectAllBar').hide();
			    	$('#fileupload .files').hide();
		    	},100);
			}
		}
    	
    	if(this.ajax != null){    		
    		setTimeout(function(){
    			$('#fileupload .selectAllBar').hide();
    			$('#fileupload .files').hide();
    			$('#fileTool').tabs({active:1});
    		}, 4000);
	        //this.ajax = null;
    	}else{
    		//...if so, remove our new entry from the library
    		//$($('.expandable')[0]).find('.delete').click();
    	}
    }.bind(this);
    this.config.config.added = function(){
    	$('#fileupload .selectAllBar').show();
    	$('#fileupload .files').show();
    	if($('#fileupload .files').children().length != $('.uploadQueue').parent().find('.error').length){	        
	        $('#fileupload .fileupload-start').removeAttr('disabled').removeClass('disabled');
    	}
    	
    	this.config.config.numfiles = $('#fileupload .files').children().length-$('.uploadQueue').parent().find('.error').length;
    }.bind(this);
    // 'deleted' is called every time a file is deleted from upload queue
    this.config.config.failed = this.cancelUploadItems.bind(this);
    $('#fileupload').fileupload(this.config.config);
};

Lrn.Widget.FileTool.prototype.cancelUploadItems = function(){
	var controller = this;    
	var haltall = arguments[0] || false;
    // when there are no more files, hide the select all bar again.
	if($('#fileupload .files').children().length == 0){
        $('#fileupload .selectAllBar').hide();
        $('#fileupload .fileupload-start').attr('disabled', 'disabled').addClass('disabled');
    } else if($('#fileupload .files').children().length == $('.uploadQueue').parent().find('.error').length){
        $('#fileupload .fileupload-start').attr('disabled', 'disabled').addClass('disabled');
	}
    
//    if($('#fileupload .files').children().length == 0 || haltall){
//        $('#fileupload .selectAllBar').hide();
//        $('#fileupload .fileupload-start').attr('disabled', 'disabled').addClass('disabled');
//    }
	/*if($('#fileupload .files').children.length != 0){	
		$('#fileupload .files').empty();
		$('#fileupload .uploadLoading').empty();
		var progress = $('#fileupload .fileupload-progress');
		progress.removeClass('in');
		progress.find('.bar').css('width', '0%');
	}
	$('#fileupload .selectAllBar').hide();
    $('#fileupload .fileupload-start').attr('disabled', 'disabled').addClass('disabled');
    if(haltall){
    	if(this.ajax != null)
    		this.ajax.abort();
    	if(controller.ajax != null)
    		controller.ajax.abort();
	}*/
};
/**
 * --- INIT LIBRARY ---
 * Initializes library plugins and event handlers for
 * edit, delete, selecting files for use.
 */
Lrn.Widget.FileTool.prototype.initLibrary = function(){
    var controller = this;

    // change the width/height values in our instructions to reflect the
    // image size that we're looking for.
    $('#library-buttonbar .instruction .cropWidth').html(this.config.cropWidth);
    $('#library-buttonbar .instruction .cropHeight').html(this.config.cropHeight);

    if(this.config.config.fixedSize){
    	$('button.select').unbind('click');
    	$('button.select').each(function(i,el){
    		$(el).attr('disabled', 'disabled').addClass('disabled');
    	})
    }else{
    	
		$('button.select').live('click', function(e){
			e.preventDefault();
	
			controller.selectedFileId = $(this).data('id');
			controller.selectedFileImg = $(this).data('source');
			controller.selectedFileAlt = $(this).data('filename');
			controller.selectedFileSource = $(this).data('source');
			controller.selectedFileTitle = $(this).data('title');

			// Lrn.Application.Carousel.initImageChange(controller.selectedFileImg);

			$('#fileTool').dialog('close');
		});
    }
    // clear the cropTargets so that when we reset the
    // jcrops, they start in a clean list.
    controller.cropTargets = [];
    
    // make the library items expandable
    $('.expandable').each(function(index,element){
        // init inline editing of title
        controller.initInlineEdit(element);
        
        
        // for the edit button, show expanded content when clicked
        // $(element).find('.edit').on('click', function(e){
        //     e.preventDefault();
        //     $(element).find('.expanded-content').slideToggle();
        //     $element = $(element);
        //     var ogHeight = $('.cropTarget',$element).height();
        //     var ogWidth = $('.cropTarget',$element).width();
           
        //     if(ogHeight > 400) {
        //         var y = 400;
        //         var x = Math.round(y*ogWidth/ogHeight);

        //         $('.cropTarget',$element).css({'width': x + 'px', 'height': y + 'px'});
        //         $('.jcrop-holder',$element).css({'width': x + 'px', 'height': y + 'px'});
        //         $('.jcrop-tracker',$element).css({'width': x+4 + 'px', 'height': y+4 + 'px'});//*/
        //         controller.cropScale = 400/ogHeight;

        //     } else if (ogWidth > 400) {
        //         var a = 400;
        //         var b = Math.round(a*ogHeight/ogWidth);

        //         $('.cropTarget',$element).css({'width': a + 'px', 'height': b + 'px'});
        //         $('.jcrop-holder',$element).css({'width': a + 'px', 'height': b + 'px'});
        //         $('.jcrop-tracker',$element).css({'width': a+4 + 'px', 'height': b+4 + 'px'});//*/
        //         controller.cropScale = 400/ogWidth;
        //     }
        //     var highlight = $(element).find('.jcrop-holder > div:first-child > div:first-child > img');
        //     highlight.width(Math.round(highlight.width()*controller.cropScale));
        // 	highlight.height(Math.round(highlight.height()*controller.cropScale));

        // 	// get each editing area and add cropper to this areas crop target
        //     $('.editingArea',$(element)).each(function(index, area){
        //         // initialize the cropping functionality
        //         controller.initCropping(index, area);
        //     });
        // });
        
        // for the select button, store this file id and return it
        // to the admin form where the file tool was launched.
//        $(element).find('.select').on('click', function(e){
//            e.preventDefault();
//            controller.selectedFileId = $(element).data('file-id');
//            var img = $(element).find('.preview img');
//            controller.selectedFileImg = img.attr('src');
//            controller.selectedFileAlt = img.attr('alt');
//            controller.selectedFileSource = img.attr('filesource');
//            controller.selectedFileTitle = img.attr('title');
//
//            $('#fileTool').dialog('close');
//        });
        
        // the delete button for this item adds this items ID into
        // the delete list, then immediately runs the delete method.
        // this ensures that only this item is deleted.
        $(element).find('.delete').on('click', function(e){
        	if (confirm('Are you sure you want to delete this file?')) {
	              var fileId = $(element).data('file-id');
	              var fileSrc = $(element).find('.preview img').attr('src');
	              if(controller.config.configType == 'vid')
	              	var fileSrc = $(element).find('.preview img').attr('alt');
	              controller.deleteList = {};
	              controller.deleteList[fileId] = fileSrc;
	              controller.deleteFiles();        	              
	          }
        });
        
        // when the items checkbox is changed, we want to add this file ID
        // to our delete list. The selectAll delete button will fire the
        // delete method, ensuring that any checked items will all be deleted.
        $(element).find('.toggle').on('change', function(e){
            var fileId = $(element).data('file-id');
            var fileSrc = $(element).find('.preview img').attr('src');
            if($(this).prop('checked')) controller.deleteList[fileId] = fileSrc;
            else delete controller.deleteList[fileId];
            
        });
        
        // check the dimensions of the file. If they are smaller or larger
        // than the recommended size, let the user know.
        controller.checkDimensions(element);
    });
    
    // event handler for bulk selecting/deleting. [un]checks checkboxes
    // and adds or removes the file ID from the delete list.
    $('#library-buttonbar .toggle').on('change', function(e){
        $('.expandable .collapsed-content .toggle')
            .prop('checked', $(this).prop('checked'))
            .attr('checked', $(this).attr('checked'));
        
        // if checking, add fileIDs to delete list
        // else remove from list. Do an entire loop every time.
        if($(this).prop('checked')){
            $('.expandable').each(function(idx, el){
                var fileId = $(el).data('file-id');
                var fileSrc = $(el).find('.preview img').attr('src');
                controller.deleteList[fileId] = fileSrc;
            });
        }
        else controller.deleteList = {};
    });
    
    // when the select all delete button is clicked, just run
    // the delete method. The list of files to delete is already set.
    $('#library-buttonbar .selectAllBar .delete').on('click', function(e){
        e.preventDefault();
        // only delete if there is something to delete
        if(!isEmpty(controller.deleteList)) controller.deleteFiles();
    });
    
    setTimeout(function() {
    	if($('#video_progress') != undefined && $('#video_progress').val() != undefined && $('#video_progress').val() < 100){
            $('#fileTool').tabs('select',0);
            $('#fileTool').tabs('select',1);
        }
    }, 4000);
//    var myCounter;
//    myCounter = setInterval(function() {
//        if($('#video_progress') != undefined && $('#video_progress').val() != undefined && $('#video_progress').val() < 100){
//	        $('#fileTool').tabs('select',0);
//	        $('#fileTool').tabs('select',1);
//        } else
//        	clearInterval(myCounter);
//    }, 15000);
};

/**
 * --- INIT CROPPING ---
 * @param index
 * @param element
 */
Lrn.Widget.FileTool.prototype.initCropping = function(index, area){
    var controller = this;
    
    // the width/height to crop to, from .editingArea data-attributes
    var cropWidth = controller.config.cropWidth/this.cropScale;
    var cropHeight = controller.config.cropHeight/this.cropScale;

    // the parameters element (used to make sure preview fits)
//    var cropParams = $(area).find('.cropParams');
    // the preview wrapper
    var previewWrapper = $(area).find('.cropPreviewWrapper');
    // the aspect ratio for crop tool, and for sizing the preview
    var aspectRatio = (cropWidth / cropHeight);
    
    // image is wider than tall, fit the width, and size the
    // height according to the aspect ratio of the crop
    if(aspectRatio >= 1){
        $(previewWrapper).css({
            width: controller.config.previewWidth + 'px',
            height: (controller.config.previewHeight/aspectRatio) + 'px'
        });
    }
    // else image is taller than wide, so fix the height
    // to be 250, and whatever width according to aspect ratio of crop
    else {
        $(previewWrapper).css({
            width: (controller.config.previewWidth*aspectRatio) + 'px',
            height: controller.config.previewHeight + 'px'
        });
    }
    
    // get the crop target for THIS editing area then apply jcrop to it.
    var target = $(area).find('.cropTarget')[0];
    var updateCoords = function(coords){
    	/*
    	coords.x /= controller.cropScale;
    	coords.y /= controller.cropScale;
    	coords.x2 /= controller.cropScale;
    	coords.y2 /=  controller.cropScale;//*/
//    	var highlight = $(area).find('.jcrop-holder > div:first-child > div:first-child > img');
/*    	highlight.css('left',Math.round(parseInt(highlight.css('left'))*controller.cropScale)+'px');
    	highlight.css('top',Math.round(parseInt(highlight.css('top'))*controller.cropScale)+'px');
//*/    	
        controller.updatePreview({ coords: coords, target: target });
    }.bind(this);
    
    $(target).Jcrop({
        onSelect: updateCoords,
        onChange: updateCoords,
        // use boxWidth and boxHeight to support really big images
        boxWidth: controller.config.targetWidth,
        boxHeight: controller.config.targetheight,
        aspectRatio: aspectRatio,
        setSelect: [
            (target.width/4),
            (target.height/4),
            (target.width/4)*2,
            (target.height/4)*2
        ]
         // var g = y/ogHeight;
    });
    // add this cropper to the list of cropTargets so
    // that when we close the dialog, we can clear jcrops
    controller.cropTargets.push($(target));
    
    // event handler for showing 'save crop as' form
    $(area).find('.saveCropAsLink').on('click', function(e){
        e.preventDefault();
        $(area).find('.cropReplaceBtn').attr('disabled', 'disabled').addClass('disabled');
        $(area).find('.cropAsForm').slideDown();
    });
    
    // event for closing/canceling 'save crop as' form
    $(area).find('.cancel').on('click', function(e){
        e.preventDefault();
        // clear the value so that the crop method doesn't
        // think user wants to save as a new image.
        $(area).find('.saveCropAs').val('');
        $(area).find('.cropReplaceBtn').removeAttr('disabled').removeClass('disabled');
        $(area).find('.cropAsForm').slideUp();
    });
    
    // event handler for crop button within this editable area
    $(area).find('.cropForm').on('submit', function(e){
        e.preventDefault();
        // make ajax call to submit crop info
        if(controller.ajax != null)
    		controller.ajax.abort();
        controller.ajax = $.ajax({
            url: $(this).attr('action'),
            type: $(this).attr('method'),
            data: $(this).serialize(),
            success: function(response){
                // reload the library to show the new file list
                $('#fileTool').tabs('load',1);
            },
            error: function(response){
                alert('There was a problem sending crop info.');
            }
        });
    });

    // this.scaleImages();
};

Lrn.Widget.FileTool.prototype.cropScale = 1;
Lrn.Widget.FileTool.prototype.ajax = null;

/**
 * --- INIT INLINE EDITING ---
 * The title of the file can be changed via an inline
 * editor. It is basically a single field that acts as
 * a mini-form. When focused, the user can edit the text.
 * When de-focused (blured), the form submits to update the value.
 * @param element
 */
Lrn.Widget.FileTool.prototype.initInlineEdit = function(element){
	var controller = this;
	var initInlineEditCB = function(e){
	    // if no value, placeholder will display ("Enter a title...")
	    // and we need to show as an error.
	    if($(this).val() == ''){
	        $(this).addClass('inline-error');
	    }
	    else {
	        // change style back to default, make readonly.
	        $(this).removeClass('inline-error');
	        $(this).addClass('inline-hide');
	        $(this).prop('readonly', true);
	        
	        // hide the tab panel while loading
	        $('#fileTool #tabCurtain').fadeIn();
	        
	        // if changed, send to be updated.
	        if($(this).val() != $(this).data('origValue')){
	        	if(controller.ajax != null)
	        		controller.ajax.abort();
	            controller.ajax = $.ajax({
	                url: '/files/update',
	                type: 'POST',
	                data: {
	                    fileId: $(element).data('file-id'),
	                    fileTitle: $(this).val(),
	                    doRename: true
	                },
	                success: function(response){
	                    $('#fileTool').tabs('load',1);
	                },
	                error: function(response){
	                    alert('There was a problem changing the title.');
	                }
	            });
	        }
	    }
	};
    $(element).find('.inline').on({
        focus: function(e){
            $(this).data('origValue', $(this).val());
            $(this).removeClass('inline-hide');
            $(this).prop('readonly', false);
        },
        blur: initInlineEditCB,
        keydown: function (e) {
        	if(e.which === 13){
        		e.preventDefault();
        		initInlineEditCB.call(this,e);	
        	}
        }
    });
    
};


/**
 * --- OPEN DIALOG ---
 * Opens the dialog for the file tool. Put the method here
 * so that we can just call it from our admin without knowing
 * what the fileTool HTML element is called.
 */
Lrn.Widget.FileTool.prototype.open = function(){
    $('#fileTool').dialog('open');
    this.initFileUpload();
};

/**
 *  --- UPDATE CONFIGS ---
 * @param config
 */
Lrn.Widget.FileTool.prototype.updateConfigs = function(config){
    // if any config values are passed in, override defaults
    if(config) for(var c in config) this.config[c] = config[c];
    this.config.setConfig(this.config.configType);
    this.config.config.fixedSize = this.config.fixedSize;
};

/**
 * --- UPDATE PREVIEW ---
 * A DRY method to update the associated crop preview element
 * we're using params instead of multiple arguments so that we can
 * add and remove parameters without changing the method signature. 
 * @param params
 */
Lrn.Widget.FileTool.prototype.updatePreview = function(params){
    // we need to get the preview elements, and the elements for
    // storing the cropping parameters for submission to PHP.
    // we can find the correct ones by traversing DOM from target.
    var cropParams = $(params.target).siblings('.cropParams');
    var previewWrapper = cropParams.find('.cropPreviewWrapper');
    var preview = previewWrapper.find('.cropPreview');
    
    // make sure that we are taking the w/h of the preview area
    // into consideration when we are adjusting the preview image.
    var rx = previewWrapper.width()/params.coords.w;
    var ry = previewWrapper.height()/params.coords.h;
    
    // adjust the preview element to show exactly what we are cropping
    preview.css({
        width: Math.round(rx * $(params.target).width()) + 'px',
        height: Math.round(ry * $(params.target).height()) + 'px',
        marginLeft: '-' + Math.round(rx * params.coords.x) + 'px',
        marginTop: '-' + Math.round(ry * params.coords.y) + 'px'
    });
    
    // store the parameters of the crop for submission to PHP
    cropParams.find('[name="x"]').val(Math.round(params.coords.x/this.cropScale));
    cropParams.find('[name="y"]').val(Math.round(params.coords.y/this.cropScale));
    cropParams.find('[name="x2"]').val(Math.round(params.coords.x2/this.cropScale));
    cropParams.find('[name="y2"]').val(Math.round(params.coords.y2/this.cropScale));
    cropParams.find('[name="w"]').val(Math.round(params.coords.w/this.cropScale));
    cropParams.find('[name="h"]').val(Math.round(params.coords.h/this.cropScale));
    cropParams.find('[name="cropWidth"]').val(this.config.cropWidth);
    cropParams.find('[name="cropHeight"]').val(this.config.cropHeight);
};

/**
 * --- DELETE FILES ---
 * Passes the list of files to delete to the server,
 * making only one call to delete instead of one for each.
 */
Lrn.Widget.FileTool.prototype.deleteFiles = function(){
    var controller = this;
    if(controller.ajax != null)
		controller.ajax.abort();
    controller.ajax = $.ajax({
        url: '/files/delete',
        data: { deleteList: controller.deleteList },
        type: 'POST',
        dataType: 'json',
        success: function(response){
        	$.each(response, function( index, value ) {
        		if(value != null && value.inUse == 'Yes'){ 
        			$("#messageModal").html('<p class="messageModalText"><i class="icon-warning"></i>File: ' + value.customFileDTO.title + ' is in use. It cannot be deleted while In use.</p>');
        			$("#messageModal").dialog({
            		   resizable: false,
            		   width : 200,
            		   height : 200,
            		   closeOnEscape: false,
            		   open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
            		   $(".ui-dialog-titlebar", ui.dialog).hide();}
            		});
        			if ($("#messageModal").is(':data(dialog)')){
		            	setTimeout(function(){
		            		$("#messageModal").dialog("close");
		            	}, 4000);
            		}
       		}
       	});
        	
            // reload the library to show the new file list
            $('#fileTool').tabs('load',1);
            controller.deleteList = {};
        },
        error: function(){
            alert('There was an error deleting files.');
        }
    });
};

/**
 * --- CHECK DIMENSIONS ---
 * Checks the dimensions that we are asking for, and those of the 
 * file being listed. Notifies the user on what is possible.
 * @param element
 */
Lrn.Widget.FileTool.prototype.checkDimensions = function(element){
    var controller = this;
    if($(element).find('.dimensions').html().trim() != ''){
	    // get image size information, both current size, and required sizes
	    var currentSize = $(element).find('.dimensions').html().split(' x ');
	    var currentWidth = currentSize[0];
	    var currentHeight = currentSize[1];
	    var reqWidth = controller.config.cropWidth;
	    var reqHeight = controller.config.cropHeight;
	    
	    // find out if the image is too wide, too tall, or perfect
	    var isWide = currentWidth > reqWidth;
	    var isTall = currentHeight > reqHeight;
	    var isPerfect = currentWidth == reqWidth && currentHeight == reqHeight;
	    
	    // if it's not perfect, generate a message for the user.
	    if(!isPerfect){
	        var message = 'This file is';
	        if(isWide && isTall) message += ' larger than recommended, but can easily be cropped to fit.';
	        if(isWide && !isTall) message += ' not tall enough and may not look good, even if cropped.';
	        if(!isWide && isTall) message += ' not wide enough and may not look good, even if cropped.';
	        if(!isWide && !isTall) message += ' not big enough and will not look good here.';
	        
	        if(!isWide || !isTall) $(element).find('.dimensions').css('color', '#F00');
	        $(element).find('.collapsed-content').append(
	            '<p class="error ui-corner-all"><i class="icon-warning" style="color: red;"></i>' + message + '</p>'
	        );
	    }
    }
};

/**
 * --- MAKE LARGE IMAGES SCALABLE ---
 * Checks dimensions of images and scales them down to a more
 * resonable size for viewing and editing
 */
// Lrn.Widget.FileTool.prototpe.scaleImages = function() {
    

    
// };
