
define(function(require, exports, module){
  //
  if(!isInQN()){
    return;
  }
  
  var isFromQNSchema = function(from){
    return (typeof(from) === 'object' && from.iframe === 'QN_AS' && from.module === 'schema');
  };

  //
  window.addEventListener('message', function(e){
    log('OnPostMessage', JSON.stringify(e.data));
    var data = e.data;
    var handled = false;
    if(_.isObject(data)){
      // 尺码模板
      var method = data.method;
      if(_.isString(method) && _.isFunction(window[method])){
        window[method](data.params);
        handled = true; 
      }
    }else if(_.isString(data)){
      try{
        data = JSON.parse(data);
      }catch(e){
        data = {};
        error('postMessage接收到非法json字符串');
      }

      if(isFromQNSchema(data.from)){ // 从千牛收到消息
        if(data.method === 'schemacallback'){
          if(data.invoke && data.invoke.method){
            if(typeof(window[data.invoke.method]) === 'function'){
              window[data.invoke.method](data.invoke.params);
              handled = true; 
            }
          }
        }
      }else{ // 直邮协议
        var callback = data.callback;
        if(_.isString(callback) && _.isFunction(window[callback])){
          window[callback](data.data);
          handled = true;
        }
      }
    }
  });
});