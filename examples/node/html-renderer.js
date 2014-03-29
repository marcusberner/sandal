module.exports = function (template, templateEngine) {

	return {
		renderItems: function (items) {
			return templateEngine.render(template, { items: items });
		}
	};

};
