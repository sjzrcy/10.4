///


define(function(require, exports, module){
	//
	function ImagePreview(url)
	{
		var metaUrl_ = url;

		this.show = function(){
			var $bg = $("<div>").addClass("preview-bg");
			var $previewBox = $("<div>").addClass("preview-box").appendTo($bg);

			var $x = $("<div>").addClass("preview-x").appendTo($previewBox);
			var $preview = $("<div>").css("background-image", "url('" + encodeURI(url) + "')").addClass("preview-img").appendTo($previewBox);

			$x.click(function(){
				$bg.remove();
			});

			$previewBox.click(function(){
				event.stopPropagation();
			});

			var $body = $('body');
			setTimeout(function(){
				$body.click(function(){
					$bg.remove();
				});
			}, 10);

			$previewBox.css('top', ($body.scrollTop() + 50) + 'px');
			$body.append($bg);
		};
	}

	//
	module.exports = ImagePreview;
});