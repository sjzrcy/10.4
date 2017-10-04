
import QtQuick 1.0

Rectangle {
    width: 600; height: 600
    color:"#D6E2F2"

    function append(newElement)
    {
        elements.append(newElement);
    }

    function clearAll()
    {
        elements.clear();
    }

    ListModel {
        id: elements
    }

    Component {
        id: appDelegate

        Item {
            width: 120; height: 120

            MouseArea
            {
                anchors.fill:parent
                onClicked:
                {
                    factory_.handlePrimaryKeyChangeEvent(client_idText.text);
                }
            }

            Image {
                id: myIcon
                y: 10; anchors.horizontalCenter: parent.horizontalCenter
                source: "images/EMail.png"
            }
            Rectangle
            {
                 anchors { top: myIcon.bottom; horizontalCenter: parent.horizontalCenter
                     bottom: parent.bottom
                 }
                 border.width: 2
                 border.color: "gray"
                 width: parent.width-20


                Text {
                    text: title
                   anchors.fill:  parent


                    horizontalAlignment :Text.AlignHCenter
                    wrapMode: Text.WrapAnywhere

                }

                Text {
                    text: client_id
                    visible: false
                    id:client_idText

                   anchors.fill:  parent


                    horizontalAlignment :Text.AlignHCenter
                    wrapMode: Text.WrapAnywhere

                }
            }
        }
    }

    Component {
        id: appHighlight
        Rectangle { width: 100; height: 100; color: "lightsteelblue" }
    }

    GridView {
        anchors.fill: parent
        cellWidth: 120; cellHeight: 120
        highlight: appHighlight
        focus: true
        model: elements
        delegate: appDelegate
    }
}
