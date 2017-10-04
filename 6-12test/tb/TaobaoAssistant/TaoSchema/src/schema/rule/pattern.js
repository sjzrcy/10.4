/**
 */
define(function(require, exports, module){
	//
	var Pattern = function(value, field){
		this.name = 'pattern';
		this.value = value;
		this.pattern = new RegExp(value);
		this.field = field;

		this.isInstalled = false;
		this.isOk = true;
	};

	Pattern.prototype.handle = function(isValidate){
		if(this.check()){
			this.field.removeRuleError(this.name);
		}else{
			if(isValidate){
				this.field.addRuleError(this.name, this.error());	
			}
		}
	};

	Pattern.prototype.install = function(){
		// 监听 valueChanged
		if(this.isInstalled === true){
			return;
		}

		this.field.on('valueChanged', this.handle, this);
		this.isInstalled = true;
	};

	Pattern.prototype.check = function(){
		var value = this.field.value();
		return this.pattern.test(value);
	};

	Pattern.prototype.error = function(){
		return '输入格式不正确';
	};

	//
	module.exports = Pattern;
});