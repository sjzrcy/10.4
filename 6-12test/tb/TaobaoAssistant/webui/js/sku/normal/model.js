// JavaScript Document

util.createNamespace("Sku.Model");
//
Sku.Model.Normal = Backbone.Model.extend({
	setDefaults:function(){
		/*
		外部传入：
			prop:null, 对应的sku属性
		*/
		this.set({
			options:[],
		});
	},

	initialize:function(){
		this.setDefaults();
		//
		var field = this.get("prop");
		var id = field.rawId();

		var sourceOptions = field.options();
		var options = this.get("options");
		
		_.each(sourceOptions, function(sourceOption){
			var option = {};
			option["id"] = id;
			option["checked"] = false;
			option["value"] = sourceOption.value();
			option["text"] = sourceOption.text();

			options.push(option);
		});

		this.set("valid", true);
	},

	isValid:function(){
		return (this.get("valid") === true);
	},
	
	isRequired:function(){
		var field = this.get("prop");
		return (field && field.hasRule(shell.constants.rule.REQUIRED));
	},

	name:function(){
		var field = this.get("prop");
		return field.name();
	},

	id:function(){
		var field = this.get("prop");
		if(field){
			return field.rawId();	
		}
	},

	inputId:function(){
		return "";
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
		return true;
	},

	findOption:function(value){
		var options = this.get("options");
		for(var i = options.length - 1; i >= 0; --i){
			if(options[i].value == value){
				return options[i];
			}
		}
	},

	setOption:function(option){
		var lastOption = this.findOption(option.value);
		if(option.checked != lastOption.checked){
			lastOption.checked = option.checked;
			this.trigger("optionCountChanged");
		}	
	},

});
