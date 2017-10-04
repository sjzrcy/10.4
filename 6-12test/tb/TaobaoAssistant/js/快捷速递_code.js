var error = QT_TR_NOOP("没有错误");
function error_string() {
    return error;
}
function validate(start) {
    var ok = false;

    var reg = new RegExp('^[0-9]{11,13}$');
    if (!reg.test(start)) {
        error = "快递单号不正确，请核对后重新输入.";
        return false;
    }

    return true;
}

function generate(start, inc) {
    var code;
    inc = 1;

    var num = new Number(start).valueOf();

    num = num + inc;

    return utility.fillZero(num, start.toString().length);
}



