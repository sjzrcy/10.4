//

util.createNamespace("Sku.View");
//
Sku.View.ColorV1 = Backbone.View.extend({
	id:"sku-color-v1",
	tagName:"div",
	className:"sku-item clearfix",

	updateOption:function($color){
		var alias = "";//与原颜色名不一致才算别名了，但url有值，则强制算有别名了
		var metaText = $(".sku-color1-text", $color).attr("meta");
		var inputText = $(".sku-color1-text", $color).val();
		if(metaText != inputText){
			alias = inputText;
		}

		var url = $(".sku-color1-block", $color).attr("url");
		if(url && !alias){
			alias = inputText;
		}

		var complexid = $color.attr("complexid");
		if(!complexid){
			complexid = shell.createUUID();
			$color.attr("complexid", complexid);
		}

		var option = {
			"text": metaText,
			"value": $color.attr("vid"),
			"url":url,
			"alias": alias,
			"complexid":complexid,
			"checked":$(".sku-color1-checkbox", $color).prop("checked"),
		};

		this.model.setOption(option);
	},

	events:{
		"click .sku-color1-options .sku-color1-checkbox":function(){
			var $self = $(event.srcElement);
			var $color = $self.parent();

			util.sku.updateInputBorder($("input", $color), $self.prop("checked"));
			this.updateOption($color);
		},

		"blur .sku-color1-options .sku-color1-text":function(){
			var $self = $(event.srcElement);
			var $color = $self.parent();
			var last = $self.attr("lastValue");
			var inputText = $self.val();
			var meta = $self.attr("meta");

			if(!inputText){//若自定义颜色文本为空，恢复默认颜色
				$self.val(meta).attr("value", meta).attr("lastValue", meta);
				$self.attr("title", "");
				this.updateOption($color);
				return;
			}

			if(util.color.hasSameText($self, $color)){//若颜色重复，恢复到上一次颜色
				if(last){
					$self.val(last).attr("value", last).attr("lastValue", last);
				}else{
					$self.val(meta).attr("value", meta).attr("lastValue", meta);
				}
				
				util.color.showTipDialog("提示", "亲，自定义颜色名称不可以重复哦^.^", function(){$self.focus();});
				return;
			}

			if(last != inputText){
				$self.attr("value", inputText).attr("lastValue", inputText);
				$self.attr("title", util.sku.title(inputText, 60, "sku-font-size"));
				this.updateOption($color);
			}
		},

		"click .sku-color1-options .sku-color1-text":function(){
			var $self = $(event.srcElement);
			var $chekcbox = $self.siblings(":checkbox");
			if(!$chekcbox.prop("checked")){
				$chekcbox.prop("checked", true);
				var $color = $self.parent();
				this.updateOption($color);
			}
		},

		"click .sku-color1-options .sku-color1-block": function(){
			var that = this;
			var $self = $(event.srcElement);

			var setImage = function(image){
				$self.attr("url", image);
				$self.css({"background-image":"url('" + encodeURI(image) + "')"});
				if(!image){
					var rgb = $self.attr("rgb");
					$self.css({"background-color":rgb,});
				}else{
					$self.css({"background-color":"#FFFFFF",});
					var $chekcbox = $self.siblings(":checkbox");
					if(!$chekcbox.prop("checked")){
						$chekcbox.prop("checked", true);
					}
				}

				var $color = $self.parent();
				that.updateOption($color);
			}

			var url = $self.attr("url");
			if(url){//预览
				var preview = new ImagePreview(url);
				preview.show(function(newImage){setImage(newImage);}, function(){setImage("");});
			}else{//上传
				shell.choosePictures(function(images){
					var list = images.split(";");
					if (list.length == 0) {return;}
					var image = list[list.length - 1];
					if(!image){return;}	

					setImage(image);
				});
			}
		},

		"click .sku-pack":function(){
			this.model.setPack(false);
		},

		"click .sku-unpack":function(){
			this.model.setPack(true);
		},
	},

	initialize:function(){
		this.render();
		//
		this.model.on("optionsInited", this.render, this);
		this.model.on("optionStatusChanged", this.render, this);
		this.model.on("packStatusChanged", this.render, this);
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
				$(".sku-color1-option .sku-color1-text", this.$el).bind("textchange", function(){
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
		var compiler = _.template($("#sku-color-1").html(), {variable:"color"});
		return compiler(this.model);
	}
});