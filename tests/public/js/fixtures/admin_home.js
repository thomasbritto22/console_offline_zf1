var admin_home_fixture = $("<body class=\"globalBgColor\">\
        \
<header class=\"headerBgColor\">\
    <div id=\"hdrProgramBranding\" class=\"bgTile\">\
        <!-- <img src=\"/images/backgrounds/hdrgrad_flat.png\" alt=\"Ethics and Compliance Education Center\" title=\"Ethics and Compliance Education Center\" /> -->\
    </div>\
    	</header>        <div class=\"container clearfix twoColumn\">\
            <div id=\"subHeader\" class=\"clearfix\">\
    <p class=\"font-style5 primaryTextIcons\">\
        <a href=\"/profile\" class=\"font-style5 primaryTextIcons\">\
           <i class=\"icon-user \"></i><span>Hello, FNadmin(nsg)1 LNadmin(nsg)1</span>\
        </a>\
                	<a href=\"/profile/edit\" title=\"Profile\" class=\"primaryTextIcons\"><i class=\"icon-pencil\"></i><span class=\"editText\">Edit Profile</span></a>\
    	    </p>\
</div>            <div id=\"contentWrapper\" class=\"clearfix\">\
                <div id=\"leftColumn\" class=\"sideBar\">\
     <nav>\
         <ul>\
                          <li><a href=\"/index\" title=\"Home\" class=\"primaryTextIcons font-style2\"><i class=\"icon-home secondaryTextIcons\"></i><span>Home</span></a></li>\
                          <li><a href=\"/learn/queue\" title=\"My Queue\" class=\"primaryTextIcons font-style2\"><i class=\"icon-checkmark secondaryTextIcons\"></i><span>My Queue</span></a></li>\
                          <li><a href=\"/catalog\" title=\"Catalog\" class=\"primaryTextIcons font-style2\"><i class=\"icon-book secondaryTextIcons\"></i><span>Catalog</span></a></li>\
                                       <li><a href=\"/resourcecenter\" title=\"Resources\" class=\"primaryTextIcons font-style2\"><i class=\"icon-info secondaryTextIcons\"></i><span>Resources</span></a></li>\
                          <li><a href=\"/notifications/history\" title=\"History\" class=\"primaryTextIcons font-style2\"><i class=\"icon-history secondaryTextIcons\"></i><span>History</span></a></li>\
             <li><a href=\"/profile\" title=\"Profile\" class=\"primaryTextIcons font-style2\"><i class=\"icon-user secondaryTextIcons\"></i><span>Profile</span></a></li>\
             <li><a href=\"/help/UserGuide1.pdf\" title=\"Help\" target=\"_blank\" class=\"primaryTextIcons font-style2\"><i class=\"icon-question secondaryTextIcons\"></i><span>Help</span></a></li>\
                          <li id=\"adminSectionLink\" class=\"hover\">\
                          	<i class=\"icon-cog secondaryTextIcons \"></i><span class=\"primaryTextIcons font-style2\">Settings</span>\
             	                 <ul class=\"adminNav \">\
                 	                        <li>\
                            <a href=\"/admin/home\" title=\"Site Customization\" class=\"primaryTextIcons font-style2\">Site Customization</a>\
                        </li>\
                        <li>\
                            <a href=\"/admin/resourcemanager\" title=\"Resources Settings\" class=\"primaryTextIcons font-style2\">Resources</a>\
                        </li>\
                        <li>\
                            <a href=\"/admin/labels\" title=\"Active Labels\" class=\"primaryTextIcons font-style2\">Active Labels</a>\
                        </li>\
                        <li>\
                            <a href=\"/admin/theme\" title=\"Advanced Customization\" class=\"primaryTextIcons font-style2\">Advanced Customization</a>\
                        </li>\
                        <li>\
                            <a href=\"/admin/librarymanager\" title=\"Library Manager\" class=\"primaryTextIcons font-style2\">Library Manager</a>\
                        </li>\
                        <li>\
                            <a href=\"/admin/courseconfiguration\" title=\"Course Configuration\" class=\"primaryTextIcons font-style2\">Course Configuration</a>\
                        </li>\
                                                    <li>\
                                <a href=\"/admin/getenabledsitelanguages\" title=\"Enabled Languages Settings\" class=\"primaryTextIcons font-style2\">Enabled Languages</a>\
                            </li>\
                                                <li>\
                            <a href=\"/admin/social\" title=\"Social Settings\" class=\"primaryTextIcons font-style2\">Social Settings</a>\
                        </li>\
                                                                <li>\
                            <a href=\"/admin/legacy?app=lcec&amp;targetURI=/app/page/AdminTools\" title=\"LCEC Passthru\" class=\"primaryTextIcons font-style2\">LCEC</a>\
                        </li>\
                                                                                        <li>\
                            <a href=\"/help/CatalystAdmin.pdf\" title=\"Admin Guide\" target=\"_blank\" class=\"primaryTextIcons font-style2\">Admin Guide</a>\
                        </li>\
                                     </ul>\
             </li>\
                          <li><a href=\"/auth/logout/\" title=\"Sign Out\" class=\"primaryTextIcons font-style2\"><i class=\"icon-exit secondaryTextIcons\"></i><span class=\"noBorder\">Sign Out</span></a></li>\
         </ul>\
     </nav>\
     	     <div class=\"myStatus\">\
	        <h3 class=\"secondaryTextIcons font-style5\">My Status</h3>\
	        <p class=\"completionContainer primaryTextIcons font-style2\">Campaign Status:\
	            <span class=\"totalPercentage titleBarBtnFgColor\">\
	                <span class=\"PercentageDone titleBarBtnBgColor\" style=\"width: 50%;\"></span><span class=\"completionNum contentTextIcons\">50%</span>\
	            </span>\
	        </p>\
	        <p class=\"primaryTextIcons font-style2 statusText\">Total Assigned: <span class=\"statusNumber\">36</span></p>\
	        <p class=\"primaryTextIcons font-style2 statusText\">Courses Completed: <span class=\"statusNumber\">18</span></p>\
	        <p class=\"primaryTextIcons font-style2 statusText\">Past Due: <span class=\"statusNumber\">14</span></p>\
	        <p class=\"primaryTextIcons font-style2 statusText\">Courses in Progress: <span class=\"statusNumber\">5</span></p>\
	        	        <p class=\"linkRight\"><a href=\"/learn/queue\" class=\"secondaryTextIcons font-style2\">&gt;&gt; Go To My Queue</a></p>\
	        	     </div>\
      </div>\
               <div id=\"mainContent\" role=\"main\" class=\"middle\">\
                  <div id=\"pageTitle\" class=\"titleBarBtnBgColor\">\
   <h2 class=\"titleBarBtnFgColor\"><i class=\"icon-cog titleBarBtnFgColor\"></i>Admin</h2>\
   <div class=\"legend titleBarBtnFgColor clearfix\">\
   	   </div>\
</div>                  <div class=\"content clearfix contentBgColor\">\
                    <hgroup class=\"adminHeader\">\
	<h2>Customize Your Site</h2>\
</hgroup>\
<div id=\"categorySection\" class=\"ui-corner-all\">\
	<div id=\"login_page\">\
        <div class=\"instructionalHeader clearfix\">\
		    <h3 class=\"sectionHeader\">Design</h3>\
						<fieldset>\
				<p>\
					<label for=\"fieldLanguages\">Select a language:</label> <select name=\"fieldLanguages\" id=\"fieldLanguages\">\
												<option value=\"deDE\">\
							German (Germany)						</option>\
												<option value=\"en\" selected>\
							English						</option>\
												<option value=\"esLA\">\
							Spanish (Latin America)						</option>\
												<option value=\"fiFI\">\
							Finnish						</option>\
												<option value=\"frFR\">\
							French (Europe)						</option>\
												<option value=\"itIT\">\
							Italian						</option>\
												<option value=\"jaJP\">\
							Japanese						</option>\
												<option value=\"plPL\">\
							Polish						</option>\
												<option value=\"ptBR\">\
							Portuguese (Brazil)						</option>\
												<option value=\"ruRU\">\
							Russian						</option>\
												<option value=\"svSE\">\
							Swedish						</option>\
												<option value=\"zhCN\">\
							Chinese (Simplified)						</option>\
											</select>\
				</p>\
			</fieldset>\
            <span><i class=\"icon-flag\"></i></span>\
					</div>\
				<!-- <div id=\"langNotification\">\
			<p>\
				Note: You are currently editing in\
				English			</p>\
		</div> -->\
				<div id=\"adminAccordion\">\
			<div id=\"tabs_login\">\
				<ul>\
					<li class=\"gradient\">\
                        <a href=\"#global\" data-id=\"global\">Global</a>\
                    </li>\
					<li class=\"gradient\">\
                        <a href=\"#loginPage\" data-id=\"loginPage\">Login Page</a>\
                    </li>\
					<li class=\"gradient\">\
                        <a href=\"#homePage\" data-id=\"homePage\">Home Page</a>\
                    </li>\
                    <li class=\"gradient\">\
                        <a href=\"#myQueuePage\" data-id=\"myQueuePage\">My Queue Page</a>\
                    </li>\
                    <li class=\"gradient\">\
                        <a href=\"#sideBar\" data-id=\"sideBar\">Sidebar</a>\
                    </li>\
				</ul>\
\
                <!--********************-->\
                <!--***GLOBAL SECTION***-->\
                <!--********************-->\
\
				<div id=\"global\">\
					<section class=\"adminSection\">\
						<div class=\"adminSectionHeader\">\
							<h3>Program Branding</h3>\
						</div>\
						<div class=\"adminSectionContent\">\
							<form name=\"headerForm\" action=\"/admin/updateComponent\" method=\"post\" class=\"clearfix brandingsection\">\
                                <sub class=\"pbInstructions\">Select an image to be displayed as your header image and logo. Then add in text for your tagline:</sub>\
                                <div class=\"headerBgSection\">\
                                    <p class=\"pbLabel\">Header Background Image <span>(Your image should be 213 pixels by 72 pixels)</span></p>\
                                    <div class=\"displayOptions\">\
                                        <div class=\"formElements clearfix\">\
                                            <fieldset>\
                                                <legend>Display Style: </legend>\
                                                <input type=\"radio\" id=\"Headercenter\" name=\"updatebrandingImage[Headerdisplay]\" value=\"center\"> <label for=\"Headercenter\">Centered</label> <input type=\"hidden\" id=\"Headercenter_id\" name=\"updatebrandingImage[Headercenter_id]\" value=\"653661\">\
                                                <input type=\"radio\" id=\"Headertile\" name=\"updatebrandingImage[Headerdisplay]\" checked value=\"tile\"> <label for=\"headertile\">Tiled</label> <input type=\"hidden\" id=\"Headertile_id\" name=\"updatebrandingImage[Headertile_id]\" value=\"653660\">\
                                            </fieldset>\
                                        </div>\
                                    </div>\
                                    <div class=\"headerImage\">\
                                        <div class=\"imageWrap\">\
                                            <img src=\"/images/placeholders/ss-placeholder.png\" oldsrc=\"/images/placeholders/ss-placeholder.png\" class=\"Headercustomfile customfile\" formparent=\"updatebrandingImage\" data-image=\"/images/placeholders/ss-placeholder.png\" data-placeholder=\"/images/placeholders/ss-placeholder.png\">\
                                        </div>\
                                        <fieldset>\
                                            <input type=\"hidden\" class=\"hiddenImageIdField\" name=\"updatebrandingImage[Headercustomfile]\" value=\"\">\
                                            <input type=\"hidden\" id=\"Headercustomfile_id\" name=\"updatebrandingImage[Headercustomfile_id]\" value=\"\">\
                                            <button id=\"Headercustomfile\" name=\"updatebrandingImage[Headercustomfile]\" class=\"getFile customfile adminBlueBtn gradient pbSave\" data-width=\"213\" data-height=\"72\" data-type=\"img\" data-existed=\"\">upload image</button>\
                                            <p class=\"clearLink\">clear image</p>\
                                        </fieldset>\
                                    </div>\
                                </div>\
								<div class=\"logoSection\">\
                                    <p class=\"pbLabel\">Logo <span>(Your image should be 213 pixels by 72 pixels)</span></p>\
                                    <div class=\"displayOptions\">\
                                        <div class=\"formElements clearfix\">\
                                            <fieldset>\
                                                <legend>Position:</legend>\
                                                <input type=\"radio\" id=\"company_logoleft\" name=\"updatecompany_logo[company_logodisplay]\" value=\"left\">\
                                                <label for=\"company_logoleft\">Left</label>\
                                                <input type=\"hidden\" id=\"company_logoleft_id\" name=\"updatecompany_logo[company_logoleft_id]\" value=\"681644\">\
                                                <input type=\"radio\" id=\"company_logocenter\" name=\"updatecompany_logo[company_logodisplay]\" checked value=\"center\">\
                                                <label for=\"company_logocenter\">Centered</label>\
                                                <input type=\"hidden\" id=\"company_logocenter_id\" name=\"updatecompany_logo[company_logocenter_id]\" value=\"681645\">\
                                                <input type=\"radio\" id=\"company_logoright\" name=\"updatecompany_logo[company_logodisplay]\" value=\"right\">\
                                                <label for=\"company_logoright\">Right</label>\
                                                <input type=\"hidden\" id=\"company_logoright_id\" name=\"updatecompany_logo[company_logoright_id]\" value=\"681646\">\
                                            </fieldset>\
                                        </div>\
                                    </div>\
                                    <div class=\"headerImage\">\
                                        <div class=\"imageWrap\">\
                                            <img src=\"/images/placeholders/ss-placeholder.png\" oldsrc=\"/images/placeholders/ss-placeholder.png\" class=\"company_logocustomfile customfile\" formparent=\"updatecompany_logo\" data-image=\"/images/placeholders/ss-placeholder.png\" data-placeholder=\"/images/placeholders/ss-placeholder.png\">\
                                        </div>\
                                        <fieldset>\
                                            <input type=\"hidden\" class=\"hiddenImageIdField\" name=\"updatecompany_logo[company_logocustomfile]\" value=\"\">\
                                            <input type=\"hidden\" id=\"company_logocustomfile_id\" name=\"updatecompany_logo[company_logocustomfile_id]\" value=\"\">\
                                            <button id=\"company_logocustomfile\" name=\"updatecompany_logo[company_logocustomfile]\" class=\"getFile customfile adminBlueBtn gradient pbSave\" data-width=\"213\" data-height=\"72\" data-type=\"img\" data-existed=\"\">upload image</button>\
                                            <p class=\"clearLink\">clear image</p>\
                                        </fieldset>\
                                    </div>\
                                </div>\
								<div class=\"taglineSection\">\
                                    <p class=\"pbLabel\">Header Tagline <span>(100 characters maximum)</span></p>\
                                    <div class=\"headerDisplayOptions\">\
                                        <div class=\"formElements clearfix\">\
                                            <fieldset>\
					                            <legend>Position:</legend>\
					        	            	<input type=\"radio\" id=\"header_taglineleft\" name=\"updateheader_tagline[header_taglinedisplay]\" value=\"left\">\
					                            <label for=\"header_taglineleft\">Left</label>\
					        	            	<input type=\"hidden\" id=\"header_taglineleft_id\" name=\"updateheader_tagline[header_taglineleft_id]\" value=\"681635\">\
					        	            	<input type=\"radio\" id=\"header_taglinecenter\" name=\"updateheader_tagline[header_taglinedisplay]\" checked value=\"center\">\
					                            <label for=\"header_taglinecenter\">Centered</label>\
					        	            	<input type=\"hidden\" id=\"header_taglinecenter_id\" name=\"updateheader_tagline[header_taglinecenter_id]\" value=\"681636\">\
					        	            	<input type=\"radio\" id=\"header_taglineright\" name=\"updateheader_tagline[header_taglinedisplay]\" value=\"right\">\
					                            <label for=\"header_taglineright\">Right</label>\
					                            <input type=\"hidden\" id=\"header_taglineright_id\" name=\"updateheader_tagline[header_taglineright_id]\" value=\"681637\">\
					                        </fieldset>\
                                            <fieldset class=\"taglineInput\">\
                                                <textarea class=\"dataField\" cols=\"50\" rows=\"3\" name=\"updateheader_tagline[header_taglinetitle]\" id=\"header_taglinetitle\" placeholder=\"Type in your Tagline here\" data-length=\"999\" data-maxlength=\"1000\" maxlength=\"1000\" data-value=\"\">                                                                                                    </textarea>\
                                                <input type=\"hidden\" id=\"header_taglinetitle_id\" name=\"updateheader_tagline[header_taglinetitle_id]\" value=\"\">\
                                                <span class=\"feedback\"></span> <sub class=\"instruction\"></sub>\
                                            </fieldset>\
                                        </div>\
                                    </div>\
                                </div>\
                                <div class=\"faviconSection\">\
                                    <p class=\"pbLabel\">Favicon <span>(Recommended image size is 64 pixels by 64 pixels)</span></p>\
                                    <sub class=\"pbInstructions\">Your favicon will remain the same across all languages of you site.  Select an image to be displayed as your favicon.  This small image will show up in the address bar, in your bookmarks and in the page tab.</sub>\
                                    <div class=\"headerImage\">\
                                        <div class=\"imageWrap\">\
                                            <img src=\"https://nsg-console.qa7.lrn.com/custom_files/6825_15729696_1396557701.jpg\" oldsrc=\"https://nsg-console.qa7.lrn.com/custom_files/6825_15729696_1396557701.jpg\" class=\"faviconcustomfile customfile\" formparent=\"updatefavicon\" data-image=\"bgCustomImage\" data-placeholder=\"/images/placeholders/ss-placeholder.png\">\
                                        </div>\
                                        <fieldset>\
                                            <input type=\"hidden\" class=\"hiddenImageIdField\" name=\"updatefavicon[faviconcustomfile]\" value=\"200255\">\
                                            <input type=\"hidden\" id=\"faviconcustomfile_id\" name=\"updatefavicon[faviconcustomfile_id]\" value=\"653665\">\
                                            <button id=\"faviconcustomfile\" name=\"updatefavicon[faviconcustomfile]\" class=\"getFile customfile adminBlueBtn gradient pbSave\" data-width=\"64\" data-height=\"64\" data-type=\"img\" data-existed=\"200255\">replace image</button>\
                                            <p class=\"clearLink\">clear image</p>\
                                        </fieldset>\
                                    </div>\
                                </div>\
								<fieldset class=\"headerUpdateButtons\">\
									<input type=\"hidden\" name=\"datatype\" value=\"object\">\
									<input type=\"hidden\" class=\"header_taglinegroupId\" name=\"groupId\" id=\"header_taglinegroupId\" value=\"195235\">\
									<input type=\"hidden\" name=\"adminAction\" value=\"updateheader_tagline\">\
									<button type=\"submit\" id=\"header_taglineSubmit\" class=\"adminFormSubmit adminBlueBtn gradient\">save</button>\
                        			<p class=\"cancelLink\" data-id=\"headline\">cancel</p>\
								</fieldset>\
							</form>\
						</div>\
					</section>\
					<section class=\"adminSection\">\
						<div class=\"adminSectionHeader\">\
							<h3>Password Instructions</h3>\
						</div>\
						<div class=\"adminSectionContent\">\
                            <div class=\"instrHeader clearfix\">\
                                <h3 class=\"sectionHeader resourceHeader\">Manage the password instructions for\
                                your site below:</h3>\
                            </div>\
							<form name=\"pwdinstructForm\" action=\"/admin/updateinstructions\" method=\"post\">\
								<fieldset>\
									<p class=\"formField\">\
										<span class=\"fieldLabel\">Password Instruction<span class=\"charLimit\">(1000 characters)</span>\
										</span>\
										<textarea cols=\"15\" rows=\"5\" id=\"pwdinstructiontext\" name=\"pwdinstructiontext\" maxlength=\"1000\" placeholder=\"Please enter password instruction.\">							                                                    </textarea>\
										<input type=\"hidden\" id=\"translationId\" name=\"translationId\" value=\"\">\
									</p>\
									<fieldset class=\"updateButtons\">\
										<button id=\"pwdinstSubmit\" type=\"button\" class=\"themeSubmit adminBlueBtn gradient\">update</button>\
										<span class=\"hidden\"><p class=\"cancelLink\">Cancel</p> </span>\
									</fieldset>\
								</fieldset>\
							</form>\
						</div>\
					</section>\
				</div>\
\
                <!--********************-->\
                <!--****LOGIN SECTION***-->\
                <!--********************-->\
\
				<div id=\"loginPage\">\
					<section class=\"adminSection\">\
						<form name=\"headlineForm\" action=\"/admin/updateComponent\" method=\"post\">\
							<div class=\"adminSectionHeader\">\
								<h3>Headline</h3>\
								<fieldset>\
									<p class=\"formField\">\
										<input type=\"checkbox\" name=\"headlinetoggle\" id=\"headlinetoggle\" class=\"slideToggle\" show-label=\"ON\" hide-label=\"OFF\" checked> <input type=\"hidden\" name=\"headlinetoggle_id\" id=\"headlinetoggle_id\" value=\"652850\">\
									</p>\
								</fieldset>\
							</div>\
							<div class=\"adminSectionContent\">\
								<sub class=\"instruction\">Enter and format a headline to appear\
									on your Login page.</sub>\
								<fieldset>\
									<p class=\"formField\">\
										<span class=\"fieldLabel\">Headline Text<span class=\"charLimit\">(750\
												characters recommended)</span>\
										</span>\
										<textarea class=\"rte dataField\" cols=\"50\" rows=\"3\" name=\"headlinetext\" id=\"headlinetext\" placeholder=\"Please enter text.\" data-length=\"999\" data-maxlength=\"1000\" data-value=\"...doing business the right way\">											...doing business the right way										</textarea>\
										<input type=\"hidden\" name=\"headlinetextErr\" id=\"headlinetextErr\" value=\"No\"> <input type=\"hidden\" name=\"headlinetext_id\" id=\"headlinetext_id\" value=\"\">\
										<span class=\"feedback\"></span> <sub class=\"instruction\"></sub>\
									</p>\
								</fieldset>\
								<fieldset class=\"updateButtons\">\
									<input type=\"hidden\" class=\"headlinegroupId\" name=\"groupId\" id=\"headlinegroupId\" value=\"183093\">\
									<input type=\"hidden\" name=\"adminAction\" value=\"updateHeadline\">\
									<button type=\"submit\" id=\"headlineSubmit\" class=\"adminFormSubmit adminBlueBtn gradient\">update</button>\
									<p class=\"cancelLink\" data-id=\"headline\">Cancel</p>\
								</fieldset>\
							</div>\
						</form>\
					</section>\
					<section class=\"adminSection\">\
						<form name=\"bgImageForm\" action=\"/admin/updateComponent\" method=\"post\">\
							<div class=\"adminSectionHeader\">\
								<h3>Background Image</h3>\
								<fieldset>\
									<p class=\"formField\">\
										<input type=\"checkbox\" id=\"bg_imagetoggle\" name=\"bg_imagetoggle\" class=\"slideToggle\" show-label=\"ON\" hide-label=\"OFF\" checked> <input type=\"hidden\" name=\"bg_imagetoggle_id\" id=\"bg_imagetoggle_id\" value=\"667661\">\
										<span class=\"feedback\"></span> <sub class=\"instruction\"></sub>\
									</p>\
								</fieldset>\
							</div>\
							<div class=\"adminSectionContent\">\
								<sub class=\"instruction\">This image will appear on the left\
									vertical portion of your Login Page.</sub>\
								<div class=\"mediaWrapper bgimage clearfix\">\
									<div class=\"imageWrap\">\
										<img src=\"/images/placeholders/bg-placeholder.png\" oldsrc=\"/images/placeholders/bg-placeholder.png\" class=\"bg_imagecustomfile customfile\" formparent=\"bg_image\" data-image=\"\" data-placeholder=\"/images/placeholders/bg-placeholder.png\">\
									</div>\
									<p>\
										<input type=\"checkbox\" id=\"bg_imagetile\" name=\"bg_imagetile\"> Do not tile this image.\
									</p>\
									<input type=\"hidden\" id=\"bg_imagetile_id\" name=\"bg_imagetile_id\" value=\"667662\">\
									<fieldset style=\"float:left;\">\
										<input type=\"hidden\" class=\"hiddenImageIdField\" name=\"bg_imagecustomfile\" value=\"\">\
										<input type=\"hidden\" id=\"bg_imagecustomfile_id\" name=\"bg_imagecustomfile_id\" value=\"\">\
										<button id=\"bg_imagecustomfile\" name=\"bg_imagecustomfile\" class=\"getFile customfile adminBlueBtn gradient\" data-width=\"200\" data-height=\"1200\" data-type=\"img\" data-existed=\"\">upload image</button>\
		                				<p class=\"clearLink\">clear image</p>\
		                			</fieldset>\
								</div>\
								<fieldset class=\"updateButtons\">\
									<input type=\"hidden\" class=\"bg_imagegroupId\" name=\"groupId\" id=\"bg_imagegroupId\" value=\"189938\">\
									<input type=\"hidden\" name=\"adminAction\" value=\"updateBackgroundImage\">\
									<button type=\"submit\" id=\"bgImageSubmit\" class=\"adminFormSubmit adminBlueBtn gradient\">update</button>\
									<p class=\"cancelLink\">Cancel</p>\
								</fieldset>\
							</div>\
						</form>\
					</section>\
				</div>\
\
                <!--********************-->\
                <!--**HOMEPAGE SECTION**-->\
                <!--********************-->\
\
				<div id=\"homePage\">\
					<section id=\"carousel\" class=\"adminSection\">\
						<form name=\"imageCarouselForm\" action=\"/admin/updateComponent\" method=\"post\">\
							<div class=\"adminSectionHeader\">\
								<h3>Slideshow</h3>\
								<fieldset>\
									<p class=\"formField\">\
									   <span class=\"feedback\"></span>\
                                       <sub class=\"instruction\"></sub>\
									</p>\
								</fieldset>\
							</div>\
							<div class=\"adminSectionContent\">\
								<sub class=\"instruction\">\
								   Upload up to six slides, and enter accompanying captions and descriptions.\
								   <b>Two visible slides are recommended for best results, but you may elect to upload and display only one.</b>\
								</sub>\
								<div class=\"carouselItems\">\
									<div class=\"slideTabHeader\">\
										<p class=\"slideTabs selected\" id=\"slideTab1\">Slide 1</p>\
										<p class=\"slideTabs\" id=\"slideTab2\">Slide 2</p>\
										<p class=\"slideTabs\" id=\"slideTab3\">Slide 3</p>\
										<p class=\"slideTabs\" id=\"slideTab4\">Slide 4</p>\
										<p class=\"slideTabs\" id=\"slideTab5\">Slide 5</p>\
										<p class=\"slideTabs\" id=\"slideTab6\">Slide 6</p>\
									</div>\
																											<div id=\"slide_1\" class=\"carouselItem clearfix \">\
										<div class=\"slidePreview\">\
											<div class=\"slideshowImgWrap\">\
												<img src=\"https://nsg-console.qa7.lrn.com/custom_files/6825_15729696_1398896109.jpg\" oldsrc=\"https://nsg-console.qa7.lrn.com/custom_files/6825_15729696_1398896109.jpg\" class=\"carouselcustomfile_0 customfile\" title=\"Homepage Slideshow Image\" formparent=\"carouselcustomfile\" data-placeholder=\"/images/placeholders/ss-placeholder.png\">\
											</div>\
											<fieldset>\
												<input type=\"hidden\" class=\"hiddenImageIdField\" name=\"carouselcustomfile[0]\" value=\"209054\">\
												<input type=\"hidden\" class=\"carouselcustomfile_id\" id=\"carouselcustomfile_id\" name=\"carouselcustomfile_id[0]\" value=\"690967\">\
												<input type=\"hidden\" name=\"clearCarouselImage-0\" value=\"\">\
												<button id=\"carouselcustomfile[0]\" name=\"carouselcustomfile[0]\" class=\"getFile customfile adminBlueBtn gradient\" data-width=\"294\" data-height=\"198\" data-type=\"img\" data-existed=\"690967\">replace image</button>\
												<button type=\"button\" name=\"clearSlideShowImage\" class=\"clearLink\" style=\"margin-right:5px;\">clear image</button>\
											</fieldset>\
										</div>\
										<fieldset>\
											<p class=\"fieldLabel\">\
												Title <span class=\"charLimit\">(52 characters maximum)</span>\
											</p>\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltitle_id\" name=\"carouseltitle_id[0]\" value=\"673921\">\
                                                <input type=\"text\" class=\"slideTitle dataField carouseltitle\" name=\"carouseltitle[0]\" placeholder=\"Type in your slideshow title here\" value=\"Slide 1\" maxlength=\"52\">\
											</p>\
											<p class=\"fieldLabel\">\
												Message <span class=\"charLimit\">(1000 characters maximum)</span>\
											</p>\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltext_id\" name=\"carouseltext_id[0]\" value=\"673922\">\
												<textarea class=\"slideDescription dataField carouseltext\" name=\"carouseltext[0]\" rows=\"5\" placeholder=\"Type in your message here\" maxlength=\"172\">                                                    Phone                                                </textarea>\
											</p>\
										</fieldset>\
										<fieldset style=\"float: right;\">\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltoggle_id\" name=\"carouseltoggle_id[0]\" value=\"673920\">\
												<input type=\"checkbox\" name=\"carouseltoggle[0]\" id=\"carouseltoggle0\" class=\"carouselCheckbox carouseltoggle\" value=\"0\" checked>\
												Visible\
											</p>\
										</fieldset>\
										<fieldset>\
											<input type=\"hidden\" class=\"carouselgroupId\" name=\"groupId[0]\" value=\"192556\">\
										</fieldset>\
									</div>\
																		<div id=\"slide_2\" class=\"carouselItem clearfix hide\">\
										<div class=\"slidePreview\">\
											<div class=\"slideshowImgWrap\">\
												<img src=\"https://nsg-console.qa7.lrn.com/custom_files/6825_15729696_1398369082.jpg\" oldsrc=\"https://nsg-console.qa7.lrn.com/custom_files/6825_15729696_1398369082.jpg\" class=\"carouselcustomfile_1 customfile\" title=\"Homepage Slideshow Image\" formparent=\"carouselcustomfile\" data-placeholder=\"/images/placeholders/ss-placeholder.png\">\
											</div>\
											<fieldset>\
												<input type=\"hidden\" class=\"hiddenImageIdField\" name=\"carouselcustomfile[1]\" value=\"208056\">\
												<input type=\"hidden\" class=\"carouselcustomfile_id\" id=\"carouselcustomfile_id\" name=\"carouselcustomfile_id[1]\" value=\"690966\">\
												<input type=\"hidden\" name=\"clearCarouselImage-1\" value=\"\">\
												<button id=\"carouselcustomfile[1]\" name=\"carouselcustomfile[1]\" class=\"getFile customfile adminBlueBtn gradient\" data-width=\"294\" data-height=\"198\" data-type=\"img\" data-existed=\"690966\">replace image</button>\
												<button type=\"button\" name=\"clearSlideShowImage\" class=\"clearLink\" style=\"margin-right:5px;\">clear image</button>\
											</fieldset>\
										</div>\
										<fieldset>\
											<p class=\"fieldLabel\">\
												Title <span class=\"charLimit\">(52 characters maximum)</span>\
											</p>\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltitle_id\" name=\"carouseltitle_id[1]\" value=\"673926\">\
                                                <input type=\"text\" class=\"slideTitle dataField carouseltitle\" name=\"carouseltitle[1]\" placeholder=\"Type in your slideshow title here\" value=\"Slide 2\" maxlength=\"52\">\
											</p>\
											<p class=\"fieldLabel\">\
												Message <span class=\"charLimit\">(1000 characters maximum)</span>\
											</p>\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltext_id\" name=\"carouseltext_id[1]\" value=\"673927\">\
												<textarea class=\"slideDescription dataField carouseltext\" name=\"carouseltext[1]\" rows=\"5\" placeholder=\"Type in your message here\" maxlength=\"172\">                                                    Marker                                                </textarea>\
											</p>\
										</fieldset>\
										<fieldset style=\"float: right;\">\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltoggle_id\" name=\"carouseltoggle_id[1]\" value=\"673925\">\
												<input type=\"checkbox\" name=\"carouseltoggle[1]\" id=\"carouseltoggle1\" class=\"carouselCheckbox carouseltoggle\" value=\"1\">\
												Visible\
											</p>\
										</fieldset>\
										<fieldset>\
											<input type=\"hidden\" class=\"carouselgroupId\" name=\"groupId[1]\" value=\"192584\">\
										</fieldset>\
									</div>\
																		<div id=\"slide_3\" class=\"carouselItem clearfix hide\">\
										<div class=\"slidePreview\">\
											<div class=\"slideshowImgWrap\">\
												<img src=\"https://nsg-console.qa7.lrn.com/custom_files/6825_15729696_1398896109.jpg\" oldsrc=\"https://nsg-console.qa7.lrn.com/custom_files/6825_15729696_1398896109.jpg\" class=\"carouselcustomfile_2 customfile\" title=\"Homepage Slideshow Image\" formparent=\"carouselcustomfile\" data-placeholder=\"/images/placeholders/ss-placeholder.png\">\
											</div>\
											<fieldset>\
												<input type=\"hidden\" class=\"hiddenImageIdField\" name=\"carouselcustomfile[2]\" value=\"209054\">\
												<input type=\"hidden\" class=\"carouselcustomfile_id\" id=\"carouselcustomfile_id\" name=\"carouselcustomfile_id[2]\" value=\"690968\">\
												<input type=\"hidden\" name=\"clearCarouselImage-2\" value=\"\">\
												<button id=\"carouselcustomfile[2]\" name=\"carouselcustomfile[2]\" class=\"getFile customfile adminBlueBtn gradient\" data-width=\"294\" data-height=\"198\" data-type=\"img\" data-existed=\"690968\">replace image</button>\
												<button type=\"button\" name=\"clearSlideShowImage\" class=\"clearLink\" style=\"margin-right:5px;\">clear image</button>\
											</fieldset>\
										</div>\
										<fieldset>\
											<p class=\"fieldLabel\">\
												Title <span class=\"charLimit\">(52 characters maximum)</span>\
											</p>\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltitle_id\" name=\"carouseltitle_id[2]\" value=\"675801\">\
                                                <input type=\"text\" class=\"slideTitle dataField carouseltitle\" name=\"carouseltitle[2]\" placeholder=\"Type in your slideshow title here\" value=\"slide 3\" maxlength=\"52\">\
											</p>\
											<p class=\"fieldLabel\">\
												Message <span class=\"charLimit\">(1000 characters maximum)</span>\
											</p>\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltext_id\" name=\"carouseltext_id[2]\" value=\"675802\">\
												<textarea class=\"slideDescription dataField carouseltext\" name=\"carouseltext[2]\" rows=\"5\" placeholder=\"Type in your message here\" maxlength=\"172\">                                                    Shake                                                </textarea>\
											</p>\
										</fieldset>\
										<fieldset style=\"float: right;\">\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltoggle_id\" name=\"carouseltoggle_id[2]\" value=\"675800\">\
												<input type=\"checkbox\" name=\"carouseltoggle[2]\" id=\"carouseltoggle2\" class=\"carouselCheckbox carouseltoggle\" value=\"2\">\
												Visible\
											</p>\
										</fieldset>\
										<fieldset>\
											<input type=\"hidden\" class=\"carouselgroupId\" name=\"groupId[2]\" value=\"192964\">\
										</fieldset>\
									</div>\
																		<div id=\"slide_4\" class=\"carouselItem clearfix hide\">\
										<div class=\"slidePreview\">\
											<div class=\"slideshowImgWrap\">\
												<img src=\"https://nsg-console.qa7.lrn.com/custom_files/6825_15729696_1398896109.jpg\" oldsrc=\"https://nsg-console.qa7.lrn.com/custom_files/6825_15729696_1398896109.jpg\" class=\"carouselcustomfile_3 customfile\" title=\"Homepage Slideshow Image\" formparent=\"carouselcustomfile\" data-placeholder=\"/images/placeholders/ss-placeholder.png\">\
											</div>\
											<fieldset>\
												<input type=\"hidden\" class=\"hiddenImageIdField\" name=\"carouselcustomfile[3]\" value=\"209054\">\
												<input type=\"hidden\" class=\"carouselcustomfile_id\" id=\"carouselcustomfile_id\" name=\"carouselcustomfile_id[3]\" value=\"690977\">\
												<input type=\"hidden\" name=\"clearCarouselImage-3\" value=\"\">\
												<button id=\"carouselcustomfile[3]\" name=\"carouselcustomfile[3]\" class=\"getFile customfile adminBlueBtn gradient\" data-width=\"294\" data-height=\"198\" data-type=\"img\" data-existed=\"690977\">replace image</button>\
												<button type=\"button\" name=\"clearSlideShowImage\" class=\"clearLink\" style=\"margin-right:5px;\">clear image</button>\
											</fieldset>\
										</div>\
										<fieldset>\
											<p class=\"fieldLabel\">\
												Title <span class=\"charLimit\">(52 characters maximum)</span>\
											</p>\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltitle_id\" name=\"carouseltitle_id[3]\" value=\"675805\">\
                                                <input type=\"text\" class=\"slideTitle dataField carouseltitle\" name=\"carouseltitle[3]\" placeholder=\"Type in your slideshow title here\" value=\"slide 4\" maxlength=\"52\">\
											</p>\
											<p class=\"fieldLabel\">\
												Message <span class=\"charLimit\">(1000 characters maximum)</span>\
											</p>\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltext_id\" name=\"carouseltext_id[3]\" value=\"675806\">\
												<textarea class=\"slideDescription dataField carouseltext\" name=\"carouseltext[3]\" rows=\"5\" placeholder=\"Type in your message here\" maxlength=\"172\">                                                    Rolling                                                </textarea>\
											</p>\
										</fieldset>\
										<fieldset style=\"float: right;\">\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltoggle_id\" name=\"carouseltoggle_id[3]\" value=\"675804\">\
												<input type=\"checkbox\" name=\"carouseltoggle[3]\" id=\"carouseltoggle3\" class=\"carouselCheckbox carouseltoggle\" value=\"3\">\
												Visible\
											</p>\
										</fieldset>\
										<fieldset>\
											<input type=\"hidden\" class=\"carouselgroupId\" name=\"groupId[3]\" value=\"192965\">\
										</fieldset>\
									</div>\
																		<div id=\"slide_5\" class=\"carouselItem clearfix hide\">\
										<div class=\"slidePreview\">\
											<div class=\"slideshowImgWrap\">\
												<img src=\"https://nsg-console.qa7.lrn.com/custom_files/6825_15729696_1398896109.jpg\" oldsrc=\"https://nsg-console.qa7.lrn.com/custom_files/6825_15729696_1398896109.jpg\" class=\"carouselcustomfile_4 customfile\" title=\"Homepage Slideshow Image\" formparent=\"carouselcustomfile\" data-placeholder=\"/images/placeholders/ss-placeholder.png\">\
											</div>\
											<fieldset>\
												<input type=\"hidden\" class=\"hiddenImageIdField\" name=\"carouselcustomfile[4]\" value=\"209054\">\
												<input type=\"hidden\" class=\"carouselcustomfile_id\" id=\"carouselcustomfile_id\" name=\"carouselcustomfile_id[4]\" value=\"689594\">\
												<input type=\"hidden\" name=\"clearCarouselImage-4\" value=\"\">\
												<button id=\"carouselcustomfile[4]\" name=\"carouselcustomfile[4]\" class=\"getFile customfile adminBlueBtn gradient\" data-width=\"294\" data-height=\"198\" data-type=\"img\" data-existed=\"689594\">replace image</button>\
												<button type=\"button\" name=\"clearSlideShowImage\" class=\"clearLink\" style=\"margin-right:5px;\">clear image</button>\
											</fieldset>\
										</div>\
										<fieldset>\
											<p class=\"fieldLabel\">\
												Title <span class=\"charLimit\">(52 characters maximum)</span>\
											</p>\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltitle_id\" name=\"carouseltitle_id[4]\" value=\"681905\">\
                                                <input type=\"text\" class=\"slideTitle dataField carouseltitle\" name=\"carouseltitle[4]\" placeholder=\"Type in your slideshow title here\" value=\"Slide 5\" maxlength=\"52\">\
											</p>\
											<p class=\"fieldLabel\">\
												Message <span class=\"charLimit\">(1000 characters maximum)</span>\
											</p>\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltext_id\" name=\"carouseltext_id[4]\" value=\"681906\">\
												<textarea class=\"slideDescription dataField carouseltext\" name=\"carouseltext[4]\" rows=\"5\" placeholder=\"Type in your message here\" maxlength=\"172\">                                                    Light house                                                </textarea>\
											</p>\
										</fieldset>\
										<fieldset style=\"float: right;\">\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltoggle_id\" name=\"carouseltoggle_id[4]\" value=\"681904\">\
												<input type=\"checkbox\" name=\"carouseltoggle[4]\" id=\"carouseltoggle4\" class=\"carouselCheckbox carouseltoggle\" value=\"4\">\
												Visible\
											</p>\
										</fieldset>\
										<fieldset>\
											<input type=\"hidden\" class=\"carouselgroupId\" name=\"groupId[4]\" value=\"195244\">\
										</fieldset>\
									</div>\
																		<div id=\"slide_6\" class=\"carouselItem clearfix hide\">\
										<div class=\"slidePreview\">\
											<div class=\"slideshowImgWrap\">\
												<img src=\"/images/placeholders/ss-placeholder.png\" oldsrc=\"/images/placeholders/ss-placeholder.png\" class=\"carouselcustomfile_5 customfile\" title=\"Homepage Slideshow Image\" formparent=\"carouselcustomfile\" data-placeholder=\"/images/placeholders/ss-placeholder.png\">\
											</div>\
											<fieldset>\
												<input type=\"hidden\" class=\"hiddenImageIdField\" name=\"carouselcustomfile[5]\" value=\"\">\
												<input type=\"hidden\" class=\"carouselcustomfile_id\" id=\"carouselcustomfile_id\" name=\"carouselcustomfile_id[5]\" value=\"\">\
												<input type=\"hidden\" name=\"clearCarouselImage-5\" value=\"\">\
												<button id=\"carouselcustomfile[5]\" name=\"carouselcustomfile[5]\" class=\"getFile customfile adminBlueBtn gradient\" data-width=\"294\" data-height=\"198\" data-type=\"img\" data-existed=\"\">upload image</button>\
												<button type=\"button\" name=\"clearSlideShowImage\" class=\"clearLink\" style=\"margin-right:5px;\">clear image</button>\
											</fieldset>\
										</div>\
										<fieldset>\
											<p class=\"fieldLabel\">\
												Title <span class=\"charLimit\">(52 characters maximum)</span>\
											</p>\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltitle_id\" name=\"carouseltitle_id[5]\" value=\"681901\">\
                                                <input type=\"text\" class=\"slideTitle dataField carouseltitle\" name=\"carouseltitle[5]\" placeholder=\"Type in your slideshow title here\" value=\"Slide 6 Updated\" maxlength=\"52\">\
											</p>\
											<p class=\"fieldLabel\">\
												Message <span class=\"charLimit\">(1000 characters maximum)</span>\
											</p>\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltext_id\" name=\"carouseltext_id[5]\" value=\"681902\">\
												<textarea class=\"slideDescription dataField carouseltext\" name=\"carouseltext[5]\" rows=\"5\" placeholder=\"Type in your message here\" maxlength=\"172\">                                                    marker Updated                                                </textarea>\
											</p>\
										</fieldset>\
										<fieldset style=\"float: right;\">\
											<p class=\"formField\">\
												<input type=\"hidden\" class=\"carouseltoggle_id\" name=\"carouseltoggle_id[5]\" value=\"681900\">\
												<input type=\"checkbox\" name=\"carouseltoggle[5]\" id=\"carouseltoggle5\" class=\"carouselCheckbox carouseltoggle\" value=\"5\">\
												Visible\
											</p>\
										</fieldset>\
										<fieldset>\
											<input type=\"hidden\" class=\"carouselgroupId\" name=\"groupId[5]\" value=\"195243\">\
										</fieldset>\
									</div>\
																	</div>\
								<div>\
									<span class=\"errormsg\"></span>\
								</div>\
								<fieldset class=\"updateButtons\">\
									<input type=\"hidden\" name=\"adminAction\" value=\"updateCarouselItems\">\
									<button type=\"submit\" id=\"carouselSubmit\" class=\"adminFormSubmit adminBlueBtn gradient\">Update</button>\
									<p class=\"cancelLink\">Cancel</p>\
								</fieldset>\
\
							</div>\
						</form>\
					</section>\
					<section class=\"adminSection\">\
						<div class=\"adminSectionHeader\">\
							<h3>VIP Section</h3>\
							<form name=\"vipMessageToggleForm\" action=\"/admin/updateComponent\" method=\"post\">\
								<fieldset>\
									<p class=\"formField\">\
										<input type=\"checkbox\" id=\"VIP_messagetoggle\" name=\"VIP_messagetoggle\" class=\"slideToggle\" show-label=\"ON\" hide-label=\"OFF\" checked> <input type=\"hidden\" name=\"VIP_messagetoggle_id\" id=\"VIP_messagetoggle_id\" value=\"672731\">\
										<span class=\"feedback\"></span> <sub class=\"instruction\"></sub>\
									</p>\
								</fieldset>\
								<fieldset class=\"updateButtons\">\
									<input type=\"hidden\" class=\"VIP_messagegroupId\" name=\"groupId\" id=\"VIP_messagegroupId\" value=\"183698\"> <input type=\"hidden\" name=\"adminAction\" value=\"updateVIPMessageToggle\"> <span class=\"hidden\"><button type=\"submit\" data-field=\"toggle\" id=\"vipToggleSubmit\" class=\"adminFormSubmit adminBlueBtn gradient\">Save</button> </span>\
\
								</fieldset>\
							</form>\
						</div>\
						<div class=\"adminSectionContent\">\
							<form name=\"vipMessageForm\" action=\"/admin/updateComponent\" method=\"post\" class=\"clearfix\">\
								<sub class=\"instruction\">A spokesperson from your organization\
									can share a message.</sub>\
								<fieldset>\
									<p class=\"fieldLabel\">\
										Title <span class=\"charLimit\">(30 characters maximum)</span>\
									</p>\
									<p class=\"formField\">\
										<textarea class=\"rte dataField\" id=\"VIP_messagetitle\" name=\"VIP_messagetitle\" cols=\"25\" rows=\"2\" placeholder=\"Type in your VIP title here\" data-length=\"30\" data-maxlength=\"30\">																					</textarea>\
										<input type=\"hidden\" id=\"VIP_messagetitle_id\" name=\"VIP_messagetitle_id\" value=\"\">\
										<input type=\"hidden\" name=\"VIP_messagetitleErr\" id=\"VIP_messagetitleErr\" value=\"No\"> <span class=\"feedback\"></span>\
										<sub class=\"instruction\"></sub>\
									</p>\
									<p class=\"fieldLabel\">\
										Message <span class=\"charLimit\">(1,000 characters maximum)</span>\
									</p>\
									<p class=\"formField\">\
										<input type=\"hidden\" id=\"VIP_messagetext_id\" name=\"VIP_messagetext_id\" value=\"\">\
										<textarea class=\"rte dataField\" id=\"VIP_messagetext\" name=\"VIP_messagetext\" cols=\"25\" rows=\"3\" placeholder=\"Type in your message here.\" data-length=\"999\" data-maxlength=\"1000\">																					</textarea>\
										<input type=\"hidden\" name=\"VIP_messagetextErr\" id=\"VIP_messagetextErr\" value=\"No\"> <span class=\"feedback\"></span>\
										<sub class=\"instruction\"></sub>\
									</p>\
								</fieldset>\
								<div class=\"mediaWrapper vip\">\
									<p class=\"fieldLabel\">\
										VIP Image <span>(Your image should be 120 pixels by 160\
											pixels)</span>\
									</p>\
									<div class=\"imageWrap\">\
										<img class=\"VIP_messagecustomfile customfile\" src=\"/images/placeholders/vip-placeholder.png\" oldsrc=\"/images/placeholders/vip-placeholder.png\" formparent=\"VIP_messagecustomfile\" data-image=\"\" data-placeholder=\"/images/placeholders/vip-placeholder.png\">\
									</div>\
									<fieldset>\
										<input type=\"hidden\" class=\"hiddenImageIdField\" name=\"VIP_messagecustomfile\" value=\"\">\
										<input type=\"hidden\" id=\"VIP_messagecustomfile_id\" name=\"VIP_messagecustomfile_id\" value=\"\">\
										<button id=\"VIP_messagecustomfile\" name=\"VIP_messagecustomfile\" class=\"getFile customfile adminBlueBtn gradient\" data-width=\"120\" data-height=\"160\" data-type=\"img\" data-existed=\"\">upload image</button>\
		                					<p class=\"clearLink\">clear image</p>\
									</fieldset>\
								</div>\
								<div class=\"mediaWrapper vip sig\">\
									<p class=\"fieldLabel\">\
										VIP Signature <span>(Your image should be 300 pixels by 100\
											pixels)</span>\
									</p>\
									<div class=\"imageWrap\">\
										<img src=\"/images/placeholders/vip-placeholder.png\" oldsrc=\"/images/placeholders/vip-placeholder.png\" class=\"VIP_messagesignature customfile\" formparent=\"VIP_messagesignature\" data-image=\"\" data-placeholder=\"/images/placeholders/vip-placeholder.png\">\
									</div>\
									<fieldset>\
										<!-- CUSTOM_FILE ID value -->\
										<input type=\"hidden\" class=\"hiddenImageIdField\" name=\"VIP_messagesignature\" value=\"\">\
										<!-- COMPONENT_SETTING ID value -->\
										<input type=\"hidden\" id=\"VIP_messagesignature_id\" name=\"VIP_messagesignature_id\" value=\"\">\
										<button id=\"VIP_messagesignature\" name=\"VIP_messagesignature\" class=\"getFile customfile adminBlueBtn gradient\" data-width=\"300\" data-height=\"100\" data-type=\"img\" data-existed=\"\">upload image</button>\
		                					<p class=\"clearLink\">clear image</p>\
									</fieldset>\
									<fieldset class=\"updateButtons\">\
										<input type=\"hidden\" class=\"VIP_messagegroupId\" name=\"groupId\" id=\"VIP_messagegroupId\" value=\"183698\">\
										<input type=\"hidden\" name=\"adminAction\" value=\"updateVIPMessage\">\
										<button type=\"submit\" id=\"vipSubmit\" class=\"adminFormSubmit adminBlueBtn gradient\">update</button>\
										<p class=\"cancelLink\">Cancel</p>\
									</fieldset>\
								</div>\
							</form>\
						</div>\
					</section>\
				</div>\
\
                <!--********************-->\
                <!--**MY QUEUE SECTION**-->\
                <!--********************-->\
\
                <div id=\"myQueuePage\">\
\
                </div>\
\
                <!--********************-->\
                <!--***SIDEBAR SECTION**-->\
                <!--********************-->\
\
                <div id=\"sideBar\">\
                    <section class=\"adminSection\">\
                        <form name=\"videoTourForm\" action=\"/admin/updateComponent\" method=\"post\">\
                            <div class=\"adminSectionHeader\">\
                                <h3>Video (Right Sidebar)</h3>\
                                <fieldset>\
                                    <p class=\"formField\">\
                                        <input type=\"checkbox\" name=\"video_tourtoggle\" id=\"video_tourtoggle\" class=\"slideToggle\" show-label=\"ON\" hide-label=\"OFF\" checked>\
                                        <input type=\"hidden\" name=\"video_tourtoggle_id\" id=\"video_tourtoggle_id\" value=\"652820\">\
                                        <span class=\"feedback\"></span> <sub class=\"instruction\"></sub>\
                                    </p>\
                                </fieldset>\
                            </div>\
                            <div class=\"adminSectionContent videoUploadSection\">\
                                <sub class=\"instruction\">Upload a video to appear on your right\
                                    hand side column of the pages.<br> <b>Accepted file types are\
                                        MP4 and WEBM. Maximum file size is 100MB.</b>\
                                </sub>\
                                <fieldset>\
                                    <p class=\"fieldLabel\">\
                                        Title <span class=\"charLimit\">(68 characters)</span>\
                                    </p>\
                                    <p class=\"formField\">\
                                        <input type=\"text\" name=\"video_tourtitle\" id=\"video_tourtitle\" class=\"video_tourtitle\" placeholder=\"Type in your Video title here\" maxlength=\"68\" data-maxlength=\"68\" value=\"My English Title\">\
                                        <input type=\"hidden\" name=\"video_tourtitleErr\" id=\"video_tourtitleErr\" value=\"No\">\
                                        <input type=\"hidden\" id=\"video_tourtitle_id\" name=\"video_tourtitle_id\" value=\"652818\">\
                                    </p>\
                                    <p class=\"fieldLabel\">\
                                        Video &amp; Custom Image <span>(Your image should be 1342 pixels by 832 pixels)</span>\
                                    </p>\
                                    <div class=\"imageWrap\">\
                                        <img src=\"https://nsg-console.qa7.lrn.com/custom_files/6825_15729696_1398382683-00002.jpg\" oldsrc=\"https://nsg-console.qa7.lrn.com/custom_files/6825_15729696_1398382683-00002.jpg\" class=\"video_tourthumbnail video_tourcustomfile customfile\" data-type=\"vid\" width=\"200\" height=\"150\" formparent=\"video_tourcustomfile\" data-placeholder=\"/images/placeholders/video-placeholder.png\">\
                                    </div>\
                                    <p class=\"constraint\">Maximum file size is 100MB</p>\
                                    <fieldset>\
                                        <input type=\"hidden\" class=\"hiddenImageIdField\" name=\"video_tourcustomfile\" value=\"207289\">\
                                        <input type=\"hidden\" id=\"video_tourcustomfile_id\" name=\"video_tourcustomfile_id\" value=\"652821\">\
                                        <input type=\"hidden\" class=\"hiddenImageIdField\" name=\"video_tourthumbnail\" value=\"\">\
                                        <input type=\"hidden\" id=\"video_tourthumbnail_id\" name=\"video_tourthumbnail_id\" value=\"\">\
                                        <button id=\"video_tourcustomfile\" name=\"video_tourcustomfile\" class=\"getFile customfile adminBlueBtn gradient\" data-width=\"640\" data-height=\"480\" data-type=\"vid\">Replace Video</button>\
                                        <button id=\"video_tourthumbnail\" name=\"video_tourthumbnail\" class=\"getFile customfile adminBlueBtn gradient \" data-width=\"640\" data-height=\"480\" data-type=\"img\" data-property=\"noLabelChange\">Replace Thumbnail</button>\
                                    </fieldset>\
                                    <p class=\"fieldLabel\">\
                                        Description <span class=\"charLimit\">(580 characters)</span>\
                                    </p>\
                                    <p class=\"formField\">\
                                        <textarea id=\"video_tourtext\" name=\"video_tourtext\" placeholder=\"Please enter a description of your video\" data-maxlength=\"580\">                                            My English Desc                                        </textarea>\
                                        <input type=\"hidden\" name=\"video_tourtextErr\" id=\"video_tourtextErr\" value=\"No\">\
                                        <input type=\"hidden\" name=\"video_tourtext_id\" id=\"video_tourtext_id\" value=\"652819\">\
                                    </p>\
\
                                    <p class=\"fieldLabel\">Visibility</p>\
                                    <p class=\"constraint\">Select the pages that you would like your video to be visible on:</p>\
                                    <fieldset id=\"videoTourVisibility\">\
                                       <p><input type=\"checkbox\" id=\"visibilityLogin\" value=\"login\" data-value=\"login\"> Login Page</p>\
                                       <p>\
                                          <input type=\"checkbox\" id=\"visibilityHome\" value=\"home\" data-value=\"home\"> Home Page\
                                       </p>\
                                       <p><input type=\"checkbox\" id=\"visibilityMyqueue\" value=\"myqueue\" data-value=\"myqueue\"> My Queue Page</p>\
                                       <p><input type=\"checkbox\" id=\"visibilityCatalog\" value=\"catalog\" data-value=\"catalog\"> Catalog Page</p>\
                                       <p><input type=\"checkbox\" id=\"visibilityResource\" value=\"resource\" data-value=\"resource\"> Resource Page</p>\
                                       <p><input type=\"checkbox\" id=\"visibilityHistory\" value=\"history\" data-value=\"history\"> History Page</p>\
                                       <p><input type=\"checkbox\" id=\"visibilityProfile\" value=\"profile\" data-value=\"profile\"> Profile Page</p>\
                                       <input type=\"hidden\" id=\"video_tourvisibility\" name=\"video_tourvisibility\" value='[\"login\",\"home\",\"myqueue\",\"catalog\",\"resource\",\"history\",\"profile\"]'>\
                                       <input type=\"hidden\" id=\"video_tourvisibility_id\" name=\"video_tourvisibility_id\" value=\"652822\">\
                                    </fieldset>\
                                    <div id=\"videoPlayer\"></div>\
                                </fieldset>\
                                <fieldset class=\"updateButtons\">\
                                    <input type=\"hidden\" class=\"video_tourgroupId\" name=\"groupId\" id=\"video_tourgroupId\" value=\"183092\">\
                                    <input type=\"hidden\" name=\"adminAction\" value=\"updateVideoTour\">\
                                    <button type=\"submit\" id=\"videoTourSubmit\" class=\"adminFormSubmit adminBlueBtn gradient\">update</button>\
                                    <p class=\"cancelLink\">Cancel</p>\
                                </fieldset>\
                            </div>\
                        </form>\
                    </section>\
                </div>\
                <div class=\"updateBtns\">\
                    <button type=\"submit\" id=\"saveAll\" disabled class=\"adminBlueBtn gradient disabled\">Save All</button>\
                    <button disabled class=\"cancelAllLink adminCancelBtn disabled\">Cancel</button>\
                </div>\
			</div>\
			<input type=\"hidden\" id=\"selTab\" value=\"global\">\
			<input type=\"hidden\" id=\"selTabId\" value=\"ui-id-2\">\
			<input type=\"hidden\" id=\"selTabBfr\" value=\"global\">\
			<input type=\"hidden\" id=\"selTabBfrId\" value=\"ui-id-2\">\
			<input type=\"hidden\" id=\"cancelAllClick\" value=\"No\">\
		</div>\
	</div>\
	<div id=\"personalize\">\
		<div id=\"my_status\" class=\"hidden\">\
			<section class=\"adminSection\">\
				<form name=\"my_statusForm\" action=\"/admin/updateComponent\" method=\"post\">\
					<div class=\"adminSectionHeader noExpand\">\
						<h3>Show My Status (Left Sidebar)</h3>\
						<fieldset>\
							<p class=\"formField\">\
								<input type=\"checkbox\" id=\"my_statustoggle\" name=\"my_statustoggle\" class=\"slideToggle\" show-label=\"ON\" hide-label=\"OFF\" checked> <input type=\"hidden\" name=\"my_statustoggle_id\" id=\"my_statustoggle_id\" value=\"651611\">\
								<input type=\"hidden\" class=\"my_statusgroupId\" name=\"groupId\" id=\"my_statusgroupId\" value=\"182793\">\
								<input type=\"hidden\" name=\"adminAction\" value=\"updatemyStatus\">\
								<span class=\"hidden\"><button type=\"submit\" class=\"adminFormSubmit adminBlueBtn gradient\">Update My Status</button> </span>\
							</p>\
						</fieldset>\
					</div>\
				</form>\
			</section>\
		</div>\
		<div id=\"show_completed\" class=\"hidden\">\
			<section class=\"adminSection\">\
				<form name=\"completed_courses_onmyqueueForm\" action=\"/admin/updateComponent\" method=\"post\">\
					<div class=\"adminSectionHeader noExpand\">\
						<h3>Show completed courses on My Queue</h3>\
						<fieldset>\
							<p class=\"formField\">\
								<input type=\"checkbox\" id=\"completed_courses_onmyqueuetoggle\" name=\"completed_courses_onmyqueuetoggle\" class=\"slideToggle\" show-label=\"ON\" hide-label=\"OFF\" checked> <input type=\"hidden\" name=\"completed_courses_onmyqueuetoggle_id\" id=\"completed_courses_onmyqueuetoggle_id\" value=\"651610\">\
								<input type=\"hidden\" class=\"completed_courses_onmyqueuegroupId\" name=\"groupId\" id=\"completed_courses_onmyqueuegroupId\" value=\"182792\">\
								<input type=\"hidden\" name=\"adminAction\" value=\"updatecompleted_courses_onmyqueue\"> <span class=\"hidden\"><button type=\"submit\" class=\"adminFormSubmit gradient\">Show\
										completed courses on My Queue</button> </span>\
							</p>\
						</fieldset>\
					</div>\
				</form>\
			</section>\
		</div>\
	</div>\
</div>\
<input type=\"hidden\" name=\"slideVal\" id=\"slideVal\" value=\"NotSet\">\
<input type=\"hidden\" name=\"initialLoad\" id=\"initialLoad\" value=\"Yes\">\
<input type=\"hidden\" name=\"baseImgPath\" id=\"baseImgPath\" value=\"https://nsg-console.qa7.lrn.com\">\
<input type=\"hidden\" name=\"videoFile\" id=\"videoFile\" value=\"NotSet\">\
<input type=\"hidden\" name=\"accordianOpen\" id=\"accordianOpen\" value=\"0\">\
<input type=\"hidden\" name=\"btnsCheck\" id=\"btnsCheck\" value=\"Yes\">\
<input type=\"hidden\" name=\"saveAllCheck\" id=\"saveAllCheck\" value=\"No\">\
<input type=\"hidden\" name=\"cancelAllCheck\" id=\"cancelAllCheck\" value=\"No\">\
<input type=\"hidden\" name=\"afterClose\" id=\"afterClose\" value=\"No\">\
\
<div id=\"userSaveSelection\"></div>\
<div id=\"fileTool\" style=\"display: none;\">\
	<div id=\"fileLibrary\" class=\"ui-dialog-content ui-widget-content contentBgColor ui-tabs ui-widget ui-corner-all\">\
	    <ul class=\"fileToolNav ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all\">\
	        <li><a id=\"tab-upload\" href=\"#uploadView\">Upload</a></li>\
	        <li><a id=\"tab-libraryload\" href=\"#library\">Library</a></li>\
	    </ul>\
	    <div id=\"tabCurtain\" class=\"hidden\"></div>\
	    <div id=\"uploadView\">\
	        <form id=\"fileupload\" action=\"/files/upload\" method=\"POST\" enctype=\"multipart/form-data\">\
	            <noscript>You must have JavaScript enabled to use this feature.</noscript>\
	            <div class=\"fileupload-buttonbar\">\
                    <span class=\"button fileinput-button fileUploadBtn\">\
                        <span>Browse Files</span>\
                        <input type=\"file\" name=\"files[]\" multiple>\
                    </span>\
                    <button type=\"submit\" class=\"fileupload-start disabled fileUploadBtn\" disabled>Start Upload</button>\
                    <button type=\"reset\" class=\"fileupload-cancel cancel disabled fileUploadBtn\" disabled><span>Cancel upload</span></button>\
    	            <div class=\"uploadRequirements\">\
                        <p>Allowed file types: jpg, jpeg, gif, png, mp4, ogg.<span> 50 MB per file.</span></p>\
                    </div>\
                    <div class=\"uploadStatus\">\
                        <p class=\"uploadLoading\"></p>\
                        <div class=\"fileupload-progress fade\">\
                            <div class=\"progress progress-success progress-striped active\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\">\
                                <div class=\"bar\" style=\"width:0%;\"></div>\
                            </div>\
                            <div class=\"progress-extended\">&nbsp;</div>\
                        </div>\
                    </div>\
                    <p class=\"selectAllBar\">\
                        <label for=\"selectAll\">Select All:</label>\
                        <input type=\"checkbox\" class=\"toggle\" name=\"selectAll\">\
                        <a class=\"delete\" href=\"#\">Delete Selected</a>\
                    </p>\
                </div>\
	            <section class=\"files\"></section>\
	        </form>\
	    </div>\
	    <div id=\"library\">\
	       <div id=\"dynamicFileList\" class=\"clearfix\"></div>\
	    </div>\
	    <input type=\"hidden\" name=\"filetype\" id=\"filetype\" value=\"all\">\
	    <div id=\"fileFilter\" style=\"float:right\">\
	       <span id=\"allFile\"><a href=\"#\" class=\"filefilter\" data-type=\"\">All</a>(<span class=\"number\">0</span>)</span>\
	       <span id=\"doc\"><a href=\"#\" class=\"filefilter\" data-type=\"doc\">Documents</a>(<span class=\"number\">0</span>)</span>\
	       <span id=\"image\"><a href=\"#\" class=\"filefilter\" data-type=\"image\">Images</a>(<span class=\"number\">0</span>)</span>\
	       <span id=\"video\"><a href=\"#\" class=\"filefilter\" data-type=\"video\">Videos</a>(<span class=\"number\">0</span>)</span>\
	    </div>\
	</div>\
\
<!--<div id=\"fileTool\" style=\"display: none;\">\
    <ul class=\"fileToolNav\">\
        <li><a id=\"tab-upload\" href=\"#uploadView\">Upload</a></li>\
        <li><a id=\"tab-library\" href=\"/files/library\">Library</a></li>\
    </ul>\
    <div id=\"tabCurtain\" class=\"hidden\"></div>\
    <div id=\"uploadView\" class=\"clearfix\">\
        <form id=\"fileupload\" action=\"/files/upload\" method=\"POST\" enctype=\"multipart/form-data\">\
            <noscript>You must have JavaScript enabled to use this feature.</noscript>\
            <div class=\"fileupload-buttonbar\">\
                <span class=\"button fileinput-button fileUploadBtn\">\
                    <span>Browse Files</span>\
                    <input type=\"file\" name=\"files[]\" multiple=\"multiple\" />\
                </span>\
                <button type=\"submit\" class=\"fileupload-start disabled fileUploadBtn\" disabled=\"disabled\">Start Upload</button>\
                <button type=\"reset\" class=\"fileupload-cancel cancel disabled fileUploadBtn\" disabled=\"disabled\">\
                    <span>Cancel upload</span>\
                </button>\
            </div>\
            <div class=\"uploadRequirements\">\
                <p>Your image should be \
                    <span class=\"uploadWidth\"></span> x \
                    <span class=\"uploadHeight\"></span> pixels.\
                </p>\
                <p> Allowed file types: jpg, jpeg, gif, png, mp4, ogg.\
                    <span>50 MB per file.</span>\
                </p>\
            </div>\
            <div class=\"uploadStatus\">\
                <p class=\"uploadLoading\"></p>\
                <div class=\"fileupload-progress fade\">\
                    <div class=\"progress progress-success progress-striped active\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\">\
                        <div class=\"bar\" style=\"width:0%;\"></div>\
                    </div>\
                    <div class=\"progress-extended\">&nbsp;</div>\
                </div>\
            </div>    \
            <p class=\"selectAllBar\">\
                <label for=\"selectAll\">Select All:</label>\
                <input type=\"checkbox\" class=\"toggle\" name=\"selectAll\" />\
                <a class=\"delete\" href=\"#\">Delete Selected</a>\
            </p>\
            <section class=\"files\"></section>\
        </form>\
    </div>\
    <input type=\"hidden\" name=\"filetype\" id=\"filetype\" value=\"NotSet\">\
</div>-->\
\
<!-- The template to display files available for upload -->\
<!-- <button class=\"link fileupload-start\">Upload</button> -->\
<!-- DO NOT REMOVE OR JS ERROR WILL OCCUR -->\
<script id=\"template-upload\" type=\"text/x-tmpl\">\
{% for (var i=0, file; file=o.files[i]; i++) { %}\
    <div class=\"uploadQueue fade ui-corner-all\">\
        <input type=\"checkbox\" name=\"delete\" class=\"delete\" value=\"1\">\
        <div class=\"preview\"><span class=\"fade\"></span></div>\
        <div class=\"info\">\
            <h4 title=\"{%=file.name%}\">\
				{% if (file.name.length > 20) { %}\
                	{%=file.name.substring(0,10)%}...{%=file.name.substring(file.name.lastIndexOf(\'.\')-10)%}\
				{% } else { %}\
					{%=file.name%}\
				{% } %}\
            </h4>\
            <span class=\"size\">{%=o.formatFileSize(file.size)%}</span>\
            {% if (file.error) { %}\
                <p class=\"error ui-corner-all\">\
                    <span class=\"ui-icon ui-icon-alert\"></span>\
                    {%#file.error%}\
                </p>\
            {% } %}\
        </div>\
        <div class=\"controls\" >\
        {% if (!i) { %}\
            <button class=\"link fileupload-cancel\" title=\"Remove\"><i class=\"icon-close\"></i></button>\
            <button class=\"link fileupload-start\" style=\"display:none\">Upload</button>\
        {% } %}\
        </div>\
    </div>\
{% } %}\
</script>\
</div>                  </div>\
               </div>\
            </div>\
        </div>\
        <footer class=\"clearfix\">\
	<div class=\"footerWrapper\">\
		<div class=\"footerImages\">\
			<img src=\"/images/branding/lrn-logo.png\" title=\"LRN Inspiring Principled Performance\">\
			<img src=\"/images/branding/lrn-tagline.png\" title=\"LRN Inspiring Principled Performance\" class=\"footerLogo\">\
			<img src=\"/images/branding/TRUSTeLogo.png\" height=\"25\" title=\"TRUSTe Logo\" class=\"footerLogo\">\
		</div>\
		<p class=\"footerLinks\">&copy;  <span><a href=\"https://eca.lrn.com/terms-and-conditions\" target=\"_blank\" title=\"\"></a></span><span><a href=\"https://eca.lrn.com/privacy\" target=\"_blank\" title=\"Privacy Statement\">Privacy Statement</a></span><span><a href=\"http://www.lrn.com/About-LRN/about-lrn.html\" target=\"_blank\" title=\"\"></a></span>\
	</p></div>\
	<div id=\"messageModal\" class=\"hidden\">This is test modal</div>\
	<div id=\"innerMessageModal\" class=\"hidden\">This is test modal for a modal</div>\
</footer>\
    \
</body>\
");