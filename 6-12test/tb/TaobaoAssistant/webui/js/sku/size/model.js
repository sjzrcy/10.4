// JavaScript Document
//颜色试图版本控制
util.createNamespace("Sku.Version");
Sku.Version.Size = {
	V1: 1, //尺码枚举 + 扩展
	V2: 2, //尺码分组
	V3: 3, //尺码输入
};

/**
1.所有模型都要有isValid接口
2.所有option都要有id，checked，alias，isCustom, text, value, complexid
3.id从ui的option节点上去for字段
**/
/*
	#选项option
	{
		text:"",
		value:"",
		alias:"", 别名
		isCustom:true/false, 是否是自定义,如果可以，则直接从value中取值
		complexid:"",
		sizeTip:"",
	}

	1.尺码 + [尺码扩展]
	2.std_size_group + [{x_size:"", in_x_size:"",}, ...]
	3.尺码（input）(单字段)

	#.分组切换
	暴露到视图{
		options:"",
		customs:"",
		groups:"",
		isRequired:"",

		event{
			groupChanged:"",
		},
	}
	#识别：
	1.包含尺码字段，并且为枚举类型，并且不包含std_group_size字段
	2.包含std_group_size字段
	3.尺码字段为输入类型
*/

/*
	在上层，须先判断是否有尺码，否则会出错
*/
//
util.createNamespace("Sku.Model");
//
Sku.Model.Size = Backbone.Model.extend({
	//
	setDefaults:function(){
		/*
		外部传入：
			sku:null, //从sku中提取尺码相关信息
			std_size_group:null,//尺码分组相关信息

			std_size_extends:null,//设置尺码表
			size_measure_image:null,//尺码扩展示意图,是一个select,value张可能包含图片URL
		*/

		this.set({
			size:null, //for 1&3 
			extend:null, //for 1
			groups:{}, // 分组尺码，for2 {"value":{field:"", custom:""}}

			options:[],//视图和sku视图使用的选项
			groupOptions:[],//for 2
			version:0,
		});
	},

	events:{
		"optionInfoChanged": "", //选项信息变化
		"optionCountChanged": "", //选项数量变化
		"customOptionCountChanged": "", //自定义选项数量变化
	},

	initialize:function(){
		//
		this.setDefaults();

		//
		var sku = this.get("sku");
		var std_size_group = this.get("std_size_group");
		var version = util.size.getVersion(sku, std_size_group);
		this.set("version", version);

		//
		switch(version){
			case Sku.Version.Size.V1:{
				this.initOptionsV1(sku);
				break;
			}

			case Sku.Version.Size.V2:{
				this.initOptionsV2(sku, std_size_group);
				this.set({"valid":true});
				break;
			}

			case Sku.Version.Size.V3:{
				this.initOptionsV3(sku);
				break;
			}

			default:{
				debug.log("未检测到尺码字段");
				break;
			}
		}
	},

	name: function(){
		return "尺码";
	},

	id:function(){
		var version = this.version();
		switch(version){
			case Sku.Version.Size.V1:
			case Sku.Version.Size.V3:{
				var size = this.get("size");
				if(size){
					return size.rawId();	
				}
				break;
			}

			case Sku.Version.Size.V2:{
				var group = this.currentGroup();
				if(group){
					if(group.size){
						return group.size.rawId();
					}
				}
				break;
			}
		}
	},

	inputId:function(){
		var version = this.version();
		if(version == Sku.Version.Size.V2){
			var group = this.currentGroup();
			if(group && group.input){
				return group.input.rawId();
			}
		}
	},
	
	isReady: function(){
		return (this.get("ready") === true);
	},

	//option{value:"", id:""}
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

		var inputId = this.inputId();
		var isAddCustomOption = false;
		if(inputId){
			var me = this;
			_.each(selectedCustomOptions, function(customOption){
				if(inputId == customOption.id){
					var option = me.emptyOption();
					_.extend(option, customOption)
					option["isCustom"] = true;
					option["checked"] = true;
					options.push(option);
					isAddCustomOption = true;
				}
			});
		}

		if(isAddCustomOption === true){
			this.updateSizeTip2CustomOptions();
		}

		this.set({"ready": true});
		this.trigger("optionsInited");
	},

	selectedOptions:function(){
		var me = this;
		var selectedOptions = [];
		var options = this.get("options");
		_.each(options, function(option){
			if(option.checked && option.value){
				if(option.isCustom){
					var group = me.currentGroup();
					if(group && group.size && group.other){
						option.isSize = true;
						var other = group.other;
						option.other = {"id":other.id, "value":other.value};
					}
				}

				selectedOptions.push(option);
			}
		});
		
		return selectedOptions;
	},

	isMust: function(){
		return true;
	},

	initOptionsV1: function(sku){
		var size = util.size.findSize(sku);
		if(!size){return;}

		this.set({"size": size});
		this.set({"valid":true});

		var id = size.rawId();
		util.sku.fields.add(id);
		
		var options = this.get("options");
		var sourceOptions = size.options();
		for(var i = 0; i < sourceOptions.length; ++i){
			var sOption = sourceOptions[i];
			options.push({"id":id, text:sOption.text(), value:sOption.value(), alias:false, complexid:"", checked:false,});
		}

		var extend = util.size.findExtend(size);
		if(!extend){return;}

		this.set("extend", extend);
		var extendOptions = {};
		var complexValues = extend.complexValues();
		for(var i = complexValues.length - 1; i >= 0; --i){
			var complex = complexValues[i];
			extendOptions[complex[id]] = complex;
		}

		//去掉不支持alias的标记
		for(var i = options.length - 1; i >= 0; --i){
			var option = options[i];
			if(extendOptions[option.value]){
				option.complexid = extendOptions[option.value]["complexid"];
				option.alias = extendOptions[option.value]["alias_name"];
			}else{
				option.alias = "";
			}
		}
	},

	initOptionsV2: function(sku, std_size_group){
		var groups = this.get("groups");
		var modelGroupOptions = this.get("groupOptions");
		var groupOptions = std_size_group.options();
		for(var i = 0; i < groupOptions.length; ++i){
			var groupOption = {value: groupOptions[i].value(), text:groupOptions[i].text()};
			modelGroupOptions.push(groupOption);
			var size = util.size.findRelySize(sku, std_size_group.rawId(), groupOption);
			if(!size){
				alert("没有找到选项对应的尺码字段：" + groupOption.value + "," + groupOption.text);
				continue;
			}

			util.sku.fields.add(size.rawId());

			var group = {options:[]};
			if(size.type() == shell.constants.field.INPUT){
				group["size"] = null;
				group["input"] = size;
			}else{
				var input = util.size.findRelyInput(sku, size);
				if(input){util.sku.fields.add(input.rawId());}

				group["size"] = size;
				group["input"] = input;
			}

			util.size.initGroupOptions(group, this.stdSizeExtends());
			groups[groupOption.value] = group;
		}

		var group = groups[std_size_group.value()];
		if(group){this.set("options", group.options);}
	},

	initOptionsV3: function(sku){
		var size = util.size.findSize(sku);
		if(!size){return;}

		this.set({"size": size});
		this.set({"valid":true});
		util.sku.fields.add(size.rawId());
	},

	isRequired:function(){
		var version = this.version();
		if(version == Sku.Version.Size.V2){
			var group = this.currentGroup();
			if(group){
				if(group.size){
					return util.sku.isRequired(group.size);
				}
				if(group.input){
					return util.sku.isRequired(group.input);	
				}
			}
		}else{
			var field = this.get("size");
			if(field){
				return util.sku.isRequired(field);
			}
		}

		return false;
	},

	findOption:function(value){
		var options = this.get("options");
		for(var i = options.length - 1; i >= 0; --i){
			if(options[i].value == value){
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

		var option = this.emptyOption();
		option.complexid = complexid;
		option.id = id;
		options.push(option);
		return option;
	},

	removeOption:function(option){
		var options = this.get("options");
		for(var i = options.length - 1; i >= 0; --i){
			if(options[i].complexid == option.complexid){
				options.splice(i, 1);
				break;
			}
		}
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

	emptyOption:function(){
		return util.sku.emptyOption();
	},

	setOption:function(option){
		debug.trace(option);

		switch(this.get("version")){
			case Sku.Version.Size.V1:{
				this.setOptionV1(option);
				break;
			}

			case Sku.Version.Size.V2:{
				this.setOptionV2(option);
				break;
			}
			
			case Sku.Version.Size.V3:{
				this.setOptionV3(option);
				break;
			}
			
			default:{
				alert("尺码version异常:version==" + this.get("version"));
				break;
			}
		}
	},

	setOptionV1:function(option){
		//支持自定义
		var lastOption = this.findOption(option.value);
		var isStatusChanged = (lastOption.checked != option.checked);
		var isInfoChanged = (lastOption.alias != option.alias);

		_.extend(lastOption, option);

		//更新扩展
		if(lastOption.checked){
			var field = this.get("size");
			var extend = this.get("extend");
			if(field && extend){
				var complex = {};
				complex[field.rawId()] = lastOption.value;
				complex["alias_name"] = lastOption.alias;
				shell.setComplexValue(extend.schemaType(), extend.rawId(), lastOption.complexid, JSON.stringify(complex));
			}
		}else{
			this.removeComplex(lastOption.complexid, true);
		}

		/*****************************************************/
		if(isInfoChanged){
			this.trigger("optionInfoChanged");
		}

		if(isStatusChanged){
			this.trigger("optionCountChanged");
		}
	},

	setOptionV2:function(option){
		if(option.isCustom){
			var lastOption;
			if(option.value){
				lastOption = this.findOption(option.value);	
			}
			if(!lastOption){
				lastOption = this.findComplex(option.complexid, this.inputId());	
			}
			
			var isStatusChanged = (lastOption.checked != option.checked);
			var lastValue = lastOption.value;
			var isInfoChanged = (lastOption.value != option.value);
			var isSizeTipChanged = (lastOption.sizeTip != option.sizeTip);

			_.extend(lastOption, option);

			if(isInfoChanged){
				this.trigger("optionInfoChanged");
			}
			if(isStatusChanged){
				if(lastOption.isCustom && !lastOption.checked){
					this.removeOption(lastOption);
				}

				this.trigger("customOptionCountChanged");
				this.trigger("optionCountChanged");
				this.updateSizeMapping();
			}

			//fix#5975065 当自定义尺码值发生变化时，需要同时更新尺码备注
			if(isSizeTipChanged || isInfoChanged){
				//refix#5975065 当自定义尺码值发生变化时，需要删除之前的尺码备注
				if(isInfoChanged){
					this.removeSizeTip(lastOption.id, lastValue);
				}

				var group = this.currentGroup();
				if(group){
					var other = group.other;
				}
				
				//更新尺码备注
				this.updateSizeTip(lastOption.id, lastOption.value, lastOption.sizeTip, other);
			}
		}else{
			//标准尺码
			var lastOption = this.findOption(option.value);
			var isStatusChanged = (lastOption.checked != option.checked);
			var isSizeTipChanged = (lastOption.sizeTip != option.sizeTip);

			_.extend(lastOption, option);

			if(isStatusChanged){
				this.trigger("optionCountChanged");
				this.updateSizeMapping();
			}

			if(isSizeTipChanged){
				//更新尺码备注
				this.updateSizeTip(lastOption.id, lastOption.value, lastOption.sizeTip);
			}
		}
	},

	setOptionV3:function(option){
		var lastOption = this.findComplex(option.complexid, this.id());
		var isStatusChanged = (lastOption.checked != option.checked);
		var isInfoChanged = (lastOption.value != option.value);

		_.extend(lastOption, option);

		if(isInfoChanged){
			this.trigger("optionInfoChanged");
		}
		
		if(isStatusChanged){
			if(lastOption.isCustom && !lastOption.checked){
				this.removeOption(lastOption);
			}

			this.trigger("optionCountChanged");
		}
	},

	tip:function(){
		if(this.get("isTipSet")){
			return this.get("tip");
		}

		var tipRule;
		var version = this.version();
		if(version == Sku.Version.Size.V2){
			var group = this.currentGroup();
			if(group){
				if(group.size){
					tipRule = util.sku.getTipRule(group.size);
				}
				if(!tipRule && group.input){
					tipRule = util.sku.getTipRule(group.input);
				}
			}
		}else{
			var field = this.get("size");
			tipRule = util.sku.getTipRule(field);
		}

		this.set({"tip":tipRule, "isTipSet":true});
		return tipRule;
	},

	sizeMeasureImage:function(){
		return this.get("size_measure_image");
	},

	stdSizeExtends:function(){
		return this.get("std_size_extends");
	},

	updateGroup:function(value){
		var std_size_group = this.get("std_size_group");
		var groups = this.get("groups");
		if(std_size_group.value() != value){
			this.set({"isTipSet":false});
			std_size_group.setValue(value);
			var group = groups[std_size_group.value()];
			if(group){
				util.size.initGroupOptions(group, this.stdSizeExtends());
				this.set("options", group.options);
			}else{
				this.set("options",[]);
			}

			this.trigger("groupChanged");
		}
	},

	group:function(){
		var std_size_group = this.get("std_size_group");
		return std_size_group.value();
	},

	currentGroup:function(){
		var groupValue = this.group();
		if(groupValue){
			var groups = this.get("groups");
			if(groups){
				return groups[groupValue];
			}
		}
	},

	isSupportInput:function(){
		var std_size_group = this.get("std_size_group");
		var groups = this.get("groups");
		var group = groups[std_size_group.value()];
		return (!!group) && (!!group.input);
	},

	isValid:function(){
		return (this.get("valid") === true);
	},

	version:function(){
		return this.get("version");
	},

	extendSize:function(){
		var extend = {};

		var std_size_group = this.get("std_size_group");
		extend["groupId"] = std_size_group.value();

		var group = this.currentGroup();
		var dependVid = (group.other? group.other.value: "");

		var options = [];
		var selectedOptions = this.selectedOptions();
		_.each(selectedOptions, function(option){
			var op = {};
			op["id"] = option.id;
			op["value"] = option.value;
			op["text"] = (option.isCustom ? option.value : option.text);
			op["dependVid"] = dependVid;//其他-对应的vid
			if(option.isCustom){//是否是自定义
				op["isCustom"] = true;
				op["other"] = group.other;
			}
			options.push(op);
		});
		extend["sizeOptions"] = options;

		return extend;
	},

	updateSizeTip:function(id, value, sizeTip, other){
		var sizeExtend = this.stdSizeExtends();
		util.size.updateSizeTip(sizeExtend, id, value, sizeTip, other);
	},

	removeSizeTip:function(id, value){
		var sizeExtend = this.stdSizeExtends();
		util.size.removeSizeTip(sizeExtend, id, value);
	},

	updateSizeMapping:function(){
		var sizeExtend = this.stdSizeExtends();
		sizeExtend.removeInvalidSizeMapping(this.selectedOptions());
	},

	isSizeTipEnabled:function(){
		var sizeTipFlag = this.get("size_tip");
		if(!sizeTipFlag){
			var sizeExtend = this.stdSizeExtends();
			var size_tip = util.sku.findChild("size_tip", sizeExtend);
			if(size_tip){
				sizeTipFlag = "1";
			}else{
				sizeTipFlag = "2";
			}
			this.set({"size_tip":sizeTipFlag});
		}
		return sizeTipFlag == "1";
	},

	updateSizeTip2CustomOptions: function(){
		var options = this.get("options");
		var sizeExtends = this.stdSizeExtends();

		_.each(options, function(option){
			if(option.isCustom){
				util.size.setSizeTip(option, sizeExtends);	
				if(!option.complexid){
					option.complexid = shell.createUUID();
				}
			}
		});
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

	tipMaxLengthRule:function(){
		var stdSizeExtends = this.stdSizeExtends();
		if(!stdSizeExtends){
			return;
		}

		var sizeTip = util.sku.findChild("size_tip", stdSizeExtends);
		if(!sizeTip){
			return;
		}

		var field = new ItemField(sizeTip);
		return field.getRule(shell.constants.rule.MAX_LENGTH, true);
	},
	//
});