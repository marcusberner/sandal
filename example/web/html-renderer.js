var HtmlRenderer = function (template, templateEngine) {

	console.log('Creating HTML renderer');

	this.template = template;
	this.templateEngine = templateEngine;
};

HtmlRenderer.prototype.renderItems = function (items) {
	return this.templateEngine.render(this.template, { items: items });
};

module.exports = HtmlRenderer;