// JavaScript Document

//
util.createNamespace("util.custom");

//
util.custom.initGroupOptions = function(group){
	group.options = [];
	//
	var prop = group.prop;
	var id = prop.rawId();
	var isSupportCustom = !!group.input;
	
	var options = prop.options();
	for(var i = 0; i < options.length; ++i){
		if(isSupportCustom && (options[i].text() == "其它" || options[i].text() == "其他")){
			continue;
		}

		var option = {};
		option["value"] = options[i].value();
		option["text"] = options[i].text();
		option["id"] = id;
		option["isCustom"] = false;
		group.options.push(option);
	}
}
