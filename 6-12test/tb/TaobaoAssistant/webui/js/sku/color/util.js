// JavaScript Document

//
util.createNamespace("util.color");
//util.color域的工具函数
util.color.createView = function(colorModel){
	var view;
	var version = colorModel.version();
	switch(version){
		case Sku.Version.Color.V1:{
			view = new Sku.View.ColorV1({model:colorModel});
			break;
		}

		case Sku.Version.Color.V2:{
			view = new Sku.View.ColorV2({model:colorModel});
			break;
		}

		case Sku.Version.Color.V3:{
			view = new Sku.View.ColorV3({model:colorModel});
			break;
		}

		default:{
			alert("color version is unknow:" + version);
			break;
		}
	}

	return view;
}

util.color.imageNaturalSize = function(img) {
    var image = new Image();
    image.src = img.src;
    return {width:image.width, height:image.height,};
}

util.color.hasSameText = function($input, $color) {
	var hasSame = false;

	var text = $input.val();
	var element = $input[0];

	var $colors = $color.parent();
	$(":text", $colors).each(function(){
		if(this == element){
			return;//continue;
		}

		if($(this).val() == text){
			hasSame = true;
			return false;//break
		}
	});

	return hasSame;
}

util.color.showTipDialog = function(title, text, onClose){
	var option = {
		title: title,
		content: text,
		buttons:[{text:"我知道了", click:function(){dialog.close();}}],
		contentIcon:config.image.WARN,
		callback:{hide:onClose,},
	}

	var dialog = new SchemaDialog(option);
	dialog.show();
}

//子模块basecolor工具函数
util.createNamespace("util.color.basecolor");
util.color.basecolor = new (function(){
	var values = function(colors){
		var vs = [];
		for(var i = 0; i < colors.length; ++i){
			vs.push(colors[i].value);
		}
		return vs;
	}

	var isSame = function(colors1, colors2){
		var cvs1 = values(colors1);
		var cvs2 = values(colors2);

		var diff1 = _.difference(cvs1, cvs2);
		var diff2 = _.difference(cvs2, cvs1);

		return (diff1.length == 0 && diff2.length == 0);
	}

	//basecolor option web规范{value:"", text:""}
	var toWebValue = function(colorValues, allBasecolorValues){
		var colors = [];

		if(colorValues){//字符串
			colorValues = colorValues.split(",");
			for(var i = colorValues.length - 1; i >= 0; --i){
				colorValues[i] = urlCoder.decode(colorValues[i]);
			}
		}else{
			return colors;
		}
		
		for(var i = 0; i < colorValues.length; ++i){
			var value = colorValues[i];
			var color = {};
			for(var j = allBasecolorValues.length - 1; j >= 0; --j){
				var baseColorItem = allBasecolorValues[j];
				if(baseColorItem.value == value){
					color["value"] = baseColorItem.value;
					color["text"] = baseColorItem.text;
					colors.push(color);
					break;
				}
			}
		}

		return colors;
	}

	//basecolor option C++规范"v1,v2...vN"
	var toBackendValue = function(basecolors){
		var value = "";
		for(var i = 0; i < basecolors.length; ++i){
			var color = basecolors[i];
			if(value){value += ",";}
			value += urlCoder.encode(color.value);
		}
		return value;
	}

	var getValues = function($basecolor){
		var colorValues = [];
		$(".basecolor-item", $basecolor).each(function(){
			colorValues.push({"value":$(this).attr("value"), "text":$(this).attr("text"),});
		});
		return colorValues;
	}

	//api列表
	this.values = values;
	this.isSame = isSame;
	this.toBackendValue = toBackendValue;
	this.toWebValue = toWebValue;
	this.getValues = getValues;
});
//

///////////////////////////////////////
//////
function BasecolorChooseDialog(basecolors, initColors, rect){
	//{top, left, width, height}
	var MAX_CHECKED_COUNT = 3;
	var CHECKED_CLASS = "basecolor-item-checked";

	//
	var isChecked = function(colorOption){
		for(var i = initColors.length - 1; i >= 0; --i){
			if(initColors[i].value == colorOption.value){
				return true;
			}
		}
		return false;
	}

	var isChanged = function(checkedColors, initColors){
		var values = function(array){
			var vs = [];
			for(var i = 0; i < array.length; ++i){
				var option = array[i];
				vs.push(option.value);
			}
			return vs;
		}

		var checkedValues = values(checkedColors);
		var initValues = values(initColors);

		var diff1 = _.difference(initValues, checkedValues);
		var diff2 = _.difference(checkedValues, initValues);
		return !(diff1.length == 0 && diff2.length == 0);
	}

	//
	this.show = function(cbFinishChoose){
		var $bg = $("<div>").addClass("basecolor-bg");
		var $basecolorBox = $("<div>").addClass("basecolor-box").appendTo($bg);
		$basecolorBox.css({
			top:(rect.top + rect.height + 6) + "px",
			left: rect.left + "px",
		});
		$basecolorBox.draggable();

		var $x = $("<div>").addClass("basecolor-x").appendTo($basecolorBox);
		var $tip = $("<div>").addClass("basecolor-tip").text("最多可选三种色系，色系须与上传图片颜色一致").appendTo($basecolorBox);

		var $colorOptions = $("<div>").addClass("basecolor-show-area clearfix").appendTo($basecolorBox);
		for(var i = 0; i < basecolors.length; ++i){
			var colorOption = basecolors[i];
			var $colorItem = $("<div>").addClass("basecolor-item-d clearfix")
										.attr("value", colorOption.value).attr("text", colorOption.text)
										.appendTo($colorOptions);
			if(isChecked(colorOption)){
				$colorItem.addClass(CHECKED_CLASS);
			}

			var $colorBlock = $("<div>").addClass("basecolor-color-block").css("background-color", mapping.basecolor.rgb(colorOption.text)).appendTo($colorItem);
			if(mapping.basecolor.isEmpty(colorOption.text)){
				$colorBlock.css("border", "solid 1px #d7d7d7");
			}

			$("<div>").addClass("basecolor-color-text").text(colorOption.text).appendTo($colorItem);
		}

		$(".basecolor-item-d", $colorOptions).click(function(){
			//
			var $self = $(this);
			var isLastStatusChecked = $(this).hasClass(CHECKED_CLASS);
			if(isLastStatusChecked){
				$self.removeClass(CHECKED_CLASS);
			}else{
				if($("." + CHECKED_CLASS, $colorOptions).length < MAX_CHECKED_COUNT){
					$self.addClass(CHECKED_CLASS);
				}
			}

			event.stopPropagation();
		});

		var $submit = $("<div>").addClass("basecolor-submit").text("确定").appendTo($basecolorBox);
		$submit.click(function(){
			if(cbFinishChoose){
				var checkedColors = [];
				$(".basecolor-item-d", $colorOptions).each(function(){
					var $self = $(this);
					if($self.hasClass(CHECKED_CLASS)){
						var option = {};
						option.value = $self.attr("value");
						option.text = $self.attr("text");
						checkedColors.push(option);
					}
				});

				if(isChanged(checkedColors, initColors)){
					cbFinishChoose(checkedColors);
				}
			}

			$bg.remove();
			event.stopPropagation();
		});

		$bg.click(function(){
			$bg.remove();
		});

		//商品清空时，自动关闭
		process.addCb2Clear(function(){
			$bg.remove();
		});

		//占位
		$("<div>").addClass("basecolor-placeholder").appendTo($basecolorBox);
		$("body").append($bg);
	}
}

//////////////////////////////////////////////color mapping////////////////////////////////////////////////////////////////
util.createNamespace("mapping");

//普通颜色mapping
mapping.color = {
	"黑色":"#000000",
	"深灰色":"#666666",
	"浅灰色":"#e4e4e4",
	"深紫色":"#4b0082",
	"紫色":"#800080",
	"紫罗兰":"#dda0dd",
	"酒红色":"#990000",
	"红色":"#ff0000",
	"粉红色":"#ffb6c1",
	"桔色":"#ffa500",
	"黄色":"#ffff00",
	"浅黄色":"#ffffb1",
	"褐色":"#855b00",
	"巧克力色":"#d2691e",
	"深卡其布色":"#bdb76b",
	"军绿色":"#5d762a",
	"绿色":"#008000",
	"浅绿色":"#98fb98",
	"深蓝色":"#041690",
	"蓝色":"#0000ff",
	"天蓝色":"#1eddff",
	"花色":"#ffffff",
	"透明":"#ffffff",
	"白色":"#ffffff",

	rgb: function(colorName){
		var rgb = this[colorName];
		if(!rgb){rgb = "#FFFFFF";}
		return rgb;
	},

	isEmpty: function(colorName){
		if(!this[colorName]){
			return true;//未知颜色
		}

		var empty = {
			"花色":"#ffffff",
			"透明":"#ffffff",
			"白色":"#ffffff",
		}

		return !!empty[colorName];
	},
}


//基础色mapping
mapping.basecolor = {
	"黑色":"#000000",
	
	"蓝色":"#0000ff",
	"深蓝色":"#0000ff",
	"天蓝色":"#0000ff",

	"褐色":"#964b00",
	"棕色":"#964b00",
	"巧克力色":"#964b00",
	"深卡布其色":"#964b00",

	"灰色":"#7f7f7f",
	"浅灰色":"#7f7f7f",
	"深灰色":"#7f7f7f",

	"绿色":"#00ff00",
	"浅绿色":"#00ff00",
	"军绿色":"#00ff00",

	"桔色":"#ff8000",
	"橙色":"#ff8000",

	"粉红色":"#ffc0cb",

	"紫色":"#8000ff",
	"深紫色":"#8000ff",
	"紫罗兰":"#8000ff",

	"红色":"#ff0000",
	"酒红色":"#ff0000",

	"白色":"#ffffff",

	"浅黄色":"#ffff00",
	"黄色":"#ffff00",

	"透明色":"#ffffff",
	"花色":"#ffffff",

	rgb: function(colorName){
		var rgb = this[colorName];
		if(!rgb){ rgb = this["白色"];}
		return rgb;
	},

	isEmpty: function(colorName){
		if(!this[colorName]){
			return true;//未知颜色
		}

		var empty = {
			"花色":"#ffffff",
			"透明":"#ffffff",
			"白色":"#ffffff",
		}

		return !!empty[colorName];
	},
}
//