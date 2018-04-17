 $(document).ready(function(){
	// empty note padding adjustment
	$('.admin-section-category-note').each(function(){
		var noteContent = $(this).text().length;
		if (noteContent == 0 ) {
			$(this).addClass('noText');
		}
	});
    
    
    //navigation active class
    $('.nav-bar ul li a').click(function(){
         $('.nav-bar ul li a').removeClass('active-link');
        $(this).addClass('active-link');
    });
    
    // navigation menu show hide
    $('.account-section a').click(function(event){
        event.stopPropagation();
        $('.account-section ul').hide();
        $('.account-section a').removeClass('active-link');
        $(this).parent().find('ul').fadeIn();
        $(this).addClass('active-link');
    });
    
    $(document).on('click', function(){
        if ($('.account-section ul:visible').length !== 0){
            $('.account-section ul').hide();
            $('.account-section a').removeClass('active-link');
        }        
    });
    
    
    // extra categories in section
    $('.admin-section').each(function(){
        var categoryCount = $(this).find('.admin-section-category').length;
        if (categoryCount > 2) {
            $(this).addClass('fullWidth');
        }
    });
    
    
});


$(window).scroll(function(){
   var winScrollPos = $(window).scrollTop();
    if(winScrollPos == 0){
        $('.identity-bar, #content').removeAttr('style');
        $('.nav-bar').removeClass('toFixed');
    } else {
        $('.identity-bar').slideUp('slow');
        $('.nav-bar').addClass('toFixed');
        $('#content').css('padding-top','150px');
    }
});