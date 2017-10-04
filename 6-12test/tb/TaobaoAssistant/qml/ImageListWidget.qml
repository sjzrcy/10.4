import QtQuick 1.1
import "widget"

Rectangle {
    id: mainWindow
    width: 800; height: 800
    color:"#EDEDED"

    function doFocus()
    {
        grid.forceActiveFocus();
    }

    function startLoading()
    {
        loadingMask.visible=true;
    }

    function stopLoading()
    {
        loadingMask.visible=false;
    }

    function copyLink(index)
    {
        pictureOperator.copyLink(index);
    }

    function copyCode(index)
    {
        pictureOperator.copyCode(index);
    }

    function deletePicture(index)
    {
        pictureOperator.deletePicture(index);
        doFocus();
    }

    function selectPicture(index)
    {
        pictureOperator.selectPicture(index);
        elements.setProperty(index,"selected",!elements.get(index).selected);
    }

    function pictureSelectFinish(index)
    {
        pictureOperator.handleImageSelectFinished();
    }

    function replacePicture(index)
    {
        pictureOperator.replacePicture(index);
        doFocus();
    }

    function renamePicture(index,newName)
    {
        pictureOperator.renamePicture(index,newName);
        doFocus();
    }

    function append(newElement)
    {
        elements.append(newElement);
        nullRect.visible=false;
    }

    function update(index,newElement)
    {
        elements.set(index,newElement);
    }

    function showNullText()
    {
        nullRect.visible=true;
    }

    function clearAll()
    {
        elements.clear();
        stopLoading();
    }

    function selectAll()
    {
        for(i=0;i<elements.count;i++)
        {
            elements.setProperty(i,"selected",true);
        }

        pictureOperator.selectAll();
    }

    function reverseSelection()
    {
        for(i=0;i<elements.count;i++)
        {
            elements.setProperty(i,"selected",!elements.get(i).selected);
        }

        pictureOperator.reverseSelection();
    }

    function saveEditingValue()
    {
        if(grid.editingIndex!=-1)
        {
            var newName=grid.editingItem.text;
            var editingIndex=grid.editingIndex;
            grid.editingItem.editing=false;
            grid.editingIndex=-1;

            renamePicture(editingIndex,newName);
        }
    }

    function cancelEditingValue()
    {
        if(grid.editingIndex!=-1)
        {
            var newName=grid.editingItem.text;
            var editingIndex=grid.editingIndex;
            grid.editingItem.editing=false;
            grid.editingIndex=-1;
            grid.editingItem.text=shortTitle;
        }
    }

    ListModel {
        id: elements
    }

    Rectangle
    {
        id: nullRect;
        anchors.right: parent.right
        anchors.rightMargin: 20
        anchors.top: parent.top
        anchors.topMargin: 20
        anchors.left: parent.left
        anchors.leftMargin: 20

        visible:false;

        Image
        {
            id:bulbImage;
            anchors.top: parent.top
            anchors.topMargin: 0
            anchors.left: parent.left
            anchors.leftMargin: 4
            source: "images/bulb.png"
        }

        Text
        {
            id:nullText;
            text:"该图片分组下还没有图片，您可以通过点击工具栏上的'上传新图'批量将图片传到该图片分组。";
            anchors.left: parent.left
            anchors.leftMargin: 40
            anchors.verticalCenter: bulbImage.verticalCenter
        }
    }

    MouseArea {
        anchors.fill: parent
        onClicked:
        {
            saveEditingValue();
        }
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
            width: 134
            height: 180
            color: "#00000000"


            Rectangle {
                id: selectedBox
                x: 3
                y: 7
                width: 128
                height: 132
                z: 1
                border.width: 1
                border.color: "#F29536"
                visible: elements.get(index).selected
                gradient: Gradient {
                    GradientStop {
                        position: 0
                        color: "#FAD9A3"
                    }

                    GradientStop {
                        position: 0.5
                        color: "#F5B866"
                    }

                    GradientStop {
                        position: 1
                        color: "#EC9A32"
                    }
                }
                anchors.right: parent.right
                anchors.rightMargin: 0
                anchors.left: parent.left
                anchors.leftMargin: 0
                smooth: true
                anchors.top: parent.top
                anchors.topMargin: 0
            }

            Rectangle
            {

                border.width: 2;
                border.color: "#404040"

                anchors.right: selectedBox.right
                anchors.rightMargin: 6
                anchors.left: selectedBox.left
                anchors.leftMargin: 6
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
                        source: picture_path

                        Timer {
                        id: hoverTimer
                        interval: 2000
                        running: false
                        onTriggered: {
                            tooltip.x = mapToItem(null,pictureMouseArea.mouseX,0).x
                            tooltip.y = mapToItem(null,0,pictureMouseArea.mouseY).y
                            tooltip.visible = true
                            currentTitleInfo = title
                            }
                        }

                        MouseArea
                        {
                            id: pictureMouseArea
                            anchors.fill: parent
                            hoverEnabled: true
                            onDoubleClicked: {
                                grid.currentIndex=index;
                                //grid.opacity=0.5;
                                pictureSelectFinish(index);
                            }

                            onClicked: {
                                selectPicture(index);
                                saveEditingValue();
                            }

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

                        BusyIndicator { anchors.centerIn: parent; on: pic.status != Image.Ready }

                    }
                }

            }

                Text {
                        text: shortTitle
                        height: 20

                        anchors.horizontalCenter: parent.horizontalCenter
                        anchors.top: selectedBox.bottom
                        anchors.topMargin: 8
                        color: "#1e395b"
                }

        }
    }


    Rectangle
    {
        id: loadingMask;
        color: "#000000"
        opacity: 0.800
        anchors.fill: parent
        visible: false
        z:1000

        Image {
                id: bigBusyIndicator
                anchors.centerIn: parent;

                source: "images/bigBusy.png";
                visible: true
                NumberAnimation on rotation { running: true; from: 0; to: 360; loops: Animation.Infinite; duration: 1200 }
            }
    }

    Component {
        id: appHighlight
        Rectangle
        {
            id: rectangle1
            color: "#00000000"

            Rectangle
            {
                id:highLightBox
                height: 134;
                anchors.right: parent.right
                anchors.rightMargin: 0
                anchors.left: parent.left
                anchors.leftMargin: 0
                anchors.top: parent.top
                anchors.topMargin: 0

                border.width: 1
                border.color: "#FDDD81"

                gradient: Gradient {
                    GradientStop {
                        position: 0
                        color: "#FDF9ED"
                    }

                    GradientStop {
                        position: 0.5
                        color: "#FDEDB9"
                    }

                    GradientStop {
                        position: 1
                        color: "#FBE07C"
                    }
                }
            }

        }


    }


    GridView {
        id : grid
        anchors.fill: parent
        anchors.topMargin: 10;
        anchors.leftMargin: 28;
        cellWidth: 149; cellHeight: 180
        highlight: appHighlight
        highlightMoveDuration :50;
        focus: true
        model: elements
        delegate: appDelegate
        opacity : 1



        cacheBuffer : 60

        property int editingIndex: -1;

        property Item editingItem;
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

        flickableChildren: MouseArea {
            anchors.fill: parent
            onClicked:
            {
                saveEditingValue();
            }
        }

        Keys.onPressed:
        {
            if(event.key==Qt.Key_F1 && tipBox.visible)
            {
                tipRect.visible=!tipRect.visible;
            }

            if ((event.key == 67) && (event.modifiers & Qt.ControlModifier))
            {
                copyLink(grid.currentIndex);
                event.accepted = true;
                return;
            }

            if ((event.key == 67) && (event.modifiers & Qt.AltModifier ))
            {
                copyCode(grid.currentIndex);
                event.accepted = true;
            }
        }

        Keys.onSpacePressed:
        {
            selectPicture(grid.currentIndex);
        }

        Keys.onLeftPressed:
        {
            if(grid.editingIndex<0)
            {
                grid.moveCurrentIndexLeft();
            }
        }

        Keys.onRightPressed:
        {
            if(grid.editingIndex<0)
            {
                grid.moveCurrentIndexRight();
            }
        }

        Keys.onUpPressed:
        {
            if(grid.editingIndex<0)
            {
                grid.moveCurrentIndexUp();
            }
        }

        Keys.onDownPressed:
        {
            if(grid.editingIndex<0)
            {
                grid.moveCurrentIndexDown();
            }
        }

        Keys.onReturnPressed:
        {
            pictureSelectFinish(0);

            if(grid.editingIndex!=-1)
            {
                event.accepted=false;
                return;
            }


            grid.opacity=1;

        }

        Keys.onEnterPressed:
        {
            pictureSelectFinish(0);

            if(grid.editingIndex!=-1)
            {
                event.accepted=false;
                return;
            }
        }

        Keys.onEscapePressed:
        {
        }

        Keys.onDeletePressed:
        {
            deletePicture(grid.currentIndex);
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
