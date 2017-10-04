import QtQuick 1.1
import NativeQuickWidgets 1.0
import "../ColorPropertyWidgets"
import "../nativequickwidgets"

Item {
    id: mixedColorConfirmedContainer
    height: mixedColorConfirmRowUi.height
    width: mixedColorConfirmRowUi.width
    property alias errorMsg: errorMsgUi.text
    property string mixedColorVid: "-2000"

    signal mixedColorConfirmed(string colorVid)

    function setMixedColorAlias(colorAlias)
    {
        if(colorAlias.length === 0){
            mixedColorAlias.text = "请选择2~3个颜色进行拼色";
            mixedColorAlias.color = "#C6C6C6";
            errorMsg = ""
        }
        else{
            mixedColorAlias.text = colorAlias;
            mixedColorAlias.color = "#000000";
            errorMsg = ""
        }
    }

    Row {
        id: mixedColorConfirmRowUi
        width: mixedColorAlias.width + spacing + mixedColorConfirmButton.width
        spacing: 5

        LineEdit {
            id: mixedColorAlias
            height: 23
            width: 150
            readOnly: true
            enabled: false
        }
        Button {
            id: mixedColorConfirmButton
            width: 70
            height: 23
            text: "确定拼色"
            onClicked: mixedColorConfirmedContainer.mixedColorConfirmed(mixedColorVid)
        }
        Rectangle {
            id: errorBlock
            color: "#FFECEC"
            border.color: "#FFAAAC"
            border.width: 1
            visible: errorMsg.length!=0
            width: 70
            height: 23
            Text {
                id: errorMsgUi
                color: "#FF0000"
                text: "重复拼色"
                anchors.verticalCenter: errorBlock.verticalCenter
                anchors.horizontalCenter: errorBlock.horizontalCenter
            }
        }
    }

}
