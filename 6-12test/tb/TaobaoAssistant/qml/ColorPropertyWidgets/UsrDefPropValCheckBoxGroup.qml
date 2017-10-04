import QtQuick 1.1
import NativeQuickWidgets 1.0
import "../nativequickwidgets"

Rectangle {
    id: container
    color: "#E8E8E8"
    height: usrDefPropValGrpGridUi.cellHeight*(Math.floor((usrDefPropValGrpElements.count-1)/3)+1)
    property alias curItemIndex: usrDefPropValGrpGridUi.currentIndex
    property string defaultPropertyValueText: "其他颜色"
    property int maxAllowedUserDefined: 24
    property bool reachMax: false

    signal checkChanged(string vid, bool checked, string userDefinedValue, int itemIndex)
    signal valueChanged(string vid, string userDefinedValue)

    function updateItem(itemIndex, item)
    {
        usrDefPropValGrpElements.set(itemIndex, item);
        console.debug("item index:"+itemIndex+";item:"+item);
    }

    function appendItem(item)
    {
        usrDefPropValGrpElements.append(item);
    }

    function prependItem(item)
    {
        usrDefPropValGrpElements.insert(0, item);
    }

    function clearAll()
    {
        usrDefPropValGrpElements.clear();
    }

    ListModel {
        id: usrDefPropValGrpElements
    }

    Component {
        id: usrDefPropValGrpDelegate

        Item {
            id:singleUsrDefPropValItem
            UserDefinedPropValueCheckBox {
                id: singleUsrDefPropValUi
                checked: selected
                userDefinedValue: userDefineValue
                vidStr: vidAsStr
                defaultPropertyValue: defaultPropertyValueText
            }

            Connections {
                target: singleUsrDefPropValUi
                onClicked: {
                    if(!checked) {
                        if(maxAllowedUserDefined == usrDefPropValGrpElements.count
                                && reachMax) {
                            usrDefPropValGrpElements.append(
                                        {"vidAsStr":"","selected": false,"userDefineValue": ""});
                            reachMax = false;
                        }
                        usrDefPropValGrpElements.remove(index);
                    } else if(index == usrDefPropValGrpElements.count - 1)
                    {
                        if(maxAllowedUserDefined > usrDefPropValGrpElements.count) {
                            usrDefPropValGrpElements.append(
                                        {"vidAsStr":"","selected": false,"userDefineValue": ""})
                        }
                        else {
                            reachMax = true;
                        }
                    }
                    container.checkChanged(vid, checked, userDefinedValue, index)

                }
                onValueChanged: {
                    container.valueChanged(vid, userDefinedValue)
                }
            }
        }
    }

    GridView {
        id : usrDefPropValGrpGridUi
        anchors.fill: parent

        cellWidth: 100; cellHeight: 24
        focus: true
        model: usrDefPropValGrpElements
        delegate: usrDefPropValGrpDelegate

        opacity : 1
        cacheBuffer : 10
        snapMode: GridView.SnapToRow
        boundsBehavior: Flickable.StopAtBounds
    }

}
