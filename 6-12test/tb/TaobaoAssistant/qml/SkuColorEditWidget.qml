import QtQuick 1.1
import NativeQuickWidgets 1.0
import "nativequickwidgets"


Rectangle {
    id: skuColorEditUi
    color: "#F7F8FA"
    property string pid: ""
    property string vid: ""
    property alias hasRGB: colorBlockRect_.visible
    property string colorAlias: ""
    property alias colorValue: colorBlockRect_.color
    property string colorPic:  ""

    Item
    {
        id: skuColorEditOrLabelUi
        height: 23
        width: 120
        Item {
            id: colorBlock_
            width: 18; height: 13
            anchors.verticalCenter: parent.verticalCenter
            Rectangle {
                id: colorBlockRect_
                color: "#FFF0F0"
                anchors.fill: parent
                anchors.leftMargin: 5
                anchors.verticalCenter: parent.verticalCenter
            }
            Image{
                id: colorImg_
                visible: !colorBlockRect_.visible
                anchors.fill: parent
                asynchronous: true
                fillMode: Image.PreserveAspectFit
                anchors.verticalCenter: parent.verticalCenter
                source: hasRGB ? "" : colorPic
            }
        }

        Text {
            id: skuColorLabel
            anchors.left: colorBlock_.right
            anchors.leftMargin: 10
            text: colorAlias
            anchors.verticalCenter: parent.verticalCenter
            textFormat: Text.PlainText
        }
    }
}
