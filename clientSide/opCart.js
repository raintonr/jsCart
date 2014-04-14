var template;
var cart = [];
function renderCart() {
	$("#cart-placeholder").html(template({
		items : cart
	}));
}
function storeCart() {
	$.post("/models/cart", JSON.stringify({
		"items" : cart
	}), "json");
}
$(function() {
	var source = $("#cart-template").html();
	template = Handlebars.compile(source);

	/*
	 * TODO: fix this so the model doesn't have to be read twice.
	 */
	$.get("/models/cart", function(data, textStatus, jqXHR) {
		console.log("Read from server: " + data);
		cart = jQuery.parseJSON(data);
		if (cart.items) {
			cart = cart.items;
		} else {
			cart = [];
		}
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
