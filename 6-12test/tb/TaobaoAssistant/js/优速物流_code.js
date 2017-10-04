var error = QT_TR_NOOP("没有错误");
function error_string() {
    return error;
}
function validate(start) {
    var ok = false;

    var reg = new RegExp('^[0-9]{11}[0-6]$', 'i');
    if (!reg.test(start)) {
        error = "快递单号不正确，请核对后重新输入.";
        return false;
    }
    
    
    return true;
}

function generate(start, inc) {
    var code;
    inc = 1;
 
    var v3 = start.toString().substr(11, 1);
    var v4 = start.toString().substr(0, 11);

    var last = parseInt(v3) +inc;

    if (last > 6) {
        last = 0;
    }

    var n4 = new Number(v4).valueOf();
    var v5 = n4 + inc;

    code = utility.fillZero(v5, start.toString().length - 1);

    code = code + last;      


    return code;
}



