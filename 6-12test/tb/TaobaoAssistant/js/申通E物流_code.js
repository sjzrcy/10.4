var error = QT_TR_NOOP("没有错误");
function error_string() {
    return error;
}
function validate(start) {
    var ok = false;

    var reg = new RegExp('^(268|888|588|688|368|468|568|668|768|868|968)[0-9]{9}$|^(268|888|588|688|368|468|568|668|768|868|968)[0-9]{10}$|^(STO)[0-9]{10}$', 'i');
    if (!reg.test(start)) {
        error = "快递单号不正确，请核对后重新输入.";
        return false;
    }

    return true;
}

function generate(start, inc) {
    var code;
    inc = 1;

    if (utility.startWith(start, "STO")) {

        var num = new Number(start.toString().substr(3, 10)).valueOf();
        num = num + inc;
        var r = utility.fillZero(num, 10);
        code = "STO" +  r;
    }
    else {

        var num = new Number(start).valueOf();
        code = num + inc;
    }

    return code;
}



