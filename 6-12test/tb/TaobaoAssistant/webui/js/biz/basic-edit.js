//
window.basic = new (function(){
	/*基本信息页面-流程控制*/
	this.setCategory = function(category){
		var cid = category.cid;
		var title = category.title;

		//如果类目数据还没初始化完毕，这里有可能为空，所以需要重新获取
		if(category.title){
			var $categorySelect = $("#category_select");
			if(title && $categorySelect.find("[value='" + cid + "']").length == 0){
				$categorySelect.append("<option value='" + cid + "'>" + title + "</option>");
			}

			$categorySelect.val(cid);
			$categorySelect.queryselect("permitCustomInput", true);
			$categorySelect.queryselect("setCustomValue", title);
			$categorySelect.queryselect("permitCustomInput", false);
		}else if(parseInt(cid)){//有类目才取获取类目名称的动作
			setTimeout(function(){
				shell.category(function(json){
					var category = JSON.parse(json);
					basic.setCategoryTitle(category.title);
				});
			}, 
			400);
		}
	}

	var MAX_RETRY_COUNT = 300;//2分钟
	var retrySetTitleCount_ = 0;
	//
	this.setCategoryTitle = function(title){
		debug.warn("setCategoryTitle:" + title);
		if(title){
			var $categorySelect = $("#category_select");
			$categorySelect.queryselect("permitCustomInput", true);
			$categorySelect.queryselect("setCustomValue", title);
			$categorySelect.queryselect("permitCustomInput", false);
			retrySetTitleCount_ = 0;
		}else if(retrySetTitleCount_ < MAX_RETRY_COUNT){
			setTimeout(function(){
				shell.category(function(json){
					var category = JSON.parse(json);
					if(parseInt(category.cid) > 0){
						basic.setCategoryTitle(category.title);
					}
				});
			}, 
			400);
			retrySetTitleCount_ += 1;
		}else{
			retrySetTitleCount_ = 0;
		}
	}

	this.loadProductSchema = function(){
		this.clearItemEditSchema();
		spu.clear();
		
		if(shell.brand.length > 0){
			$("#brand_section").css("display", "block");

			var schemaType = shell.constants.schema.PRODUCT;
			loadSchema(frame.product(), shell.brand, config.section.PRODUCT, schemaType);
			loadOthers(frame.product(), shell.brand, config.section.PRODUCT, schemaType);

			RuleEngine.applyCommands(schemaType);
			FieldManager.applyRules(schemaType);
		}
	}

	this.clearProductSchema = function(){
		$("#brand_section").css("display", "none");
		$(config.section.PRODUCT).empty();
		$(config.section.PRODUCT).html("<div id='prop_20000'></div></div>");
		FieldManager.clear(shell.constants.schema.PRODUCT);	
	}

	var tryRenderErrorAndWarn = function(){
		var tipIds = frame.tips();
		var fields = [];
		_.each(tipIds, function(id){
			var raw = util.itemRawField(id);
			if(raw){
				fields.push(new ItemField(raw));
			}
		});

		if(fields.length == 0){
			return;
		}

		//1 获取label
		var labels = [];

		var patchLabels = function(labelGroup){
			_.each(labelGroup.labels(), function(label){
				labels.push(label);	
			});

			var children = labelGroup.groups();
			for(var i = 0; i < children.length; ++i){
				arguments.callee(children[i]);
			}
		}

		_.each(fields, function(field){
			patchLabels(field.labelGroup());
		});

		if(labels.length == 0){
			return;
		}
		
		//2 渲染
		var $tips = $(".item-tips");
		var $ul = $("ul", $tips);
		_.each(labels, function(label){
			var $li = $("<li>").text(label.name + "，" + label.value);
			$ul.append($li);
		});

		$tips.css("display", "block");
	}

	var clearErrorAndWarn = function(){
		var $tips = $(".item-tips");
		$tips.css("display", "none");
		$("ul", $tips).empty();
	}

	this.loadItemEditSchema = function(schemaType){
		TimeRecorder.start("loadItemSchema:" + (schemaType == shell.constants.schema.ITEM_UPDATE) ? "ITEM_UPDATE" : "ITEM_ADD");

		this.clearItemEditSchema();
		loadSchema(frame.basic(), shell.item, config.section.ITEM_BASIC, schemaType);
		RuleEngine.applyCommands(schemaType);
		FieldManager.applyRules(schemaType);
		tryRenderErrorAndWarn();

		TimeRecorder.finish();
	}

	this.clearItemEditSchema = function(){
		var html = "\
			<div id='title'></div>\
			<div id='short_title'></div>\
			<div id='sell_point'></div>\
			<div id='sell_points'></div>\
			<div class='section_row clearfix'>\
				<div id='price' class='row_item' style='width:274px;'></div>\
				<div id='auction_point' class='row_item' style='width:189px;'></div>\
	        </div>\
	        <div id='quantity'></div>\
	        <div class='section_row clearfix'>\
	        	<div id='outer_id' class='row_item' style='width:274px;'></div>\
	        	<div id='barcode' class='row_item' style='width:236px; left:10px;'></div>\
	        </div>\
	        <div class='section_row clearfix'>\
	        	<div id='item_status' class='row_item' style='width:280px;'></div>\
	        	<div id='start_time' class='row_item' style='width:246px;'></div>\
	        </div>\
	        <div id='location'></div>\
	        <div id='item_size_weight'></div>\
	        <hr/>\
			<div id='delivery_way'></div>\
			<div class='item_section'>\
		        <div id='freight_payer'></div>\
		        <div id='freight_by_buyer'></div>\
		        <div id='freight' class='clearfix'></div>\
		        <div id='postage_id'></div>\
		    </div>\
		    <br/>\
	        <div class='item_section'>\
		        <div id='locality_life.expirydate' style='margin-top:4px;'></div>\
		        <div id='locality_life.expirydate.severalDays'></div>\
		        <div id='locality_life.expirydate.deadline'></div>\
		        <div id='locality_life.expirydate.end'></div>\
		        <div id='locality_life.expirydate.startend'></div>\
		        <hr/>\
		        <div id='locality_life.network_id'></div>\
		        <div id='locality_life.merchant'></div>\
		        <div id='locality_life.verification' class='clearfix'></div>\
		        <div id='expired_refund' class='clearfix'></div>\
	        	<div id='auto_refund' class='clearfix'></div>\
	        	<div id='autoRefundfieldKey'></div>\
	        </div>\
			";

		$("#basic_info_1").empty();
		$("#basic_info_1").html(html);

		$("#basic_info_2").empty();
		$("#basic_info_2").html("<div id='seller_cids'></div>\
								 <div id='item_images'></div>");

		clearErrorAndWarn();

		FieldManager.clear(shell.constants.schema.ITEM_ADD);
		FieldManager.clear(shell.constants.schema.ITEM_UPDATE);
	}

	this.clearAllSchema = function(){
		var $categorySelect = $("#category_select");
		$categorySelect.val("0");
		$categorySelect.queryselect("permitCustomInput", true);
		$categorySelect.queryselect("setCustomValue", "");
		$categorySelect.queryselect("permitCustomInput", false);

		this.clearProductSchema();
		spu.clear();
		this.clearItemEditSchema();

		RuleEngine.reset();
		FieldManager.clear();
	}

	this.clearTokens = function(){
		this.clearProductSchema();
		spu.clear();
		this.clearItemEditSchema();

		RuleEngine.reset();
		FieldManager.clear();
	}

})();

process.setCategory = function(json){
	debug.log(json);
	basic.setCategory(JSON.parse(json));
}

process.renderProductSchema = function(json){
	shell.setBrandToken(json);
	basic.loadProductSchema();
}

process.renderItemAddSchema = function(json) {
	shell.setItemToken(json);
	basic.loadItemEditSchema(shell.constants.schema.ITEM_ADD);
}

process.renderItemUpdateSchema = function(json){
	shell.setItemToken(json);
	basic.loadItemEditSchema(shell.constants.schema.ITEM_UPDATE);
}

process.clearAllSchema = function() {
	process.tryHideLoadingUi();
	process.tryCloseNetErrorTip();
	basic.clearAllSchema();
	process.handleClear();
	Tooltip.clear();
}

/*******************************流程控制*******************************/
$(function() {
	var $categorySelect = $("#category_select");
	var $chooseCategoryButton = $("#choose_category");

	$categorySelect.queryselect();
	$categorySelect.bind("select", function() {
		var $option = $(this).find("option:selected");
		var cid = $option.val();
		var title = $option.text();
		debug.log("select category: (cid" + ":" + cid + ", title:" + title + ")");
		basic.clearTokens();
		shell.updateCategory(cid);
	});

	$chooseCategoryButton.click(function() {
		shell.chooseCategory($categorySelect.val(), function(json){
			//
			var lastCid = $("#category_select option:selected").val();
			var category = JSON.parse(json);
			if(category.cid == "0"){
				return;
			}

			basic.setCategory(category);
			
			//选择的类目和当前的类目不一样，或者是第一次选择类目
			var cid = category.cid;
			if (cid !=  lastCid || $("#category_select option").length == 1) {
				$categorySelect.trigger("select");
			}
		});
	});
});