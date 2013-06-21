buildMenu = function() {
    var mouseover_tid = [];
    var mouseout_tid = [];
    jQuery('#menus > li').each(function(index){
        jQuery(this).hover(

            function(){
                var _self = this;
                clearTimeout(mouseout_tid[index]);
                mouseover_tid[index] = setTimeout(function() {
                    jQuery(_self).find('ul:eq(0)').slideDown(200);
                }, 400);
            },

            function(){
                var _self = this;
                clearTimeout(mouseover_tid[index]);
                mouseout_tid[index] = setTimeout(function() {
                    jQuery(_self).find('ul:eq(0)').slideUp(200);
                }, 400);
            }

        );
    });
	
	  //second level menu
        $('.second-level-menu-container').hover(
                function(){
                    var _self = this;
                    jQuery(_self).find('ul:eq(0)').slideDown(200);
                },

                function(){
                    var _self = this;
                    jQuery(_self).find('ul:eq(0)').slideUp(200);
                }
        );	
};


jQuery(document).ready(function(){

    if ($('#headerPlaceHolder').length == 0)
        return;

    $.get('header.html', function(data){
        html = $(data);
        headerHtml = $(html[1]).html()
        $('#headerPlaceHolder').html(headerHtml);
        buildMenu();
    });
});
