import QtQuick 1.1
import NativeQuickWidgets 1.0
import "../nativequickwidgets"
import "../ColorPropertyWidgets"

Rectangle {
    id: container
    height: colorGrpGridUi.cellHeight*(Math.floor((colorGrpElements.count-1)/3)+ 1 + (newColorOpt ? (supportMemo ? 2 : 1) : 0))
    property bool newColorOpt: false
    property bool supportMemo: false
    property bool supportAlias: false
    property alias numOfColorsInGrp: colorGrpElements.count

    color: "#E8E8E8"
    signal colorChanged(bool checked, string colorVid, string colorAlias)
    signal nameAliasChanged(string colorVid, string nameAlias)
    signal batchMemoChanged(variant vidList, variant memoList)

    function append(newElement)
    {
        colorGrpElements.append(newElement);
    }

    function clearAll()
    {
        colorGrpElements.clear();
    }

    function updateColorGrpTitle(title)
    {
        colorGrpElements.colorGrpAlias = title;
    }

    function hasSelected()
    {
        var i;
        for(i=0; i < colorGrpElements.count; i++) {
            if(colorGrpElements.get(i).selected) {
                return true;
            }
        }
        return false;
    }

    ListModel {
        id: colorGrpElements
        property string colorGrpAlias: "花色系："
        property bool isMemoEditState: false
    }

    Component {
        id: colorGrpDelegate

        Item {
            id:singleColorItem
            SingleColorCheckBox {
                id: singleColor
                hasRGB_: hasRGB
                colorAlias_: colorAlias
                colorInPic_: colorInPic
                colorInRGB_: colorInRGB
                selected_: selected
                colorMemo_: colorMemo
                supportAlias_: container.supportAlias
                supportMemo_: container.supportMemo
                isMemoEditState_: singleColorItem.GridView.view.model.isMemoEditState
            }

            Connections {
                target: singleColor
                onClicked: {
                    colorGrpElements.setProperty(index, "selected", checked);
                    if(!checked) {
                        colorGrpElements.setProperty(index, "colorMemo", "");
                        colorGrpElements.isMemoEditState = false;
                    }
                    container.colorChanged(checked, colorVid, colorAlias);
                }
                onNameAliasChanged: {
                    container.nameAliasChanged(colorVid, nameAlias);
                }
                onMemoChanged: {
                    colorGrpElements.setProperty(index, "colorMemo", memo);
                }
            }
        }
    }

    Component{
        id: colorGrpAliasCom
        Text {
            id: colorGrpAliasUi
            text:colorGrpElements.colorGrpAlias
            width: 80
            height: visible ? 20 : 0
            visible: container.newColorOpt
        }
    }

    Component {
        id: colorMemoEditButtonComp
        Button {
            id: colorMemoEditButtonUi
            text: colorGrpElements.isMemoEditState ? "确认" : "编辑备注"
            width: 60
            height: visible ? 20 : 0
            visible: newColorOpt && container.supportMemo
            enabled: hasSelected()
            onClicked:{
                if(!enabled) return;
                colorGrpElements.isMemoEditState = !colorGrpElements.isMemoEditState
                if(!colorGrpElements.isMemoEditState) {
                    var i;
                    var vidList = new Array;
                    var memoList = new Array;
                    for(i=0; i < colorGrpElements.count; i++) {
                        if(colorGrpElements.get(i).selected) {
                            vidList.push(colorGrpElements.get(i).colorVid);
                            memoList.push(colorGrpElements.get(i).colorMemo);
                        }
                    }
                    if(vidList.length > 0) {
                        container.batchMemoChanged(vidList, memoList)
                    }
                }
            }
        }
    }

    GridView {
        id : colorGrpGridUi
        anchors.fill: parent
        cellWidth: 100; cellHeight: 24
        focus: true
        model: colorGrpElements
        delegate: colorGrpDelegate
        opacity : 1
        cacheBuffer : 20
        snapMode: GridView.SnapToRow
        boundsBehavior: Flickable.StopAtBounds
        header: colorGrpAliasCom
        footer: colorMemoEditButtonComp
    }
}
