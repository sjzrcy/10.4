// JavaScript Document
// 定义各个页面需要的数据
window.frame = new (function() {
	//黑名单，不渲染
	var blackNameList = [
		"wap_desc",
		"description",
		"lang",
		"infos",
		"service_version",
		"size_mapping_template_id",
		"errors",
		"warns",
	]; 

	//预定义字段集合
	var pre = {};

	pre.product = {
		prop_20000: ""
	};

	pre.product_add = {
		product_images: function(field){
			var multiImage = new MultiImage(field, true);
			$("#product_images").append(multiImage.node());
		},
		market_price: "",
		market_time: "",
	};

	pre.basic = {
		title: "", //商品标题
		short_title: "", // 无线短标题
		sell_point:"", //商品卖点
		sell_points:function(field){//新版商品卖点
			generateHtml(field);
			var $cache = FieldManager.getCache(field.id);
			if(!$cache){return;}

			var tip = "单个卖点不超过6个字，所有卖点累加不超过20个字";
			var $title = $(".title_box_complex", $cache).removeClass("title_box_complex").css("width", "calc(66% + 112px)");
			$title.prepend($("<div>").addClass("sell_points_tip float_right").text(tip));
			$(".float_left", $title).removeClass("float_left").addClass("float_right").css({"left":"auto", "right":"5px"});

			var $complex = $(".complex_box", $cache).css("width", "66%");
			$complex.css("padding-left", "112px").css("padding-right", "112px");
			$(".title_box", $complex).remove();
			$(".clearfix", $complex).removeClass("clearfix");
			$(".content_wrap", $complex).addClass("float_left").css({
				 "min-width":"calc(100%/3 - 19px)", 
				 "width":"calc(100%/3 - 19px)", 	
				 "margin-right": "12px",
				 "margin-bottom": "6px",
			});

			var $inputs = $(":text", $complex);
			$(":text", $complex).bind("textchange", function(){
				var $input = $(this);
				var length = 0;
				$inputs.each(function(){
					if(this != $input[0]){
						length += $(this).val().length; 
					}
				});

				var MAX_LENGTH = 20;
				var PER_LENGTH = 6;
				var maxLength = MAX_LENGTH - length;
				if(maxLength > PER_LENGTH){
					maxLength = PER_LENGTH;
				}

				var value = $input.val();
				if(value.length > maxLength){
					$input.val(value.substr(0, maxLength));
				}
			});

		},
		price: function(field){//一口价
			generateHtml(field);
			var $cache = FieldManager.getCache(field.id);
			if($cache){
				$(".content_box", $cache).css({"min-width":"130px", "max-width":"130px"});
			}
		}, 
		auction_point:function(field){//返点比例
			generateHtml(field);
			var $cache = FieldManager.getCache(field.id);
			if($cache){
				$(".title_box", $cache).css({"width":"66px"});
				$(".content_box", $cache).css({"min-width":"100px", "max-width":"100px", "left":"0px"});
				$(".content_box", $cache).append($("<div>").addClass("percent").text("%"));
			}
		},
		quantity:"",
		outer_id: function(field){//商家编码
			generateHtml(field);
			var $cache = FieldManager.getCache(field.id);
			if($cache){
				$(".content_box", $cache).css({"min-width":"130px", "max-width":"130px"});
			}
		}, 
		barcode: function(field){//条形码
			generateHtml(field);
			var $cache = FieldManager.getCache(field.id);
			if($cache){
				$(".title_box", $cache).css({"width":"42px"});
				$(".content_box", $cache).css({"min-width":"121px", "max-width":"121px", "left":"0px"});
				$(".reminder_box", $cache).css({"left":"6px"});
			}
		}, 
		item_status: function(field){//商品状态
			generateHtml(field);
			var $cache = FieldManager.getCache(field.id);
			if($cache){
				$(".content_box", $cache).css({"min-width":"134px", "max-width":"134px"});
			}
		}, 
		start_time: function(field){//开始时间
			generateHtml(field);
			var $cache = FieldManager.getCache(field.id);
			var itemField = FieldManager.get(field.id);
			if($cache && itemField){
				$(".title_box", $cache).css({"width":"56px"});
				$(".content_box", $cache).css({"min-width":"110px", "max-width":"110px", "left":"1px"});
				$(".reminder_box", $cache).css({"left":"6px"});

				//字体调小一号，让时间完整显示
				$("input", $cache).css("font-size", "11px").unbind("blur");
				$("input", $cache).blur(function(){
					var $input = $(this);
					var dateString = $input.val();
					var date = Date.parse(dateString);
					var now = new Date();
					if(now < date){
						itemField.setValue(dateString);
					}else{
						setTimeout(function(){
							$input.val(itemField.value());
						}, 400);
					}
				});
			}
		}, 
		location: function(field) {//所在地
			var location_field = {}
			location_field.id = field.id;
			location_field.name = field.name;
			location_field.type = shell.constants.field.INPUT;
			location_field.value = field.value;
			location_field.schemaType = field.schemaType;
			location_field.rules = [];
			location_field.prov = "prov";
			location_field.city = "city";

			generateHtml(location_field);

			var provField;
			var cityField;
			for(var i = 0; i < field.children.length; ++i){
				var child = field.children[i];
				child.parent = field;
				child.schemaType = field.schemaType;
				if(child.id == "prov"){
					provField = new ItemField(child);
				}else if(child.id == "city"){
					cityField = new ItemField(child);
				}
			}

			var $input = $("#location input");
			$input.val((function() {
				var loct = "";
				if (field.children[0].id == "prov") {
					loct += field.children[0].value;
					loct += "/";
					loct += field.children[1].value;
				} else {
					loct += field.children[1].value;
					loct += "/";
					loct += field.children[0].value;
				}
				return loct;
			})(field));

			$input.click(function() {
				var location = shell.chooseLocation(function(location){
					location = JSON.parse(location);
					if(location.location.length == 0){
						return;
					}

					$input.val(location.location);
					var locs = location.location.split("/");
					if (locs.length == 2 && provField && cityField) {
						provField.setValue(locs[0]);
						cityField.setValue(locs[1]);
					}
				});
			});

			$input.unbind("blur");
		},
		item_size_weight:"", //物流，其下有重量(item_weight)和体积(item_size)两个字段
		delivery_way: "", //提取方式
		/*邮寄*/
		freight_payer: function(field){//运费承担方式
			generateHtml(field);
			var itemField = FieldManager.get("freight_payer");
			if(!itemField){return;}

			var $cache = itemField.cache();
			if(!$cache){return;}

			$("." + config.css.TITLE_WRAP, $cache).remove();
			$("." + config.css.CONTENT_WRAP, $cache).css({"width":"80%", "left":"36px"});


		}, 
		freight_by_buyer: "",//买家承担运费
		freight: function(field){//运费
			var $freight = $("#freight");
			var freight = new ItemField(field);
			freight.setCache($freight);
			RuleEngine.tryRegisterDependRule(freight);
			freight.installRules(true);

			for(var i = 0; i < field.children.length; ++i){
				var child = field.children[i];
				child.parent = field;
				$freight.append(fee(child, field));
			}
		},
		postage_id: function(field){//运费模板ID
			generateHtml(field);
			if(field.type != shell.constants.field.SINGLE_CHECK){
				return;
			}

			var $cache = FieldManager.getCache(field.id);
			if($cache){
				$(".content_box", $cache).css({"min-width":"88px", "max-width":"88px",});
				var $editButton = $("<div>").addClass("button float_left").css({"width":"26px", "left":"18px"}).text("编辑");
				$editButton.click(function(){
					//编辑运费模板
					shell.openUrl(config.url.EDIT_POSTAGE, true);
				});
				$(".wrapper", $cache).append($editButton);

				var $updateButton = $("<div>").addClass("button float_left").css({"width":"26px", "left":"24px"}).text("更新");
				$updateButton.click(function(){
					//更新运费模板
					refreshItemOptions("postage_id");
				});
				$(".wrapper", $cache).append($updateButton);
			}
		},
		/*电子交易凭证*/
		"locality_life.etcConsumeDime":"",
		"locality_life.etcConsumeDime.times":"",
		"locality_life.expirydate":"",
		"support_expired_refund_rate":"",
		"expired_refund_rate":"",
		"locality_life.merchant":"",
		"locality_life.merchant.id":"",
		"locality_life.merchant.name":"",
		"locality_life.network_id":"",
		"locality_life.refundmafee":"",
		"locality_life.verification":function(field){//核销打款
			if(field.type != shell.constants.field.SINGLE_CHECK || field.options.length != 1){
				generateHtml(field);
				return;
			}

			var $e = $("#" + JID("locality_life.verification"));
			if($e.length == 0){
				generateHtml(field);
				return;
			}

			var isChecked = (field.value == field.options[0].value);
			var itemField = new ItemField(field);
			var isReadOnly = itemField.hasRule(shell.constants.rule.READ_ONLY);
			var $checkbox = $("<div>").addClass(isReadOnly? "check_item_no_hover": "check_item").css({"left":"36px"});
			$e.append($checkbox);

			
			$("<div>").addClass(isReadOnly? "check_icon_no_hover": "check_icon")
						.addClass("float_left")
						.addClass(isChecked ? "check_icon_checked": "")
						.click(function(){
							if(!isReadOnly){
								var $self = $(this);
								if($self.hasClass("check_icon_checked")){
									$self.removeClass("check_icon_checked");
									itemField.setValue("");
								}else{
									$self.addClass("check_icon_checked");
									itemField.setValue(field.options[0].value);
								}
							}
						})
						.appendTo($checkbox);
			$("<div>").addClass("check_text float_left").text("支持核销打款").appendTo($checkbox);

			RuleEngine.tryRegisterDependRule(itemField);
			itemField.installRules(true);
		},
		"autoRefundfieldKey":"",
		"locality_life.expirydate.severalDays":"",
		"locality_life.expirydate.end":"",
		"locality_life.expirydate.startend":"",
		"locality_life.expirydate.deadline":"",
		"expired_refund":function(field){//过期退款
			refund(field, {title:"支持过期退款", support:"support_expired_refund_rate", rate:"expired_refund_rate", top:"3px"});
		},
		"auto_refund":function(field){//自动退款
			refund(field, {title:"支持售中自动退款", support:"support_auto_refund_rate", rate:"auto_refund_rate"});
		},

		/*right*/
		seller_cids:function(field){ //商品所属的店铺类目列表（宝贝分类）
			//
			var jsField = new ItemField(field);
			jsField.setName("在店铺中所属分类");
			jsField.setType(shell.constants.field.INPUT);

			var $cache = $("#seller_cids");
			$cache.append(jsField.html());

			RuleEngine.tryRegisterDependRule(jsField);
			jsField.installRules(true);

			var value2text = function(cids){
				if(!cids){return "";}
				var newCids = cids.split(",");
				return shell.cids2Names(newCids);
			}

			var $content = $(".content_box", $cache).css({"min-width":"88px", "max-width":"88px", "left":"2px"});
			if(jsField.value()){
				shell.cids2Names(jsField.value(), function(names){
					$("input", $cache).val(names);	
				});
			}
			
			var $chooseSellerIds = $("<div>").addClass("button float_left").css({left:"8px"}).text("选分类");
			$chooseSellerIds.click(function(){
				var oldCids = jsField.value();
				shell.chooseSellerCategory(oldCids, function(cids){
					jsField.setValue(cids);
					if(cids){
						shell.cids2Names(cids.split(","), function(names){
							$("input", $cache).val(names);
						});
					}else{
						$("input", $cache).val("");						
					}
				});
			});
			$chooseSellerIds.insertAfter($content);

			//ReadOnly
			var $e = $(".input_wrapper", $content);
			$e.addClass("readonly");
			$("input", $e).css("color", "#999999");
			setTimeout(function(){$("input", $e).prop("disabled", true);}, 40);
		},
		item_images: function(field){
			var multiImage = new MultiImage(field);
			$("#item_images").append(multiImage.node());
		}
	};

	pre.extend = {};
	pre.extend.e0 = {
		"sub_stock":"", //库存计算
		"auto_fill":"", //代充商品类型
		"second_kill":"", //商品秒杀
		"is_offline":"", //线下商品
		"agency_sale":"", //代购商品
		"valid_thru":"", //有效期
		"after_sale_id":function(field){//售后说明ID
			generateHtml(field);
			if(field.type != shell.constants.field.SINGLE_CHECK){
				return;
			}

			var $cache = FieldManager.getCache(field.id);
			if($cache){
				$(".content_box", $cache).css({"min-width":"108px", "max-width":"108px",});
				var $editButton = $("<div>").addClass("button float_left").css({"width":"26px", "left":"20px"}).text("编辑");
				$editButton.click(function(){
					//编辑售后说明模板
					shell.openUrl(config.url.EDIT_AFTERSALE, true);
				});
				$(".wrapper", $cache).append($editButton);

				var $updateButton = $("<div>").addClass("button float_left").css({"width":"26px", "left":"26px"}).text("更新");
				$updateButton.click(function(){
					//更新售后说明模板
					refreshItemOptions("after_sale_id");
				});
				$(".wrapper", $cache).append($updateButton);
			}
		}, 
	}
	pre.extend.e1 = {
		"has_warranty":"", //保修
		"sell_promise":"", //退换货承诺
		"has_invoice":"", //发票
		"has_showcase":"", //橱窗推荐
		"has_discount":"", //会员折扣
		"shop_same_style":"", //商场同款
		"try_weared_item":"", //试戴
		"is_lightning_consignment":"", //闪电发货
		"isIgnoreFakeCredit":"", //是否忽略炒信警告
	}
	pre.extend.e2 = {
		"diaopai_pic": function(field){ //吊牌图
			var singleImage = new SingleImage(field);
			$("#diaopai_pic").append(singleImage.node()); 
		},
		"vertical_image": function(field){ //商品竖图
			var singleImage = new SingleImage(field);
			$("#vertical_image").append(singleImage.node()); 
		},
	}

	pre.sku = {
		sku:"",
		darwin_sku:"",
		custom_prop_field_key:"",
		std_size_group:"",
		size_mapping:"",
		darwin_size_mapping:"",
		size_measure_image:"",
		size_model_try:"",
	}

	pre.food = {
		"food_security.food_additive":"",
		"food_security.contact":"",
		"food_security.design_code":"",
		"food_security.factory":"",
		"food_security.factory_site":"",
		"food_security.health_product_no":"",
		"food_security.mix":"",
		"food_security.period":"",
		"food_security.plan_storage":"",
		"food_security.prd_license_no":"",
		"food_security.product_date":function(field){
			var node = new BeginEndDate(field);
			$("#" + JID("food_security.product_date")).append(node.node());
		},
		/*"food_security.product_date_start":"",
		"food_security.product_date_end":"",*/
		"food_security.stock_date":function(field){
			var node = new BeginEndDate(field);
			$("#" + JID("food_security.stock_date")).append(node.node());
		},
		/*"food_security.stock_date_start":"",
		"food_security.stock_date_end":"",*/
		"food_security.supplier":"",
	}

	var skuGroupIds = {std_size_group:"", custom_prop_field_key:"",}
	/////////////////////////////////////////////////////////////
	var isSkuProperty = function(id) {
		if(typeof(id) != "string"){
			return false;
		}

		return (pre.sku[id] != undefined//fix#5980106,空字符串为假
				|| (id.indexOf("prop_extend_") == 0)
				|| (id.indexOf("std_size_extends_") == 0));
	}

	var isProperty = function(id) {
		return (typeof(id) == "string" && (id.indexOf("prop_") == 0 || id.indexOf("in_prop_") == 0));
	}

	var filterFields = function(obj){
		var exceptKeys = [];
		exceptKeys.concat(util.getKeyList(shell.brand));
		obj = util.removeAttrs(obj, exceptKeys);
		obj = util.removeAttrs(obj, blackNameList);
		return obj;
	}

	var preItemFields = function(){
		return util.mergeObjects(pre.basic, pre.sku, pre.food);
	}

	//////////////////////////////////////////////////////////
	this.product = function() {
		return pre.product;
	}

	this.productAdd = function() {
		return pre.product_add;
	}

	/////ITEM
	this.basic = function() {
		return pre.basic;
	}

	this.property = function(items) {
		var p = {};

		for (var i = 0; i < items.length; ++i) {
			var id = items[i].id;
			if (isProperty(id) && !isSkuProperty(id)) {
				p[id] = "";
			}
		}
		
		return filterFields(p);
	}

	this.extend = function() {
		return pre.extend;
	}

	this.sku = function(items) {
		var skus = {};

		for (var i = 0; i < items.length; ++i) {
			var id = items[i].id;
			if (isSkuProperty(id)) {
				skus[id] = "";
			}
		}

		for (var id in pre.sku) {
			skus[id] = pre.sku[id];
		}

		return skus;
	}

	this.food = function(){
		return pre.food;
	}

	this.others = function(items){
		var others = {};
		var pres = preItemFields();
		for(var i = 0; i < items.length; ++i){
			var id = items[i].id;
			if(!pres.hasOwnProperty(id) && !isProperty(id) && !isSkuProperty(id)){
				others[id] = "";
			}
		}
		return filterFields(others);
	}

	this.isSkuGroupField = function(id){
		return skuGroupIds[id] != undefined;
	}

	this.tips = function(){
		return ["errors", "warns"];
	}
	//
})();