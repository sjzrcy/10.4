/**
 * IN:
 */
define(function(require, exports, module){
	//
	/*提示信息*/
	var Tooltip = function($reminder, text){
		this.$reminder = $reminder;
		this.text = text;
		this.$el = undefined;
	};

	Tooltip.uis = [];
	Tooltip.clear = function(){
		_.each(Tooltip.uis, function($ui){
			$ui.remove();
		});

		Tooltip.uis = [];
	};

	Tooltip.prototype.isCover = function(cursorPos, uiRect){
		return (cursorPos.x > uiRect.x && cursorPos.x < (uiRect.x + uiRect.width) && 
				cursorPos.y > uiRect.y && cursorPos.y < (uiRect.y + uiRect.height));
	};

	Tooltip.prototype.isCoverCursor = function(){
		var bodyScrollLeft = $("body").scrollLeft();
		var cursorX = event.clientX + bodyScrollLeft;
		var bodyScrollTop = $("body").scrollTop();
		var cursorY = event.clientY + bodyScrollTop;
		var cursorPos = {"x":cursorX, "y":cursorY};

		var left = this.$el.offset().left;
		var top = this.$el.offset().top;
		var width = this.$el.width();
		var height = this.$el.height();
		var uiRect = {"x": left, "y": (top - 3), "width": width, "height": height};

		return this.isCover(cursorPos, uiRect);
	};

	Tooltip.prototype.isCoverReminder = function(){
		var bodyScrollLeft = $("body").scrollLeft();
		var cursorX = event.clientX + bodyScrollLeft;
		var bodyScrollTop = $("body").scrollTop();
		var cursorY = event.clientY + bodyScrollTop;
		var cursorPos = {"x":cursorX, "y":cursorY};

		var left = this.$reminder.offset().left;
		var top = this.$reminder.offset().top;
		var width = this.$reminder.width();
		var height = this.$reminder.height();
		var uiRect = {"x": left, "y": (top + 5), "width": width, "height": (height - 3)};

		return this.isCover(cursorPos, uiRect);
	};

	Tooltip.prototype.show = function(){
		var isFirstCreate = false;
		if(!this.$el){
			isFirstCreate = true;
			this.$el = $("<div>").addClass("tooltip");
			this.$el.append($("<div class='arrow'>"));
			this.$el.append($("<div class='content'>").html(this.text));

			var me = this;
			this.$el.hover(function(){}, function(){
				if(!me.isCoverReminder()){//如果不在reminder上
					me.$el.hide(40);
				}
			});

			as.util.handleATag(this.$el);
			this.$el.appendTo($("body"));
			Tooltip.uis.push(this.$el);
		}

		if(!isFirstCreate && this.$el.css('display') !== 'none'){
			return;
		}

		var CONST_WIDTH = 340;
		var ARRAW_WIDTH = 11;
		var offset = this.$reminder.offset();
		var top = offset.top + this.$reminder.height();
		var left = offset.left - (CONST_WIDTH - this.$reminder.width()) / 2;

		//fix
		if(top < 0){top = 0;}
		if(left < 10){left = 10;}

		var bodyWidth = $("body").width();
		if(bodyWidth < 1010){ // fix >> left边缘(只针对本项目有效),982为页面横向最大长度
			bodyWidth = 1010;
		}

		var tooltipMiddle = left + parseInt(CONST_WIDTH / 2);
		var reminderMiddle = offset.left + parseInt(this.$reminder.width() / 2);

		var arrowLeft;
		if(bodyWidth - left < (CONST_WIDTH + 10)){ // 靠左边侧面
			var oldLeft = left;
			left = bodyWidth - (CONST_WIDTH + 10);

			var arrowOffsetLeft = oldLeft - left;
			arrowLeft = ((CONST_WIDTH - ARRAW_WIDTH) / 2 + arrowOffsetLeft);
			if(arrowLeft > (CONST_WIDTH - ARRAW_WIDTH + 5)){
				arrowLeft = CONST_WIDTH - ARRAW_WIDTH + 5;
			}

			$(".arrow", this.$el).css("left", arrowLeft + "px").css("margin", "0");
		}else if(tooltipMiddle > reminderMiddle){ // 靠右边侧面
			var arrowOffset = tooltipMiddle - reminderMiddle;
			arrowLeft = CONST_WIDTH / 2 - arrowOffset - ARRAW_WIDTH / 2;

			$(".arrow", this.$el).css("left", arrowLeft + "px").css("margin", "0");
		}else{
			$(".arrow", this.$el).css("left", "auto").css("margin-left", "auto").css("margin-right", "auto");
		}
		
		this.$el.css({left:left, top:(top + 2)}).show(100);
	};

	Tooltip.prototype.hide = function(){
		if(this.$el && !this.isCoverCursor()){
			this.$el.hide(40);
		}
	};

	Tooltip.prototype.isVisible = function(){
		return (this.$el && this.$el.css('display') !== 'none');
	};

	//
	module.exports = Tooltip;
});