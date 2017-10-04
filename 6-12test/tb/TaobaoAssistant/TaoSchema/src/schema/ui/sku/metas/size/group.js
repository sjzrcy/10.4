
define(function(require, exports, module){

	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'size-group',

		events: {
			'change select': function(){
				var value = this.$('select').val();
				this.model.setValue(value);
			}
		},

		initialize: function(){

		},

		render: function(){
			this.$el.empty();

			var title = this.model.get('title');
			this.$el.append($('<span>').html(title + '：&nbsp;'));

			var options = this.model.get('options');
			var $select = $('<select>');
			this.$el.append($select);

			var value = this.model.value();
			for(var i = 0; i < options.length; ++i){
				var option = options[i];
				if(value === option.value){
					$select.append($('<option selected="selected">').attr('value', option.value).text(option.text));
				}else{
					$select.append($('<option>').attr('value', option.value).text(option.text));
				}
			}
		}
	});

	//
	module.exports = View;
});