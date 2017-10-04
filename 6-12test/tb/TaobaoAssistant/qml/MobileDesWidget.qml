import QtQuick 1.1
import "widget"

Rectangle {
    id: mainWindow
    color:"#F8F8F8"
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

    function moveToFront(index)
    {
        imageOperator.moveToFront(index);
    }

    function moveToNext(index)
    {
        imageOperator.moveToNext(index);
        doFocus();
    }

    function copyCode(index)
    {
        imageOperator.copyCode(index);
    }

    function deletePicture(index)
    {
        imageOperator.deletePicture(index);
        doFocus();
    }

    function errorHandlingFun(index)
    {
        imageOperator.errorHandling(index);
    }

    function doubleClickedItem(index)
    {
        imageOperator.doubleClickedItem(index);
    }

    function selectPicture(index,i)
    {
        if(!fullRect.visible)
        {
            for(; i<elements.count; i++)
            {
                 elements.setProperty(i,"selected",false);
            }

            imageOperator.selectPicture(index);
            elements.setProperty(index,"selected",!elements.get(index).selected);
        }
    }

    function renamePicture(index,newName)
    {
        imageOperator.renamePicture(index,newName);
        doFocus();
    }

    function append(newElement)
    {
        elements.append(newElement);
        nullRect.visible=false;
    }

    function appendByIndex(index, newElement)
    {
       elements.set(index,newElement);
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

        imageOperator.selectAll();
    }

    function reverseSelection()
    {
        for(i=0;i<elements.count;i++)
        {
            elements.setProperty(i,"selected",!elements.get(i).selected);
        }

        imageOperator.reverseSelection();
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
            text:"请添加图片、文本或音频。";
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

    Component {
        id: appDelegate

        Rectangle {
            id: mainBox
            width: 134
            height: 170
            color: "#00000000"


            Rectangle {
                id: selectedBox
                x: 4
                y: 8
                width: 127
                height: 131
                z: 1
                border.width: 0
                border.color: "#268014"
                visible: elements.get(index).selected
                gradient: Gradient {
                    GradientStop {
                        position: 0
                        color: "#268014"
                    }

                    GradientStop {
                        position: 0.5
                        color: "#268014"
                    }

                    GradientStop {
                        position: 1
                        color: "#268014"
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
                border.color: "#d2d2d2"

                anchors.right: selectedBox.right
                anchors.rightMargin: 4
                anchors.left: selectedBox.left
                anchors.leftMargin: 4
                anchors.bottom: selectedBox.bottom
                anchors.bottomMargin: 4
                anchors.top: selectedBox.top
                anchors.topMargin: 4

                z: 2

                Rectangle {
                    id: pictureBox
                    color: "#ffffff"
                    anchors.fill: parent

                    Rectangle
                    {
                        id: normalBoard
                        z: 1
                        anchors.fill: parent
                        visible: !errorBoard.visible
                        Image
                        {
                            id: pic
                            anchors.fill: parent
                            z: 2
                            fillMode: Image.PreserveAspectFit
                            source: small_picture_path
                            BusyIndicator { anchors.centerIn: parent; on: pic.status == Image.Loading }
                            visible: isImage?true:false
                        }

                        MouseArea
                        {
                            id: pictureMouseArea
                            z: 4
                            anchors.fill: parent
                            hoverEnabled: true
                            onDoubleClicked:
                            {
                                doubleClickedItem(index);
                            }

                            onClicked: {
                                selectPicture(index, 0);
                                saveEditingValue();
                            }
                        }

                        Text
                        {
                            id: txtCont
                            x: 10
                            y: 5
                            z: 3
                            width: 110
                            height: 100
                            anchors.fill: parent
                            horizontalAlignment: Text.AlignHCenter
                            verticalAlignment: Text.AlignVCenter
                            text: elements.get(index).txtContent
                            wrapMode: Text.WrapAtWordBoundaryOrAnywhere
                            font.pixelSize: 10
                            color:"#7e7e7e"
                            clip: true
                         }


                        Rectangle
                        {
                               id: toolBar
                               x: 0
                               y: 104
                               z: 5
                               height: 22
                               color: "#268014"
                               opacity: 0.950
                               visible: pictureMouseArea.containsMouse && (!fullRect.visible) && (grid.editingIndex<0)
                               anchors.bottom: parent.bottom
                               anchors.rightMargin: 0
                               anchors.bottomMargin: 0
                               anchors.right: parent.right
                               anchors.leftMargin: 0
                               anchors.left: parent.left

                               Rectangle {
                                   id: toolBarHeader
                                   height: 4
                                   opacity: 1
                                   gradient: Gradient {
                                       GradientStop {
                                           position: 0
                                           color: "#268014"
                                       }

                                       GradientStop {
                                           position: 0.5
                                           color: "#268014"
                                       }


                                       GradientStop {
                                           position: 1
                                           color: "#268014"
                                       }
                                   }
                                   anchors.right: parent.right
                                   anchors.rightMargin: 0
                                   anchors.left: parent.left
                                   anchors.leftMargin: 0
                                   anchors.top: parent.top
                                   anchors.topMargin: 0
                               }

                               Image {
                                   id: deleteImage
                                   x: 92
                                   y: 3
                                   width: 12
                                   height: 12
                                   anchors.right: parent.right
                                   anchors.rightMargin: 12
                                   anchors.verticalCenter: parent.verticalCenter
                                   source: "images/del.png"
                                   sourceSize.width: 12
                                   sourceSize.height: 12

                                   MouseArea
                                   {
                                       anchors.fill : parent;

                                       onClicked:
                                       {
                                           deletePicture(index);
                                       }
                                   }
                               }

                               Image {
                                   id: moveTonextImage
                                   x: 52
                                   y: 3
                                   width: 12
                                   height: 12
                                   anchors.horizontalCenter: parent.horizontalCenter
                                   anchors.verticalCenter: parent.verticalCenter
                                   source: "images/moveTonext.png"
                                   sourceSize.width: 12
                                   sourceSize.height: 12
                                   visible: elements.get(index).elementType != "audio" && index != (elements.count-1)

                                   MouseArea
                                   {
                                       anchors.fill : parent;

                                       onClicked:
                                       {
                                           moveToNext(index);
                                       }
                                   }
                               }

                               Image {
                                   id: moveTofrontImage
                                   x: 12
                                   y: 3
                                   width: 12
                                   height: 12
                                   anchors.verticalCenterOffset: 0
                                   anchors.left: parent.left
                                   anchors.leftMargin: 12
                                   anchors.verticalCenter: parent.verticalCenter
                                   sourceSize.height: 12
                                   sourceSize.width: 12
                                   source: "images/moveTofront.png"
                                   visible: index!=0 && elements.get(index-1).elementType != "audio"

                                   MouseArea
                                   {
                                       anchors.fill : parent;

                                       onClicked:
                                       {
                                           moveToFront(index);
                                       }
                                   }
                               }
                         }
                    }

                    Rectangle
                    {
                           id: errorBoard
                           z: 2
                           anchors.fill: parent
                           visible: imageErrorMsg != ""
                           Image
                           {
                               id: picInGuilty
                               anchors.top: parent.top
                               anchors.left: parent.left
                               anchors.right: parent.right
                               height: parent.height - errorArea.height
                               z: 1
                               fillMode: Image.PreserveAspectFit
                               source: pic.source
                               BusyIndicator { anchors.centerIn: parent; on: picInGuilty.status == Image.Loading }
                               visible: !pic.visible
                               MouseArea
                               {
                                 id: picInGuiltyMouseArea
                                 anchors.fill: parent
                                 onDoubleClicked:
                                 {
                                     doubleClickedItem(index);
                                 }

                                 onClicked: {
                                     selectPicture(index, 0);
                                     saveEditingValue();
                                 }
                               }
                           }
                           

                           Rectangle
                           {
                               id: errorArea
                               anchors.top: picInGuilty.bottom
                               anchors.left: parent.left
                               anchors.right: parent.right
                               height: 30
                               color: "#FFDDDC"
                               Rectangle
                               {
                                   id: errorMsg
                                   height: 15
                                   color: "#FFDDDC"
                                   opacity: 0.950
                                   anchors.top: parent.top
                                   anchors.left: parent.left
                                   anchors.right: parent.right
                                   z: 2
                                   Image {
                                       id: errorIcon
                                       width: 12
                                       height: 12
                                       anchors.left: parent.left
                                       anchors.leftMargin: 3
                                       anchors.top: parent.top
                                       source: "images/error_2.png"
                                       sourceSize.width: 12
                                       sourceSize.height: 12
                                   }
                                   Text {
                                       id: errorTxt
                                       width: parent.width - errorIcon.width
                                       height: 15
                                       anchors.top: parent.top
                                       anchors.left: errorIcon.right
                                       text: imageErrorMsg
                                       wrapMode: Text.WrapAtWordBoundaryOrAnywhere
                                       font.pixelSize: 12
                                       color:"#333333"
                                       clip: true
                                       horizontalAlignment: Text.AlignHCenter
                                       verticalAlignment: Text.AlignVCenter
                                   }
                               }
                               Text {
                                   id: errorHandling
                                   height: 15
                                   anchors.left: parent.left
                                   anchors.right: parent.right
                                   anchors.top: errorMsg.bottom
                                   text: imageHandlingMsg
                                   wrapMode: Text.WrapAtWordBoundaryOrAnywhere
                                   font.pixelSize: 12
                                   color:"#316BCC"
                                   clip: true
                                   horizontalAlignment: Text.AlignHCenter
                                   verticalAlignment: Text.AlignVCenter
                                   textFormat: Text.RichText
                                   MouseArea {
                                       anchors.fill : parent
                                       onClicked:
                                       {
                                           errorHandlingFun(index);
                                       }
                                   }
                               }
                        }
                    }


                }

            }



            Rectangle {
                id: textBox
                height: 20
                color: "#F8F8F8"
                border.width: 0
                border.color: "#2098dd"
                anchors.right: (parent.right+parent.left)/2
                anchors.rightMargin: 3
                anchors.left: parent.left
                anchors.leftMargin: 3
                anchors.top: selectedBox.bottom
                anchors.topMargin: 6

                MouseArea  {
                    id: textBoxMouseArea
                    anchors.fill: parent
                    hoverEnabled : true

                }

                visible:true

                Text
                {
                    id: imageSize;
                    color: elements.get(index).bOk?"#333333":"#ff0000"
                    text: elements.get(index).imageSize
                    anchors.top: parent.top
                    anchors.topMargin: 3
                    textFormat : Text.StyledText
                    verticalAlignment: "AlignVCenter"
                    font.pointSize : 10
                    font.bold: false
                    visible: elements.get(index).elementType=="image"
                }
            }
        }
    }

    Rectangle
    {
        id: fullMask;
        color: "#d2d2d2"
        opacity: 0.800
        anchors.fill: parent
        visible: fullRect.visible
        z:90

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

    Rectangle
    {
        id: fullRect
        color: "#00000000"
        anchors.fill: parent
        visible: false
        opacity: 0.500

        z: 100

        Rectangle
        {
            id: tipBox;
            anchors.top: parent.top
            anchors.horizontalCenter: parent.horizontalCenter

            height : 60
            color: "#00000000"

            anchors.topMargin: 18

            width:parent.width

            MouseArea
            {
                anchors.fill: parent
                onDoubleClicked: {
                    hideFullRect();
                }

                onClicked: {
                    hideFullRect();
                }
            }

            Image
            {
                id:helpImage
                source: "images/help.png"
                x: parent.width-32
                y: 8

                MouseArea
                {
                    anchors.fill : parent
                    onClicked: {
                        tipRect.visible=!tipRect.visible;
                    }
                }
            }

            Rectangle
            {
                id:tipRect
                width: 600
                height: 32
                color: "#fde68e"
                radius: 1
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.verticalCenter: parent.verticalCenter
                visible: true
                opacity: 1
                border.width: 1
                border.color: "#f29536"

                Text
                {
                    id: tipText;
                    color : "#1e395b"
                    text: "大图模式下您可以使用快捷键Ctrl+C复制链接，Alt+C复制代码，Delete删除图片  × "
                    anchors.fill: parent
                    textFormat : Text.StyledText
                    horizontalAlignment : "AlignHCenter"
                    verticalAlignment: "AlignVCenter"
                    font.pointSize : 11
                    font.bold: false

                    MouseArea
                    {
                        anchors.fill : parent
                        onClicked: {
                            tipRect.visible=false;
                        }
                    }
                }
            }
        }

        Rectangle
        {
            id: infoBox;
            anchors.bottom: parent.bottom
            anchors.horizontalCenter: parent.horizontalCenter
            width:parent.width

            height : 100
            color: "#00000000"

            MouseArea
            {
                anchors.fill: parent
                onDoubleClicked: {
                    hideFullRect();
                }

                onClicked: {
                    hideFullRect();
                }
            }

            Text
            {
                id: titleText;
                color: "#CCCCCC"
                anchors.horizontalCenter: parent.horizontalCenter
                text: elements.get(grid.currentIndex).title
                anchors.top: parent.top
                anchors.topMargin: 12
                textFormat : Text.StyledText
                horizontalAlignment : "AlignHCenter"
                verticalAlignment: "AlignVCenter"
                font.pointSize : 12
                font.bold: true
            }

            Image
            {
                id : leftImage
                anchors.horizontalCenterOffset: -80
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.verticalCenterOffset: 15
                source: "images/left.png";
                visible: grid.currentIndex>0
                z:11

                anchors.verticalCenter: parent.verticalCenter

                MouseArea
                {
                    anchors.fill : parent

                    onClicked:
                    {
                        grid.moveCurrentIndexLeft();
                    }
                }

            }

            Image
            {
                id : fullmoveToFrontImage
                source: "images/fullmoveToFront.png";
                z:10;

                x : (parent.width/2)-32;
                y : parent.height-24
                anchors.verticalCenterOffset: 15
                anchors.horizontalCenterOffset: -40
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.verticalCenter: parent.verticalCenter

                MouseArea
                {
                    anchors.fill : parent

                    onClicked:
                    {
                        moveToFront(grid.currentIndex);
                    }
                }

            }

            Image
            {
                id : fullCopyCodeImage
                source: "images/fullCopyCode.png";
                z:10;

                x : (parent.width/2)-32;
                y : parent.height-24
                anchors.verticalCenterOffset: 15
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.verticalCenter: parent.verticalCenter

                MouseArea
                {
                    anchors.fill : parent

                    onClicked:
                    {
                        copyCode(grid.currentIndex);
                    }
                }

            }

            Image
            {
                id : deleteImage
                source: "images/fullDelete.png";
                z:10;

                x : (parent.width/2)+32;
                y : parent.height-24
                anchors.verticalCenterOffset: 15
                anchors.horizontalCenterOffset: 40
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.verticalCenter: parent.verticalCenter

                MouseArea
                {
                    anchors.fill : parent

                    onClicked:
                    {
                        deletePicture(grid.currentIndex);
                    }
                }
            }

            Image
            {
                id : rightImage
                source: "images/right.png";
                visible: grid.currentIndex< (elements.count-1)

                z:10;

                x : (parent.width/2)+64;
                y : parent.height-24
                anchors.verticalCenterOffset: 15
                anchors.horizontalCenterOffset: 80
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.verticalCenter: parent.verticalCenter

                MouseArea
                {
                    anchors.fill : parent

                    onClicked:
                    {
                        grid.moveCurrentIndexRight();
                    }
                }
            }
        }


        Item
        {
            id: fullItem
            anchors.top: tipBox.bottom
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.bottom: infoBox.top

            anchors.rightMargin: 48
            anchors.leftMargin: 48
            anchors.bottomMargin: 12
            anchors.topMargin: 12

            opacity :1

            Image
            {
                id : fullImage
                anchors.fill: parent
                smooth: true;
                cache: true
                focus:true

                source: elements.get(grid.currentIndex).picture_path

                fillMode: Image.PreserveAspectFit;
                opacity :1

                BusyIndicator { anchors.centerIn: parent; on: fullImage.status != Image.Ready }

                onStatusChanged:
                {
                    if(fullImage.status == Image.Ready)
                    {
                        fullRect.opacity=0.8;
                    }

                    if(fullImage.status == Image.Loading)
                    {
                        fullRect.opacity=1;
                    }
                }

                MouseArea
                {
                    id: restore;
                    anchors.fill: parent
                    onDoubleClicked: {
                        hideFullRect();
                    }

                    onClicked: {

                        if(mouseX<((fullItem.width-fullImage.paintedWidth)/2))
                        {
                            fullRect.visible=false;
                            grid.opacity=0.9;
                        }

                        if(mouseX>((fullItem.width+fullImage.paintedWidth)/2))
                        {
                            fullRect.visible=false;
                            grid.opacity=0.9;
                        }

                        if(mouseY<((fullItem.height-fullImage.paintedHeight)/2))
                        {
                            fullRect.visible=false;
                            grid.opacity=0.9;
                        }

                        if(mouseY>((fullItem.height+fullImage.paintedHeight)/2))
                        {
                            fullRect.visible=false;
                            grid.opacity=0.9;
                        }

                        if(
                                mouseX>((fullItem.width-fullImage.paintedWidth)/2)&&
                                mouseX<((fullItem.width)/2)
                                )
                        {
                            grid.moveCurrentIndexLeft();
                        }

                        if(
                                mouseX<((fullItem.width+fullImage.paintedWidth)/2)&&
                                mouseX>((fullItem.width)/2)
                                )
                        {
                            grid.moveCurrentIndexRight();
                        }
                    }

                }


            }
        }


    }


    Component {
        id: appHighlight
        Rectangle
        {
            id: rectangle1
            color: "#00000000"

            /*
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

                border.color: "#268014"

                gradient: Gradient {
                    GradientStop {
                        position: 0
                        color: "#268014"
                    }

                    GradientStop {
                        position: 0.5
                        color: "#268014"
                    }

                    GradientStop {
                        position: 1
                        color: "#268014"
                    }
                }

            }
            */

        }


    }


    GridView {
        id : grid
        anchors.fill: parent
        anchors.topMargin: 10;
        anchors.leftMargin: 28;
        cellWidth: 150; cellHeight: 170
       // highlight: appHighlight
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
                moveToFront(grid.currentIndex);
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
            selectPicture(grid.currentIndex, 0);
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
            console.debug(grid.editingIndex);
            if(grid.editingIndex!=-1)
            {
                event.accepted=false;
                return;
            }

            if(!fullRect.visible)
            {
                fullRect.visible=true;
                grid.opacity=1;
            }
            else
            {
                fullRect.visible=false;
                grid.opacity=0.9;
            }
        }

        Keys.onEnterPressed:
        {
            console.debug(grid.editingIndex);
            console.debug(grid.editingItem.editing);

            if(grid.editingIndex!=-1)
            {
                event.accepted=false;
                return;
            }

            if(!fullRect.visible)
            {
                fullRect.visible=true;
            }
            else
            {
                fullRect.visible=false;
            }
        }

        Keys.onEscapePressed:
        {
            fullRect.visible=false;
        }

        Keys.onDeletePressed:
        {
          //  deletePicture(grid.currentIndex);
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
