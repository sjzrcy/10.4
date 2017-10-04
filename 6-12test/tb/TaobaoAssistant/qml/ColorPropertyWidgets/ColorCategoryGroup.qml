import QtQuick 1.1

Rectangle {
    id: colorGrpContainer
    height: 25*(Math.floor((colorCateGrpElements.count-1)/6)+1)
    property alias cellWidth: colorCateGrpGridUi.cellWidth
    property alias cellHeight: colorCateGrpGridUi.cellHeight
    property alias numOfColorGrps: colorCateGrpElements.count
    signal colorGrpSelected(string colorGrpId)

    function append(newElement)
    {
        colorCateGrpElements.append(newElement);
    }

    function clearAll()
    {
        colorCateGrpElements.clear();
    }

    ListModel {
        id: colorCateGrpElements
    }

    Component {
        id: colorCateGrpDelegate

        Item {
            id: colorCateGrpBlockUi
            width: 40; height: 20
            Rectangle {
                id: colorGrpBlockRect_
                anchors.fill: parent
                visible: hasRGB
                color: colorInRGB

            }
            Image{
                id: colorGrpImg
                visible: !colorGrpBlockRect_.visible
                anchors.fill: parent
                asynchronous: true
                fillMode: Image.Tile
                source: colorInPic
            }

            Text {
                z: 999
                text: colorCateAlias
                anchors.verticalCenter: colorGrpBlockRect_.verticalCenter
                anchors.horizontalCenter: colorGrpBlockRect_.horizontalCenter
                color: textColorInRGB
            }

            MouseArea {
                id: colorCateGrpBlockMouseArea
                anchors.fill: parent
                acceptedButtons: Qt.LeftButton
                onClicked: {
                    colorCateGrpBlockUi.GridView.view.currentIndex = index
                    colorGrpContainer.colorGrpSelected(colorCateGrpBlockUi.GridView.view.model.get(index).colorCateId)
                }
            }
        }

    }

    GridView {
        id : colorCateGrpGridUi
        anchors.fill: parent
        cellWidth: 50; cellHeight: 25
        focus: true
        model: colorCateGrpElements
        delegate: colorCateGrpDelegate
        highlight: Image {source: "../images/checked.png"; width: 44; height: 24; x: colorCateGrpGridUi.currentItem.x-2;y: colorCateGrpGridUi.currentItem.y-2}
        highlightFollowsCurrentItem: false
        opacity : 1
        cacheBuffer : 20
        snapMode: GridView.SnapToRow
        boundsBehavior: Flickable.StopAtBounds
        currentIndex: -1
    }

}
