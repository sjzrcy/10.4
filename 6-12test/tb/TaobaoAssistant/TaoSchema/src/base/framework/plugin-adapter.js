
define(function(require, exports, module){
    //
    var shell = require('src/base/shell/shell');

    //
    var Adapter = function(id){
        this.id = id;
    };

    Adapter.prototype.createPlugin = function(){
        var dom = $('#' + this.id)[0];
        if(dom){
            shell.createNPWidget(this.id, dom.hwnd);
        }
    };

    Adapter.prototype.resizePlugin = function(){
        var dom = $('#' + this.id)[0];
        log('[width, ' + $(dom).width() + '], [height, ' + $(dom).height() + '] >> ' + this.id);
        if(dom){
            shell.resizeNPWidget(this.id, dom.hwnd);
        }
    };

    Adapter.prototype.set = function(content){
        shell.setPluginContent(this.id, content);
    };

    Adapter.prototype.get = function(callback){
        shell.getPluginContent(this.id, callback);
    };

    //
    module.exports = Adapter;
});

