
//前后端适配层
var shell = new (function(){
	//
	// 将函数指向全局唯一的标识符（闭包）
	var callback = new (function(){
		//避免长时间不退出助理，造成内存溢出，转换的回调生命周期只有一小时
		var INVALID_TIME = 60 * 60 * 1000;
		var PREFIX = "C62018D1DC074199ACCAE8452612DF72";
		var index_ = 0;
		this.translate = function(cb){
			if(typeof(cb) != "function"){
				return "";
			}

			var name = "FUN" + (++index_);
			name = PREFIX + name;

			window[name] = cb;
			this[name] = "";

			setTimeout(function(){
				delete callback[name];
				delete window[name];
			}, INVALID_TIME);

			return name;
		}
	})();

	this.createUUID = function(){
		if(typeof(workbench) != "undefined"){
			var uuid = workbench.createSequenceId();
			debug.trace(uuid);
			return uuid;
		}else{
			//网页上测试用
			debug.error("createUUID::workbench is not register!");
			return _.random(0, 99999999) + "r";
		}
	}
	/*
		json:
		{
			method:"", 后端不区分大小写
			params:{}, 
			callback:"", 传入的函数会匿名转换，成为一个全局唯一的函数，有一个有效期
		}
	*/
	var METHOD = "method";
	var PARAMS = "params";
	var CALLBACK = "callback";

	/*
	给后端调用的初始化函数
	1.初始化常量constants
	2.设置初始化完成状态
	*/
	var isInited_ = false;
	var cbs_ = [];

	this.addInitCb = function(cb){
		if(typeof(cb) == "function"){
			cbs_.push(cb);
		}
	}

	var invokeInitCbs = function(){
		for(var i = 0; i < cbs_.length; ++i){
			var cb = cbs_[i];
			if(typeof(cb) =="function"){
				cb();
			}
		}

		cbs_ = [];
	}

	this.init = function(json){
		//构建所有的常量
		debug.log(json);
		this.constants = JSON.parse(json);
		isInited_ = true;

		//执行处于等待状态的回调们
		invokeInitCbs();

		//通知后端页面已经准备好，可以发送指令了
		debug.log("PageReady:");
		debug.log(new Date());
		this.notifyPageReady();
	}

	//
	this.isInited = function(){
		return isInited_;
	}

	//渲染流程,数据全部缓存到前端
	/*
		1.裸数据json=>data
		2.封装之后的数据data=>ItemField
	*/

	this.brand = [];
	this.setBrandToken = function(json){
		this.brand = [];
		debug.log(json);

		var tokens = JSON.parse(json);
		this.brand = tokens["tokens"];
	}

	this.products = [];
	this.setProductList = function(json){
		this.products = [];
		debug.log(json);

		var tokens = JSON.parse(json);
		this.products = tokens["products"];
	}

	this.item = [];
	this.setItemToken = function(json){
		this.item = [];
		debug.log(json);

		var tokens = JSON.parse(json);
		this.item = tokens["tokens"];
	}

	this.clear = function(){
		this.item = [];
		this.products = [];
		this.brand = [];
	}
	
	//cpp 入口
	var invoke = function(json){
		if(typeof(workbench) != "undefined"){
			if(json && json[METHOD]){
				var string = JSON.stringify(json);
				workbench.callWorkBenchFunction(string);
			}
		}else{
			debug.error("invoke::workbench is not register!");
		}
	}

	/***********************需要回调*************************/
	this.initJsShell = function(cb){
		var json = {}
		json[METHOD] = "initJsShell";
		json[CALLBACK] = callback.translate(cb);

		invoke(json);
	}

	this.category = function(cb){
		var json = {}
		json[METHOD] = "category";
		json[CALLBACK] = callback.translate(cb);

		invoke(json);
	}

	//
	this.chooseCategory = function(lastCid, cb){
		var json = {};
		json[METHOD] = "chooseCategory";
		json[PARAMS] = {"lastCid":lastCid};
		json[CALLBACK] = callback.translate(cb);

		invoke(json);
	}

	this.chooseLocation = function(cb){
		var json = {};
		json[METHOD] = "chooseLocation";
		json[CALLBACK] = callback.translate(cb);

		invoke(json);
	}

	this.choosePictures = function(cb){
		var json = {};
		json[METHOD] = "choosePictures";
		json[CALLBACK] = callback.translate(cb);

		invoke(json);
	}

	this.chooseVideo = function(cb){
		var json = {};
		json[METHOD] = "chooseVideo";
		json[CALLBACK] = callback.translate(cb);

		invoke(json);
	}

	this.chooseSellerCategory = function(oldCids, cb){
		var lastCids = oldCids;
		if(typeof(oldCids) == "object"){
			lastCids = oldCids.join(",");
		}

		var json = {};
		json[METHOD] = "chooseSellerCategory";
		json[PARAMS] = {"oldCids":lastCids};
		json[CALLBACK] = callback.translate(cb);

		invoke(json);
	}

	this.cids2Names = function(cids, cb){
		/*如果是数组，则转为字符串*/
		if(typeof(cids) == "object"){
			cids = cids.join(",");
		}

		/*如果cids为空 或者 length为空，不执行*/
		if(!cids || !cids.length){
			return;
		}

		var json = {};
		json[METHOD] = "cids2Names";
		json[PARAMS] = {"cids":cids};
		json[CALLBACK] = callback.translate(cb);

		invoke(json);
	}

	this.schemaOfAddProduct = function(cb){
		var json = {};
		json[METHOD] = "schemaOfAddProduct";
		json[CALLBACK] = callback.translate(cb);

		invoke(json);
	}

	this.schemaOfUpdateProduct = function(pid, cb){
		var json = {};
		json[METHOD] = "schemaOfUpdateProduct";
		json[PARAMS] = {"productId":pid};
		json[CALLBACK] = callback.translate(cb);

		invoke(json);
	}

	this.addProduct = function(cb){
		var json = {};
		json[METHOD] = "addProduct";
		json[CALLBACK] = callback.translate(cb);

		invoke(json);
	}

	this.updateProduct = function(productId, cb){
		var json = {};
		json[METHOD] = "updateProduct";
		json[PARAMS] = {"productId":productId};
		json[CALLBACK] = callback.translate(cb);

		invoke(json);
	}

	this.productId = function(cb){
		var json = {};
		json[METHOD] = "productId";
		json[CALLBACK] = callback.translate(cb);

		invoke(json);
	}

	this.getUpdateProductSchema = function(cb){
		var json = {};
		json[METHOD] = "getUpdateProductSchema";
		json[CALLBACK] = callback.translate(cb);

		invoke(json);
	}

	this.getAddProductSchema = function(cb){
		var json = {};
		json[METHOD] = "getAddProductSchema";
		json[CALLBACK] = callback.translate(cb);

		invoke(json);
	}

	this.setComplexValue = function(schemaType, id, complexId, data, cb){
		var params = {};
		params["schemaType"] = schemaType;
		params["id"] = id;
		params["complexId"] = complexId;

		debug.trace("setComplexValue:" + id + ", " + complexId);
		debug.trace(data);

		//后端接口要求
		if(typeof(data) == "object"){data = JSON.stringify(data);}
		params["data"] = data;

		var json = {};
		json[METHOD] = "setComplexValue";
		json[PARAMS] = params;
		if(cb){json[CALLBACK] = callback.translate(cb);}

		invoke(json);
	}

	this.refreshItemToken = function(schemaType, id, cb){
		var json = {};
		json[METHOD] = "refreshItemToken";
		json[PARAMS] = {"schemaType":schemaType, "id":id};
		json[CALLBACK] = callback.translate(cb);

		invoke(json);
	}

	//
	this.updateProperty = function(id, value, schemaType){
		var json = {};
		json[METHOD] = "updateProperty";
		json[PARAMS] = {"schemaType":schemaType, "id":id, "value":value};

		invoke(json);
	}

	this.updateProductProperty = function(productId, schemaType, fieldId, value){
		var json = {};
		json[METHOD] = "updateProductProperty";
		json[PARAMS] = {"productId":productId, "schemaType":schemaType, "id":fieldId, "value":value};

		invoke(json);
	}

	this.updateCategory = function(cid){
		var json = {};
		json[METHOD] = "updateCategory";
		json[PARAMS] = {"cid":cid};

		invoke(json);
	}

	this.updateBrand = function(cb){
		var json = {};
		json[METHOD] = "updateBrand";
		json[CALLBACK] = callback.translate(cb);
		
		invoke(json);
	}

	this.renderItemSchema = function(isAdd, productId){
		var json = {};
		json[METHOD] = "renderItemSchema";
		json[PARAMS] = {"isAdd":isAdd, "productId":productId};

		invoke(json);
	}

	this.change2Product = function(productId){
		var json = {};
		json[METHOD] = "change2Product";
		json[PARAMS] = {"productId":productId};

		invoke(json);
	}

	this.removeComplexValue = function(schemaType, id, complexId){
		var json = {};
		json[METHOD] = "removeComplexValue";
		json[PARAMS] = {"schemaType":schemaType, "id":id, "complexId":complexId};
		debug.trace("removeComplexValue: " + id + ", " + complexId);

		invoke(json);
	}

	this.openUrl = function(url, isAutoLogin){
		var json = {};
		json[METHOD] = "openUrl";
		json[PARAMS] = {"url":url, "isAutoLogin":isAutoLogin};

		invoke(json);
	}

    this.saveData = function(){
        var json = {};
        json[METHOD] = "saveData";

        invoke(json);
    }

    this.notifyPageReady = function(){
    	var json = {};
    	json[METHOD] = "notifyPageReady";

    	invoke(json);
    }

    this.choseSizeTable = function(data, cb){
    	var json = {};
    	json[PARAMS] = data;
    	json[METHOD] = "choseSizeTable";
    	json[CALLBACK] = callback.translate(cb);

    	invoke(json);
    }

    this.editItemOnline = function(){
    	var json = {};
    	json[METHOD] = "editItemOnline";

    	invoke(json);
    }
	//
})();


//将对象上的函数，转化为window下的全局函数
function FunctionMap () {
	var map_ = {};

	this.add = function(key, fn){
		if(key && map_[key] === undefined){
			map_[key] = fn;
			window[key] = fn;
		}else{
			debug.error("重复注册函数:" + key);
		}
	}

	this.remove = function(key){
		delete map_[key];
		delete window[key];
	}

	this.clear = function(){
		for(var key in map_){
			delete window[key];
		}

		map_ = {};
	}

	this.trace = function(){
		debug.warn("FunctionMap:::start:::");
		for(var key in map_){
			debug.warn(key + ":" + map_[key]);
		}
		debug.warn("FunctionMap:::end:::")
	}
}

/////////////////////////////////////////////////////////////////////////
/*需要使用的全局变量*/
//初始化
$(function(){
	//FIX AEF 
	//注册所有给后端使用的名字,将对象层级用下划线"_"分割
	var functionDispatcher = new FunctionMap();
	
	functionDispatcher.add("process_setCategory", process.setCategory);
	functionDispatcher.add("process_renderProductSchema", process.renderProductSchema);
	functionDispatcher.add("process_reminderCreateProduct", process.reminderCreateProduct);
	functionDispatcher.add("process_setProductList", process.setProductList);
	functionDispatcher.add("process_renderProductList", process.renderProductList);
	functionDispatcher.add("process_renderItemAddSchema", process.renderItemAddSchema);
	functionDispatcher.add("process_renderItemUpdateSchema", process.renderItemUpdateSchema);
	functionDispatcher.add("process_clearAllSchema", process.clearAllSchema);

	functionDispatcher.add("process_initAll", process.initAll);
	functionDispatcher.add("process_saveAll", process.saveAll);
	functionDispatcher.add("process_notSupportCategory", process.notSupportCategory);

	functionDispatcher.add("process_notifyNetError", process.notifyNetError);
	functionDispatcher.add("process_showLoadingUi", process.showLoadingUi);
	functionDispatcher.add("process_hideLoadingUi", process.hideLoadingUi);
});

/////////////////////////////////////////////////////////////////////////
//还原shell下的常量
$(function(){
	debug.log(new Date());
	shell.initJsShell(function(json){
		shell.init(json);
		debug.log(new Date());
	});
});