define(function(require, exports, module){
	//继承体系基类
	var Base = function(){

	};

	//事件实现，以及一些基类方法
	$.extend(Base.prototype, Backbone.Events);

	// 继承实现，可链式继承
	Base.extend = function(constructor, prototype){
		var me = this;
		var Derived = function(){
			var args = Array.prototype.slice.call(arguments);
			me.apply(this, args);
			constructor.apply(this, args);
		};

		$.extend(Derived.prototype, this.prototype, prototype);
		Derived.prototype.constructor = constructor;
		Derived.extend = arguments.callee;
		return Derived;
	};

	//
	module.exports = Base;
});