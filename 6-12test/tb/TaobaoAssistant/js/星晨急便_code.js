var error = QT_TR_NOOP("没有错误");
function error_string() {
    return error;
}
function validate(start) {
    var ok = false;

    var reg = new RegExp('^[0-9]{10}$|^[0-9]{11}$', 'i');
    if (!reg.test(start)) {
        error = "快递单号不正确，请核对后重新输入.";
        return false;
    }

    var prev = start.toString().substr(0, start.toString().length - 1);
    var num = start.toString().substr(start.toString().length - 1, 1);
    var n1 = new Number(prev).valueOf();
    var n2 = n1 % 7;
    if (n2 != num) {
        error = "不符合运单生成规则.";
        return false;
    }
    return true;
}

function generate(start, inc) {
    var code;
    //inc = 1;

    var prev = start.toString().substr(0, start.toString().length - 1);
    //var num = start.toString().subString(start.toString().length - 1, 1);
    var n1 = new Number(prev).valueOf() + parseInt(inc);
    var n2 = n1 % 7;
    code = utility.fillZero(n1, start.toString().length - 1) + n2;        
        


    return code;
}



