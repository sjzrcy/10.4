/**
 */
define(function(require, exports, module){
	//
	var util = require('src/util/util');

	//
	var DecimalDigits = function(value, field){
		this.name = 'decimalDigits';
		this.value = value;
		this.field = field;

		this.isInstalled = false;
		this.isOk = true;
	};

	DecimalDigits.prototype.handle = function(isValidate){
		if(this.check()){
			this.field.removeRuleError(this.name);
		}else{
			if(isValidate === true){
				this.field.addRuleError(this.name, this.error());	
			}
		}
	};

	DecimalDigits.prototype.install = function(){
		// 监听 valueChanged
		if(this.isInstalled === true){
			return;
		}

		this.field.on('valueChanged', this.handle, this);
		this.isInstalled = true;
	};

	DecimalDigits.prototype.check = function(){
		var value = this.field.value();
		var digits = util.digits(value);
		return (digits <= this.value);
	};

	DecimalDigits.prototype.error = function(){
		return '最多可输入' + this.value + '位小数，当前为' + util.digits(this.field.value()) + '位';
	};

	//
	module.exports = DecimalDigits;
});