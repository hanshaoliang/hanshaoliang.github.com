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
};

jQuery(document).ready(function(){

    if ($('#headerPlaceHolder').length == 0)
        return;

    $.get('header.html', function(data){
        html = $(data);
        headerHtml = html.find('.headerContent').html();
        $('#headerPlaceHolder').html(headerHtml);
        buildMenu();
    });
});