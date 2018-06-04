var action = 1;
var documentRoot = "http://shopgen.pl/dev";
var apiRoot = "http://shopgen.pl/dev/api";

$(function () {
    function applyListTriggers(){
        $("button#filtruj").on("click",function(){
            let syntax = "";
            let andSign = false;
            let name = $('#sidebar input[name="name"]').val();
            let category = $('#sidebar input[name="category"]').val();
            let lowerPrice = $('#sidebar input[name="priceFrom"]').val();
            let higherPrice = $('#sidebar input[name="priceTo"]').val();

            if (name != '') {
                syntax += "name=" + name;
                andSign = true;
            }
            if (category != '') {
                if (andSign) syntax += "&";
                syntax += "categoryId=" + category;
                andSign = true;
            }
            if (lowerPrice != '') {
                if (andSign) syntax += "&";
                syntax += "lowerPrice=" + lowerPrice;
                andSign = true;
            }
            if (higherPrice != '') {
                if (andSign) syntax += "&";
                syntax += "higherPrice=" + higherPrice;
                andSign = true;
            }
            $(location).attr('href', documentRoot + "/search/" + syntax);
        });
    }

    function applySearchTriggers(){
        $("button#search").on("click",function(){
            let syntax = "";
            let andSign = false;
            let name = $('#searchbox input[name="name"]').val();

            if (name != '') {
                syntax += "name=" + name;
                andSign = true;
            }
            if(syntax !=undefined && syntax !="")
                $(location).attr('href', documentRoot + "/search/" + syntax);
        });
    }

    let app = $.sammy(function() {

        this.use('Template');

        this.get('#/', function (context) {
            $.get( "views/list.html", function(data) {
                $("#content").html( data );
                applyListTriggers();
            });
            $("#backCategories").show();

            $.getJSON( apiRoot + "/products?page=1&size=10", function( data ) {
                $.each( data.content, function( index, value ){
                    context.render('views/items/listedProduct.template', {item: data.content[index], root: documentRoot})
                        .appendTo($("#listContent"));
                });

            });
        });

        $("button#filtruj").on("click",function(){
            document.getElementById("login_block").style.display = "block";
        });

        this.get('#/product/:id', function (context) {
            $("#backCategories").hide();
            $("#content").html("");
            $.getJSON( apiRoot + "/products/"+this.params['id'], function( data ) {
                context.render('views/single.template', {item: data})
                    .appendTo($("#content")).then(function () {
                    $("ul.dropdown-menu.sizes").html("");
                    $.each(data.sizeToAmountMap, function (index, value) {
                        $("ul.dropdown-menu.sizes").append('<li><a href="#">' + index + ' - ' + value + 'szt.</a></li>');
                    });
                    $("#info ul").html("");
                    $("#info ul").append('<li><span>Kategoria:</span> ' + data.category.name + '</li>');
                    if (data.category.subcategories[0]) {
                        $("#info ul").append('Podkategorie: ');
                        for (key in data.category.subcategories)
                            $("#info ul").append(data.category.subcategories[key].name + ', ');
                    }
                });


            });
        });

        this.get('#/search/:rules', function (context) {
            $.get( "views/list.html", function(data) {
                $("#content").html( data );
                applyListTriggers();
            });
            $("#backCategories").show();

            $.getJSON( apiRoot + "/search?"+this.params['rules'], function( data ) {
                if (!data[0]) $("#listContent").append('<h3>Nic nie znaleziono! :(</h3><a href="/#"><h3>Powrót do strony głównej</h3></a>');
                $.each( data, function( index, value ){
                    context.render('views/items/listedProduct.template', {item: data[index], root: documentRoot})
                        .appendTo($("#listContent"));
                });

            });
        });

    });




    $(function(){
        $("#header").load("partial/header.html");
        app.run('#/');

        $.getJSON( apiRoot + "/categories", function( data ) {
            let elements = [];
            $("#navbar").html("");
            $.each( data, function( index, value ){

                elements.push('<li class="dropdown">\
                    <a class="dropdown-toggle" data-toggle="dropdown" href="/search/categoryId=' + data[index].id + '">' + data[index].name + '\
                    <span class="caret"></span></a>\
                    <ul class="dropdown-menu multi-level"  id="dropdown-menu">');

                $.each(data[index].subcategories, function (index2, value2) {
                    if (data[index].subcategories[index2].subcategories[0]) {

                        elements.push('<li class="dropdown-submenu">\
                                <a tabindex="-1" href="/search/categoryId=' + data[index].subcategories[index2].id + '">' + data[index].subcategories[index2].name + '</a>\
                                <ul class="dropdown-menu" id="dropdown-menu1">');

                        $.each(data[index].subcategories[index2].subcategories, function (index3, value3) {
                            elements.push('<li><a href="/search/categoryId=' + data[index].subcategories[index2].subcategories[index3].id + '">' + data[index].subcategories[index2].subcategories[index3].name + '</a></li>');
                        });

                        elements.push('</ul>');

                    } else elements.push('<li><a href="/search/categoryId=' + data[index].subcategories[index2].id + '">' + data[index].subcategories[index2].name + '</a></li>');
                });


                elements.push('</ul></li>');
            });
            elements = elements.join("");
            $("#navbar").append(elements);
        });


    });

})

function prepare_login_form_handler() {
    var form = document.getElementById("login");

    form.onsubmit = function (e) {
        // stop the regular form submission
        e.preventDefault();

        // collect the form data while iterating over the inputs
        var request_data = {};
        request_data["email"] = form["email"].value;
        request_data["password"] = form["password"].value;

        let request = new XMLHttpRequest();
        request.open('POST', apiRoot + '/login', false);
        request.setRequestHeader('content-type', 'application/json');
        request.send(JSON.stringify(request_data));

        if (request.status === 200) {
            set_cookie('authorization', request.getResponseHeader('Authorization'));
        }
    };
}

function get_current_user() {
    let authorization = get_cookie('authorization');
    $.ajax({
        url: apiRoot + '/users/current',
        dataType: 'json',
        type: 'get',
        headers: {'Authorization': authorization},
        contentType: 'application/json',
        async: false,
        processData: false,
        success: function (data, textStatus, jQxhr) {
            return JSON.parse(data)
        }
    });

    return '';
}

function prepare_registration_form_handler() {
    var form = document.getElementById("registration");

    form.onsubmit = function (e) {
        // stop the regular form submission
        e.preventDefault();

        // collect the form data while iterating over the inputs
        var data = {};
        data["email"] = form["email"].value;
        data["password"] = form["password"].value;
        data["rePassword"] = form["rePassword"].value;
        data["name"] = form["name"].value;
        data["surname"] = form["surname"].value;
        data["roleName"] = form["roleName"].value;


        $.ajax({
            url: apiRoot + '/registration',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(data),
            processData: false,
            success: function (data, textStatus, jQxhr) {
                let json_data = JSON.parse(data);
                let status_code = json_data['result'];

                if (status_code === 0) {

                } else {
                    let error_message = '';
                    if (status_code === 10) {
                        error_message = 'Wrong email format';
                    } else if (status_code === 11) {
                        error_message = 'Email exists';
                    } else if (status_code === 20) {
                        error_message = 'Wrong password format';
                    } else if (status_code === 21) {
                        error_message = 'Different passwords';
                    } else {
                        error_message = 'Unknown error';
                    }
                    alert(error_message)
                }
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });

    };
}

function set_cookie(parameter, value) {
    document.cookie = parameter + '=' + value + ';';
}

function get_cookie(parameter) {
    return document.cookie.match(parameter + '=(.*?);')[0];
}