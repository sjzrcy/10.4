/**
 * 追踪日志输出，可设置等级可禁止
 * 
 */
(function() {
    // 开关检查
    var LEVELS = ['log', 'debug', 'warn', 'error', 'forbid'];
    var min = LEVELS.indexOf('warn');
    var check = function(level) {
        return (LEVELS.indexOf(level) >= min);
    };

    var setLogLevel = function(level) {
        if (level && (typeof(level) === 'string')) {
            var index = LEVELS.indexOf(level.toLowerCase());
            if (index >= 0) {
                min = index;
            }
        }
    };

    var log = function() {
        if (check('log')) {
            console.warn.apply(console, arguments);
        }
    };

    var warn = function() {
        if (check('warn')) {
            console.warn.apply(console, arguments);
        }
    };

    var error = function() {
        if (check('error')) {
            console.error.apply(console, arguments);
        }
    };

    var debug = function() {
        if (check('debug') && as.debug) {
            console.trace.apply(console, arguments);
        } else {
            log.apply(window, arguments);
        }
    };

    // 向外暴露日志等级设置接口
    if (window.setLogLevel !== undefined) {
        console.error('window上已存在setLogLevel', window.setLogLevel);
    }
    window.setLogLevel = setLogLevel;

    // 注册log
    if (window.log !== undefined) {
        console.error('window上已存在log', window.log);
    }
    window.log = log;

    // 注册warn
    if (window.warn !== undefined) {
        console.error('window上已存在warn', window.warn);
    }
    window.warn = warn;

    // 注册debug
    if (window.debug !== undefined) {
        console.error('window上已存在trace', window.debug);
    }
    window.debug = debug;

    // 注册error
    if (window.error !== undefined) {
        console.error('window上已存在error', window.error);
    }
    window.error = error;
    //------------------------------------------------------------------------------  
})();
