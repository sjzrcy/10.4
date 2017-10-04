// JavaScript Document
// 配置集合

window.config = new (function() {
	//
	this.log = {
		LOG: 1,
		WARN: 2,
		TRACE: 3,
		ERROR: 4,
		FORBID:9999,
	}

	//设置日志开关,发布时，应该将开关设置为FORBID
	this.log.level = this.log.TRACE;

	// 基本信息编辑页面，区块划分 
	this.section = {
		PRODUCT:"#product",
		ITEM_BASIC:"",
		ITEM_SKU:"#sku_edit",
		ITEM_SALE:"#sale_edit",
		ITEM_EXTEND:"#extend_edit",
		ITEM_FOOD:"#food_edit",
	};

	//分隔符
	this.SPLIT = ",";
	this.ID_SPLIT = ",";

	//配置自定义scroll
	this.scroll = {
		scrollbarPosition:"outside",
		mouseWheel:{
			enable:true,
			scrollAmount:80,
			axis:"y",
			preventDefault:false //允许事件冒泡
		},
		keyboard:{
			enable:true,
			scrollAmount:5,
			scrollType:"stepless",

		},
		advanced:{
			updateOnBrowserResize:true,
			updateOnContentResize:true,
			autoExpandHorizontalScroll:true,
		},
		axis:"y",
		theme:"dark",
	};

	this.gScroll = util.clone(this.scroll);
	this.gScroll.axis = "yx";

	this.css = {
		ITEM_WRAP:"item_wrap",
		TITLE_WRAP:"title_wrap",
		CONTENT_WRAP:"content_wrap",
		REMINDER_WRAP:"reminder_wrap",
		TIP_WRAP:"tip_wrap"
	};

	this.hidden = {visibility:"hidden", width:"100px", height:"40px"};

	this.layout = {H:"H", V:"V"};

	this.DATE_FORMAT = "yy-mm-dd";
	this.TIME_FORMAT = "HH:mm:ss";

	this.color = {
		NORMAL:"#a0a0a0",
		HOVER:"#8fbaf1",
		ERROR:"#ff847d",
		DISABLED:"#d1d4d3"
	};

	this.image = { //图片常量
		SUCCESS:"",
		TIP:"",
		WARN:"pic/warn.png",
		ERROR:"pic/error.png",
	}

	//当前页面默认使用滚动条，可禁用
	this.edit = {
		useCustomScrollbar:true,
	}

	//后端返回值
	this.cpp = {
		OK:"ok",
		CANCEL:"cancel",
	}

	this.url = {
		EDIT_POSTAGE:"http://wuliu.taobao.com/user/logis_tools.htm?tabSource=carriageTemplate&fromType=fromTmallSell&isTmall=1&auctionid=43728737011&selectedPostageid=0",
		EDIT_AFTERSALE:"http://upload.tmall.com/auction/publish/listAfterSale.htm?aftersaleid=0&callback=_backAfterSale_712",
	}

	this.queryselect = {
		//"×"
		DELETE:"请选择",
	}

	this.alias = {
		"outer_id":"商家编码",
	}
	//
})();
