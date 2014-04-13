var template;
var cart = [];
function renderCart() {
	$("#cart-placeholder").html(template({
		items : cart
	}));
}
function storeCart() {
	$.post("/store", JSON.stringify({
		"items" : cart
	}), "json");
}
$(function() {
	var source = $("#cart-template").html();
	template = Handlebars.compile(source);

	$.get("/models/cart", function(data, textStatus, jqXHR) {
		console.log("Read from server: " + data);
		cart = jQuery.parseJSON(data).items;
		console.log(cart);
		renderCart();
	});

	/* Add to cart handlers */
	$(".add-to-cart").click(function() {
		console.log($(this).attr("item"));
		cart.push($(this).attr("item"));
		console.log(cart);
		renderCart();
		storeCart();
	});
});
