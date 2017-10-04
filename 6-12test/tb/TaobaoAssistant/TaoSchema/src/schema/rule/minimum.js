/**
 */
define(function(require, exports, module){
	//
	var Minimum = function(value, isExclusiveMinimum, field){
		this.name = 'minimum';
		this.value = value;
		this.isExclusiveMinimum = isExclusiveMinimum;
		this.field = field;

		this.isInstalled = false;
		this.isOk = true;
	};

	Minimum.prototype.handle = function(isValidate){
		if(this.check()){
			this.field.removeRuleError(this.name);
		}else{
			if(isValidate === true){
				this.field.addRuleError(this.name, this.error());
			}
		}
	};

	Minimum.prototype.install = function(){
		// 监听 valueChanged
		if(this.isInstalled === true){
			return;
		}

		this.field.on('valueChanged', this.handle, this);
		this.isInstalled = true;
	};

	Minimum.prototype.uninstall = function(){
		this.field.off('valueChanged', this.handle, this);
		this.isInstalled = false;
	},

	Minimum.prototype.check = function(){
		var value = this.field.value();
		if(value === undefined){
			return false;
		}

		if(this.isExclusiveMinimum){
			return value > this.value;
		}else{
			return value >= this.value;
		}
	};

	Minimum.prototype.error = function(){
		var value = this.field.value();
		if(value === undefined){
			return '输入值需' + (this.isExclusiveMaximum? '大于': '大于等于') + '：' + this.value + ',当前值为空';
		}else{
			return '输入值需' + (this.isExclusiveMaximum? '大于': '大于等于') + '：' + this.value + ',当前值为:' + value;
		}
	};

	//
	module.exports = Minimum;
});