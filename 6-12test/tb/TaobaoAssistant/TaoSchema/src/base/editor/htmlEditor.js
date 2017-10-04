/**
 * Created by muhua.gmh on 3/24/2016.
 */

define(function (require, exports, module) {
	var HtmlEditor = function(){
		var html_ = '<div id=\"editor_wrapper\"><ul id=\"toolbar\"><li class=\"item\" id=\"selectAll\" title=\"选择所有\"></li><li class=\"splitter\"></li><li class=\"item\" id=\"undo\" title=\"撤销\"></li><li class=\"item\" id=\"redo\" title=\"恢复\"></li><li class=\"splitter\"></li><li class=\"item\" id=\"cut\" title=\"剪切\"></li><li class=\"item\" id=\"copy\" title=\"复制\"></li><li class=\"item\" id=\"paste\" title=\"粘贴\"></li><li class=\"splitter\"></li><li class=\"item\" id=\"insertImage\" title=\"插入图片\"></li><li class=\"item\" id=\"fontFamily\" title=\"字体名称\"></li><li class=\"item\" id=\"fontSize\" title=\"字体大小\"></li><li class=\"splitter\"></li><li class=\"item\" id=\"bold\" title=\"加粗\"></li><li class=\"item\" id=\"italic\" title=\"倾斜\"></li><li class=\"item\" id=\"underline\" title=\"下划线\"></li><li class=\"item\" id=\"strikeThrough\" title=\"删除线\"></li><li class=\"splitter\"></li><li class=\"item\" id=\"alignLeft\" title=\"对齐 左对齐\"></li><li class=\"item\" id=\"alignCenter\" title=\"对齐 居中\"></li><li class=\"item\" id=\"alignRight\" title=\"对齐 右对齐\"></li><li class=\"item\" id=\"alignJustify\" title=\"对齐 伸缩\"></li><li class=\"splitter\"></li><li class=\"item\" id=\"increaseIndent\" title=\"增加缩进\"></li><li class=\"item\" id=\"decreaseIndent\" title=\"减少缩进\"></li><li class=\"splitter\"></li><li class=\"item\" id=\"setUnorderedList\" title=\"项目符号列表\"></li><li class=\"item\" id=\"setOrderedList\" title=\"编号列表\"></li><li class=\"splitter\"></li><li class=\"item\" id=\"createLink\" title=\"创建链接\"></li><li class=\"item\" id=\"removeHyperlink\" title=\"创建链接\"></li><li class=\"splitter\"></li><li class=\"item\" id=\"insertTable\" title=\"插入表格\"></li><li class=\"item\" id=\"backgroundColor\" title=\"背景颜色\"></li><li class=\"item\" id=\"textColor\" title=\"文本颜色\"></li><li class=\"item\" id=\"zoomOut\" title=\"缩小\"></li><li class=\"item\" id=\"zoomIn\" title=\"放大\"></li><li id=\"zoomPercent\"><input type=\"text\" value=\"100%\" id=\"zoomPercentVal\" /><div id=\"rightMenu\"></div></li><li class=\"item\" id=\"switchSourceCode\" title=\"源代码/可视化编辑\"></li><li class=\"splitter\"></li><li id=\"paragraphFormat\"><select id=\"paragraphFormatVal\"><option value=\"普通\">普通</option><option value=\"已编排格式\">已编排格式</option><option value=\"地址\">地址</option><option value=\"标题 1\">标题 1</option><option value=\"标题 2\">标题 2</option><option value=\"标题 3\">标题 3</option><option value=\"标题 4\">标题 4</option><option value=\"标题 5\">标题 5</option><option value=\"标题 6\">标题 6</option><option value=\"带编号的列表\">带编号的列表</option><option value=\"带项目符号的列表\">带项目符号的列表</option><option value=\"目录列表\">目录列表</option><option value=\"菜单列表\">菜单列表</option><option value=\"定义条目\">定义条目</option><option value=\"段落\">段落</option></select></li></ul><object name=\"npEditor\" id=\"npEditor\" type=\"application/nphtmleditor-plugin\" style=\"width:100%; \"></object><div id=\"fontSizeDialog\" class=\"popupDialog\"><span id=\"selectFontPrompt\">字体大小</span><span><select id=\"selectedFontSize\"><option value=\"1\">特小号</option><option value=\"2\">小号</option><option value=\"3\">中号</option><option value=\"4\">大号</option><option value=\"5\">特大号</option><option value=\"6\">最大号</option></select></span></div><div id=\"fontFamilyDialog\" class=\"popupDialog\"><span id=\"selectFontFamilyPrompt\">选择字体</span><span><select id=\"selectedFontFamily\"></select></span></div><div id=\"createLinkDialog\" class=\"popupDialog\"><div id=\"createLinkPrompt\">输入URL可能被淘宝网过滤规则过滤掉，详情如下：<br/>1. 可以使用淘宝网及其子公司的链接<br/>2. 可以使用阿里巴巴，阿里妈妈以及阿里云公司链接<br/>3. 不能使用淘宝客链接，画报，购物，搜索等链接</div><div id=\"createLinkInfo\"><div id=\"createLinkOption1\"><div>类型：<select id=\"linkProtocol\"><option>http:</option><option>https:</option></select></div><div id=\"createLinkType\"><input type=\"checkbox\" id=\"createLinkInNewWindow\" checked=\"checked\"/><label for=\"createLinkInNewWindow\">在新窗口打开链接</label></div></div><div id=\"createLinkOption2\"><label id=\"createLinkValuePrompt\" for=\"createLinkValue\">URL：</label><input type=\"text\" id=\"createLinkValue\" /></div></div><div id=\"filterPrompt\">可能会被过滤掉</div></div><div id=\"createTableDialog\" class=\"popupDialog\"><div id=\"createTableLeftPart\"><div><label for=\"tableRowCount\" id=\"tableRowCountPrompt\">行</label><input type=\"text\" id=\"tableRowCount\" value=\"3\" /></div><div><label for=\"tableColumnCount\" id=\"tableColumnCountPrompt\">列</label><input type=\"text\" id=\"tableColumnCount\" value=\"3\" /></div><div><label for=\"tableWidth\" id=\"tableWidthPrompt\">宽</label><input type=\"text\" id=\"tableWidth\" value=\"150\" /><span class=\"tableUnit\">px</span></div><div><label for=\"tableHeight\" id=\"tableHeightPrompt\">高</label><input type=\"text\" id=\"tableHeight\" value=\"150\" /><span class=\"tableUnit\">px</span></div></div><div id=\"createTableRightPart\"><div><span id=\"borderColorPrompt\">边框颜色</span><span id=\"tableBorderChooser\"><span id=\"borderColorInfo\">选择颜色</span><span id=\"borderColorChooser\"></span></span></div><div><label for=\"borderWidth\" id=\"borderWidthPrompt\">边框大小</label><input type=\"text\" id=\"borderWidth\" value=\"1\"/></div><div><input type=\"checkbox\" id=\"collapseBorder\" checked=\"checked\" /><label for=\"collapseBorder\" id=\"collapseBorderPrompt\">合并边框</label></div></div></div><div id=\"selectFontFamilyDialog\" class=\"popupDialog\"><div><span id=\"fontNamePrompt\">字体名称</span></div><div><select id=\"fontFamilyList\"></select></div></div></div>';

		var iframeHtml_ = '<div class=\"iframeDiv\"><iframe class=\"maskIframe\" frameborder=\"0\"></iframe></div>';

		var jPickerHtml_ = '<div class=\"jPickerDialog\"><div class=\"jPickerContent\"></div></div>';

		this.onContextMenuInsertImage = null;
		this.linkFilterRule = /\s*https?:\/\/(?!cam.taoke.alimama.com)(?!click.alimama.com)(?!gouwu.alimama.com)(?!haibao.huoban.taobao.com)(?!huoban.taobao.com)(?!p.alimama.com)(?!pindao.huoban.taobao.com)(?!s.click.taobao.com)(?!search8.taobao.com)(?!t.alimama.com)(?!taoke.alimama.com)(?!tk.alimama.com)(?:[a-zA-Z0-9\-_]+\.){1,6}(?:tmall|taobao|alipay|alibaba|alimama|koubei|alisoft|hitao)\.com(?:\/[^\/]+)*/;

		var toolbar_ = null;
		var editor_ = null;
		var npEditor_ = null;
		var wrapper_ = null;
		var sourceEditStatus_ = false;
		var dlgTable_ = null;
		var dlgCreateLink_ = null;
		var dlgSetFontSize_ = null;
		var dlgSelectFontFamily_ = null;
		var self_ = null;
		var dialogCount_ = 4;
		var currentDialog_ = null;
		var foregroundColorDialog_ = null;
		var backgroundColorDialog_ = null;
		var tableBorderColorDialog_ = null;
		var initialized_ = false;
		var hideContainer_ = null;
		var parent_ = null;

		// by@艮离
		var htmlCache = '';

		this.init = function(parent){
			if (initialized_){
				return;
			}

			var editorWrapper = $(html_);
			wrapper_ = editorWrapper;
			editor_ = editorWrapper.find("#npEditor");
			toolbar_ = editorWrapper.find("#toolbar");
			npEditor_ = editor_[0];
			parent.append(editorWrapper);

			this.fitSize(parent);
			parent_ = parent;
			self_ = this;

			initHideContainer();
			this.hide();
			initUIComponents();
			displayZoomLevel();
			initialized_ = true;
			
			try{
				window.parent.descEditor = this;
				window.parent.npEditor = npEditor_;
			} catch (err) {
				console.trace(err);
			}
		};

		this.fitSize = function(parent){
			var parentHeight = parent.height();
			var toolbarHeight = toolbar_.height();
			var height = parentHeight - toolbarHeight;
			editor_.attr("height", height);
			editor_.attr("width", parent.width());
		};

		this.setHtml = function(html){
			htmlCache = html;
			npEditor_.html = html;
		};

		this.updateHtmlCache = function(){
			htmlCache = npEditor_.html;
		};

		this.clearHtmlCache = function(){
			htmlCache = '';
		};

		this.getHtml = function(){
			var html = npEditor_.html;
			if (!html){
				html = htmlCache;
			}
			return html;
		};

		this.insertHtml = function(html){
			npEditor_.insertHtml(html);
		};

		this.refresh = function() {
			setTimeout(function(){
				var realTimeHtml = npEditor_.html;
				if(!realTimeHtml){
					realTimeHtml = htmlCache;
				}
				npEditor_.html = realTimeHtml;
			}, 200);
		};

		this.redraw = function(){
			npEditor_.redraw();
		};

		this.show = function(parent){
			if (parent == undefined){
				parent = parent_;
			}

			if (!parent){
				return false;
			}

			var savedHtmlWhenDetach = this.getHtml();
			wrapper_.detach();
			parent.append(wrapper_);
			this.setHtml(savedHtmlWhenDetach);

			this.fitSize(parent);
			parent_ = parent;
			return true;
		};

		this.hide = function(){
			this.updateHtmlCache();
			htmlCache = npEditor_.html;
			wrapper_.detach();
			hideContainer_.append(wrapper_);
			return true;
		};

		// private functions
		var onContextMenuInsertTable = function(){
			dlgTable_.showDialog(true);
		};

		this._onContextMenuInsertImage = function(){
			if (self_.onContextMenuInsertImage != null){

				var callBackForPictureSpace = function(imageList){
					$(imageList).each(function(index, imageUrl){
						var imageAttribute = {
							src : imageUrl
						};
						npEditor_.insertImage(imageAttribute);
					});
				};

				self_.onContextMenuInsertImage(callBackForPictureSpace);
			}
		};

		var onContextMenuInsertHyperlink = function(){
			dlgCreateLink_.showDialog();
		};

		function onContextMenuTableAttribute(table, attribute){
			dlgTable_.showDialog(false, table, attribute);
		}

		var displayZoomLevel = function(){
			var level = npEditor_.zoomLevel;
			var displayText = level + "%";
			toolbar_.find("#zoomPercentVal").val(displayText);
		};

		var setZoomLevel = function(str){
			var percentIndex = str.indexOf('%');
			if (percentIndex != -1){
				str = str.substr(0, percentIndex);
			}
			npEditor_.zoomLevel = parseInt(str);
		};

		var initZoomLevel = function(){
			// 缩放按钮以及文本框
			toolbar_.find("#zoomIn").click(displayZoomLevel);
			toolbar_.find("#zoomOut").click(displayZoomLevel);
			var percentObj = toolbar_.find("#zoomPercentVal");
			percentObj.keydown(function(event){
				if (event.keyCode == 13){
					setZoomLevel($(this).val());
					displayZoomLevel();
				}
			});
			percentObj.click(function(){$(this).select();});
		};

		var jqueryColorToHexFormat = function(jqueryColor){
			var parts = jqueryColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
			delete(parts[0]);
			for (var i = 1; i <= 3; ++i) {
				parts[i] = parseInt(parts[i]).toString(16);
				if (parts[i].length == 1) parts[i] = '0' + parts[i];
			}
			color = '#' + parts.join('');

			return color;
		};

		var initTableBorderColorDialog = function(){
			tableBorderColorDialog_ = new JPickerDialog("选择边框颜色",
				function(color, content){
					var color = '#' + color.val('all'). hex;
					$("#tableBorderChooser").css("border-color", color);
				}
			);

			dlgTable_.find("#tableBorderChooser").bind(
				"click", function(){
					tableBorderColorDialog_.dialog("open");
				}
			);

			dlgTable_.bind("dialogclose", function(){
				tableBorderColorDialog_.dialog("close");
			});
		};

		var initCreateTableDialog = function(){
			dlgTable_ = $("#createTableDialog").dialog({
				height : 284,
				width : 330,
				autoOpen : false,
				resizable : false,
				buttons : {
					"确定" : function(){
						if (dlgTable_.isCreateNew){
							npEditor_.insertTable(dlgTable_.getUITableAttribute());
						}
						else{
							dlgTable_.currentTable.setAttribute(dlgTable_.getUITableAttribute());
						}
						$(this).dialog("close");
					},
					"取消" : function(){ $(this).dialog("close"); }
				}
			});

			var bgFrame = createBgframe();
			var bgIframeController = new BGFrameController(bgFrame,
											dlgTable_.parent());
			bgIframeController.bindEvents();

			dlgTable_.showDialog = function(createNew, currentTable, attributes){
				dlgTable_.isCreateNew = createNew;
				if (!createNew){
					dlgTable_.setUITableAttribute(attributes);
					dlgTable_.currentTable = currentTable;
				}

				dlgTable_.dialog("open");
			};

			dlgTable_.getUITableAttribute = function(){
				var rows = dlgTable_.find("#tableRowCount").val();
				var columns = dlgTable_.find("#tableColumnCount").val();
				var width = dlgTable_.find("#tableWidth").val();
				var height = dlgTable_.find("#tableHeight").val();
				var borderWidth = dlgTable_.find("#borderWidth").val();
				var borderCollapsed = dlgTable_.find("#collapseBorder").is(':checked');
				borderCollapsed = borderCollapsed == true ? "1" : "0";
				var borderColor = dlgTable_.find("#tableBorderChooser").css("border-color");
				borderColor = jqueryColorToHexFormat(borderColor);

				var tableAttribute = {
					rowCount : rows,
					columnCount : columns,
					borderColor : borderColor,
					width : width,
					height : height,
					collapse: borderCollapsed,
					borderWidth : borderWidth
				};

				return tableAttribute;
			};

			dlgTable_.setUITableAttribute = function(attribute){
				dlgTable_.find("#tableRowCount").val(attribute.rowCount);
				dlgTable_.find("#tableColumnCount").val(attribute.columnCount);
				dlgTable_.find("#tableWidth").val(attribute.width);
				dlgTable_.find("#tableHeight").val(attribute.height);
				dlgTable_.find("#borderWidth").val(attribute.borderWidth);
				var collapseObj = dlgTable_.find("#collapseBorder");

				if (attribute.collapse == 1){
					collapseObj.attr("checked", "checked");
				}
				else{
					collapseObj.removeAttr("checked");
				}
				dlgTable_.find("#tableBorderChooser")
					.css("border-color", attribute.borderColor)
			};

			toolbar_.find("#insertTable").click(function(){
				dlgTable_.showDialog(true);
			});
		};

		var createBgframe = function(){
			var newIframe = $(iframeHtml_);
			$(document.body).append(newIframe);
			return newIframe;
		};

		var createJPicker = function(){
			var newJPicker = $(jPickerHtml_);
			wrapper_.append(newJPicker);
			return newJPicker;
		};

		var BGFrameController = function(bgFrame, dialog){
			this.bgIframe = bgFrame;
			this.jqueryUIDialog = dialog;

			this.onOpen = function(){
				var jqueryUIDialog = this.jqueryUIDialog;

				var dialogHeight = jqueryUIDialog.outerHeight();
				var dialogWidth = jqueryUIDialog.outerWidth();
				this.bgIframe.css("height", dialogHeight + 2);
				this.bgIframe.css("width", dialogWidth + 2);
				var position = jqueryUIDialog.position();
				this.bgIframe.css("top", position.top - 2);
				this.bgIframe.css("left", position.left - 2 );
				this.bgIframe.show();
			};

			this.onDrag = function(event, ui){
				if (ui === undefined
					|| ui.position === undefined){
					return;
				}
				this.bgIframe.css("top", ui.position.top - 2);
				this.bgIframe.css("left", ui.position.left - 2);
			};

			this.onClose = function(event, ui){
				this.bgIframe.hide();
			};

			this.bindEvents = function(){
				var dialog = this.jqueryUIDialog;
				var self = this;

				dialog.bind("dialogopen", function(){
					self.onOpen();
				});
				dialog.bind("dialogdrag", function(ev, ui){
					self.onDrag(ev, ui);
				});
				dialog.bind("dialogclose", function(ev, ui){
					self.onClose(ev, ui);
				});
			};

			this.bindEvents();
		};

		var initCreateLinkDialog = function(){
			dlgCreateLink_ = $("#createLinkDialog").dialog({
				height : 330,
				width : 400,
				autoOpen : false,
				resizable : false,
				buttons : {
					"确定" : function(){
						dlgCreateLink_.insertLink();
						$(this).dialog("close");
					},
					"取消" : function(){ $(this).dialog("close"); }
				}
			});

			var bgFrame = createBgframe();
			var bgIframeController = new BGFrameController(bgFrame,
										 dlgCreateLink_.parent());

			var linkSelector = dlgCreateLink_.find("#linkProtocol");
			dlgCreateLink_.showDialog = function(){
				this.find("#createLinkValue").val("");
				this.dialog("open");
				this.find("#createLinkValue").focus();
				linkSelector.trigger("change");
			};

			dlgCreateLink_.insertLink = function(){
				var linkInputObj = this.find("#createLinkValue");
				var link = linkInputObj.val();

				var isNewWindow = this.find("#createLinkInNewWindow").is(':checked');
				console.log(isNewWindow);
				var target = isNewWindow == true ? "_blank" : "";

				var hyperLink = {
					href : link,
					target : target
				};
				npEditor_.setHyperlink(hyperLink);
			};

			toolbar_.find("#createLink").click(function(){
				dlgCreateLink_.showDialog();
			});

			dlgCreateLink_.find("#createLinkValue").keyup(function(event){
				var input = $(this).val();
				var filterObj = $("#filterPrompt");
				if (!input.match(self_.linkFilterRule)){
					filterObj.css("display", "block");
				}
				else{
					filterObj.css("display", "none");
				}
			});

			linkSelector.change(function(){
				var linkMap = {
					'http' : "http://",
					'https' : "https://"
				};
				var selectedVal = linkSelector.val();
				var scheme = selectedVal.substr(0, selectedVal.indexOf(":"));
				var schemeValue = linkMap[scheme];
				var textObj = $("#createLinkValue");
				var oldValue = textObj.val();

				if (oldValue.length == 0){
					textObj.val(schemeValue);
				}
				else{
					var regEx = /.+:\/\//;
					textObj.val(oldValue.replace(regEx, schemeValue));
				}
			});
		};

		var initFontFamilyDialog = function(){
			dlgSelectFontFamily_ = $("#selectFontFamilyDialog").dialog({
				height : 200,
				autoOpen : false,
				resizable : false,
				buttons : {
					"确定" : function(){
						npEditor_.setFontName($("#fontFamilyList").val());
						$(this).dialog("close");
					},
					"取消" : function(){ $(this).dialog("close"); }
				}
			});

			var bgFrame = createBgframe();
			var controller = new BGFrameController(bgFrame,
									dlgSelectFontFamily_.parent());

			dlgSelectFontFamily_.displayInstalledFonts = function(){
				var fontFamilyList = npEditor_.getInstalledFonts(true);
				var lst = $("#fontFamilyList");
				lst.find("option").remove();

				$(fontFamilyList).each(function(index, item){
					var newOption = $(document.createElement("option"));
					newOption.val(item);
					newOption.text(item);
					lst.append(newOption);
				});
			};

			dlgSelectFontFamily_.displayInstalledFonts();

			toolbar_.find("#fontFamily").click(function(){
				dlgSelectFontFamily_.dialog("open");
			});
		};

		var initFontSizeDialog = function(){
			dlgSetFontSize_ = $("#fontSizeDialog").dialog({
				height : 200,
				resizable : false,
				autoOpen : false,
				buttons:{
					"确定" : function(){
						npEditor_.setFontSize($("#selectedFontSize").val());
						$(this).dialog("close");
					},
					"取消" : function(){ $(this).dialog("close"); }
				}
			});

			var bgFrame = createBgframe();
			var controller = new BGFrameController(bgFrame,
									dlgSetFontSize_.parent());

			toolbar_.find("#fontSize").click(function(){
				dlgSetFontSize_.dialog("open");
			});
		};

		var JPickerDialog = function(title, commitCallback){
			var dialog = createJPicker().dialog({
				height : 422,
				width : 580,
				autoOpen : false,
				resizable : false
			});

			var bgFrame = createBgframe();
			var controller = new BGFrameController(bgFrame, dialog.parent());
			var jPickerSettings = createJPickerSettings(title);
			jPickerSettings.window.expandable = false;

			dialog.find(".jPickerContent").jPicker(jPickerSettings,
				function(color, content){
					commitCallback(color, content);
					dialog.dialog("close");
				},      // commit callback
				null,   // live callback
				function(){ // cancel callback
					dialog.dialog("close");
				}
			);

			return dialog;
		};

		var initForegroundColorDialog = function(){
			foregroundColorDialog_ = new JPickerDialog("选择文本颜色",
				function(color, content){
					var color = '#' + color.val('all').hex;
					npEditor_.setForegroundColor(color);
				}
			);

			var textColorObj = toolbar_.find("#textColor");
			textColorObj.bind("click", function(){
				foregroundColorDialog_.dialog("open");
			});
		};

		var initBackgroundColorDialog = function(){
			var backgroundColorObj = toolbar_.find("#backgroundColor");

			backgroundColorDialog_ = new JPickerDialog("选择背景颜色",
				function(color, content){
					var color = '#' + color.val('all').hex;
					npEditor_.setBackgroundColor(color);
				}
			);

			backgroundColorObj.bind("click", function(){
				backgroundColorDialog_.dialog("open");
			});
		};

		var initDialogs = function(){
			initCreateLinkDialog();
			initCreateTableDialog();
			initFontFamilyDialog();
			initFontSizeDialog();
			initForegroundColorDialog();
			initBackgroundColorDialog();
			initTableBorderColorDialog();
		};

		var initTrivalFunctions = function(){
			var trivalFunctionList = new Array(
				"undo","redo","zoomIn","zoomOut","copy","paste","cut","bold","italic",
				"underline", "strikeThrough", "alignLeft", "alignCenter", "alignJustify",
				"alignRight", "increaseIndent","decreaseIndent","setOrderedList",
				"setUnorderedList", "removeHyperlink", "selectAll"
			);

			$(trivalFunctionList).each(function(index, item){
				toolbar_.find("#" + item).click(function(){
					eval("npEditor_." + item + "()");
				});
			});

			toolbar_.find("#switchSourceCode").click(function(){
				sourceEditStatus_ = !sourceEditStatus_;
				npEditor_.showSourceCode(sourceEditStatus_);
			});

			toolbar_.find("#insertImage").click(function(){
				self_._onContextMenuInsertImage();
			});
		};

		var initParagraphFormat = function(){
			var paragraphFormatObj = toolbar_.find("#paragraphFormatVal");
			var setBlockFormatFunc = function(){
				npEditor_.setBlockFormat(paragraphFormatObj.val());
			};
			paragraphFormatObj.isOpen = true;

			paragraphFormatObj.change(setBlockFormatFunc);
		};

		var initContextMenuHandler = function(){
			npEditor_.onContextMenuInsertImage = self_._onContextMenuInsertImage;
			npEditor_.onContextMenuInsertTable = onContextMenuInsertTable;
			npEditor_.onContextMenuInsertHyperlink = onContextMenuInsertHyperlink;
			npEditor_.onContextMenuTableAttribute = onContextMenuTableAttribute;
		};

		var initUIComponents = function(){
			initContextMenuHandler();
			initTrivalFunctions();
			initZoomLevel();
			initParagraphFormat();
			initDialogs();
		};

		var initHideContainer = function(){
			hideContainer_ = $(document.createElement("div"));
			hideContainer_.attr("id", "_hideContainer");
			hideContainer_.css({
				"left" : "-1000px",
				"top" : "-1000px",
				"position" : "fixed",
				"height" : "1px",
				"width" : "1px"
			});
			$("body").append(hideContainer_);
		}
	};

	module.exports = HtmlEditor;
});