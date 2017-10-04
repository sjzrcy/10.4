var error = QT_TR_NOOP("没有错误");
function error_string() {
    return error;
}
function validate(start) {
    var ok = false;

    var reg = new RegExp('^((618|680|778|768|688|618|828|988|118|888|571|518|010|628|205|880|717|718|728|738|761|762|763|701|757)[0-9]{9})$|^((2008|2010|8050|7518)[0-9]{8})$', 'i');
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
        code = num + inc;

        code = utility.fillZero(code, start.toString().length);        


    return code;
}



