//

util.createNamespace("Sku.View");
///////////////////////////////////////////
Sku.View.Normal = Backbone.View.extend({
	id:"sku-normal",
	tagName:"div",
	className:"sku-item",

	updateOption:function($normal){
		var option = {};
		option["checked"] = $(":checkbox", $normal).prop("checked");
		option["value"] = $normal.attr("value");

		this.model.setOption(option);
	},

	events:{
		"click .sku-normal-options .sku-normal-checkbox": function(){
			var $self = $(event.srcElement);
			var $normal = $self.parent();
			this.updateOption($normal);
		},
	},

	initialize:function(){
		this.render();
		this.model.on("optionsInited", this.render, this);
	},

	render:function(){
		if(this.model.isReady()){
			this.$el.html(this.template());
			util.sku.setTitle2Inputs(this.$el, 60, "sku-font-size");
		}
		return this;
	},

	template:function(){
		var compiler = _.template($("#sku-normal").html(), {variable:"normal"});
		return compiler(this.model);
	}
});
