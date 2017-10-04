var error = QT_TR_NOOP("没有错误");
function error_string() {
    return error;
}
function validate(start) {
    var ok = false;

    var reg = new RegExp('^(A|B|C|D|E|H|0)(D|X|[0-9])(A|[0-9])[0-9]{10}$|^(21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39)[0-9]{10}$', 'i');
    if (!reg.test(start)) {
        error = "快递单号不正确，请核对后重新输入.";
        return false;
    }

    return true;
}

function generate(start, inc) {
    var code;
    inc = 1;

    // 12位.
    if (start.toString().length == 12) {

        var num = new Number(start).valueOf();
        code = num + inc;
    }
    else { // 13位
        if (utility.isAllDigital(start)) {

        var num = new Number(start).valueOf();
        code = num + inc;

        code = utility.fillZero(code, 13);
    }
    else {

        var pos = utility.lastIndexOf(start, new RegExp('A|B|C|D|E|H|D|X', 'i'));

        var begin = start.toString().substr(0, pos + 1).toUpperCase();        
        
        var num = new Number(start.toString().substr(pos + 1, 13 - 1 - pos)).valueOf();
        num = num + inc;
        var r = utility.fillZero(num, 13 - 1 - pos);
        code = begin + r;       
         }
    
    }   

    return code;
}



