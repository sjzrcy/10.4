/**
 */
define(function(require, exports, module){
	//
	var MultipleOf = function(value, field){
		this.name = 'multipleOf';
		this.value = value;
		this.field = field;

		this.isInstalled = false;
		this.isOk = true;
	};

	MultipleOf.prototype.handle = function(isValidate){
		if(this.check()){
			this.field.removeRuleError(this.name);
		}else{
			if(isValidate === true){
				this.field.addRuleError(this.name, this.error());	
			}
		}
	};

	MultipleOf.prototype.install = function(){
		// 监听 valueChanged
		if(this.isInstalled === true){
			return;
		}

		this.field.on('valueChanged', this.handle, this);
		this.isInstalled = true;
	};

	MultipleOf.prototype.check = function(){
		var value = this.field.value();
		return (value % this.value === 0);
	};

	MultipleOf.prototype.error = function(){
		return this.field.value() + '无法被' + this.value + '整除';
	};

	//
	module.exports = MultipleOf;
});