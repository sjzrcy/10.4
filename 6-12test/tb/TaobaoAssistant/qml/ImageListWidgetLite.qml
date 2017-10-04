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
        if(!fullRect.visible)
        {
            pictureOperator.selectPicture(index);
            elements.setProperty(index,"selected",!elements.get(index).selected);
        }

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
        id: frameMouseArea
        anchors.fill: parent
        hoverEnabled: true
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
                        source: small_picture_path

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
                                fullRect.visible=true;
                                fullRect.opacity=1;
                                grid.currentIndex=index;
                                //grid.opacity=0.5;
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


                        Rectangle {
                            id: toolBar
                            x: 0
                            y: 104
                            height: 22
                            color: "#DACC9C"
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
                                        color: "#F8D368"
                                    }

                                    GradientStop {
                                        position: 0.5
                                        color: "#FEBF4C"
                                    }


                                    GradientStop {
                                        position: 1
                                        color: "#F8D368"
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
                                width: 16
                                height: 16
                                anchors.right: parent.right
                                anchors.rightMargin: 12
                                anchors.verticalCenter: parent.verticalCenter
                                source: "images/delete.png"
                                sourceSize.width: 16
                                sourceSize.height: 16

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
                                id: replaceImage
                                x: 52
                                y: 3
                                width: 16
                                height: 16
                                anchors.horizontalCenter: parent.horizontalCenter
                                anchors.verticalCenter: parent.verticalCenter
                                source: "images/replace.png"
                                sourceSize.width: 16
                                sourceSize.height: 16

                                MouseArea
                                {
                                    anchors.fill : parent;

                                    onClicked:
                                    {
                                        replacePicture(index);
                                    }
                                }
                            }

                            Image {
                                id: copyLinkImage
                                x: 12
                                y: 3
                                width: 16
                                height: 16
                                anchors.verticalCenterOffset: 0
                                anchors.left: parent.left
                                anchors.leftMargin: 12
                                anchors.verticalCenter: parent.verticalCenter
                                sourceSize.height: 16
                                sourceSize.width: 16
                                source: "images/copyLink.png"

                                MouseArea
                                {
                                    anchors.fill : parent;

                                    onClicked:
                                    {
                                        copyLink(index);
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
                color: "white"
                border.width: 1
                border.color: "#2098dd"
                anchors.right: parent.right
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

                visible: ( titleEditInput.editing || titleEditInputMouseArea.containsMouse) &&(!fullRect.visible)

                Image {
                    id: titleEditImage
                    width: 16
                    height:16
                    fillMode: Image.PreserveAspectCrop
                    anchors.right: parent.right
                    anchors.rightMargin: 2
                    anchors.bottom: parent.bottom
                    anchors.bottomMargin: 3
                    anchors.top: parent.top
                    anchors.topMargin: 2
                    source: "images/edit.png"
                    visible:  (!titleEditInput.editing)
                }
            }


            TextInput {
                id: titleEditInput
                text: shortTitle
                anchors.right: textBox.right
                anchors.rightMargin: 2
                anchors.left: textBox.left
                anchors.leftMargin: 2
                anchors.top: textBox.top
                anchors.topMargin: 2
                anchors.bottom: textBox.bottom
                anchors.bottomMargin: 2
                activeFocusOnPress: false
                horizontalAlignment: TextEdit.AlignHCenter

                selectByMouse :true

                RegExpValidator{id:imageNameValidator; regExp:/^[^\/\<>\*\?\:\"\|]{1,50}/;}
                validator: imageNameValidator;

                property bool  editing: false;
                color: "#1e395b"
                z:10

                onEditingChanged:
                {
                    if(editing)
                    {
                        saveEditingValue();

                        grid.currentIndex=index;
                        grid.editingIndex=index;
                        grid.editingItem=titleEditInput;
                        titleEditInput.forceActiveFocus();
                        titleEditInput.openSoftwareInputPanel();
                        titleEditInput.cursorVisible=true;

                        titleEditInput.text=title;
                        titleEditInput.selectAll();

                        //titleEditInput.cursorPosition = 0

                    }
                    else
                    {
                        titleEditInput.closeSoftwareInputPanel();
                        titleEditInput.focus = false;
                        titleEditInput.deselect();
                        titleEditInput.cursorVisible=false;
                        titleEditInput.text=shortTitle;

                        grid.editingIndex=-1;

                    }
                }

                Keys.onReturnPressed:
                {
                    saveEditingValue();
                    event.accepted=true;
                }

                Keys.onEnterPressed:
                {
                    saveEditingValue();
                    event.accepted=true;
                }

                Keys.onEscapePressed:
                {
                    saveEditingValue();
                    event.accepted=true;
                }

                MouseArea
                {
                    id: titleEditInputMouseArea
                    anchors.fill: parent
                    hoverEnabled: true

                    visible: !titleEditInput.editing

                    onClicked:
                    {
                        if(!titleEditInput.editing)
                        {
                            titleEditInput.editing=true;
                        }

                        mouse.accepted=false;
                    }

                    onCanceled:
                    {
                        titleEditInput.editing=false;
                        mouse.accepted = true;
                    }
                }
            }


        }
    }

    Rectangle
    {
        id: fullMask;
        color: "#000000"
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
                id : fullCopyLinkImage
                source: "images/fullCopyLink.png";
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
                        copyLink(grid.currentIndex);
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
                source: "images/fullDelete.png"
                z:10

                x : (parent.width/2)+32
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
        cellWidth: 150; cellHeight: 180
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
