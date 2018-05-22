(function($) {
    
    let documentRoot = "//localhost/api";
    let apiRoot = "http://shopgen.pl/dev/api"; 

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
            $(location).attr('href', documentRoot+"/#/search/"+syntax);
        });
    }

    let app = $.sammy(function() {

        this.use('Template');

        this.get('#/', function(context) {
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

        this.get('#/product/:id', function(context) {
            $("#backCategories").hide();
            $("#content").html("");
            $.getJSON( apiRoot + "/products/"+this.params['id'], function( data ) {
                context.render('views/single.template', {item: data})
                 .appendTo($("#content")).then(function(){
                        $("ul.dropdown-menu.sizes").html("");
                        $.each( data.sizeToAmountMap, function( index, value ){
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

        this.get('#/search/:rules', function(context) {
            $.get( "views/list.html", function(data) {
                $("#content").html( data );
                applyListTriggers();
              });
            $("#backCategories").show();

            $.getJSON( apiRoot + "/search?"+this.params['rules'], function( data ) {
                if (!data[0]) $("#listContent").append('<h3>Nic nie znaleziono! :(</h3><a href="#/"><h3>Powrót do strony głównej</h3></a>');
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
                    <a class="dropdown-toggle" data-toggle="dropdown" href="#/search/categoryId=' + data[index].id + '">' + data[index].name +'\
                    <span class="caret"></span></a>\
                    <ul class="dropdown-menu multi-level"  id="dropdown-menu">');
                
                    $.each( data[index].subcategories, function( index2, value2 ){
                        if (data[index].subcategories[index2].subcategories[0]) {
                            
                            elements.push('<li class="dropdown-submenu">\
                                <a tabindex="-1" href="#/search/categoryId=' + data[index].subcategories[index2].id + '">' + data[index].subcategories[index2].name + '</a>\
                                <ul class="dropdown-menu" id="dropdown-menu1">');

                            $.each( data[index].subcategories[index2].subcategories, function( index3, value3 ){
                                elements.push('<li><a href="#/search/categoryId=' + data[index].subcategories[index2].subcategories[index3].id + '">' + data[index].subcategories[index2].subcategories[index3].name + '</a></li>');
                            });

                            elements.push('</ul>');

                        } else elements.push('<li><a href="#/search/categoryId=' + data[index].subcategories[index2].id + '">' + data[index].subcategories[index2].name + '</a></li>');
                    }); 

                
                elements.push('</ul></li>');
            }); 
            elements = elements.join("");
            $("#navbar").append(elements);    
		});
        
    });
  
})(jQuery);

