import QtQuick 1.1
import NativeQuickWidgets 1.0
import "../nativequickwidgets"
import "../ColorPropertyWidgets"

Rectangle {
    id: container
    height: sizeGrpGridUi.cellHeight*(Math.floor((sizeGrpElements.count-1)/3)+1) + (newSizeOpt && supportMemo ? 24 : 0)
    property bool newSizeOpt: false
    property bool supportMemo: false
    property bool supportAlias: false

    color: "#E8E8E8"
    signal sizeChanged(bool checked, string sizeVid, string sizeAlias)
    signal nameAliasChanged(string sizeVid, string nameAlias)
    signal batchMemoChanged(variant vidList, variant memoList)

    function append(newElement)
    {
        sizeGrpElements.append(newElement);
    }

    function clearAll()
    {
        sizeGrpElements.clear();
    }

    function hasSelected()
    {
        var i;
        for(i=0; i < sizeGrpElements.count; i++) {
            if(sizeGrpElements.get(i).selected) {
                return true;
            }
        }
        return false;
    }

    ListModel {
        id: sizeGrpElements
        property bool isMemoEditState: false
    }

    Component {
        id: sizeGrpDelegate

        Item {
            id:singleSizeItem
            SingleSizeCheckBox {
                id: singleSize
                sizeAlias_: sizeAlias
                selected_: selected
                sizeMemo_: sizeMemo
                supportAlias_: container.supportAlias
                supportMemo_: container.supportMemo
                isMemoEditState_: singleSizeItem.GridView.view.model.isMemoEditState
            }

            Connections {
                target: singleSize
                onClicked: {
                    sizeGrpElements.setProperty(index, "selected", checked);
                    if(!checked) {
                        sizeGrpElements.setProperty(index, "sizeMemo", "");
                        sizeGrpElements.isMemoEditState = false;
                    }
                    container.sizeChanged(checked, sizeVid, sizeAlias);
                }
                onNameAliasChanged: {
                    container.nameAliasChanged(sizeVid, nameAlias);
                }
                onMemoChanged: {
                    sizeGrpElements.setProperty(index, "sizeMemo", memo);
                }
            }
        }
    }

    Component {
        id: sizeMemoEditButtonComp
        Button {
            id: sizeMemoEditButtonUi
            text: sizeGrpElements.isMemoEditState ? "确认" : "编辑备注"
            width: 60
            visible: newSizeOpt && container.supportMemo
            enabled: hasSelected()
            onClicked:{
                if(!enabled) return;
                sizeGrpElements.isMemoEditState = !sizeGrpElements.isMemoEditState
                if(!sizeGrpElements.isMemoEditState) {
                    var i;
                    var vidList = new Array;
                    var memoList = new Array;
                    for(i=0; i < sizeGrpElements.count; i++) {
                        if(sizeGrpElements.get(i).selected) {
                            vidList.push(sizeGrpElements.get(i).sizeVid);
                            memoList.push(sizeGrpElements.get(i).sizeMemo);
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
        id : sizeGrpGridUi
        anchors.fill: parent
        cellWidth: 100; cellHeight: 24
        focus: true
        model: sizeGrpElements
        delegate: sizeGrpDelegate
        opacity : 1
        cacheBuffer : 20
        snapMode: GridView.SnapToRow
        boundsBehavior: Flickable.StopAtBounds
        footer: sizeMemoEditButtonComp
    }
}
