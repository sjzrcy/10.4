/////

util.createNamespace("Sku.View");
//
Sku.View.ColorV3 = Backbone.View.extend({
	id:"sku-color-v3",
	tagName:"div",
	className:"sku-item clearfix",

	updateOption:function($color){
		// value url 基础色 complexid checked
		var url = $(".sku-color3-image", $color).attr("url");
		if(!url){url = "";}
		
		var $basecolor = $(".sku-color3-basecolor", $color);
		var basecolorValues = util.color.basecolor.getValues($basecolor);

		var complexid = $color.attr("complexid");
		if(!complexid){
			complexid = shell.createUUID();
			$color.attr("complexid", complexid);
		}

		var value = $(":text", $color).attr("lastValue");
		var option = {
			"complexid":complexid,
			"checked":$(":checkbox", $color).prop("checked"),
			"value": value ? value : "",
			"isCustom":true,
			"url":url,
			"basecolor":basecolorValues,
		};

		this.model.setOption(option);
	},

	events:{
		"click .sku-color3-options .sku-color3-checkbox":function(){
			var $self = $(event.srcElement);
			var $color = $self.parent();
			this.updateOption($color);
		},

		"click .sku-color3-options .sku-color3-basecolor":function(){
			var findNode = function($node, className){
				if(!$node || $node.hasClass(className)){
					return $node;
				}else{
					return arguments.callee($node.parent(), className);
				}
			}

			var me = this;
			var $self = $(event.srcElement);
			var $basecolor = findNode($self, "sku-color3-basecolor");
			var selectedColors = [];
			$(".basecolor-item", $basecolor).each(function(){
				var $self = $(this);
				selectedColors.push({value:$self.attr("value"), text:$self.attr("text"), rgb:$self.attr("rgb"),});
			});

			var offset = $basecolor.offset();
			var rect = {
				top: offset.top,
				left: offset.left,
				width: $basecolor.width(),
				height: $basecolor.height(),
			};

			var dialog = new BasecolorChooseDialog(this.model.basecolors(), selectedColors, rect);
			dialog.show(function(checkedColors){
				//
				$basecolor.empty();
				if(checkedColors.length > 0){
					for(var i = 0; i < checkedColors.length; ++i){
						var color = checkedColors[i];
						var $basecolorItem = $("<div>").addClass("basecolor-item").attr("value", color.value).attr("text", color.text);
						var $basecolorBlock = $("<div>").addClass("basecolor-block").css("background-color", mapping.basecolor.rgb(color.text)).appendTo($basecolorItem);
						if(mapping.basecolor.isEmpty(color.text)){
							$basecolorBlock.css("border", "solid 1px #d7d7d7");
						}

						$("<div>").addClass("basecolor-text").text(color.text).appendTo($basecolorItem);
						$basecolorItem.appendTo($basecolor);
					}

					//若是编辑状态，且没有勾选，则自动勾选上
					var $checkbox = $basecolor.siblings(":checkbox");
					if(!$checkbox.prop("checked")){
						$checkbox.prop("checked", true);
					}
				}else{
					$("<div>").addClass("choose-basecolor-tip").text("选择主色系").appendTo($basecolor);
				}

				//更新
				me.updateOption($basecolor.parent());
			});
		},

		"focus .sku-color3-options .sku-color3-value":function(){
			var $self = $(event.srcElement);
			var lastValue = $self.attr("lastValue");
			if(!lastValue){
				$self.val("");
				$self.removeClass("input-tip-color");
			}
		},

		"blur .sku-color3-options .sku-color3-value":function(){
			var $self = $(event.srcElement);
			var $color = $self.parent();

			var inputText = $self.val();
			var lastValue = $self.attr("lastValue");
			if(util.color.hasSameText($self, $color)){
				if(lastValue){
					$self.val(lastValue).attr("lastValue", lastValue);
				}else{
					$self.val("自定义颜色名").attr("lastValue", "");
					$self.addClass("input-tip-color");
				}
				
				util.color.showTipDialog("提示", "亲，自定义颜色名称不可以重复哦^.^", function(){$self.focus();});
				return;
			}
			
			$self.attr("lastValue", inputText);
			if(!inputText){
				$self.val("自定义颜色名");
				$self.addClass("input-tip-color");
			}

			if(lastValue != inputText){
				//若没有勾选，则自动勾选上
				var $checkbox = $self.siblings(":checkbox");
				if(inputText && !$checkbox.prop("checked")){
					$checkbox.prop("checked", true);
				}

				var $color = $self.parent();
				this.updateOption($color);
			}
		},

		"click .sku-color3-options .setImageButton": function(){
			//设置图片
			var me = this;
			var $self = $(event.srcElement);
			var $image = $self.parent();
			var $color = $image.parent();
			var $checkbox = $image.siblings(":checkbox");

			var setImage = function(image){
				$image.attr("url", image);
				$("img", $image).attr("src", image);

				if(!$checkbox.prop("checked")){
					$checkbox.prop("checked", true);
				}

				me.updateOption($color);
			}

			shell.choosePictures(function(images){
				var list = images.split(";");
				if (list.length == 0) {return;}
				var image = list[list.length - 1];
				if(!image){return;}	

				$(".showRemoveImageBox", $image).css("display", "block");
				$(".showSetImageBox", $image).css("display", "none");
				setImage(image);
			});
		},

		"click .sku-color3-options .removeImageButton": function(){
			var $self = $(event.srcElement);
			var $image = $self.parent().parent();

			//使用局部显示隐藏的方式来切换
			$(".showRemoveImageBox", $image).css("display", "none");
			$(".showSetImageBox", $image).css("display", "block");

			$image.attr("url", "");
			$("img", $image).attr("src", "");

			var $color = $image.parent();
			this.updateOption($color);
		},

		"click .sku-color3-options .showRemoveImageBox img": function(){
			var me = this;
			var $self = $(event.srcElement);
			var $image = $self.parent().parent();
			var $color = $image.parent();

			var setImage = function(image){
				$image.attr("url", image);
				$self.attr("src", image);
				me.updateOption($color);
			}

			var preview = new ImagePreview($self.attr("src"));
			preview.show(
				function(url){
					setImage(url);
				},
				function(){
					//使用局部显示隐藏的方式来切换
					$(".showRemoveImageBox", $image).css("display", "none");
					$(".showSetImageBox", $image).css("display", "block");
					setImage("");
				}
			);
		},
		// events
	},

	initialize:function(){
		this.render();
		//
		this.model.on("optionsInited", this.render, this);
		this.model.on("optionStatusChanged", this.render, this);
	},

	render:function(){
		if(this.model.isReady()){
			this.$el.html(this.template());
			
			util.sku.decodeInput(this.$el);
			util.sku.setTitle2Inputs(this.$el, 245, "sku-font-size");

			//限制自定义名称可输入长度
			var maxLengthRule = this.model.inputMaxLengthRule();
			if(maxLengthRule){
				var maxLength = maxLengthRule.value();
				var unit = maxLengthRule.unit();
				$(".sku-color3-option .sku-color3-value", this.$el).bind("textchange", function(){
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
		var compiler = _.template($("#sku-color-3").html(), {variable:"color"});
		return compiler(this.model);
	},
	//
});