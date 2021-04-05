function to_home() {
    location.href = "home.html";
}

function to_about() {
    location.href = "about.html";
}

function to_vc() {
    location.href = "VisionC.html";
}

function to_vg() {
    location.href = "VGraphic.html";
}

function to_vw() {
    location.href = "coming.html";
}

function to_contact() {
    location.href = "contact.html";
}

function to_vwlogin() {
    location.href = "about.html";
}

function to_linkedin() {
    location.href = "https://www.linkedin.com/company/dicot-india";
}

function to_facebook() {
    location.href = "https://www.facebook.com/tech.dicot";
}

function to_instagram() {
    location.href = "https://www.instagram.com/dicot.india";
}

function to_twitter() {
    location.href = "https://www.twitter.com/DicotIndia";
}

function totop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

var mybutton = document.getElementsByClassName("to-top");

window.onscroll = function () { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton[0].style.display = "block";
    } else {
        mybutton[0].style.display = "none";
    }
}

function to_download() {
    location.href = "#download";
}


function inq() {
    var form = document.getElementById("inquire");

    if (form.className == "inq-form"){
        form.className += " inq-disp";
    }
    else{
        form.className = "inq-form";
    }
}

function close_inq() {
    var form = document.getElementById("inquire");
    form.className = "inq-form";
}