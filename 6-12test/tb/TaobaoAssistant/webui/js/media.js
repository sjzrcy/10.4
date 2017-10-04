// JavaScript Document
/////////////////////////////////////////////////////////////////
function MultiImage(field, requireCenter){
	var field_ = new ItemField(field);
	var IMAGE_SIZE = field.children.length;
	var imageList_ = (function(list){
		var itemList = [];
		for(var i = 0; i < list.length; ++i){
			var itemField = new ItemField(list[i]);
			itemList.push(itemField);
		}
		return itemList;
	})(field.children);

	var requireCenter_ = (requireCenter === true);
	var currentIndex_ = 0; //索引统一从0开始
	var DEFUALT_PREVIEW = "pic/default_preview.jpg";

	var $wrapper_ = undefined;
	var $multiImage_ = undefined;
	var $preview_ = undefined;
	var $imageBar_ = undefined;
	var $addImageButton_ = undefined;
	var $removeImageButton_ = undefined;
	
	var OPACITY = 0.9;
	var SHOW_TIME = 200;
	var HIDE_TIME = 300;
	var KEY = "miv";

	var genTitle = function(isRequired){
		var $title = $("<div>").addClass("ts_multi_image_title");
		if(requireCenter_){$title.css("left", "60px");}
		if(isRequired){
			$("<span>").addClass("required").text("*").appendTo($title);
		}

		$("<span>").text(field_.name()).appendTo($title);
		return $title;
	}

	var genPreview = function(){
		var $last = $("<div>").addClass("ts_multi_image_preview_last").css({opacity:0.0}).click(function(){
			if(currentIndex_ > 0){
				setCurrentIndex(currentIndex_ - 1);	
				if(currentIndex_ == 0){
					$last.animate({opacity:0.0}, HIDE_TIME);
				}
			}
		});
		var $previewLeft = $("<div>").addClass("ts_multi_image_preview_left").append($last).hover(
			function(){
				if(currentIndex_ > 0){
					$last.animate({opacity:OPACITY}, SHOW_TIME);
				}else{
					$last.animate({opacity:0.0}, HIDE_TIME);
				}
			}, 
			function(){
				$last.animate({opacity:0.0}, HIDE_TIME);
			});
		$previewLeft.append($last);

		var $next = $("<div>").addClass("ts_multi_image_preview_next").css({opacity:0.0}).click(function(){
			if(currentIndex_ < IMAGE_SIZE - 1){
				setCurrentIndex(currentIndex_ + 1);
				if(currentIndex_ == IMAGE_SIZE - 1){
					$next.animate({opacity:0.0}, HIDE_TIME);
				}
			}
			
		});
		var $previewRight = $("<div>").addClass("ts_multi_image_preview_right").hover(
			function(){
				if(currentIndex_ < IMAGE_SIZE - 1){
					$next.animate({opacity:OPACITY}, SHOW_TIME);
				}else{
					$next.animate({opacity:0.0}, HIDE_TIME);
				}
			}, 
			function(){
				$next.animate({opacity:0.0}, HIDE_TIME);
			}
		);
		$previewRight.append($next);

		$preview_ = $("<div>").addClass("ts_multi_image_preview").css({"background-image":"url('" + encodeURI(DEFUALT_PREVIEW) + "')"});
		$preview_.append($previewLeft).append($previewRight);
		return $preview_;
	}

	var genImageBar = function(){
		var $bar = $("<div>").addClass("ts_multi_image_bar");
		for(var i = 0; i < IMAGE_SIZE; ++i){
			var $item = $("<div>").addClass("ts_multi_image_bar_item").click(function(){
				var $items = $(".ts_multi_image_bar .ts_multi_image_bar_item");
				$items.removeClass("ts_multi_image_bar_item_selected");

				var $self = $(this);
				$self.addClass("ts_multi_image_bar_item_selected");
				setCurrentIndex($self.index());
			});

			$bar.append($item);
		}

		$bar.sortable({
			stop:function(event, ui){
				$(".ts_multi_image_bar_item", $bar).each(function(index, element){
					imageList_[index].setValue($(this).attr(KEY));
				});
			},
		});

		return $bar;
	}

	var genAddButton = function(){
		var $button = $("<div>").addClass("ts_multi_image_add")
					.append($("<img>").attr("src", "pic/add.png"))
					.append($("<span>").addClass("add_button_text").text("添加图片"))
					.click(function(){
			shell.choosePictures(function(imagesInfo){
				var list = imagesInfo.split(";");
				for(var i = list.length - 1; i >= 0; --i){
					if(!list[i]){
						list = list.splice(i, 1);
					}
				}
				if (list.length == 0) {
					return;
				}

				for(var i = 0, j = currentIndex_; 
					i < list.length && j <= IMAGE_SIZE;
					++i, ++j){
					imageList_[j].setValue(list[i]);
					var $image = $(".ts_multi_image_bar", $multiImage_).children().eq(j);
					if($image.length == 1){
						$image.css({"background-image":"url('" + encodeURI(list[i]) + "')"});
						$image.attr(KEY, list[i]);
					}
				}

				setCurrentIndex(currentIndex_);
			});
		});

		return $button;
	}

	var genRemoveButton = function(){
		var $button = $("<div>").addClass("ts_multi_image_delete")
								.append($("<img>").attr("src", "pic/minus.png"))
								.append($("<span>删除图片</span>"))
								.click(function(){
			$(".ts_multi_image_bar", $multiImage_).children().eq(currentIndex_).css({"background-image":""}).attr(KEY, "");
			imageList_[currentIndex_].setValue("");
			setCurrentIndex(currentIndex_);
		});

		return $button;
	}

	var genStructure = function(){
		var $title = genTitle(field_.hasRule(shell.constants.rule.REQUIRED));
		$title.removeClass("float_left");
		$title.css("float", "none");
		$wrapper_ = $("<div>").addClass("wrapper");
		$wrapper_.append($title);

		$preview_ = genPreview();
		$imageBar_ = genImageBar();
		$addImageButton_ = genAddButton();
		$removeImageButton_ = genRemoveButton();

		$multiImage_ = $("<div>").addClass("ts_multi_image");
		if(requireCenter_){$multiImage_.css("left", "60px");}
		$multiImage_.append($preview_)
			.append($imageBar_)
			.append($addImageButton_)
			.append($removeImageButton_);

		$wrapper_.append($multiImage_);
	}

	var setCurrentIndex = function(index){
		currentIndex_ = index;

		var $items = $(".ts_multi_image_bar .ts_multi_image_bar_item", $multiImage_);
		$items.removeClass("ts_multi_image_bar_item_selected");
		$items.eq(currentIndex_).addClass("ts_multi_image_bar_item_selected");

		var url = imageList_[currentIndex_].value();
		if(!url){
			url = DEFUALT_PREVIEW;
			$removeImageButton_.animate({"opacity":0.0}, HIDE_TIME);
			$(".add_button_text", $addImageButton_).text("添加图片");
		}else{
			$removeImageButton_.animate({"opacity":1.0}, SHOW_TIME);
			$(".add_button_text", $addImageButton_).text("更换图片");
		}
		$preview_.css({"background-image":"url('" + encodeURI(url) + "')"});
	}

	var loadImages = function(){
		$(".ts_multi_image_bar .ts_multi_image_bar_item", $multiImage_).each(function(index, element){
			var $item = $(element); //index从0开始
			var image = imageList_[index].value();
			$item.css({"background-image":"url('" + encodeURI(image) + "')"}).attr(KEY, image);
		});
	}

	////
	genStructure();
	loadImages();
	setCurrentIndex(0);
	////
	this.node = function(){return $wrapper_;}
	//
}

////////////////////////////////////////
function SingleImage(field){
	//
	var field_ = new ItemField(field);

	var $$wrapper_ = undefined; /*成员变量以下划线结束，要严格遵守*/
	var $image_ = undefined;
	var $addImageButton_ = undefined;
	var $bar_ = undefined;

	var genStructure = function(){
		var $title = title(field_.hasRule(shell.constants.rule.REQUIRED));
		$title.removeClass("float_left");
		$title.css("float", "none");
		$wrapper_ = $("<div>").addClass("wrapper");
		$wrapper_.append($title);

		$image_ = $("<div>").addClass("ts_image").error(function(e){alert(e);});
		$addImageButton_ = $("<div>").addClass("ts_image_add").click(function(){
			var images = shell.choosePictures(function(images){
				debug.warn(images);

				var list = images.split(";");
				if (list.length == 0) {return;}
				var image = list[list.length - 1];
				if(image){
					field_.setValue(image);
					setImage(image);
					$image_.hover(function(){$bar_.animate({opacity:1.0}, 200);}, function(){$bar_.animate({opacity:0.0}, 400);});

					$addImageButton_.detach();
					$image_.append($bar_);
					$bar_.css({opacity:0.0});
				}
			});
		});

		$addImageButton_.append($("<img>").attr("src", "pic/add.png"));
		$addImageButton_.append($("<span>").text("添加图片"));
		$image_.append($addImageButton_);
		$wrapper_.append($image_);

		$bar_ = $("<div>").addClass("ts_image_bar");
		$bar_.append($("<div>").addClass("ts_image_bar_change").text("换一张").click(function(){
			shell.choosePictures(function(images){
				debug.warn(images);
				var list = images.split(";");
				if (list.length == 0) {return;}
				var image = list[list.length - 1];
				if(image){
					field_.setValue(image);
					setImage(image);
				}	
			});
		}));

		$bar_.append($("<div>").addClass("ts_image_bar_delete").text("删除").click(function(){
			field_.setValue("");
			setImage("");

			$bar_.detach();
			$image_.hover(function(){}, function(){});
			$image_.append($addImageButton_);
		}));
	}

	var title = function(isRequired){
		var $title = $("<div>").addClass("ts_image_title");
		if(isRequired){
			$("<span>").addClass("required").text("*").appendTo($title);
		}

		$("<span>").text(field_.name()).appendTo($title);
		return $title;
	}

	var init = function(){ //init
		genStructure();
		if(field_.value()){
			setImage(field_.value());
			$image_.hover(
				function(){$bar_.animate({opacity:1.0}, 200);},
				function(){$bar_.animate({opacity:0.0}, 400);}
			);

			$addImageButton_.detach();
			$image_.append($bar_);
			$bar_.css({opacity:0.0});
		}
	};

	var setImage = function(url){
		$image_.css({"background-image":"url('" + encodeURI(url) + "')"});
	}

	init();
	this.node = function(){
		return $wrapper_;
	}
	//
}