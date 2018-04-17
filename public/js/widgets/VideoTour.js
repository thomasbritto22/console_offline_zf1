if(typeof Lrn == 'undefined') Lrn = {};
if(typeof Lrn.Widget == 'undefined') Lrn.Widget = {};

Lrn.Widget.VideoTour = function(){
	this.init();
};


/**
 * --- LEARN PROTOTYPE ---
 * We want to make Learn a subclass of Application so
 * we will set the Learn.prototype to the Lrn.Application object
 * and make sure we have the superclass available for
 * overriding methods from Lrn.Application.
 */
Lrn.Widget.VideoTour.prototype = new Lrn.Widget();
Lrn.Widget.VideoTour.prototype.superclass = Lrn.Widget.prototype;

//will find the way to move this in common js file
Lrn.Widget.VideoTour.prototype.init = function(){
	
	$('.videoImg').each(function(i,el){
		var videoImgWrap  = $(this);
		var videoImgInfo = $(this).siblings('.videoInfo');
	    var file = '';
	    file = videoImgInfo.find('.videoPath').val();

	    var filename = '',filePathMp4 ='', filePathWebm = '', fileImgPath = '';
	    if(file != null ){
		    filename = file.substr( 0,(file.lastIndexOf('.')) ).replace('.qa12.','.qa7.');
		    filePathMp4 = filename + '.mp4';
		    filePathWebm = filename + '.webm';
		    var videoThumb = videoImgInfo.find('.videoThumbnail').val();
		    if ('' != videoThumb){
		    	fileImgPath = videoThumb;
		    }else{
		    	fileImgPath = filename + '-00002.jpg';
		    }
	    }

		// create a new instance of Dialog
	    // with id and title
		var videoTitle = '';
		
		if(videoImgInfo.find('.videoTitle') && videoImgInfo.find('.videoTitle').val() != '')
			videoTitle = videoImgInfo.find('.videoTitle').val();
		
	    var videoDialog = new Lrn.Widget.Dialog({
	    	closeOnEscape: true,
	        id: 'videoDialog_'+i,
	        title: videoTitle,
	        buttons: [ { text: "close", click: function() { $( '#videoDialog_'+i ).dialog( "close" ); } } ]
	    });

	    if(videoImgWrap.prop("tagName") != 'A'){
		    videoImgWrap.html('<img src="' + fileImgPath.replace('.qa12.','.qa7.') + '" class="customfile">'
		                        + '<div class="tourPlay tourPlay1" tabindex="0" role="button" onkeydown="attachClickHandler();"></div>'
		                        );
	    } else {
	    	videoImgWrap.html('<div class="tourPlay1"  tabindex="0" role="button" onkeydown="attachClickHandler();">'+videoImgWrap.html()+'</div>');
	    }

	    videoImgWrap.find('img').on('load', function(){
	    	Lrn.Application.prototype.scaleImage(null, this);
	    })
	    
	    // click function for virtual tour button
		videoImgWrap.find('.tourPlay1').click(function(e) {
			
			//get all of the information that we need to pass to jwplayer
			var videoInfo = $(this).parent().siblings('.videoInfo');
			var videoFile = videoInfo.find('.videoPath').val();
			var videoThumbnail = videoInfo.find('.videoThumbnail').val();
			var videoName = videoFile.substr( 0,(file.lastIndexOf('.')) ).replace('.qa12.','.qa7.');
		    var videoNameMp4 = videoName + '.mp4';
		    var videoNameWebm = videoName + '.webm';
			//we have to split some stuff up here to get the right number for the video.
			//if we ever modify the way this is initialized, this will probably have 
			//to be changed.
			var videoParent = videoDialog.wrapper.id;
			var videoParentSplit = videoParent.split('_');
			//show the dialog
			videoDialog.show();
			//find the body of the particular dialog we are opening
			$('#videoDialog_' + videoParentSplit[1]).find('.body').attr('id', 'jwplayer_' + videoParentSplit[1]);
			//initialize jwplayer on the dialog we are opening and
			//make sure we are playing the video that goes along with the slot
			jwplayer('jwplayer_' + videoParentSplit[1]).setup({
				aspectratio: '16:9',
				image: videoThumbnail.replace('.qa12', '.qa7'),
				width: '100%',
				playlist: [{
					image: videoThumbnail.replace('.qa12', '.qa7'),
					sources: [{ 
						file: videoNameMp4
					},{
						file: videoNameWebm
					}]
				}],
				stagevideo: false
			});
			// jwplayer('jwplayer_' + videoParentSplit[1]).onResize({
			// 	width: 638,
			// 	height: 480
			// });
		});
		//For now we are just removing the whole jwplayer object
		//from the dialog. There is no reason right now to do 
		//this rather than pause it. If we need to change this,
		//we can.
		$(videoDialog.headerClose).click(function(){
			jwplayer().remove();
		});
	});
}