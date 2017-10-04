// JavaScript Document
window.sku = new (function() {
	//
	this.loadSkuSchema = function(schemaType) {
		var skuItems = frame.sku(shell.item);
		var fields = util.sku.translate(skuItems, schemaType, shell.item);
		if(!fields || !fields.length){
			return;
		}

		var sku = util.sku.find("sku", fields);
		if(!sku){sku = util.sku.find("darwin_sku", fields);}
		if(!sku){return;}

		var $skuBox = $(".sku-box");
		$skuBox.css("display", "block");
		var skuMetas = [];
		util.sku.fields.reset();

		//颜色
		var color = util.sku.findColor(sku);
		if(color){
			var extendColor = util.sku.findExtendColor(color, fields);
			var mColor = new Sku.Model.Color({field:color, extend:extendColor});
			var vColor = util.color.createView(mColor);
			vColor.$el.appendTo($skuBox);

			skuMetas.push(mColor);
		}

		//尺码
		var std_size_group = util.sku.find("std_size_group", fields);
		var std_size_extends = util.sku.findStdSizeExtends(fields);
		var size_measure_image = util.sku.find("size_measure_image", fields);
		var mSize = new Sku.Model.Size({
			"sku":sku,
			"std_size_group":std_size_group,
			"std_size_extends":std_size_extends,
			"size_measure_image":size_measure_image,
		});

		if(mSize.isValid()){
			vSize = util.size.createView(mSize);
			vSize.$el.appendTo($skuBox);

			skuMetas.push(mSize);
		}

		//自定义销售属性
		var custom_prop_field_key = util.sku.find("custom_prop_field_key", fields);
		if(custom_prop_field_key){
			var mCustom = new Sku.Model.Custom({
				"sku":sku,
				"custom_prop_field_key":custom_prop_field_key,
			});

			if(mCustom.isValid()){
				var vCustom = new Sku.View.Custom({"model": mCustom});
				vCustom.$el.appendTo($skuBox);

				skuMetas.push(mCustom);
			}
		}

		//普通销售属性字段
		var skuProps = util.sku.normalSkuProps(sku);
		for(var i = 0; skuProps && (i < skuProps.length); ++i){
			var skuProp = skuProps[i];
			if(skuProp.type() == shell.constants.field.SINGLE_CHECK){
				var mNormal = new Sku.Model.Normal({"prop":skuProp,});
				var vNormal = new Sku.View.Normal({"model":mNormal,});
				vNormal.$el.appendTo($skuBox);

				skuMetas.push(mNormal);
			}else{
				debug.trace(skuProp);
				alert("sku普通属性，类型必须为枚举。当前为：" + skuProp.type());
			}
		}

		//获取输入片段
		var skuInputs = util.sku.inputs(sku);
		var mSkuTable = new Sku.Model.Table({
			"sku": sku,
			"metas": skuMetas,
			"inputs":skuInputs,
		});

		var vSkuTable = new Sku.View.Table({"model": mSkuTable});
		vSkuTable.$el.appendTo($skuBox);

		//自定义销售属性切换时，需要检查sku数据是否为空
		if(mCustom && mCustom.isValid()){
			mCustom.set({"table": mSkuTable});
		}

		//尺码分组切换时，需要检查sku数据是否为空
		if(mSize.isValid()){
			mSize.set({"table": mSkuTable});
		}

		//模特试穿
		var size_model_try = util.sku.find("size_model_try", fields);
		if(size_model_try){
			var mModeltry = new Sku.Model.ModelTry({"size_model_try":size_model_try,});
			if(mModeltry.isValid()){
				var vModelTry = new Sku.View.ModelTry({"model":mModeltry,});
				vModelTry.$el.appendTo($skuBox);
			}
		}

		//检测不在处理范围内的sku子属性
		util.sku.checkUnkonwSkuMeta(sku);
	}

	this.clearSkuSchema = function() {
		//
		$(".sku-box").css("display", "none").empty();
		RuleEngine.reset();
		FieldManager.clear();
	}
})();

process.renderItemAddSchema = function(json){
	shell.setItemToken(json);
	sku.loadSkuSchema(shell.constants.schema.ITEM_ADD);
}

process.renderItemUpdateSchema = function(json){
	shell.setItemToken(json);
	sku.loadSkuSchema(shell.constants.schema.ITEM_UPDATE);
}

process.clearAllSchema = function(){
	process.tryHideLoadingUi();
	process.tryCloseNetErrorTip();
	sku.clearSkuSchema();
	process.handleClear();
	Tooltip.clear();
}