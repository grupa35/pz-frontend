var numer = Math.floor(Math.random()*3) + 1;
var timer1 = 0;
var timer2 = 0;

function schowaj()
{
    $("#slider").fadeOut(500);
}

function slide()
{
    numer++;
    if (numer>3) numer = 1;
    var plik = "<img src=\"imgs/slider/slajd"+numer+".jpg\" style=\"width: 95%; height: auto; margin-left: auto; margin-right: auto; border-radius: 25px;\"/>";

    document.getElementById("slider").innerHTML = plik; 
    $("#slider").fadeIn(500);
            
    timer1= setTimeout("slide()", 4950);
    timer2= setTimeout("schowaj()", 4500);
}

$(function () {
    slide();
})