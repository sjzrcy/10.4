/**
 * Created by diwu.sld on 2015/6/11.
 */

var identify = "";

var JsonObj = {
    method:"",
    params :[]
};

function doInvoke(context, callBack){
    var json = {};
    json[Channal.KEY_METHOD] = "jsExcute";
    var PluginChanalParam = {};
    PluginChanalParam.method = "storage";
    PluginChanalParam.pluginName = "StoragePlugins";
    PluginChanalParam.identiry = identify;
    PluginChanalParam.param = context;
    json[Channal.KEY_PARAMS] = PluginChanalParam;

    json[Channal.KEY_CALLBACK] = Channal.callback.translate(callBack);
    Channal.invoke(json);

}

var Storage = {

    open : function (dbName, callBack){
        var JsonObj = {};
        JsonObj.method = "open";
        JsonObj.params = dbName;
        var str = JSON.stringify(JsonObj);

        doInvoke(str, callBack);
    },
    update : function(keyValueObjs, callBack ){
        var JsonObj = {};
        JsonObj.method = "update";
        JsonObj.params = keyValueObjs;
        var str = JSON.stringify(JsonObj);
        doInvoke(str, callBack);
    },

    get : function(keys, callBack){
        var JsonObj = {};
        JsonObj.method = "get";
        JsonObj.params = keys;
        var str = JSON.stringify(JsonObj);
        doInvoke(str, callBack);
    },

    allKeys : function(callBack){
        var JsonObj = {};
        JsonObj.method = "allKeys";
        var str = JSON.stringify(JsonObj);
        doInvoke(str, callBack);

    },

    delete : function(keys){

    }
}
