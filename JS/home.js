import $ from "jquery";
$(document).ready(
    function(){
        $("#b1").click(function(){
            $("#s1").fadeOut(200);
            $("#s2").fadeIn(200);
        });
    }
);
