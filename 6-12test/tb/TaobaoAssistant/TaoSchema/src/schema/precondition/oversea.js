/*
 *
 */

define(function(require, exports, module){
	//
	var Base = require('src/schema/precondition/base');
	var translate = require('src/base/shell/translate');
	var Dialog = require('src/base/common/dialog/oversea');

	module.exports = Base.extend({
		initialize: function(){
			Base.prototype.initialize.apply(arguments, this);
			this.status = {
				oversea: '',
				tax: ''
			};

			// 更新一次状态
			as.shell.getOverseaAndTaxStatus(this.onStatusUpdated.bind(this));
		},

		isPass: function(){
			var action = this.get('action');
			if(action === 'oversea'){
				return this.isOverseaPass();
			}else if(action === 'tax'){
				return this.isTaxPass();
			}else{
				error('前置条件校验，海外直邮，走到异常的分支中>>', action);
			}
		},

		isOverseaPass: function(){
			return (this.status.oversea === 'enable');
		},

		isTaxPass: function(){
			return (this.status.tax === 'enable');
		},

		onStatusUpdated: function(jsonstr){
			var status;
			try{
				status = JSON.parse(jsonstr);
			}catch(e){
				error('getOverseaAndTaxStatus, invalid json');
				status = {
					oversea: '',
					tax: ''
				}
			}

			debug('OverseaAndTax Updated!', JSON.stringify(status));
			this.status.oversea = status.oversea;
			this.status.tax = status.tax;
		},

		updateTaxStatus: function(){
			this.status.tax = 'enable';
			this.syncStatus();
		},

		updateOverSeaStatus: function(){
			this.status.oversea = 'enable';
			this.syncStatus();
		},

		syncStatus: function(){
			as.shell.setOverseaAndTaxStatus(this.status);
		},

		getUrl: function(){
			var url = this.get('url');
			var params = _.extend({}, this.get('params'));
			params.from = 'as';
			params.close = translate(this.onClose.bind(this), true);
			params.success = translate(this.onNetSuccess.bind(this), true);
			params.open = translate(this.onOpenUrl.bind(this), true);

			var paramsString = '';
			_.each(params, function(value, key){
				if(paramsString){
					paramsString += '&';
				}
				paramsString += (key + '=' + value);
			});

			return (url + '?' + paramsString);
		},

		tryPass: function(onSuccess, onFail){
			this.onSuccess = onSuccess;
			this.onFail = onFail;

			var me = this;
			as.shell.getAutoLoginUrl(encodeURIComponent(this.getUrl()), function(jsonstr){
				var url = as.util.fetchUrl(jsonStr);
				if(!url){
					as.util.showErrorTip('海外直邮合约页面自动登录失败！');
					return;
				}

				me.dialog = new Dialog({model: {
					title: '',
					url: url,
					offset: {},
					size: me.get('size'),
					closeCb: me.onDialogClose.bind(me)
				}});

				me.dialog.render();
			});
		},

		onDialogClose: function(){
			// 如果“成功”没有被执行，则执行失败
			if(_.isFunction(this.onFail) && _.isFunction(this.onSuccess)){
				this.onFail();
				this.onFail = undefined;
			}
		},

		onClose: function(){
			if(_.isFunction(this.onFail)){
				this.onFail();
				this.onFail = undefined;
			}

			if(this.dialog){
				this.dialog.close();
			}
		},

		onNetSuccess: function(){
			// 状态同步到后端
			var action = this.get('action');
			if(action === 'oversea'){
				this.updateOverSeaStatus();
			}else if(action === 'tax'){
				this.updateTaxStatus();
			}

			// 执行回调
			if(_.isFunction(this.onSuccess)){
				this.onSuccess();
				this.onSuccess = undefined;
			}

			if(this.dialog){
				this.dialog.close();
			}
		},

		onOpenUrl: function(url){
			as.shell.openUrl(url);
		}
	});
});