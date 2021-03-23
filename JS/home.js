$(function(){
    $("#b1").on('click', function(){
        $("#s1").fadeOut();
        $("#s1").removeClass(' vis');
        $("#s1").addClass(' vis');
        $("#s2").delay(3000).fadeIn();
    });
});