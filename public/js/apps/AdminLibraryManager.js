if(typeof(Lrn) == 'undefined') Lrn = {};
if(typeof(Lrn.Application) == 'undefined') Lrn.Application = {};
Lrn.Application.adminLibManager = {};

Lrn.Application.adminLibManager = function(baseUrl)
{
	this.filesRecords = [];
	this.baseUrl = baseUrl;
    this.htmlTableId = '#fileList';
    this.htmlFrameTableId = '#dynamic';
    this.fileToolDialogId = '#fileTool';
    this.uploadFormId = '#fileupload';
    this.fileType = '';
    this.placeholderTagText = "Click to add/edit a tag. Separate tags with space.";
    this.htmlTabId = "#fileLibrary";
    this.hideFilter = false;
    this.cropHeight = null;
    this.cropWidth = null;
    this.fixedSize = false;
    this.video_progressSet = 'No';
    
    //toStore the dataTableObject
    this.oTable = null;
};

/**
 * overriding methods from Lrn.Application.
 */
Lrn.Application.adminLibManager.prototype = new Lrn.Application();
Lrn.Application.adminLibManager.prototype.superclass = Lrn.Application.prototype;

Lrn.Application.adminLibManager.prototype.init = function(frameTableId){
    // before we extend the superclass init method, 
    // we call the init method of the superclass (Application.js)
	this.superclass.init.apply(this);

	//enable tabs
	$(this.htmlTabId).tabs({ 
		select: (function(event, ui){
			selectedTabTitle = $(ui.tab).text();
			if ('Library' == selectedTabTitle){
				this.video_progressSet = 'No';
				this.fileLibLoad(this.htmlTableId, this.fileType);
			}
		}).bind(this)
	});
	
	this.renderFileTable(this.htmlFrameTableId, this.htmlTableId);
	
	//move the filter to specific place under dataTable
	$('#fileFilter').insertAfter(this.htmlTableId +'_filter');
	if (true == this.hideFilter){
		$('#fileFilter').hide();
	}
	
	//make filter clickable
	this.fileClick();
	
	//enable the click delete buttton
    $('.delete.adminRedBtn"').live('click', {libObj:this}, function(e){
    	if(confirm('Are you sure you want to delete this file?')){              
    		e.data.libObj.deleteFile($(this).data('id'), $(this).data('source'), $(this).data('title'), this);
        }
    });
    
    // event handler for showing 'save crop as' form
    $('.saveCropAsLink').live('click', function(e){
        e.preventDefault();

        $('.cropReplaceBtn').attr('disabled', 'disabled').addClass('disabled');
        $('.cropAsForm').slideDown();
    });
    
    //submit crop
    $('.cropForm').live('submit', {libObj:this},function(e){
        e.preventDefault();

        $.ajax({
            url: $(this).attr('action'),
            type: $(this).attr('method'),
            data: $(this).serialize(),
            success: function(response){
                // reload the library to show the new file list
            	e.data.libObj.video_progressSet = 'No';
            	e.data.libObj.fileLibLoad(e.data.libObj.htmlTableId, e.data.libObj.fileType);
            },
            error: function(response){
            	e.data.libObj.displayAlert('error.png', 'There was a problem sending crop info.');
            	e.data.libObj.closeAlert(1000);
            }
        });
        
        return false;
    });
    
    //setup uploading status to false
    $(this.uploadFormId).data('uploading', false);
}

Lrn.Application.adminLibManager.prototype.renderFileTable = function(dynamicDiv, dataTableId){
	var tableId = dataTableId.replace(/[#]/g,'');
	
	$(dynamicDiv).html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="' +tableId+ '"></table>');
		
		//building column header
		var aoColumns = new Array();

		aoColumns = $.merge(aoColumns , [
						{"mData": null, "sTitle": "", "bSortable": false, "sClass": "libImg"},
						{"mData": "title", "sTitle": "Title", "bSortable": true, "sClass": "libTitle"},
		       			{"mData": function(source, type, val){
			       				if (type === 'set') {
			                        source.tags = val;
			       				}
			       				if (null == source.tags){
			       					return '';
			       				}
			       				return source.tags;
		       				},"sTitle": "Tags", "bSortable": true, "sClass": "libTag"},
		    			{"mData": function(source, type, val){
		    					if('image' == source.fileTypeName){
		    						return source.width+ ' X ' +source.height;
		    					}else{
		    						return '';
		    					}
		    					
		    				},"sTitle": "Dimensions", "bSortable": true, "sClass": "libDim"},
		    			{"mData": null,"sTitle": "", "bSortable": false, "sClass": "libControl"}
		    		]);
		
		//render the dataTable
		this.oTable = $(dataTableId).dataTable({
			"aaData": null,
			"sPaginationType": "full_numbers",
			"oLanguage": {
				"sZeroRecords": "No files to display"
				},
			"aoColumns": aoColumns,
			"fnRowCallback": (this.modifyDTRow).bind(this),
			"fnDrawCallback": function(oSettings){
				$(dataTableId+ '_previous').attr("class", "paginate_enabled_previous");
				$(dataTableId+ '_next').attr("class", "paginate_enabled_next");
				$(dataTableId+ '_paginate > span').attr("style", "float:left");
				
				var l = Math.ceil(oSettings.aoData.length/oSettings._iDisplayLength);
				var page = Math.ceil(oSettings._iDisplayStart/oSettings._iDisplayLength);

				if(page === 0 &&  l <= 0){
					$(dataTableId +'_paginate').hide();
					$(dataTableId+ '_previous').attr("class", "paginate_disabled_previous");
					$(dataTableId+ '_next').attr("class", "paginate_disabled_next");
				}else if(page === 0){
					$(dataTableId+ '_previous').attr("class", "paginate_disabled_previous");
					if(page === l-1){
						$(dataTableId+ '_next').attr("class", "paginate_disabled_next");
					}
					
					$(dataTableId +'_paginate').show();
				}else if(page === l-1){
					$(dataTableId+ '_next').attr("class", "paginate_disabled_next");
					$(dataTableId +'_paginate').show();
				}else{
					$(dataTableId +'_paginate').show();
				}

				// if the image is really tall we want to make the height
				// fit in the wrapper and let the width adjust automatically
				$('.previewImgWrapper > img').each(function(idx,el){
        			var img = $(el);
	        		img.on('load',function(evt){
		        		if(img.height()*1 > img.width()*1){
		        			img.css({'height':'100%'});
		        			img.css({'width':'auto'});
		        		}
		        	});
        		});
				
				
			    //render the tags editor
				$('.tagsText').editable(function(value, settings){
					if (value != settings.submitdata.libObj.placeholderTagText){
						var removeDublicationStatus = false;
						var tempArr = value.split(/[\s;]+/);
						var singleValueArr = [];
						
						//remove dublicate tag keyword
						$.each(tempArr, function(i, el){
						    if($.inArray(el, singleValueArr) === -1){
						    	singleValueArr.push(el);
						    }else{
						    	removeDublicationStatus = true;
						    }
						});
						
						var formatValue = singleValueArr.join(";");
						var status = true;
						var aDataIndex = $(this).data('index');
						
						if (true == removeDublicationStatus){
							settings.submitdata.libObj.displayAlert('ajax-loader.gif', 'Duplicate tag has been removed');
							settings.submitdata.libObj.closeAlert(1500);
						}
						
						//Display loading spinner
						settings.submitdata.libObj.displayAlert('ajax-loader.gif','Saving');
						
						$.ajax({
					        url: "/files/updatecustomtags",
					        type: "post",
					        data: {id:$(this).data('fileid'), tagText:formatValue},
					        dataType: "json",
					        timeout: 10000,
					        async: false,
					        success:function(response){
					        	if(false == response.success){
					        		status = false;
					        		if("" != response.errorMessage){
					        			settings.submitdata.libObj.displayAlert('error.png', response.errorMessage);
					        		}else{
					        			settings.submitdata.libObj.displayAlert('error.png', 'Couldn\'t update the tag!');
					        		}
					        	}else{
					        		settings.submitdata.libObj.displayAlert('done.jpg', 'Saved');
					        	}
				        		
				        		settings.submitdata.libObj.closeAlert(2000);
//				        		console.log("Progres"+$('#video_progress').val());
//				        		var thisObj = settings.submitdata.libObj;
//				            	var callMethod = function()
//				                {   console.log('In call method');
//				                	console.log($('#video_progress').val());
//				                	if(parseInt($('#video_progress').val())<100)
//				                		console.log('less than 100')
//				            		if($('#video_progress') != undefined && $('#video_progress').val() != undefined && parseInt($('#video_progress').val()) < 100){
//				            			console.log('In call method');
//				            			thisObj.refreshTab(1);
//				                    }
//				                }
//				            	
//				            	setTimeout(callMethod, 15000);
					        },
					        error: (function(jqXHR, textStatus, errorThrown){
					        	if ('timeout' === textStatus){
					        		this.displayAlert('error.png', 'Connection Timeout!');
					        	}else{
					        		this.displayAlert('error.png', 'Connection Failed!');
					        	}
					        	this.closeAlert(1000);
					        	
					        }).bind(settings.submitdata.libObj)
					    });
						
						if(false != status){
							if ("" == formatValue){
								$(this).addClass('gray');
							}else{
								//remove the gray class
								$(this).removeClass('gray');
							}
							
							//update the dataTable data record for search to work right away after the tag update
							settings.submitdata.libObj.video_progressSet = 'No';
							settings.submitdata.libObj.oTable.fnUpdate(formatValue, aDataIndex, 2, true, false);
						}
					}
					
					if(false != status){
						return escapeHtml(value);
					}
				},{
			    	type    : 'textarea',
			    	resize  : 'none',
			    	event	: 'click',
			    	rows    : 3,
			    	height	: 'none',
			    	width   : '170px',
			    	onblur  : 'submit',
			    	submitdata : {libObj: this},
			    	data 	: function(value, settings) {
			    		var text = "";
			    		if (value != settings.submitdata.libObj.placeholderTagText){
			    			text = value;
			    		}
						return text;
			    	}
			    });
				
				//make sure the key on tag edit will treat as the save
				$(document).off("keypress");
				$('.tagsText').find('textarea').live('keypress', function(e){
					if(e.which == 13){
						e.preventDefault();
						$(this).submit();	
					}
				});
				
				if(this.fixedSize){
					var filetool = $('#fileTool');
					var fl = filetool.length;
	            	$('button.select').each(function(i,el){
	            		$el = $(el);
	            		var dims = $($el.parents('tr').children()[3]).text().split('X');
	            		if(parseInt(dims[0],10) !== this.cropWidth || parseInt(dims[1],10) !== this.cropHeight){
	                		$el.unbind('click');
	                		$el.attr('disabled', 'disabled').addClass('disabled');
	            		}else {
	            			$el.on('click',function(e){
	            				e.preventDefault();
	            				
	            				Lrn.Widgets.FileTool.selectedFileId = $(this).data('id');
	            				Lrn.Widgets.FileTool.selectedFileImg = $(this).data('source');
	            				Lrn.Widgets.FileTool.selectedFileAlt = $(this).data('filename');
	            				Lrn.Widgets.FileTool.selectedFileSource = $(this).data('source');
	            				Lrn.Widgets.FileTool.selectedFileTitle = $(this).data('title');
	            				
	            				filetool.dialog('close');
	            			})
	            		}
	            	}.bind(this))
	            }
				//expend the editor click
			    $('.edit:not(.disabled)').on('click', {libObj:this}, function (e) {

			        var nTr = $(this).parents('tr')[0];
			        if (e.data.libObj.oTable.fnIsOpen(nTr)){
			        	$(this).html('Edit');
			        	e.data.libObj.oTable.fnClose(nTr);
			        }else{
			        	$(this).html('Cancel');
			        	
			        	e.data.libObj.oTable.fnOpen(nTr, e.data.libObj.expendEditor(e.data.libObj.oTable, nTr), 'details');
			        	
			        	//render the crop
			        	e.data.libObj.cropRender($(nTr).next().find('.cropTarget'), $(nTr).next());
			        }
			    } );
			    
			}.bind(this)
		});

}

Lrn.Application.adminLibManager.prototype.fileLibLoad = function(dataTableId, type)
{
	//Display loading spinner
	this.displayAlert('ajax-loader.gif','Loading');
	
	//Start ajax loading Active labels request
    request = $.ajax({
        url: "/files/filerecords",
        type: "post",
        data: {type:type},
        dataType: "json",
        timeout: 10000,
        async: false,
        success: (function(response){
        	this.dynamicLoad(dataTableId, response);
        	
        	if("underfined" != typeof response.fileCount){
        		this.updateFilterDisplay(response.fileCount);
        	}
        	
        	//closing the load spinner after success return by delay 1000 msecond to close 
        	this.closeAlert(1000);
        	var thisObj = this;
        	var callMethod = function()
            {
        		//make sure to refresh the video transcode only on the Library tab with popup is active
        		if($('#video_progress') != undefined && $('#video_progress').val() != undefined && $('#video_progress').val() < 100 
        		   && (0 >= $(thisObj.fileToolDialogId).length || true === $(thisObj.fileToolDialogId).dialog("isOpen"))
        		   && 1 == $(thisObj.htmlTabId).tabs('option', 'active')){
        			 thisObj.refreshTab(1);
                }
            }
        	
        	if (true === $(this.uploadFormId).data('uploading') && ('video' === type || 'all' === type || '' === type)){
        		//set the uploading status back to false
        		$(this.uploadFormId).data('uploading', false);
        		setTimeout(function(){thisObj.refreshTab(1);}, 3500);
        	}else{
        		setTimeout(callMethod, 15000);
        	}
        }).bind(this),
        error: (function(jqXHR, textStatus, errorThrown){
        	//closing the load spinner when error happened
        	this.closeAlert(0);
        	
        	if ('timeout' === textStatus){
        		this.displayAlert('error.png', 'Connection Timeout!');
        	}else{
        		this.displayAlert('error.png', 'Connection Failed!');
        	}
        	this.closeAlert(1000);
        	
        }).bind(this)
    });
}

Lrn.Application.adminLibManager.prototype.dynamicLoad = function(tableId, data)
{
	var oTable = $(tableId).dataTable();
    oSettings = oTable.fnSettings();
     
    oTable.fnClearTable(this);

    for (var i in data.aaData){
    	var rowData = jQuery.extend({}, data.aaData[i]);
    	rowData.customOtherLang = '<input type="text" value="' +escapeHtml(data.aaData[i].customOtherLang)+ '" id="activeLabel' +data.aaData[i].translationKeyId+ '" class="activeLabelClass">';
    	oTable.oApi._fnAddData(oSettings, rowData);
    }

    oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
    oTable.fnDraw();
}

Lrn.Application.adminLibManager.prototype.deleteFile = function(id, source, title, deleteButton)
{
	var buildDeleteList = {};
	buildDeleteList[id] = source;

	//Start ajax loading Active labels request
    request = $.ajax({
        url: "/files/delete",
        type: "post",
        data: {deleteList: buildDeleteList},
        dataType: "json",
        timeout: 10000,
        async: false,
        success: (function(response){
        	var inUsed = false;
        	$.each(response, function( index, value ) {
        		if(value != null && true == value['inUse']){
        			inUsed = true;
        			$(deleteButton).attr("disabled", "disabled").addClass('disabled');
        			$("#messageModal").html('<p class="messageModalText"><i class="fa fa-warning"></i>File: ' + title + ' is in use - remove from Catalyst pages before deleting.</p>');
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
        	
        	if(false == inUsed){
        		this.video_progressSet = 'No';
            	this.fileLibLoad(this.htmlTableId, this.fileType);
        	}
        	

        }).bind(this),
        error: (function(jqXHR, textStatus, errorThrown){
        	//closing the load spinner when error happened
        	this.closeAlert(0);
        	
        	if ('timeout' === textStatus){
        		this.displayAlert('error.png', 'Connection Timeout!');
        	}else{
        		this.displayAlert('error.png', 'Connection Failed!');
        	}
        	this.closeAlert(1000);
        	
        }).bind(this)
    });	
}

/*
 * helper functions
 */

Lrn.Application.adminLibManager.prototype.displayAlert = function(imageName, alertText)
{
	//Display loading spinner
	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/' +imageName+ '"  width=50 height=50/></span>' +alertText+ '</p>');
	$("#messageModal").dialog({
		   resizable: false,
		   modal: true,
		   width: 150,
		   height: 150,
		   buttons: {},
		   closeOnEscape: false,
		   open: function(event, ui){
			   $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
			   $(".ui-dialog-titlebar", ui.dialog).hide();
		   },
		   close: function(event, ui){
			   $(".ui-dialog-titlebar-close", ui.dialog).show(); 
			   $(".ui-dialog-titlebar", ui.dialog).show();
		   }
	});
}

Lrn.Application.adminLibManager.prototype.closeAlert = function(delay)
{
	setTimeout(function(){
		$("#messageModal").dialog("close");
	}, delay);
}

Lrn.Application.adminLibManager.prototype.expendEditor = function fnFormatDetails (oTable, nTr)
{
    var aData = oTable.fnGetData(nTr);
    
    var path = this.baseUrl+aData.path;
    var d = new Date();
    var style = "";
    
    if (null != this.cropHeight && null != this.cropWidth){
    	var style = 'width:'+this.cropWidth+'px;height:'+this.cropHeight+'px';
    }
    
    var sOut = '<div class="expanded-content" data-width="' +aData.width+ '" data-height="' +aData.height+ '">'
        +'<h5>Select an area of your image to crop.</h5>'
        +'<p class="instruction">The preview below may not be the actual size of your image and is used for reference only.</p>'
        +'<div class="editingArea">'
            +'<form class="cropForm" action="/files/update" method="post">'
                +'<div class="cropArea">'
                    +'<img class="cropTarget" src="' +path+ '?' +d.getTime()+ '" alt="Crop target for ' +aData.fileName+ '" title="Crop target for ' +aData.fileName+ '" />'
                    +'<fieldset class="cropParams">'
                        +'<p class="instruction">This is how your image will be displayed.</p>'
                        +'<p class="cropPreviewWrapper" style="overflow:hidden;'+style+'" data-width=" '+this.cropWidth +' " data-height=" '+this.cropHeight+' ">'
                            +'<img class="cropPreview" src="' +path+ '?' +d.getTime()+ '" alt="Crop preview for ' +aData.fileName+ '" title="Crop preview for ' +aData.fileName+ '" />'
                        +'</p>'
                        +'<input type="hidden" name="doCrop" value="true" />'
                        +'<input type="hidden" name="x" />'
                        +'<input type="hidden" name="y" />'
                        +'<input type="hidden" name="x2" />'
                        +'<input type="hidden" name="y2" />'
                        +'<input type="hidden" name="w" value="' +aData.width+ '"/>'
                        +'<input type="hidden" name="h" value="' +aData.height+ '"/>'
                        +'<input type="hidden" name="cropWidth" />'
                        +'<input type="hidden" name="cropHeight" />'
                        +'<input type="hidden" name="fileId" value="' +aData.id+ '" />'
                        +'<input type="hidden" name="fileTitle" value="' +aData.title+ '" />'
                        +'<input type="hidden" name="src" value="' +path+ '" />'
                    +'</fieldset>'
                    +'<fieldset class="buttons">'
                    	+'<p class="formField">'
                    		+'<button type="submit" class="cropReplaceBtn gradient adminBlueBtn">Crop and replace</button>'
                    		+'<button type="button" class="saveCropAsLink gradient adminBlueBtn">Save crop as</button>'
                    	+'</p>'
                    +'</fieldset>'
                +'</div>'
                +'<div class="cropAsForm" style="display:none">'
                	+'<h6>Save crop as</h6>'
                	+'<p class="instruction">Save this crop as a new image instead of cropping the original</p>'
                	+'<fieldset class="buttons saveCropAsWrapper">'
                		+'<p class="formField">'
                			+'<label for="saveCropAs">Enter a new name for this crop:</label>'
                			+'<input type="text" class="saveCropAs" name="saveCropAs" style="width:150px;" />'
                			+'<button class="gradient adminBlueBtn">Crop and save</button>'
                			+'<button type="reset" class="cancel gradient adminGreyBtn">Cancel</button>'
                	   +'</p>'
                   +'</fieldset>'
               +'</div>'
           +'</form>'
       +'</div>'
    +'</div>';
     
    return sOut;
}

Lrn.Application.adminLibManager.prototype.showPreview = function(params)
{
    // we need to get the preview elements, and the elements for
    // storing the cropping parameters for submission to PHP.
    // we can find the correct ones by traversing DOM from target.
    var cropParams = $(this).find('.cropParams');
    var previewWrapper = $(this).find('.cropPreviewWrapper');
    var preview = previewWrapper.find('.cropPreview');
    var cropTargetImg = $(this).find('.cropTarget');
    var cropFolder = $(this).find('.jcrop-holder');
    
    // make sure that we are taking the w/h of the preview area
    // into consideration when we are adjusting the preview image.
    var rx = $(this).find('td > div').data('width')/cropTargetImg.width();
    var ry = $(this).find('td > div').data('height')/cropTargetImg.height();
    
    var resizeScaleX = cropFolder.width()/cropTargetImg.width();
    var resizeScaleY = cropFolder.height()/cropTargetImg.height();
    
    previewWrapper.width(params.w*resizeScaleX);
    previewWrapper.height(params.h*resizeScaleY);
    
    // adjust the preview element to show exactly what we are cropping
    preview.css({
        width: Math.round(cropFolder.width()) + 'px',
        height: Math.round(cropFolder.height()) + 'px',
        marginLeft: '-' + Math.round(params.x*resizeScaleX) + 'px',
        marginTop: '-' + Math.round(params.y*resizeScaleY) + 'px'
    });
    
    // store the parameters of the crop for submission to PHP
    cropParams.find('[name="x"]').val(Math.round(rx*params.x));
    cropParams.find('[name="y"]').val(Math.round(ry*params.y));
    cropParams.find('[name="x2"]').val(Math.round(rx*params.x2));
    cropParams.find('[name="y2"]').val(Math.round(ry*params.y2));
    cropParams.find('[name="w"]').val(Math.round(rx*params.w));
    cropParams.find('[name="h"]').val(Math.round(ry*params.h));
    
    //set the new image size to actually crop size
    cropParams.find('[name="cropWidth"]').val(Math.round(rx*params.w));
    cropParams.find('[name="cropHeight"]').val(Math.round(ry*params.h));
};

Lrn.Application.adminLibManager.prototype.updateFilterDisplay = function(filterData){
	$('#allFile').find('.number').html(filterData.total);
	$('#doc').find('.number').html(filterData.doc);
	$('#image').find('.number').html(filterData.image);
	$('#video').find('.number').html(filterData.video);
	
	var selectedType = this.fileType;

	//update the class the gray
	$('#fileFilter').find('a').each(function(){
		if (selectedType == $(this).data('type')){
            $(this).parent().addClass('gray');
		} else {
            $(this).parent().removeClass('gray');
        }
	});
}

Lrn.Application.adminLibManager.prototype.fileClick = function(){
	$('.filefilter').on('click', {libObj:this}, function(e){
		e.preventDefault();
		if (e.data.libObj.fileType != $(this).data('type')){
			e.data.libObj.fileType = $(this).data('type');
			e.data.libObj.video_progressSet = 'No';
			e.data.libObj.fileLibLoad(e.data.libObj.htmlTableId, e.data.libObj.fileType);
		}
	});
}


Lrn.Application.adminLibManager.prototype.modifyDTRow = function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
	var path = this.baseUrl+aData.path;
	var d = new Date();
	var t = d.getTime(); 
	
	/*
	 * modify the row according the desired view
	 */
	
	var progressHTML = '';
	var editTooltip = 'Tip: Videos, Word documents and PDFs cannot be edited. The Edit button will be disabled for these file types.';
	var deleteTooltip = '';
	if (1 == aData.inUse){
		deleteTooltip = 'Tip: This file is in use. You must remove from Catalyst pages before deleting.';
	}	
	
	$(nRow).find('td:nth-child(5)').html('<button class="gradient delete ' +(1 == aData.inUse ? 'disabled':'adminRedBtn')+ '" data-id="' +aData.id+ '" data-source="' +path+ '" data-title="' +aData.title+ '" title="' +deleteTooltip+ '" ' +(1 == aData.inUse ? 'disabled':'')+ '>Delete</button>');
	
	if('image' == aData.fileTypeName){
		$(nRow).find('td:nth-child(1)').html('<div class="previewImgWrapper"><img src="' +path+'?'+t+ '" /></div>');
		$(nRow).find('td:nth-child(4)').html(aData.width+ ' X ' +aData.height);

		var disabled = this.cropWidth === aData.width && this.cropHeight === aData.height ? '' : ' disabled'
		$(nRow).find('td:nth-child(5)').html('<button class="gradient edit adminBlueBtn">Edit</button> '+$(nRow).find('td:nth-child(5)').first().html());
	}else if('doc' == aData.fileTypeName){
		if ('pdf' == aData.fileName.split(".").pop().toLowerCase()){
			$(nRow).find('td:nth-child(1)').html('<img src="' +CDN_IMG_URL+ '/images/icons/PDF-Icon.jpg" width="80" />');
		}else{
			$(nRow).find('td:nth-child(1)').html('<img src="' +CDN_IMG_URL+ '/images/icons/WordDocIcon.jpg" width="80" />');
		}
		
		$(nRow).find('td:nth-child(5)').html('<button class="gradient edit adminBlueBtn disabled" disabled title="' +editTooltip+ '">Edit</button> ' +$(nRow).find('td:nth-child(5)').html());
	}else if('video' == aData.fileTypeName){
		if(aData.transcodeStatus != undefined){
			var progressClass = (aData.statusStep == 'Done') ? 'imgNotificationMsg':'imgErrorMsg';
			progressHTML = '<div class="'+ progressClass +'">'
							+'<p>'
							+ aData.transcodeStatus
							+'</p>';
			if(aData.progress >= 0 && aData.progress < 100) {
				progressHTML = progressHTML + '<span class="totalPercentage titleBarBtnFgColor borders">'
							 + '<span class="PercentageDone titleBarBtnBgColor" style="width: '+ aData.progress + '%;"></span><span class="completionNum contentTextIcons">'+ aData.progress +'%</span>'
							 + '</span>';
				if(this.video_progressSet == 'No'){
					progressHTML = progressHTML + '<input type="hidden" value="'+aData.progress+'" id="video_progress"/>';
					this.video_progressSet = 'Yes';
				}
			}
		}
		
		var filePartArr = aData.path.split(".");
		var nameStr = aData.path;
		var n = nameStr.search(".mp4");
		var p = nameStr.search(".webm");
		var path = '';
		if(n >=0 || p >= 0){
			path = filePartArr[filePartArr.length-2]+ '-00002.jpg';
		} else {
			path = aData.path;
		}
		var src = this.baseUrl+path;
		var img = new Image();
		img.src = src;
		img.onerror = function() {
			img.src = CDN_IMG_URL + '/images/samples/defaultModuleImage.jpg';
			img.onload = null;
			img.onerror = null;
			var imgCtr = $(nRow).find('td:nth-child(1)').find('img');
			imgCtr.attr('src', img.src);

			delete img;
		};
		img.onload = function() {
			delete img;
		};	
		$(nRow).find('td:nth-child(1)').html('<img src="' +src + '" width="80" />');
		$(nRow).find('td:nth-child(5)').html('<button class="edit adminBlueBtn disabled" disabled title="' +editTooltip+ '">Edit</button> ' +$(nRow).find('td:nth-child(5)').html());
	}else{
		$(nRow).find('td:nth-child(1)').html('<img src="' +path+ '" width="100" />');
		$(nRow).find('td:nth-child(5)').html('<button class="edit adminBlueBtn disabled" disabled title="' +editTooltip+ '">Edit</button> ' +$(nRow).find('td:nth-child(5)').html());
	}
	
	//put the edit and delete button in place

	$(nRow).find('td:nth-child(5)').html('<p class="controls">' +$(nRow).find('td:nth-child(5)').html()+ progressHTML + '</p>');
	
	//build out the tag column
	var tags = this.placeholderTagText;
	var grayClass = "";
	var tTip = "Tip: You may enter a distinct tag only once. The second will be removed."
	
	if(null != aData.tags && "" !=  aData.tags && "undefined" != typeof aData.tags){
		tags = aData.tags;
	}else{
		grayClass = "gray";
	}
	
	$(nRow).find('td:nth-child(3)').html('<div class="tagsText ' +grayClass+ '" data-fileid="' +aData.id+ '" title="' + tTip + '" data-index="' +aData.order+ '">' +escapeHtml(tags.replace(/;/g, '; '))+ '</div>');

	return nRow;
}

Lrn.Application.adminLibManager.prototype.cropRender = function(renderObj, row){
	$(renderObj).Jcrop({
        boxWidth: 450,
        boxHeight: 400, 
        onSelect: (this.showPreview).bind($(row)),
        onChange: (this.showPreview).bind($(row)),
        setSelect: [0, 0, 100, 50],
	});
}

Lrn.Application.adminLibManager.prototype.setCropHeightWidth = function(height, width)
{
	this.cropHeight = height;
	this.cropWidth = width;
}

Lrn.Application.adminLibManager.prototype.refreshTab = function(tabNum)
{
	if(tabNum == 1){
		this.video_progressSet = 'No';
		this.fileLibLoad(this.htmlTableId, this.fileType);
	}else{
		$(this.htmlTabId).tabs({active:tabNum});
	}
}
