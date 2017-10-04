import QtQuick 1.1
import NativeQuickWidgets 1.0
import "../nativequickwidgets"
import "../ColorPropertyWidgets"
Rectangle {
    id: container
    width: messageInfoUi.width + 16
    height: messageInfoUi.height + 24
    property int vid: -1
    property int itemIndex: -1

    function autoCheck(vid)
    {
        console.debug("vid:"+vid+",itemIndex:"+itemIndex)
        operator.onAutoSelectStdVid(itemIndex, vid);
    }

    function showMessage(msg,itemIndex, vid)
    {
        messageInfoUi.text = msg;
        container.itemIndex = itemIndex;
        container.vid = vid;
    }

    Rectangle {
        id: angleUi
        color: "#fffee2"
        border.width: 1
        border.color: "#FFCA80"
        width: 10
        height: 10
        anchors.horizontalCenter: parent.horizontalCenter
        rotation: 45
        z: 1
    }

    Rectangle {
        id: contentUi
        color: "#fffee2"
        border.width: 1
        border.color: "#FFCA80"
        y: 3
        width: messageInfoUi.width + 15
        height: messageInfoUi.height + 20

        Text {
            id: messageInfoUi
            width: 200
            lineHeight: 1.5
            wrapMode: Text.WordWrap
            x: 10
            anchors.verticalCenter: parent.verticalCenter
            onLinkActivated: {
                console.debug("link actived. ")
                container.autoCheck(vid);
            }
        }
        z: 2
    }
}
