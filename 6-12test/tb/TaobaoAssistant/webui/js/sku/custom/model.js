// JavaScript Document

util.createNamespace("Sku.Model");
//
Sku.Model.Custom = Backbone.Model.extend({
	setDefaults:function(){
		/*
		外部传入：
			custom_prop_field_key:null,
			sku:null,
		*/
		this.set({
			groups:{}, //分组
			groupOptions:[], //分组选项

			options:[],
			prop_field:null,
		});
	},

	initialize:function(){
		//
		this.setDefaults();
		//
		var custom_prop_field_key = this.get("custom_prop_field_key");
		var sku = this.get("sku");

		var groups = this.get("groups");
		var modelGroupOptions = this.get("groupOptions");

		var customPropId = custom_prop_field_key.rawId();
		var groupOptions = custom_prop_field_key.options();
		for(var i = 0; i < groupOptions.length; ++i){
			var groupOption = {value: groupOptions[i].value(), text:groupOptions[i].text()};
			modelGroupOptions.push(groupOption);
			var customProp = util.sku.findRelyField(sku, customPropId, groupOption);
			if(!customProp){
				alert("没有找到选项对应的自定义字段：" + groupOption.value + "," + groupOption.text);
				continue;
			}

			util.sku.fields.add(customProp.rawId());
			var input = util.sku.findRelyInput(sku, customProp);
			if(input){
				util.sku.fields.add(input.rawId());
			}

			var group = {prop: customProp, input: input, options:[]};
			util.custom.initGroupOptions(group);
			groups[groupOption.value] = group;
		}

		var group = groups[custom_prop_field_key.value()];
		if(group){this.set("options", group.options);}
		this.set("valid", true);
	},

	isValid:function(){
		return (this.get("valid") === true);
	},
	
	isRequired:function(){
		var field = this.get("custom_prop_field_key");
		return (field && field.hasRule(shell.constants.rule.REQUIRED));
	},

	name:function(){
		var group = this.currentGroup();
		if(group && group.prop){
			return group.prop.name();
		}
	},

	id:function(){
		var group = this.currentGroup();
		if(group && group.prop){
			return group.prop.rawId();
		}
	},

	inputId:function(){
		var group = this.currentGroup();
		if(group && group.input){
			return group.input.rawId();
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

		_.each(selectedCustomOptions, function(customOption){
			 var option = _.extend({}, customOption)
			option["isCustom"] = true;
			option["checked"] = true;
			options.push(option);
		});

		this.set({"ready": true});
		this.trigger("optionsInited");
	},

	selectedOptions:function(){
		var selectedOptions = [];
		var options = this.get("options");
		_.each(options, function(option){
			if(option.checked){
				selectedOptions.push(option);
			}
		});
		
		return selectedOptions;
	},

	isMust: function(){
		return !!this.currentGroup();
	},

	currentGroup:function(){
		var custom_prop_field_key = this.get("custom_prop_field_key");
		var groups = this.get("groups");
		var group = groups[custom_prop_field_key.value()];
		return group;
	},

	updateGroup:function(value){
		var custom_prop_field_key = this.get("custom_prop_field_key");
		custom_prop_field_key.setValue(value);

		var groups = this.get("groups");
		var group = groups[custom_prop_field_key.value()];
		
		if(group){
			util.custom.initGroupOptions(group);
			this.set("options", group.options);
		}else{
			this.set("options", []);
		}
		
		this.trigger("groupChanged");
	},

	findOption:function(value){
		var options = this.get("options");
		for(var i = options.length - 1; i >= 0; --i){
			if(options[i].value == value){
				return options[i];
			}
		}
	},

	findComplex:function(complexid){
		var options = this.get("options");
		for(var i = options.length - 1; i >= 0; --i){
			if(options[i].complexid == complexid){
				return options[i];
			}
		}

		var option = this.emptyOption();
		option.complexid = complexid;
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

	emptyOption: function(){
		return util.sku.emptyOption();
	},

	setOption:function(option){
		var group = this.currentGroup();
		var isSupportCustom = !!group.input;

		var isStatusChanged = false;
		var isInfoChanged = false;

		if(!isSupportCustom){
			var lastOption = this.findOption(option.value);
			isStatusChanged = (option.checked != lastOption.checked);
		}else{
			var lastOption = this.findComplex(option.complexid);
			isInfoChanged = (option.value != lastOption.value);
			isStatusChanged = (option.checked != lastOption.checked);
		}

		_.extend(lastOption, option);

		if(isInfoChanged){
			this.trigger("optionInfoChanged");
		}

		if(isStatusChanged){
			if(isSupportCustom && option.isCustom && !option.checked){
				this.removeComplex(option);
			}

			this.trigger("optionCountChanged");
		}
	},


});
