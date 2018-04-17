
   $(document).ready( function() {
       
	   var css = $('#cssContainer');
	   var advCSS = $('#advCssContainer');
	   var advCSSTextarea = $("#themeAdvCSSText");
       var consoleTimeout = null;
       var transitionComplete = true;
       var animTiming = 500;
//       var cr = navigator.platform.match(/Win/) ? '\n' : '\r\n';
       
       var updateStyles = function(selector,property,value,container){
    	   container = container || css;
    	   var cssRules = container.html();
    	   var rex = new RegExp(selector+'[\\s]*{[^}]*}','g');
    	   var matches = cssRules.match(rex);

    	   var l = matches ? matches.length : 0;
    	   if(l > 0){
    		   var rex2 = new RegExp(selector);
    		   
    		   for(var i=0;i<l;++i){
    			   var newmatch = matches[i].replace(rex2,'').replace('{','');
    			   
    			   newmatch = newmatch.substr(0,newmatch.length-2);
    			   
    			   var props = newmatch.split(';');
    			   var pl = props.length;
    			   
    			   if(pl > 0){
    				   var updated = false;
    				   for(var j=0;j<pl;++j){
	    				   var prop = props[j].split(':');
	    				   
	    				   if(property === prop[0].replace(/\s/g,'')){
	    					   updated = true;
	    					   prop[1] = value;
	    					   props[j] = prop.join(':');
	    				   }
	    			   }
    				   if(updated){
		    			   var dprops = props.join(';');
		    			   
		    			   newmatch = selector+'{'+dprops+'}';
		    			   cssRules = cssRules.replace(matches[i],newmatch);
    				   }
    			   }
    		   }
    	   }
    	   
    	   container.html(cssRules);
       };
       var populateStyles = function(selector,property,value){
    	   $(selector).css(property,value);
    	   updateStyles(selector,property,value,advCSS);
    	   advCSSTextarea.text(advCSS.html());
    	   advCSSTextarea.val(advCSS.html());
       };
   		$('#themeui_scrollpanel').scrollTo( 0 );
		// Reset the screen to (0,0)
		$.scrollTo( 0 );
       
       $('.minicolors').each( function() {

           if($(this).attr('displaypos') == 'showontop') {
               mColPos = 'top left';
           } else {
               mColPos = 'left';
           }
			   
           $(this).minicolors({
               
               inline: false,
               letterCase: 'lowercase',
               position: mColPos,
               control: 'wheel',
               change: function(hex, opacity) {

				   setUIElementStyle($(this).attr('id'),hex);
            	   
                   // Generate text to show in console
                   text = hex ? hex : 'transparent';
                   if( opacity ) text += ', ' + opacity;
                   text += ' / ' + $(this).minicolors('rgbaString');
                   
                   // Show text in console; disappear after a few seconds
                   $('#console').text(text).addClass('busy');
                   clearTimeout(consoleTimeout);
                   consoleTimeout = setTimeout( function() {
                       $('#console').removeClass('busy');
                   }, 3000);
                   
               }
           });
           
       });
		///$('#start_instructions_panel').scrollTo('#start_instructions img',2000,{easing:'easeOutQuart'});
		
		$('#branding_img_link, #logo_img_link, #leftlogo_image_hotspot, #leftcol_image_hotspot, #vip_image_hotspot').click(function() {
			alert('launch file upload tool');
		});
		
		$('#inside_page_branding_options').click(function() {
			$(this).preventDefault;
			$('#themeui_scrollpanel').scrollTo('#themeui_panel_page',500);
			$('#themeui_welcome_fileupload_overlay').hide(500);
			$('#themeui_fileupload_overlay').show(1000);
			return false;
		});

		$('#welcome_branding_options').click(function() {
			$(this).preventDefault;
			$('#themeui_scrollpanel').scrollTo('#themeui_panel_welcome',500);
			$('#themeui_fileupload_overlay').hide(500);
			$('#themeui_welcome_fileupload_overlay').show(1000);
			return false;
		});
				
		//$('h4 a, input.minicolors, select, span.minicolors-swatch').click(function() {
		$('input.minicolors, select, span.minicolors-swatch').click(function() {	
			$('#start_instructions').fadeOut(400);
			
			if($(this).attr('href') == '#site-branding-options') {return false;}
			var rel = $(this).hasClass('minicolors-swatch') ? $(this).next().attr('rel') : $(this).attr('rel');
			
			if((rel == '') || (rel == undefined)) {
				$('#themeui_scrollpanel').scrollTo('#themeui_panel_page',500);
			} else {
				$('#themeui_scrollpanel').scrollTo(rel,500);
			}
			
		});
		
		$('h4 a').click(function() {
			if(transitionComplete){
				var $this = $(this);
				var target = $($this.attr('href'));
				var rel = $this.attr('data-rightview');
				
				if(!target.hasClass('toggleOpen') ){
					var toggle = $('.toggleOpen');
					var $rel = $('#'+rel);
					var $active = $('.themeright.active');
					transitionComplete = false;
	
					toggle.removeClass('toggleOpen');
					toggle.find('.themeui_wrapper').animate({opacity:0},animTiming,'swing',function(){
						toggle.slideUp(animTiming);
					});
					
					$active.removeClass('active');
					$active.fadeOut(animTiming,function(){
						$rel.fadeIn(animTiming, function(){
							$rel.addClass('active');
							target.addClass('toggleOpen');
							target.slideDown({
								duration: animTiming,
								complete:function(){
									target.find('.themeui_wrapper').animate({opacity:1},animTiming,'swing');
									transitionComplete = true;
								},
								queue: true,
								easing: 'linear'
							});
						});
					});
				}
			}
			return false;	
		});	
		// handles changing the header background style
		 var styles = new Array();
		 styles['flat'] = ''; ///images/theme-ui/theme_pggrad_flat2.png
		 styles['darker'] = CDN_IMG_URL + '/images/theme-ui/theme_pggrad_darker.png';
		 styles['lighter'] = CDN_IMG_URL + '/images/theme-ui/theme_pggrad_lighter.png';

		 $('#themeui_header_style').change(function() {
             var obj = $(this).val();
			 populateStyles('.headerBgColor','background-image',"url('" + styles[obj] + "')"); 
		});
		
		 $('#themeui_pagebkg_style').change(function() {
			 var obj = $(this).val();
			 populateStyles('.globalBgColor','background-image',"url('" + styles[obj] + "')");
		});

		$('.minicolors').click(function() {
			$('#themeui_fileupload_overlay').hide(500);
			$('#themeui_welcome_fileupload_overlay').hide(500);
			
		});
		
		// handles changing the color options
		function setUIElementStyle(key,val) {
			
			switch(key) {
				case 'themeui_header_bgcolor':
					$('.headerBgColor').css('background-color',val);					
					populateStyles('.headerBgColor','background-color',val);
					break;
				
				case 'themeui_page_outerbgcolor':
					populateStyles('.globalBgColor','background-color',val);
					break;					
				
				case 'themeui_primary_text_icon_color':
					populateStyles('.primaryTextIcons','color',val);
					populateStyles('.primaryTextIcons a','color',val + ' !important');
					populateStyles('.resources h3', 'border-bottom', '1px solid ' + val);
					populateStyles('.courses h3', 'border-bottom', '1px solid ' + val);
					break;
					
				case 'themeui_secondary_text_icon_color':
					populateStyles('.secondaryTextIcons', 'color', val);
					populateStyles('.middle','border-left','1px solid ' + val);
					break;	
					
				case 'themeui_titlebar_button_bgcolor':
					$('#startBgColor').val(val);
					populateStyles('.titleBarBtnBgColor','background-color',val);
					updateStyles('button.mqStartBtn:hover > i','color',val);
					updateStyles('button.mqStartBtn:hover > i','color',val,advCSS);
					break;
				
				case 'themeui_titlebar_button_fgcolor':
					$('#startFgColor').val(val);
					updateStyles('button.mqStartBtn:hover','background-color',val);
					updateStyles('button.mqStartBtn:hover','background-color',val,advCSS);
					updateStyles('.titleBarBtnFgColor','color',val);
					updateStyles('.titleBarBtnFgColor','color',val,advCSS);
					break;
					
				case 'themeui_content_bgcolor':
					populateStyles('.contentBgColor', 'background-color', val);
					break;
					
				case 'themeui_borders_shading_color':
					populateStyles('.secondaryBgColor','background-color',val);
					populateStyles('.borders','border','1px solid ' + val);
					populateStyles('.borders','-moz-box-shadow','2px 2px 5px ' + val);
					populateStyles('.borders','-webkit-box-shadow','2px 2px 5px ' + val);
					populateStyles('.borders','box-shadow','2px 2px 5px ' + val);
                                        populateStyles('.borderBottomMedium','border-bottom','2px solid '+ val);
					break;
					
				case 'themeui_content_text_icons_color':
					populateStyles('.contentTextIcons','color',val);
					break;
					
				case 'themeui_content_titles_color':
					populateStyles('.contentTitles','color',val,advCSS);
					break;
					
				case 'themeui_sidebar_imagebdr_color':
					populateStyles('.sideBarImageBorder','background-color',val,advCSS);
					break;
					
				case 'themeui_content_imagebdr_color':
					populateStyles('.contentImageBorder','background-color',val);
					break;	
			}
		}	
		
		var csstxt = advCSS.html();
		// if(csstxt.replace(/[\s]+/,'').length === 0){
		// 	advCSS.html(css.html());
		// 	csstxt = advCSS.html();
		// }
			
		advCSSTextarea.text(csstxt);
		advCSSTextarea.val(csstxt);
   });