import QtQuick 1.1
import "widget"

Rectangle {
    id: mainWindow
    width: 800; height: 581
    color:"white"
    property bool ignoreError: false
    property int warnningType: 1

    function setIgnoreError(value)
    {
        ignoreError = value;
    }

    function setWarningType(warningvalue)
    {
        warnningType = warningvalue;
    }

    function append(newElement)
    {
        elements.append(newElement);
    }

    function clearAll()
    {
        console.log("free all");
        elements.clear();
    }

    ListModel {
        id: elements
    }

    property string currentTitleInfo

    Rectangle {
        id: tooltip
        width: tipContext.paintedWidth + 10; height: 20
        visible: false
        color: "#FFFEE5"
        z: 99000
        Text {
        id: tipContext
            anchors.centerIn: parent
            text: currentTitleInfo
        }
    }

    Component {
        id: appDelegate

        Rectangle {
            id: mainBox
            width: 123
            height: 158
            color: "#00000000"


            Rectangle {
                id: selectedBox
                x: 3
                y: 7
                width: 100
                height: 110
                z: 1
                visible: false
                anchors.right: parent.right
                anchors.rightMargin: 21
                anchors.left: parent.left
                anchors.leftMargin: 5
                smooth: true
                anchors.top: parent.top
                anchors.topMargin: 0
            }

            Rectangle
            {

                border.width: 2;
                border.color: "#404040"

                anchors.right: selectedBox.right
                anchors.rightMargin: 0
                anchors.left: selectedBox.left
                anchors.leftMargin: 0
                anchors.bottom: selectedBox.bottom
                anchors.bottomMargin: 6
                anchors.top: selectedBox.top
                anchors.topMargin: 6

                z: 2

                Rectangle {
                    id: pictureBox
                    color: "#ffffff"

                    anchors.fill: parent

                    Image {
                        id: pic
                        anchors.fill: parent
                        z: 2
                        fillMode: Image.PreserveAspectFit
                        source: small_picture_path
                        opacity: overSize == true ? 0.5:1

                        Timer {
                        id: hoverTimer
                        interval: 2000
                        running: false
                        onTriggered: {
                            tooltip.x = mapToItem(null,pictureMouseArea.mouseX,0).x + 3
                            tooltip.y = mapToItem(null,0,pictureMouseArea.mouseY).y
                            tooltip.visible = true
                            currentTitleInfo = fullTitle
                            }
                        }

                        MouseArea
                        {
                            id: pictureMouseArea
                            anchors.fill: parent
                            hoverEnabled: true

                            onEntered: {
                                hoverTimer.running=true
                            }

                            onExited: {
                                hoverTimer.running=false
                                tooltip.visible=false
                            }
                            onPositionChanged: {
                                hoverTimer.restart()
                                tooltip.visible=false
                            }
                        }
                    }

                    Image {
                        id: picCanNotBeLoaded
                        anchors {
                            top: pic.top
                            topMargin: selectedBox.height*2/3;
                            horizontalCenter: pic.horizontalCenter;
                        }

                        z: 2
                        fillMode: Image.PreserveAspectFit
                        source: "images/imageCanNotLoad.png"

                        visible: pic.status == Image.Error
                    }


                    Image {
                        id: errorPic
                        anchors {
                            top: pic.top
                            topMargin: selectedBox.height*2/3;
                            horizontalCenter: pic.horizontalCenter;
                        }

                        z: 2
                        fillMode: Image.PreserveAspectFit
                        source: "images/overSizeError.png"

                        visible: !ignoreError && overSizeForFirstImage == false && overSize == true
                    }

                    Image {
                        id: errorPicForFirstPic
                        anchors {
                            top: pic.top
                            topMargin: selectedBox.height*2/3;
                            horizontalCenter: pic.horizontalCenter;
                        }
                        source: "images/firstImageOverSizeError.png";

                        z: 2
                        fillMode: Image.PreserveAspectFit
                        visible: !ignoreError && overSizeForFirstImage == true && warnningType == 1
                    }

                    Image {
                        id: errorPicForSixthPic
                        anchors {
                            top: pic.top
                            topMargin: selectedBox.height*0.38;
                            horizontalCenter: pic.horizontalCenter;
                        }
                        source: "images/sixthImageSizeError.png";

                        z: 2
                        fillMode: Image.PreserveAspectFit
                        visible: !ignoreError && overSizeForSixthImage == true && overSize == false
                    }

                    Image {
                        id: errorPicForFirstPicForGoodsPorperty
                        anchors {
                            top: pic.top
                            topMargin: selectedBox.height*2/3;
                            horizontalCenter: pic.horizontalCenter;
                        }
                        source: "images/firstImageOverSizeForGoodsProperty.png";

                        z: 2
                        fillMode: Image.PreserveAspectFit
                        visible: overSizeForFirstImage == true && warnningType == 2
                    }
					
					Image {
                        id: tmallErrorPicOverSize3M
                        anchors {
                            top: pic.top
                            topMargin: selectedBox.height*2/3;
                            horizontalCenter: pic.horizontalCenter;
                        }
                        source: "images/tmallImageOversize3M.png";

                        z: 2
                        fillMode: Image.PreserveAspectFit
                        visible: tmallOverSize3MImage == true && warnningType == 3
                    }
                }

            }

            Text {
                text: shortTitle
                height: 10
                anchors.horizontalCenter: selectedBox.horizontalCenter
                anchors.top: selectedBox.bottom
                anchors.rightMargin:12
                color: "#1e395b"
            }
        }
    }

    GridView {
        id : grid
        anchors.fill: parent
        anchors.topMargin: 10;
        anchors.leftMargin: 10;
        cellWidth: 126; cellHeight: 150
        highlightMoveDuration :50;
        focus: true
        model: elements
        delegate: appDelegate
        opacity : 1



        cacheBuffer : 60

        snapMode: GridView.SnapToRow
        boundsBehavior: Flickable.StopAtBounds

        // Only show the scrollbars when the view is moving.
        states: State {
            name: "ShowBars"
            when: grid.movingVertically || grid.movingHorizontally
            PropertyChanges { target: verticalScrollBar; opacity: 1 }

        }

        transitions: Transition {
            NumberAnimation { properties: "opacity"; duration: 400 }
        }
    }


    ScrollBar {
        id: verticalScrollBar
        width: 12; height: grid.height-12
        anchors.right: parent.right
        opacity: 0
        orientation: Qt.Vertical
        position: grid.visibleArea.yPosition
        pageSize: 0.900
    }

}
