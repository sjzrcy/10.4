/**
 * 提供视图服务 
 * {type, view, }
 */

define(function(require, exports, module){
  // 组件管理器
  var viewService = require('src/schema/service/viewservice');

  //----------------------基础组件----------------------------------------
  // select下拉
  var SelectView = require('src/schema/ui/type/select');
  viewService.register('select', SelectView);

  // 单行输入
  var InputView = require('src/schema/ui/type/input');
  viewService.register('input', InputView);

  // 多行输入
  var TextareaView = require('src/schema/ui/type/textarea');
  viewService.register('textarea', TextareaView);

  // 多选
  var MultiselectView = require('src/schema/ui/type/multiselect');
  viewService.register('multiselect', MultiselectView);

  // 日期
  var DateView = require('src/schema/ui/type/date');
  viewService.register('datetime', DateView);

  // radio单选
  var RadioView = require('src/schema/ui/type/radio');
  viewService.register('radio', RadioView);

  // radio单选
  var RadioRaw = require('src/schema/ui/base/asradio');
  viewService.register('radio-raw', RadioRaw);

  // radio单选
  var RadioRawVertical = require('src/schema/ui/base/asradio-vertical');
  viewService.register('radio-raw-vertical', RadioRawVertical);

  // singleimage 单图
  var SingleImageView = require('src/schema/ui/type/singleimage');
  viewService.register('singleimage', SingleImageView);

  // singletext 单行提示文本
  var SingleTextView = require('src/schema/ui/type/singletext');
  viewService.register('singletext', SingleTextView);

  // singlecheck 单个checkbox
  var SingleCheckboxView = require('src/schema/ui/type/singlecheckbox');
  viewService.register('singlecheck', SingleCheckboxView);

  // textpanel 本质上是html源码容器
  var TextPanelView = require('src/schema/ui/type/textpanel');
  viewService.register('textpanel', TextPanelView);

  // import-value 值导入
  var ImportValue = require('src/schema/ui/type/importvalue');
  viewService.register('importvalue', ImportValue);

  //----------------------业务组件----------------------------------------
  // panel 组件面板
  var PanelView = require('src/schema/ui/biz/panel/index');
  viewService.register('panel', PanelView);

  // 多媒体
  var MediaView = require('src/schema/ui/biz/media/index');
  viewService.register('media', MediaView);

  // 多媒体 - 不提供title
  var MediaContent = require('src/schema/ui/biz/media/media/mediacontent');
  viewService.register('media-raw', MediaContent);

  // 价格库存
  var PriceQuantityView = require('src/schema/ui/biz/price-quantity/view');
  viewService.register('price-quantity', PriceQuantityView);

  // 上架
  var StartTime = require('src/schema/ui/biz/starttime');
  viewService.register('starttime', StartTime);

  // 售后
  var AfterSaleView = require('src/schema/ui/biz/aftersale/view');
  viewService.register('aftersale', AfterSaleView);

  // 物流
  var DeliverView = require('src/schema/ui/biz/deliver/view');
  viewService.register('deliver', DeliverView);

  // 店铺类目
  var ShopCatsView = require('src/schema/ui/biz/shopcats');
  viewService.register('shopcats', ShopCatsView);

  // 所在地
  var LocationView = require('src/schema/ui/biz/location');
  viewService.register('location', LocationView);

  // 类目属性 - 单行输入
  var PropInput = require('src/schema/ui/props/base/input');
  viewService.register('prop_input', PropInput);

  // 类目属性 - 单选输入
  var PropSelect = require('src/schema/ui/props/base/select'); 
  viewService.register('prop_select', PropSelect);

  // 类目属性 - 多选输入
  var PropMultiSelect = require('src/schema/ui/props/base/multiselect');
  viewService.register('prop_multiselect', PropMultiSelect);

  // 类目属性 - 材质
  var PropMaterial = require('src/schema/ui/props/base/material/index');
  viewService.register('prop_material', PropMaterial);

  // 类目属性 - 时间
  var PropDateTime = require('src/schema/ui/props/base/datetime/index');
  viewService.register('prop_datetime', PropDateTime);

  // 类目属性 - 时间区间
  var PropTimeRange = require('src/schema/ui/props/base/timerange/index');
  viewService.register('prop_timerange', PropTimeRange);

  // 类目属性 - 度量衡
  var PropMeasure = require('src/schema/ui/props/base/measure/index');
  viewService.register('prop_measure', PropMeasure);

  // customprops
  var CustomProps = require('src/schema/ui/props/type/customprops/index');
  viewService.register('customprops', CustomProps);

  // spuinfo
  var SpuInfo = require('src/schema/ui/props/type/spuinfo/index');
  viewService.register('spuinfo', SpuInfo);

  // spuconfirm
  var SpuConfirm = require('src/schema/ui/props/type/spuconfirm/index');
  viewService.register('spuconfirm', SpuConfirm);

  // SKU颜色
  var SkuColor = require('src/schema/ui/sku/metas/color/index');
  viewService.register('sku-color', SkuColor);

  // SKU颜色
  var SkuColor2 = require('src/schema/ui/sku/metas/bettercolor/index');
  viewService.register('sku-color2', SkuColor2);

  // SKU尺码
  var SkuSize = require('src/schema/ui/sku/metas/size/index');
  viewService.register('sku-size', SkuSize);

  // 尺码表
  var SizeTemplate = require('src/schema/ui/sku/metas/sizetemplate/index');
  viewService.register('size-template', SizeTemplate);

  // 脚型图和测量图
  var FootSize = require('src/schema/ui/sku/metas/footsize/index');
  viewService.register('foot-size', FootSize);

  // 度量衡
  var SkuMeasure = require('src/schema/ui/sku/metas/measure/index');
  viewService.register('measure', SkuMeasure);

  // SKU时间点
  var SkuDateTime = require('src/schema/ui/sku/metas/datetime/index');
  viewService.register('sku-datetime', SkuDateTime);

  // SKU时间区间
  var SkuTimeRange = require('src/schema/ui/sku/metas/timerange/index');
  viewService.register('sku-timerange', SkuTimeRange);

  // 预售
  var PreSale = require('src/schema/ui/biz/presale/index');
  viewService.register('presale', PreSale);
});