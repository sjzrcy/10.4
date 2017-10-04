var error = QT_TR_NOOP("没有错误");
function error_string() {
    return error;
}
function validate(start) {
    var ok = false;

    var reg = new RegExp('^(2|3|5|6|8|5|1)[0-9]{9}$', 'i');
    if (!reg.test(start)) {
        error = "不符合生成规则.";
        return false;
    }

    return true;
}

function generate(start, inc) {
    var code;
    inc = 1;

        var num = new Number(start).valueOf();
        code = num + inc;
        

    return code;
}



