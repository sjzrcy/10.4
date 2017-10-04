import QtQuick 1.1
import NativeQuickWidgets 1.0
import "ColorPropertyWidgets"
import "nativequickwidgets"

Rectangle {
    id: skuSizeGroupUi
    width: 340
    height: addUserDefinedSizeUi.visible ? addUserDefinedSizeUi.y - sizeGrp.y + addUserDefinedSizeUi.height : sizeGrp.height
    color: "#F7F8FA"
    property bool isNewSizeSolution: true
    property bool isUserDefinedValueSupported: false
    property bool isMemoSupported: false
    property bool isAliasSupported: false
    property int maxAllowedUD: 24
    property string customLabelStr:""
    property string defValueText:""

    function onStandardSizeChanged(checked, vid)
    {
        sizeOperator.onCheckedChangedSlot(vid, checked);
    }

    function onCommitUserDefinedSize(name)
    {
        return sizeOperator.onNewUserDefinedSizeSlot(name);
    }

    function onUpdateUserDefinedSize(vid, colorName)
    {
        sizeOperator.onUserDefinedValueNameChangedSlot(vid, colorName);
    }

    function onNameAliasChanged(colorVid, nameAlias)
    {
        sizeOperator.onNameAliasChangedSlot(colorVid, nameAlias);
    }

    function onBatchCpvMemoChanged(vidList, memoList)
    {
        sizeOperator.onBatchCpvMemoChangedSlot(vidList, memoList);
    }

    function appendStandardSize(newElement)
    {
        sizeGrp.append(newElement);
    }

    function appendUserDefinedSize(newElement)
    {
        usrDefSizePropValGroupUi.appendItem(newElement);
    }

    function prependUserDefinedSize(newElement)
    {
        usrDefSizePropValGroupUi.prependItem(newElement);
    }

    function clearSizeValues()
    {
        sizeGrp.clearAll();
    }

    function clearUsrDefSizeValues()
    {
        usrDefSizePropValGroupUi.clearAll();
    }

    SizeCheckBoxGroup {
        id: sizeGrp
        anchors.topMargin: 5
        width: parent.width
        newSizeOpt: isNewSizeSolution
        supportMemo: isMemoSupported
        supportAlias: isAliasSupported
    }

    Item {
        id: addUserDefinedSizeUi
        anchors.top: sizeGrp.bottom
        anchors.topMargin: 5
        width: parent.width
        height: 20 + usrDefSizePropValGroupUi.height
        visible: isNewSizeSolution && isUserDefinedValueSupported
        Text {
            id: addUserDefineSizeLabel
            text: customLabelStr
        }

        UsrDefPropValCheckBoxGroup {
            id: usrDefSizePropValGroupUi
            anchors.top: addUserDefineSizeLabel.bottom
            anchors.topMargin: 5
            width: parent.width
            defaultPropertyValueText: defValueText
            color: "#FFFFFF"
            maxAllowedUserDefined: maxAllowedUD
        }
    }

    Connections {
        target: sizeGrp
        onSizeChanged: {
            onStandardSizeChanged(checked, sizeVid);
        }
        onNameAliasChanged: {
            onNameAliasChanged(sizeVid, nameAlias);
        }
        onBatchMemoChanged: {
            onBatchCpvMemoChanged(vidList, memoList);
        }
    }

    Connections {
        target: usrDefSizePropValGroupUi
        onCheckChanged: {
            if(checked) {
                var nextVid;
                nextVid = onCommitUserDefinedSize(userDefinedValue);
                usrDefSizePropValGroupUi.updateItem(itemIndex, {"vidAsStr": nextVid});
            }
            else {
                onStandardSizeChanged(false, vid);
            }
        }
        onValueChanged: {
            onUpdateUserDefinedSize(vid, userDefinedValue);
        }
    }
}
