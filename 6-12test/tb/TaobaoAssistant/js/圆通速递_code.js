var error = QT_TR_NOOP("没有错误");
function error_string() {
    return error;
}
function validate(start) {
    var ok = false;

    var reg = new RegExp('^[A-Za-z0-9]{2}[0-9]{10}$|^[A-Za-z0-9]{2}[0-9]{8}$', 'i');
    if (!reg.test(start)) {
        error = "快递单号不正确，请核对后重新输入.";
        return false;
    }

    return true;
}

function generate(start, inc) {
    var code;

    if (utility.isAllDigital(start)) {

        var num = new Number(start).valueOf();
        code = num + inc;
   
    }
    else {
        var pos = utility.lastIndexOf(start, new RegExp('\\D', 'i'));
        var ch = start.toString().substr(0, pos + 1).toUpperCase();
        var num = new Number(start.toString().substr(pos + 1, start.toString().length - 1 - pos)).valueOf();
        num = num + inc;
        var r = utility.fillZero(num, start.toString().length - 1 - pos);
        code = ch + r;       
    }

    return code;
}


