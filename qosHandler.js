$(function() {
	$(".qosTemplate").each(
		function() {
			var $target = $(this);
			if (!$target.attr("qosDone")) {
				$.get("http://localhost:3031" + $target.attr("model"),
				function(data, textStatus, jqXHR) {
					console.log("Read from server: " + data);
	
					/*
					 * TODO: you would have thought it would be able to
					 * compile the template outside of this, but that
					 * doesn't work
					 */
					var source = $("#" + $target.attr("template")).html();
					console.log("Compiling template: " + source);
					template = Handlebars.compile(source);
					model = jQuery.parseJSON(data);
					$target.html(template(model));
				});
			}
		});
});
