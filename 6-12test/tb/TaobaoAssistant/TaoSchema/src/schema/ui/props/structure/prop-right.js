/**
 * 
 */

define(function(require, exports, module) {
    //
    var viewService = require('src/schema/service/viewservice');

    //
    var View = Backbone.View.extend({
        tagName: 'div',
        className: 'prop-right',

        initialize: function() {
            var type = this.model.get('type');
            this.View = viewService.get('prop_' + type);
        },

        render: function() {
            if (_.isFunction(this.View)) {
                var view = new this.View({ 'model': this.model });
                view.$el.addClass('prop-right');
                view.render();
                this.setElement(view.el);
            } else {
                error('prop right [view] >> ' + this.View);
            }
        }
    });

    //
    module.exports = View;
});
