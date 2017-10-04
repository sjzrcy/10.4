define(function(require, exports, module){
  /**
 *
 * 预售组件
 * @author 无待 <zhangguo.zg@alibaba-inc.com>
 *
 */

var messageHandle = function(e){
  try {
    module.exports.onMessage(JSON.parse(e.data));
  } catch (e) {
    //alert('预售组件，postmessage，非法json');
  }
};

module.exports = {
  /**
   *
   * 初始化
   * @param options
   *
   */
  init: function (options) {
    this.extend(this.options, options);
    this.view();
    this.bindEvent();
  },
  /**
   *
   * 默认支持参数
   *
   */
  options: {
    container: '',
    //url: 'http://wapp.waptest.taobao.com:8080/presale.html'
    url: [location.protocol, '//tms-preview.taobao.com/wh/tms/taobao/page/markets/myseller/presale'].join('')
  },
  /**
   *
   * 事件缓存
   *
   */
  Events: {},
  /**
   *
   * 事件注册
   *
   */
  bindEvent: function () {
   window.removeEventListener('message', messageHandle, false);
   window.addEventListener('message', messageHandle, false);
  },

  /**
   *
   * 合并对象
   * @param {Object} o 源对象
   * @param {Object} n 目前对象
   * @returns {Object} o 合并后对象
   *
   */
  extend: function (o, n) {
    for (var i in n) {
      if (n.hasOwnProperty(i)) {
        if (typeof(n[i]) === 'object' && !n[i].tagName) {
          o[i] = {};
          this.extend(o[i], n[i]);
        } else {
          o[i] = n[i];
        }

      }
    }

    return o;
  },
  /**
   * 注册事件
   * @param {String} type 事件名称
   * @param {Function} callback 回调函数
   *
   */
  on: function (type, callback) {
    this.Events[type] = callback;
  },
  /**
   *
   * 触发事件
   * @param {String} type 事件名称
   * @param data 数据
   *
   */
  trigger: function (type, data) {
    var handle = this.Events[type];

    handle && handle(data);
  },
  /**
   *
   * 获取数据
   * @param {Function} callback 回调函数,用于接收值,值为{Object}类型
   *
   */
  get: function (callback) {
    this.send({
      type: 'get'
    });

    this.Events.get = callback;
  },
  /**
   * 加载数据
   * @param {Object} data 数据
   *
   */
  set: function (data) {
    this.send({
      type: 'set',
      data: data
    });
  },
  /**
   * 更新条件
   * @param {Object} data 数据
   *
   */
  update: function (data) {
    this.send({
      type: 'update',
      data: data
    });
  },
  /**
   *
   * 发送消息
   * @param {Object} data 消息数据
   *
   */
  send: function (data) {
    var req = JSON.stringify(data),
      win = this.element.contentWindow;

    win.postMessage(req, '*');
  },
  /**
   *
   * 接收消息
   * @param {Object} data 消息数据
   *
   */
  onMessage: function (data) {
    var res = data || {};

    switch (res.type) {

      case 'get':
        this.Events.get && this.Events.get(res.data);
        break;

      case 'resize':
        this.resize(res.data);
        break;

      case 'load':
        this.trigger('load', res.data);
        break;

      case 'open':
        this.trigger('open', res.data);
        break;

    }
  },

  /**
   *
   * 页面视图
   *
   */
  view: function () {
    var container = this.options.container;
    container.appendChild(this.options.iframe);

    this.element = this.options.iframe;
    this.element.src = this.options.url;

    this.resize();
  },
  /**
   * 更新布局
   * @param {Object} size 布局尺寸
   */
  resize: function (size) {
    var param = {
      scrolling: 'no',
      frameborder: '0',
      style: {
        'width': 'calc(100% - 28px)',
        'margin-left': '28px',
        'background-color': '#f6f6f6',
        'padding-top': '5px',
        'padding-bottom': '4px',
        'border': 'none',
        'height': '20px'
      }
    };

    this.extend(param.style, size);
    this.extend(this.element, param);
  }
};

});