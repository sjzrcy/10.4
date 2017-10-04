/**
 */
define(function(require, exports, module){
	//
	var Integer = function(value, field){
		this.name = 'integer';
		this.value = value;
		this.field = field;

		this.isInstalled = false;
		this.isOk = true;
	};

	Integer.prototype.handle = function(isValidate){
		if(this.check()){
			this.field.removeRuleError(this.name);
		}else{
			if(isValidate === true){
				this.field.addRuleError(this.name, this.error());
			}
		}
	};

	Integer.prototype.install = function(){
		// 监听 valueChanged
		if(this.isInstalled === true){
			return;
		}

		this.field.on('valueChanged', this.handle, this);
		this.isInstalled = true;
	};

	Integer.prototype.check = function(){
		var value = this.field.value();
		if(_.isUndefined(value)){
			return true;
		}

		var number = Number(value);
		if(isNaN(number)){
			return false;
		}

		return (number % 1 === 0);
	};

	Integer.prototype.error = function(){
		return '输入值必须为整数';
	};

	//
	module.exports = Integer;
});