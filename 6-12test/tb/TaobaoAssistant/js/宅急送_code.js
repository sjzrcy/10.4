var error = QT_TR_NOOP("没有错误");
function error_string() {
    return error;
}
function validate(start) {
    return true;
}

function generate(start, inc) {

    var retValue = start;
    if(start.length == 10){
        var ch1 = start.charAt(0);
        var ch2 = start.charAt(1);
        if (ch1 == "4" && ch2 == "9") {
            var iv = new Number(start).valueOf()
            return iv + 1;
        }

        if (ch1 == "9" && ch2 == "2") {
            var iv = new Number(start).valueOf()
            return iv + 1;
        }

        if (ch1 == "1" && ch2 == "6") {
            var iv = new Number(start).valueOf()
            return iv + 1;
        }

        var ch10 = start.charAt(9);
        var num0_8 = start.substring(0, 9);
        num0_8 = parseInt(num0_8) + 1
        var num10 = num0_8 % 7;
        return num0_8.toString() + num10;   
    }else if(start.length == 13){
        var ch1 = start.charAt(0);
        var ch2 = start.charAt(1);
        if (ch2 == "0" || ch2 == "1" || ch2 == "2" || ch2 == "3" || ch2 == "4" || ch2 == "5") {
            var num2_12 = start.substring(2,12);

            var iv = new Number(num2_12).valueOf();
            num2_12 = iv + 1;

            var num13 = num2_12 % 7;
            var strNum2_12 = num2_12.toString();
            var zeroCount = 10-strNum2_12.length;
            var strZero = '';
            for(var k=0; k<zeroCount; k++){
                strZero += '0';
            }

            retValue =  ch1.toString();
            retValue += ch2.toString();
            retValue += strZero.toString();
            retValue += strNum2_12.toString();
            retValue += num13.toString();
        }else{
            var iv = new Number(start.substring(1,13)).valueOf()
            iv = iv+1;
            retValue = start.charAt(0).toString() + iv; 
        }
    }else{
       retValue = retValue; 
    }

    return retValue;
   
}