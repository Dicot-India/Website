var dir = 1;

function sss() {
    document.getElementsByClassName("bg")[0].className += " unblur";
    document.getElementsByClassName("footer")[0].className += " unblur";
    document.getElementsByClassName("loader")[0].className += " unloader";

    const clientcontainer = document.getElementById('cli');
    const clientscrollWidth = clientcontainer.scrollWidth;

    scrolling()

    function scrolling() {
        
        if (clientcontainer.scrollLeft !== clientscrollWidth) {
            clientcontainer.scrollTo(clientcontainer.scrollLeft + dir, 0);
        }

        if (clientcontainer.scrollLeft === (clientscrollWidth - clientcontainer.offsetWidth)) {

            dir = -1;
        }

        if (clientcontainer.scrollLeft == 0)
        {
            dir = 1;
        }


        setTimeout(scrolling, 10);
    }
}