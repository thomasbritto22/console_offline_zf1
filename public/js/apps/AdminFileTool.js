if(typeof(Lrn) == 'undefined') Lrn = {};
if(typeof(Lrn.Application) == 'undefined') Lrn.Application = {};
Lrn.Application.fileTool = {};

Lrn.Application.fileTool = function(baseUrl)
{
	this.baseUrl = baseUrl;
	this.htmlFrameTableId = '#dynamicFileList';
	this.hideFilter = true;
	this.video_progressSet = 'No';
};

Lrn.Application.fileTool.prototype = new Lrn.Application.adminLibManager();
Lrn.Application.fileTool.prototype.parent = Lrn.Application.adminLibManager;

//override the modifyDTRow function
Lrn.Application.fileTool.prototype.modifyDTRow = function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
	var path = this.baseUrl+aData.path;
	var d = new Date();
	var t = d.getTime();
	var img = new Image();
	/*
	 * modify the row according the desired view
	 */
	var disable = "";
	var selectToolTip = "";
	var editTooltip = 'Tip: Videos, Word documents and PDFs cannot be edited. The Edit button will be disabled for these file types.';
	var progressHTML = '';
	var deleteTooltip = '';
	if (1 == aData.inUse){
		deleteTooltip = 'Tip: This file is in use. You must remove from Catalyst pages before deleting.';
	}
	
//	if ('image' == this.fileType && (this.cropHeight != aData.height || this.cropWidth != aData.width)){
//		disable = "disabled";
//		selectToolTip = "Tip: Only images that are the exact dimension can be selected. If it is not, then the Select button is disabled. Images can be edited to fit by clicking the Edit button.";
//	}
	
	$(nRow).find('td:nth-child(5)').html('<button class="gradient select adminBlueBtn ' +disable+ '" data-id="' +aData.id+ '" data-source="' +path+ '" data-title="' +aData.title+ '" data-filename="' +aData.fileName+ '" ' +disable+ ' title="' +selectToolTip+ '">Select</button> '+
			                             '<button class="gradient delete ' +(1 == aData.inUse ? 'disabled':'adminRedBtn')+ '" data-id="' +aData.id+ '" data-source="' +path+ '"  data-title="' +aData.title+ '" title="' +deleteTooltip+ '" ' +(1 == aData.inUse ? 'disabled':'')+ '>Delete</button>');
	
	if('image' == aData.fileTypeName){
		img.src = path+'?'+t;
		$(nRow).find('td:nth-child(1)').html('<div class="previewImgWrapper"><img id="image'+aData.id+'" src="' +path+'?'+t+ '" /></div>');
		$(nRow).find('td:nth-child(4)').html(aData.width+ ' X ' +aData.height);
		$(nRow).find('td:nth-child(5)').html('<button class="gradient edit adminBlueBtn">Edit</button> ' +$(nRow).find('td:nth-child(5)').html());
	}else if('doc' == aData.fileTypeName){
		if ('pdf' == aData.fileName.split(".").pop().toLowerCase()){
			$(nRow).find('td:nth-child(1)').html('<img id="image'+aData.id+'" src="'+CDN_IMG_URL+'/images/icons/PDF-Icon.jpg" width="80" />');
		}else{
			$(nRow).find('td:nth-child(1)').html('<img id="image'+aData.id+'" src="'+CDN_IMG_URL+'/images/icons/WordDocIcon.jpg" width="80" />');
		}
		
		$(nRow).find('td:nth-child(5)').html('<button class="edit adminBlueBtn disabled" disabled title="' +editTooltip+ '">Edit</button> ' +$(nRow).find('td:nth-child(5)').html());
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
		img.src = this.baseUrl+ path;
		$(nRow).find('td:nth-child(1)').html('<img id="image'+aData.id+'" src="' +this.baseUrl+ path + '" width="80" />');
		$(nRow).find('td:nth-child(5)').html('<button class="edit adminBlueBtn disabled" disabled title="' +editTooltip+ '">Edit</button> ' +$(nRow).find('td:nth-child(5)').html());
	}else{
		img.src = path;
		$(nRow).find('td:nth-child(1)').html('<img id="image'+aData.id+'" src="' +path+ '" width="100" />');
		$(nRow).find('td:nth-child(5)').html('<button class="edit adminBlueBtn disabled" disabled title="' +editTooltip+ '">Edit</button> ' +$(nRow).find('td:nth-child(5)').html());
	}
	if('doc' != aData.fileTypeName){
		img.onerror = function() {
			img.src = CDN_IMG_URL + '/images/samples/defaultModuleImage.jpg';
			img.onload = null;
			img.onerror = null;
			var courseimg = $('#image' + aData.id);
			courseimg.attr('src', this.src);
			courseimg.attr('data-placeholder', CDN_IMG_URL + '/images/placeholders/video-placeholder.png');
			delete img;
		};
		img.onload = function() {
			delete img;
		};
	}

	
	//put the edit and delete button in place
	$(nRow).find('td:nth-child(5)').html('<p class="controls">' +$(nRow).find('td:nth-child(5)').html()+ progressHTML + '</p>');
	
	//build out the tag column
	var tags = this.placeholderTagText;
	var grayClass = "";
	
	if(null != aData.tags && "" !=  aData.tags && "undefined" != typeof aData.tags){
		tags = aData.tags;
	}else{
		grayClass = "gray";
	}
	
	$(nRow).find('td:nth-child(3)').html('<div class="tagsText '+grayClass+'" data-fileid="' +aData.id+ '" title="Tip: You may enter a distinct tag only once. The second will be removed." data-index="' +aData.order+ '">' +escapeHtml(tags.replace(/;/g, '; '))+ '</div>');
	
	return nRow;
}

//override showPreview function
Lrn.Application.fileTool.prototype.showPreview = function(params)
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
    
    //set new image to the crop required size set from the view
    cropParams.find('[name="cropWidth"]').val($(previewWrapper).data('width'));
    cropParams.find('[name="cropHeight"]').val($(previewWrapper).data('height'));

};

Lrn.Application.fileTool.prototype.setFileType = function(type)
{
	if ('vid' == type || 'video' == type){
		type = 'video';
	}else if ('doc' == type || 'document' == type){
		type = 'doc';
	}else{
		type = 'image';
	}
	
	this.fileType = type;
}

//override the cropRender function
Lrn.Application.fileTool.prototype.cropRender = function(renderObj, row){
	var aspectRaio = $(row).find('.cropPreviewWrapper').data('width') / $(row).find('.cropPreviewWrapper').data('height');
	
	$(renderObj).Jcrop({
        boxWidth: 450,
        boxHeight: 400,
        onSelect: (this.showPreview).bind($(row)),
        onChange: (this.showPreview).bind($(row)),
        aspectRatio: aspectRaio,
        setSelect: [0, 0, 50, 50],
	});
}

