//

util.createNamespace("Sku.View");
///////////////////////////////////////////
Sku.View.SizeV3 = Backbone.View.extend({
	id:"sku-size-v3",
	tagName:"div",
	className:"sku-item clearfix",

	updateOption:function($size){
		var option = {isCustom: true};

		var complexid = $size.attr("complexid");
		if(!complexid){
			complexid = shell.createUUID();
			$size.attr("complexid", complexid);
		}

		option["complexid"] = complexid;
		option["checked"] = $(":checkbox", $size).prop("checked");
		option["value"] = $(":text", $size).val();
		
		this.model.setOption(option);
	},

	events:{
		"click .sku-size3-options .sku-size3-checkbox": function(){
			var $self = $(event.srcElement);
			var $size = $self.parent();
			var $input = $(".sku-size3-text", $size);

			if($self.prop("checked")){
				if(!$input.val() || $input.val() == "自定义尺码"){
					$self.prop("checked", false);
					$input.focus();
					return;
				}
			}

			this.updateOption($size);
		},

		"focus .sku-size3-options .sku-size3-text": function(){
			var $input = $(event.srcElement);
			if(!$input.attr("last")){
				$input.val("");
				$input.removeClass("size-input-tip");
			}
		},

		"blur .sku-size3-options .sku-size3-text": function(){
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
				var $size = $self.parent();
				this.updateOption($size);
			}
		},

		"click .sku-size3-extend .size_extend": function(){
			alert("设置尺码表");
		},

		"change .sku-size3-measure select":function(){
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
	},

	initialize:function(){
		this.model.on("optionsInited", this.render, this);
		this.model.on("optionCountChanged", this.render, this);
		//
		this.render();
	},

	render:function(){
		if(this.model.isReady()){
			this.$el.html(this.template());
			{// custom size tip
				var $tip = $(".sku-size-tip .size-tip", this.$el);
				var tipRule = this.model.tip();
				if(tipRule){
					var tooltip = new Tooltip($tip, tipRule);
					$tip.hover(function(){tooltip.show();}, function(){tooltip.hide();});
				}
			}
			
			//title
			{
				util.sku.setTitle2Inputs(this.$el, 60, "sku-font-size");
			}
		}
		
		return this;
	},

	template:function(){
		var compiler = _.template($("#sku-size-3").html(), {variable:"size"});
		return compiler(this.model);
	}
});
