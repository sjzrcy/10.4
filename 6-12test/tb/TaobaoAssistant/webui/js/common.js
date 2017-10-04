// JavaScript Document
/**
	开发阶段{publish:false, analyze:false}
	发布阶段{publish:true, analyze:false}
	用户环境{publish:true/false, analyze:true}
*/
window.debug = new (function() {
	//
	var canOutput = function(level){
		return (level >= config.log.level);
	}

	this.log = function(info) {
		if(canOutput(config.log.LOG)){
			console.log(info);
		}
	}

	this.warn = function(info) {
		if(canOutput(config.log.WARN)){
			console.warn(info);
		}
	}

	this.trace = function(info) {
		if(canOutput(config.log.TRACE)){
			console.warn(info);
		}
	}

	this.error = function(info) {
		if(canOutput(config.log.ERROR)){
			console.error(info);
		}
	}
	//
})();

/////
window.TimeRecorder = new (function() {
	//
	var detail_ = "";
	var last_ = null;
	var globalLast_ = null;

	this.start = function(detail) {
		detail_ = detail;
		globalLast_ = new Date();
		last_ = globalLast_;
	}

	this.record = function(detail) {
		if (last_ == null) {
			return null;
		}

		var now = new Date();
		var mescs = (now.getTime() - last_.getTime());
		debug.trace(detail + ":" + mescs);
		last_ = now;
	}

	this.finish = function(detail) {
		if (last_ == null || globalLast_ == null) {
			return;
		}

		var now = new Date();
		var gMescs = (now.getTime() - globalLast_.getTime());
		debug.trace(detail_ + ":" + gMescs);

		if (detail) {
			var mescs = (now.getTime() - last_.getTime());
			debug.trace(detail + ":" + mescs);
		}

		globalLast_ = null;
		last_ = null;
	}
	//
})();

////
function LoadingUi(tip, gif, id) {
	var tip_ = tip;
	var gif_ = gif;
	var id_ = id;

	var hasInited_ = false;
	var $ui_ = null;

	var init = function() {
		var html = "\
		<div class='loading-box'>\
			<div class='loading-bg'></div>\
			<div class='loading-content'>" + tip_ + "</div>\
			<div class='loading-gif' style='background-image:url(" + gif_ + ");'></div>\
		</div>";

		$ui_ = $(html);
		if (id_ == "") {
			$("body").append($ui_);
		} else {
			var $target = $("#" + id_);
			if ($target.length == 1) {
				$target.append($ui_);
			}
		}
	}

	this.show = function() {
		if (!hasInited_) {
			init();
			hasInited_ = true;
		}

		$ui_.css("display", "block");
	}

	this.hide = function() {
		if ($ui_ != null) {
			$ui_.animate({opacity:0.0}, "fast", "swing", function(){
				$ui_.css("display", "none");
				$ui_.css("opacity", "1.0");
			});
			
		}
	}
}

////
function LoadingUi2(tip, id) {
	var tip_ = tip;
	var id_ = id;

	var hasInited_ = false;
	var $ui_ = null;
	var $progress_ = null;
	var timer_ = -1;
	var isVisible_ = false;

	var init = function() {
		var html = "\
		<div class='loading-box'>\
			<div class='loading-bg'></div>\
			<div class='loading-content'>" + tip_ + "</div>\
			<div class='loading-animate'>\
				<div class='loading-progress'></div>\
			</div>\
		</div>";

		$ui_ = $(html);
		$progress_ = $(".loading-progress", $ui_);

		if (id_ == "") {
			$("body").append($ui_);
		} else {
			var $target = $("#" + id_);
			if ($target.length == 1) {
				$target.append($ui_);
			}
		}
	}

	var tick = function(){
		$progress_.animate({"width":"128px"}, 800, "swing", function(){
			if($ui_.css("display") != "none"){
				$progress_.width(0);
				tick();
			}
		});
	}

	this.show = function() {
		if (!hasInited_) {
			init();
			hasInited_ = true;
		}

		$ui_.css("display", "block");
		isVisible_ = true;

		$progress_.width(28);
		tick();
	}

	this.hide = function(isForbidAnimate) {
		if(!$ui_){
			return;
		}

		var setHideStatus = function(){
			$ui_.css("display", "none");
			$ui_.css("opacity", "1.0");
		}

		isVisible_ = false;
		if(isForbidAnimate){//非正常hide，通常意味着马上要show了
			setHideStatus();
		}else{
			$ui_.animate({opacity:0.0}, "fast", "swing", function(){
				if(isVisible_){//在执行动画的工程，又show了
					$ui_.css("opacity", "1.0");
				}else{
					setHideStatus();
				}
			});
		}
	}

	this.isVisible = function(){
		return isVisible_;
	}
}

//////
window.urlCoder = new (function(){
	//
	this.encode = function(str){
		try{
			return encodeURIComponent(str);
		}catch(e){
			debug.error("url encode fail!");
			return "";
		}
	}

	this.decode = function(str){
		try{
			return decodeURIComponent(str);
		}catch(e){
			debug.error("url decode fail!");
			return "";
		}
	}
	//
})();

/*提示信息*/
function Tooltip($reminder, tipRule)
{
	this.reminder_ = $reminder;
	this.tooltip_ = null;

	//{text,url}
	var tips = [];
	tips.push({"text": tipRule.value(), "url": tipRule.url(),});

	var extraTips = tipRule.tips();
	if(extraTips){
		for(var i = 0; i < extraTips.length; ++i){
			var tip = extraTips[i];
			tips.push({"text":tip.value, "url": tip.url,});
		}
	}
	
	this.tips_ = tips;
}

Tooltip.uis = [];
Tooltip.clear = function(){
	for(var i = 0, $ui; $ui = Tooltip.uis[i]; ++i){
		$ui.remove();
	}
}

Tooltip.prototype.isCover = function(cursorPos, uiRect){
	return (cursorPos.x > uiRect.x && cursorPos.x < (uiRect.x + uiRect.width) 
		 && cursorPos.y > uiRect.y && cursorPos.y < (uiRect.y + uiRect.height));
}

Tooltip.prototype.isCoverCursor = function(){
	var bodyScrollLeft = $("body").scrollLeft();
	var cursorX = event.clientX + bodyScrollLeft;
	var bodyScrollTop = $("body").scrollTop();
	var cursorY = event.clientY + bodyScrollTop;
	var cursorPos = {"x":cursorX, "y":cursorY};

	var left = this.tooltip_.offset().left;
	var top = this.tooltip_.offset().top;
	var width = this.tooltip_.width();
	var height = this.tooltip_.height();
	var uiRect = {"x": left, "y": (top - 3), "width": width, "height": height}

	return this.isCover(cursorPos, uiRect);
}

Tooltip.prototype.isCoverReminder = function(){
	var bodyScrollLeft = $("body").scrollLeft();
	var cursorX = event.clientX + bodyScrollLeft;
	var bodyScrollTop = $("body").scrollTop();
	var cursorY = event.clientY + bodyScrollTop;
	var cursorPos = {"x":cursorX, "y":cursorY};

	var left = this.reminder_.offset().left;
	var top = this.reminder_.offset().top;
	var width = this.reminder_.width();
	var height = this.reminder_.height();
	var uiRect = {"x": left, "y": (top + 5), "width": width, "height": (height - 3)}

	return this.isCover(cursorPos, uiRect);
}

Tooltip.prototype.show = function(){
	if(!this.tooltip_){
		var isFirstCreate = true;
		this.tooltip_ = $("<div>").addClass("tooltip_box");
		this.tooltip_.append($("<div class='tooltip_arrow'>"));
		this.tooltip_.append($("<div class='tooltip'>"));

		var me = this;
		this.tooltip_.hover(function(){}, function(){
			if(!me.isCoverReminder()){//如果不在reminder上
				me.tooltip_.hide(40);
			}
		});

		var $tooltip = $(".tooltip", this.tooltip_);
		for(var i = 0; i < this.tips_.length; ++i){
			i? ($tooltip.append($("<br/>"))): "";
			var tip = this.tips_[i];
			var $tip = $("<span>").text(tip.text);
			$tooltip.append($tip);
			if(tip.url){
				$tip.css({"text-decoration":"underline", "cursor":"pointer",}).attr("url", tip.url).click(function(){
					var url = $(this).attr("url");
					shell.openUrl(url, false);
				});
			}
		}

		this.tooltip_.appendTo($("body"));
		Tooltip.uis.push(this.tooltip_);
	}

	if(!isFirstCreate && this.tooltip_.css("display") != "none"){
		return;
	}

	var CONST_WIDTH = 220;
	var ARRAW_WIDTH = 15;
	var offset = this.reminder_.offset();
	var top = offset.top + this.reminder_.height();
	var left = offset.left - (CONST_WIDTH - this.reminder_.width()) / 2;

	//fix
	if(top < 0){top = 0;}
	if(left < 10){left = 10;}

	var bodyWidth = $("body").width();
	if(bodyWidth - left < (CONST_WIDTH + 10)){
		var oldLeft = left;
		left = bodyWidth - (CONST_WIDTH + 10);

		var arrowOffsetLeft = oldLeft - left;
		var arrowLeft = ((CONST_WIDTH - ARRAW_WIDTH) / 2 + arrowOffsetLeft);
		if(arrowLeft > (CONST_WIDTH - ARRAW_WIDTH + 5)){
			arrowLeft = CONST_WIDTH - ARRAW_WIDTH + 5;
		}

		$(".tooltip_arrow", this.tooltip_).css("left", arrowLeft + "px").css("margin", "0");
	}else{
		$(".tooltip_arrow", this.tooltip_).css("left", "auto").css("margin-left", "auto").css("margin-right", "auto");
	}
	
	this.tooltip_.css({left:left, top:(top + 2)}).show(100);
}

Tooltip.prototype.hide = function(){
	if(this.tooltip_ && !this.isCoverCursor()){
		this.tooltip_.hide(40);
	}
}

function SchemaDialog(dialog)
{
	/*
	1.配置结构
	{
		title:窗口标题, 
		content:窗口内容, 
		buttons:按钮, [{text:"title", click:function(){}}]
		contentIcon:提示图标

		callback:{
			show:显示
			hide:关闭
		}
	}
	*/
	var hasClose_ = false;
	var isRichContent_ = (dialog.content instanceof $);
	this.hasClose = function(){
		return hasClose_;
	}

	var close = function(){
		if($dialogBg_){
			$dialogBg_.hide(80);
			$dialogBg_.remove();
		}

		$titlebar_ = null;
		$content_ = null;
		$buttonbar_ = null;
		$dialog_ = null;
		$dialogBg_ = null;

		hasClose_ = true;

		if(dialog.callback && typeof(dialog.callback.hide) == "function"){
			dialog.callback.hide();
		}
	}

	var $titlebar_ = (function(dialog){
		var $titlebar = $("<div>").addClass("dialog_titlebar clearfix");
		var $title = $("<div>").addClass("dialog_title");
		var $icon = $("<div>").addClass("dialog_icon");
		var $text = $("<div>").addClass("dialog_title_text").text(dialog.title);
		$title.append($icon).append($text);
		$titlebar.append($title);

		var $closeButton = $("<div>").addClass("dialog_close").click(close).html("&times;");
		$titlebar.append($closeButton);
		return $titlebar;
	})(dialog);

	// Éú³ÉÒ»¸ödiv°ü¹üµÄtable£¬²¢ÇÒÖ»ÓÐÒ»ÐÐÒ»ÁÐ£¬Íâ²¿ÖÆ¶¨Æä³¤¿í 
	var generateContextTd = function(content, css){
		var $e = $("<div>").css(css);
		var $table = $("<table>").css({
			position:"relative",
			top:0, left:0,
			width:"100%", height:"100%",
			padding:0, margin:0,
			border:"none"
		});
		var $tr = $("<tr>");
		if(isRichContent_){
			var $td = $("<td>");
			$td.append(content);
		}else{
			var $td = $("<td>").css({"vertical-align":"middle", "line-height":"22px"}).text(content);	
		}
		$tr.append($td);
		$table.append($tr);
		$e.append($table);
		return $e;
	}

	//±ä»¯µÄÊÇ¸ß¶È£¬¸ß¶ÈÐèÒª¶¯Ì¬¼ÆËã£¬¸ù¾ÝÎÄ±¾µÄ³¤¶ÈÓ³Éäµ½¸ß¶Èf(text.length)=>height,Ã¿Ò»ÐÐ¶¨¶àÉÙ¸ö³¤¶È£¨»ùÓÚÏñËØ£©£¿
	var $content_ = (function(dialog){
		var url = dialog.contentIcon ? dialog.contentIcon : "defualt";
		var size = util.tbPxStringSize(dialog.content);
		var PER_LINE = 44;
		var line = parseInt(size / 44) + (size % 44 > 0 ? 1 : 0);

		var $contentBox = $("<div>").addClass("dialog_content_box clearfix");
		if(!isRichContent_){
			$contentBox.css("height", (60 + line * 22) + "px")
		}

		var $contentIcon = $("<div>").addClass("dialog_content_icon").css("background-image", "url(" + url + ")");
		var width = "280px";
		if(isRichContent_){width = "100%";}
		var $contentText = generateContextTd(dialog.content, {position:"relative", float:"left", "width":width, height:"100%"});
		$contentBox.append($contentIcon);
		$contentBox.append($contentText);
		return $contentBox;
	})(dialog);

	var $buttonbar_ = (function(dialog){
		if(typeof(dialog.buttons) == "object" && dialog.buttons.length > 0){
			var $buttonbar = $("<div>").addClass("dialog_button_bar");
			for(var i = 0; i < dialog.buttons.length; ++i){
				var button = dialog.buttons[i];
				if(button.text && typeof(button.click) == "function"){
					var $button = $("<div>").addClass("dialog_button").text(button.text).click(button.click);
					$buttonbar.append($button);	
				}
			}
			return $buttonbar;
		}else{
			return null;
		}
	})(dialog);

	var $dialog_ = $("<div>").addClass("schema_dialog");
	$dialog_.append($titlebar_);
	$dialog_.append($content_);
	$dialog_.append($buttonbar_);
	$dialog_.draggable();

	var $body = $("body");
	var $dialogBg_ = $("<div>").addClass("dialog_bg").css("top", $body.scrollTop() + "px").css("left", $body.scrollLeft() + "px");
	$dialogBg_.append($dialog_);
	$dialogBg_.hide();

	//切换商品时自动关闭
	process.addCb2Clear(function(){
		if(!hasClose_){
			close();	
		}
	});

	this.show = function(){
		$("body").append($dialogBg_);
		$dialogBg_.show(200, function(){
			if(dialog.callback && typeof(dialog.callback.show) == "function"){
			dialog.callback.show();
		}
		});
	}

	this.close = function(){
		close();
	}
}
///
function ImagePreview(url)
{
	var metaUrl_ = url;

	this.show = function(cbReplace, cbRemove){
		var $bg = $("<div>").addClass("preview-bg");
		var $previewBox = $("<div>").addClass("preview-box").appendTo($bg);
		$previewBox.draggable();

		var $x = $("<div>").addClass("preview-x").appendTo($previewBox);
		var $preview = $("<div>").css("background-image", "url('" + encodeURI(url) + "')").addClass("preview-img").appendTo($previewBox);
		var $replace = $("<div>").addClass("preview-replace").text("更换图片").appendTo($previewBox);
		var $remove = $("<div>").addClass("preview-remove").text("删除图片").appendTo($previewBox);

		$bg.click(function(){
			$bg.remove();
		});

		$x.click(function(){
			$bg.remove();
			event.stopPropagation();
		});

		if(cbReplace){
			$replace.click(function(){
				shell.choosePictures(function(images){
					var list = images.split(";");
					if (list.length == 0) {return;}
					var image = list[list.length - 1];
					if(!image){return;}	

					$preview.css("background-image", "url('" + encodeURI(image) + "')");
					cbReplace(image);
					$bg.remove();
				});

				event.stopPropagation();
			});
		}

		$remove.click(function(){
			if(cbRemove){cbRemove();}
			$bg.remove();

			event.stopPropagation();
		});

		//商品清空时，自动关闭
		process.addCb2Clear(function(){
			$bg.remove();
		});

		//挂载到dom
		$("body").append($bg);
	}
}

//load队列
window.loadCallbackQueue = new (function(){
	var callbacks_ = [];
	this.add = function(fun){
		if(typeof(fun) == "function"){
			callbacks_.push(fun);
		}
	}
	this.execute = function(){
		for(var i = 0; i < callbacks_.length; ++i){
			callbacks_[i]();
		}

		callbacks_ = [];
	}
})();

/////////////////////////////////common ready////////////////////////////////////////////////////////////////////
$(function() {
	//获取系统默认的滚动条的大小
	window.scrollbar = new (function(){
		var scrollBarHelper = document.createElement("div");
		scrollBarHelper.style.cssText = "overflow:scroll;width:100px;height:100px;";
		document.body.appendChild(scrollBarHelper);

		this.height = scrollBarHelper.offsetHeight - scrollBarHelper.clientHeight;
		this.width = scrollBarHelper.offsetWidth - scrollBarHelper.clientWidth;

		document.body.removeChild(scrollBarHelper);
	})();

	//禁用页面选中
	util.disableSelection();

	//整个页面加载完成之后的回调
	window.onload = function(){
		loadCallbackQueue.execute();
	}
	//
});

