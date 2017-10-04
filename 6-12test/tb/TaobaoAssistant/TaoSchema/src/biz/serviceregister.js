/**
 * 服务注册
 */

define(function(require, exports, module){
  //
  var service = require('src/base/service');

  // tab 
  var TabModel = require('src/base/framework/tab/model');
  var TabView = require('src/base/framework/tab/view');
  service.register({
    id: 'tab',
    pid: 'as',
    order: 1,
    model: TabModel,
    view: TabView
  });

  // 第一级 
  var ItemTabModel = require('src/base/framework/tab/item/model');
  var ItemTabView = require('src/base/framework/tab/item/view');
  var MainTabView = require('src/biz/main/view');
  var MainTabModel = require('src/biz/main/model');

  {
    // 商品信息
    service.register({
      id: 'main',
      pid: 'tab',
      order: 10,
      model: MainTabModel,
      view: MainTabView
    });

    {
      // 商品信息 - 区块渲染

      // 基本信息
      var BasicModel = require('src/biz/basic/model');
      var BasicView = require('src/biz/basic/view');
      service.register({
        id: 'basic',
        pid: 'main',
        order: 10,
        model: BasicModel,
        view: BasicView,
        other: {
          title: '基本信息'
        }
      });

      {
        // left 
        var BasicLeftModel = require('src/biz/basic/left/model');
        var BasicLeftView = require('src/biz/basic/left/view');
        service.register({
          id: 'basic-left',
          pid: 'basic',
          order: 10,
          model: BasicLeftModel,
          view: BasicLeftView,
          other: {
            layout: 'basic-left'
          }
        });

        // props 
        var BasicPropsModel = require('src/biz/basic/props/model');
        var BasicPropsView = require('src/biz/basic/props/view');
        service.register({
          id: 'basic-props',
          pid: 'basic',
          order: 10,
          model: BasicPropsModel,
          view: BasicPropsView,
          other: {
            layout: 'basic-props'
          }
        });

        // right 
        var BasicRightModel = require('src/biz/basic/right/model');
        var BasicRightiew = require('src/biz/basic/right/view');
        service.register({
          id: 'basic-right',
          pid: 'basic',
          order: 10,
          model: BasicRightModel,
          view: BasicRightiew,
          other: {
            layout: 'basic-right'
          }
        });
      }

      // 价格库存
      var SkuModel = require('src/biz/sku/model');
      var SkuView = require('src/biz/sku/view');
      service.register({
        id: 'sku',
        pid: 'main',
        order: 20,
        model: SkuModel,
        view: SkuView,
        other: {
          title: '价格库存'
        }
      });

      // 商品资质
      var QualificationModel = require('src/biz/qualification/model');
      var QualificationView = require('src/biz/qualification/view');
      service.register({
        id: 'qualification',
        pid: 'main',
        order: 30,
        model: QualificationModel,
        view: QualificationView,
        other: {
          title: '商品资质'
        }
      });

      {
        // 其他信息 区块渲染
        var OtherModel = require('src/biz/other/model');
        var OtherView = require('src/biz/other/view');
        service.register({
          id: 'other',
          pid: 'main',
          order: 40,
          model: OtherModel,
          view: OtherView,
          other: {
            layout: 'other',
            title: '其他信息'
          }
        });
      }

      {
        // 食品安全
        service.register({
          id: 'food',
          pid: 'main',
          order: 35,
          model: OtherModel,
          view: OtherView,
          other: {
            layout: 'food',
            title: '食品安全'
          }
        });
      }

    }

    // PC端 - 商品描述
    var DescTabModel = require('src/base/framework/tab/desc/model');
    var DescTabView = require('src/base/framework/tab/desc/view');
    if(isInQN()){
      DescTabView = require('src/base/framework/tab/desc/qn-view');
    }

    service.register({
      id: 'desc-pc',
      pid: 'tab',
      order: 50,
      model: DescTabModel,
      view: DescTabView,
      other: {
        title: '宝贝描述'
      }
    });

    // 移动端商品描述 - 千牛不支持
    if(!isInQN()){
      var WirelessTabModel = require('src/base/framework/tab/wireless/model');
      var WirelessTabView = require('src/base/framework/tab/wireless/view');
      service.register({
        id: 'desc-wireless',
        pid: 'tab',
        order: 60,
        model: WirelessTabModel,
        view: WirelessTabView,
        other: {
          title: '无线描述'
        }
      });
    }

    // ----------------------------------------
    // 类目 
    var CategoryModel = require('src/biz/category/model');
    var CategoryView = require('src/biz/category/view');
    service.register({
      id: 'category',
      pid: 'as',
      order: 50,
      model: CategoryModel,
      view: CategoryView
    });
  }
  //  
});