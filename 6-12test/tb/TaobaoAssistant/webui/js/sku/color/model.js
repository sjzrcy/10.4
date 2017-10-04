//
//颜色试图版本控制
util.createNamespace("Sku.Version");
Sku.Version.Color = {
	V1: 1, //颜色名 + 别名 + 属性图片
	V2: 2, //颜色占位 + 别名 + 属性图片 + 基础色
	V3: 3, //C.自定义颜色名 + 基础色 + 属性图片
};

//
/*
	颜色option结构
	{
		text:"颜色名",
		value:"颜色名对应的vid",
		rgb:"通过颜色名推导出来的RGB值",
		basecolor:[{text:"", value:""}],最多三个基础色
		alias:"颜色别名",
		url:"图片,
		complexid:"扩展id，后续需要写回到后台",
	}
*/

util.createNamespace("Sku.Model");
//
Sku.Model.Color = Backbone.Model.extend({
	setDefaults:function(){
		/*
		  外部传入：
			field:null,//schema颜色字段
			extend:null,//schema颜色扩展字段
		*/
		
		this.set({
			options:[],
			extendOptions:{},
			version:0,//颜色版本
		});
	},

	events:{//颜色类支持的事件
		"optionStatusChanged":"", //选项选中状态发生了变化，给内部用
		"optionCountChanged":"",//给外部用（重绘sku）
		"optionInfoChanged":"",//给外部用（局部更新sku）
	},

	initialize:function(){
		//
		this.setDefaults();
		
		//1.确定颜色版本
		var isExtendIncludeBasecolor = function(extend){
			var children = extend.children();
			if(!children){return false;}

			var basecolor = "basecolor";
			for(var i = children.length - 1; i >= 0; --i){
				var child = children[i];
				if(child.id == basecolor){
					return true;
				}
			}

			return false;
		}

		var field = this.get("field");
		if(!field){
			debug.trace("颜色字段未设置");
			return;
		}

		var extend = this.get("extend");
		if(!extend){
			debug.trace("颜色扩展字段未设置");
			return;
		}

		util.sku.fields.add(field.rawId());
		if(field.type() == shell.constants.field.SINGLE_CHECK){
			if(isExtendIncludeBasecolor(extend)){
				this.set({version: Sku.Version.Color.V2});
			}else{
				this.set({version: Sku.Version.Color.V1});
			}
		}else{
			this.set({version: Sku.Version.Color.V3});
		}

		//2.初始化extendOptions,options
		var id = field.rawId();
		var complexValues = extend.complexValues();
		var extendOptions = this.get("extendOptions");
		for(var i = complexValues.length - 1; i >= 0; --i){
			var complexValue = complexValues[i];
			if(!extendOptions[complexValue[id]]){
				extendOptions[complexValue[id]] = complexValue;	
			}else{
				//清理脏数据，自定义的颜色名不可重复
				shell.removeComplexValue(extend.schemaType(), extend.rawId(), complexValue["complexid"]);				
			}
		}

		//初始化颜色选项
		var version = this.get("version");
		var options = this.get("options");
		switch(version){
			case Sku.Version.Color.V1:{
				var sourceOptions = field.options();
				for(var i = 0; i < sourceOptions.length; ++i){
					var sOption = sourceOptions[i];
					var option = this.emptyOption();

					option["id"] = id;
					option["checked"] = false;
					option["text"] = sOption.text();
					option["value"] = sOption.value();
					option["rgb"] = mapping.color.rgb(option.text);

					var extendOption = extendOptions[option["value"]];
					if(extendOption){
						option["alias"] = extendOption["alias_name"];
						option["url"] = extendOption["prop_image"];
						option["complexid"] = extendOption["complexid"];
					}

					options.push(option);
				}
			}
			break;

			case Sku.Version.Color.V2:{
				//
				var sourceOptions = field.options();
				for(var i = 0; i < sourceOptions.length; ++i){
					var sOption = sourceOptions[i];
					var option = this.emptyOption();

					option["id"] = id;
					option["checked"] = false;

					//第二套颜色方案下，text无意义，因为value仅仅起到占位的作用
					option["text"] = ""; //sOption.text();
					option["value"] = sOption.value();

					var extendOption = extendOptions[option["value"]];
					if(extendOption){
						option["checked"] = true;//若存在扩展，自动勾选上
						option["alias"] = extendOption["alias_name"];
						option["url"] = extendOption["prop_image"];
						option["basecolor"] = util.color.basecolor.toWebValue(extendOption["basecolor"], this.basecolors());
						option["complexid"] = extendOption["complexid"];
					}

					options.push(option);
				}
			}
			break;

			case Sku.Version.Color.V3:{
				//
				for(var value in extendOptions){
					var extendOption = 	extendOptions[value];

					var option = this.emptyOption();
					option["id"] = id;
					option["checked"] = true;
					option["isCustom"] = true;
					option["value"] = extendOption[field.rawId()];
					option["url"] = extendOption["prop_image"];
					option["basecolor"] = util.color.basecolor.toWebValue(extendOption["basecolor"], this.basecolors());
					option["complexid"] = extendOption["complexid"];

					options.push(option);
				}
				//
			}
			break;

			default:
				debug.trace("color version is unknow:" + version);
			break;
		}
	},

	version: function(){
		return this.get("version");
	},

	emptyOption:function(){
		return util.sku.emptyOption();
	},

	findOption:function(vid){
		var options = this.get("options");
		for(var i = options.length - 1; i >= 0; --i){
			if(options[i].value == vid){
				return options[i];
			}
		}
	},

	findComplex:function(complexid, id){
		var options = this.get("options");
		for(var i = options.length - 1; i >= 0; --i){
			if(options[i].complexid == complexid){
				return options[i];
			}
		}

		var emptyOption = this.emptyOption();
		emptyOption.complexid = complexid;
		emptyOption.id = id;
		options.push(emptyOption);
		return emptyOption;
	},

	removeComplex:function(complexid, forbidDelete){
		var options = this.get("options");
		for(var i = options.length - 1; i >= 0; --i){
			if(options[i].complexid == complexid){
				var extend = this.get("extend");
				if(extend){
					shell.removeComplexValue(extend.schemaType(), extend.rawId(), complexid);
				}
				if(!forbidDelete){
					options.splice(i, 1);	
				}
				break;
			}
		}
	},

	removeComplexV2:function(complexid){
		var options = this.get("options");
		for(var i = options.length - 1; i >= 0; --i){
			if(options[i].complexid == complexid){
				var extend = this.get("extend");
				if(extend){
					shell.removeComplexValue(extend.schemaType(), extend.rawId(), complexid);
				}

				var option = options[i];
				option.basecolor = [];
				option.alias = "";
				option.url = "";
				break;
			}
		}
	},

	moveOption2End: function(option){
		var options = this.get("options");
		for(var i = options.length - 1; i >= 0; --i){
			if(options[i] == option){
				options.splice(i, 1);
				options.push(option);
				break;
			}
		}
	},

	findExtendOption:function(vid){
		var options = this.get("extendOptions");
		return options[vid];
	},

	isReady: function(){
		return (this.get("ready") === true);
	},

	setSelectedOptions:function(selectedOptions, selectedCustomOptions){
		var options = this.get("options");

		_.each(selectedOptions, function(selectedOption){
			var option = _.find(options, function(option){
				return (option.value == selectedOption.value);
			});
			if(option){
				option.checked = true;
			}
		});

		var me = this;
		_.each(selectedCustomOptions, function(selectedOption){
			var option = _.find(options, function(option){
				return (option.value == selectedOption.value);
			});
			if(option){
				option.isCustom = true;
				option.checked = true;
			}else{
				//在第三套(输入)颜色中，sku出现的尺码，可以没有经过扩展
				option = me.emptyOption();
				option.complexid = shell.createUUID();
				option.id = selectedOption.id;
				option.value = selectedOption.value;
				option.isCustom = true;
				option.checked = true;
				options.push(option);
			}
		});

		this.set({"ready": true});
		this.trigger("optionsInited");
	},

	selectedOptions:function(){
		var selectedOptions = [];
		var options = this.get("options");
		var version = this.version();

		if(version == Sku.Version.Color.V1){
			_.each(options, function(option){
				if(option.checked && option.value){
					selectedOptions.push(option);
				}
			});
		}else if(version == Sku.Version.Color.V2){
			_.each(options, function(option){
				if(option.checked){
					selectedOptions.push(option);
				}
			});
		}else if(version == Sku.Version.Color.V3){
			_.each(options, function(option){
				if(option.checked && option.value){
					selectedOptions.push(option);
				}
			});
		}
		
		return selectedOptions;
	},

	basecolors:function(){
		//
		var findChild = function(field, childId){
			if(!field){return;}
			var children = field.children();
			if(!children){return;}

			for(var i = children.length - 1; i >= 0; --i){
				var child = children[i];
				if(child.id == childId){
					return child;
				}
			}
		}

		var extend = this.get("extend");
		var basecolor = findChild(extend, "basecolor");
		return basecolor["options"];
	},

	isRequired:function(){
		var field = this.get("field");
		return (field && field.hasRule(shell.constants.rule.REQUIRED));
	},

	name:function(){
		return "颜色";
	},

	id:function(){
		var field = this.get("field");
		if(field.type() == shell.constants.field.SINGLE_CHECK){
			return field.rawId();
		}
	},

	inputId:function(){
		var field = this.get("field");
		if(field.type() == shell.constants.field.INPUT){
			return field.rawId();
		}
	},

	isMust: function(){
		return true;
	},

	setOption:function(option){
		debug.trace(option);
		var version = this.get("version");
		switch(version){
			case Sku.Version.Color.V1:{
				this.setOptionV1(option);
				break;
			}

			case Sku.Version.Color.V2:{
				this.setOptionV2(option);
				break;
			}

			case Sku.Version.Color.V3:{
				this.setOptionV3(option);
				break;
			}

			default:{
				debug.warn("unknow color version:" + version);
				break;
			}
		}
	},

	setOptionV1:function(option){
		var lastOption = this.findOption(option.value);
		var isExtendUpdated = (option.alias != lastOption.alias || option.url != lastOption.url);
		var isOptionUpdated = (lastOption.checked != option.checked);

		//更新对象值
		_.extend(lastOption, option);

		//更新扩展
		if(lastOption.checked){
			var field = this.get("field");
			var extend = this.get("extend");
			if(field && extend){
				var complex = {};
				complex[field.rawId()] = lastOption.value;
				complex["prop_image"] = lastOption.url;
				complex["alias_name"] = lastOption.alias;
				shell.setComplexValue(extend.schemaType(), extend.rawId(), option.complexid, JSON.stringify(complex));
			}
		}else{
			this.removeComplex(lastOption.complexid, true);
		}

		/************************************************************/
		if(isExtendUpdated){
			this.trigger("optionInfoChanged");//选项信息变化
		}

		if(isOptionUpdated){
			this.trigger("optionCountChanged");//选项选中状态发生变化,通知外部
		}
	},

	setOptionV2:function(option){
		var lastOption = this.findOption(option.value);
		var isExtendUpdated = (option.alias != lastOption.alias 
								|| option.url != lastOption.url 
								|| !util.color.basecolor.isSame(option.basecolor, lastOption.basecolor));
		var isOptionUpdated = (lastOption.checked != option.checked);

		//更新对象值
		_.extend(lastOption, option);

		//更新扩展
		if(lastOption.checked){
			var field = this.get("field");
			var extend = this.get("extend");
			if(field && extend){
				var complex = {};
				complex[field.rawId()] = lastOption.value;
				complex["prop_image"] = lastOption.url;
				complex["alias_name"] = lastOption.alias;
				complex["basecolor"] = util.color.basecolor.toBackendValue(lastOption.basecolor);
				shell.setComplexValue(extend.schemaType(), extend.rawId(), lastOption.complexid, JSON.stringify(complex));
			}
		}else{
			this.removeComplexV2(lastOption.complexid);
		}

		/****************************************************/
		if(isExtendUpdated){
			this.trigger("optionInfoChanged");//选项信息变化
		}

		if(isOptionUpdated){
			if(lastOption.checked){//调整选中项到数组末尾
				this.moveOption2End(lastOption);
			}

			this.trigger("optionStatusChanged");
			this.trigger("optionCountChanged");
		}
	},

	setOptionV3:function(option){
		var lastOption = this.findComplex(option.complexid, this.inputId());
		var isExtendUpdated = (option.value != lastOption.value 
								|| option.url != lastOption.url 
								|| !util.color.basecolor.isSame(option.basecolor, lastOption.basecolor));
		var isOptionUpdated = (lastOption.checked != option.checked);

		//更新对象值
		_.extend(lastOption, option);

		//更新扩展
		if(lastOption.checked){
			var field = this.get("field");
			var extend = this.get("extend");
			if(field && extend){
				var complex = {};
				complex[field.rawId()] = lastOption.value;
				complex["prop_image"] = lastOption.url;
				complex["basecolor"] = util.color.basecolor.toBackendValue(lastOption.basecolor);
				shell.setComplexValue(extend.schemaType(), extend.rawId(), lastOption.complexid, JSON.stringify(complex));
			}
		}else{
			this.removeComplex(lastOption.complexid);
		}

		/*************************************************************/
		if(isExtendUpdated){
			this.trigger("optionInfoChanged");//选项信息变化
		}

		if(isOptionUpdated){
			this.trigger("optionStatusChanged");//选项选中状态发生变化，通知内部
		}

		if(isOptionUpdated && lastOption.value){
			this.trigger("optionCountChanged");//选项选中状态发生变化，通知外部	
		}
	},

	isPack:function(){
		return (!this.get("pack"));
	},

	setPack:function(isPacked){
		this.set({"pack":!isPacked});
		this.trigger("packStatusChanged");
	},

	isImageRequired: function(){
		var extend = this.get("extend");
		if(extend){
			var image = util.sku.findChild("prop_image", extend);
			if(image){
				return util.sku.isRequired(new ItemField(image));	
			}
		}
		return false;
	},

	aliasMaxLengthRule:function(){
		var extend = this.get("extend");
		if(!extend){
			return;
		}

		var alias = util.sku.findChild("alias_name", extend);
		if(!alias){
			return;
		}

		var field = new ItemField(alias);
		return field.getRule(shell.constants.rule.MAX_LENGTH, true);
	},

	inputMaxLengthRule:function(){
		var field = this.get("field");
		if(!field){
			return field.getRule(shell.constants.rule.MAX_LENGTH, true);
		}
	},
	//
});