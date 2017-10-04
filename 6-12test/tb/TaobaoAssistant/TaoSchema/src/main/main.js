
/* jshint -W106 */

// 全局按键监听
var handleGlobalKeyUpEvent = function(){
  // ctrl + s 保存当前商品
  as.key.listenKeyUp('S', function(){
    entity_save();
  }, {ctrl: true});

  // shift + F2 拷贝当前宝贝的clientid
  as.key.listenKeyUp('F2', function(){
    as.shell.copyClientId();
  }, {shift: true});

  // 响应F1快捷键
  as.key.listenKeyUp('F1', function(){
    as.shell.keyF1Release();
  });
};

// 实时监控鼠标位置
var handleMouseMove = function(){
  document.onmousemove = function(){
    as.clientX = event.clientX;
    as.clientY = event.clientY;
  };
};

// 整个页面结构ready
var pageReadyCbs = [];
var pageReady = function(cb){
  if(typeof cb === 'function'){
    pageReadyCbs.push(cb);
  }
};
var handlePageReady = function(){
  for(var i = 0; i < pageReadyCbs.length; ++i){
    pageReadyCbs[i]();
  }
};

// 跳转到mock
var toMock = function(){
  location.href= 'file:///C:/work/tbassistantTbSchema_v2/client/bin/win32/Debug/TaoSchema/src/main/mock.html?base=daily';
};

// 跳转到index
var toIndex = function(){
  location.href= 'file:///C:/work/tbassistantTbSchema_v2/client/bin/win32/Debug/TaoSchema/src/main/index.html?base=daily';
};

// 识别当前页面所处的环境[host=qn/as]
(function(){
  window.asHost = 'as';
  window.isInQN = function(){
    return window.asHost === 'qn';
  };

  var search = location.search.substring(1);
  if(search){
    var pairs = search.split('&');
    var params = {};
    for(var i = 0; i < pairs.length; ++i){
      var pair = pairs[i];
      var list = pair.split('=');
      if(list.length === 2){
        params[list[0]] = list[1];
      }
    }

    // 显示设置当前页面的宿主[as, qn]
    if(params.host){
      window.asHost = params.host;
    }
  }
})();

// config
require.config({
  baseUrl: '../../',
  paths: {
    domReady: 'sdk/require-domReady',
    as: 'src/as',
  }
});

// domReady
require(['domReady', 'as'], function(domReady, as){
  domReady(function(){
    // 建立基本结构
    var service = as.service.get('tab');
    var itemEditView = new service.view({model: (new service.model({id: service.id}))});
    itemEditView.render();
    $('body').append(itemEditView.$el);

    // 按键事件管理初始化
    as.key.init();
    handleGlobalKeyUpEvent();

    // 插件加载初始化
    $('body').trigger('pluginReady');

    // mock标记
    if(_.isObject(window.UIConfig)){
      setTimeout(function(){
        as.entity.setCategoryId(1512);
        warn(JSON.stringify(UIConfig));
        as.schema.refresh(JSONSchema, UIConfig, BizData);
      }, 25);
    }else{
      // 通知后端页面已经ready
      as.shell.pageReady();
    }

    // record mouse x,y
    handleMouseMove();

    // page ready
    handlePageReady();
  });
});