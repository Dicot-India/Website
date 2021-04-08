function to_home() {
    location.href = "home.html";//"http://www.dicot.in/";
}

function to_about() {
    location.href = "about.html";//"http://www.dicot.in/about.html";
}

function to_vc() {
    location.href = "VisionC.html";//"http://www.dicot.in/VisionC.html";
}

function to_vg() {
    location.href = "VGraphic.html";//"http://www.dicot.in/VGraphic.html";
}

function to_vw() {
    location.href = "coming.html";//"http://www.dicot.in/coming.html";
}

function to_contact() {
    location.href = "contact.html";//"http://www.dicot.in/contact.html";
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

function download_vc() {
    location.href = "http://www.dicot.in/Vision_C_setup.exe";
}

function download_vg() {
    location.href = "http://www.dicot.in/VGraphicsetup.exe";
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

function m_menu() {
    var m = document.getElementsByClassName("m-nav-btn");
    if (m[0].classList.contains("change")){
        m[0].className = "m-nav-btn";
        document.getElementsByClassName("m-nav-li")[0].className = "m-nav-li";
    }
    else {
        m[0].className += " change";
        document.getElementsByClassName("m-nav-li")[0].className += " m-nav-disp";
    }
}

function validation() {
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var tel = document.getElementById("tel").value;
    var msg = document.getElementById("text-ans").value;
    var err_msg = document.getElementById("err-msg");
    var text;

    if ((name.length > 4) && (email.indexOf("@") > 0) && (!isNaN(tel)) && (tel.length == 10) && (msg.length > 10)) {
        text = "Thank you! We will get in touch with you soon!";
        err_msg.innerHTML = text;
        var data = {
            name: name, email: email, tel: tel, msg: msg
        };
        $.post("../PHP/contact.php", data);
        return true;
    }
    else {
        text = "Enter all the required feilds in correct manner";
        err_msg.innerHTML = text;
        return false;
    }
}