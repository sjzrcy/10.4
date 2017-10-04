//

util.createNamespace("Sku.View");
///////////////////////////////////////////
Sku.View.Custom = Backbone.View.extend({
	id:"sku-custom",
	tagName:"div",
	className:"sku-item",

	updateOption:function($custom){
		var option = {};

		var isCustom = $(":text", $custom).attr("isCustom") == "true";
		var complexid = $custom.attr("complexid");
		if(!complexid){
			complexid = shell.createUUID();
			$custom.attr("complexid", complexid);
		}

		option["isCustom"] = isCustom;
		option["complexid"] = complexid;
		option["checked"] = $(":checkbox", $custom).prop("checked");

		if(isCustom){
			option["value"] = $(":text", $custom).val();
		}else{
			option["value"] = $custom.attr("value");
			option["text"] = $(":text", $custom).val();
		}
		
		this.model.setOption(option);
	},

	events:{
		"change .sku-item-title select": function(){
			var $select = $(event.srcElement);
			var last = $select.attr("last");

			var me = this;
			var skuModel = this.model.get("table");
			var selectedOptions = this.model.selectedOptions();

			//没有sku数据 && 没有选中项，切换时不提示
			if(skuModel.isEmpty() && selectedOptions.length == 0){
				$select.attr("last", $select.val());
				me.model.updateGroup($select.val());
			}else{
				util.sku.confirm(
					function(){
						$select.attr("last", $select.val());
						me.model.updateGroup($select.val());
					}, 
					function(){
						$select.val(last);
					}
				);
			}
		},

		"click .sku-custom-options .sku-custom-checkbox": function(){
			var $self = $(event.srcElement);
			var $custom = $self.parent();
			var $input = $(".sku-custom-text", $custom);

			if($self.prop("checked")){
				if(!$input.val() || $input.val() == "自定义尺码"){
					$self.prop("checked", false);
					$input.focus();
					return;
				}
			}

			this.updateOption($custom);
		},

		"focus .sku-custom-options .sku-custom-text": function(){
			var $input = $(event.srcElement);
			if(!$input.attr("last")){
				$input.val("");
				$input.removeClass("size-input-tip");
			}
		},

		"blur .sku-custom-options .sku-custom-text": function(){
			var $self = $(event.srcElement);
			var last = $self.attr("last");
			var text = $self.val();

			if(!text){
				util.showTipDialog("警告", "亲，自定义尺码值不能为空值哦，请重新修改^_^", function(){
					$self.val(last);
					$self.focus();
				});
				return;
			}

			if(util.size.hasSameValue($self)){
				util.showTipDialog("警告", "亲，自定义尺码值不能重名哦，请重新修改^_^", function(){
					$self.val(last);
					$self.focus();
				});
				return;
			}

			if(last != text){
				$self.attr("last", text);
				var $custom = $self.parent();
				this.updateOption($custom);
			}
		},
	},

	initialize:function(){
		//
		this.model.on("optionsInited", this.render, this);
		this.model.on("groupChanged", this.render, this);
		//
		this.render();
	},

	render:function(){
		if(this.model.isReady()){
			this.$el.html(this.template());

			{
				var custom_prop_field_key = this.model.get("custom_prop_field_key");
				var group = custom_prop_field_key.value();
				$(".sku-item-title select", this.$el).val(group).attr("last", group);
				//title
				util.sku.setTitle2Inputs(this.$el, 60, "sku-font-size");
			}
		}
		return this;
	},

	template:function(){
		var compiler = _.template($("#sku-custom").html(), {variable:"custom"});
		return compiler(this.model);
	}
});
