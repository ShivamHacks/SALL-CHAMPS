$( document ).ready(function() {
    //$('body').append($('<div class="full-pg-background"></div>').hide().fadeTo(1000, 0.5).fadeIn(1000));
var body = $("body").height();
var win = $(window).height();

if (body > win-50 ) {
	$(".nav-footer").css("position", "relative");
}

});