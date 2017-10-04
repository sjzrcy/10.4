/**
 *
 */
/* jshint -W116 */
/* jshint -W033 */
/* jshint -W030 */
/* jshint -W025 */
/* jshint -W028 */
/* jshint -W067 */

define(function(require, exports, module){
	/*
	 * field
	 * condition
	 * action
	 */
	var Expression = require('src/schema/control/expression');
	var Action = Backbone.Model.extend({
		initialize: function(){
			var expression = new Expression(this.get('condition'));
			this.set("expression", expression);
		},

		isValid: function(){
			return (typeof(this.get('condition')) === 'string' && 
					typeof(this.get('action')) === 'object' && 
					typeof(this.get('field')) === 'object');
		},

		check: function(){
			if(this.get('expression').caculate()){
				this.doAction();
			}
		},

		doAction: function(){
			var field = this.get('field');
			_.each(this.get('action'), function(value, name){
				field.setActionStatus(name, value);
			});
		}
	});

	//
	module.exports = Action;
});