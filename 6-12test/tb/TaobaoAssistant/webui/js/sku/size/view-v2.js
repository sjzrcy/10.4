//

util.createNamespace("Sku.View");
///////////////////////////////////////////
Sku.View.SizeV2 = Backbone.View.extend({
	id:"sku-size-v2",
	tagName:"div",
	className:"sku-item clearfix",

	updateOption:function($size){
		var option = {};

		var $text = $(".sku-size2-text", $size);
		var $tip = $(".sku-size2-tip", $size);

		var isCustom = $text.attr("isCustom") == "true";
		var complexid = $size.attr("complexid");
		if(!complexid){
			complexid = shell.createUUID();
			$size.attr("complexid", complexid);
		}

		option["isCustom"] = isCustom;
		option["complexid"] = complexid;
		option["checked"] = $(":checkbox", $size).prop("checked");

		if(isCustom){
			option["value"] = $text.val();
		}else{
			option["value"] = $size.attr("value");
			option["text"] = $text.val();
		}

		var sizeTip = "";
		if($tip.length > 0 && !$tip.hasClass("sku-size2-tip-empty")){
			sizeTip = $tip.val();
		}
		option["sizeTip"] = sizeTip;
		
		this.model.setOption(option);
	},

	events:{
		"change .sku-item-title select": function(){
			var $select = $(event.srcElement);
			var lastValue = $select.attr("lastValue");
			
			var me = this;
			var skuModel = this.model.get("table");
			var selectedOptions = this.model.selectedOptions();

			//没有sku数据 && 没有选中项，切换时不提示
			if(skuModel.isEmpty() && selectedOptions.length == 0){
				$select.attr("lastValue", $select.val());
				me.model.updateGroup($select.val());
			}else{
				util.size.confirm(
					function(){
						$select.attr("lastValue", $select.val());
						me.model.updateGroup($select.val());
					}, 
					function(){
						$select.val(lastValue);
					}
				);
			}
		},

		"click .sku-size2-options .sku-size2-checkbox": function(){
			var $self = $(event.srcElement);
			var $size = $self.parent();

			var $input = $(".sku-size2-text", $size);
			if($self.prop("checked")){
				if(!$input.val() || $input.val() == "自定义尺码"){
					$input.focus();
				}
			}

			this.updateOption($size);
			this.render();
		},

		"focus .sku-size2-options .sku-size2-text": function(){
			var $input = $(event.srcElement);
			if(!$input.attr("lastValue")){
				$input.val("");
				$input.removeClass("size-input-tip");
			}

			var $size = $input.parent();
			var $checkbox = $(":checkbox", $size);
			if($input.val() && !$checkbox.prop("checked")){
				$checkbox.prop("checked", true);
			}
		},

		"click .sku-size2-options .sku-size2-option": function(){
			var $input = $(event.srcElement);
			if(!$input.hasClass("sku-size2-text")){
				return;
			}

			if($input.prop("disabled")){
				var $size = $input.parent();
				var $checkbox = $(":checkbox", $size);
				if(!$checkbox.prop("checked")){
					$checkbox.prop("checked", true);
					this.updateOption($size);
					this.render();
				}
			}
		},

		"blur .sku-size2-options .sku-size2-text": function(){
			var $self = $(event.srcElement);
			var lastValue = $self.attr("lastValue");
			var text = $self.val();

			//如果为空，自定义--显示提示
			if(!text && $self.attr("isCustom")){
				$self.addClass("size-input-tip");
				$self.val("自定义尺码");
				$self.attr("title", "");
				return;
			}

			if(text && util.size.hasSameValue($self, ".sku-size2-text")){
				util.showTipDialog("警告", "亲，自定义尺码值不能重名哦，请重新修改^_^", function(){
					$self.val(lastValue);
					$self.focus();
				});
				return;
			}

			if(lastValue != text){
				//如果没有勾选，勾上
				var $size = $self.parent();
				var $checkbox = $(":checkbox", $size);
				if(!$checkbox.prop("checked")){
					$checkbox.prop("checked", true);
				}

				$self.attr("lastValue", text);
				$self.attr("title", util.sku.title(text, 60, "sku-font-size"));
				this.updateOption($size);
			}
		},

		"click .sku-size2-extend .size_extend": function(){
			var me = this;

			var field = this.model.stdSizeExtends();
			var curSizeObj = this.model.extendSize();
			var groupId = curSizeObj.groupId;
			var sizeoptions = curSizeObj.sizeOptions;
			if(sizeoptions.length == 0){
				util.size.tipSizeOptionEmpty();
				return;
			}

			shell.category(function(json){
				var category = JSON.parse(json);
				var params = {};
				params.cid = category.cid;
				params.groupId = groupId;
				params.groupType = 0;
				var firstStuffIndex = groupId.indexOf(":");
				if(firstStuffIndex < groupId.length && firstStuffIndex > 0  ){
					params.groupId = groupId.substr(0, firstStuffIndex);
				}

				var lastStuffIndex = groupId.lastIndexOf(":");
				if(lastStuffIndex > 0 && firstStuffIndex < groupId.length){
					params.groupType = groupId.substr(lastStuffIndex+1, groupId.length);
				}

				params.postData = SizeTableConvertor.convertFrom(sizeoptions, field);

				shell.choseSizeTable(params, function(val){
					complexValueList = SizeTableConvertor.convertTo(sizeoptions, field, val);
					field.setSizeMapping(complexValueList);
					me.render();
				});

			});
		},

		"change .sku-size2-measure select":function(){
			var $self = $(event.srcElement);
			var measure = this.model.sizeMeasureImage();
			if(measure){
				measure.setValue($self.val());	
			}
		},

		"click .choose-size-measure-image":function(){
			var field = this.model.sizeMeasureImage();
			if(!field){return;}

			var convert = function(options){
				var ops = [];
				_.each(options, function(option){
					ops.push({text:option.text(), value:option.value()});
				});
				return ops;
			}

			var me = this;
			var imageChooser = new ImageChooser(field.value(), convert(field.options()));
			imageChooser.show(function(text, value){
				if(value != field.value()){
					field.setValue(value);
					me.render();
				}
			});
		},

		"click .change-size-measure-image":function(){
			var field = this.model.sizeMeasureImage();
			if(!field){return;}

			var convert = function(options){
				var ops = [];
				_.each(options, function(option){
					ops.push({text:option.text(), value:option.value()});
				});
				return ops;
			}

			var me = this;
			var imageChooser = new ImageChooser(field.value(), convert(field.options()));
			imageChooser.show(function(text, value){
				if(value != field.value()){
					field.setValue(value);
					me.render();
				}
			});
		},

		"click .remove-measure-value":function(){
			var field = this.model.sizeMeasureImage();
			if(field){
				field.setValue("");
				this.render();
			}
		},

		"focus .sku-size2-option .sku-size2-tip":function(){
			var $self = $(event.srcElement);
			if($self.hasClass("sku-size2-tip-empty")){
				$self.removeClass("sku-size2-tip-empty");
				$self.val("");
			}
		},

		"blur .sku-size2-option .sku-size2-tip":function(){
			var $self = $(event.srcElement);
			var value = $self.val();
			var lastValue = $self.attr("lastValue");
			if(value != lastValue){
				var $size = $self.parent();
				$self.attr("lastValue", value);
				this.updateOption($size);
			}

			if(!value){
				$self.addClass("sku-size2-tip-empty");
				$self.val("备注");
			}
		},
		//
	},

	initialize:function(){
		this.model.on("optionsInited", this.render, this);
		this.model.on("customOptionCountChanged", this.render, this);
		this.model.on("groupChanged", this.render, this);
		//
		this.render();
	},

	render:function(){
		if(this.model.isReady()){
			this.$el.html(this.template());

			{
				//初始化分组信息
				var group = this.model.group();
				$(".sku-item-title select", this.$el).val(group).attr("lastValue", group);
			}

			{
				//处理提示信息
				var $tip = $(".sku-size-tip .size-tip", this.$el);
				var tipRule = this.model.tip();
				if(tipRule){
					var tooltip = new Tooltip($tip, tipRule);
					$tip.hover(function(){tooltip.show();}, function(){tooltip.hide();});
				}
			}

			{
				//encode
				util.sku.decodeInput(this.$el);
				util.size.decodeOptionV2(this.$el);
			}
			
			{
				//title
				util.sku.setTitle2Inputs(this.$el, 60, "sku-font-size");
			}

			{
				//限制备注输入长度
				var maxLengthRule = this.model.tipMaxLengthRule();
				if(maxLengthRule){
					var maxLength = maxLengthRule.value();
					var unit = maxLengthRule.unit();
					$(".sku-size2-option .sku-size2-tip", this.$el).bind("textchange", function(){
						var $input = $(this);
						var value = $input.val();
						if(util.tbLogicStringSize(value, unit) > maxLength){
							$input.val(util.tbSubString(value, maxLength, unit));
						}
					});
				}
			}
		}
		return this;
	},

	template:function(){
		var compiler = _.template($("#sku-size-2").html(), {variable:"size"});
		return compiler(this.model);
	}
});
