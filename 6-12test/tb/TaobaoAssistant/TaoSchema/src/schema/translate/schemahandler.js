/**
 * 统一JSON schema每一个属性的处理过程
 * 入参[属性值, 服务字段, schema原始数据]
 */
define(function(require, exports, module){
	//depend
	var util = require('src/util/util');
	var Integer = require('src/schema/rule/integer');

	// type 数据类型
	exports['type'] = function(value, field, schema){
		field.set('dataType', value);
		if(value === 'integer'){
			field.addRule(new Integer('integer', field));
		}
	};

	// default 默认值
	exports['default'] = function(value, field, schema){
		var rawValue = field.value();
		if(rawValue === undefined){
			field.set({'value': value});
		}
	};

	// multipleOf 整除
	var MultipleOf = require('src/schema/rule/multipleOf');
	exports['multipleOf'] = function(value, field, schema){
		var rule = new MultipleOf(value, field);
		field.addRule(rule);
	};

	// maximum 最大值 
	var Maximum = require('src/schema/rule/maximum');
	exports['maximum'] = function(value, field, schema){
		var isExclusiveMaximum = (schema['exclusiveMaximum'] && schema['exclusiveMaximum'] === true);
		var rule = new Maximum(value, isExclusiveMaximum, field);
		field.addRule(rule);

	};

	//minimum 最小值
	var Minimum = require('src/schema/rule/minimum');
	exports['minimum'] = function(value, field, schema){
		var isExclusiveMinimum = (schema['exclusiveMinimum'] && schema['exclusiveMinimum'] === true);
		var rule = new Minimum(value, isExclusiveMinimum, field);
		field.addRule(rule);
	};

	// maxLength 字符串最大长度
	var MaxLength = require('src/schema/rule/maxlength');
	exports['maxLength'] = function(value, field, schema){
		var rule = new MaxLength(value, field);
		field.addRule(rule);
	};

	// minLength 字符串最短长度
	var MinLength = require('src/schema/rule/minlength');
	exports['minLength'] = function(value, field, schema){
		var rule = new MinLength(value, field);
		field.addRule(rule);
	};

	// pattern 字符串正则表达式
	var Pattern = require('src/schema/rule/pattern');
	exports['pattern'] = function(value, field, schema){
		var rule = new Pattern(value, field);
		field.addRule(rule);
	};

	// maxItems 数组最大长度 
	var MaxItems = require('src/schema/rule/maxitems');
	exports['maxItems'] = function(value, field, schema){
		var rule = new MaxItems(value, field);
		field.addRule(rule);
	};

	// minItems 数组最短长度 
	var MinItems = require('src/schema/rule/minitems');
	exports['minItems'] = function(value, field, schema){
		var rule = new MinItems(value, field);
		field.addRule(rule);
	};

	// decimalDigits 最多小数点位数
	var DecimalDigits = require('src/schema/rule/decimaldigits');
	exports['decimalDigits'] = function(value, field, schema){
		var rule = new DecimalDigits(value, field);
		field.addRule(rule);
	};

	// must必填，客户端转换来的关键字，也可以直接在UIConfig里面加
	exports['must'] = function(value, field, schema){
		field.set('must', value);
	};

	// control 依赖关系
	exports['control'] = function(value, field, schema){
		if(!_.isArray(value)){
			return;
		}

		var control = field.get('control');
		if(_.isArray(control)){
			value = control.concat(value);
		}

		field.set('control', value);
	};
});