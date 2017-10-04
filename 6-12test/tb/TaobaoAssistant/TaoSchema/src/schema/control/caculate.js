/*
 *
 */
define(function(require, exports, module){
  var CONTEXT = 'DA5B64AAF52344598484E9BCA0BF8D69';
  window[CONTEXT] = {};

  exports.register = function(key, value){
    if(typeof key === 'string' && key){
      if(window[CONTEXT][key] === undefined){
        window[CONTEXT][key] = value; 
      }else{
        error('表达式内置属性已经被注册', key, value);    
      }
    }else{
      error('表达式上下文，无效的注册', '非法key', key);
    }
  };

  exports.registerSubContext = function(subContext){
    if(_.isObject(subContext) && !_.isArray(subContext)){
      _.each(subContext, function(value, key){
        exports.register(key, value);
      });
    }
  };

  exports.registerValueHook = function(cb){
    if(typeof cb === 'function'){
      exports.register('v', cb);  
    }else{
      error('表达式', '请注册正确合法的ValueHook');
    }
  };

  exports.eval = function(exp){
    try{
      var code = 'with(window["' + CONTEXT + '"]){' + exp + '}';
      log('eval code >> ', code);
      return window.eval(code);
    }catch(e){
      error(e, exp);
    }
  };

  // 注册内置api
  exports.registerSubContext(require('src/schema/control/api'));
});