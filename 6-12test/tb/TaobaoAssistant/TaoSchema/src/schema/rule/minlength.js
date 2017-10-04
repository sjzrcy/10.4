/**
 */
define(function(require, exports, module){
	//
	var util = require('src/util/util');

	//
	var MinLength = function(value, field){
		this.name = 'minLength';
		this.value = value;
		this.field = field;

		this.isInstalled = false;
	};

	MinLength.prototype.handle = function(isValidate){
		if(this.check()){
			this.field.removeRuleError(this.name);
		}else{
			if(isValidate === true){
				this.field.addRuleError(this.name, this.error());	
			}
		}
	};

	MinLength.prototype.install = function(){
		// 监听 textchange
		if(this.isInstalled === true){
			return;
		}

		// special 其他地方需要使用，将maxlength暴露出去
		this.field.set('minLength', this.value);
		this.field.on('valueChanged', this.handle, this);
		this.isInstalled = true;
	};

	MinLength.prototype.check = function(){
		var value = this.field.value();
		return (typeof(value) === 'string' && util.bytes(value) >= this.value);
	};

	MinLength.prototype.error = function($input){
		if(this.value === 1){
			return '输入文本不能为空';
		}else{
			var value = this.field.value();
			return '至少输入' + this.value + '个字符，当前已输入' + util.bytes(value);
		}
	};

	//
	module.exports = MinLength;
});