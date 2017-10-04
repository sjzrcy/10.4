/**
 */
define(function(require, exports, module){
	//
	var Maximum = function(value, isExclusiveMaximum, field){
		this.name = 'maximum';
		this.value = value;
		this.isExclusiveMaximum = isExclusiveMaximum;
		this.field = field;

		this.isInstalled = false;
		this.isOk = true;
	};

	Maximum.prototype.handle = function(isValidate){
		if(this.check()){
			this.field.removeRuleError(this.name);
		}else{
			if(isValidate){
				this.field.addRuleError(this.name, this.error());	
			}
		}
	};

	Maximum.prototype.install = function(){
		// 监听 valueChanged
		if(this.isInstalled === true){
			return;
		}

		this.field.on('valueChanged', this.handle, this);
		this.isInstalled = true;
	};

	Maximum.prototype.check = function(){
		var value = this.field.value();
		if(value === undefined){
			return false;
		}

		if(this.isExclusiveMaximum){
			return value < this.value;
		}else{
			return value <= this.value;
		}
	};

	Maximum.prototype.error = function(){
		var value = this.field.value();
		if(value === undefined){
			return '输入值需' + (this.isExclusiveMaximum? '小于': '小于等于') + '：' + this.value + '，当前值为空';
		}else{
			return '输入值需' + (this.isExclusiveMaximum? '小于': '小于等于') + '：' + this.value + '，当前值为:' + value;
		}
	};

	//
	module.exports = Maximum;
});