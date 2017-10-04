var error = QT_TR_NOOP("没有错误");
function error_string() {
    return error;
}
function validate(start) {
    var ok = false;

    var reg = new RegExp('^[0-9]{14}$', 'i');
    if (!reg.test(start)) {
        error = "快递单号不正确，请核对后重新输入.";
        return false;
    }

    return true;
}

function generate(start, inc) {
    var code;
    inc = 1;

    //if (utility.isAllDigital(start)) {

        var num = new Number(start).valueOf();
        code = num + inc;
        
        code = utility.fillZero(code, 14);        
//    }
//    else {
//        var ch = start.toString().substr(0, 1);
//        var num = new Number(start.toString().substr(1, 9)).valueOf();
//        num = num + inc;
//        var r = utility.fillZero(num, 9);
//        code = ch + r;       
//    }

    return code;
}



