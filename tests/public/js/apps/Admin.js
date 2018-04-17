describe("Admin tests",function(){

/**
 *  Unit test setup
 */
	Lrn = Lrn || {};
	Lrn.Widgets = Lrn.Widgets || {};
	
	var apps = new Lrn.Application.Admin();
	apps.isUnitTested = true;
	apps.defaultLanguage = 'en';
	  
	var successSpy = function(){
		console.log("successful Spy",arguments);
		return true;
	}
    
	admin_home_fixture.appendTo('body');
	apps.init();
	
/**
 * first nested suite -- init
 */
	describe("Admin init",function(){
		beforeEach(function(){		
			expect(Lrn.Application.Admin).toBeDefined();
		    expect(Lrn.Application.Admin).not.toBeNull();
		    expect(Lrn.Widgets.FileTool).toBeDefined();
		    expect(Lrn.Widgets.FileTool).not.toBeNull();
		});
		it('Our elements exist!', function(){
			expect($('.adminSection').length).toBeGreaterThan(0);
			expect($('.adminSectionContent').length).toBeGreaterThan(0);
			expect($('form[name="headerForm"]').length).toBeGreaterThan(0);
			expect($('.videoUploadSection .imageWrap img').length).toBeGreaterThan(0);
			expect($('.primaryTextIcons').length).toBeGreaterThan(0);
		});
	});
/**
 * nested suite -- callbacks
 */
	describe("callbacks", function(){
		var restoreUI;
		beforeEach(function(){
//			spyOn(apps,"initOnClickThemeUIRestoreAJAXResponse").andCallFake(successSpy);
			spyOn(apps,"initAjaxThemeUIApplyChangesResponse").andCallFake(successSpy);
//			spyOn(apps,"initOnChangeFieldLanguagesAJAXResponse").andCallFake(successSpy);
//			spyOn(apps,"initOnClickAdminFormSubmitAJAXResponse").andCallFake(successSpy);
//			spyOn(apps,"initOnClickLanguageSubmitAJAXResponse").andCallFake(successSpy);
//			spyOn(apps,"initTinyMCEClickFocus").andCallFake(successSpy);
//			spyOn(apps,"initTinyMCEChange").andCallFake(successSpy);
//			spyOn(apps,"initTinyMCEBlur").andCallFake(successSpy);
			
			restoreUI = $('<button>').on('click',apps.initOnClickThemeUIRestore.bind(apps));

			$('.getFile').each(apps.initSetGetFileButton.bind(apps));
			$('.getFile').on('click', apps.initOnClickGetFile.bind(apps) );
			$("#selectAll").change(apps.initOnChangeSelectAll.bind(apps));

			var settings = {
		    		selector: 'textarea.rte',
		    		menubar:false,
		    		statusbar:false,
		    		inline_styles: false,
		    		formats: {
		    		    underline: { inline: 'u', exact : true }
		    		},
		    		plugins: "paste link maxchars",
		            toolbar: "bold italic underline | alignleft aligncenter alignright alignjustify | bullist | link unlink | paste",
		            paste_auto_cleanup_on_paste : true,
		            paste_remove_styles: true,
		            paste_remove_styles_if_webkit: true,
		            paste_strip_class_attributes: "all",
		            max_chars: 20,
		            invalid_elements : "sub,span",
		           setup : function(ed){
		        	   this.initTinyMCE.bind(this,ed)
		           }.bind(apps)
		    };
		    tinymce.init(settings);
		    
		    $('.adminSection').each(apps.initAdminListEachAdminSection.bind(apps));
		    $('[class="clearLink"]:not([name="clearSlideShowImage"])').click(apps.clearImage.bind(apps));
		    $('[name="clearSlideShowImage"]').click(apps.initAdminListOnclickClearSlideShowImage.bind(apps));
		    $('#saveAll').click(apps.initAdminListOnclickSaveAll.bind(apps));
			$('.cancelAllLink').click(apps.initAdminListOnclickCancelAllLink.bind(apps));
			$('.adminFormSubmit').on('click', apps.initOnClickAdminFormSubmit.bind(apps));
		    $('#languagesSubmit').on('click', apps.initOnClickLanguageSubmit.bind(apps));
		});
		it("Testing fakes", function(){
			$('#saveAll').trigger('click');
			$('.cancelAllLink').trigger('click');
			restoreUI.trigger('click');
			$('.getFile').trigger('click');
			$("#selectAll").trigger('change');
			$('[class="clearLink"]:not([name="clearSlideShowImage"])').trigger('click');
			$('[name="clearSlideShowImage"]').trigger('click');
			$('.adminFormSubmit').trigger('click');
		    $('#languagesSubmit').trigger('click');
		});
	});
	it("Testing App methods",function(){
		apps.initSetClearImageObject();
		apps.resetFields();
		apps.hiddenImageInputChange($('.hiddenImageIdField'));
	});
})