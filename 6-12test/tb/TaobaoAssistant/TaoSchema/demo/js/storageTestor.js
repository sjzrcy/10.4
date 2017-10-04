/**
 * Created by diwu.sld on 2015/6/11.
 */

$(document).ready(function(){
    $("#btn_update").click(function(){
        onBtnUpdateClicked();
    });

    $("#btn_open").click(function(){
        onBtnOpenClicked();
    });

    $("#btn_get").click(function(){
        onBtnAllKeysClicked();
    });

    $("#btn_allKeys").click(function(){
        onBtnAllKeysClicked();
    });

    $("#btn_get").click(function(){
        onBtnGetClicked();
    });


});

function onBtnUpdateClicked(){
    var counts = $("#counts").val();
    var value = $("#values").val();

    var  keyValueObjs = [];

    for (var i = 0; i < counts; i++){
        var  keyValueObj = {
            key:createUUID(),
            value:value
        }

        keyValueObjs.push(keyValueObj);
    }

    Storage.update(keyValueObjs, onBtnUpdateFinished);
}

function onBtnOpenClicked(){
    var value = $("#selected_db").val();
    identify = value;
    Storage.open(value, onOpenedFinished);
}

function onBtnAllKeysClicked(){
    Storage.allKeys(onBtnAllKeysFinised);
}

function onBtnGetClicked(){
    var value = $("#get_keys").val();
    var keys = value.split(",");
    Storage.get(keys, onBtnGetFinished);
}

function onBtnUpdateFinished(param){
    $("#update_show").text(param);
}

function onOpenedFinished(param){
    $("#lable_opened").text(param);
}

function onBtnAllKeysFinised(param){
    $("#allKeys_show").text(param);
}


function onBtnGetFinished(param){
    $("#get_show").text(param);
}

function createUUID() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

function sprintf(str_source, array_params){
    if (array_params.length > 0){
        for ( var i = 0; i < array_params.length; ++i ){
            var re = new RegExp('%' + i, 'gm');
            str_source = str_source.replace(re, array_params[i]);
        }
    }

    return str_source;
}
