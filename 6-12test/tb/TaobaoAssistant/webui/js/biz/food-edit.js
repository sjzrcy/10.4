/*
	食品专项
*/

window.food = new (function(){
	//
	this.loadItemEditSchema = function(schemaType){
		this.clearSchema();
		loadSchema(frame.food(), shell.item, config.section.ITEM_FOOD, schemaType);

		RuleEngine.applyCommands(schemaType);
		FieldManager.applyRules(schemaType);

		$(window).resize();
	}

	this.clearSchema = function(){
		var html = "\
			<div id='food_left'>\
				<div id='food_security.prd_license_no'></div>\
				<div id='food_security.design_code'></div>\
				<div id='food_security.factory'></div>\
				<div id='food_security.factory_site'></div>\
				<div id='food_security.contact'></div>\
				<div id='food_security.mix'></div>\
				<div id='food_security.plan_storage'></div>\
			</div>\
			<div id='food_right'>\
				<div id='food_security.period'></div>\
				<div id='food_security.food_additive'></div>\
				<div id='food_security.health_product_no'></div>\
				<div id='food_security.supplier'></div>\
				<div id='food_security.product_date'></div>\
		        <div id='food_security.stock_date'></div>\
		     </div>\
			";
		/*
		  <div id='food_security.stock_date_start'></div>
	      <div id='food_security.stock_date_end'></div>
	      <div id='food_security.product_date_start'></div>
		  <div id='food_security.product_date_end'></div>
		  只需要第一级的字段，层次结构由schema自行描述
		 */

		var $food = $(config.section.ITEM_FOOD);
		$food.empty();
		$food.html(html);

		RuleEngine.reset();
		FieldManager.clear();
	}
})();

process.renderItemAddSchema = function(json){
	shell.setItemToken(json);
	food.loadItemEditSchema(shell.constants.schema.ITEM_ADD);
}

process.renderItemUpdateSchema = function(json){
	shell.setItemToken(json);
	food.loadItemEditSchema(shell.constants.schema.ITEM_UPDATE);
}

process.renderProductSchema = function(){
	food.clearSchema();	
}
process.clearAllSchema = function(){
	process.tryHideLoadingUi();
	process.tryCloseNetErrorTip();
	food.clearSchema();
	process.handleClear();
	Tooltip.clear();
}



/////////////////////////////////////////////////////////
function BeginEndDate(field){
	var field_ = new ItemField(field);
	field_.setType(shell.constants.field.INPUT);

	var startField_ = (function(field){
		var start = null;
		for(var i = 0; i < field.children.length; ++i){
			var child = field.children[i];
			if(child.id.indexOf("start") != -1){
				child.schemaType = field.schemaType;
				start = new ItemField(child);
				break;
			}
		}
		if(!start){debug.error("BeginEndDate, can not find start date field");}
		return start;
	})(field);

	var endField_ = (function(field){
		var end = null;
		for(var i = 0; i < field.children.length; ++i){
			var child = field.children[i];
			if(child.id.indexOf("end") != -1){
				child.schemaType = field.schemaType;
				end = new ItemField(child);
				break;
			}
		}
		if(!end){debug.error("BeginEndDate, can not find end date field");}
		return end;
	})(field);

	var content = function(){
		var $content = field_.content();
		$content.empty();

		// @ZZ left失效，为何？ 
		var $startContent = startField_.content().css({"min-width":"0", "width":"45%"}).css("left", "0px");
		$("input", $startContent).datepicker({
			dateFormat: config.DATE_FORMAT,
			onSelect:function(){$(this).blur();}
		});

		var $endContent = endField_.content().css({"min-width":"0", "width":"45%"}).css("left", "0px");
		$("input", $endContent).datepicker({
			dateFormat: config.DATE_FORMAT,
			onSelect:function(){$(this).blur();}
		});

		$content.append($startContent);
		$content.append($("<div>").text("至").css({
			"position":"relative", 
			"float":"left", 
			"width":"22px", 
			"height":"22px", 
			"left":"6px", 
			"line-height":"22px"}));
		$content.append($endContent);
		return $content;
	}

	var $node_ = $("<div>").addClass("wrapper clearfix");
	var genStructure = function(){
		var $title = field_.title(field_.hasRule(shell.constants.rule.REQUIRED));
		var $content = content();
		$node_.append($title);
		$node_.append($content);
	}

	genStructure();
	this.node = function(){return $node_;}
}