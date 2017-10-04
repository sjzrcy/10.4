// JavaScript Document
window.schema = new (function(){
	//
	this.categoryId = function(){
		var cid = $("#category_select option:selected").val();
		debug.log("category id:" + cid);
		if(!cid){cid = "";}
		return cid;
	}

	this.brandId = function(){
		var bid = $("#prop_20000 option:selected").val();
		debug.log("brand id:" + bid);
		if(!bid){bid = "";}
		return bid;
	}

	this.isCreated = function(id){
		var field = FieldManager.get(id);
		if (field) {
			debug.error("[" + id + "] has been inited!");
			return true;
		}else{
			return false;
		}
	}
	//
})();

function makeTargetExist(field, context) {
	var $target = $("#" + JID(field.id), context);
	if ($target.length > 0){// 已经存在则清空目标节点
		$target.html("");
		return;
	}

	if (context != "") {
		var $context = $(context);
		if ($context.length == 1) {
			$(context).append($("<div>").attr("id", field.id));
			return;
		}else{
			debug.error("(context, " + context + "), length:" + $context.length);
		}
	}

	debug.error("can not find (context, '" + context + "'), (id, '" + field.id + "')");
}

// 根据id，取出对应field对象，然后优先执行回调函数，如果没有配置则执行模板函数，生成UI元素
// 在指定的容器中渲染全部的schema field列表
// context:为标准的jQuery选择器
function renderSection(schemaList, context)
{
	for(var i = 0; i < schemaList.length; i++){
		var field = schemaList[i];
		if (window.schema.isCreated(field.id)) {
			continue;
		}

		makeTargetExist(field, context);
		if (typeof(field.custom) == "function") {
			debug.log("custom render...," + field.id);
			field.custom(field);
		} else {
			generateHtml(field, context);
		}
	};
}

function loadSchema(fields, schema, context, schemaType) {
	var schemaList = [];
	for (var i = 0; i < schema.length; ++i) {
		var field = schema[i];
		var custom = fields[field.id];
		if(typeof(custom) != "undefined"){
			if(typeof(custom) == "function"){
				field.custom = custom;
			}

			field.schemaType = schemaType;
			schemaList.push(field);
		}
	}

	debug.warn("render length: " + schemaList.length);
	renderSection(schemaList, context);
}

// 加载预定义之外的field，只在指定页面指定位置进行追加 
function loadOthers(preDefineFields, schema, context, schemaType) {
	var others = [];
	for (var i = 0; i < schema.length; ++i) {
		var id = schema[i].id;
		if (typeof(preDefineFields[id]) == "undefined") {
			schema[i].schemaType = schemaType;
			others.push(schema[i]);
		}
	}

	renderSection(others, context);
}

//////////////////////////////////////////////////////////////
function generateNode(field) {
	var e = new ItemField(field);
	return e.html();
}

/****自定义生成接口规范****
    *入参：field（C++）
    *行为：创建ItemField对象
    *行为：将生成的内容填充到顶层容器
    *行为：通过ItemField对象读写
***************************/
function generateHtml(field, context) {
	var $cache = $("#" + JID(field.id), context);
	$cache.append(generateNode(field));

	var jsField = FieldManager.get(field.id);
	RuleEngine.tryRegisterDependRule(jsField);
	jsField.installRules(true);
}



/***************************************************************/
function refreshItemOptions(id)
{
	var field = FieldManager.get(id);
	if(!field){return;}

	shell.refreshItemToken(field.schemaType(), field.id(), function(json){
		debug.warn(json);
		var qtField = JSON.parse(json);
		field.updateOptions(qtField.options);
	});
}

function itemSectionResize()
{
	var $section = $(".item_section");
	if($("#delivery_way").css("display") == "none"){
		$section.css({"width":"98%", "left":"1%"});
		return;
	}

	$section.each(function(index){
		var $item = $(this);
		if($item.height() <= 16){
			$item.css("border", "none");
			$("hr", $item).hide();
		}else{
			$item.css("border", "solid 1px #a0a0a0");
			$("hr", $item).show();
		}
	});
}