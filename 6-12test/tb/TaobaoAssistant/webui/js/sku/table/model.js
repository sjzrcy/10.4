// JavaScript Document
//
util.createNamespace("Sku.Model");
//
Sku.Model.Table = Backbone.Model.extend({
	setDefaults:function(){
		/*
		out:{
				sku:[],{inputs:[],有顺序的输入属性,这个东西从sku里面取好了}
				metas:[],有顺序的sku元属性, 
			}

		关注信号{1.选中数量变化(刷新全表) 2.选项内容变化（刷新特定单元格，目前只关注别名）}
		meta接口：{1.当前选中项}

		选项值计算（1.别名高于text==》别名（text），2.如果是自定义，使用value）
		输入选项规范：
		{
			id:"",
			text:"",
			value:"",
			alias:"",
			isCustom:true/false,
		}

		sku数据结构：{
			key:{ //key还是老算法，value字符串相加
				complexid:"",
				data:{},
			},
		}

		初始化：metas{}
		每一个meta代表一个sku字段，其值为option数组


		model标准方法:{
			id(),
			name()
			inputId(),
			setSelectedOptions(options, customOptions)
			selectedOptions();
			isWork() //是否生效
		}
		*/

		this.set({
			model:{},//sku的数据聚合
			skuMetas:[],//真正有效的sku元数据，会渲染到页面
			skuItems:[],//当前失效的sku列表
			noEffectMetaNames:[],//未生效的sku元数据名字列表
		});

	},

	initialize:function(){
		//
		this.setDefaults();

		//1.初始化sku元数据
		var sku = this.get("sku");

		var sortMetaIds = this.sortMetaIds(true);
		var skuInitedMetas = new SkuInitedMetas(sortMetaIds);

		var complexValues = sku.complexValues();
		var complexs = [];
		_.each(complexValues, function(complex){
			complexs.push(complex);

			_.each(sortMetaIds, function(id){
				skuInitedMetas.add(id, complex[id]);
			});
		});

		var metas = this.get("metas");
		for(var i = 0; i < metas.length; ++i){
			var meta = metas[i];
			var options = skuInitedMetas.get(meta.id());
			var customOptions = skuInitedMetas.get(meta.inputId());
			meta.setSelectedOptions(options, customOptions);
		}

		//2.初始化sku model
		var model = this.get("model");
		var sortIds = this.sortIds();
		var sortMetaIdsWithNoInput = this.sortMetaIds();
		var inputIds = this.inputIds();

		var hasInvalidSku = false;
		_.each(complexs, function(complexValue){
			var complex = {};
			var complexid = complexValue["complexid"];
			if(!complexid){
				return;
			}

			_.each(sortIds, function(id){
				if(complexValue[id]){
					complex[id] = complexValue[id];	
				}
			});

			var modelKey = function(sortMetaIds, complex, metas){
				var key = "k";
				var isOk = true;

				_.each(sortMetaIds, function(id){
					//isMust
					var isMust = function(id, metas){
						var meta = _.find(metas, function(meta){
							return (meta.id() == id || meta.inputId() == id);
						});
						if(meta){
							return meta.isMust();
						}
					}
					
					//输入类型的优先级大于枚举类型，如果存在，则以输入类型为准
					var inputId = util.sku.relyInputId(id, metas);
					if(inputId && complex[inputId]){
						key += complex[inputId];
					}else if(complex[id]){
						key += complex[id];
					}else if(isMust(id, metas)){
						isOk = false;
					}
				});

				return isOk ? key : "";
			}

			var key = modelKey(sortMetaIdsWithNoInput, complex, metas);
			if(key.length > 0 && !model[key]){
				var valueItem = {};
				valueItem["complexid"] = complexid;
				valueItem["data"] = complex;
				valueItem["outdate"] = false;
				model[key] = valueItem;
			}else{
				//脏数据
				shell.removeComplexValue(sku.schemaType(), sku.rawId(), complexid);
				hasInvalidSku = true;
			}
		});

		//绑定组件信号
		this.initSkuEvents();

		//为第一次render准备数据
		this.patchSkuMetas();
		this.patchSkuItems();

		//若sku存在非法数据，给出提示
		if(hasInvalidSku){
			util.sku.showTipDialog("警告", "亲，你当前编辑的销售属性可能存在问题，请仔细检查修改", function(){});
		}
	},

	initSkuEvents: function(){
		var me = this;
		_.each(this.get("metas"), function(meta){
			meta.on("optionCountChanged", me.onMetaOptionCountChanged, me);
			meta.on("optionInfoChanged", me.onMetaOptionInfoChanged, me);
			meta.on("groupChanged", me.onMetaGroupChanged, me);
		});
	},

	//重绘表格
	onMetaOptionCountChanged: function(){
		this.patchSkuMetas();
		this.patchSkuItems();

		//将失效的sku设置过期状态，并从商品数据上删除
		var me = this;
		util.sku.removeInvalidSkuItem(this.skuItems(), this.model(), function(complexid){
			var sku = me.get("sku");
			shell.removeComplexValue(sku.schemaType(), sku.rawId(), complexid);
		});

		this.trigger("skuMetaOptionCountChanged");
	},

	//局部更新表格
	onMetaOptionInfoChanged: function(){
		this.patchSkuMetas();
		this.patchSkuItems();

		//将失效的sku设置过期状态，并从商品数据上删除
		var me = this;
		util.sku.removeInvalidSkuItem(this.skuItems(), this.model(), function(complexid){
			var sku = me.get("sku");
			shell.removeComplexValue(sku.schemaType(), sku.rawId(), complexid);
		});

		this.trigger("skuMetaOptionInfoChanged");
	},

	//分组切换
	onMetaGroupChanged:function(){
		this.patchSkuMetas();
		this.patchSkuItems();

		//将失效的sku设置过期状态，并从商品数据上删除
		var me = this;
		util.sku.removeInvalidSkuItem(this.skuItems(), this.model(), function(complexid){
			var sku = me.get("sku");
			shell.removeComplexValue(sku.schemaType(), sku.rawId(), complexid);
		});
		
		this.trigger("skuMetaGroupChanged");
	},

	inputs:function(){
		return this.get("inputs");
	},

	inputIds:function(){
		var ids = [];
		var inputs = this.inputs();
		_.each(inputs, function(input){
			ids.push(input.rawId());
		});
		return ids;
	},

	emptyInputs:function(){
		var data = {};
		var inputs = this.inputs();
		_.each(inputs, function(input){
			data[input.rawId()] = "";
		});
		return data;
	},

	sortMetaIds:function(isIncludeInput){
		var ids = [];
		var metas = this.get("metas");
		_.each(metas, function(meta){
			var id = meta.id();
			if(id){ids.push(id);}

			if(!id || isIncludeInput === true){
				var inputId = meta.inputId();
				if(inputId){ids.push(inputId);}
			}
		});

		return ids;
	},

	sortIds:function(){
		var ids = [];
		var metas = this.get("metas");
		_.each(metas, function(meta){
			var id = meta.id();
			if(id){ids.push(id);}
			var inputId = meta.inputId();
			if(inputId){ids.push(inputId);}
		});

		var inputs = this.get("inputs");
		_.each(inputs, function(input){
			ids.push(input.rawId());
		});

		return ids;
	},

	patchSkuMetas:function(){
		var metas = this.get("metas");
		var skuMetas = [];
		_.each(metas, function(meta){
			var skuMeta = {};
			skuMeta["id"] = meta.id();
			skuMeta["name"] = meta.name();
			skuMeta["options"] = meta.selectedOptions();
			skuMeta["required"] = meta.isRequired();

			if(meta.isMust() || skuMeta.options.length > 0){
				skuMetas.push(skuMeta);	
			}
		});

		this.set("skuMetas", skuMetas);
		return skuMetas;
	},

	skuMetas: function(){
		return this.get("skuMetas");
	},

	patchSkuItems:function(){
		var skuMetas = this.get("skuMetas");
		var items = [];

		var patch = function(skuItem, currentIndex){
			if(currentIndex < 0 || currentIndex >= skuMetas.length){
				return;
			}

			var skuMeta = skuMetas[currentIndex];
			for(var index = 0; index < skuMeta.options.length; ++index){
				var item = [];
				for(var i = 0; i < skuItem.length; ++i){
					item[i] = skuItem[i];
				}

				item.push(skuMeta.options[index]);
				if(currentIndex == skuMetas.length - 1){
					items.push(item);	
				}else{
					arguments.callee(item, currentIndex + 1);
				}
			}
		}

		patch([], 0);

		var trace = function(){
			for(var i = 0; i < items.length; ++i){
				var item = items[i];
				var str = "";
				for(var j = 0; j < item.length; ++j){
					str += "(" + item[j].text + "," + item[j].value + ")";
				}
				debug.trace(str);
			}
		}

		trace();
		
		this.set("skuItems", items);
		return items;
	},

	skuItems:function(){
		return this.get("skuItems");
	},

	isSkuMetasReady:function(){
		var isReady = true;
		var skuMetas = this.get("skuMetas");
		if(skuMetas.length == 0){
			isReady = false;
		}

		var noEffectMetaNames = [];
		_.each(skuMetas, function(skuMeta){
			if(skuMeta.options.length == 0){
				isReady = false;
				noEffectMetaNames.push(skuMeta["name"]);
			}
		});

		this.set("noEffectMetaNames", noEffectMetaNames);
		return isReady;
	},

	uncompleteTip:function(){
		var text = "请先填写上方的:";
		var names = this.get("noEffectMetaNames");
		_.each(names, function(name, index, list){
			var length = list.length;
			if(length - index > 2){
				text += (name + ",");
			}else if(length - index == 2){
				text += (name + "和");
			}else if(length - index == 1){
				text += name;
			}
		});
		return text;
	},

	model: function(){
		return this.get("model");
	},

	updateSkuItem:function(key, inputs){
		var model = this.model();
		var skuItem = model[key];
		if(skuItem){
			var complexid = skuItem["complexid"];
			var data = skuItem["data"];
			_.extend(data, inputs);
			this.updateSkuValue(complexid, data);
		}else{
			alert("sku数据中该key不存在:" + key);
		}
	},

	updateSkuValue: function(complexid, data){
		var sku = this.get("sku");
		shell.setComplexValue(
			sku.schemaType(),
			sku.rawId(),
			complexid,
			data
		);
	},

	isEmpty:function(){//判断是否存在sku组合
		var items = this.get("skuItems");
		return (!items || items.length == 0);
	},
	//
});

