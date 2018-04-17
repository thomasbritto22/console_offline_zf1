if (typeof Lrn == 'undefined')
	Lrn = {};
if (typeof Lrn.Application == 'undefined')
	Lrn.Application = {};

/**
 * --- REVIEWS --- Responsible for displaying and maintaining a list of user
 * reviews for courses. This includes the creating, deleting, editing and
 * sorting of reviews.
 * 
 * @param config
 * @returns {Lrn.Application.Reviews}
 */
Lrn.Application.Reviews = function(config) {
	// set up default settings here for unique
	// settings in each instance
	this.config = {

	};
	// if any config values are passed in, override defaults
	if (config) 
		for ( var c in config)
			this.config[c] = config[c] || null;
	

	this.systemId = null;	
};

/**
 * --- REVIEWS PROTOTYPE --- We want to make Reviews a subclass of Application
 * so we will set the Reviews.prototype to the Lrn.Application object and make
 * sure we have the superclass available for overriding methods from
 * Lrn.Application.
 */
Lrn.Application.Reviews.prototype = new Lrn.Application();
Lrn.Application.Reviews.prototype.superclass = Lrn.Application.prototype;

/**
 * --- INITIALIZE REVIEWS --- This method makes sure that we call the init
 * method for our prototype, so that we are properly extended. It also calls
 * specific methods to get review specific data for the various parts of the
 * Review/Rating UI.
 */
Lrn.Application.Reviews.prototype.init = function() {
	// before we extend the superclass init method,
	// we call the init method of the superclass (Application.js)
	this.superclass.init.apply(this);

	// initalize all the views
	this.initViews();
	initPlaceholderText();

	

};

/**
 * --- INIT DIALOG --- This is an alternative to the init method in that it does
 * what init does, but it also makes sure to apply the dialog to the reviews
 * container.
 */
Lrn.Application.Reviews.prototype.initDialog = function() {
	var that = this;

	// put the module reviews in a jquery dialog
	$('#userReviewWrapper.reviewDialog').dialog({
						autoOpen : false,
						dialogClass : 'reviewsDialog secondaryBgColor',
						draggable : false,
						height : 800,
						modal : true,
						resizable : false,
						title : Lrn.Applications.Notifications.siteLabels.WriteReviewRateCourse,
						width : 830,
						position: { my: "center", at: "center", of: window },
						close : function() {
							// if we made the request to refreshReviews, abort
							// it
							if (typeof that.refreshReviews != 'undefined') {
								that.refreshReviews.abort();
							}
						}
					});
	

	// store the title so we can change out what we append
	var origDialogTitle = $('#userReviewWrapper.reviewDialog').dialog('option',
			'title');

};

/**
 * --- INITIALIZE VIEWS --- We are creating a separate method to do this so that
 * anytime we update the form (after saving, etc.) we can call this method to
 * re-init all the HTML elements that have been replaced.
 */
Lrn.Application.Reviews.prototype.initViews = function() {
	// init all of the views first
	this.initIntroView();
	this.initNoCompletionView();
	this.initFormView();
	this.initPrepopView();
	this.initVerifyView();

	this.initReviewText();

	// pass of the initing rating controls to another method.
	// this.initRatingControls();

	// if there is an prepop view, show it by default.
	// otherwise, show the noCompletion view (it does not co-exist with intro
	// view)
	// otherwise, show the intro view if it's available
	// otherwise, show the form view to get the user started. (form does not
	// co-exist with noCompletion)
	if ($('#prepopView').length)
		$('#prepopView').show();
	else if ($('#noCompletionView').length)
		$('#noCompletionView').show();
	else if ($('#introView').length)
		$('#formView').show();
	else
		$('#formView').show();
};

/**
 * --- INITIALIZE INTRO VIEW --- This view just tells the user what is going on,
 * why they are seeing this and what they should do. It also lets them opt out
 * of participating.
 */
Lrn.Application.Reviews.prototype.initIntroView = function() {
	// Intro View Events
	$('#reviewOptIn').on('click', function(e) {
		e.preventDefault();
		$('#introView').hide();
		$('#formView').show();
	});
	$('#reviewOptOut').on('click', function(e) {
		e.preventDefault();
		$('#moduleReviews').dialog('close');
	});
};

/**
 * --- INITIALIZE NO COMPLETION VIEW --- This view just tells the user what is
 * going on, why they are seeing this and what they should do. It also lets them
 * take the course or go back to preview. XXX NOT USING THIS RIGHT NOW
 */
Lrn.Application.Reviews.prototype.initNoCompletionView = function() {
	// the back button should take the user back to the preview page.
	$('#reviewOptOut').on('click', function() {
		document.location.href = $(this).attr('href');
	});
};

/**
 * --- INITIALIZE FORM VIEW --- This is the view with the form that users use to
 * fill out. We have rating controls and buttons to deal with.
 */
Lrn.Application.Reviews.prototype.initFormView = function() {
	// create a familiar var for diff scopes
	var that = this;

	// re-init the form fields in Lrn.Application.
	// do this so IE re-renders the placeholder in the review input textarea
	// this.superclass.initFormFields.apply(this);

	// store our form view in the reviews object so that
	// if we want to regenerate the form, we can do it without UI work.
	// probably not the best decision, but I don't care.
	this.currentViews = $('#userReviewWrapper').html();
	this.currentViews = typeof (this.currentViews) === 'string' ? this.currentViews
			.toString()
			: '';

	// Event handling for submit button
	$('#reviewSubmit').on('click', function(e) {
		e.preventDefault();
		that.doSave();
	});

	// Event handling for cancel button
	$('#reviewCancel').on('click', function(e) {
		e.preventDefault();
		that.doCancel();
		initPlaceholderText();
		that.initRatingControls(); //ensure that click handlers are
	});

	
};

/**
 * --- INITIALIZE PREPOP VIEW --- This view either goes to the form view, or the
 * verify view. Nothing really special here.
 */
Lrn.Application.Reviews.prototype.initPrepopView = function() {
	// Prepop View Events
	$('#reviewEdit').on('click', function(e) {
		e.preventDefault();
		$('#formView').show();
		$('#prepopView').hide();
	});
	$('#reviewDelete').on('click', {thisObj:this}, function(e) {
		e.preventDefault();
		var verifyForm = '<form id="deleteForm" action="/reviews/delete">'
			        	+ '<fieldset>'
			            + '<p class="contentTextIcons font-style4">' + Lrn.Applications.Notifications.siteLabels.DeleteWarningRatingReview + '</p>'
			            + '<p class="contentTextIcons font-style4">' + Lrn.Applications.Notifications.siteLabels.ConfirmMessage + '</p>'
			        	+ '</fieldset>'
			        	+ '<fieldset class="reviewFormButtons">'
			            + '<input type="hidden" name="systemId" value="' + this.systemId + '" />'
			            + '<button id="reviewYes" class="customButton">' + Lrn.Applications.Notifications.siteLabels['Continue'] + '</button>'
			            + '<button id="reviewNo" class="customSecondaryBtn">' + Lrn.Applications.Notifications.siteLabels.Cancel + '</button>'
			        	+ '</fieldset>'
			    		+ '</form>'
		$("#messageModal").html(verifyForm);
		$('#messageModal').dialog({
			resizable: false,
		   	width: 420,
		   	modal: true,
		   	height: 150,
		   	title: Lrn.Applications.Notifications.siteLabels.Warning,
		   	buttons: {},
		   	closeOnEscape: false,
		   	open: function(event, ui){
		   	}
		});
	}.bind(this));
};

/**
 * --- INITIALIZE VERIFY VIEW --- This view will either result in the user going
 * back to the prepopulated view, or will actually delete the review/ratings and
 * return the user to the form view to write another if they want.
 */
Lrn.Application.Reviews.prototype.initVerifyView = function() {
	var that = this;
	// Verify View Events
	$('#reviewYes').live('click', function(e) {
		e.preventDefault();
		that.doDelete();
		$('#messageModal').dialog('close');
	});
	$('#reviewNo').live('click', function(e) {
		e.preventDefault();
		$('#verifyView').hide();
		$('#prepopView').show();
		$('#messageModal').dialog('close');
	});
};

/**
 * --- INIT RATING CONTROLS --- We need to activate the rating control tooltips
 * as well as any rating controls themselves.
 */
Lrn.Application.Reviews.prototype.initRatingControls = function() {
	$('.ratingsTooltipWrapper').each(function() {
		var tooltip = new Lrn.Widget.Tooltip($(this).find('.ratingsTooltip'));
		window.tooltip = tooltip;

		$(this).find('.ratingsTooltipArrow').live('click', function(e) {
			e.stopPropagation();

			var thisObj = $(e.target || e.srcElement);

			if($(thisObj).siblings().css('display') === 'none' || $(thisObj).siblings().css('display') === ''){
				tooltip.show($(e.target)); 
			} else {                               
				tooltip.hide($(e.target));
			}
			
		});
	});

	$('#reviewForm .wholeControl').click(function() {

		$(this).parent().find('.controlItemRadio').attr('checked', true).prop('checked', true);

		// make all previous stars whole
		$(this).parent().prevAll().removeClass('none half');
		$(this).parent().prevAll().addClass('whole');

		// make this star whole
		$(this).parent().removeClass('none half');
		$(this).parent().addClass('whole');

		// make all preceding stars empty
		$(this).parent().nextAll().removeClass('half whole');
		$(this).parent().nextAll().addClass('none');

	});
};

/**
 * --- SAVE REVIEW AND RATINGS --- This method does a bit of logic, then submits
 * the review to the server via ajax.
 */
Lrn.Application.Reviews.prototype.doSave = function() {
	var that = this;

	// grab the form data now so we can do stuff with it.
	var rrData = $('#reviewForm').serialize();

	// check that the user was able to even see the ratings
	// some sites might have ratings turned off.
	var hasRatingsPanel = $('#ratingsPanel').length;

	// look whether the user is submiting the overview rating
	// this will have a _2 at the end. Others have _1.
	// Update 12/19/2014 - We are looking for ratingId_21_ exact key word for Overall rating bar. 
	var hasOverview = rrData.match(/ratingId_[0-9]+_2/g);
	
	// if the rating panel isn't displaying, then proceed.
	// if the rating panel IS displaying, the user must
	// at least have rated the overall category to proceed.
	if (!hasRatingsPanel || (hasRatingsPanel && hasOverview)) {
		// clear the form, and show a loading graphic
		$('#reviewForm').empty();
		$('#reviewForm').html(
				'<div class="waiting" style="height:150px"></div>');

		// save review/rating
		$.ajax({
			url : '/reviews/save',
			type : 'post',
			data : rrData,
			success : function(response) {
				// console.log('/reviews/save success');
				// update the current views so we have a new
				// representation to show if user clicks cancel.
				that.currentViews = response;
				// remove the current list and form
				// replace it with the new list and form
				$('#reviewListWrapper').remove();
				$('#reviewFormWrapper').remove();
				$('#userReviewWrapper').append(response);

				// show the prepopulated view (with the users update)
				$('#prepopView').show();

				// re-initialize the views
				that.initViews();
				that.initRatingControls(); //ensure that click handlers are
				// reattached.
			},
			error : function(response) {
				// console.log('/reviews/save error');
				alert(Lrn.Applications.Notifications.siteErrors.CEA028);
			}
		});
	} else {
		if(Lrn.Applications.Notifications.siteLabels != undefined || Lrn.Applications.Notifications.siteLabels != null){
			this.displayAlert('error.png', Lrn.Applications.Notifications.siteLabels.ProvideRating);
			this.closeAlert(2000)
		}
	}
};

/**
 * --- CANCEL PUBLISH --- This method is called when the user clicks cancel on
 * the review/rating form.
 */
Lrn.Application.Reviews.prototype.doCancel = function() {
	// console.log('Lrn.Application.Reviews.prototype.doCancel()');
	// console.log(this);
	// user will never know if we just replace the views.
	// this allows us to get the form back to what it was
	// without having to do a lot of UI work.
	$('#reviewListWrapper').remove();
	$('#reviewFormWrapper').remove();
	$('#userReviewWrapper').html(this.currentViews);
	// make sure our buttons still work
	this.initViews();

	// if we have an intro view, and no rating, go back to intro
	if ($('#introView').length && $('#prepopView').length == 0) {
		$('#formView').hide();
		$('#introView').show();
	}

	// if we have a review already, go back to the prepop view
	if ($('#prepopView').length) {
		$('#formView').hide();
		$('#prepopView').show();
	}

	if ($('#reviewForm').length) {
		this.initRatingControls();
	}

	if($('#reviewInput').val() == $('#reviewInput').attr('placeholder')){
		$('#reviewInput').val('');
	}
};

/**
 * --- DELETE REVIEW/RATINGS --- This method is called after the user verifies
 * that they want to delete the review/rating.
 */
Lrn.Application.Reviews.prototype.doDelete = function() {
	var that = this;

	// get the form data before we empty it
	var deleteData = $('#deleteForm').serialize();

	$.ajax({
		url : '/reviews/delete',
		type : 'post',
		data : deleteData,
		dataType: "html",
		success : function(response) {
			// remove the current list and form
			$('#reviewListWrapper').remove();
			$('#reviewFormWrapper').remove();

			var formHtml = $(response);

			formHtml.insertAfter('#userReviewWrapper > .courseTitle');
			$('#formView').show();
			$('#verifyView').hide();

			// re-initialize the views
			that.initViews();
			that.initRatingControls(); // ensure that click handlers are
			// reattached.
			
		},
		error : (function() {
			// 'Could not delete review'
			this.displayAlert('error.png' ,Lrn.Applications.Notifications.siteErrors.CEA019);
			this.closeAlert(1000);
		}).bind(this)
	});

}

Lrn.Application.Reviews.prototype.displayAlert = function(imageName, alertText)
{
	//Display loading spinner
	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/' +imageName+ '"  width=50 height=50/></span>' +alertText+ '</p>');
	$("#messageModal").dialog({
		   resizable: false,
		   dialogClass: "alertBox",
		   width: 300,
		   height: 150,
		   buttons: {},
		   closeOnEscape: false,
		   open: function(event, ui){
			   $(".alertBox .ui-dialog-titlebar-close", ui.dialog).hide(); 
			   $(".alertBox .ui-dialog-titlebar", ui.dialog).hide();
		   }
	});
}

Lrn.Application.Reviews.prototype.closeAlert = function(delay)
{
	setTimeout(function(){
		$("#messageModal").dialog("close");
	}, delay);
}

Lrn.Application.Reviews.prototype.initReviewText = function() {
	$('.reviewText').each(function(index, elem){
		var desc = countingWordPrep($(this).text());
		var shortDesc = thisManyWords($(this).text(), 20);
		if(desc != shortDesc){
			$(this).html('');
			$(this).html('<div class="shortDesc clearfix"><div class="customDesc">' + shortDesc + '</div> <a href="#" class="moreDesc">See More</a></div>');
			$(this).append('<div class="longDesc clearfix">' + desc + ' <a href="#" class="lessDesc">See Less</a></div>');
			$('.longDesc').hide();
			$('.moreDesc').on('click', function() {
				$(this).parent().hide();
				$(this).parent().next().show();
				return false;
			});
			$('.lessDesc').on('click', function() {
				$(this).parent().hide();
				$(this).parent().prev().show();
				return false;
			});
		}
	});
};

Lrn.Application.Reviews.prototype.setSystemId = function(systemId){
    this.systemId = systemId;
};