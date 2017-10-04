/*
** 
**    甩手掌柜商品属性、销售属性操作
**    
**    作者：chenjt

**    修改记录：1、modified by chenjt 2011-10-9 修改了亚马逊子商品输入表格，增加了特价信息、标准编码等，并修改了相关的取值赋值函数。
**    修改记录：2、modified by wangdm 2011-10-19 增加了了亚马逊商品属性的文本框的提示信息以及验证规则，增加了商品属性的文本输入框输入字符数目限制及复选框选中数目限制。
      
**    创建日期：2011-08-25
**
**    公开函数：intialBasicProperty(prop) //通过属性JSON初始化基本属性或淘宝销售属性
**              initialTaobaoSellProperty(prop) //初始化淘宝销售属性
**              initPaipaiCustomProperty() //初始化拍拍自定义属性
**              initialPaipaiPropertyValue() //初始化拍拍自定义属性值
**              initialAmazonSellProperty(prop, porpSellPro) //初始化亚马逊子商品属性和销售属性
**
**              checkBasicProperty() //验证基本属性中的必填项，返回错误信息字符串
**              checkTaobaoSellProperty() //验证淘宝销售属性（必须全选、至少填一行价格数量、基本属性的价格必须在销售属性的价格区间内）
**              checkPaipaiSellProperty() //验证拍拍销售属性（至少填一行价格数量、基本属性的价格必须在销售属性的价格区间内）
**              checkAmazonChildProduct() //验证亚马逊子商品（至少填一行价格数量、基本属性的价格必须在销售属性的价格区间内）
ValidatePropertiesIsNew() //验证淘宝二手商品成色不能选择全新。
**              
**              getBasicProperty() //获取JSON格式的基本属性
**              getTaobaoSellProperty() //获取JSON格式的淘宝销售属性
**              getTaobaoSellPropertyValue() //格式的淘宝销售属性值
**              getPaiPaiSellProperty() //获取JSON格式的拍拍销售属性
**              getPaiPaiCustomProperty() //获取拍拍自定义属性   ***目前这个方法已经没用了***
**              getPaiPaiCustomPropertyValue() //获取拍拍自定义属性值   ***目前这个方法已经没用了***
**              getPaiPaiCustomPropertyContent() //获取拍拍获取销售属性内容
**              getAmazonBasicProperty() //获取亚马逊子商品属性
**              getAmazonChildItem() //获取亚马逊子商品属性值
**              
**              findChildProperty(dom) //获取子属性（HTML页面调用）
**              customPropChange(isColor, dom) //自定义颜色或尺码改变时修改内容（HTML页面调用）
**              paipaiShowStock() //显示或隐藏库存配置（HTML页面调用）
**              paipaiAddProperty() //拍拍添加自定义属性（HTML页面调用）
**              paipaiEditProperty() //编辑现有属性（HTML页面调用）
**              showAmazonSubject(dom) //根据亚马逊子商品主题返回子商品属性值（HTML页面调用）
**              amzonAddMoreTxtbox(dom) //亚马逊添加文本框（HTML页面调用）
**              customPicChange(dom) //添加自定义颜色 add by chenyq 2011-10-17
**                          
*/

(function(doc) {
    $(doc).ready(function() {
        init();
    });

    //**********************************************/ 公开函数 /**********************************************//

    //全局标记：是否显示“快速设置价格、数量”的提示
    window.showSetSameValTip = true;

    //存放默认值的全局变量
    window.filledDefualtValueIds = [];

    window.TestAjaxRequestJS = function(url) {
        $.ajax({
            url: url,
            dataType: "jsonp",
            jsonp: "jsonp954",
            success: function(data) {
            
            }
        });
    }

    //初始化基本属性或淘宝销售属性
    window.intialBasicProperty = function(prop) {
        if (!prop) return;
        var isPaipaiSellProperty = $id("tbPaipaiSellProperty");
        var prdProperties = jsonToAttr(prop),
        //update by ruanhh 2011-12-10
            isInitSellProperty = $id("tbSellProperty") || $id("tbPaipaiSellProperty") || $id("tbPinjuSellProperty") || $id("J_SellProperties"),
        //end
            $amazonMulTBox = null,
            amazonMulTboxId = 0,
            amazonMulTboxIndex = 0;
        var isNewTaobaoSellPro = $id("J_SellProperties");
        //是否是新版颜色 老版尺码
        var isNewColorAndOldSize = false;
		var tmpIsNewColorAndOldSize = false;//Add by huty 2017.5.15 新增保存原始的这个值
        if (isNewTaobaoSellPro) {
            var oldSizeDom = $("div.graywrap");
            if (oldSizeDom.length > 0) {
                isNewColorAndOldSize = true;
				tmpIsNewColorAndOldSize = true;
            }
        }
        if (isPaipaiSellProperty) {
            clearCusomColor();
        }
        for (var i = 0, propLen = prdProperties.length; i < propLen; i++) {
            var pId = decodeURIComponent(prdProperties[i].propertyId), //属性ID
                pName = "", //属性名
                pValue = ""; //属性值

            try { pName = decodeURIComponent(prdProperties[i].propertyName); } catch (e) { pName = prdProperties[i].propertyName }
            try { pValue = decodeURIComponent(prdProperties[i].propertyValue); } catch (e) { pValue = prdProperties[i].propertyValue }
			//Add by huty 2017.5.5 这里主要处理老版尺码可以自定义的，当是自定义的时候，就和新版尺码自定义一样处理
			var customOldSize = $("div.custom-oldsize");
			if(customOldSize.length > 0 && pValue.indexOf('-') > -1)
			{
				isNewColorAndOldSize = false;
			}
			else
			{
				isNewColorAndOldSize = tmpIsNewColorAndOldSize;
			}
			//End
            if (pId == "0") { //等于零，说明不是属性/属性值对，而是特殊用途的数据
                var hiddenField;

                if (pName == "*价格*") {
                    hiddenField = $id("J_ProductPrice");
                }
                else if (pName == "*目录*") {
                    hiddenField = $id("J_CurrentDomainDirectory");
                }

                if (hiddenField) {
                    hiddenField.value = pValue;
                }
            }
            else {
                var objId1 = "prop_" + pId + "_" + pValue,
                    objId2 = "prop_" + pId;
                var customFileId = "";
                //淘宝新销售属性 女装-西装 流行男鞋
                if (isNewTaobaoSellPro) {
                    //检测是否是颜色,查询了所有新版销售的颜色的key都为1627207
                    var isColor = false;
                    if (pValue.indexOf(":") > -1 && pValue.indexOf("1627207") > -1) {
                        isColor = true;
                    }
                    if (!isNewColorAndOldSize || isColor) {
                        var proValueKeys = Number(pValue.split(":")[1]);
                        if (proValueKeys < -1000) {
                            proValueKeys = proValueKeys + 1000;
                        }
                        objId1 = "prop_" + pValue.split(":")[0] + "-" + proValueKeys;
                        customFileId = "J_MapImg_" + pValue.split(":")[0] + "-" + proValueKeys;
                        objDom = $id(objId1);
                    } else {
                        objDom = $id(objId2) || $id(objId1);
                    }
                } else if (isPaipaiSellProperty) {
                    objDom = $id(objId1);
                }
                else {
                    objDom = $id(objId2) || $id(objId1);
                }
                var hasChildSelect = objDom ? objDom.getAttribute("hasChildSelect") == "true" : false, //是否有子属性
                    tagName = objDom ? objDom.tagName.toLowerCase() : ""; //元素类型

                //销售属性的ChceckBox，不能查找ID，而是sellPropValue字段
                if (isInitSellProperty) {
                    if (!isPaipaiSellProperty) {
                        var $obj = $("input:checkbox[id^='prop_" + pId + "'][sellPropValue='" + pValue + "']");
                        //淘宝新销售属性 女装-西装 流行男鞋
                        if (isNewTaobaoSellPro) {
                            if (!isNewColorAndOldSize || isColor) {
                                $obj = $("input:checkbox[id='" + objId1 + "']");
                            } else {
                                $obj = $("input:checkbox[id^='prop_" + pId + "'][sellPropValue='" + pValue + "']"); //老版的尺码
                            }
                        }
                        if ($obj.length && $obj.selector != "") {
                            objDom = $obj.get(0);
                            tagName = objDom ? objDom.tagName.toLowerCase() : "";
                        }
                        else {
                            $obj = $("input:text[id='prop_" + pId + "']");
                            if ($obj.length) {
                                objDom = $obj.get(0);
                                tagName = objDom ? objDom.tagName.toLowerCase() : "";
                            }
                            else {
                                $obj = $("select[id='prop_" + pId + "']");
                                if ($obj.length) {
                                    objDom = $obj.get(0);
                                    tagName = objDom ? objDom.tagName.toLowerCase() : "";
                                }
                            }
                        }
                    }
                    else {
                        var $obj = $("input:checkbox[id^='prop_" + pId + "'][sellPropValue='" + pValue + "']");
                        if ($obj.length && $obj.selector != "") {
                            objDom = $obj.get(0);
                            tagName = objDom ? objDom.tagName.toLowerCase() : "";
                        }
                    }
                }

                //如果对象存在
                if (objDom) {
                    if (tagName == "select") { //SELECT类型
                        objDom.value = pValue;
                        hasChildSelect = objDom ? objDom.getAttribute("hasChildSelect") == "true" : false; //是否有子属性
                        //如果有子属性，赋值时手动触发onchange事件
                        if (hasChildSelect) {
                            var option = objDom.options[objDom.selectedIndex - 1],
                                hasChildProperty = option ? option.className.indexOf("hasChildProperty") >= 0 : false;

                            if (hasChildProperty) {
								customFireEventChange(objDom);
                            } else {
                                customFireEventChange(objDom);
                            }
                        }
                    }
                    else if (tagName == "input") { //INPUT类型
                        var inputType = objDom.getAttribute("type") ? objDom.getAttribute("type").toLowerCase() : "";

                        if (inputType == "text") { //文本框
                            objDom.value = pValue == "" ? pName : pValue;
                        }
                        else if (inputType == "checkbox") { //销售属性

                            objDom.checked = true;
                            //淘宝新销售属性 女装-西装 流行男鞋
                            if (isNewTaobaoSellPro) {
                                //自定义颜色
                                if (Number(pValue.split(":")[1]) < 0 && $(objDom).parent().hasClass("custom-list")) {
                                    $(objDom).next()[0].value = prdProperties[i].propertyName;
                                }
                                //自定义尺码
                                if (Number(pValue.split(":")[1]) < 0 && $(objDom).hasClass("other-check")) {
                                    $(objDom).next().next()[0].value = prdProperties[i].propertyName;
                                }
                                //备注信息
                                if (prdProperties[i].aliasname != null && prdProperties[i].aliasname != "" && Number(pValue.split(":")[1]) > 0) {
                                    if ($(objDom).parent().hasClass("sku-item")) {
                                        //尺码备注
                                        $(objDom).next().next().next()[0].value = prdProperties[i].aliasname;
                                    } else {
                                        //颜色备注
                                        $(objDom).parent().parent().find("input:text")[0].value = prdProperties[i].aliasname;
                                    }
                                }
                                //销售属性图片
                                if (prdProperties[i].picFile != null && prdProperties[i].picFile != "") {
                                    var picBtnDom = $(objDom).parents().find("#J_SKUColorWrapper").find("table tbody tr[id='" + customFileId + "']").find("div.img-btn");
                                    var showFile = prdProperties[i].picFile;
                                    if (showFile.indexOf("http://") >= 0) {
                                        showFile = showFile;
                                    }
                                    else {
                                        showFile = $id("J_CurrentDomainDirectory").value + showFile;
                                    }
                                    taobaoNewSellPic(picBtnDom, showFile);
                                }
                            } else {
                                if (prdProperties[i].hasOwnProperty("newpropertyName")) {
                                    if ($.trim(prdProperties[i].newpropertyName) != "") {
                                        $(objDom).nextAll("input")[0].value = prdProperties[i].newpropertyName;
                                    }
                                }
                            }
                            if (isPaipaiSellProperty) {
                                var colorTable = $('#colortable').get(0);
                                if (colorTable) {
                                    if ($('#colortable')[0].children[0].children[0].children[0].children[1].children[0].children[0].children[0].getAttribute('name') == objDom.getAttribute('name')) {
                                        ShowColorPicEditTable(objDom);
                                    }
                                }
                            }
                            //淘宝新销售属性 女装-西装 流行男鞋
                            if (isNewTaobaoSellPro) {
                                taobaoNewCustomColorAndSizeHandler(objDom);
                                customFireEventClick(objDom);
                                if ($(objDom).parent().hasClass("sku-item")) {
                                    var sizePannelIndex = $("div.size-content ul").index($(objDom).parents("ul.size-pannel"));
                                    $("ul.size-type li:eq(" + sizePannelIndex + ")").find("input.type-radio").attr("checked", "true");
                                    $("ul.size-pannel").hide();
                                    $("ul.size-pannel:eq(" + sizePannelIndex + ")").show();
                                }
                            } else {
                                taobaoCustomColorAndSizeHandler(objDom);
                                //如果有子属性，赋值时手动触发onclick事件                              
                                var hasChildProperty = objDom ? objDom.className.indexOf("hasChildProperty") >= 0 : false;
                                if (hasChildProperty) {
									customFireEventClick(objDom);
                                }
                                taobaoCustomColorAndSizeHandler(objDom);
                            }
                        }

                    }
                    else if (tagName == "td") { //复选框类型
                        objDom = $id(objId1);
                        if (objDom) {
                            objDom.checked = true;

                            var hasChildProperty = objDom ? objDom.className.indexOf("hasChildProperty") >= 0 : false;

                            //如果有子属性，赋值时手动触发onclick事件
                            if (hasChildProperty) {
                                customFireEventClick(objDom);
                            }
                        }
                    }
                    else if (tagName == "img") { //淘宝自定义图片
                        if (pValue) {
                            //自定义图片是网络地址的，不需要加安装目录
                            //update by yulq 2014-03-20
                            if (pValue.indexOf("http://") >= 0) {
                                $(objDom).attr("src", pValue).show();
                            }
                            else {
                                $(objDom).attr("src", $id("J_CurrentDomainDirectory").value + pValue).show();
                            }
                        }
                    }
                    else if (tagName == "div") { //多文本输入框（卓越亚马逊特有）
                        if (amazonMulTboxId == objId2) {
                            if (amazonMulTboxIndex >= 2) {
                                $(objDom).find("a.moreTxtbox").trigger("click");
                                $amazonMulTBox = $(objDom).find("input.amazonTxtBox");
                            }
                            $amazonMulTBox.eq(++amazonMulTboxIndex).val(pValue);
                        }
                        else {
                            amazonMulTboxId = objId2;
                            amazonMulTboxIndex = 0;
                            $amazonMulTBox = $(objDom).find("input.amazonTxtBox");
                            $amazonMulTBox.eq(amazonMulTboxIndex).val(pValue);
                        }
                    }
                }
                else if (isPaipaiSellProperty) {
                    if (Number(pValue) > 752) {
                        cusomerCount = Number(pValue) - 752;
                    } else {
                        cusomerCount = cusomerCount + 1;
                    }

                    var id = $('#colortable').find("tr").eq(2).find('td').eq(0).find("li").eq(0).find('input').eq(0).attr('name');
                    //获取saveValue的值
                    var saveValue = $($("tr[id='" + pValue + "'][class='trTbCustomColor'] img")).attr("parentid");
                    var htmlStr = "<li style='clear:none;display:inline;float:left;width:20%'><label style='margin-left:0px;'><input type='checkbox' onclick='removethis(this)' checked='true' isbaseproprety='false' sellpropvalue='753' id='";
                    htmlStr += id + '_c' + cusomerCount + "' name='" + id + "' value='" + "c" + cusomerCount + "' saveValue = '" + saveValue + "'/><input id='";
                    htmlStr += id + "' type='text' onfocus='saveCurrentName(this)'  onblur='changePropertyName(this)' style='width:60px;' value='" + prdProperties[i].newpropertyName + "' dvalue='自定义颜色" + cusomerCount + "'/></label></li>";
                    $('#colortable').find("tr").eq(2).find('td').eq(0).find('ul').append(htmlStr);
                    ShowColorPicEditTable($('#' + id + '_c' + cusomerCount));
                }
            } //end else
        } //end for

        //如果是初始化淘宝销售属性，勾选完以后，构建销售属性表格
        if (isInitSellProperty) {
            if (isNewTaobaoSellPro) {
                buildTaobaoNewSellProperty();
            } else {
                buildTaobaoSellProperty();
            }
        }
        if (isPaipaiSellProperty) {
            buildPaipaiSellProperty();
        }
    };

    //初始化淘宝销售属性
    window.initialTaobaoSellProperty = function(prop) {

        if (!prop) return;
        var sellPropList = jsonToAttr(prop);
        var $sellProperty = $("#tbSellProperty").find("tr.tbSellProperty");
        var isNewTaobaoSellPro = $id("J_SellProperties");
        //淘宝新销售属性 女装-西装 流行男鞋
        if (isNewTaobaoSellPro) {
            $sellProperty = $("#J_SellProperties").find("div.sku-group");
        }
        //数据：718905:3161092:50*34|718947:3161137:军绿色|718996:3161161:独立
        //想要得到：718905:3161092_718947:3161137_718996:3161161
        for (var i = 0, len = sellPropList.length; i < len; i++) {
            var objId = sellPropList[i].sellProInfos,
                data = objId.split("|"),
                arrNewSellProperty = [];

            //按照页面销售属性的顺序重新调整销售属性串
            //属性串中的顺序可能是“颜色：尺码”
            //但页面中的销售属性顺序可能是“尺码：颜色”
            for (var j = 0, dataLen = data.length; j < dataLen; j++) {
                var item = data[j].split(":"),
                    id = "prop_" + item[0];
                var index = $sellProperty.index($("#" + id).parent("tr.chkBoxGroup"));
                //淘宝新销售属性 女装-西装 流行男鞋
                if (isNewTaobaoSellPro) {
                    index = $sellProperty.index($("#" + id));
                }
                arrNewSellProperty[index] = item[0] + ":" + item[1];
            }

            var id = "";
            for (var k = 0, arrLen = arrNewSellProperty.length; k < arrLen; k++) {
                var item = arrNewSellProperty["" + k + ""];
				//Update by huty 2017.5.5 当多个销售属性只选择一个也可以有sku的时候，也要能显示正确的价格数量,不加这个判断会导致id包含null，从而导致匹配不到数据
				if(item != null)
				{
					id += item + "_";
				}
                
            }
            if (id.length != 1) {
                id = id.substring(0, id.length - 1);
            }

            //赋值
            if ($id(id) != null) {
                $id("p_" + id).innerText = sellPropList[i].price;
                $id("q_" + id).innerText = sellPropList[i].nums;
                $id("tsc_" + id).innerText = unescape(sellPropList[i].code);
                $id("skuOnlineKey_" + id).innerText = unescape(sellPropList[i].skuOnlineKey);
            }
        }

        //初始化结束后执行的回调函数
        initedSellPropertyCallback("taobao");
    };

    //验证必填项
    window.checkBasicProperty = function() {
        var errorMsg = "请检查必填项是否填写完整",
            errorArray = [],
            errorArrayFormat = [],
            errorItemIdArray = [],
            errorInfor = "<span class='errorNotNull'>该项不能为空</span>",
            $select = $("select.notAllowNull"),
            $input = $("input.notAllowNull"),
            $selectAndInput = $("select.notAllowNull, input.notAllowNull"),
            $checkbox = $("td.notAllowNull"),
            noError = true,
            $InputForFormat = $("input.PatternTest"),
            noErrorForFormate = true;

        //清空
        $("span.errorNotNull").remove();
        $selectAndInput.css({ "border": "1px solid #ABADB3", "background-color": "#fff" });
        $("#tbBaisc .tdPropValue").css({ "background-color": "#fff" });
        $InputForFormat.css({ "border": "1px solid #ABADB3", "background-color": "#fff" });

        $selectAndInput.each(function() {
            var $this = $(this);

            if (!this.value) {
                $this.css({ "border": "1px solid #FF8080", "background-color": "#FFD2D2" })
                     .after(errorInfor);
                var text = $this.parent().prev().children("label").text().replace(":", "");
                errorArray.push(text);
                errorItemIdArray.push(this.id);
                noError = false;
            }
        });
        $checkbox.each(function() {
            var id = this.id,
                hasSelectedItem = false,
                $this = $(this);

            $this.siblings(".tdPropValue").find(":checkbox[id^='" + id + "']").each(function() {
                if (this.checked) {
                    hasSelectedItem = true;
                    return false;
                }
            });
            if (!hasSelectedItem) {
                var $td = $this.siblings(".tdPropValue"),
                    text = $this.text().replace(":", "").replace("*", "");

                $td.css({ "background-color": "#FFD2D2" })
                   .append(errorInfor);
                $td.children("span.errorNotNull").css({ "float": "left" })
                errorArray.push(text);
                errorItemIdArray.push(id);
                noError = false;
            }
        });

        $InputForFormat.each(function() {
            if (this.value) {
                var $this = $(this);
                var pattern = $this.attr("pattern");
                if (pattern) {
                    var hint = $this.attr("hint");
                    if (!hint) {
                        hint = "格式不正确！";
                    }
                    pattern = eval(pattern);
                    if (!pattern.test(this.value)) {
                        $this.css({ "border": "1px solid #FF8080", "background-color": "#FFD2D2" })
                     .after("<span class='errorNotNull'>" + hint + "</span>");
                        var text = $this.parent().prev().children("label").text().replace(":", "");
                        errorArrayFormat.push(text);
                        errorItemIdArray.push(this.id);
                        noErrorForFormate = false;
                    }
                }
            }
        });
        if (noError && noErrorForFormate) {
            return null;
        }
        else {
            var returnStr = "";
            if (!noError) {
                var firstErrorId = errorItemIdArray[0],
                targetTop = $("#" + firstErrorId).parents("tr").offset().top - 12;
                $("html, body").animate({ scrollTop: targetTop }, 500); //屏幕移动到第一个必填项

                returnStr += "属性必填项：" + errorArray.join(",") + "不能留空;&";
            }
            if (!noErrorForFormate) {
                var firstErrorId = errorItemIdArray[0],
                targetTop = $("#" + firstErrorId).parents("tr").offset().top - 12;
                $("html, body").animate({ scrollTop: targetTop }, 500); //屏幕移动到第一个必填项

                returnStr += "属性项：" + errorArrayFormat.join(",") + "格式不正确;";
            }
            return returnStr;
        }
    };
    //验证淘宝二手商品不能选择全新 add by chenyq 2011-07-07
    window.ValidatePropertiesIsNew = function() {
        var iscs = null;
        var errorArray = [];
        var flag = "true";
        var errorInfor = "<span class='errorNotNull'>二手商品，成色不能选全新</span>";
        $("select[class='notAllowNull']").each(function() {
            var text = $(this).parent().prev().children("label").text().replace(":", "");
            if (text == "成色" || text == "宝贝成色") {
                if ($(this).find("option:selected").text() == "全新") {
                    $("span.errorNotNull").remove();
                    $(this).css({ "border": "1px solid #FF8080", "background-color": "#FFD2D2" });
                    $(this).after(errorInfor);
                    flag = "false";
                }
            }
        });
        if (flag == "false") {
            return "二手商品，成色不能选全新";
        }
    }
    //验证销售属性必填项
    window.checkSellProperty = function() {
        var $checkbox = $("td.notAllowNull"),
            errorArray = [],
            noError = true;

        $checkbox.each(function() {
            var id = this.id,
                hasSelectedItem = false,
                $this = $(this);

            $this.siblings("td.tdPropValue").find("input:checkbox[id^='" + id + "']").each(function() {
                if (this.checked) {
                    hasSelectedItem = true;
                    return false;
                }
            });

            $this.siblings("td.tdPropValue").find("input:text[id^='" + id + "']").each(function() {
                if (this.value) {
                    hasSelectedItem = true;
                    return false;
                }
            });

            $this.siblings("td.tdPropValue").find("select[id^='" + id + "']").each(function() {
                if (this.value) {
                    hasSelectedItem = true;
                    return false;
                }
            });

            if (!hasSelectedItem) {
                var $td = $this.siblings(".tdPropValue");
                var text = $this.text().replace(":", "").replace("*", "");
                errorArray.push(text);
                noError = false;

            }
        });

        if (!noError) {
            return "请填写销售属性必填项：" + errorArray.join(",");
        }
        else
            return null;
    };

    /*  
    *    验证淘宝销售属性，规则： 
    *    1、销售属性必须都勾选或都不勾选
    *    2、必须填写淘宝销售属性中的数量和价格（至少填写一行）
    *    3、基本属性的价格不能大于或小于销售属性中的最大值和最小值
    */
    window.checkTaobaoSellProperty = function(clientPrice) {
        var checkNotNull = checkSellProperty();
        if (checkNotNull) {
            return checkNotNull;
        }

        var sellPropError = "",
            sellProCount = 0,
            sellProCheckedCount = 0;

        $("#tbSellProperty").find("tr.tbSellProperty").each(function() {
            sellProCount++;
            var $td = $(this).children("td.tdPropValue"),
                checkedLen = $td.find("input:checked").length;

            if (checkedLen > 0) {
                sellProCheckedCount++;
            }
        });
        if (sellProCheckedCount != 0 && sellProCount != sellProCheckedCount) {
            sellPropError = "只选了销售属性中的一项，请全选或全不选;";
        }

        var $sellPropTr = $("#J_tbSellProperty").find("tr.trSellProp"),
            hasFillSellPropFlag = false,
            arrPrice = [];

        if ($sellPropTr.length) {
            $sellPropTr.each(function() {
                var $this = $(this),
                    price = $this.find("input.price").val(),
                    num = $this.find("input.quantity").val();

                if (parseFloat(price) != 0) {
                    arrPrice.push(parseFloat(price));
                    hasFillSellPropFlag = true;
                }
            });

            arrPrice.sort(sortNumber);

            if (!hasFillSellPropFlag) {
                sellPropError = "请填写淘宝销售属性中的数量和价格";
            }
            else {
                if (parseFloat(clientPrice) > parseFloat(arrPrice[arrPrice.length - 1]) || parseFloat(clientPrice) < parseFloat(arrPrice[0])) {
                    sellPropError = "基本属性的价格不能大于或小于销售属性中的最大值和最小值";
                }
            }
        }
        return sellPropError;
    };

    //获取JSON格式的基本属性
    window.getBasicProperty = function() {
        var json = "[",
            retId = "",
            retName = "",
            retValue = "",
            $inputs = $("#tbBaisc").find("select,input[type='text'],input:checked,div.amazonTextBoxGroup");

        $inputs.each(function() {
            var $this = $(this),
                id = this.id,
                value = this.value;

            if ($this.is("select")) { //下拉菜单
                var selectedText = $("#" + id + " option:selected").text();
                if (selectedText != "请选择" && value != "") {
                    retId = id.replace("prop_", "");
                    retName = selectedText;
                    retValue = value;

                    json = json + "{\"propertyId\":\"" + retId + "\",\"propertyName\":\"" + encodeSpecialChars(retName) + "\",\"propertyValue\":\"" + encodeSpecialChars(retValue) + "\"},";
                }
            }
            else if ($this.is("input[type=text]")) { //文本框
                if (value && id) {
                    retId = id.replace("prop_", "");
                    retName = $this.parent().parent().children().eq(0).text().replace(":", "").replace("*", "").replace(" ", "");
                    retValue = value.replace(/\\/g, '%5C');

                    json = json + "{\"propertyId\":\"" + retId + "\",\"propertyName\":\"" + encodeSpecialChars(retName) + "\",\"propertyValue\":\"" + encodeSpecialChars(retValue) + "\"},";
                }
            }
            else if ($this.is('input[type=checkbox]')) { //复选
                if (this.checked) {
                    retId = this.name.replace("cp_", "");
                    retName = $this.nextAll("label").text() || $this.nextAll("input:text").val();
                    retValue = value;

                    json = json + "{\"propertyId\":\"" + retId + "\",\"propertyName\":\"" + encodeSpecialChars(retName) + "\",\"propertyValue\":\"" + encodeSpecialChars(retValue) + "\"},";
                }
            }
            else if ($this.is('div')) { //多文本输入框（卓越亚马逊特有）
                var $txtBoxes = $this.find("input.amazonTxtBox"),
                    propId = id.replace("prop_", "");

                $txtBoxes.each(function() {
                    if (this.value != "" && this.value.length > 0) {
                        retId = propId;
                        retName = this.value;
                        retValue = this.value;

                        json = json + "{\"propertyId\":\"" + retId + "\",\"propertyName\":\"" + encodeSpecialChars(retName) + "\",\"propertyValue\":\"" + encodeSpecialChars(retValue) + "\"},";
                    }
                });
            }
        });

        if (json.length > 1) {
            json = json.rtrim(",") + "]";
        }
        else {
            json = "";
        }
        return json;
    };

    //获取JSON格式的淘宝销售属性
    window.getTaobaoSellProperty = function() {
        var jsonBasic = "[",
            retId = "",
            retName = "",
            retValue = "",
            $inputs = $("#tbSellProperty").find("input:checked");
        var isNewTaobaoSellPro = $id("J_SellProperties");
        //淘宝新销售属性 女装-西装 流行男鞋
        if (isNewTaobaoSellPro) {
            $inputs = $("#J_SellProperties").find("input:checked");
            $inputs.each(function() {
                var newAliasname = "";
                var newPicFile = "";
                var checkedDom = $(this);
                var sysProIdAndValueId = checkedDom.attr("sysprovalue");
                var sellProValue = checkedDom.attr("sellPropValue"); //老版尺码
                if (sysProIdAndValueId != null && sysProIdAndValueId != "") {
                    if (this.checked) {
                        retId = sysProIdAndValueId.split(":")[0];
                        retName = checkedDom.attr("data-text") || checkedDom.next().attr("title") || checkedDom.nextAll("input:text").val();
                        retValue = this.value;
                        var proValueKeys = Number(this.value.split(":")[1]);
                        if (proValueKeys < 0) {
                            proValueKeys = proValueKeys - 1000;
                            retValue = retValue.split(":")[0] + ":" + proValueKeys;
                        }
                        //颜色备注 or 尺码备注
                        if (checkedDom.parent().find("i.color-box").length != 0) {
                            newAliasname = checkedDom.parent().parent().find("input:text")[0].value;
                        } else if (checkedDom.parent().hasClass("sku-item")) {
                            newAliasname = checkedDom.next().next().next()[0].value;
                        }
                        //销售属性图片
                        var customFileId = "J_MapImg_" + retValue.split(":")[0] + "-" + this.value.split(":")[1];
                        var picBtnDom = checkedDom.parents().find("#J_SKUColorWrapper").find("table tbody tr[id='" + customFileId + "']").find("div.img-btn");
                        if (picBtnDom.length != 0) {
                            newPicFile = picBtnDom.parent().find("input.J_ImgInput").attr("value").replace(decodeURIComponent($("#J_CurrentDomainDirectory").val()), "").replace(/\\/g, '%5C'); ;
                        }
                    }
                    jsonBasic = jsonBasic + "{\"propertyId\":\"" + retId + "\",\"propertyName\":\"" + encodeSpecialChars(retName) + "\",\"propertyValue\":\"" + encodeSpecialChars(retValue) + "\",\"aliasname\":\"" + encodeSpecialChars(newAliasname) + "\",\"picFile\":\"" + encodeSpecialChars(newPicFile) + "\"},";
                }
                else if (sellProValue != null && sellProValue != "") {
                    //老版尺码
                    var $this = $(this),
					id = this.id,
					value = this.value,
					sellProValue = $this.attr("sellPropValue"); //淘宝销售属性保存的value不是value，而是sellPropValue

                    if (this.checked) {
                        retId = this.name.replace("cp_", "");
                        retName = $this.nextAll("label").text() || $this.nextAll("input:text").attr("dvalue");
                        retValue = sellProValue;
                    }
                    jsonBasic = jsonBasic + "{\"propertyId\":\"" + retId + "\",\"propertyName\":\"" + encodeSpecialChars(retName) + "\",\"propertyValue\":\"" + encodeSpecialChars(retValue) + "\"},";
                }
            });

            //老版自定义尺码
            $("#J_SellProperties input.textBoxCustom").each(function() {
                var $this = $(this),
                txt = this.value ? this.value.replace(/\\/g, '%5C') : "",
                orinalText = $this.attr("dvalue");

                if (txt == orinalText) return true; //说明没有填写自定义值

                var $chk = $this.siblings("input:checkbox"),
                sizePropId = this.id.replace("prop_", ""),
                keys = $chk.attr("childKeys");

                if (txt) {
                    jsonBasic = jsonBasic + "{\"propertyId\":\"" + sizePropId + "\",\"propertyName\":\"" + encodeSpecialChars(txt) + "\",\"propertyValue\":\"" + encodeSpecialChars(txt) + "\"},";
                }
            });
        } else {
            //销售属性CheckBox
            $inputs.each(function() {
                var $this = $(this),
                id = this.id,
                value = this.value,
                sellProValue = $this.attr("sellPropValue"); //淘宝销售属性保存的value不是value，而是sellPropValue

                if (this.checked) {
                    retId = this.name.replace("cp_", "");
                    retName = $this.nextAll("label").text() || $this.nextAll("input:text").attr("dvalue");
                    retValue = sellProValue;
                }

                jsonBasic = jsonBasic + "{\"propertyId\":\"" + retId + "\",\"propertyName\":\"" + encodeSpecialChars(retName) + "\",\"propertyValue\":\"" + encodeSpecialChars(retValue) + "\"},";
            });
            //自定义颜色
            $("#J_tbCustomColor tr.trTbCustomColor").each(function() {
                var $this = $(this),
                display = $this.css("display");

                if (display.toLowerCase() == "none") return true;

                var $child = $this.children("td"),
                $name = $child.eq(1).children("input.textBoxCustom"),
                $file = $child.eq(2).children("input"),
                $img = $child.eq(3).children("img"),
                keys = $name.attr("keys"),
                cusNameId = $name.attr("id").replace("prop_", ""),
                cusName = encodeSpecialChars($name.val()),
                cusFileId = $img.attr("id").replace("prop_", ""),
                cusFile = "";

                //IE8保护上传文件 会使用假路径fakepath
                var dom = $file.get(0);
                if (dom.value) {
                    cusFile = getPath(dom).replace(decodeURIComponent($("#J_CurrentDomainDirectory").val()), "").replace(/\\/g, '%5C');
                }

                var cusImg = $img.attr("src").replace(decodeURIComponent($("#J_CurrentDomainDirectory").val()), "").replace(/\\/g, '%5C');
                if (cusName != "") {
                    jsonBasic = jsonBasic + "{\"propertyId\":\"" + cusNameId + "\",\"propertyName\":\"" + encodeSpecialChars(cusName) + "\",\"propertyValue\":\"" + encodeSpecialChars(cusName) + "\"},";
                }
                if (cusFile != "") {
                    jsonBasic = jsonBasic + "{\"propertyId\":\"" + cusFileId + "\",\"propertyName\":\"" + cusFile + "\",\"propertyValue\":\"" + cusFile + "\"},";
                }
                else if (cusImg.indexOf("nolink") < 0) {
                    jsonBasic = jsonBasic + "{\"propertyId\":\"" + cusFileId + "\",\"propertyName\":\"" + encodeSpecialChars(cusImg) + "\",\"propertyValue\":\"" + encodeSpecialChars(cusImg) + "\"},";
                }
            });

            //自定义尺码
            $("#tbSellProperty input.textBoxCustom").each(function() {
                var $this = $(this),
                txt = this.value ? this.value.replace(/\\/g, '%5C') : "",
                orinalText = $this.attr("dvalue");

                if (txt == orinalText) return true; //说明没有填写自定义值

                var $chk = $this.siblings("input:checkbox"),
                sizePropId = this.id.replace("prop_", ""),
                keys = $chk.attr("childKeys");

                if (txt) {
                    jsonBasic = jsonBasic + "{\"propertyId\":\"" + sizePropId + "\",\"propertyName\":\"" + encodeSpecialChars(txt) + "\",\"propertyValue\":\"" + encodeSpecialChars(txt) + "\"},";
                }
            });
        }
        if (jsonBasic.length > 1) {
            jsonBasic = jsonBasic.rtrim(",") + "]";
        }
        else {
            jsonBasic = "";
        }
        return jsonBasic;
    };

    //获取JSON格式的淘宝销售属性值
    window.getTaobaoSellPropertyValue = function() {
        var json = "",
            $objTr = $("#J_tbSellProperty").find("tr.trSellProp"); //销售属性的每一行

        if ($objTr.length) {
            json = "[";
            $objTr.each(function() {
                var $this = $(this),
                    id = this.id,
                    price = $this.find("input.price").val(),
                    nums = $this.find("input.quantity").val(),
                    code = $this.find("input.shopCode").val(),
                    skuOnlineKey = $this.find("input.skuOnlineKey").val(),
                    sellProInfos = "",
                    arrSellPropId = $this.find("input.price").attr("id").replace("p_", "").split("_");

                $.each(arrSellPropId, function(i) {
                    sellProInfos += arrSellPropId[i] + ":" + $this.children(":eq(" + i + ")").text() + "|";
                });
                sellProInfos = sellProInfos.rtrim("\\|")

                if (parseFloat(price) != 0)
                    json = json + "{\"sellProInfos\":\"" + encodeSpecialChars(sellProInfos) + "\",\"price\":\"" + price + "\",\"nums\":\"" + nums + "\",\"code\":\"" + encodeSpecialChars(code) + "\",\"skuOnlineKey\":\"" + skuOnlineKey + "\"},";
            });

            if (json.length) {
                json = json.rtrim(",") + "]";
            }
        }

        return json;
    };

    //查找子属性
    window.findChildProperty = function(dom) {
        if (!dom) {
            return "";
        }
        var $parent = $(dom).parents("tr"),
            value = dom.value,
            id = dom.id.replace("prop_", "").replace("_" + value, ""),
            domType = dom.tagName.toLowerCase(),
            returnValue = "";

        if (domType == "input" || domType == "select") {
            if ((domType == "input" && $(dom).attr("checked")) || (domType == "select" && value != "")) {
                //查找子属性
                returnValue = getChildProperty(id, value);
                //将返回值追加到下一行TR
                if (returnValue != "") {
                    findChildAndRemove($parent, id);
                    $parent.after(returnValue);
                }
                else {
                    findChildAndRemove($parent, id);
                }
            }
            else {
                findChildAndRemove($parent, id);
            }
        }
    };

    //自定义颜色、尺码或其他销售属性输入内容变化时发生
    //isColor:是否是颜色属性
    window.customPropChange = function(isColor, dom) {
        var $this = $(dom),
            val = dom.value.trim(),
            maxLength = $this.attr("maxlength"),
            index = $id("AmazonSubjectProperty") ?
                    $("#AmazonSubjectProperty").find("dl").index($this.parents("dl")) :
                    $("#tbSellProperty").find("tr.tbSellProperty").index($this.parents("tr")); //记录修改的是哪行销售属性

        if (isColor) {
            var parentId = $this.attr("parentId"),
                oldVal = $this.parent("td").prev("td").text(),
                tmpArrId = parentId.split("_");

            parentId = tmpArrId[tmpArrId.length - 1];
            index = $("#tbSellProperty").find("tr.tbSellProperty").index($("#tbSellProperty").find("tr.tbColor"));

            $("#J_tbSellProperty > tbody").children("tr[id*='" + parentId + "']").each(function() {
                $(this).children("td").eq(index).text(val ? val : oldVal);
            });
        }
        else {
            var dvalue = $this.attr("dvalue"),
                $checkbox = $this.siblings("input:checkbox"),
                parentId = $checkbox.attr("id"),
                tmpArrId = parentId.split("_"),
                $table = $id("AmazonSellPropTable") ? $("#AmazonSellPropTable") : $("#J_tbSellProperty");

            parentId = tmpArrId[tmpArrId.length - 1];

            $table.find("tr[id*='" + parentId + "']").each(function() {
                $(this).find("td").eq(index).text(val ? val : dvalue);
            });
        }
    };

    //自定义图片变化时发生 add by chenyq 2011-10-17
    //用户选择自定义图片的触发的事件
    window.customPicChange = function(dom) {
        var $this = $(dom),
             val = dom.value.trim();
        $this.parent("td").next("td").find("img").attr("name", val);
        $this.parent("td").next("td").find("img").attr("src", val).show();

    };

    //显示、隐藏库存配置
    window.paipaiShowStock = function(dom) {
        $("#J_ppSellProWrap").toggle(dom.checked);
    };

    //初始化拍拍自定义属性
    window.initPaipaiCustomProperty = function(prop) {

        var customProperty = jsonToAttr(prop),
            stockCheckBox = $id("J_PaiPaiStock"),
            htmlToAppend = [];

        if (customProperty.length > 0 && !stockCheckBox.checked) {
            stockCheckBox.checked = true;
			customFireEventClick(stockCheckBox);
        }

        for (var i = 0; i < customProperty.length; i++) {
            var pId = customProperty[i].propertyId,
                pName = "",
                arrValue = customProperty[i].propertyValue.split("|"),
                value = [];

            $('#J_ppCustomColor tbody tr').each(function() {
                $this = $(this);
                $.each(customProperty, function(i) {
                    var propertyValue = customProperty[i].propertyValue.replace(/\s+/g, " ").split('|');
                    var propertyFiles = null;
                    if (customProperty[i].picFile != null) {
                        propertyFiles = customProperty[i].picFile.replace(/\s+/g, " ").split('|');
                    }
                    for (var j = 0; j < propertyValue.length; j++) {
                        if ($.trim($this.find('td').eq(0).text()) == propertyValue[j]) {
                            if (propertyFiles[j] != "") {
                                picLocath = propertyFiles[j];
                                //自定义图片是网络地址的，不需要加安装目录
                                //update by yulq 2014-03-20
                                if (picLocath.indexOf("http://") >= 0) {
                                    startIndex = picLocath.indexOf("http://");
                                    picLocath = picLocath.substring(startIndex, picLocath.length);
                                }
                                $this.find('img')[0].src = picLocath;
                                $this.find('img')[0].name = picLocath;
                            }
                        }
                    }
                });
            });
            try { pName = decodeURIComponent(customProperty[i].propertyName); } catch (e) { pName = customProperty[i].propertyName; }

            if (pName == "*价格*" || pName == "*目录*") {
                var hiddenField;

                if (pName == "*价格*") {
                    hiddenField = $id("J_ProductPrice");
                }
                else if (pName == "*目录*") {
                    hiddenField = $id("J_CurrentDomainDirectory");
                }

                if (hiddenField) {
                    hiddenField.value = arrValue[0] || "";
                }
            }
            else {
                for (var j = 0; j < arrValue.length; j++) {
                    var val = "";
                    try {
                        var newAndOldValue = arrValue[j].split("?");
                        val = decodeURIComponent(newAndOldValue[0]);
                    } catch (e) { val = arrValue[j]; }
                    value.push("<span class='propValue'>" + val + "</span>");
                }

                htmlToAppend.push("<li class='li_PropRows'><dl><dt><a class='delRow' href='javascript:;' title='点击删除整行'><img class='del' src='../images/close.png' /></a><span class='propTitle'>");
                htmlToAppend.push(pName);
                htmlToAppend.push(":</span></dt><dd>");
                htmlToAppend.push(value.join(""));
                htmlToAppend.push("</dd></dl></li>");
            }
        }
        $("#J_PaipaiProperty").append(htmlToAppend.join(""));

        //绑定删除事件
        $("#J_PaipaiProperty a.delRow").unbind("click").bind("click", function() {
            var $this = $(this),
                        $li = $this.parents("li.li_PropRows"),
                        title = $li.find("span.propTitle").text().replace(":", "");
            if (window.confirm("您确定要删除属性“" + title + "”吗？删除后不可恢复")) {
                $li.remove();
                $("#PaiPaiEditAll").parent("li").toggle($("#J_PaipaiProperty .li_PropRows").length > 0);
                modifyPaiPaiCustomProperty();
            }
        });
        $("#PaiPaiEditAll").parent("li").toggle($("#J_PaipaiProperty .li_PropRows").length > 0);

        modifyPaiPaiCustomProperty();
    };

    function InitPaipaiSellPropertyValue(prop) {
        $sellPropValue = $("#tbPaipaiSellPropertyDetail").find("tr.trSellProp");
        var sellPropList = jsonToAttr(prop);
        $.each(sellPropList, function(i) {
            $sellPropValue.each(function() {
                var $this = $(this);
                if ($this.find('input.shopCode').attr("id").replace("_0", "").replace(/\\/g, '%5C') == sellPropList[i].sellProInfos.replace(/\s+/g, " ")) {
                    $this.find('input.price').val(sellPropList[i].price);
                    $this.find('input.quantity').val(sellPropList[i].nums);
                    $this.find('input.shopCode').val(sellPropList[i].code);
                    $this.find('input.remark').val(sellPropList[i].remark);
                    return false;
                }
            })
        });
        var prices = getSellPropMaxPrice();
        var minprice = "0";
        if (prices.length > 0) {
            minprice = prices.split('|')[0];
        }
        $sellPropValue.each(function() {
            var $this = $(this);
            if ($this.find('input.price').val() == "0" || $this.find('input.price').val() == "0.00") {
                $this.find('input.price').val(minprice);
            }
        });
        //初始化结束后执行的回调函数
        initedSellPropertyCallback("paipai");
    }

    //初始化拍拍自定义属性值
    window.initialPaipaiPropertyValue = function(prop) {

        if (!prop) return;
        var sellPropList = jsonToAttr(prop),
            $sellProperty = $("#tbPaipaiSellPropertyDetail").find("tr.trSellProp");
        if (sellPropList.length > 0) {
            var containsSize = false;
            var sellInfos = sellPropList[0].sellProInfos.replace(/\s+/g, " ");
            var sellPropInfos = sellPropList[0].sellProInfos.replace(/\s+/g, " ").split('|');
            var firstName = $.trim($("#tbPaipaiSellProperty tbody tr:eq(0)").find('td').eq(0).text().replace("*", "").replace(":", ""));
            var secondName = "";
            if ($("#tbPaipaiSellProperty").get(0).rows.length > 2) {
                secondName = $.trim($("#tbPaipaiSellProperty").get(0).rows[2].cells[0].innerText.replace("*", "").replace(":", ""));
            }
            if (sellPropInfos.length > 1) {
                if (firstName == sellPropInfos[1].split(':')[2] && (secondName == "自定义项" || secondName == sellPropInfos[0].split(':')[2])) {
                    containsSize = true;
                }
            }

        }
        $('#tbPaipaiSellPropertyDetail tr').each(function() {
            $this = $(this);
            var trId = $this.attr('id');
            if (trId.trim() != "") {
                $.each(sellPropList, function(i) {
                    var saleAttr = sellPropList[i].saleAttr.replace(/\s+/g, " ").split("|");
                    var saleId = "";


                    $.each(saleAttr, function(i) {
                        if (containsSize && i == 1) {
                            saleId = saleAttr[i].split(":")[1].split("?")[0] + "_" + saleId;
                        }
                        else {
                            saleId += saleAttr[i].split(":")[1].split("?")[0] + "_";
                        }
                    });
                    saleId = saleId.rtrim('_');
                    if (trId == saleId && trId.indexOf('c') == -1) {
                        $this.find('input.price').val(sellPropList[i].price);
                        $this.find('input.quantity').val(sellPropList[i].nums);
                        $this.find('input.shopCode').val(sellPropList[i].code);
                        $this.find('input.remark').val(sellPropList[i].remark);
                        sellPropList.splice(i, 1);
                        return false;
                    }
                    else if (trId.indexOf('c') != -1) {
                        var newtrId = "";
                        var valueIds = trId.split('_');
                        $.each(valueIds, function(i) {
                            if (valueIds[i].indexOf('c') != -1) {
                                var valueId = 752 + parseInt(valueIds[i].substr(1));
                                newtrId += valueId + "_";
                            }
                            else {
                                newtrId += valueIds[i] + "_";
                            }
                        });
                        if (newtrId.rtrim('_') == saleId) {
                            $this.find('input.price').val(sellPropList[i].price);
                            $this.find('input.quantity').val(sellPropList[i].nums);
                            $this.find('input.shopCode').val(sellPropList[i].code);
                            $this.find('input.remark').val(sellPropList[i].remark);
                            sellPropList.splice(i, 1);
                            return false;
                        }
                    }
                });
            }
        });
        //初始化结束后执行的回调函数
        initedSellPropertyCallback("paipai");
    };


    //拍拍添加自定义属性
    window.paipaiAddProperty = function() {
        var $addProp = $("#J_PaipaiAddProp"),
            $editProp = $("#J_PaipaiEditProp"),
            $stockArea = $("#J_PaipaiStockArea");

        //显示拍拍添加一行，隐藏自定义属性输入框
        $addProp.hide();
        $editProp.show();
        $stockArea.css("border", "2px solid #F0E401");

        //添加文本框
        var cnt = "<dl><dt><input class='newTitle' type='text' />:&nbsp;&nbsp;</dt><dd><input class='newValue' type='text' /><input class='newValue' type='text' /><input class='newValue' type='text' /><input class='newValue' type='text' /><input class='newValue' type='text' /><input class='newValue' type='text' /><input class='newValue' type='text' /><input class='newValue' type='text' /><input class='newValue' type='text' /><input class='newValue' type='text' /><button class='moreRow' type='button' title='添加更多'>+</button></dd></dl>";
        $("#li_NewRow").empty().append(cnt);
        $("#li_NewRow").find("input.newTitle").focus();

        //添加、取消、更多 点击事件
        $("#li_NewRow button.moreRow").unbind("click").bind("click", function() {
            var $this = $(this),
                cnt = "<input class='newValue' type='text' /><input class='newValue' type='text' /><input class='newValue' type='text' /><input class='newValue' type='text' /><input class='newValue' type='text' /><input class='newValue' type='text' /><input class='newValue' type='text' /><input class='newValue' type='text' /><input class='newValue' type='text' /><input class='newValue' type='text' />";
            $this.after(cnt);
            $this.parent("dd").children("input:text").eq(10).focus();
            $this.hide();
        });

        $("#J_PaipaiAddRow").unbind("click").bind("click", function() {
            //没有填写属性和属性值，直接关闭
            if (!$("#li_NewRow").find("input.newTitle").val() && !$("#li_NewRow").find("input.newValue[value!='']").length) {
                $("#J_PaipaiCancelAddRow").click();
            }
            else {
                paipaiAddNewRow(); //创建自定义属性行
            }
        });

        $("#J_PaipaiCancelAddRow").unbind("click").bind("click", function() {
            //隐藏拍拍添加一行，显示自定义属性输入框
            $editProp.hide();
            $addProp.show();
            $stockArea.css("border", "2px solid #ECECEC");
        });

        //匹配库存配置中点击确定按钮 添加新属性
        function paipaiAddNewRow() {
            var propError = checkPaiPaiCustomProperty("add"), //验证自定义属性
                $addProp = $("#J_PaipaiAddProp"),
                $editProp = $("#J_PaipaiEditProp"),
                $stockArea = $("#J_PaipaiStockArea");

            if (propError.length == 0) {
                //添加属性
                var newTitle = $("#li_NewRow input.newTitle").val(),
                    str = "<li class='li_PropRows'><dl><dt><a class='delRow' href='javascript:;' title='点击删除整行'><img class='del' src='../images/close.png' /></a><span class='propTitle'>" + newTitle + ":</span></dt><dd>";
                $("#li_NewRow input.newValue").each(function() {
                    var newValue = this.value;
                    if (newValue) {
                        str += "<span class='propValue'>" + newValue + "</span>";
                    }
                });
                str += "</dd></li>"
                $("#J_PaipaiProperty").append(str);
                //绑定删除事件
                $("#J_PaipaiProperty .delRow").unbind("click").bind("click", function() {
                    var $this = $(this),
                        $li = $this.parents("li.li_PropRows"),
                        title = $li.find("span.propTitle").text().replace(":", "");
                    if (window.confirm("您确定要删除属性“" + title + "”吗？删除后不可恢复")) {
                        $li.remove();
                        $("#PaiPaiEditAll").parent("li").toggle($("#J_PaipaiProperty .li_PropRows").length > 0);
                        modifyPaiPaiCustomProperty();
                    }
                });
                //隐藏拍拍添加一行，显示自定义属性输入框
                $editProp.hide();
                $addProp.show();
                $stockArea.css("border", "2px solid #ECECEC");
                //修改库存配置
                modifyPaiPaiCustomProperty();
            }
            else {
                var errorMsg = "甩手掌柜提示您：\n\n";
                for (var i = 0; i < propError.length; i++) {
                    errorMsg += (i + 1) + "： " + propError[i] + "\n";
                }
                alert(errorMsg);
            }
            $("#PaiPaiEditAll").parent("li").toggle($("#J_PaipaiProperty .li_PropRows").length > 0);
        }
    };

    var cusomerCount = 0;
    window.paipaiAddNewColor = function(link) {
        if (cusomerCount >= 24) {
            alert("最多只允许添加24个自定义颜色！");
            return;
        }
        var sellDetail = getPaiPaiCustomPropertyContent();
        cusomerCount = cusomerCount + 1;
        var $this = $(link);
        var id = link.parentElement.children[1].children[0].children[0].children[1].id;
        var name = link.parentElement.children[1].children[0].children[0].children[0].name;
        var parentElement = link.parentElement.children[1];
        var htmlStr = "";
        if (link.parentElement.children[0].innerHTML.trim().indexOf('其他') == -1) {
            var htmlStr = "<li class='Other'>";
        }
        else {
            var htmlStr = "<li style='clear:none;display:inline;float:left;width:20%'>";
        }
        htmlStr += "<label style='margin-left:0px;'><input type='checkbox' onclick='removethis(this)' checked='true' isbaseproprety='false' sellpropvalue='753' id='";
        htmlStr += id + "_c" + cusomerCount + "' name='" + name + "' value='" + "c" + cusomerCount + "'/><input id='";
        htmlStr += id + "' type='text' onfocus='saveCurrentName(this)' onblur='changePropertyName(this)'  style='width:60px;' dvalue='自定义颜色" + cusomerCount + "' value='自定义颜色" + cusomerCount + "'/></label></li>";
        $(parentElement).append(htmlStr);
        ShowColorPicEditTable($('#' + id + '_c' + cusomerCount));
        buildPaipaiSellProperty();
        InitPaipaiSellPropertyValue(sellDetail);
    }

    window.paipaiEditSize = function(dom) {
        var sellDetail = getPaiPaiCustomPropertyContent();

        ChangeInputType(dom);
        //显示库存编辑表格
        buildPaipaiSellProperty();

        InitPaipaiSellPropertyValue(sellDetail);
    }

    window.removethis = function(dom) {
        var sellDetail = getPaiPaiCustomPropertyContent();
        if (!dom.checked) {
            dom.parentElement.parentElement.parentElement.removeChild(dom.parentElement.parentElement);
            cusomerCount = cusomerCount - 1;
        }
        buildPaipaiSellProperty();
        InitPaipaiSellPropertyValue(sellDetail);
    }

    window.changePropertyName = function(dom) {
        var $textbox = $(dom);
        var colorColNumber = -1;
        var sizeColNumber = -1;
        var customColNumber = -1;
        var currentColNumber = -1;
        $('#tbPaipaiSellPropertyDetail tr th').each(function() {
            var $this = $(this);
            if ($.trim($this[0].innerHTML) == "颜色&nbsp;") {
                colorColNumber = $this[0].cellIndex;
            }
            else if ($.trim($this[0].innerHTML).indexOf("颜色") == -1 && $.trim($this[0].innerHTML).indexOf("自定义项") == -1) {
                sizeColNumber = $this[0].cellIndex;
            }
            else if ($.trim($this[0].innerHTML).indexOf("自定义项") == -1) {
                customColNumber = $this[0].cellIndex;
                return false;
            }
        })
        var title = $.trim(dom.parentElement.parentElement.parentElement.parentElement.children[0].innerHTML);
        var tabletd = null;
        if (title.indexOf("色系") != -1 || title.indexOf("其他") != -1) {
            tabletd = '#tbPaipaiSellPropertyDetail tr'; //; td:eq(' + colorColNumber + ')';
            currentColNumber = colorColNumber;
        }
        else if (title.indexOf("自定义项") != -1) {
            tabletd = '#tbPaipaiSellPropertyDetail tr'; // td:eq(' + customColNumber + ')';
            currentColNumber = customColNumber;
        }
        else {
            tabletd = '#tbPaipaiSellPropertyDetail tr'; // td:eq(' + sizeColNumber + ')';
            currentColNumber = sizeColNumber;
        }
        var text = currentName; //$textbox[0].defaultValue
        $(tabletd).each(function(i) {
            var $this = $(this);
            if ($.trim($this.find('td').eq(currentColNumber).text()) == text) {
                $this.find('td').eq(currentColNumber).text($textbox.val());
            }
        });
        $('#J_ppCustomColor tbody tr').each(function() {
            $this = $(this);
            if ($.trim($this.find('td').eq(0).text()) == text) {
                $this.find('td').eq(0).text($textbox.val());
            }
        });
    }
    var currentName = "";
    window.saveCurrentName = function(dom) {
        currentName = $(dom).val();
    }

    function CheckColor(dom) {
        //        $('#tbPaipaiSellProperty').find("input[type='checkbox']").each(function() {
        //            var $this = $(this);
        //            if ($this.nextAll('input')[0].defaultValue != $(dom)[0].defaultValue && $this.nextAll('input').val() == $(dom).val()) {
        //                alert('该名称已经存在，请修改名称');
        //                return false;
        //            }
        //        });
    }

    window.editColor = function(dom) {
        var sellDetail = getPaiPaiCustomPropertyContent();
        ChangeInputType(dom);
        //显示颜色上传图片的表格
        ShowColorPicEditTable(dom);
        //显示库存编辑表格
        buildPaipaiSellProperty();
        InitPaipaiSellPropertyValue(sellDetail);
    }

    function ShowColorPicEditTable(dom) {
        var $this = $(dom);
        var id = null;
        if ($this.attr("sellpropvalue").replace(":", "\\:") != "753") {
            id = $this.attr("sellpropvalue").replace(":", "\\:");
        }
        else {
            id = 752 + cusomerCount;
        }
        var checked = dom.checked;
        $chkBox = $("#" + id);
        $chkBox.toggle(checked);
        $chkBox.children()[0].innerText = $(dom).nextAll('input').val();
        var hasCusColor = $("#J_tbCustomColor").find("tr.trTbCustomColor:visible").length > 0;
        $('#J_tbCustomColor thead tr').toggle(hasCusColor);
    }

    function ChangeInputType(dom) {
        var $this = $(dom);
        var $txtBox = $this.siblings("input:text");
        var checked = dom.checked;
        $txtBox.toggleClass("textBoxNoBorder", !checked);
        if (checked) {
            $txtBox.removeAttr("disabled").focus();
        }
        else {
            $txtBox.attr("value", $txtBox[0].defaultValue);
            $txtBox.attr("disabled", "disabled");
        }
    }

    function buildPaipaiSellProperty() {
        var strToWrite = [],
            arrPropValue = [],
            arrPropTitle = [],
            $sellProp = $("#tbPaipaiSellProperty").find("tr.tbSellProperty"); //销售属性行tr

        //遍历每行销售属性
        $sellProp.each(function() {
            var $this = $(this),
                $childTd = $this.children("td"),
                $propTitle = $childTd.eq(0),
                $propValue = $this.children("td.tdPropValue"),
                $checked = $propValue.find("input:checked"),
                id = this.id,
                strNameValuePair = "";

            if ($checked.length) {
                arrPropTitle.push($propTitle.text()); //属性名
            }

            //遍历属性值
            $checked.each(function() {
                var value = this.value,
                    chkId = this.id,
                    nextSibling = this.nextSibling.nodeType != "3" ? this.nextSibling : this.nextSibling.nextSibling,
                    name = "",
                    childId = $(this).attr("childId"),
                    $customColor = $("#prop_" + childId);
                var hasChildProperty = $(this).hasClass("hasChildProperty");
                if (!hasChildProperty) {
                    if (childId && $customColor.length) {
                        name = $customColor.val();
                    }
                    if (!name) {
                        name = nextSibling.innerHTML ||
                            (nextSibling.value ?
                            nextSibling.value : $(nextSibling).attr("dvalue"));
                    }

                    strNameValuePair += name + "^" + value + "(分*隔)";
                }
            });

            if (strNameValuePair.lastIndexOf('(分*隔)') == (strNameValuePair.length - 5)) {
                strNameValuePair = strNameValuePair.substring(0, strNameValuePair.length - 5);
            }
            if (strNameValuePair) {
                arrPropValue.push(strNameValuePair);
            }
        });

        //构建销售属性表格
        if (arrPropValue.length > 0) {
            var arrSellProp = getTaobaoModelList(arrPropValue),
                hasHead = false,
                head = "",
                arrHead = [],
                defaultPrice = $id("J_ProductPrice").value || "0.00";

            //拼接表格内容
            for (var i = 0; i < arrSellProp.length; i++) {
                var idPrefix = "",
                    value = "",
                    prop = arrSellProp[i].split("(分*隔)");

                for (var j = 0; j < prop.length; j++) {
                    var nameAndId = prop[j].split("^");
                    value += ("<td>" + nameAndId[0] + "</td>");

                    if (j != prop.length - 1) {
                        idPrefix += (nameAndId[1] + "_");
                    }
                    else {
                        idPrefix += nameAndId[1];
                    }
                }

                if (!hasHead) { //拼接表格头
                    arrHead.push("<tr>");
                    $.each(arrPropTitle, function() {
                        arrHead.push("<th nowrap='nowrap'>");
                        arrHead.push(this.replace(":", ""));
                        arrHead.push("</th>");
                    });
                    arrHead.push("<th nowrap='nowrap'>价格<input title='快速设置价格' class='textBoxSetSameValue' type='checkbox' stype='price' value='on'/></th><th nowrap='nowrap'>数量<input title='快速设置数量' class='textBoxSetSameValue' type='checkbox' stype='quantity' value='on'/></th><th nowrap='nowrap'>库存编码</th><th>备注</th></tr>");
                    head = arrHead.join("");
                    strToWrite.push(head);
                    hasHead = true;
                }

                var arrCnt = [];

                arrCnt.push("<tr class='trSellProp' id='");
                arrCnt.push(idPrefix);
                arrCnt.push("'>");
                arrCnt.push(value);
                arrCnt.push("<td><input type='text' class='textBox price noChineseTextBox digitAndDotOnlyTextBox' id='p_");
                arrCnt.push(idPrefix);
                arrCnt.push("' value='");
                arrCnt.push(defaultPrice);
                arrCnt.push("' maxlength='10' /></td><td><input type='text' class='textBox quantity noChineseTextBox digitOnlyTextBox' id='q_");
                arrCnt.push(idPrefix);
                arrCnt.push("' value='0' maxlength='5' /></td><td><input type='text' class='textBox shopCode' id='tsc_");
                arrCnt.push(idPrefix);
                arrCnt.push("' maxlength='30' /></td><td><input type='text' class='textBox remark' id='remark_");
                arrCnt.push(idPrefix);
                arrCnt.push("' maxlength='60' /></td><td><input type='text' class='textBox skuOnlineKey' style='display:none' id='skuOnlineKey_");
                arrCnt.push(idPrefix);
                arrCnt.push("' maxlength='15' /></td></tr>");
                strToWrite.push(arrCnt.join(""));

            }

            //插入到HTML中
            $("#J_ppSellProWrap").empty();

            var domSellPropWrap = $("#J_ppSellProWrap").get(0);
            if (domSellPropWrap) {
                domSellPropWrap.innerHTML = "<table id='tbPaipaiSellPropertyDetail' cellpadding='0' cellspacing='0'>" + strToWrite.join("") + "</table>";
            }
            //加上 快速设置价格、数量 的提示
            if ($("#J_Tips").length) {
                $("#J_Tips").remove();
            }
            if (window.showSetSameValTip) {
                $("#J_ppSellProWrap").prepend("<div id='J_Tips' class='tips'>点击复选框可将价格或数量设置成与第一行相同<span></span><a title='不再提示' href='javascript:;' onfocus='this.blur();'>×</a></J_ppSellProWrap>");

                $("#J_Tips a").click(function() {
                    $(this).parents(".tips").find("span").fadeOut().end()
						   .fadeOut("normal", function() { $(this).remove() });
                    window.showSetSameValTip = false;
                });
            }
        }
        else {
            $("#J_ppSellProWrap").empty();
        }
    }

    //编辑现有属性
    window.paipaiEditProperty = function() {
        $("#J_PaipaiProperty").find("li.li_PropRows").each(function() {
            var $this = $(this),
                propTitle = $this.find("span.propTitle").text().replace(":", ""),
                propValues = "",
                count = 0,
                expandAllTextBox = false;

            $this.find("span.propValue").each(function() {
                count++;
                propValues += "<input type='text' class='editPropValue' value='" + $(this).text() + "' />";
            });
            expandAllTextBox = count > 10;
            var tbCount = expandAllTextBox ? 20 : 10;
            for (var i = count + 1; i <= tbCount; i++) {
                propValues += "<input type='text' class='editPropValue' />";
            }
            if (!expandAllTextBox) {
                propValues += "<button class='moreRow' type='button' title='添加更多'>+</button>";
            }
            var str = "<li class='li_PropEditRows'><dl><dt><input type='text' class='editPropTitle' value='" + propTitle + "' />:&nbsp;&nbsp;</dt><dd>" + propValues + "</dd></li>";
            $("#J_PaipaiProperty").append(str);
        });
        $("#J_PaipaiProperty").append("<li class='li_editBtn'><button id='J_editOk' type='button'>确定编辑</button> <button id='J_editCancel' type='button'>取消编辑</button></li>");

        //添加、取消、更多 点击事件
        $("#J_PaipaiProperty .moreRow").unbind("click").bind("click", function() {
            var $this = $(this),
                cnt = "<input class='editPropValue' type='text' /><input class='editPropValue' type='text' /><input class='editPropValue' type='text' /><input class='editPropValue' type='text' /><input class='editPropValue' type='text' /><input class='editPropValue' type='text' /><input class='editPropValue' type='text' /><input class='editPropValue' type='text' /><input class='editPropValue' type='text' /><input class='editPropValue' type='text' />";
            $this.parent("dd").children("input:text").eq(10).focus();
            $this.after(cnt);
            $this.hide();
        });

        //确定编辑
        $("#J_editOk").unbind("click").bind("click", function() {
            var propError = checkPaiPaiCustomProperty("edit"); //验证自定义属性

            if (propError.length == 0) {
                var $lists = $("#J_PaipaiProperty li.li_PropEditRows"),
                    $olists = $("#J_PaipaiProperty li.li_PropRows");

                $lists.each(function(i) {
                    var $this = $(this),
                        title = $this.find("input.editPropTitle").val(), //属性
                        arrPropVal = [],
                        needToDel = [], //属性值
                        $nthLi = $olists.eq(i);

                    //给对应的span赋值
                    $nthLi.find("span.propTitle").text(title + ":");
                    $this.find("input.editPropValue").each(function(j) {
                        var $valueInput = $(this),
                            $nthLiValue = $nthLi.find("span.propValue:eq(" + j + ")"),
                            value = this.value;

                        if ($nthLiValue.length) {
                            if (value) {
                                $nthLiValue.text(value);
                            }
                            else {
                                needToDel.push(j);
                            }
                        }
                        else {
                            if (value) {
                                arrPropVal.push("<span class='propValue'>");
                                arrPropVal.push(value);
                                arrPropVal.push("</span>");
                            }
                        }
                    });
                    $nthLi.find("dd").append(arrPropVal.join(""));
                    for (var k = needToDel.length - 1; k >= 0; k--) {
                        $nthLi.find("span.propValue:eq(" + needToDel[k] + ")").remove();
                    }
                });
                //关闭编辑状态
                editCancel();
                //修改库存配置
                modifyPaiPaiCustomProperty();
            }
            else {
                var errorMsg = "甩手掌柜提示您：\n\n";
                for (var i = 0; i < propError.length; i++) {
                    errorMsg += (i + 1) + "： " + propError[i] + "\n";
                }
                alert(errorMsg);
            }
            $("#PaiPaiEditAll").parent("li").toggle($("#J_PaipaiProperty li.li_PropRows").length > 0);
        });

        //取消编辑
        $("#J_editCancel").unbind("click").bind("click", function() {
            editCancel();
        });

        //隐藏展示的属性，以及添加一行、编辑按钮
        $("#J_PaipaiProperty li.li_PropRows").hide();
        $("#J_PaipaiAddProp").hide();

        //关闭编辑状态
        function editCancel() {
            $("#J_PaipaiProperty > li.li_PropEditRows").remove();
            $("#J_PaipaiProperty > li.li_editBtn").remove();

            //显示添加一行、属性
            $("#J_PaipaiProperty > li.li_PropRows").show();
            $("#J_PaipaiAddProp").show();
        }
    };

    //验证拍拍销售属性
    window.checkPaipaiSellProperty = function(clientPrice) {
        var checkNotNull = checkSellProperty();
        if (checkNotNull) {
            return checkNotNull;
        }

        var sellPropError = "",
            sellProCount = 0,
            sellProCheckedCount = 0;

        var $sellPropTr = $("#tbPaipaiSellPropertyDetail").find("tr.trSellProp"),
            hasFillSellPropFlag = false,
            arrPrice = [],
            totalNum = 0;

        if ($sellPropTr.length) {
            $sellPropTr.each(function() {
                var $this = $(this),
                    price = $this.find("input.price").val(),
                    num = $this.find("input.quantity").val();

                totalNum = totalNum + parseInt(num);

                if (parseFloat(price) < 0.1) {
                    arrPrice.push(parseFloat(price));
                    hasFillSellPropFlag = true;
                }
            });

            arrPrice.sort(sortNumber);
            if (hasFillSellPropFlag) {
                sellPropError = "拍拍库存配置中所有配置项的价格都必须大于等于0.1";
            }
            else if (totalNum <= 0) {
                sellPropError = "拍拍库存配置中至少一个配置项的数量必须大于0";
            }
            else {
                if (parseFloat(clientPrice) > parseFloat(arrPrice[arrPrice.length - 1]) || parseFloat(clientPrice) < parseFloat(arrPrice[0])) {
                    sellPropError = "商品基本信息页签中的价格必须介于库存配置价格的最大值和最小值之间";
                }
            }

            //保存的时候再次进行验证
            //var paipaiStockCheck = checkPaiPaiCustomProperty("add", true);
            //            if (paipaiStockCheck) {
            //                sellPropError = paipaiStockCheck.join(",");
            //            }
        }
        if (sellPropError.length <= 0) {
            var ColorNames = "";
            $('#tbPaipaiSellProperty').find("input[type='checkbox']:checked").each(function() {
                var $this = $(this);
                $('#tbPaipaiSellProperty').find("input[type='checkbox']:checked").each(function() {
                    var $current = $(this);
                    if ($current.attr('id') != $this.attr('id') && $current.nextAll('input').val() == $this.nextAll('input').val()) {
                        if (ColorNames.indexOf($current.nextAll('input').val() + ",") == -1) {
                            ColorNames += $current.nextAll('input').val() + ",";
                        }
                    }
                });
            });
            if (ColorNames.length > 0) {
                var errMsg = "输入的以下拍拍属性名称出现重复：" + ColorNames.rtrim(',') + ",请修改名称";
                sellPropError = errMsg;
            }
        }
        return sellPropError;
    };

    //获取JSON格式的拍拍销售属性checkbox
    window.getPaiPaiSellProperty = function() {

        var jsonBasic = "[",
            retId = "",
            retName = "",
            retNewName = "",
            retValue = "",
        // isBaseProprety = "";这参数暂时不用delete chenyq
        $inputs = $("#tbPaipaiSellProperty").find("input:checked"),
        $textInputs = $("#tbPaipaiSellProperty").find("input:text");
        $selectInputs = $("#tbPaipaiSellProperty").find("select");

        //销售属性CheckBox
        $inputs.each(function() {
            var $this = $(this),
                id = this.id,
                value = this.value;

            if (this.checked) {
                retId = this.name.replace("cp_", "");
                retName = $this.nextAll("input")[0].defaultValue;
                retNewName = $this.nextAll("input").val();
                retValue = "";
                retValue = $this.attr("value");
                //isBaseProprety = $this.attr("isBaseProprety");
            }

            jsonBasic = jsonBasic + "{\"propertyId\":\"" + retId + "\",\"propertyName\":\"" + encodeSpecialChars(retName)
             + "\",\"newpropertyName\":\"" + encodeSpecialChars(retNewName) + "\",\"propertyValue\":\"" + encodeSpecialChars(retValue) + "\"},";

        });
        if (jsonBasic.length > 1) {
            jsonBasic = jsonBasic.rtrim(",") + "]";
        }
        else {
            jsonBasic = "";
        }

        return jsonBasic;
    };

    //清除页面上自定义颜色，取消已经勾选的颜色尺码自定义项等
    window.clearCusomColor = function() {
        cusomerCount = 0;
        $('#tbPaipaiSellProperty :checkbox').each(function() {
            if ($(this).attr('checked') == true) {
                $(this).attr('checked', false);
            }
            if ($(this).attr('id').indexOf('c') != -1) {
                $(this).parent().parent().remove();
            }
        });
    }

    //获取拍拍自定义属性，保存在sp_customProperty表中
    //返回customPropertyName1|customPropertyName2
    window.getPaiPaiCustomProperty = function() {

        if (!$id("J_PaiPaiStock").checked) { //没有开启库存配置的话，清空属性
            return "";
        }
        var retProperty = "";
        var colorName = "";
        $('#tbPaipaiSellProperty tr.tbSellProperty').each(function() {
            $this = $(this);
            if ($this.find('input:checked').length) {
                var titleName = $this.find('td').eq(0).text();
                colorName = titleName.trim().replace(':', '');
                retProperty += colorName.trim() + "|";
            }

        });
        retProperty = retProperty.rtrim("\\|");
        return retProperty;
    };

    //获取拍拍自定义属性值，保存在sp_customPropertyValue表中
    //返回name,value的json
    window.getPaiPaiCustomPropertyValue = function() {

        var json = "";
        var colorId = "";
        var colorName = "";
        var picFile = "";
        $('#tbPaipaiSellProperty tr.tbSellProperty').each(function() {
            $this = $(this);
            if ($this.find('input:checked').length) {
                var titleName = $this.find('td').eq(0).text();
                colorName = titleName.trim().replace(':', '');
                $($this.find('input:checked')).each(function() {
                    var value = $(this).attr('savevalue');
                    picFile = $("img[class='customPic'][parentId='" + value + "']").attr("src");
                    if (!picFile) {
                        picFile = "";
                    }
                    json = json + "{\"custompropertyName\":\"" + colorName.trim() + "\",\"propertyName\":\"" + $(this).nextAll('input').attr('defaultValue') + "\",\"propertyValue\":\"" + $(this).attr('defaultValue') + "\",\"newpropertyName\":\"" + $(this).nextAll('input').val() + "\",\"picFile\":\"" + encodeSpecialChars(picFile) + "\"},";

                });
            }
        });

        json = json.rtrim(",");
        if (json.length) {
            json = "[" + json + "]";
        }

        return json;
    };
    //获取拍拍获取销售属性内容，保存在sp_sellProperty中
    //返回包含sellProInfos,price,nums,code的json
    window.getPaiPaiCustomPropertyContent = function() {
        var json = "",
            sellProInfos = "",
            price = "",
            nums = "",
            code = "",
            remark = "",
            $sellPropValue = $("#tbPaipaiSellPropertyDetail").find("tr.trSellProp");

        if ($sellPropValue.length > 0) {
            json = "[";

            $sellPropValue.each(function() {
                var $this = $(this);

                sellProInfos = $this.find("input.shopCode").attr("id").replace("_0", "").replace(/\\/g, '%5C');
                price = $this.find("input.price").val();
                nums = $this.find("input.quantity").val();
                code = $this.find("input.shopCode").val();
                remark = $this.find("input.remark").val();

                if (parseFloat(price) != 0)
                    json += "{\"sellProInfos\":\"" + encodeSpecialChars(sellProInfos) + "\",\"price\":\"" + price + "\",\"nums\":\"" + nums + "\",\"code\":\"" + encodeSpecialChars(code) + "\",\"remark\":\"" + encodeSpecialChars(remark) + "\"},";
            });

            if (json.length) {
                json = json.rtrim(",") + "]";
            }
        }

        return json;
    };

    //根据子商品主题返回子商品属性值
    window.showAmazonSubject = function(dom) {
        var $this = $(dom),
            value = dom.value,
            propertyId = dom.id.replace("prop_", ""),
            returnValue = "",
            $target = $("#" + propertyId + " option:selected"),
            $AmazonSubjectProperty = $("#AmazonSubjectProperty"),
            $AmazonPropertyArea = $("#AmazonSubjectProperty, #AmazonSellProp"),
            $fieldset = $("#AmazonSubjectProperty").parents("fieldset");

        if (value) {
            returnValue = window.external.ShowAmazonSubject(propertyId, value);

            $AmazonPropertyArea.empty();
            if (returnValue != "") {
                $fieldset.show();
                $AmazonSubjectProperty.append(returnValue);

                handlAmazonCustomProp();
            }
        }
        else {
            $fieldset.hide();
            $AmazonPropertyArea.empty();
        }
    };

    //初始化亚马逊子商品属性和销售属性
    window.initialAmazonSellProperty = function(prop, porpSellPro, isNoCode) {
        initialAmazonChildPrdProp(prop);

        createAmazonProperty();

        initialAmazonChildPrdPropValue(porpSellPro, isNoCode);

        //初始化完成，回填价格和数量
        fillBackSellProPriceAndNum("price");
        fillBackSellProPriceAndNum("quantity");
        fillHasSellProperty("amazon");
    };

    /*  
    *    验证亚马逊子商品，规则： 
    *    1、必须填写子商品中的数量和价格（至少填写一行）
    *    2、基本属性的价格不能大于或小于子商品中的最大值和最小值
    */
    window.checkAmazonChildProduct = function(clientPrice, clientNum) {
        var $sellPropTr = $("#AmazonSellPropTable").find("tr.tr_amazon_prop"),
            sellPropError = "",
            hasFillSellPropFlag = true,
            salePriceError = false,
            saleDateError = false,
            standardCodeError = false,
            standardCodeRegex = /(^[0-9]{8}$)|(^[0-9]{12,14}$)/,
            arrPrice = [];

        if ($sellPropTr.length) {
            $sellPropTr.each(function() {
                var $this = $(this),
                    price = $this.find("input.nomalPrice").val(),
                    num = $this.find("input.quantity").val(),
                    code = $this.find("input.standardCode").val(),
                    salePrice = $this.find("input.salePrice").val(),
                    saleBegin = $this.find("input.saleBegin").val().replace(/[\/]/g, "-"),
                    saleEnd = $this.find("input.saleEnd").val().replace(/[\/]/g, "-"),
                    date = new Date(),
                    year = date.getFullYear(),
                    month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1),
                    day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate(),
                    dateStr = year + "-" + month + "-" + day;

                //验证价格数量
                if (parseFloat(price) == 0) {
                    arrPrice.push(parseFloat(price));
                    hasFillSellPropFlag = false;
                }
                //验证特价信息
                if ((parseInt(salePrice) != 0 && (!saleBegin || !saleEnd)) || (parseInt(salePrice) == 0 && (saleBegin || saleEnd))) {
                    salePriceError = true;
                }
                else if (saleBegin && saleEnd && (saleBegin - saleEnd > 0 || saleBegin - dateStr < 0)) {
                    saleDateError = true;
                }
                //验证标准编码
                if (code && !standardCodeRegex.test(code)) {
                    standardCodeError = true;
                }
            });

            arrPrice.sort(sortNumber);

            if (!hasFillSellPropFlag) {
                sellPropError = "请填写子商品中的价格（子商品价格不能为0）";
            }
            else {
                if (parseFloat(clientPrice) > parseFloat(arrPrice[arrPrice.length - 1]) || parseFloat(clientPrice) < parseFloat(arrPrice[0])) {
                    sellPropError = "基本属性的价格不能大于或小于子商品中的最大值和最小值";
                }
                if (parseInt(clientNum) != parseInt(getSellPropTotalNum())) {
                    sellPropError += "&基本信息中的数量必须与子商品中数量总和相等";
                }
            }

            if (salePriceError) {
                sellPropError += "&特价、特价开始时间、特价结束时间必须填写完整";
            }
            if (saleDateError) {
                sellPropError += "&特价结束时间必须晚于特价开始时间，且特价开始时间必须大于等于当前时间";
            }
            if (standardCodeError) {
                sellPropError += "&子商品中的标准编码格式错误（请填写8位、12位、13位、14位数字）";
            }
        }

        return sellPropError;
    };
    //begin added by wangdm 2011-10-11
    //控制单选框所选中的数量
    window.amzonCheckedCountControl = function(dom) {
        var $this = $(dom);
        if ($this.attr("checked") == false) {
            return;
        } else {
            var $parent = $this.parents("tr");
            var maxNum = parseInt($parent.attr("maxNum"));
            if (maxNum) {
                var childCheckbox = $parent.find("input:checkbox");
                var checkedCount = 0;
                for (var i = 0; i < childCheckbox.length; i++) {
                    if (childCheckbox.eq(i).attr("checked") == true) {
                        checkedCount++;
                    }
                }
                if (checkedCount > maxNum) {
                    $this.attr("checked", false);
                    alert("选择的数量不能超过" + maxNum + "个");
                }
            }
        }
    }
    //end added by wangdm 2011-10-11

    //添加一个文本框
    window.amzonAddMoreTxtbox = function(dom) {
        var $this = $(dom),
            $parent = $this.parent("div"),
            isBasic = $id("tbBaisc");

        //begin added by wangdm 2011-10-11
        var maxNum = parseInt($parent.attr("maxNum"));
        if (maxNum) {
            var childTextbox = $parent.children("input:text");
            if (childTextbox.length == maxNum) {
                alert("文本框数量不能超过" + maxNum + "个");
                return;
            }
        }
        //end added by wangdm 2011-10-11

        $parent.children("a.moreTxtbox").remove();
        if (isBasic) {
            $parent.append("<input type='text' class='amazonTxtBox' /></br><a class='moreTxtbox' href='javascript:;' onclick='amzonAddMoreTxtbox(this);'>添加一个</a>");
        }
        else if ($parent.attr("signType")) {
            $parent.append("<input type='text' class='amazonTxtBox textBoxNoBorder' signType='chkBox' maxlength='50' /><a href='javascript:;' class='moreTxtbox' onclick='amzonAddMoreTxtbox(this);'>添加一个</a>");
        }
        else {

            $parent.append("<input type='text' class='amazonTxtBox textBoxNoBorder' maxlength='50' /><a class='moreTxtbox' href='javascript:;' onclick='amzonAddMoreTxtbox(this);'>添加一个</a>");
        }
        $("#AmazonSubjectProperty input:text").unbind("blur").bind("blur", function(e) {
            if ($(this).attr("signType")) {
                var dom = e.target;
                var value = dom.value;
                var $inputs = $(this).parents("dl").find("dt.AmazonPropTitle, input:text[value!='']");

                $inputs.each(function() {
                    var val = $(this).val() || $(this).text();
                    if ($(this)[0] != dom && val == value) {
                        $(dom).val("");
                        alert("属性值不能有重复，且不能与属性名相同");
                        dom.select();
                        return;
                    }
                });

                //取值
                var porpSellPro = getAmazonChildItem();
                //改变表格
                createAmazonProperty();
                //赋值
                initialAmazonChildPrdPropValue(porpSellPro, false);
                //回填价格数量
                fillBackSellProPriceAndNum("price");
                fillBackSellProPriceAndNum("quantity");
            }
            else {
                amazonCustomTextBoxChange(e.target);
            }
        });
    };

    //获取亚马逊子商品属性
    window.getAmazonBasicProperty = function() {
        var json = "[",
            retId = "",
            retName = "",
            retValue = "";

        $("#AmazonChildItemArea div.AmazonSubItem,#AmazonSubjectProperty").find("select,input:checked,input[type=text]:not(:disabled)").each(function() {
            if ($(this).is('select')) {
                var selectedText = $("#" + $(this).attr("id") + " option:selected").text();
                if (selectedText != "请选择") {
                    retId = $(this).attr("id").replace("prop_", "");
                    retName = selectedText;
                    retValue = this.value;

                    json = json + "{\"propertyId\":\"" + retId + "\",\"propertyName\":\"" + encodeSpecialChars(retName) + "\",\"propertyValue\":\"" + encodeSpecialChars(retValue) + "\"},";
                }
            }
            else if ($(this).is('input[type=checkbox]')) {
                if ($(this).attr("checked")) {
                    var arrId = $(this).attr("id").replace("prop_", "").split(":");
                    retId = arrId[0];
                    retName = retValue = this.value;

                    json = json + "{\"propertyId\":\"" + retId + "\",\"propertyName\":\"" + encodeSpecialChars(retName) + "\",\"propertyValue\":\"" + encodeSpecialChars(retValue) + "\"},";
                }
            }
            else if ($(this).is('input[type=text]')) {
                if (this.value != "" && this.value.length > 0) {
                    if ($(this).hasClass("amazonTxtBox")) {
                        retId = $(this).parent("div").attr("id").replace("prop_", "");
                        retName = retValue = this.value;
                    }
                    else {
                        retId = $(this).attr("id").replace("prop_", "");
                        retName = retValue = this.value || $(this).attr("dvalue");
                    }

                    json = json + "{\"propertyId\":\"" + retId + "\",\"propertyName\":\"" + encodeSpecialChars(retName) + "\",\"propertyValue\":\"" + encodeSpecialChars(retValue) + "\"},";
                }
            }
        });

        //整理Json
        if (json.length != 1) {
            json = json.substring(0, json.length - 1);
            json = json + "]";
        }
        else {
            json = json.replace("[", "")
        }

        return json;
    };

    //获取亚马逊子商品属性值
    window.getAmazonChildItem = function() {
        var json = "", sellProInfos = "", price = "", salePrice = '', saleBegin = '', saleEnd = '', nums = "", state = "", standardCode = '', itemCode = "", itemName = "",
            $tr = $("#AmazonSellPropTable .tr_amazon_prop");

        if ($tr.length) {
            json = "[";
            $tr.each(function() {
                var trs = $(this);
                sellProInfos = "",
                arrSellPropId = trs.find("input.nomalPrice").attr("id").replace("p_", "").split("_");

                $.each(arrSellPropId, function(i) {
                    sellProInfos += arrSellPropId[i] + ":" + trs.children(":eq(" + i + ")").text() + "|";
                });
                sellProInfos = sellProInfos.substring(0, sellProInfos.length - 1);

                price = trs.find("input.nomalPrice").val();
                salePrice = trs.find("input.salePrice").val();
                saleBegin = trs.find("input.saleBegin").val();
                saleEnd = trs.find("input.saleEnd").val();
                nums = trs.find("input.quantity").val();
                state = trs.find("input.itemCode").attr("state");
                standardCode = trs.find("input.standardCode").val().replace(/\\/g, '%5C').replace(/\"/g, "\\\"");
                itemCode = trs.find("input.itemCode").val().replace(/\\/g, '%5C').replace(/\"/g, "\\\"");
                itemName = trs.find("input.itemName").val().replace(/\\/g, '%5C').replace(/\"/g, "\\\"");
                pictures = trs.find("input.w_picture").attr("saveValue").replace(/\\/g, '%5C').replace(/\"/g, "\\\"");


                json = json + "{\"sellProInfos\":\"" + sellProInfos + "\",\"price\":\"" + price + "\",\"salePrice\":\"" + salePrice + "\",\"saleBegin\":\"" +
                      saleBegin + "\",\"saleEnd\":\"" + saleEnd + "\",\"nums\":\"" + nums + "\",\"standardCode\":\"" + standardCode + "\",\"state\":\"" +
                      state + "\",\"code\":\"" + itemCode + "\",\"name\":\"" + encodeSpecialChars(itemName) + "\",\"pictures\":\"" + pictures + "\"},";
            });
            json = json.substring(0, json.length - 1);
            json = json + "]";
        }

        return json;
    };

    /****************************************************************/
    /****************** 品聚公用函数，跟淘宝规则一样，只把id：tbSellProperty改为：tbPinjuSellProperty，J_tbSellProperty 改为J_tbPinjuSellProperty
    /*******************************把 淘宝：onkeyup='customPropChange(false, this)改为品聚：onkeyup='pinjuCustomPropChange(false, this)/
    /****************************************************************/
    //初始化基本属性或淘宝销售属性
    window.intialPinjuBasicProperty = function(prop) {
        if (!prop) return;
        var prdProperties = jsonToAttr(prop),
        //isInitSellProperty = $id("tbSellProperty") || $id("tbPaipaiSellProperty"),
        //update by ruanhh 2011-12-10
            isInitSellProperty = $id("tbSellProperty") || $id("tbPaipaiSellProperty") || $id("tbPinjuSellProperty"),
        //end
            $amazonMulTBox = null,
            amazonMulTboxId = 0,
            amazonMulTboxIndex = 0;

        for (var i = 0, propLen = prdProperties.length; i < propLen; i++) {
            var pId = decodeURIComponent(prdProperties[i].propertyId), //属性ID
                pName = "", //属性名
                pValue = ""; //属性值

            try { pName = decodeURIComponent(prdProperties[i].propertyName); } catch (e) { pName = prdProperties[i].propertyName }
            try { pValue = decodeURIComponent(prdProperties[i].propertyValue); } catch (e) { pValue = prdProperties[i].propertyValue }

            if (pId == "0") { //等于零，说明不是属性/属性值对，而是特殊用途的数据
                var hiddenField;

                if (pName == "*价格*") {
                    hiddenField = $id("J_ProductPrice");
                }
                else if (pName == "*目录*") {
                    hiddenField = $id("J_CurrentDomainDirectory");
                }

                if (hiddenField) {
                    hiddenField.value = pValue;
                }
            }
            else {
                var objId1 = "prop_" + pId + "_" + pValue,
                    objId2 = "prop_" + pId,
                    objDom = $id(objId2) || $id(objId1),
                    hasChildSelect = objDom ? objDom.getAttribute("hasChildSelect") == "true" : false, //是否有子属性
                    tagName = objDom ? objDom.tagName.toLowerCase() : ""; //元素类型

                //销售属性的ChceckBox，不能查找ID，而是sellPropValue字段
                if (isInitSellProperty) {
                    var $obj = $("input:checkbox[id^='prop_" + pId + "'][sellPropValue='" + pValue + "']");
                    if ($obj.length) {
                        objDom = $obj.get(0);
                        tagName = objDom ? objDom.tagName.toLowerCase() : "";
                    }
                    else {
                        $obj = $("input:text[id='prop_" + pId + "']");
                        if ($obj.length) {
                            objDom = $obj.get(0);
                            tagName = objDom ? objDom.tagName.toLowerCase() : "";
                        }
                        else {
                            $obj = $("select[id='prop_" + pId + "']");
                            if ($obj.length) {
                                objDom = $obj.get(0);
                                tagName = objDom ? objDom.tagName.toLowerCase() : "";
                            }
                        }
                    }
                }

                //如果对象存在
                if (objDom) {
                    if (tagName == "select") { //SELECT类型
                        objDom.value = pValue;

                        //如果有子属性，赋值时手动触发onchange事件
                        if (hasChildSelect) {
                            var option = objDom.options[objDom.selectedIndex - 1],
                                hasChildProperty = option ? option.className.indexOf("hasChildProperty") >= 0 : false;

                            if (hasChildProperty) {
								customFireEventChange(objDom);
                            } else {
                                customFireEventChange(objDom);
                            }
                        }
                    }
                    else if (tagName == "input") { //INPUT类型
                        var inputType = objDom.getAttribute("type") ? objDom.getAttribute("type").toLowerCase() : "";

                        if (inputType == "text") { //文本框
                            objDom.value = pValue == "" ? pName : pValue;
                        }
                        else if (inputType == "checkbox") { //销售属性
                            objDom.checked = true;
                            //taobaoCustomColorAndSizeHandler(objDom);
                            pinjuCustomColorAndSizeHandler(objDom);
                            //如果有子属性，赋值时手动触发onclick事件                              
                            var hasChildProperty = objDom ? objDom.className.indexOf("hasChildProperty") >= 0 : false;
                            if (hasChildProperty) {
                                customFireEventClick(objDom);
                            }
                            //taobaoCustomColorAndSizeHandler(objDom);
                            pinjuCustomColorAndSizeHandler(objDom);
                        }

                    }
                    else if (tagName == "td") { //复选框类型
                        objDom = $id(objId1);
                        if (objDom) {
                            objDom.checked = true;

                            var hasChildProperty = objDom ? objDom.className.indexOf("hasChildProperty") >= 0 : false;

                            //如果有子属性，赋值时手动触发onclick事件
                            if (hasChildProperty) {
                                customFireEventClick(objDom);
                            }
                        }
                    }
                    else if (tagName == "img") { //淘宝自定义图片
                        if (pValue) {
                            $(objDom).attr("src", $id("J_CurrentDomainDirectory").value + pValue).show()
                        }
                    }
                    else if (tagName == "div") { //多文本输入框（卓越亚马逊特有）
                        if (amazonMulTboxId == objId2) {
                            if (amazonMulTboxIndex >= 2) {
                                $(objDom).find("a.moreTxtbox").trigger("click");
                                $amazonMulTBox = $(objDom).find("input.amazonTxtBox");
                            }
                            $amazonMulTBox.eq(++amazonMulTboxIndex).val(pValue);
                        }
                        else {
                            amazonMulTboxId = objId2;
                            amazonMulTboxIndex = 0;
                            $amazonMulTBox = $(objDom).find("input.amazonTxtBox");
                            $amazonMulTBox.eq(amazonMulTboxIndex).val(pValue);
                        }
                    }
                }
            } //end else
        } //end for

        //如果是初始化淘宝销售属性，勾选完以后，构建销售属性表格
        if (isInitSellProperty) {
            //buildTaobaoSellProperty();
            buildPinjuSellProperty();
        }
    };
    //初始化品聚销售属性
    window.initialPinjuSellProperty = function(prop) {
        if (!prop) return;
        var sellPropList = jsonToAttr(prop),
        //$sellProperty = $("#tbSellProperty").find("tr.tbSellProperty");
        //update by ruanhh
            $sellProperty = $("#tbPinjuSellProperty").find("tr.tbSellProperty");

        //数据：718905:3161092:50*34|718947:3161137:军绿色|718996:3161161:独立
        //想要得到：718905:3161092_718947:3161137_718996:3161161
        for (var i = 0, len = sellPropList.length; i < len; i++) {
            var objId = sellPropList[i].sellProInfos,
                data = objId.split("|"),
                arrNewSellProperty = [];

            //按照页面销售属性的顺序重新调整销售属性串
            //属性串中的顺序可能是“颜色：尺码”
            //但页面中的销售属性顺序可能是“尺码：颜色”
            for (var j = 0, dataLen = data.length; j < dataLen; j++) {
                var item = data[j].split(":"),
                    id = "prop_" + item[0],
                    index = $sellProperty.index($("#" + id).parent("tr.chkBoxGroup"));

                arrNewSellProperty[index] = item[0] + ":" + item[1];
            }

            var id = "";
            for (var k = 0, arrLen = arrNewSellProperty.length; k < arrLen; k++) {
                var item = arrNewSellProperty["" + k + ""];
                id += item + "_";
            }
            if (id.length != 1) {
                id = id.substring(0, id.length - 1);
            }

            //赋值
            if ($id(id) != null) {
                $id("p_" + id).innerText = sellPropList[i].price;
                $id("q_" + id).innerText = sellPropList[i].nums;
                $id("tsc_" + id).innerText = unescape(sellPropList[i].code);
            }
        }

        //初始化结束后执行的回调函数
        initedSellPropertyCallback("pinju");
    };
    /*  
    *    验证品聚销售属性，规则： 
    *    1、销售属性必须都勾选或都不勾选
    *    2、必须填写淘宝销售属性中的数量和价格（至少填写一行）
    *    3、基本属性的价格不能大于或小于销售属性中的最大值和最小值
    */
    window.checkPinjuSellProperty = function(clientPrice) {
        var checkNotNull = checkSellProperty();
        if (checkNotNull) {
            return checkNotNull;
        }

        var sellPropError = "",
            sellProCount = 0,
            sellProCheckedCount = 0;

        $("#tbPinjuSellProperty").find("tr.tbSellProperty").each(function() {
            sellProCount++;
            var $td = $(this).children("td.tdPropValue"),
                checkedLen = $td.find("input:checked").length;

            if (checkedLen > 0) {
                sellProCheckedCount++;
            }
        });
        if (sellProCheckedCount != 0 && sellProCount != sellProCheckedCount) {
            sellPropError = "只选了销售属性中的一项，请全选或全不选;";
        }

        var $sellPropTr = $("#J_tbPinjuSellProperty").find("tr.trSellProp"),
            hasFillSellPropFlag = false,
            arrPrice = [];

        if ($sellPropTr.length) {
            $sellPropTr.each(function() {
                var $this = $(this),
                    price = $this.find("input.price").val(),
                    num = $this.find("input.quantity").val();

                if (parseFloat(price) != 0) {
                    arrPrice.push(parseFloat(price));
                    hasFillSellPropFlag = true;
                }
            });

            arrPrice.sort(sortNumber);

            if (!hasFillSellPropFlag) {
                sellPropError = "请填写品聚销售属性中的数量和价格";
            }
            else {
                if (parseFloat(clientPrice) > parseFloat(arrPrice[arrPrice.length - 1]) || parseFloat(clientPrice) < parseFloat(arrPrice[0])) {
                    sellPropError = "基本属性的价格不能大于或小于销售属性中的最大值和最小值";
                }
            }
        }
        return sellPropError;
    };
    //获取JSON格式的品聚销售属性
    window.getPinjuSellProperty = function() {
        var jsonBasic = "[",
            retId = "",
            retName = "",
            retValue = "",
            $inputs = $("#tbPinjuSellProperty").find("input:checked"),
            $textInputs = $("#tbPinjuSellProperty").find("input:text");

        //销售属性CheckBox
        $inputs.each(function() {
            var $this = $(this),
                id = this.id,
                value = this.value,
                sellProValue = $this.attr("sellPropValue"); //品聚销售属性保存的value不是value，而是sellPropValue

            if (this.checked) {
                retId = this.name.replace("cp_", "");
                retName = $this.nextAll("label").text() || $this.nextAll("input:text").attr("dvalue");
                retValue = sellProValue;
            }

            jsonBasic = jsonBasic + "{\"propertyId\":\"" + retId + "\",\"propertyName\":\"" + encodeSpecialChars(retName) + "\",\"propertyValue\":\"" + encodeSpecialChars(retValue) + "\"},";
        });
        //销售属性text
        //        $textInputs.each(function() {
        //            var $this = $(this),
        //                       id = this.id,
        //                       value = this.value,
        //                       name = this.name;

        //            if (value) {
        //                retId = name.replace("cp_", "");
        //                retName = $this.attr("retName");

        //                jsonBasic = jsonBasic + "{\"propertyId\":\"" + retId + "\",\"propertyName\":\"" + encodeSpecialChars(retName) +
        //                   "\",\"propertyValue\":\"" + encodeSpecialChars(value) + "\"},";
        //            }
        //        });
        //自定义颜色
        $("#J_tbCustomColor tr.trTbCustomColor").each(function() {
            var $this = $(this),
                display = $this.css("display");

            if (display.toLowerCase() == "none") return true;

            var $child = $this.children("td"),
                $name = $child.eq(1).children("input.textBoxCustom"),
                $file = $child.eq(2).children("input"),
                $img = $child.eq(3).children("img"),
                keys = $name.attr("keys"),
                cusNameId = $name.attr("id").replace("prop_", ""),
                cusName = encodeSpecialChars($name.val()),
                cusFileId = $img.attr("id").replace("prop_", ""),
                cusFile = "";

            //IE8保护上传文件 会使用假路径fakepath
            var dom = $file.get(0);
            if (dom.value) {
                cusFile = getPath(dom).replace(decodeURIComponent($("#J_CurrentDomainDirectory").val()), "").replace(/\\/g, '%5C');
            }

            var cusImg = $img.attr("src").replace(decodeURIComponent($("#J_CurrentDomainDirectory").val()), "").replace(/\\/g, '%5C');
            if (cusName != "") {
                jsonBasic = jsonBasic + "{\"propertyId\":\"" + cusNameId + "\",\"propertyName\":\"" + encodeSpecialChars(cusName) + "\",\"propertyValue\":\"" + encodeSpecialChars(cusName) + "\"},";
            }
            if (cusFile != "") {
                jsonBasic = jsonBasic + "{\"propertyId\":\"" + cusFileId + "\",\"propertyName\":\"" + cusFile + "\",\"propertyValue\":\"" + cusFile + "\"},";
            }
            else if (cusImg.indexOf("nolink") < 0) {
                jsonBasic = jsonBasic + "{\"propertyId\":\"" + cusFileId + "\",\"propertyName\":\"" + encodeSpecialChars(cusImg) + "\",\"propertyValue\":\"" + encodeSpecialChars(cusImg) + "\"},";
            }
        });

        //自定义尺码
        $("#tbPinjuSellProperty input.textBoxCustom").each(function() {
            var $this = $(this),
                txt = this.value ? this.value.replace(/\\/g, '%5C') : "",
                orinalText = $this.attr("dvalue");

            if (txt == orinalText) return true; //说明没有填写自定义值

            var $chk = $this.siblings("input:checkbox"),
                sizePropId = this.id.replace("prop_", ""),
                keys = $chk.attr("childKeys");

            if (txt) {
                jsonBasic = jsonBasic + "{\"propertyId\":\"" + sizePropId + "\",\"propertyName\":\"" + encodeSpecialChars(txt) + "\",\"propertyValue\":\"" + encodeSpecialChars(txt) + "\"},";
            }
        });

        if (jsonBasic.length > 1) {
            jsonBasic = jsonBasic.rtrim(",") + "]";
        }
        else {
            jsonBasic = "";
        }

        return jsonBasic;
    };
    //获取JSON格式的品聚销售属性值
    window.getPinjuSellPropertyValue = function() {
        var json = "",
            $objTr = $("#J_tbPinjuSellProperty").find("tr.trSellProp"); //销售属性的每一行

        if ($objTr.length) {
            json = "[";
            $objTr.each(function() {
                var $this = $(this),
                    id = this.id,
                    price = $this.find("input.price").val(),
                    nums = $this.find("input.quantity").val(),
                    code = $this.find("input.shopCode").val(),
                    sellProInfos = "",
                    arrSellPropId = $this.find("input.price").attr("id").replace("p_", "").split("_");

                $.each(arrSellPropId, function(i) {
                    sellProInfos += arrSellPropId[i] + ":" + $this.children(":eq(" + i + ")").text() + "|";
                });
                sellProInfos = sellProInfos.rtrim("\\|")

                if (parseFloat(price) != 0)
                    json = json + "{\"sellProInfos\":\"" + encodeSpecialChars(sellProInfos) + "\",\"price\":\"" + price + "\",\"nums\":\"" + nums + "\",\"code\":\"" + encodeSpecialChars(code) + "\"},";
            });

            if (json.length) {
                json = json.rtrim(",") + "]";
            }
        }

        return json;
    };
    //自定义颜色、尺码或其他销售属性输入内容变化时发生
    //isColor:是否是颜色属性
    window.pinjuCustomPropChange = function(isColor, dom) {
        var $this = $(dom),
            val = dom.value.trim(),
            maxLength = $this.attr("maxlength"),
            index = $id("AmazonSubjectProperty") ?
                    $("#AmazonSubjectProperty").find("dl").index($this.parents("dl")) :
                    $("#tbPinjuSellProperty").find("tr.tbSellProperty").index($this.parents("tr")); //记录修改的是哪行销售属性

        if (isColor) {
            var parentId = $this.attr("parentId"),
                oldVal = $this.parent("td").prev("td").text(),
                tmpArrId = parentId.split("_");

            parentId = tmpArrId[tmpArrId.length - 1];
            index = $("#tbPinjuSellProperty").find("tr.tbSellProperty").index($("#tbPinjuSellProperty").find("tr.tbColor"));

            $("#J_tbPinjuSellProperty > tbody").children("tr[id*='" + parentId + "']").each(function() {
                $(this).children("td").eq(index).text(val ? val : oldVal);
            });
        }
        else {
            var dvalue = $this.attr("dvalue"),
                $checkbox = $this.siblings("input:checkbox"),
                parentId = $checkbox.attr("id"),
                tmpArrId = parentId.split("_"),
                $table = $id("AmazonSellPropTable") ? $("#AmazonSellPropTable") : $("#J_tbPinjuSellProperty");

            parentId = tmpArrId[tmpArrId.length - 1];

            $table.find("tr[id*='" + parentId + "']").each(function() {
                $(this).find("td").eq(index).text(val ? val : dvalue);
            });
        }
    };
    /********************************************** 品聚完 /**********************************************/

    /********************************************** 私有函数 /**********************************************/

    //getElementById
    function $id(id) {
        return doc.getElementById(id);
    }

    //初始化
    function init() {
        //Checkbox统一宽度
        alignCheckBox();
        //begin added by wangdm 2011-10-13
        var tbChildren = $("#tbBaisc").find("input:text");
        for (var i = 0; i < tbChildren.length; i++) {
            var hint = tbChildren.eq(i).attr("hint");
            if (hint) {
                tbChildren.eq(i).qtip({
                    content: {
                        text: hint
                    },
                    style: {
                        classes: "qtipStyle"
                    },
                    position: { my: 'bottom left', at: 'top left' },
                    show: {
                        event: "keydown"
                    },
                    hide: {
                        event: "blur"
                    }
                });
            }
        }
        //end added by wangdm 2011-10-13

        //绑定销售属性页面中的事件
        var isTaobaoSell = $id("tbSellProperty"), //淘宝销售属性
            isTaobaoNewSell = $id("J_SellProperties"), //淘宝新销售属性 女装-西装 流行男鞋      
            isPaipaiStock = $id("J_ppSellProWrap"), //拍拍库存
            isAmazonChildItem = $id("AmazonChildItemArea"), //亚马逊子商品
        //add ruanhh 2011-12-10
            isPinjuSell = $id("tbPinjuSellProperty"),
            sellPropertyTableName = "";

        if (isTaobaoSell) {
            sellPropertyTableName = "J_tbSellProperty";

            var $tbSellPro = $("tr.tbSellProperty").find("input:checkbox"); //绑定销售属性CheckBox选中事件

            $tbSellPro.click(function(e) {
                taobaoSellProHandler(e.target);
            });
        }
        else if (isTaobaoNewSell) {
            sellPropertyTableName = "J_tbSellProperty";
            //颜色页签事件
            $("#sku-color-tab-header li").click(function() {
                var thisLiIndex = $(this).index();
                $("#sku-color-tab-header li").removeClass("selected");
                $(this).addClass("selected");
                $("#sku-color-tab-contents ul").css("display", "none");
                $("#sku-color-tab-contents ul:eq(" + thisLiIndex + ")").show();
            });
            //尺码页签事件
            $("ul.size-type li").change(function(e) {
                if ($("input", this).attr("checked")) {
                    var checkedDom = $("div.size-content ul input:checked");
                    if (checkedDom.length > 0 && !confirm("切换码制，会导致已勾选的尺码信息丢失！是否继续切换？")) {
                        var sizePannelIndex = $("div.size-content ul").index(checkedDom.parent().parent());
                        $("ul.size-type li:eq(" + sizePannelIndex + ")").find("input.type-radio").attr("checked", "true");
                    } else {
                        var thisLiIndex = $(this).index();
                        $("ul.size-pannel").hide();
                        $("ul.size-pannel:eq(" + thisLiIndex + ")").show();
                        checkedDom.each(function() {
                            $(this).removeAttr("checked");
                            $(this).parent().removeClass("checked");
                        });
                        taobaoNewSellProHandler();
                    }
                }
            });
            //颜色按钮事件
            $("ul.color-list label").click(function(e) {
                var $this = $(this).parent();
                if ($("input", $this).attr("checked")) {
                    $("span", $this).css("visibility", "inherit");
                    $(".color-note", $this).css("visibility", "inherit");
                    $("label input.J_Checkbox", $this).attr("checked", true);
                    var prokey = $("input.J_Checkbox", $this).attr("value").replace(":", "-");
                    $this.parents("#sku-color-wrap").find("#J_SKUColorWrapper").show();
                    $this.parents("#sku-color-wrap").find("#J_SKUColorWrapper thead").show();
                    $("tr", $this.parents("#sku-color-wrap").find("#J_SKUColorWrapper tbody")).each(function() {
                        if ($(this).attr("id") == "J_MapImg_" + prokey) {
                            $(this).show();
                        }
                    });
                } else {
                    $("span", $this).css("visibility", "hidden");
                    $(".color-note", $this).css("visibility", "hidden");
                    $("label input.J_Checkbox", $this).attr("checked", false);
                    var prokey = $("input.J_Checkbox", $this).attr("value").replace(":", "-");
                    $("tr", $this.parents("#sku-color-wrap").find("#J_SKUColorWrapper tbody")).each(function() {
                        if ($(this).attr("id") == "J_MapImg_" + prokey) {
                            $(this).hide();
                        }
                    });
                    if ($this.parents("#sku-color-wrap").find("#J_SKUColorWrapper tbody tr:visible").length == 0) {
                        $this.parents("#sku-color-wrap").find("#J_SKUColorWrapper").hide();
                        $this.parents("#sku-color-wrap").find("#J_SKUColorWrapper thead").hide();
                    }
                }
                taobaoNewSellProHandler();
            });
            //尺码按钮事件
            $("ul.size-pannel li").click(function() {
                var $this = $(this);
                if ($("input", $this).attr("checked")) {
                    $this.addClass("checked");
                    $this.find("span").show();
                    $this.find("input.editbox").show();
                } else {
                    $this.removeClass("checked");
                    $this.find("span").hide();
                    $this.find("input.editbox").hide();
                }
                taobaoNewSellProHandler();
            });
            //颜色新版 尺码老版的尺码
            $("div.graywrap ul li input:checkbox").click(function() {
                var $this = $(this);
                var $txtBox = $this.siblings("input:text");
                if ($this.attr("checked")) {
                    $txtBox.toggleClass("textBoxNoBorder", false);
                    $txtBox.removeAttr("disabled").focus();
                } else {
                    $txtBox.toggleClass("textBoxNoBorder", true);
                    $txtBox.attr("disabled", "disabled");
                }
                taobaoNewSellProHandler();
            });
            $("div.graywrap ul li input:text").keyup(function() {
                var $this = $(this);
                val = this.value.trim(),
            maxLength = $this.attr("maxlength"),
            index = $("#J_SellProperties").find("div.sku-group").index($this.parents("div.sku-group")); //记录修改的是哪行销售属性

                var dvalue = $this.attr("dvalue"),
                $checkbox = $this.siblings("input:checkbox"),
                parentId = $checkbox.attr("id"),
                tmpArrId = parentId.split("_"),
                $table = $("#J_tbSellProperty");

                parentId = tmpArrId[tmpArrId.length - 1];

                $table.find("tr[id*='" + parentId + "']").each(function() {
                    $(this).find("td").eq(index).text(val ? val : dvalue);
                });
            });
            //自定义颜色事件
            $("#sku-color-custom li.custom-list input.J_Checkbox").click(function() {
                var dom = $(this);
                var proKey = dom.val();
                var proKeyValue = proKey.split(":")[1];
                var nextProKey = proKey.split(":")[0] + ":" + (Number(proKeyValue) - 1);
                if (dom.attr("checked")) {
                    dom.parents("#sku-color-wrap").find("#J_SKUColorWrapper").show();
                    dom.parents("#sku-color-wrap").find("#J_SKUColorWrapper thead").show();
                    dom.parent().find("input.color-textbox").addClass("color-active");
                    dom.parents("#sku-color-custom").find("li.custom-defaultText").hide();
                    $("tr", dom.parents("#sku-color-wrap").find("#J_SKUColorWrapper tbody")).each(function() {
                        if ($(this).attr("id") == "J_MapImg_" + proKey.replace(":", "-")) {
                            $(this).show();
                        }
                    });
                    for (i = -1; i > -25; i--) {
                        var tempProKey = proKey.split(":")[0] + ":" + i;
                        if (dom.parents("#sku-color-custom").find("[value='" + tempProKey + "']:checked").length == 0) {
                            var newDom = dom.parents("#sku-color-custom").find("[value='" + tempProKey + "']");
                            newDom.parent().show();
                            newDom.parent().insertAfter(dom.parent());
                            break;
                        }
                    }
                }
                else {
                    dom.parent().hide();
                    dom.parent().find("input.color-textbox").removeClass("color-active");
                    $("tr", dom.parents("#sku-color-wrap").find("#J_SKUColorWrapper tbody")).each(function() {
                        if ($(this).attr("id") == "J_MapImg_" + proKey.replace(":", "-")) {
                            $(this).hide();
                        }
                    });
                    if (dom.parents("#sku-color-wrap").find("#J_SKUColorWrapper tbody tr:visible").length == 0) {
                        dom.parents("#sku-color-wrap").find("#J_SKUColorWrapper").hide();
                        dom.parents("#sku-color-wrap").find("#J_SKUColorWrapper thead").hide();
                    }
                }
                taobaoNewSellProHandler();
            });
            //自定义颜色编辑事件
            $("#sku-color-custom li.custom-list input.color-textbox").focusout(function() {
                var dom = $(this);
                var proKey = dom.parent().find("input.J_Checkbox").val();
                var valueText = dom.val();
                $("tr", dom.parents("#sku-color-wrap").find("#J_SKUColorWrapper tbody")).each(function() {
                    if ($(this).attr("id") == "J_MapImg_" + proKey.replace(":", "-")) {
                        $(this).find("td.tile span").text(valueText);
                    }
                });
                taobaoNewSellProHandler();
            });
            //自定义尺码事件
            $("div.sku-size-wrap div.size-diy ul li input.other-check").click(function() {
                var dom = $(this);
                var proKey = dom.val();
                var proId = proKey.split(":")[0];
                if (dom.attr("checked")) {
                    dom.parent().show();
                    dom.parent().attr("class", "checked");
					dom.parents(".size-diy").find(".other-tip").hide();//Add by huty 2017.5.2 隐藏和显示自定义尺码提示
                    for (i = -1; i > -25; i--) {
                        var tempProKey = proId + ":" + i;
                        if (dom.parents("div.size-diy").find("ul [value='" + tempProKey + "']:checked").length == 0) {
                            var newDom = dom.parents("div.size-diy").find("ul [value='" + tempProKey + "']");
                            newDom.parent().show();
                            newDom.parent().insertAfter(dom.parent());
                            break;
                        }
                    }
                } else {
                    dom.parent().attr("class", "new");
                    dom.parent().hide();
                }
                taobaoNewSellProHandler();
            });
            //自定义尺码编辑事件
            $("div.size-diy ul li input.other-input").focusout(function() {
                taobaoNewSellProHandler();
            });
            //自定义图片事件
            $("#J_SKUColorWrapper tbody tr td.image div.img-btn").change(function() {
                var dom = $(this);
                taobaoNewSellPic(dom);
            });
        }
        else if (isPaipaiStock) {
            sellPropertyTableName = "J_ppSellProWrap";

            $("#tbPaipaiSellProperty").bind("click", function(e) {
                if ($(e.target).is("input:checkbox")) {
                    bindPaipaiAddStockEvent(e.target);
                }
            });
        }
        else if (isAmazonChildItem) {
            sellPropertyTableName = "AmazonSellPropTable";

            //亚马逊需要加载日期控件的CSS和JS
            $.getScript("../js/jquery-ui-1.8.10.custom.min.js", function() { }, false);
            $.getCss(["../css/jquery.ui.theme.css", "../css/jquery.ui.datepicker.css"]);
        }
        // Add by ruanhh 2011-12-10
        else if (isPinjuSell) {
            sellPropertyTableName = "J_tbPinjuSellProperty";

            var $tbPinjuSellPro = $("tr.tbSellProperty").find("input:checkbox"); //绑定销售属性CheckBox选中事件

            $tbPinjuSellPro.click(function(e) {
                pinjuSellProHandler(e.target);
            });
        }

        if (isTaobaoSell || isPaipaiStock || isAmazonChildItem || isPinjuSell || isTaobaoNewSell) { //如果是销售属性页面，则需要绑定销售属性表格中的事件
            bindSellPropertyTableEvent(sellPropertyTableName);
        }
        else { //绑定标准产品的事件
            $("select").live("change", function() {
                var $parent = $(this).parents("tr"),
                    isStandard = $("#" + this.id + " option:selected").attr("standardProduct") === "true",
                    value = this.value,
                    id = this.id.replace("prop_", "").replace("_" + value, ""),
                    pId = $parent.attr("parentId"); //取父属性的ID
                pId = pId ? pId.replace("prop_", "") : "";

                //如果是标准产品，即有默认值，则从本地数据库获取默认值的JSON
                clearDefaultValues(id, value, pId); //先清空标准产品属性值
                if (isStandard) {
                    findDefaultValue(id, pId, value);
                }
                else {
                    clearDefaultValues(id, value, pId);
                }
            });
        }
    }
    //淘宝新销售属性 女装-西装 流行男鞋 销售属性图片
    function taobaoNewSellPic(obj, val) {
        var dom = $(obj);
        if (typeof (val) == "undefined") {
            val = $.trim(dom.find("input").val());
        }
        dom.parent().find("input.J_ImgInput").attr("value", val);
        if (dom.parent().find("div.preview img").length == 0) {
            dom.parent().find("div.preview").append("<img src='" + val + "'><a class='del'>删除</a><a class='undel' data-path='" + val + "' >恢复删除</a>");
            dom.parent().find("div.preview a.del").click(function() {
                var $this = $(this);
                $this.parents("td.image").find("input.J_ImgInput").attr("value", "");
                $this.parents("td.image").parent().addClass("deled");
            })
            dom.parent().find("div.preview a.undel").click(function() {
                var $this = $(this);
                var sourceFile = $this.attr("data-path");
                $this.parents("td.image").find("input.J_ImgInput").attr("value", sourceFile);
                $this.parents("td.image").parent().removeClass("deled");
            })
        } else {
            dom.parent().find("div.preview img").attr("src", val);
            dom.parent().find("div.preview a.undel").attr("data-path", val);
        }
        dom.parent().find("div.preview").show();
        dom.parents("#J_SKUColorWrapper").find("table thead tr th").live("click", function() { });
    }

    //将Checkbox的宽度统一
    function alignCheckBox() {
        var dateBegin = new Date().getMilliseconds(),
            totalMaxWidth = 0,
            arrTotalWidth = [],
            actualWidth = 0,
            checkboxWidth = $("input:checkbox").eq(0).width(),
            $checkbox = $("tr.chkBoxGroup");

        for (var i = 0, len = $checkbox.length; i < len; i++) {
            var maxWidth = 0,
                arrwidth = [],
                $this = $checkbox.eq(i),
                $td = $this.children("td.tdPropValue"),
                $chk = $td.find("label").length ? $td.find("label") : $td.find("input.textBoxCustom");

            for (var j = 0, chkLen = $chk.length; j < chkLen; j++) {
                arrwidth.push($chk.eq(j).width());
            }

            arrwidth.sort(sortNumber);
            maxWidth = arrwidth[arrwidth.length - 1];
            arrTotalWidth.push(maxWidth);
        }

        arrTotalWidth.sort(sortNumber);
        totalMaxWidth = arrTotalWidth[arrTotalWidth.length - 1];
        actualWidth = totalMaxWidth + checkboxWidth + 12;

        if (actualWidth) {
            $("#tbBaisc").data("originalWidth", actualWidth);
            $("div.chkBoxWrap").width(actualWidth);
        }
    }

    //绑定销售属性表格中的事件
    function bindSellPropertyTableEvent(sellPropTableName) {
        var $sellPropTable = $("#" + sellPropTableName);

        //文本框事件
        $sellPropTable.live("keyup keydown", function(e) { //价格 数量输入框
            var target = e.target,
                $target = $(target),
                type = e.type;

            switch (type.toLowerCase()) {
                case "keyup":
                    {
                        if ($target.is("input.price")) {
                            fillBackSellProPriceAndNum("price");
                        }
                        else if ($target.is("input.quantity")) {
                            fillBackSellProPriceAndNum("quantity");
                        }
                        break;
                    }
                case "keydown":
                    {
                        if ($target.is("input.price")) {
                            digitInput(target, e);
                        }
                        else if ($target.is("input.quantity")) {
                            numOnlyInput(target, e);
                        }
                        break;
                    }
            }
        });
        $sellPropTable.find("input").live("focusout", function(e) {
            var target = e.target,
                $target = $(target);

            if ($target.is("input.price")) {
                var pattern = /[0-9]*\.?[0-9]*/g;
                if (!this.value || !pattern.test(this.value)) {
                    this.value = "0.00";
                }
                else {
                    var val = parseFloat(this.value).toFixed(2);
                    this.value = isNaN(val) ? "0.00" : val;
                }
            }
            else if ($target.is("input.quantity")) {
                var pattern = /^[1-9]\d*$/g;
                if (!this.value || !pattern.test(this.value)) {
                    this.value = "0";
                }
                else {
                    this.value = parseInt(this.value) || "0";
                }
            }
        });

        //绑定销售属性表格中元素的事件
        $("#" + sellPropTableName + " input.textBoxSetSameValue").live("click", function(e) { //快速设置价格、数量时间
            setSellProToSame(sellPropTableName, e.target);
        });
    }

    //将JSON转换成对象数组
    function jsonToAttr(json) {
        return json ? eval('(' + json + ')') : [];
    }

    //数字排序
    function sortNumber(a, b) {
        return a - b
    }

    //只能输入数字和小数点
    function digitInput(el, e) {
        var e = e || window.event,
            cod = e.charCode || e.keyCode;

        if (cod == 110 || cod == 190) {
            (el.value.indexOf(".") >= 0 || !el.value.length) && notValue(e);
        } else {
            if ((cod != 8 && cod != 9 && cod != 46 && (cod < 37 || cod > 40) && (cod < 48 || cod > 57) && (cod < 96 || cod > 105)) || (e.shiftKey && (cod >= 48 || cod <= 57))) notValue(e);
        }
        function notValue(e) {
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        }
    }

    //只能输入数字
    function numOnlyInput(el, e) {
        var e = e || window.event,
            cod = e.charCode || e.keyCode;

        if ((cod != 8 && cod != 9 && cod != 46 && (cod < 37 || cod > 40) && (cod < 48 || cod > 57) && (cod < 96 || cod > 105)) || (e.shiftKey && (cod >= 48 || cod <= 57))) notValue(e);
        function notValue(e) {
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        }
    }

    //小数点验证
    function RemoveDot(obj, digit) {
        if (digit.lastIndexOf(".") == digit.length - 1) {
            obj.value = digit.substring(0, digit.length - 1);
        }
    }

    //将特殊字符： / 、 " 等编码，以免JSON解析错误
    function encodeSpecialChars(chars) {
        return chars.replace(/\\/g, "%5C").replace(/"/g, "%22");
    }

    //返回文件域的值
    function getPath(obj) {
        try {
            if (obj) {
                if (window.navigator.userAgent.indexOf("MSIE") >= 1) {
                    $(obj).focus();
                    return document.selection.createRange().text;
                }
                else if (window.navigator.userAgent.indexOf("Firefox") >= 1) {
                    if (obj.files) {
                        return obj.files.item(0).getAsDataURL();
                    }
                    return obj.value;
                }
                return obj.value;
            }
        }
        catch (e) {
            return "";
        }
    }

    //笛卡尔乘积
    function getModelList(attrList) {
        var productArray = attrList[0].split("|");
        for (var i = 1; i < attrList.length; i++) {
            productArray = joinPart(productArray, attrList[i].split("|"));
        }
        return productArray;

        function joinPart(part1, part2) {
            var result = [];
            for (var k = 0; k < part1.length; k++) {
                for (var l = 0; l < part2.length; l++) {
                    result.push(part1[k] + "|" + part2[l]);
                }
            }
            return result;
        }
    }

    function getTaobaoModelList(attrList) {
        var productArray = attrList[0].split("(分*隔)");
        for (var i = 1; i < attrList.length; i++) {
            productArray = joinPart(productArray, attrList[i].split("(分*隔)"));
        }
        return productArray;

        function joinPart(part1, part2) {
            var result = [];
            for (var k = 0; k < part1.length; k++) {
                for (var l = 0; l < part2.length; l++) {
                    result.push(part1[k] + "(分*隔)" + part2[l]);
                }
            }
            return result;
        }
    }

    /****************************************************************/
    /************************** 淘宝 /*******************************/
    /****************************************************************/

    //淘宝销售属性CheckBox点击处理
    function taobaoSellProHandler(obj) {
        //处理淘宝自定义颜色和尺码
        taobaoCustomColorAndSizeHandler(obj);

        //先获取原来的值
        var json = getTaobaoSellPropertyValue();

        //构建销售属性输入框
        buildTaobaoSellProperty();

        //然后将原来的值填上
        initialTaobaoSellProperty(json);

        //是否有销售属性
        fillHasSellProperty("taobao");
    }

    //淘宝销售属性CheckBox点击处理
    function taobaoNewSellProHandler() {
        try {
            //先获取原来的值
            var json = getTaobaoSellPropertyValue();

            //构建销售属性输入框
            buildTaobaoNewSellProperty();

            //然后将原来的值填上
            initialTaobaoSellProperty(json);

            //是否有销售属性
            fillHasSellProperty("taobao");
        } catch (ex) { }
    }
    //处理淘宝自定义颜色和尺码
    //淘宝新销售属性 女装-西装 流行男鞋
    function taobaoNewCustomColorAndSizeHandler(obj) {
        var dom = $(obj);
        if (dom.parent().hasClass("custom-list")) {
            var proKey = dom.val();
            var proKeyValue = proKey.split(":")[1];
            var nextProKey = proKey.split(":")[0] + ":" + (Number(proKeyValue) - 1);
            if (dom.attr("checked")) {
                dom.parents("#sku-color-wrap").find("#J_SKUColorWrapper").show();
                dom.parents("#sku-color-wrap").find("#J_SKUColorWrapper thead").show();
                dom.parent().find("input.color-textbox").addClass("color-active");
                dom.parents("#sku-color-custom").find("li.custom-defaultText").hide();
				dom.parents(".size-diy").find(".other-tip").hide();//Add by huty 2017.5.2 隐藏和显示自定义尺码提示
                $("tr", dom.parents("#sku-color-wrap").find("#J_SKUColorWrapper tbody")).each(function() {
                    if ($(this).attr("id") == "J_MapImg_" + proKey.replace(":", "-")) {
                        var valueText = dom.next().val();
                        $(this).find("td.tile span").text(valueText);
                        $(this).show();
                        return false;
                    }
                });
                $("li.custom-list input.J_Checkbox", dom.parents("#sku-color-custom")).each(function() {
                    if ($(this).val() == nextProKey) {
                        $(this).parent().show();
                    }
                });
            }
            else {
                dom.parent().hide();
                dom.parent().find("input.color-textbox").removeClass("color-active");
                $("tr", dom.parents("#sku-color-wrap").find("#J_SKUColorWrapper tbody")).each(function() {
                    if ($(this).attr("id") == "J_MapImg_" + proKey.replace(":", "-")) {
                        $(this).hide();
                    }
                });
                if (dom.parents("#sku-color-wrap").find("#J_SKUColorWrapper tbody tr:visible").length == 0) {
                    dom.parents("#sku-color-wrap").find("#J_SKUColorWrapper").hide();
                    dom.parents("#sku-color-wrap").find("#J_SKUColorWrapper thead").hide();
                }
            }
        } else if (dom.hasClass("other-check")) {
            var proKey = dom.val();
            var proId = proKey.split(":")[0];
            if (dom.attr("checked")) {
                dom.parent().attr("class", "checked");
                for (i = -1; i > -25; i--) {
                    var tempProKey = proId + ":" + i;
                    if (dom.parents("div.size-diy").find("ul [value='" + tempProKey + "']:checked").length == 0) {
                        var newDom = dom.parents("div.size-diy").find("ul [value='" + tempProKey + "']");
                        newDom.parent().show();
                        newDom.parent().insertAfter(dom.parent());
                        break;
                    }
                }
            } else {
                dom.parent().attr("class", "new");
                dom.parent().hide();
            }
        }
    }

    //处理淘宝自定义颜色和尺码
    function taobaoCustomColorAndSizeHandler(obj) {
        var $this = $(obj);
        if ($this.parents("tr.tbSellProperty").hasClass("tbColor")) {   //颜色
            //勾选颜色后，显示自定义颜色输入框
            var id = $this.attr("sellpropvalue").replace(":", "\\:"),
                checked = obj.checked,
                $chkBox = $("#" + id);

            $chkBox.toggle(checked);
            var hasCusColor = $("#J_tbCustomColor").find("tr.trTbCustomColor:visible").length > 0;
            $("#J_tbCustomColor thead tr").toggle(hasCusColor);
        }
        else {  //其他
            //勾选其他销售属性后，如尺码、套餐等，显示自定义输入框
            var $txtBox = $this.siblings("input:text"),
                checked = obj.checked;

            $txtBox.toggleClass("textBoxNoBorder", !checked);
            if (checked) {
                $txtBox.removeAttr("disabled").focus();
            }
            else {
                $txtBox.attr("disabled", "disabled");
            }
        }
    }

    //构建新版淘宝销售属性输入框
    function buildTaobaoNewSellProperty() {
        var strToWrite = [],
            arrPropValue = [],
            arrPropTitle = [],
            $sellProp = $("#J_SellProperties").find("div.sku-wrap div.sku-group"); //销售属性行tr

        //遍历每行销售属性
        $sellProp.each(function() {
            var $this = $(this),
                $propTitle = $this.attr("data-caption"),
            //颜色和尺码分开
                $checked = $this.find("input.J_Checkbox:checked");
            strNameValuePair = "";

            if ($checked.length) {
                arrPropTitle.push($propTitle.toString()); //属性名
            }

            //遍历属性值
            $checked.each(function() {
                var value = $(this).attr("sysProValue");
                if (!value) {
                    value = $(this).val();
                }
                //默认的颜色
                var name = $(this).attr("data-text");
                //默认的尺码
                if (!name && $(this).parent().hasClass("sku-item")) {
                    name = $(this.nextSibling).text();
                }
                //老版尺码
                if (!name && $(this).parent().hasClass("chkBoxWrap")) {
                    var childId = $(this).attr("childId");
                    var $customColor = $("#prop_" + childId);
                    if (childId && $customColor.length) {
                        name = $customColor.val();
                    }
                    if (!name) {
					//Update by huty 2016.9.27 nextSibling这里要用this.nextSibling，否则nextSibling为空
                        name = this.nextSibling.innerHTML ||
                            (this.nextSibling.value ?
                            this.nextSibling.value : $(this.nextSibling).attr("dvalue"));
                    }
                }
                //自定义颜色
                if (!name && $(this).parent().hasClass("custom-list")) {
                    name = $(this.nextSibling).val();
                }
                //自定义尺码
                if (!name && $(this).hasClass("other-check")) {
                    name = $(this.nextSibling.nextSibling).val();
                }
                strNameValuePair += name + "^" + value + "(分*隔)";
            }
            );

            if (strNameValuePair.lastIndexOf('(分*隔)') == (strNameValuePair.length - 5)) {
                strNameValuePair = strNameValuePair.substring(0, strNameValuePair.length - 5);
            }
            if (strNameValuePair) {
                arrPropValue.push(strNameValuePair);
            }
        });

        //构建销售属性表格
		//Update by huty 2017.5.5 这里判断页面中是否含有这个隐藏域，如果有的话，说明只勾选一个销售属性也可以显示sku
		var onePropertySku = $("div.onePropertySku");
        if (arrPropValue.length > 0 && arrPropTitle.length == $sellProp.length || (arrPropValue.length > 0 && onePropertySku.length > 0)) {
            var arrSellProp = getTaobaoModelList(arrPropValue),
                hasHead = false,
                head = "",
                arrHead = [],
                defaultPrice = $id("J_ProductPrice").value || "0.00";

            //拼接表格内容
            for (var i = 0; i < arrSellProp.length; i++) {
                var idPrefix = "",
                    value = "",
                    prop = arrSellProp[i].split("(分*隔)");

                for (var j = 0; j < prop.length; j++) {
                    var nameAndId = prop[j].split("^");
                    value += ("<td>" + nameAndId[0] + "</td>");

                    if (j != prop.length - 1) {
                        idPrefix += (nameAndId[1] + "_");
                    }
                    else {
                        idPrefix += nameAndId[1];
                    }
                }

                if (!hasHead) { //拼接表格头
                    arrHead.push("<tr>");
                    $.each(arrPropTitle, function() {
                        arrHead.push("<th nowrap='nowrap'>");
                        arrHead.push(this.replace(":", ""));
                        arrHead.push("</th>");
                    });
                    arrHead.push("<th nowrap='nowrap'>价格<input title='快速设置价格' class='textBoxSetSameValue' type='checkbox' stype='price' value='on'/></th><th nowrap='nowrap'>数量<input title='快速设置数量' class='textBoxSetSameValue' type='checkbox' stype='quantity' value='on'/></th><th nowrap='nowrap'>商家编码</th></tr>");
                    head = arrHead.join("");
                    strToWrite.push(head);
                    hasHead = true;
                }

                var arrCnt = [];

                arrCnt.push("<tr class='trSellProp' id='");
                arrCnt.push(idPrefix);
                arrCnt.push("'>");
                arrCnt.push(value);
                arrCnt.push("<td><input type='text' class='textBox price noChineseTextBox digitAndDotOnlyTextBox' id='p_");
                arrCnt.push(idPrefix);
                arrCnt.push("' value='");
                arrCnt.push(defaultPrice);
                arrCnt.push("' maxlength='10' /></td><td><input type='text' class='textBox quantity noChineseTextBox digitOnlyTextBox' id='q_");
                arrCnt.push(idPrefix);
                arrCnt.push("' value='0' maxlength='5' /></td><td><input type='text' class='textBox shopCode' id='tsc_");
                arrCnt.push(idPrefix);
                arrCnt.push("' maxlength='30' /></td><td style='display:none'><input type='text' class='textBox skuOnlineKey' id='skuOnlineKey_");
                arrCnt.push(idPrefix);
                arrCnt.push("' maxlength='15' /></td></tr>");

                strToWrite.push(arrCnt.join(""));

            }

            //插入到HTML中
            $("#J_tbSellProWrap").empty();

            var domSellPropWrap = $("#J_tbSellProWrap").get(0);
            if (domSellPropWrap) {
                domSellPropWrap.innerHTML = "<table id='J_tbSellProperty' cellpadding='0' cellspacing='0'>" + strToWrite.join("") + "</table>";
            }
            //加上 快速设置价格、数量 的提示
            if ($("#J_Tips").length) {
                $("#J_Tips").remove();
            }
            if (window.showSetSameValTip) {
                $("#J_tbSellProWrap").prepend("<div id='J_Tips' class='tips'>点击复选框可将价格或数量设置成与第一行相同<span></span><a title='不再提示' href='javascript:;' onfocus='this.blur();'>×</a></J_tbSellProWrap>");

                $("#J_Tips a").click(function() {
                    $(this).parents(".tips").find("span").fadeOut().end()
						   .fadeOut("normal", function() { $(this).remove() });
                    window.showSetSameValTip = false;
                });
            }
        }
        else {
            $("#J_tbSellProWrap").empty();
        }
    }



    //构建淘宝销售属性输入框
    function buildTaobaoSellProperty() {
        var strToWrite = [],
            arrPropValue = [],
            arrPropTitle = [],
            $sellProp = $("#tbSellProperty").find("tr.tbSellProperty"); //销售属性行tr

        //遍历每行销售属性
        $sellProp.each(function() {
            var $this = $(this),
                $childTd = $this.children("td"),
                $propTitle = $childTd.eq(0),
                $propValue = $this.children("td.tdPropValue"),
                $checked = $propValue.find("input:checked"),
                id = this.id,
                strNameValuePair = "";

            if ($checked.length) {
                arrPropTitle.push($propTitle.text()); //属性名
            }

            //遍历属性值
            $checked.each(function() {
                var value = this.value,
                    chkId = this.id,
                    nextSibling = this.nextSibling.nodeType != "3" ? this.nextSibling : this.nextSibling.nextSibling,
                    name = "",
                    childId = $(this).attr("childId"),
                    $customColor = $("#prop_" + childId);
                var hasChildProperty = $(this).hasClass("hasChildProperty");
                if (!hasChildProperty) {
                    if (childId && $customColor.length) {
                        name = $customColor.val();
                    }
                    if (!name) {
                        name = nextSibling.innerHTML ||
                            (nextSibling.value ?
                            nextSibling.value : $(nextSibling).attr("dvalue"));
                    }

                    strNameValuePair += name + "^" + value + "(分*隔)";
                }
            });

            if (strNameValuePair.lastIndexOf('(分*隔)') == (strNameValuePair.length - 5)) {
                strNameValuePair = strNameValuePair.substring(0, strNameValuePair.length - 5);
            }
            if (strNameValuePair) {
                arrPropValue.push(strNameValuePair);
            }
        });

        //构建销售属性表格
        if (arrPropValue.length > 0 && arrPropTitle.length == $sellProp.length) {
            var arrSellProp = getTaobaoModelList(arrPropValue),
                hasHead = false,
                head = "",
                arrHead = [],
                defaultPrice = $id("J_ProductPrice").value || "0.00";

            //拼接表格内容
            for (var i = 0; i < arrSellProp.length; i++) {
                var idPrefix = "",
                    value = "",
                    prop = arrSellProp[i].split("(分*隔)");

                for (var j = 0; j < prop.length; j++) {
                    var nameAndId = prop[j].split("^");
                    value += ("<td>" + nameAndId[0] + "</td>");

                    if (j != prop.length - 1) {
                        idPrefix += (nameAndId[1] + "_");
                    }
                    else {
                        idPrefix += nameAndId[1];
                    }
                }

                if (!hasHead) { //拼接表格头
                    arrHead.push("<tr>");
                    $.each(arrPropTitle, function() {
                        arrHead.push("<th nowrap='nowrap'>");
                        arrHead.push(this.replace(":", ""));
                        arrHead.push("</th>");
                    });
                    arrHead.push("<th nowrap='nowrap'>价格<input title='快速设置价格' class='textBoxSetSameValue' type='checkbox' stype='price' value='on'/></th><th nowrap='nowrap'>数量<input title='快速设置数量' class='textBoxSetSameValue' type='checkbox' stype='quantity' value='on'/></th><th nowrap='nowrap'>商家编码</th></tr>");
                    head = arrHead.join("");
                    strToWrite.push(head);
                    hasHead = true;
                }

                var arrCnt = [];

                arrCnt.push("<tr class='trSellProp' id='");
                arrCnt.push(idPrefix);
                arrCnt.push("'>");
                arrCnt.push(value);
                arrCnt.push("<td><input type='text' class='textBox price noChineseTextBox digitAndDotOnlyTextBox' id='p_");
                arrCnt.push(idPrefix);
                arrCnt.push("' value='");
                arrCnt.push(defaultPrice);
                arrCnt.push("' maxlength='10' /></td><td><input type='text' class='textBox quantity noChineseTextBox digitOnlyTextBox' id='q_");
                arrCnt.push(idPrefix);
                arrCnt.push("' value='0' maxlength='5' /></td><td><input type='text' class='textBox shopCode' id='tsc_");
                arrCnt.push(idPrefix);
                arrCnt.push("' maxlength='30' /></td><td><input type='text' class='textBox skuOnlineKey' style='display:none' id='skuOnlineKey_");
                arrCnt.push(idPrefix);
                arrCnt.push("' maxlength='15' /></td></tr>");

                strToWrite.push(arrCnt.join(""));

            }

            //插入到HTML中
            $("#J_tbSellProWrap").empty();

            var domSellPropWrap = $("#J_tbSellProWrap").get(0);
            if (domSellPropWrap) {
                domSellPropWrap.innerHTML = "<table id='J_tbSellProperty' cellpadding='0' cellspacing='0'>" + strToWrite.join("") + "</table>";
            }
            //加上 快速设置价格、数量 的提示
            if ($("#J_Tips").length) {
                $("#J_Tips").remove();
            }
            if (window.showSetSameValTip) {
                $("#J_tbSellProWrap").prepend("<div id='J_Tips' class='tips'>点击复选框可将价格或数量设置成与第一行相同<span></span><a title='不再提示' href='javascript:;' onfocus='this.blur();'>×</a></J_tbSellProWrap>");

                $("#J_Tips a").click(function() {
                    $(this).parents(".tips").find("span").fadeOut().end()
						   .fadeOut("normal", function() { $(this).remove() });
                    window.showSetSameValTip = false;
                });
            }
        }
        else {
            $("#J_tbSellProWrap").empty();
        }
    }

    //初始化淘宝销售属性完毕后的回调函数
    function initedSellPropertyCallback(sysType) {
        fillBackSellProPriceAndNum("quantity"); //回填最小价格、总数量
        fillBackSellProPriceAndNum("price");
        fillHasSellProperty(sysType); //是否有销售属性
    }

    //是否有销售属性，将触发客户端事件以启用或禁用客户端数量文本框
    function fillHasSellProperty(type) {
        var hasSellProperty = false;

        if (type == "taobao") {
            hasSellProperty = $("#J_tbSellProperty").find("tr.trSellProp").length > 0;
        }
        else if (type == "paipai") {
            hasSellProperty = $("#tbPaipaiSellPropertyDetail").find("tr.trSellProp").length > 0;
        }
        else if (type == "amazon") {
            hasSellProperty = $("#AmazonSellPropTable").find("tr.tr_amazon_prop").length > 0;
        }
        // update by ruanhh 2011-12-10
        else if (type == "pinju") {
            hasSellProperty = $("#J_tbPinjuSellProperty").find("tr.trSellProp").length > 0;
        }
        //end
        //没有销售属性时，去掉提示
        $("#J_Tips").toggle(hasSellProperty);

        window.external.AutoChangeNumEnable(!hasSellProperty);
    }

    /****************************************************************/
    /************************** 拍拍 /*******************************/
    /****************************************************************/

    //修改拍拍库存配置
    function modifyPaiPaiCustomProperty() {
        //取值
        //        var json = getPaiPaiCustomPropertyContent();

        //        //增删文本框
        //        createPaiPaiCustomProperty();

        //        //赋值
        //        initialPaipaiPropertyValue(json);

        //        //是否有销售属性
        //        fillHasSellProperty("paipai");
    }

    //构建拍拍自定义属性表格
    function createPaiPaiCustomProperty() {
        var strToWrite = [],
            arrPropList = [],
            arrPropTitle = [],
            $sellProp = $("#J_PaipaiProperty").find("li.li_PropRows");

        $sellProp.each(function() {
            var strValue = "",
                $this = $(this);

            $this.find("span.propValue").each(function() {
                strValue += $(this).text() + "|";
            });
            strValue = strValue.rtrim("\\|");

            arrPropTitle.push($this.find("span.propTitle").text());
            arrPropList.push(strValue);
        });

        if (arrPropList.length > 0) {
            var result = getModelList(arrPropList),
                hasHead = false,
                head = "",
                arrHead = [],
                defaultPrice = $id("J_ProductPrice").value || "0.00";

            for (var i = 0; i < result.length; i++) {
                var idPrefix = "",
                    value = "",
                    prop = result[i].split("|");

                for (var j = 0; j < prop.length; j++) {
                    value += ("<td>" + prop[j] + "</td>");
                    idPrefix += (arrPropTitle[j] + prop[j] + "|");
                }
                idPrefix = idPrefix.rtrim("\\|");

                if (!hasHead) {
                    arrHead.push("<tr>");

                    $.each(arrPropTitle, function() {
                        arrHead.push("<th nowrap='nowrap'>");
                        arrHead.push(this.replace(":", ""));
                        arrHead.push("</th>");
                    });

                    arrHead.push("<th nowrap='nowrap'>库存编码</th><th nowrap='nowrap'>价格<input class='textBoxSetSameValue' title='快速设置价格' type='checkbox' stype='price' value='on'/></th><th nowrap='nowrap'>数量<input title='快速设置数量' class='textBoxSetSameValue' type='checkbox' stype='quantity' value='on'/></th><th>备注</th></tr>");
                    head = arrHead.join("");
                    strToWrite.push(head);
                    hasHead = true;
                }
                var arrCnt = [];

                arrCnt.push("<tr class='trSellProp' id='");
                arrCnt.push(idPrefix);
                arrCnt.push("'>");
                arrCnt.push(value);
                arrCnt.push("<td><input type='text' class='textBox shopCode' id='");
                arrCnt.push(idPrefix);
                arrCnt.push("_0' maxlength='20' /></td><td><input type='text' class='textBox price noChineseTextBox digitAndDotOnlyTextBox' id='");
                arrCnt.push(idPrefix);
                arrCnt.push("_1' value='");
                arrCnt.push(defaultPrice);
                arrCnt.push("' maxlength='15' /></td><td><input type='text' class='textBox quantity noChineseTextBox digitOnlyTextBox' id='");
                arrCnt.push(idPrefix);
                arrCnt.push("_2' value='0' maxlength='5' /></td><td><input type='text' class='textBox infor' id='");
                arrCnt.push(idPrefix);
                arrCnt.push("_3' maxlength='15' /></td></tr>");

                strToWrite.push(arrCnt.join(""));
            }

            //插入到HTML中
            $("#J_tbSellProWrap").empty();

            var domSellPropWrap = $("#J_tbSellProWrap").get(0);
            if (domSellPropWrap) {
                domSellPropWrap.innerHTML = "<table id='tbPaipaiSellPropertyDetail' cellpadding='0' cellspacing='0'>" + strToWrite.join("") + "</table>";
            }
            //加上 快速设置价格、数量 的提示
            if ($("#J_Tips").length) {
                $("#J_Tips").remove();
            }
            if (window.showSetSameValTip) {
                $("#J_tbSellProWrap").prepend("<div id='J_Tips' class='tips'>点击复选框可将价格或数量设置成与第一行相同<span></span><a title='不再提示' href='javascript:;' onfocus='this.blur();'>×</a></J_tbSellProWrap>");

                $("#J_Tips a").click(function() {
                    $(this).parents(".tips").find("span").fadeOut().end()
						   .fadeOut("normal", function() { $(this).remove() });
                    window.showSetSameValTip = false;
                });
            }
        }
        else {
            $("#J_tbSellProWrap").empty();
        }
    }

    //点击拍拍销售属性，自动添加库存的事件
    function bindPaipaiAddStockEvent(obj) {
        var $this = $(obj),
            $td = $this.parents("tr.chkBoxGroup").children("td").eq(0),
            addAttrTitle = $td.text().replace(/[\*\:\s]/g, "").replace(String.fromCharCode(160), ""), //160是HTML中的&nbsp;
            addAttrValue = $.trim($this.siblings("label").text()),
        //$attrTitle = $("#J_PaipaiStockArea").find("span.propTitle:contains('" + addAttrTitle + "')");
             $attrTitle = $("#J_PaipaiStockArea").find("span.propTitle:[innerText='" + addAttrTitle + ":']");

        var hasChildProperty = $this.hasClass("hasChildProperty");
        if (hasChildProperty) {
            return;
        }
        if (!$id("J_PaiPaiStock").checked) {
            $id("J_PaiPaiStock").checked = true;
			customFireEventClick($id("J_PaiPaiStock"));
        }
        //先判断当前库存配置中有没有这个自定义属性，如果有对应的属性
        if ($attrTitle.length) {
            //在判断选中值是否已经存在，存在则不处理，否则添加
            var $parentLi = $attrTitle.eq(0).parents("li"),
            //$attrVal = $parentLi.find("span.propValue:contains('" + addAttrValue + "')"),
                $attrVal = $parentLi.find("span.propValue:[innerText='" + addAttrValue + "']"),
                attrValueLength = $parentLi.find("span.propValue").length;

            if (obj.checked) {    //添加
                //当前属性值的笛卡尔乘积是否大于限定数量
                var totalCount = 1;
                $("li.li_PropRows").each(function() {
                    var title = $(this).children("span.propTitle").text(),
                        valueCount = $(this).children("span.propValue").length;
                    if (title == addAttrTitle)
                        valueCount += 1;
                    totalCount = totalCount * valueCount;
                });
                if (totalCount > 100) {
                    //alert("库存记录已超过100条，因此该属性值不会被添加到库存配置中");    //不提示了
                    return;
                }
                //当前已有属性值的个数不能超过规定的个数（20个）
                if (!$attrVal.length && attrValueLength < 20) {
                    $attrTitle.parents("li.li_PropRows").find("dd").append("<span class=\"propValue\">" + addAttrValue + "</span>");
                }
            }
            else {  //删除
                $attrVal.remove();
                //如果该属性已经没有属性值，则删除该属性
                attrValueLength = attrValueLength = $parentLi.find("span.propValue").length;
                if (attrValueLength == 0) $parentLi.remove();
            }
        }
        else { //如果没有对应的属性，则添加新行
            var $addProp = $("#J_PaipaiAddProp"),
                $editProp = $("#J_PaipaiEditProp"),
                $stockArea = $("#J_PaipaiStockArea"),
                str = "<li class='li_PropRows'><dl><dt><a class='delRow' href='javascript:;' title='点击删除整行'><img class='del' src='../images/close.png' /></a><span class='propTitle'>" + addAttrTitle + ":</span></dt><dd><span class='propValue'>" + addAttrValue + "</span></dd></li>";

            $("#J_PaipaiProperty").append(str);
            //绑定删除事件
            $("#J_PaipaiProperty .delRow").unbind("click").bind("click", function() {
                var $this = $(this),
                    $li = $this.parents("li.li_PropRows"),
                    title = $li.find("span.propTitle").text().replace(":", "");
                if (window.confirm("您确定要删除属性“" + title + "”吗？删除后不可恢复")) {
                    $li.remove();

                    modifyPaiPaiCustomProperty();
                }
            });
            //隐藏拍拍添加一行，显示自定义属性输入框
            $editProp.hide();
            $addProp.show();
        }
        $("#PaiPaiEditAll").parent("li").toggle($("#J_PaipaiProperty .li_PropRows").length > 0);
        //修改库存配置
        modifyPaiPaiCustomProperty();
    }

    /*  
    *   验证自定义属性，规则：
    *   1:属性最多5个
    *   2:笛卡尔最长100
    *   3:属性必须有至少一个值
    *   4:内容只能为：中文字母数字等
    *   5:属性值、属性名所有的都不能相同
    */
    function checkPaiPaiCustomProperty(type, ignoreNewProp) {
        //存放错误的数组,最大库存配置个数（笛卡尔）
        var propError = [], maxStockNum = 150,
            $errorInput = [],
            $propRows = $("#J_PaipaiProperty").find("li.li_PropRows"),
            $propEditRows = $("#J_PaipaiProperty").find("li.li_PropEditRows");

        //先移除错误提示的class
        $("#J_PaipaiStockArea").find("input.errorInput").removeClass("errorInput");

        //开始检测（按规则中顺序检测，以保证性能）
        //属性个数是否超过规定(1)
        if ($propRows.length >= 5) {
            propError.push("最多只支持5种库存属性，请重新选择，清空不必要的项目");
            return propError;
        }

        //是否超过最大库存配置（笛卡尔乘积）(2)
        var hasTooMuchProp = false, totalCount = 1;
        if (type == "add") {
            $propRows.each(function() {
                var valueCount = $(this).find("span.propValue").length;
                totalCount *= valueCount;
            });
            totalCount *= $("#li_NewRow").find("input.newValue[value^='']").length;
        }
        else if (type == "edit") {
            $propEditRows.each(function() {
                var valueCount = $(this).find("input.editPropValue[value!='']").length;
                totalCount *= valueCount;
            });
        }
        hasTooMuchProp = totalCount > maxStockNum;
        if (hasTooMuchProp) {
            propError.push("您生成的库存记录超过" + maxStockNum + "条的最大限制，请适当调整属性");
            return propError;
        }

        //开始验证属性名和属性值是否为空(3)
        if (!ignoreNewProp) {
            var isPropComplete = false, newTitle;
            if (type == "add") {
                newTitle = $("#li_NewRow").find("input.newTitle").val();
                var $newValues = $("#li_NewRow").find("input.newValue");
                if (newTitle) {
                    $newValues.each(function() {
                        var val = this.value;
                        if (val) {
                            isPropComplete = true;
                            return false;   //JQ语法，break
                        }
                    });
                }
            }
            else if (type == "edit") {
                var newValue;
                $propEditRows.each(function() {
                    var $this = $(this),
                    $newValues = $this.find("input.editPropValue");

                    isPropComplete = false;
                    newTitle = $this.find("input.editPropTitle").val();

                    if (newTitle) {
                        $newValues.each(function() {
                            var val = this.value;
                            if (val) {
                                isPropComplete = true;
                                return false;   //JQ语法，break
                            }
                        });
                    }
                    else {
                        return false;
                    }

                    if (!isPropComplete) return false;
                });
            }
            if (!isPropComplete) {
                if (newTitle) {
                    propError.push("属性“" + newTitle + "”至少要有一个属性值");
                }
                else {
                    propError.push("属性不能为空");
                }
                return propError;
            }
        }

        //开始验证属性名和属性值是否有重复(5)
        var isPropRepeat = false,
            isPropValid = true,
            isPropTooLong = false,
            expression = /^[\u4e00-\u9fa5\w\*\(\) （）\.\/\\\-%\@\+\，\×]*$/; //匹配表达式

        //所有的属性和属性值
        var allProp = [],
            newProp = [],
            selector = "span.propTitle, span.propValue",
            newValueSelector = "#li_NewRow input.newTitle[value!=''], #li_NewRow input.newValue[value!='']";

        if (type == "edit") {
            selector = "input.editPropTitle, input.editPropValue";
            newValueSelector = "#J_PaipaiProperty input.editPropTitle, #J_PaipaiProperty input.editPropValue";
        }
        $("#J_PaipaiProperty").find(selector).each(function() {
            var val = $(this).text().replace(/:$/, "");
            if (val) {
                allProp.push(val);
            }
            if (!/^[\u4e00-\u9fa5\w\*\(\) （）\.\/\\\-%\@\+\，\×]*$/.test(val)) {
                isPropValid = false;
                return false;   //JQ语法，break
            }
            if (val.cLen() > 40) {
                isPropTooLong = true;
                return false;
            }
        });
        //新属性和属性值
        if (!ignoreNewProp) {
            $(newValueSelector).each(function() {
                var val = this.value.replace(/:$/, "");
                if (val) {
                    newProp.push(val);
                }
                if (!/^[\u4e00-\u9fa5\w\*\(\) （）\.\/\\\-%\@\+\，\×]*$/.test(val)) {
                    isPropValid = false;
                    $errorInput.push($(this));
                    //return false;   //JQ语法，break
                }
                if (val.cLen() > 40) {
                    isPropTooLong = true;
                    $errorInput.push($(this));
                    //return false;
                }
            });
        }

        //内容只能为：中文字母数字等(4)
        if (!isPropValid) {
            propError.push("库存配置中存在不合法的属性名或者属性值,名称只能由中文、字母、数字、（、）、*、\\、\/、+、-、%、@、.、，、×以及空格组成");
            $.each($errorInput, function() {
                $(this).addClass("errorInput");
            });
        }
        if (isPropTooLong) {
            propError.push("您填写的库存配置属性超过了20个汉字（40个字符），请修改后提交");
            $.each($errorInput, function() {
                $(this).addClass("errorInput");
            });
        }
        if (!isPropValid || isPropTooLong) {
            return propError;
        }

        //检查新属性与新属性值之间是否有重复(5)
        if (!ignoreNewProp) {
            for (var i = 0; i < newProp.length; i++) {
                for (var j = i + 1; j < newProp.length; j++) {
                    if (newProp[i] == newProp[j]) {
                        isPropRepeat = true;
                        break;
                    }
                }
            }
            //检查新属性是否与已有属性重复
            for (var i = 0; i < newProp.length; i++) {
                for (var j = 0; j < allProp.length; j++) {
                    if (newProp[i] == allProp[j]) {
                        isPropRepeat = true;
                        break;
                    }
                }
            }
            if (isPropRepeat) {
                propError.push("输入的属性值不能重复，也不能与属性相同");
                return propError;
            }
        }

        //返回错误数组
        return propError;
    }

    /****************************************************************/
    /************************** 亚马逊 /*******************************/
    /****************************************************************/

    //绑定亚马逊页面的事件
    function handlAmazonCustomProp() {
        $("#AmazonSubjectProperty input:checkbox").unbind("click").bind("click", function() {
            var $this = $(this),
                $input = $this.next("input:text"),
                childId = $this.attr("childId"),
                val = this.value,
                id = this.id,
                isChecked = this.checked;

            if (childId) {
                $input.toggleClass("textBoxNoBorder", !isChecked);
                if (isChecked) {
                    $input.removeAttr("disabled");
                }
                else {
                    $input.attr("disabled", "disabled");
                }
            }
            //取值
            var porpSellPro = getAmazonChildItem();
            //改变表格
            createAmazonProperty();
            //赋值
            initialAmazonChildPrdPropValue(porpSellPro, false);
            //回填价格数量
            fillBackSellProPriceAndNum("price");
            fillBackSellProPriceAndNum("quantity");
        });
        $("#AmazonSubjectProperty input:text").unbind("blur").bind("blur", function(e) {
            if ($(this).attr("signType")) {
                var dom = e.target;
                var value = dom.value;

                var $inputs = $(this).parents("dl").find("dt.AmazonPropTitle, input:text[value!='']");
                $inputs.each(function() {
                    var val = $(this).val() || $(this).text();
                    if ($(this)[0] != dom && val == value) {
                        $(dom).val("");
                        alert("属性值不能有重复，且不能与属性名相同");
                        dom.select();
                        return;
                    }
                });

                //取值
                var porpSellPro = getAmazonChildItem();
                //改变表格
                createAmazonProperty();
                //赋值
                initialAmazonChildPrdPropValue(porpSellPro, false);
                //回填价格数量
                fillBackSellProPriceAndNum("price");
                fillBackSellProPriceAndNum("quantity");
            }
            else {
                amazonCustomTextBoxChange(e.target);
            }
        });

        //日期选择
        try {
            $.datepicker.regional['zh-CN'] = {
                closeText: '关闭',
                prevText: '&#x3c;',
                nextText: '&#x3e;',
                currentText: '今天',
                monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
		'七月', '八月', '九月', '十月', '十一月', '十二月'],
                monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月',
		'七月', '八月', '九月', '十月', '十一月', '十二月'],
                dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
                dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
                dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
                weekHeader: '周',
                dateFormat: 'yy-mm-dd',
                firstDay: 1,
                isRTL: false,
                showMonthAfterYear: true,
                yearSuffix: '年'
            };

            $.datepicker.setDefaults($.datepicker.regional['zh-CN']);
        }
        catch (e) { }
    }

    //构造亚马逊子商品输入表格
    function createAmazonProperty() {
        var strToWrite = [],
            arrPropValue = [],
            arrPropTitle = [],
            $sellProp = $("#AmazonSubjectProperty dl"),
            itemName = $("#J_ItemName").val();

        //遍历每行销售属性
        $sellProp.each(function() {
            var $this = $(this),
                $propTitle = $this.find("dt.AmazonPropTitle"),
                $propValue = $this.find("dd"),
                $checked = $propValue.find("input:checked"),
                strNameValuePair = "";

            if (!$checked.length) {
                $checked = $propValue.find("input.amazonTxtBox[value!='']");
            } else {
                var $text = $propValue.find("input.amazonTxtBox[value!='']");
                for (var i = 0; i < $text.length; i++) {
                    $checked.push($text[i]);
                }
            }
            if ($checked.length) {
                arrPropTitle.push($propTitle.text()); //属性名
            }

            //遍历属性值
            $checked.each(function() {
                var $this = $(this),
                    value = this.id.replace("prop_", ""),
                    chkId = this.id,
                    type = $this.attr("type"),
                    key = $this.attr("propKey"),
                    nextSibling = this.nextSibling.nodeType != "3" ? this.nextSibling : this.nextSibling.nextSibling,
                    name = "",
                    childId = $this.attr("childId");

                if (type == "checkbox") {
                    name = nextSibling.innerHTML ||
                            (nextSibling.value ?
                            nextSibling.value : $(nextSibling).attr("dvalue"));
                }
                else if (type == "text") {
                    name = this.value;
                    value = name + ":" + name;
                    key = $this.parent("div.txtBoxGroup").attr("propKey");
                }

                strNameValuePair += name + "^" + key + ":" + value + "|";
            });

            strNameValuePair = strNameValuePair.rtrim("\\|");
            if (strNameValuePair) {
                arrPropValue.push(strNameValuePair);
            }
        });
        //构建销售属性表格
        if (arrPropValue.length > 0 && arrPropTitle.length == $sellProp.length) {
            var arrSellProp = getModelList(arrPropValue),
                hasHead = false,
                head = "",
                arrHead = [],
                defaultPrice = $("#J_ProductPrice").value || "0.00";

            //拼接表格内容
            for (var i = 0; i < arrSellProp.length; i++) {
                var idPrefix = "",
                    value = "",
                    prop = arrSellProp[i].split("|"),
                    subItemName = itemName + "(";

                for (var j = 0; j < prop.length; j++) {
                    var nameAndId = prop[j].split("^");
                    value += ("<td>" + nameAndId[0] + "</td>");

                    if (j != prop.length - 1) {
                        idPrefix += (nameAndId[1] + "_");
                        //子商品名称
                        subItemName += nameAndId[0] + ",";
                    }
                    else {
                        idPrefix += nameAndId[1];
                        subItemName += nameAndId[0] + ")";
                    }
                }

                if (!hasHead) { //拼接表格头
                    arrHead.push("<tr>");
                    $.each(arrPropTitle, function() {
                        arrHead.push("<th nowrap='nowrap' rowspan='2'>");
                        arrHead.push(this.replace(":", ""));
                        arrHead.push("</th>");
                    });
                    arrHead.push('<th rowspan="2">价格<input class="textBoxSetSameValue" title="快速设置价格" value="on" type="checkbox" stype="nomalPrice"></th><th colspan="3">特价信息</th><th rowspan="2">数量' +
                                 '<input class="textBoxSetSameValue" title="快速设置数量" value="on" type="checkbox" stype="quantity"></th><th rowspan="2">标准编码</th><th rowspan="2">卖家SKU</th><th rowspan="2">子商品名称</th><th rowspan="2">图片</th></tr>' +
                                 '<tr><th>特价<input class="textBoxSetSameValue" title="快速设置特价" value="on" type="checkbox" stype="salePrice"></th><th>开始时间<input class="textBoxSetSameValue" title="快速设置开始时间" value="on" type="checkbox" stype="saleBegin"></th>' +
                                 '<th>结束时间<input class="textBoxSetSameValue" title="快速设置结束时间" value="on" type="checkbox" stype="saleEnd"></th></tr>');
                    head = arrHead.join("");
                    strToWrite.push(head);
                    hasHead = true;
                }

                var arrCnt = [];

                arrCnt.push("<tr class='tr_amazon_prop' id='", idPrefix, "'>", value);
                arrCnt.push("<td><input type='text' class='price nomalPrice' id='p_", idPrefix, "' value='", defaultPrice, "' maxlength='10' /></td>");
                arrCnt.push("<td><input type='text' class='price salePrice' id='s_", idPrefix, "' value='", defaultPrice, "' maxlength='10' /></td>");
                arrCnt.push("<td><input type='text' class='date saleBegin' id='b_", idPrefix, "'  /></td>");
                arrCnt.push("<td><input type='text' class='date saleEnd' id='e_", idPrefix, "' param='b_", idPrefix, "'/></td>");
                arrCnt.push("<td><input type='text' class='quantity' id='q_", idPrefix, "' value='0' maxlength='5' /></td>");
                arrCnt.push("<td><input type='text' class='standardCode' id='d_", idPrefix, "' maxlength='20' /></td>");
                arrCnt.push("<td><input type='text' class='itemCode' id='c_", idPrefix, "' maxlength='50' /></td>");
                arrCnt.push("<td><input type='text' class='itemName' value='", subItemName, "' id='n_", idPrefix, "' /></td>");
                arrCnt.push("<td ><div><input type='button' class='w_picture' value='共0张' id='pic_", idPrefix, "'  title='点击修改图片' saveValue='' /><input id='Text1' type='text' style='border-width: 0px; width:60px;'  readonly='readonly'/></div></td></tr>");

                strToWrite.push(arrCnt.join(""));
            }

            //插入到HTML中
            $("#AmazonSellProp").empty();

            var domSellPropWrap = $("#AmazonSellProp").get(0);
            if (domSellPropWrap) {
                domSellPropWrap.innerHTML = "<table id='AmazonSellPropTable' cellpadding='0' cellspacing='0'>" + strToWrite.join("") + "</table>";
            }
        }
        else {
            $("#AmazonSellProp").empty();
        }
        $("input.w_picture").click(function() {
            var pictureInfoStr = window.external.AddImgForAmazonChildProduct($(this).attr("saveValue"));
            $(this).attr("saveValue", pictureInfoStr);
            if (pictureInfoStr && pictureInfoStr.split("|")) {
                $(this).val("共" + pictureInfoStr.split("|").length + "张");
            } else {
                $(this).val("共0张");
            }
        });

        try {
            var dates = $("input.date").datepicker({
                autoSize: true,
                defaultDate: "+1w",
                duration: "fast",
                changeMonth: true,
                numberOfMonths: 1,
                onSelect: function(selectedDate) {
                    //begin updated by wangdm 2011-10-19
                    //开始日期：不能小于今天
                    if ($(this).hasClass("saleBegin")) {
                        var date = new Date();
                        $(this).datepicker("option", "minDate", date);
                    }
                    //结束日期：不能小于开始日期
                    if ($(this).hasClass("saleEnd")) {
                        var param = $(this).attr("param");
                        if (param) {
                            var beginDate = $id(param).value;
                            if (beginDate) {
                                var date = new Date(beginDate.replace(/\-/g, "/ "));
                                $(this).datepicker("option", "minDate", date);
                            }
                        }
                    }
                    //begin updated by wangdm 2011-10-19  
                }
            });
        } catch (e) { }
    }

    //亚马逊自定义属性输入框改变事件
    function amazonCustomTextBoxChange(dom) {
        var $this = $(dom),
            $inputs = $this.parents("dl").find("dt.AmazonPropTitle, input:text[value!='']"),
            value = dom.value,
            hasSameValue = false;
        //过滤特殊字符
        // var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）&mdash;—|{}【】‘；：”“'。，、？]") 

        //        var pattern = new RegExp("[(){}',\\[\\]{}\"]");

        //        if (pattern.test(value)) {
        //            alert("属性值不能有特殊字符：（）\'\"{}[]");
        //            return false;
        //        }
        $inputs.each(function() {
            var val = $(this).val() || $(this).text();
            if ($(this)[0] != dom && val == value) {
                hasSameValue = true;
                $this.val("");
                alert("属性值不能有重复，且不能与属性名相同");
                dom.select();
                return false;
            }
        });
        var isCheck = false;
        var childItems = $("#AmazonSubjectProperty").find("dt.AmazonPropTitle,input:checkbox, input:text[value!='']");
        for (var i = 0; i < childItems.length; i++) {
            if (childItems.eq(i).attr("checked")) {
                if (value == childItems.eq(i + 1).val()) {
                    isCheck = true;
                    break;
                }

            }
        }

        if (!hasSameValue) {

            //取值
            var porpSellPro = getAmazonChildItem();
            //改变表格
            createAmazonProperty();
            //赋值
            initialAmazonChildPrdPropValue(porpSellPro, false);

            if (isCheck) {
                var $checkbox = $this.siblings("input:checkbox"),
                parentId = $checkbox.attr("id"),
                tmpArrId = parentId.split("_");

                parentId = tmpArrId[tmpArrId.length - 1];
                $table = $id("AmazonSellPropTable") ? $("#AmazonSellPropTable") : $("#J_tbSellProperty");
                $table.find("tr[id*='" + parentId + "']").each(function() {
                    var len = $(this).find("td").length;
                    if (len == 11) {
                        var itemNameValue = $("#J_ItemName").val() + "(" + $(this).find("td").eq(0).text() + "," + $(this).find("td").eq(1).text() + ")";
                        $(this).find("td").eq(len - 2).children().eq(0).val(itemNameValue);
                    } else {
                        var itemNameValue = $("#J_ItemName").val() + "(" + $(this).find("td").eq(0).text() + ")";
                        $(this).find("td").eq(len - 2).children().eq(0).val(itemNameValue);
                    }
                });
            }
            //回填价格数量
            fillBackSellProPriceAndNum("price");
            fillBackSellProPriceAndNum("quantity");
        }
    }

    //初始化亚马逊子商品属性值
    function initialAmazonChildPrdProp(prop) {

        var prdProperties = jsonToAttr(prop),
            txtBoxIndex = 0,
            currentTxtId = "";
        $.each(prdProperties, function(i) {
            var objId1 = "prop_" + prdProperties[i].propertyId + ":" + prdProperties[i].propertyValue,
                objId2 = "prop_" + prdProperties[i].propertyId;

            if (prdProperties[i].propertyId == "0") {
                $("#J_ItemName").val(prdProperties[i].propertyValue);
                return true;
            }
            //checkbox
            var $objCheckbox = $("#" + objId1.replace(":", "\\:").replace(/\./g, "\\.").replace(/\-/g, "\\-").replace(/\(/g, "\\(").replace(/\)/g, "\\)")); //冒号在JQ中有特殊作用，需转义
            //var $objCheckbox = $("#" + objId1.replace(/:/g, "\\:").replace(/./g, "\\."));
            if ($objCheckbox.length) {
                if (!$objCheckbox.attr("checked")) {
                    $objCheckbox.get(0) && $objCheckbox.get(0).click();
                }
            }
            //select input
            var $obj = $("#" + objId2);
            if ($obj.length) {
                if ($obj.is("select")) {
                    if ($obj.val() != prdProperties[i].propertyValue) {
                        $obj.val(prdProperties[i].propertyValue);
                        if ($obj.is("select")) {
                            showAmazonSubject($obj.get(0));
                        }
                    }
                }
                else if ($obj.is("div") && $objCheckbox.length == 0) {
                    if (currentTxtId == objId2) {
                        txtBoxIndex++;
                        if (txtBoxIndex >= 3) {
                            if ($obj.children("input").eq(txtBoxIndex).length == 0) {
                                $obj.children("input").eq(txtBoxIndex - 1).after("<input type='text' class='amazonTxtBox textBoxNoBorder' maxlength='50' />");
                            }
                        }
                    }
                    else {
                        currentTxtId = objId2;
                        txtBoxIndex = 0;
                    }
                    $obj.children("input").eq(txtBoxIndex).val(prdProperties[i].propertyValue);
                }
                else if ($obj.is("input:text")) {
                    $obj.val(prdProperties[i].propertyValue);
                }
            }
        });
    }

    //初始化亚马逊子商品内容
    function initialAmazonChildPrdPropValue(porpSellPro, isNoCode) {
        var prdSellProperties = jsonToAttr(porpSellPro);
        $.each(prdSellProperties, function(i) {
            var id = "",
                arr = prdSellProperties[i].sellProInfos.split("|");

            for (var j = 0; j < arr.length; j++) {
                var subArr = arr[j].split(":");
                id += subArr[0] + ":" + subArr[1] + ":" + subArr[2] + "_";
            }
            id = id.substring(0, id.length - 1);

            if (document.getElementById(id) != null) {
                if (document.getElementById("p_" + id))
                    document.getElementById("p_" + id).value = prdSellProperties[i].price;
                if (document.getElementById("s_" + id))
                    document.getElementById("s_" + id).value = prdSellProperties[i].salePrice;
                if (document.getElementById("b_" + id))
                    document.getElementById("b_" + id).value = prdSellProperties[i].saleBegin;
                if (document.getElementById("e_" + id))
                    document.getElementById("e_" + id).value = prdSellProperties[i].saleEnd;
                if (document.getElementById("q_" + id))
                    document.getElementById("q_" + id).value = prdSellProperties[i].nums;
                if (document.getElementById("d_" + id))
                    document.getElementById("d_" + id).value = prdSellProperties[i].standardCode;
                if (document.getElementById("c_" + id) && !isNoCode) {
                    document.getElementById("c_" + id).value = prdSellProperties[i].code;
                    if (prdSellProperties[i].state == "1") {
                        $("#c_" + id.replace(/\:/g, "\\:")).attr("readonly", "readonly").css("cursor", "not-allowed").attr("state", "1");
                    }
                    else if (prdSellProperties[i].state == "2") {
                        $("#c_" + id.replace(/\:/g, "\\:")).parents("tr").remove();
                    }
                }
                if (document.getElementById("n_" + id))
                    document.getElementById("n_" + id).value = unescape(prdSellProperties[i].name);
                if (document.getElementById("pic_" + id)) {
                    if (prdSellProperties[i].pictures && prdSellProperties[i].pictures.split("|")) {
                        $("#pic_" + id.replace(/\:/g, "\\:").replace(/\./g, "\\.").replace(/\-/g, "\\-").replace(/\(/g, "\\(").replace(/\)/g, "\\)")).val("共" + prdSellProperties[i].pictures.split("|").length + "张");
                        $("#pic_" + id.replace(/\:/g, "\\:").replace(/\./g, "\\.").replace(/\-/g, "\\-").replace(/\(/g, "\\(").replace(/\)/g, "\\)")).attr("saveValue", prdSellProperties[i].pictures);
                    } else {
                        $("#pic_" + id.replace(/\:/g, "\\:").replace(/\./g, "\\.").replace(/\-/g, "\\-").replace(/\(/g, "\\(").replace(/\)/g, "\\)")).val("共0张");
                        $("#pic_" + id.replace(/\:/g, "\\:").replace(/\./g, "\\.").replace(/\-/g, "\\-").replace(/\(/g, "\\(").replace(/\)/g, "\\)")).attr("saveValue", "");
                    }
                }
            }
        });

    }
    /****************************************************************/
    /************************** 品聚 /*******************************/
    /****************************************************************/

    //品聚销售属性CheckBox点击处理
    function pinjuSellProHandler(obj) {
        //处理品聚自定义颜色和尺码
        pinjuCustomColorAndSizeHandler(obj);

        //先获取原来的值
        var json = getPinjuSellPropertyValue();

        //构建销售属性输入框
        buildPinjuSellProperty();

        //然后将原来的值填上
        initialPinjuSellProperty(json);

        //是否有销售属性
        fillHasSellProperty("pinju");
    }

    //品聚淘宝自定义颜色和尺码
    function pinjuCustomColorAndSizeHandler(obj) {
        var $this = $(obj);
        if ($this.parents("tr.tbSellProperty").hasClass("tbColor")) {   //颜色
            //勾选颜色后，显示自定义颜色输入框
            var id = $this.attr("sellpropvalue").replace(":", "\\:"),
                checked = obj.checked,
                $chkBox = $("#" + id);

            $chkBox.toggle(checked);
            var hasCusColor = $("#J_tbCustomColor").find("tr.trTbCustomColor:visible").length > 0;
            $("#J_tbCustomColor thead tr").toggle(hasCusColor);
        }
        else {  //其他
            //勾选其他销售属性后，如尺码、套餐等，显示自定义输入框
            var $txtBox = $this.siblings("input:text"),
                checked = obj.checked;

            $txtBox.toggleClass("textBoxNoBorder", !checked);
            if (checked) {
                $txtBox.removeAttr("disabled").focus();
            }
            else {
                $txtBox.attr("disabled", "disabled");
            }
        }
    }

    //构建品聚销售属性输入框
    function buildPinjuSellProperty() {
        var strToWrite = [],
            arrPropValue = [],
            arrPropTitle = [],
            $sellProp = $("#tbPinjuSellProperty").find("tr.tbSellProperty"); //销售属性行tr

        //遍历每行销售属性
        $sellProp.each(function() {
            var $this = $(this),
                $childTd = $this.children("td"),
                $propTitle = $childTd.eq(0),
                $propValue = $this.children("td.tdPropValue"),
                $checked = $propValue.find("input:checked"),
                id = this.id,
                strNameValuePair = "";

            if ($checked.length) {
                arrPropTitle.push($propTitle.text()); //属性名
            }

            //遍历属性值
            $checked.each(function() {
                var value = this.value,
                    chkId = this.id,
                    nextSibling = this.nextSibling.nodeType != "3" ? this.nextSibling : this.nextSibling.nextSibling,
                    name = "",
                    childId = $(this).attr("childId"),
                    $customColor = $("#prop_" + childId);
                var hasChildProperty = $(this).hasClass("hasChildProperty");
                if (!hasChildProperty) {
                    if (childId && $customColor.length) {
                        name = $customColor.val();
                    }
                    if (!name) {
                        name = nextSibling.innerHTML ||
                            (nextSibling.value ?
                            nextSibling.value : $(nextSibling).attr("dvalue"));
                    }

                    strNameValuePair += name + "^" + value + "|";
                }
            });

            if (strNameValuePair.charAt(strNameValuePair.length - 1) == "|") {
                strNameValuePair = strNameValuePair.substring(0, strNameValuePair.length - 1);
            }
            if (strNameValuePair) {
                arrPropValue.push(strNameValuePair);
            }
        });

        //构建销售属性表格
        if (arrPropValue.length > 0 && arrPropTitle.length == $sellProp.length) {
            var arrSellProp = getModelList(arrPropValue),
                hasHead = false,
                head = "",
                arrHead = [],
                defaultPrice = $id("J_ProductPrice").value || "0.00";

            //拼接表格内容
            for (var i = 0; i < arrSellProp.length; i++) {
                var idPrefix = "",
                    value = "",
                    prop = arrSellProp[i].split("|");

                for (var j = 0; j < prop.length; j++) {
                    var nameAndId = prop[j].split("^");
                    value += ("<td>" + nameAndId[0] + "</td>");

                    if (j != prop.length - 1) {
                        idPrefix += (nameAndId[1] + "_");
                    }
                    else {
                        idPrefix += nameAndId[1];
                    }
                }

                if (!hasHead) { //拼接表格头
                    arrHead.push("<tr>");
                    $.each(arrPropTitle, function() {
                        arrHead.push("<th nowrap='nowrap'>");
                        arrHead.push(this.replace(":", ""));
                        arrHead.push("</th>");
                    });
                    arrHead.push("<th nowrap='nowrap'>价格<input title='快速设置价格' class='textBoxSetSameValue' type='checkbox' stype='price' value='on'/></th><th nowrap='nowrap'>数量<input title='快速设置数量' class='textBoxSetSameValue' type='checkbox' stype='quantity' value='on'/></th><th nowrap='nowrap'>商家编码</th></tr>");
                    head = arrHead.join("");
                    strToWrite.push(head);
                    hasHead = true;
                }

                var arrCnt = [];

                arrCnt.push("<tr class='trSellProp' id='");
                arrCnt.push(idPrefix);
                arrCnt.push("'>");
                arrCnt.push(value);
                arrCnt.push("<td><input type='text' class='textBox price noChineseTextBox digitAndDotOnlyTextBox' id='p_");
                arrCnt.push(idPrefix);
                arrCnt.push("' value='");
                arrCnt.push(defaultPrice);
                arrCnt.push("' maxlength='10' /></td><td><input type='text' class='textBox quantity noChineseTextBox digitOnlyTextBox' id='q_");
                arrCnt.push(idPrefix);
                arrCnt.push("' value='0' maxlength='5' /></td><td><input type='text' class='textBox shopCode' id='tsc_");
                arrCnt.push(idPrefix);
                arrCnt.push("' maxlength='15' /></td></tr>");

                strToWrite.push(arrCnt.join(""));

            }

            //插入到HTML中
            $("#J_tbSellProWrap").empty();

            var domSellPropWrap = $("#J_tbSellProWrap").get(0);
            if (domSellPropWrap) {
                domSellPropWrap.innerHTML = "<table id='J_tbPinjuSellProperty' cellpadding='0' cellspacing='0'>" + strToWrite.join("") + "</table>";
            }
            //加上 快速设置价格、数量 的提示
            if ($("#J_Tips").length) {
                $("#J_Tips").remove();
            }
            if (window.showSetSameValTip) {
                $("#J_tbSellProWrap").prepend("<div id='J_Tips' class='tips'>点击复选框可将价格或数量设置成与第一行相同<span></span><a title='不再提示' href='javascript:;' onfocus='this.blur();'>×</a></J_tbSellProWrap>");

                $("#J_Tips a").click(function() {
                    $(this).parents(".tips").find("span").fadeOut().end()
						   .fadeOut("normal", function() { $(this).remove() });
                    window.showSetSameValTip = false;
                });
            }
        }
        else {
            $("#J_tbSellProWrap").empty();
        }
    }

    /****************************************************************/
    /************************** 公用 /*******************************/
    /****************************************************************/

    /*
    ** 加载script脚本
    ** @scriptUrl：脚本的路径
    ** @callback：加载完成后的回调函数
    ** @callbackParms：回调函数所需要的参数对象
    */
    $.getScript = function(scriptUrl, callback, callbackParms) {
        var cacheScript = true,
            parmArray = [];

        if (!!callbackParms && typeof callbackParms == "object") {
            cacheScript = callbackParms.cache ? callbackParms.cache : false;
            parmArray = callbackParms.parameter ? callbackParms.parameter : [];
        } else {
            if (!!callbackParms && typeof callbackParms == "boolean") {
                cacheScript = callbackParms;
            }
        }
        $.ajax({
            type: "GET",
            url: scriptUrl,
            success: function() {
                try {
                    callback.apply(this, (parmArray));
                } catch (ex) { }
            },
            dataType: "script",
            cache: cacheScript
        });
    };

    /*
    ** 加载CSS样式表
    ** @scriptUrl：样式表的路径
    ** @cssCharset：样式表的字符集，可选
    */
    $.getCss = function(cssUrl, cssCharset) {
        var head = document.getElementsByTagName("head")[0];

        function createStyleSheet(url, charset) {
            var link = document.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            if (charset) {
                link.charset = charset;
            }
            link.setAttribute("href", url);
            head.appendChild(link);
        }
        if (typeof cssUrl === "string") {
            createStyleSheet(cssUrl, cssCharset);
        } else {
            if ($.isArray(cssUrl)) {
                $.each(cssUrl, function(i) {
                    createStyleSheet(cssUrl[i], cssCharset);
                });
            }
        }
    };

    //设置价格或数量为相同值
    function setSellProToSame(sellPropTableName, dom) {
        var dtype = $(dom).attr("stype"),
            area = sellPropTableName,
            items = $("#" + area + " ." + dtype + "");

        if (dom.checked) {
            if (confirm("您确定把所选列的值全部设置为第一行中的值吗？")) {
                var t = items.val()
                items.val(t);
                fillBackSellProPriceAndNum(dtype); //回填数量和价格
            }
            else {
                dom.checked = false;
            }
        }
    }

    //回填销售属性数量和价格
    function fillBackSellProPriceAndNum(type) {
        var hasSellProperty = $("#J_tbSellProperty").find("tr.trSellProp").length > 0 ||
                              $("#tbPaipaiSellPropertyDetail").find("input.price").length > 0 ||
                              $("#AmazonSellPropTable").find("tr.tr_amazon_prop").length > 0 ||
        // add by ruanhh
                              $("#J_tbPinjuSellProperty").find("tr.trSellProp").length > 0;
        if (hasSellProperty) {
            if (type == "quantity") {
                var total = getSellPropTotalNum(),
                num = 0;

                try { num = parseInt(total); } catch (e) { num = 0; }
                window.external.FillNums(num); //客户端方法
            }
            else if (type == "price") {
                var min = getSellPropMaxPrice().split('|')[0],
                max = getSellPropMaxPrice().split('|')[1],
                minprice = 0,
                maxprice = 0;

                try {
                    minprice = parseFloat(min);
                    maxprice = parseFloat(max);
                } catch (e) { minprice = 0; maxprice = 0; }
                window.external.FillPriceByMinMaxPrice(minprice, maxprice); //客户端方法
            }
        }
    }

    //获取销售属性（自定义属性）中价格的最大值和最小值
    function getSellPropMaxPrice() {
        var maxPrice = 0,
            minPrice = 0,
            arrPrice = [],
            $tr = null;

        if ($("#J_tbSellProperty").length)
            $tr = $("#J_tbSellProperty").find("input.price");
        else if ($("#tbPaipaiSellPropertyDetail").length)
            $tr = $("#tbPaipaiSellPropertyDetail").find("input.price");
        else if ($("#AmazonSellPropTable").length)
            $tr = $("#AmazonSellPropTable").find("input.nomalPrice");
        // add by ruanhh 
        else if ($("#J_tbPinjuSellProperty").length)
            $tr = $("#J_tbPinjuSellProperty").find("input.price");
        $tr.each(function() {
            var val = this.value,
                reg = /[0-9]+/;

            if (val && reg.test(val) && parseFloat(val) != 0) {
                arrPrice.push(parseFloat(val));
            }
        });
        //排序，取最大的那个
        arrPrice.sort(sortNumber);
        minPrice = arrPrice.length ? arrPrice[0] : 0;
        maxPrice = arrPrice.length ? arrPrice[arrPrice.length - 1] : 0;
        return (minPrice + "|" + maxPrice);
    }

    //获取销售属性（自定义属性）中数量总和
    function getSellPropTotalNum() {
        var totalNum = 0,
            $tr = null

        if ($("#J_tbSellProperty").length)
            $tr = $("#J_tbSellProperty").find("input.quantity");
        else if ($("#tbPaipaiSellPropertyDetail").length)
            $tr = $("#tbPaipaiSellPropertyDetail").find("input.quantity");
        // add by ruanhh
        else if ($("#J_tbPinjuSellProperty").length)
            $tr = $("#J_tbPinjuSellProperty").find("input.quantity");
        else if (true)
            $tr = $("#AmazonSellPropTable").find("input.quantity");
        $tr.each(function() {
            var val = this.value,
                reg = /[0-9]+/;

            if (val && reg.test(val)) {
                totalNum += parseInt(val);
            }
        });
        return totalNum;
    }

    //查找子属性
    function getChildProperty(id, value) {
        return window.external.FindChildProperty(id, value);
    }

    //删除子属性
    function findChildAndRemove($parent, id) {
        var $nextAll = $parent.nextAll("tr.childProp[parentId='" + id + "']");

        $.each($nextAll, function() {
            var $this = $(this),
            $child = $this.find("select") || $this.find("input");

            if ($child.length) {
                var cid = $child.attr("id").replace("prop_", "");
                $this.nextAll("tr.childProp[parentId='" + cid + "']").remove();
            }
        });
        $nextAll.remove();
    }

    //从客户端获取当前属性的默认值
    function findDefaultValue(id, pid, value) {
        var sortId = 0;
        try {
            sortId = location.href.substring(location.href.lastIndexOf("/") + 1).split("_")[0]
        } catch (e) {
            sortId = 0;
        }

        var returnJson = window.external.FindDefaultValue(id, value); //客户端方法
        if (returnJson) {
            var needInvokeAgain = fillPropertyDefaultValues(returnJson, id, value, pid);
            if (needInvokeAgain)
                fillPropertyDefaultValues(returnJson, id, value, pid);
        }
    }

    //根据默认值JSON填充属性
    function fillPropertyDefaultValues(returnJson, id, value, pid) {
        returnJson = returnJson.split("|")[0];
        if (!returnJson) return false;
        var propertyDefaultValues = eval('(' + returnJson + ')'),
            initedProp = "",    //存放填充了默认值的ID
            hasChildInvoke = false,    //标记是否触发了子属性，若是，需要再次渲染
            currentIndex = -1;  //找出现有数组中是否存在这个group

        if (!propertyDefaultValues) return;

        $.each(propertyDefaultValues, function(i) {
            var propertyId = propertyDefaultValues[i].id,    //id其实是propertyId
                propertyValue = propertyDefaultValues[i].vl; //vl是propertyValue

            if (!propertyId || !propertyValue) return true;   //JQ语法 continue

            var $objSelect = $("#" + propertyId + ":input"), //select
                $objInput = $("#" + propertyId + ":text"), //input
                $objCheckbox = $("#" + propertyId + "_" + propertyValue.replace(":", "\\:") + ":checkbox"); //checkbox

            //每组默认值分别加入不同的数组
            if (propertyId != "prop_" + id && propertyId != "prop_" + pid) {
                for (var i = 0; i < window.filledDefualtValueIds.length; i++) {
                    var valueGroup = window.filledDefualtValueIds[i].split("|");
                    if (valueGroup[0] == "group_" + id) {
                        currentIndex = i;
                        break;
                    }
                }

                if ($objCheckbox.length) {
                    if (!initedProp)
                        initedProp += "group_" + id + "|" + propertyId + "_" + propertyValue + "|";
                    else
                        initedProp += propertyId + "_" + propertyValue + "|";
                }
                else {
                    if (!initedProp)
                        initedProp += "group_" + id + "|" + propertyId + "|";
                    else
                        initedProp += propertyId + "|";
                }
            }

            //select
            if ($objSelect.length) {
                var hasChildSelect = $objSelect.attr("hasChildSelect") == "true";
                if ($objSelect.find("option[value='" + propertyValue + "']") && propertyId != "prop_" + id && propertyId != "prop_" + pid) {
                    $objSelect.val(propertyValue); //填值
                    //若改元素有子属性，则触发
                    if (hasChildSelect) {
                        $objSelect.trigger("change");
                        hasChildInvoke = true;
                    }
                }
            }

            //input
            if ($objInput.length) {
                $objInput.val(propertyValue);
            }

            //checkbox
            if ($objCheckbox.length) {
                var hasChildProperty = $objCheckbox.hasClass("hasChildProperty");
                //选中并触发事件
                //转换成DOM，因为JQ对象手动click后不能正确判断checked==true
                if (!$objCheckbox.attr("checked")) {
                    $objCheckbox.get(0).click();
                    if (hasChildProperty)
                        hasChildInvoke = true;
                }
            }
        });
        //当前数组中已经存在这个ID，则修改数组，否则加入数组
        if (currentIndex != -1) {
            window.filledDefualtValueIds[currentIndex] = initedProp;
        }
        else {
            window.filledDefualtValueIds.push(initedProp);
        }

        return hasChildInvoke;
    }

    //清除默认值
    function clearDefaultValues(id, value, pid) {
        var defaultValGroup = "group_" + id; //默认值数组格式: group_xxx_xxx|prop_xxx|prop_xxx|

        //遍历默认值ID组
        for (var i = 0; i < window.filledDefualtValueIds.length; i++) {
            var valueGroup = window.filledDefualtValueIds[i].split("|");
            if (!valueGroup) continue;
            if (valueGroup[0] == defaultValGroup) { //如果找到了
                for (var j = 1; j < valueGroup.length; j++) {
                    if (!valueGroup[j]) continue;

                    var $obj = $("#" + valueGroup[j].replace(":", "\\:") + ":input");
                    if ($obj.length) {
                        if ($obj.is("input:checkbox")) {
                            $obj.attr("checked", false);
                        }
                        else {
                            $obj.val("");
                        }
                    }
                }
                break;
            }
        }
    }

})(document);

//**********************************************/ String操作 /**********************************************//

String.prototype.trim = function() {
    var argus = arguments[0] || "\\s";
    var temp = new RegExp("(^" + argus + "*)|(" + argus + "*$)", "g");
    return this.replace(temp, "")
}

String.prototype.ltrim = function() {
    var argus = arguments[0] || "\\s";
    var temp = new RegExp("(^" + argus + "*)", "g");
    return this.replace(temp, "")
}

String.prototype.rtrim = function() {
    var argus = arguments[0] || "\\s";
    var temp = new RegExp("(" + argus + "*$)", "g");
    return this.replace(temp, "")
}

String.prototype.left = function(num1) {
    return this.substring(0, num1)
}

String.prototype.right = function(num1) {
    return this.substring(this.length - num1, this.length)
}

String.prototype.cLen = function() {
    return this.replace(/[\u00FF-\uFFFF]/g, "  ").length
}

String.prototype.cSubString = function(start, end) {
    var returnStr = '';
    var currentNum = 0;
    for (var i = 0; i < this.length; i++) {
        if (start <= currentNum && currentNum < end) {
            returnStr += this.charAt(i)
        };
        currentNum += (this.charCodeAt(i) <= 128 ? 1 : 2)
    };
    return returnStr
}

function customFireEventClick(objDom)
{
	if (document.dispatchEvent){
	objDom.checked = false;
	// 标准浏览器使用dispatchEvent方法
	var evt = document.createEvent( 'MouseEvents' );
	// initEvent接受3个参数：
	// 事件类型，是否冒泡，是否阻止浏览器的默认行为
								 
	evt.initEvent('click', true, true, window,  
      0, 0, 0, 0, 0, false, false, false, false, 0, null);
	objDom.dispatchEvent(evt);
	}
	else{
	objDom.fireEvent('onclick');
	}									
	
}
function customFireEventChange(objDom)
{
	if (document.dispatchEvent){
	// 标准浏览器使用dispatchEvent方法
	var evt = document.createEvent( 'HTMLEvents' );
	// initEvent接受3个参数：
	// 事件类型，是否冒泡，是否阻止浏览器的默认行为
								 
	evt.initEvent('change',true, true, window,  
      0, 0, 0, 0, 0, false, false, false, false, 0, null);
	objDom.dispatchEvent(evt);
	}
	else{
	objDom.fireEvent('onchange');
	}									
	
}
