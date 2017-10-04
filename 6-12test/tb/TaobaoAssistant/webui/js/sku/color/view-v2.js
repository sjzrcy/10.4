/////

util.createNamespace("Sku.View");
//
Sku.View.ColorV2 = Backbone.View.extend({
	id:"sku-color-v2",
	tagName:"div",
	className:"sku-item clearfix",

	updateOption:function($color){
		// value 别名 url 基础色 complexid checked
		var value = $color.attr("value");
		var $alias = $(".sku-color2-alias", $color);
		var alias = $alias.hasClass("input-tip-color")? "": $alias.val();
		var url = $(".sku-color2-image", $color).attr("url");
		if(!url){url = "";}
		
		var $basecolor = $(".sku-color2-basecolor", $color);
		var basecolorValues = util.color.basecolor.getValues($basecolor);

		var complexid = $color.attr("complexid");
		if(!complexid){
			complexid = shell.createUUID();
			$color.attr("complexid", complexid);
		}
		
		var option = {
			"complexid":complexid,
			"text": "",
			"value": $color.attr("value"),
			"url":url,
			"alias": alias,
			"basecolor":basecolorValues,
			"complexid":$color.attr("complexid"),
			"checked":$(":checkbox", $color).prop("checked"),
		};

		this.model.setOption(option);
	},

	events:{
		"click .sku-color2-options .sku-color2-checkbox":function(){
			var $self = $(event.srcElement);
			var $color = $self.parent();
			this.updateOption($color);
		},

		"click .sku-color2-options .sku-color2-basecolor":function(){
			var findNode = function($node, className){
				if(!$node || $node.hasClass(className)){
					return $node;
				}else{
					return arguments.callee($node.parent(), className);
				}
			}

			var me = this;
			var $self = $(event.srcElement);
			var $basecolor = findNode($self, "sku-color2-basecolor");
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
				}else{
					$("<div>").addClass("choose-basecolor-tip").text("选择主色系").appendTo($basecolor);
				}

				//若是编辑状态，且没有勾选，则自动勾选上
				var $checkbox = $basecolor.siblings(":checkbox");
				if(!$checkbox.prop("checked")){
					$checkbox.prop("checked", true);
				}

				//更新
				me.updateOption($basecolor.parent());
			});
		},

		"focus .sku-color2-options .sku-color2-alias":function(){
			var $self = $(event.srcElement);
			var lastValue = $self.attr("lastValue");
			if(!lastValue){
				$self.val("");
				$self.removeClass("input-tip-color");
			}
		},

		"blur .sku-color2-options .sku-color2-alias":function(){
			var $self = $(event.srcElement);
			var $color = $self.parent();

			var lastValue = $self.attr("lastValue");
			var inputText = $self.val();
			if(util.color.hasSameText($self, $color)){
				if(lastValue){
					$self.val(lastValue);
					$self.focus();
				}else{
					$self.val("自定义颜色名");
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
				if(!$checkbox.prop("checked")){
					$checkbox.prop("checked", true);
				}

				var $color = $self.parent();
				this.updateOption($color);
			}
		},

		"click .sku-color2-options .setImageButton": function(){
			//设置图片
			var me = this;
			var $self = $(event.srcElement);
			var $image = $self.parent();
			var $checkbox = $image.siblings(":checkbox");
			var $color = $image.parent();

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

		"click .sku-color2-options .removeImageButton": function(){
			var $self = $(event.srcElement);
			var $image = $self.parent().parent();

			//使用局部显示隐藏的方式来切换
			$(".showRemoveImageBox", $image).css("display", "none");
			$(".showSetImageBox", $image).css("display", "block");

			$image.attr("url", "");
			$("img", $image).attr("src", "");

			var $color = $image.parent();
			//若没有勾选，则自动勾选上
			var $checkbox = $(":checkbox", $color);
			if(!$checkbox.prop("checked")){
				$checkbox.prop("checked", true);
			}

			this.updateOption($color);
		},

		"click .sku-color2-options .showRemoveImageBox img": function(){
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
			
			//input
			util.sku.decodeInput(this.$el);

			///title
			util.sku.setTitle2Inputs(this.$el, 245, "sku-font-size");

			//限制别名可输入长度
			var maxLengthRule = this.model.aliasMaxLengthRule();
			if(maxLengthRule){
				var maxLength = maxLengthRule.value();
				var unit = maxLengthRule.unit();
				$(".sku-color2-option .sku-color2-alias", this.$el).bind("textchange", function(){
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
		var compiler = _.template($("#sku-color-2").html(), {variable:"color"});
		return compiler(this.model);
	}
});