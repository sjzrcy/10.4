import QtQuick 1.1
import NativeQuickWidgets 1.0
import "ColorPropertyWidgets"
import "nativequickwidgets"

Rectangle {
    //anchors.fill: parent
    id: skuColorGroupUi
    width: 340
    height: addUserDefinedColorUi.visible
            ? (addUserDefinedColorUi.y - colorPropWidgetHeader.y + addUserDefinedColorUi.height)
            : ((colorGrp.visible? colorGrp.y : colorGrpCanvaUi.y) - colorPropWidgetHeader.y
                  + (colorGrp.visible? colorGrp.height : colorGrpCanvaUi.height))
    color: "#F7F8FA"
    property bool isNewColorSolution: true
    property bool supportMixedColor: false
    property bool switchToMixedColorPage: false
    property bool isUserDefinedValueSupported: false
    property bool isMemoSupported: false
    property bool isAliasSupported: false
    property alias colorPropertyNodeTitle: colorPropWidgetHeaderValue.text
    property int maxAllowedUD: 24

    function onStandardColorChanged(checked, colorVid)
    {
        if(switchToMixedColorPage) {
            //调用主程序函数返回拼色别名并回显
            mixedColorConfirmUi.setMixedColorAlias("colorAlias");
        }
        else
        {
            colorOperator.onCheckedChangedSlot(colorVid, checked);
        }
    }

    function onColorGroupChanged(colorGrpId)
    {
        colorOperator.onColorGroupChangedSlot(colorGrpId);
    }

    function onCommitMixedColor(mixedColorVid)
    {
        //调用主程序函数并显示错误消息
        var errMsg="拼色错误";
        if(errMsg.length==0) {
            mixedColorConfirmUi.errorMsg = "";
            mixedColorConfirmUi.setMixedColorAlias("");
        }
        else{
            mixedColorConfirmUi.errorMsg = errMsg;
        }
    }

    function onCommitUserDefinedColor(colorName)
    {
        return colorOperator.onNewUserDefinedColorSlot(colorName);
    }

    function onUpdateUserDefinedColor(vid, colorName)
    {
        colorOperator.onUserDefinedValueNameChangedSlot(vid, colorName);
    }

    function onNameAliasChanged(colorVid, nameAlias)
    {
        colorOperator.onNameAliasChangedSlot(colorVid, nameAlias);
    }

    function onBatchCpvMemoChanged(vidList, memoList)
    {
        colorOperator.onBatchCpvMemoChangedSlot(vidList, memoList);
    }

    function appendColorGrp(newElement)
    {
        colorCategoryGrp.append(newElement);
    }

    function appendStandardColor(newElement)
    {
        colorGrp.append(newElement);
    }
    function appendUserDefinedColor(newElement)
    {
        usrDefColorPropValGroupUi.appendItem(newElement);
    }

    function prependUserDefinedColor(newElement)
    {
        usrDefColorPropValGroupUi.prependItem(newElement);
    }

    function clearColorValues()
    {
        colorGrp.clearAll();
    }

    function clearUsrDefColorValues()
    {
        usrDefColorPropValGroupUi.clearAll();
    }

    function clearColorGroups()
    {
        colorCategoryGrp.clearAll();
    }

    function updateColorGrpTitle(title)
    {
        colorGrp.updateColorGrpTitle(title);
    }

    Item {
        id: colorPropWidgetHeader
        width: parent.width
        height: standardColorButton.height
        Text {
            id: colorPropWidgetHeaderValue
            x: 0
            y: 0
            text: "标准颜色"
            font.bold: true
            anchors.left: parent.left
            anchors.leftMargin: 5
            width: 90
        }

        Button {
            id: standardColorButton
            width: 45
            visible: isNewColorSolution && supportMixedColor
            anchors.right: mixedColorButton.visible? mixedColorButton.left : parent.right
            text: "单色"
            onClicked: {
                if(switchToMixedColorPage) {
                    switchToMixedColorPage = false;
                    mixedColorConfirmUi.visible=false
                }
            }
        }
        Button {
            id: mixedColorButton
            width: 45
            visible: isNewColorSolution && supportMixedColor
            anchors.right: parent.right
            anchors.rightMargin: 5
            text: "拼色"
            onClicked: {
                if(!switchToMixedColorPage) {
                    switchToMixedColorPage=true;
                    mixedColorConfirmUi.visible=true;
                    mixedColorConfirmUi.setMixedColorAlias("")
                }
            }
        }
    }

    MixedColorConfirmWidget {
        id: mixedColorConfirmUi
        visible: isNewColorSolution && supportMixedColor && switchToMixedColorPage
        errorMsg: ""
        anchors.top: colorPropWidgetHeader.bottom
        anchors.topMargin: 5
    }

    ColorCategoryGroup {
        id: colorCategoryGrp
        width: parent.width
        anchors.top: mixedColorConfirmUi.visible? mixedColorConfirmUi.bottom : colorPropWidgetHeader.bottom
        anchors.topMargin: 5
        visible: isNewColorSolution
    }

    ColorCheckBoxGroup {
        id: colorGrp
        anchors.top: colorCategoryGrp.visible?colorCategoryGrp.bottom:colorPropWidgetHeader.bottom
        anchors.topMargin: 5
        width: parent.width
        visible: colorGrp.numOfColorsInGrp > 0
        newColorOpt: isNewColorSolution
        supportMemo: isMemoSupported
        supportAlias: isAliasSupported
    }

    Rectangle {
        id: colorGrpCanvaUi
        visible: isNewColorSolution && !colorGrp.visible
        color: "#ECECEC"
        anchors.top: colorCategoryGrp.visible?colorCategoryGrp.bottom:colorPropWidgetHeader.bottom
        anchors.topMargin: 5
        width: parent.width
        height: 90
        Column {
            y: 10
            spacing: 10
            anchors.horizontalCenter: parent.horizontalCenter
            Image {
                source: "images/upArrow.png"
                anchors.horizontalCenter: parent.horizontalCenter
            }
            Text {
                horizontalAlignment: Text.AlignHCenter
                text: "请点击上方的颜色分类"
            }
        }
    }

    Item {
        id: addUserDefinedColorUi
        anchors.top: colorGrp.visible? colorGrp.bottom: colorGrpCanvaUi.bottom
        anchors.topMargin: 5
        width: parent.width
        height: addUserDefineColorLink.height + usrDefColorPropValGroupUi.height + usrDefColorPropValGroupUi.anchors.topMargin
        visible: isNewColorSolution && isUserDefinedValueSupported
        Text {
            id: addUserDefineColorLink
            text: "添加自定义颜色"
        }

        UsrDefPropValCheckBoxGroup {
            id: usrDefColorPropValGroupUi
            anchors.top: addUserDefineColorLink.bottom
            anchors.topMargin: 5
            width: parent.width
            maxAllowedUserDefined: maxAllowedUD
        }
    }

    Connections {
        target: mixedColorConfirmUi
        onMixedColorConfirmed: {
            console.debug("mixed color confirmed" + colorVid);
            onCommitMixedColor(colorVid);
        }
    }

    Connections {
        target: colorGrp
        onColorChanged: {
            onStandardColorChanged(checked, colorVid);
        }
        onNameAliasChanged: {
            onNameAliasChanged(colorVid, nameAlias);
        }
        onBatchMemoChanged: {
            onBatchCpvMemoChanged(vidList, memoList);
        }
    }
    Connections {
        target: colorCategoryGrp
        onColorGrpSelected:{
            onColorGroupChanged(colorGrpId)
        }
    }
    Connections {
        target: usrDefColorPropValGroupUi
        onCheckChanged: {
            if(checked) {
                var nextVid;
                nextVid = onCommitUserDefinedColor(userDefinedValue);
                usrDefColorPropValGroupUi.updateItem(itemIndex, {"vidAsStr": nextVid});
            }
            else {
                onStandardColorChanged(false, vid);
            }
        }
        onValueChanged: {
            onUpdateUserDefinedColor(vid, userDefinedValue);
        }
    }
}
