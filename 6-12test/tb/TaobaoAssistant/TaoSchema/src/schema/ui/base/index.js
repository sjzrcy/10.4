/**
 * 基础组件索引
 */

define(function(require, exports, module){
	// structure
	exports.TopSchemaView = require('src/schema/ui/base/schematop');
	exports.BottomSchemaView = require('src/schema/ui/base/schemabottom');

	// body
	exports.AsSelectView = require('src/schema/ui/base/asselect');
	exports.AsInputView = require('src/schema/ui/base/asinput');
	exports.AsTextareaView = require('src/schema/ui/base/astextarea');
	exports.AsMultiselectView = require('src/schema/ui/base/asmultiselect');
	exports.AsMultiselectVView = require('src/schema/ui/base/asmultiselect-vertical');
	exports.AsMultiselectSkuView = require('src/schema/ui/base/asmultiselect-sku');
	exports.DateView = require('src/schema/ui/base/date');
	exports.AsRadioView = require('src/schema/ui/base/asradio');
	exports.AsRadioVView = require('src/schema/ui/base/asradio-vertical');

	//
});