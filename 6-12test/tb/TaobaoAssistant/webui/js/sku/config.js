// JavaScript Document

util.createNamespace("util");
//
util.config = new (function(){
	//
	var colorIds_ = ["prop_1627207", "in_prop_1627207"];
	this.isColor = function(id){
		return (colorIds_.indexOf(id) != -1);
	}

	//
	var sizeIds_ = [
		"prop_20509", "in_prop_20509", 
		"prop_20549", "in_prop_20549", 
		"prop_20518", "in_prop_20518", 
		"prop_122508275", "in_prop_122508275", 

		/*
		"prop_21921", "in_prop_21921", 
		"prop_1627778", "in_prop_1627778",
		*/
	];
	this.isSize = function(id){
		return (sizeIds_.indexOf(id) != -1);
	}

	//调整之后，可填充属性不仅仅包括以下字段，而是处理完其他逻辑之后，剩下的所有input字段
	var inputIds_ = ["sku_price", "sku_quantity", "sku_barcode", "sku_outerId", "sku_MarketTime", "sku_ProductCode"];
	this.isInput = function(id){
		return (inputIds_.indexOf(id) != -1);
	}

	//
	var sizeMappingIds = ["size_mapping", "darwin_size_mapping"];
	var sizeExtendsPrefix = "std_size_extends_";
	this.isSizeExtends = function(id){
		return (id.indexOf(sizeExtendsPrefix) == 0 || sizeMappingIds.indexOf(id) != -1);	
	}

	//
})();
