/**
 * rule: [{id, condition, text}] 
 * rule: {id, condition, text
 */
define(function(require, exports, module){
	//
	var Expression = require('src/schema/control/expression');

	//
	var AbstractRule = function(rule, field){
		this.rule = rule;
		this.field = field;
		this.exp = new Expression(rule.condition);
		this.isInstalled = false;
	};

	AbstractRule.isValid = function(rule){
		return (rule.id && rule.condition && rule.text);
	};

	AbstractRule.prototype.handle = function(isValidate){
		if(this.check()){
			this.field.removeRuleError(this.rule.id);
		}else{
			if(isValidate === true){
				this.field.addRuleError(this.rule.id, this.rule.text);
			}
		}
	};

	AbstractRule.prototype.install = function(){
		// 监听 valueChanged
		if(this.isInstalled === true){
			return;
		}

		this.field.on('valueChanged', this.handle, this);
		this.isInstalled = true;
	};

	AbstractRule.prototype.check = function(){
		return this.exp.caculate();
	};

	//
	module.exports = AbstractRule;
});