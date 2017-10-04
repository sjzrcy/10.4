/**
 */
define(function(require, exports, module){
	//
	var util = require('src/util/util');

	//
	var MaxItems = function(value, field){
		this.name = 'maxItems';
		this.value = value;
		this.field = field;

		this.isInstalled = false;
		this.isOk = true;
	};

	MaxItems.prototype.handle = function(isValidate){
		if(this.check()){
			this.field.removeRuleError(this.name);
		}else{
			if(isValidate === true){
				this.field.addRuleError(this.name, this.error());
			}
		}
	};

	MaxItems.prototype.install = function(){
		// 监听 valueChanged
		if(this.isInstalled === true){
			return;
		}

		this.field.on('valueChanged', this.handle, this);
		this.isInstalled = true;
	};

	MaxItems.prototype.check = function(){
		var value = this.field.value();
		if(_.isArray(value) && value.length > this.value){
			return false;
		}else{
			return true;	
		}
	};

	MaxItems.prototype.error = function(){
		var value = this.field.value();
		var count = 0;
		if(_.isArray(value)){
			count = value.length;
		}
		
		return '最多可选择' + this.value + '项，当前已选择：' + count + '项';
	};

	//
	module.exports = MaxItems;
});