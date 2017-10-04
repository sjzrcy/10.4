// JavaScript Document
/*
 *流程控制
 *
 *定义通用流程接口
 *不同的属性页面自行提供实现
 *
 */

window.process = new (function() {
	//渲染类目
	this.setCategory = function(json){}

	// 加载schema-选择品牌
	this.renderProductSchema = function(json) {
		shell.setBrandToken(json);
	}

	this.setProductList = function(json){
		shell.setProductList(json);
	}

	//创建/展示产品列表
	this.reminderCreateProduct = function(){}
	this.renderProductList = function(){}	

	// schema-添加/更新-商品
	this.renderItemAddSchema = function(json) {
		shell.setItemToken(json);
	}

	this.renderItemUpdateSchema = function(json){
		shell.setItemToken(json);
	}

	// 清空所有已经渲染的字段 
	this.clearAllSchema = function(){}
	this.saveAll = function(){
       shell.saveData();
    }
	
	//给其他模块注入回调
	var callback = {};
	this.callback = callback;

	// 提示暂不支持当前类目
	this.notSupportCategory = function(data){
		var params = JSON.parse(data);
		if(!params){
			return;
		}

		var isOnline = params.online;
		var isCidChange = params.isCidChange;
		var error = params.error;

		var $content = $('<div>').addClass('not-support-cid-box');
		var $tip = $("<div>").addClass('not-support-cid-tip').text(error).appendTo($content);
		var $guide = $("<div>").addClass('not-support-cid-guide').text("了解详细>>").click(function(){
			shell.openUrl("http://bangpai.taobao.com/group/thread/602059-303840206.htm", true);
		}).appendTo($content);

		var buttons = [];
		if(isOnline){
			buttons.push({
				text:"到线上编辑", 
				click:function(){
					shell.editItemOnline();
					dialog.close();
				}}
			);
		}
		buttons.push({
			text:"我知道了",
			 click:function(){
			 	dialog.close();
			 }}
		);

		var option = {
			title: "提示",
			content: $content,
			buttons: buttons,
			contentIcon:config.image.WARN,
			callback: callback.notSupportCategory,
		}

		var dialog = new SchemaDialog(option);
		dialog.show();
	}

	var loading = null;
	var loadingTimerId = 0;

	this.showLoadingUi = function() {
		if(loading == null){
			loading = new LoadingUi2("", "");
		}
		
		loading.show();
		
		if(loadingTimerId){
			clearTimeout(loadingTimerId);
			loadingTimerId = 0;
		}

		loadingTimerId = setTimeout(function(){
			loadingTimerId = 0;
			process.hideLoadingUi();
			process.notifyNetError("加载数据超时，请重试");
		}, 30 * 1000);
	}

	this.hideLoadingUi = function(isForbidAnimate) {
		if(loading != null){
			loading.hide(isForbidAnimate);
		}

		if(loadingTimerId){
			clearTimeout(loadingTimerId);
			loadingTimerId = 0;
		}
	}

	this.tryHideLoadingUi = function(){
		if(loading && loading.isVisible()){
			process.hideLoadingUi(true);
		}
	}

	var netErrorDialog = null;
	this.notifyNetError = function(error) {
		//当提示出错时，关闭加载效果
		process.hideLoadingUi(true);

		var options = {
			title:"出错啦！",
			content:error,
			buttons:[],                 
			contentIcon:config.image.ERROR
		};

		if(netErrorDialog && !netErrorDialog.hasClose()){
			netErrorDialog.close();
			netErrorDialog = null;
		}
		
		netErrorDialog = new SchemaDialog(options);
		netErrorDialog.show();
	}

	this.tryCloseNetErrorTip = function(){
		if(netErrorDialog && !netErrorDialog.hasClose()){
			netErrorDialog.close();
			netErrorDialog = null;
		}
	}

	var clearCbs_ = [];
	this.addCb2Clear = function(cb){
		if(typeof(cb) == "function"){
			clearCbs_.push(cb);	
		}
	}
	this.handleClear = function(){
		for(var i = 0; i < clearCbs_.length; ++i){
			clearCbs_[i]();
		}
		clearCbs_ = [];
	}
	//
})();