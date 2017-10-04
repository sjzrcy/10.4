/**
 * Created by diwu.sld on 2015/3/20.
 */

var Channal = {
    KEY_METHOD : "method",
    KEY_PARAMS : "params",
    KEY_CALLBACK : "callback",

    callback : new (function(){
        //避免长时间不退出助理，造成内存溢出，转换的回调生命周期只有一小时
        var INVALID_TIME = 60 * 60 * 1000;
        var PREFIX = "C62018D1DC074199ACCAE8452612DF72";
        var index_ = 0;
        this.translate = function(cb){
            if(typeof(cb) != "function"){
                return "";
            }

            var name = "FUN" + (++index_);
            name = PREFIX + name;

            window[name] = cb;
            this[name] = "";

            setTimeout(function(){
                delete callback[name];
                delete window[name];
            }, INVALID_TIME);

            return name;
        }
    })(),

    invoke : function(json) {
        if (workbench) {
            if (json && json[this.KEY_METHOD]) {
                var string = JSON.stringify(json);
                workbench.callWorkBenchFunction(string);
            }
        } else {
            console.error("workbench is not register!");
        }
    }
};