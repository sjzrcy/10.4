import QtQuick 1.1

Rectangle {
    id: container
    border.width: 1
    border.color: "#CECECE"
    width: 68
    visible: usrDefPropValSuggestionElements.count > 0
    height: (15+usrDefPropValSuggestionListUi.spacing)*usrDefPropValSuggestionElements.count+4
    property alias viewHeight: container.height
    property int itemIndex : -1

    function appendSuggestList(newElement)
    {
        usrDefPropValSuggestionElements.append(newElement);
    }

    function clearSuggestList()
    {
        usrDefPropValSuggestionElements.clear();
    }

    function onItemSelected(index)
    {
        return operator.onSelectSuggestion(itemIndex, index);
    }

    ListModel {
        id: usrDefPropValSuggestionElements
    }

    Component {
        id: usrDefPropValSuggestionDelegate

        Rectangle {
            id:singleUsrDefPropValItem
            height: 15
            width: 62
            Text {
                id: singleUsrDefPropValSuggestionUi
                text: content
                anchors.bottomMargin: 2
                anchors.fill: parent
                MouseArea {
                    id: singleUsrDefPropValSuggestionClickArea
                    anchors.fill: parent
                    hoverEnabled: true
                    onClicked: {
                        if(mouse.button === Qt.LeftButton) {
                            console.debug("onItemSelected");
                            container.onItemSelected(index);
                        }
                    }
                    onEntered: {
                        singleUsrDefPropValItem.color = "#CAE1FF";
                    }
                    onExited: {
                        singleUsrDefPropValItem.color = "#FFFFFF";
                    }
                }
            }
        }
    }

    ListView {
        id : usrDefPropValSuggestionListUi
        anchors.fill: parent
        anchors.leftMargin: 4
        anchors.topMargin: 4
        focus: true
        model: usrDefPropValSuggestionElements
        delegate: usrDefPropValSuggestionDelegate

        opacity : 1
        cacheBuffer : 10
        snapMode: ListView.SnapToItem
        boundsBehavior: Flickable.StopAtBounds
        spacing: 5
    }

}
