jQuery(document).ready(function(){

    $('.menu-item').not('.highlight').hover(
        function(){
            $(this).animate({opacity:1, duration: 100});
        },
        function(){
            $(this).animate({opacity:0.5, duration: 100});
        }
    );
});