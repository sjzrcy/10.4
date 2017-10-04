/**
 */
define(function(require, exports, module){
	//
	var util = require('src/util/util');

	//
	var MaxLength = function(value, field){
		this.name = 'maxLength';
		this.value = value;
		this.field = field;

		this.isInstalled = false;
	};

	MaxLength.prototype.handle = function(isValidate){
		if(this.check()){
			this.field.removeRuleError(this.name);
		}else{
			if(isValidate === true){
				this.field.addRuleError(this.name, this.error());	
			}
		}
	};

	MaxLength.prototype.install = function(){
		// 监听 textchange
		if(this.isInstalled === true){
			return;
		}

		// special 其他地方需要使用，将maxlength暴露出去
		this.field.set('maxLength', this.value);
		this.field.on('valueChanged', this.handle, this);
		this.isInstalled = true;
	};

	MaxLength.prototype.check = function(){
		var value = this.field.value();
		return (util.bytes(value) <= this.value);
	};

	MaxLength.prototype.error = function(){
		var value = this.field.value();
		return ('字数不能超过' + this.value + '，当前已输入:' + util.bytes(value));
	};

	//
	module.exports = MaxLength;
});