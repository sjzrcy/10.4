var error = QT_TR_NOOP("没有错误");
function error_string() {
    return error;
}
function validate(start) {
    var ok = false;

    var reg = new RegExp('^1[0-9]{11}$');
    if (!reg.test(start)) {
        error = "快递单号不正确，请核对后重新输入.";
        return false;
    }

    var prev = start.toString().substr(0, start.toString().length - 1);
    var num = start.toString().substr(start.toString().length - 1, 1);
    var n1 = new Number(prev).valueOf();
    var n2 = n1 % 11;
    if (n2 == 10) {
        n2 = 0;
    }
    if (n2 != parseInt(num)) {
        error = "快递单号不正确，请核对后重新输入.";
        return false;
    }
    
    return true;
}

function generate(start, inc) {
    var code;

    var prev = start.toString().substr(0, start.toString().length - 1);
    var n1 = new Number(prev).valueOf() + parseInt(inc);
    var n2 = n1 % 11;
    if (n2 == 10) {
        n2 = 0;
    }
    code = n1.toString() + n2;

    return code;
}


