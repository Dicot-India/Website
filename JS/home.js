var myIndex = 0;

function sss() {

    document.getElementsByClassName("bg")[0].className += " unblur";
    document.getElementsByClassName("footer")[0].className += " unblur";
    document.getElementsByClassName("loader")[0].className += " unloader";
    
    carousel();

    function carousel() {
        var i;
        var j;
        var x = document.getElementsByClassName("slide");
        var y = document.getElementsByClassName("dot");
        
        for (i = 0; i < x.length; i++){
            x[i].className = "slide";
        }
        for (j = 0; j < y.length; j++) {
            y[j].className = "dot";
        }
        
        myIndex++;
        
        if (myIndex > x.length) { myIndex = 1 }
        x[myIndex - 1].className += " vis";
        y[myIndex - 1].className += " filled";

        setTimeout(carousel, 6000);
    }
}

function left_btn() {
    var x = document.getElementsByClassName("slide");
    var y = document.getElementsByClassName("dot");

    for (i = 0; i < x.length; i++) {
        x[i].className = "slide";
    }
    for (j = 0; j < y.length; j++) {
        y[j].className = "dot";
    }

    myIndex--;

    if (myIndex < 1) { myIndex = x.length;}
    x[myIndex - 1].className += " vis";
    y[myIndex - 1].className += " filled";

}

function right_btn() {
    var x = document.getElementsByClassName("slide");
    var y = document.getElementsByClassName("dot");

    for (i = 0; i < x.length; i++) {
        x[i].className = "slide";
    }
    for (j = 0; j < y.length; j++) {
        y[j].className = "dot";
    }

    myIndex++;

    if (myIndex > x.length) { myIndex = 1 }
    x[myIndex - 1].className += " vis";
    y[myIndex - 1].className += " filled";

}

function to_slide(bindex) {
    var x = document.getElementsByClassName("slide");
    var y = document.getElementsByClassName("dot");

    for (i = 0; i < x.length; i++) {
        x[i].className = "slide";
    }
    for (j = 0; j < y.length; j++) {
        y[j].className = "dot";
    }

    myIndex = bindex + 1;
    x[bindex].className += " vis";
    y[bindex].className += " filled";
}

function cop(sindex) {
    var x = document.getElementsByClassName("client");
    var y = document.getElementsByClassName("dot2");

    for (i = 0; i < x.length; i++) {
        x[i].className = "client";
    }
    for (j = 0; j < y.length; j++) {
        y[j].className = "dot2";
    }

    x[sindex].className += " client-active";
    y[sindex].className += " filled-2";
}