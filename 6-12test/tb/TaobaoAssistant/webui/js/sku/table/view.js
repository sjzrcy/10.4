//

util.createNamespace("Sku.View");
///////////////////////////////////////////
Sku.View.Table = Backbone.View.extend({
	id:"sku-table",
	tagName:"div",
	className:"sku-item clearfix",

	//更新单条sku
	updateSkuItem:function($tr){
		if(!$tr.hasClass("sku-item-tr")){
			return;
		}

		var key = $tr.attr("key");
		var inputs = {};
		$("td input", $tr).each(function(){
			var $td = $(this).parent();
			var id = $td.attr("for");
			var value = $td.attr("value");
			inputs[id] = value;
		});

		this.model.updateSkuItem(key, inputs);
	},

	//更新所有sku值
	updateSkuItems:function(){
		var me = this;
		$(".custom-sku-table tr", this.$el).each(function(){
			me.updateSkuItem($(this));
		});
	},

	events:{
		"focus .sku-fill-inputs input": function(){
			var $self = $(event.srcElement);
			if($self.hasClass("fill-input-tip")){
				$self.removeClass("fill-input-tip");
				$self.val("");
			}
		},

		"blur .sku-fill-inputs input": function(){
			var $self = $(event.srcElement);
			if(!$self.val()){
				$self.val($self.attr("name"));
				$self.addClass("fill-input-tip");
			}else{
				$self.removeClass("fill-input-tip");
			}
		},

		"click .sku-fill-inputs .fill-button": function(){
			$(".sku-fill-inputs input", this.$el).each(function(){
				var $self = $(this);
				if(!$self.hasClass("fill-input-tip")){
					var id = $self.attr("id");
					var value = $self.val();
					var $td = $(".custom-sku-table td[for=" + id + "]");
					$td.attr("value", value).attr("lastValue",value);
					$("input", $td).val(value);

					$self.val($self.attr("name"));
					$self.addClass("fill-input-tip");
				}
			});

			this.updateSkuItems();
		},

		"blur .custom-sku-table td input": function(){
			var $self = $(event.srcElement);
			var $td = $self.parent();
			var lastValue = $td.attr("lastValue");
			var value = $self.val();
			if(lastValue != value){
				$td.attr("lastValue", value);
				$td.attr("value", value);
				var $tr = $td.parent();
				this.updateSkuItem($tr);	
			}
		},
	},

	initialize:function(){
		this.render();
		//
		this.model.on("skuMetaOptionCountChanged", this.render, this);
		this.model.on("skuMetaOptionInfoChanged", this.render, this);
		this.model.on("skuMetaGroupChanged", this.render, this);
	},

	render:function(){
		this.$el.html(this.template());

		{
			//decode
			var $table = $("table", this.$el);
			util.sku.decodeTable($table);
			
			// 1 width
			var skuMetas = this.model.skuMetas();
			var inputs = this.model.inputs();
			var length = skuMetas.length + inputs.length;
			if(length > 0 && this.model.isSkuMetasReady()){
				var tdWidth = parseInt(100 / length);
				$("tr td", this.$el).css("width", tdWidth + "%");
			}

			//2 merge
			var $table = $("table", this.$el);
			util.mergeTds($table, skuMetas.length);

			//3 sku_MarketTime
			var $input = $("#sku_MarketTime", this.$el);
			if($input.length > 0){
				$input.datepicker({
					dateFormat: config.DATE_FORMAT,
					onSelect:function(){
						var $self = $(this);
						if(!$self.val()){
							$self.val($self.attr("name"));
							$self.addClass("fill-input-tip");
						}else{
							$self.removeClass("fill-input-tip");
						}
					}
				});

				var me = this;
				$(".custom-sku-table td[for=sku_MarketTime] input", this.$el).datepicker({
					dateFormat: config.DATE_FORMAT,
					onSelect:function(){
						var $self = $(this);
						var $td = $self.parent();
						var lastValue = $td.attr("lastValue");
						var value = $self.val();
						if(lastValue != value){
							$td.attr("lastValue", value);
							$td.attr("value", value);
							var $tr = $td.parent();
							me.updateSkuItem($tr);	
						}
					},
				});
			}

			//4 对价格和库存支持（输入类型，最大值，最小值的规则支持）
			util.sku.applyRules2PriceAndQuantity(this.$el, this.model);
		}
		
		return this;
	},

	template:function(){
		var compiler = _.template($("#sku-table").html(), {variable:"sku"});
		return compiler(this.model);
	}
});
