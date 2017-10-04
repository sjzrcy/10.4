/*
 * precondition
 * 
 {
	"value": "", // 设置某一个值
	"action": "", // 端使用什么动作来处理
	其他参数由各个action决定
 }
 *
 */

 define(function(require, exports, module){
 	module.exports = Backbone.Model.extend({
 		initialize: function(){

 		},

 		value: function(){
 			return this.get('value');
 		},

 		isPass: function(){
 			error('子类必须实现isPass');
 			return false;
 		},

 		tryPass: function(onSuccess, onFail){
 			error('子类必须实现tryPass');
 		}
 	});
 });