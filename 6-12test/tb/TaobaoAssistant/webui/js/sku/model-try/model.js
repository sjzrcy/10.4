// JavaScript Document

util.createNamespace("Sku.Model");
//
Sku.Model.ModelTry = Backbone.Model.extend({
	setDefaults:function(){
		/*
		外部传入：
			size_model_try:null, 尺码模特试穿表
		*/
		/*
			model[{complexid:"", data:{}}, {}, ...]
			inputs[],所有的子字段
		*/
		this.set({
			model:[],
			inputs:[],
		});
	},

	initialize:function(){
		this.setDefaults();
		//
		var field = this.get("size_model_try");
		if(field.type() != shell.constants.field.MULTI_COMPLEX){
			return;
		}

		var children = field.children();
		if(children.length == 0){
			return;
		}

		// inputs
		var me = this;
		var inputs = this.get("inputs");
		_.each(children, function(input){
			if(input.type == shell.constants.field.INPUT){
				inputs.push(new ItemField(input));
			}else{
				debug.error("尺码模特试穿表包含非输入类型子字段");
			}
		});

		// model 
		var model = this.get("model");
		var complexValues = field.complexValues();
		var ids = this.ids();

		_.each(complexValues, function(complexValue){
			var complexid = complexValue["complexid"];
			if(complexid){
				var item = {};
				item["complexid"] = complexid;
				
				var complex = {};
				_.each(ids, function(id){
					complex[id] = complexValue[id];
				});

				item["data"] = complex;
				model.push(item);
			}else{
				debug.error("尺码模特试穿表:complexid is empty!该条记录被忽略");
			}
		});

		this.set("valid", true);
	},

	isValid:function(){
		return (this.get("valid") === true);
	},

	inputs:function(){
		var inputs = this.get("inputs");
		return inputs;
	},

	ids:function(){
		var ids = [];
		var inputs = this.get("inputs");
		_.each(inputs, function(input){
			ids.push(input.rawId());
		});
		return ids;
	},

	model: function(){
		return this.get("model");
	},

	isEmpty: function(){
		var model = this.get("model");
		return (model.length == 0);
	},

	findItem:function(complexid){
		var model = this.get("model");
		var item = _.find(model, function(item){
			return (item["complexid"] == complexid);
		});

		if(!item){
			debug.error("can not find item:" + complexid);
		}

		return item;
	},

	setItem:function(complexid, complex){
		var item = this.findItem(complexid);
		var field = this.get("size_model_try");
		shell.setComplexValue(field.schemaType(), field.rawId(), complexid, complex);
		_.extend(item.data, complex);
	},

	addItem:function(){
		var complex = {};
		var ids = this.ids();
		_.each(ids, function(id){
			complex[id] = "";
		});

		var item = {};
		item["complexid"] = shell.createUUID();
		item["data"] = complex;

		var model = this.model();
		model.push(item);

		var field = this.get("size_model_try");
		shell.setComplexValue(field.schemaType(), field.rawId(), item["complexid"], complex);
		
		this.trigger("modelChanged");
	},

	removeItem:function(complexid){
		var field = this.get("size_model_try");
		shell.removeComplexValue(field.schemaType(), field.rawId(), complexid);

		var model = this.model();
		_.find(model, function(item, index, array){
			if(item.complexid == complexid){
				model.splice(index, 1);
				return true;
			}
		});

		this.trigger("modelChanged");
	},

	removeAll:function(){
		var field = this.get("size_model_try");
		var id = field.rawId();
		var schemaType = field.schemaType();

		var model = this.get("model");
		_.each(model, function(item){
			shell.removeComplexValue(schemaType, id, item["complexid"]);
		});

		this.set({"model":[]});
		this.trigger("modelChanged");
	},
});
