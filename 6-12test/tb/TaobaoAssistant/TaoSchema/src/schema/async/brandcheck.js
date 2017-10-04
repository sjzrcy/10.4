/*
{
	action: "checkbrand"
}
*/

define(function(require, exports, module) {
    var Async = require('src/schema/async/base');
    var Imp = Async.extend({
        initialize: function() {
            Async.prototype.initialize.apply(this, arguments);
        },

        doResponse: function(response) {
            if (_.isFunction(this.cb) && _.isObject(response)) {
                if (response.result && _.isObject(response.data)) {
                    this.cb(response.data.warning);
                }
            }
        },

        setCb: function(cb) {
            this.cb = cb;
        }
    });

    //
    module.exports = Imp;
});
