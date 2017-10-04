//

util.createNamespace("Sku.View");
///////////////////////////////////////////
Sku.View.SizeV1 = Backbone.View.extend({
	id:"sku-size-v1",
	tagName:"div",
	className:"sku-item clearfix",

	updateOption:function($size){
		var option = {};
		var $input = $(":text", $size);

		var complexid = $size.attr("complexid");
		if(!complexid){
			complexid = shell.createUUID();
			$size.attr("complexid", complexid);
		}

		option["complexid"] = complexid;
		option["checked"] = $(":checkbox", $size).prop("checked");
		option["value"] = $size.attr("value");
		option["text"] = $input.attr("meta");
		
		if($input.prop("disabled")){
			option["alias"] = false;
		}else{
			option["alias"] = $input.val();
			if(option["text"] == option["alias"]){
				option["alias"] = "";
			}
		}
		
		this.model.setOption(option);
	},

	events:{
		"click .sku-size1-options .sku-size1-checkbox": function(){
			var $self = $(event.srcElement);
			var $size = $self.parent();

			if(this.model.get("extend")){
				//只有当存在扩展字段时，才需要显示输入边框
				util.sku.updateInputBorder($("input", $size), $self.prop("checked"));	
			}
			
			this.updateOption($size);
		},

		"focus .sku-size1-options .sku-size1-text": function(){
			var $self = $(event.srcElement);
			var $size = $self.parent();
			var $checkbox = $(":checkbox", $size);
			if(!$checkbox.prop("checked")){
				$checkbox.prop("checked", true);
				this.updateOption($size);
			}

		},

		"blur .sku-size1-options .sku-size1-text": function(){
			var $self = $(event.srcElement);
			var lastValue = $self.attr("lastValue");
			var text = $self.val();

			if(util.size.hasSameValue($self)){
				util.showTipDialog("警告", "亲，自定义尺码值不能重名哦，请重新修改^_^", function(){
					$self.val(lastValue);
					$self.focus();
				});
				return;
			}

			if(lastValue != text){
				$self.attr("lastValue", text);
				$self.attr("title", util.sku.title(text, 60, "sku-font-size"));

				if(!text){
					//为空时数据复原
					$self.val($self.attr("meta"));
				}

				var $size = $self.parent();
				this.updateOption($size);
			}
		},

		"change .sku-size1-measure select":function(){
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
		this.render();
		//
		this.model.on("optionsInited", this.render, this);
	},

	render:function(){
		if(this.model.isReady()){
			this.$el.html(this.template());
			
			util.sku.decodeInput(this.$el);
			util.sku.setTitle2Inputs(this.$el, 60, "sku-font-size");

			//限制别名可输入长度
			var maxLengthRule = this.model.aliasMaxLengthRule();
			if(maxLengthRule){
				var maxLength = maxLengthRule.value();
				var unit = maxLengthRule.unit();
				$(".sku-size1-option .sku-size1-text", this.$el).bind("textchange", function(){
					var $input = $(this);
					var value = $input.val();
					if(util.tbLogicStringSize(value, unit) > maxLength){
						$input.val(util.tbSubString(value, maxLength, unit));
					}
				});
			}
		}
		return this;
	},

	template:function(){
		var compiler = _.template($("#sku-size-1").html(), {variable:"size"});
		return compiler(this.model);
	}
});
