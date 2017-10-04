//

util.createNamespace("Sku.View");
///////////////////////////////////////////
Sku.View.ModelTry = Backbone.View.extend({
	id:"sku-model-try",
	tagName:"div",
	className:"sku-item",

	updateItem:function($tr){
		var item = {};
		$("td", $tr).each(function(){
			var $td = $(this);
			var id = $td.attr("for");
			var value = $td.attr("value");
			item[id] = value;
		});

		var complexid = $tr.attr("complexid");
		this.model.setItem(complexid, item);
	},

	events:{
		"click .sku-item-title input": function(){
			var $self = $(event.srcElement);
			if($self.prop("checked")){
				this.model.addItem();
			}else{
				this.model.removeAll();
			}
		},

		"blur .model-try-table tr td input": function(){
			var $self = $(event.srcElement);
			var value = $self.val();

			var $td = $self.parent();
			var lastValue = $td.attr("lastValue");

			if(lastValue != value){
				$td.attr("value", value).attr("lastValue", value);
				this.updateItem($td.parent());
			}
		},

		"click .model-try-add-more":function(){
			var items = this.model.get("model");
			if(items.length < 3){
				this.model.addItem();	
			}else{
				util.showTipDialog("提醒", "模特试穿列表最多填写3条数据哦^_^", function(){});
			}
		},

		"click .model-try-table tr td .model-try-remove-item":function(){
			var $self = $(event.srcElement);
			var $tr = $self.parent().parent();
			var complexid = $tr.attr("complexid");
			this.model.removeItem(complexid);
		},
	},

	initialize:function(){
		this.render();
		this.model.on("modelChanged", this.render, this);
	},

	render:function(){
		this.$el.html(this.template());

		var ids = this.model.ids();
		var length = ids.length + 1;
		if(length > 0 && !this.model.isEmpty()){
			var tdWidth = parseInt(100 / length);
			$("tr td", this.$el).css("width", tdWidth + "%");
		}

		return this;
	},

	template:function(){
		var compiler = _.template($("#sku-model-try").html(), {variable:"modelTry"});
		return compiler(this.model);
	}
});
