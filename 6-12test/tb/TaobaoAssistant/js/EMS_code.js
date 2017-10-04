var error = "没有错误";
function error_string() {
    return error;
}
function validate(start) {

    var ok = false;

    var mid8 = start.toString().substr(2, 9);

    var mid9 = start.toString().substr(10, 1);

    var value = parseInt(mid8.substr(0,1))*8+parseInt(mid8.substr(1,1))*6+parseInt(mid8.substr(2,1))*4+parseInt(mid8.substr(3,1))*2+parseInt(mid8.substr(4,1))*3+parseInt(mid8.substr(5,1))*5+parseInt(mid8.substr(6,1))*9+parseInt(mid8.substr(7,1))*7;
    var mod = value % 11;
    if (11 - mod == 11) {
        if (parseInt(mid9) != 5) {
            error = "不符合生成规则.";
            return false;
        }
    }
    else if (11 - mod == 10) {
        if (parseInt(mid9) != 0) {
            error = "不符合生成规则.";
            return false;
        }
    }
    else {
        if (11 - mod != parseInt(mid9)) {
            error = "不符合生成规则.";
            return false;
        }
    }
    return true;
}

function generate(start, inc) {

    var mid2 = start.toString().substr(0, 2);
    var mid12 = start.toString().substr(11, 2);

  
    var mid8 = start.toString().substr(2, 8);

    var next = parseInt(Number(mid8)) + parseInt(inc);

    var zero = "";
    for (var i = next.toString().length; i < mid8.toString().length; ++i){
        zero += "0";
    }

    next = zero + next;  

    var value = parseInt(next.substr(0, 1)) * 8 + parseInt(next.substr(1, 1)) * 6 + parseInt(next.substr(2, 1)) * 4 + parseInt(next.substr(3, 1)) * 2 + parseInt(next.substr(4, 1)) * 3 + parseInt(next.substr(5, 1)) * 5 + parseInt(next.substr(6, 1)) * 9 + parseInt(next.substr(7, 1)) * 7;
    
    var mod = value % 11;

     var mid9;

    if (11 - mod == 11) {
        mid9 = 5;
    
    }
    else if (11 - mod == 10) {
       mid9 = 0;
    }
    else {
      mid9 = 11 - mod ;
    }

    var code = mid2 + next + mid9 + mid12;  

    return code;
}



