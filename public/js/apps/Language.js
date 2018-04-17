if(typeof(Lrn) == 'undefined') Lrn = {};
if(typeof(Lrn.Application) == 'undefined') Lrn.Application = {};

/**
 * --- LANGUAGE ---
 * The Language object is intended to handle all things
 * that relate to education in the Application. 
 * @param config
 * @returns {Lrn.Application.Language}
 */
Lrn.Application.Language = function(config){
    // set up internal values from config
    if(config){
        this.user = config.user || null;
        this.siteConfigs = config.siteConfigs || null;
        this.siteLabels = config.siteLabels || null;
        this.siteErrors = config.siteErrors || null;
        this.siteInstructions = config.siteInstructions || null;
    }
};

/**
 * --- Language PROTOTYPE ---
 * We want to make Language a subclass of Application so
 * we will set the Language to the Lrn.Application object
 * and make sure we have the superclass available for
 * overriding methods from Lrn.Application.
 */
Lrn.Application.Language.prototype = new Lrn.Application();
Lrn.Application.Language.prototype.superclass = Lrn.Application.prototype;

Lrn.Application.Language.prototype.init = function(){
    // before we extend the superclass init method, 
    // we call the init method of the superclass (Application.js)
    this.superclass.init.apply(this);
    this.userLangSelect();
   
	var siteLabels = Lrn.Applications.Language.siteLabels;	
	
	$(document).ready(function(){
		if($('#userLangSelection')){
			$('#userLangSelection').dialog({
                            title: 'Confirm',                       
			    modal: true,
		  	    width : 500,
		  	    resizable: false,
		  	     open: function(event, ui) {                                 
                                //bringing the focus on the outer div as the popup loads and making screen reader read confirm popup
                                $('.ui-dialog').attr('tabindex',0);
                                $('.ui-dialog').removeAttr('aria-labelledby');
                                $('.ui-dialog').attr('aria-label','confirm popup'); 
                                $('.ui-dialog').focus();                                 
                                 
		  	    	 if ( $("#userProfileLang").val() =="" ) {
		  	    		 // If there is not language for the user then hide the close button
		  	    		$(this).parent().children().children('.ui-dialog-titlebar-close').hide();
                                    }
				 },
				 close: function(){
					 	
                                    if($('#pushClose').val() == 'Yes'){
                                            $('#pushClose').val('No');
                                            var chosenLang = $('#userProfileLang').val();                
                                    var data = {lang: chosenLang}; 
                                    if($('#pendingCertReviews'))
                                            $( '#pendingCertReviews' ).dialog( "close" );
                                    if($('#returnedCerts'))
                                            $( '#returnedCerts' ).dialog( "close" );
                                    //update session data according to users selected language
                                    $.ajax({
                                        type: 'post',
                                        url: '/auth/updatedata',
                                        data: data,
                                        dataType: 'json',
                                        success: function(response){
                                            if(response.change == 'Yes'){
                                                    $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/ajax-loader.gif"  alt="'+siteLabels.Loading+'" width=50 height=50/></span>'+siteLabels.Loading+'</p>');
                                                    $("#messageModal").dialog({
                                                               resizable: false,
                                                               width : 150,
                                                               height : 150,
                                                               closeOnEscape: false,
                                                               open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
                                                               $(".ui-dialog-titlebar", ui.dialog).hide();}
                                                            });	                    	
                                                    location.reload();
                                            }
                                        },
                                        error: function(jqXHR, textStatus, errorThrown){
                                            //do something with this
                                        }
                                    });

                                    $( '#userLangSelection' ).dialog( "close" ); 
                                    }
                            },
                                //If there is not language for the user then hide the close button
                             buttons: $("#userProfileLang").val()!=="" ? [ { text: siteLabels.close, 'class': 'customSecondaryBtn', click: function() {if($('#pushClose').val() == 'Yes'){
                                        $('#pushClose').val('No');
                                        var chosenLang = $('#userProfileLang').val();                
                                var data = {lang: chosenLang}; 
                                if($('#pendingCertReviews'))
                                        $( '#pendingCertReviews' ).dialog( "close" );
                                if($('#returnedCerts'))
                                        $( '#returnedCerts' ).dialog( "close" );
                                //update session data according to users selected language
                                $.ajax({
                                    type: 'post',
                                    url: '/auth/updatedata',
                                    data: data,
                                    dataType: 'json',
                                    success: function(response){
                                        if(response.change == 'Yes'){
                                                $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/ajax-loader.gif" alt="'+siteLabels.Loading+'" width=50 height=50/></span>'+siteLabels.Loading+'</p>');
                                                $("#messageModal").dialog({
                                                           resizable: false,
                                                           width : 150,
                                                           height : 150,
                                                           closeOnEscape: false,
                                                           open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
                                                           $(".ui-dialog-titlebar", ui.dialog).hide();}
                                                        });	                    	
                                                location.reload();
                                        }
                                    },
                                    error: function(jqXHR, textStatus, errorThrown){
                                        //do something with this
                                    }
                                });

                                    $( '#userLangSelection' ).dialog( "close" ); 
                                }
                         } } ] : ''
                    }).bind(this);
		}
                
	}.bind(this));
};
//save user profile language if user language selection is different than his profile language
Lrn.Application.Language.prototype.userLangSelect =  function(){
    $('#langSelSubmit').live('click', {thisObj:this},function(e){ 
    	var siteLabels = e.data.thisObj.siteLabels;
    	e.preventDefault();
    	var button = $(this);
    	$('#pushClose').val('No');
    	var form = $(this).parents('form');
    	button.attr("disabled", "disabled");
    	var selLanguage = '', userProfileLang = '';
    	selLanguage = $('#fieldLanguagesUser').val();
    	userProfileLang = $('#userProfileLang').val();    	
    	var data = {Language: selLanguage};
    	if(selLanguage != userProfileLang) {
    		$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src=" ' +CDN_IMG_URL+ '/images/backgrounds/ajax-loader.gif" alt="'+siteLabels.Saving+'"  width=50 height=50/></span>'+siteLabels.Saving+'</p>');
        	$("#messageModal").dialog({
        		   resizable: false,
        		   width : 150,
        		   height : 150,
        		   closeOnEscape: false,
        		   open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
        		   $(".ui-dialog-titlebar", ui.dialog).hide();}
        		});
            	
	    	$.ajax({
	            type: form.attr('method'),
	            url: form.attr('action'),
	            data: data,
	            dataType: 'json',
	            success: function(response){	            	
	            	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/done.jpg"  width=50 height=50/></span>'+siteLabels.Saved+'</p>');
	        		setTimeout(function(){
	            		$("#messageModal").dialog("close");
	            		
		            	if(response.change == 'Yes')
	                		location.reload();
	            	}, 300);
	            	button.removeAttr("disabled");
	            	
	            	$(".ui-dialog-titlebar-close").show(); 
         		    $(".ui-dialog-titlebar").show();
         		    
         		    //closing the confirmation language dialog box
         		    $( '#userLangSelection' ).dialog("close");
	            },
	            error: function(jqXHR, textStatus, errorThrown){
	            	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/error.png"  width=50 height=50/></span>'+siteLabels.PageErrors+'</p>');
	        		setTimeout(function(){
	            		$("#messageModal").dialog("close");
	            	}, 200);
	            	button.removeAttr("disabled");
	            	
	            	//close the select language form dialog if it is existed
	            	if ($('#userLangSelection')){
	            		$( '#userLangSelection' ).dialog( "close" );
	            	}
	            }
	        });    		
    	} else {
    		//get user selected language
        	var chosenLang = selLanguage;                
            var data = {lang: chosenLang}; 
            if($('#pendingCertReviews'))
        	$( '#pendingCertReviews' ).dialog( "close" );
        	if($('#returnedCerts'))
        	$( '#returnedCerts' ).dialog( "close" );
            //update session data according to users selected language
            $.ajax({
                type: 'post',
                url: '/auth/updatedata',
                data: data,
                dataType: 'json',
                success: function(response){
                	if(response.change == 'Yes'){
                		$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/ajax-loader.gif" alt="'+siteLabels.Loading+'"  width=50 height=50/></span>'+siteLabels.Loading+'</p>');
                    	$("#messageModal").dialog({
                    		   resizable: false,
                    		   width : 150,
                    		   height : 150,
                    		   closeOnEscape: false,
                    		   open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
                    		   $(".ui-dialog-titlebar", ui.dialog).hide();}
                    		});
                		location.reload();
                	} 
                },
                error: function(jqXHR, textStatus, errorThrown){
                	//do something with this
                }
            });

            if ($('#userLangSelection')){
            	$( '#userLangSelection' ).dialog( "close" );
            }
    	}
    });
};