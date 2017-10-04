import QtQuick 1.0

Rectangle {
    id: pictureshower
//    width: 200;  height: 200
    color: "transparent"
    property bool isMoving:false
    property int imagesInOnePage:5
    property int smallImageSize: 30
    property int fullImageSize:(height - 50)/1
    property bool containMorePics:false
    property bool showFullPic:true
    property int column:0
    property bool rightClicked: true
    property bool leftClicked: false
    property bool enablePopUpDialog: true
    property string popUpDialogImagePath: "images/popUpDialog.png"
    property string removeImagePath: "images/removeImage.png"

    function setDefaultFullImage()
    {
        showFullPic = false;
    }

    function setCurrentFullImage()
    {
//        fullpicture.source = showingModel.get(list.currentIndex).small_picture_path;
        showFullPic = true;
    }

    function enablePopUpDialogBtn()
    {
        enablePopUpDialog = true;
    }

    function disablePopUpDialogBtn()
    {
        enablePopUpDialog = false;
    }

    function showFullPicture(enable)
    {
        showFullPic = enable;
    }

    function containMorePics(enable)
    {
        containMorePics = enable;
    }


    function replace(index, newElement)
    {
        if(index < 5 && column == 0)
        {
            showingModel.set(index, newElement);
        }
        else if(index >= 5 && column == 0)
        {
            hiddenModel.set(index - 5, newElement);
        }
        else if(index < 5 && column == 1)
        {
            hiddenModel.set(index - 5, newElement);
        }
        else if(index >= 5 && column == 1)
        {
            showingModel.set(index - 5, newElement);
        }

    }

    function getCurrentIndex()
    {
        showImagesWidget.setCurrentIndex(5*column + list.currentIndex);
    }

    function swape()
    {
        list.currentIndex = 0
        var i =0;
        for(i; i<showingModel.count; i++)
        {
            var buffer = showingModel.get(i).small_picture_path;
            showingModel.set(i, hiddenModel.get(i));
            hiddenModel.set(i, {"small_picture_path":buffer});
        }
        if(pictureshower.column == 1)
        {
            column1.source = "images/t1.png"
            column2.source = "images/t2.png"
            pictureshower.column = 0
        }
        else if(pictureshower.column == 0)
        {
            column1.source = "images/t1-1.png"
            column2.source = "images/t2-1.png"
            pictureshower.column = 1
        }
    }

    function checkLeftClick()
    {
        if(pictureshower.column == 0 && list.currentIndex == 0)
        {
            leftClicked = false;
        }
        else
        {
            leftClicked = true;
        }
    }

    function checkRightClick()
    {
        if(list.currentIndex == showingModel.count-1)
        {
            rightClicked = false
        }
        else
        {
            rightClicked = true
        }
    }

    Rectangle {
        id: columnChooser
        color: "transparent"
        property int iconWidth:14
        property int iconHeight:12
        width:iconWidth*2+2
        height:iconHeight
        Image {
            id: column1
            width:columnChooser.iconWidth; height:columnChooser.iconHeight
            source: "images/t1.png"
            anchors.left: parent.left
            MouseArea {
                anchors.fill: parent
                onClicked:
                {
                    swape();
                }

            }
            visible: containMorePics == true
        }
        Image {
            id: column2
            width:columnChooser.iconWidth; height:columnChooser.iconHeight
            source: "images/t2.png"
            anchors.left: parent.left
            anchors.leftMargin: columnChooser.iconWidth+2
            MouseArea {

                anchors.fill: parent
                onClicked:
                {
                   swape();
                }
            }
            visible: containMorePics == true
        }
        anchors.right: parent.right
        anchors.top:parent.top
    }

    ListModel {
        id: hiddenModel
        ListElement { small_picture_path: "images/defaultImage.jpg"; mouseSelected:false}
        ListElement { small_picture_path: "images/defaultImage.jpg"; mouseSelected:false}
        ListElement { small_picture_path: "images/defaultImage.jpg"; mouseSelected:false}
        ListElement { small_picture_path: "images/defaultImage.jpg"; mouseSelected:false}
        ListElement { small_picture_path: "images/defaultImage.jpg"; mouseSelected:false}
    }

    ListModel {
        id: showingModel
        ListElement { small_picture_path: "images/defaultImage.jpg"; mouseSelected:false}
        ListElement { small_picture_path: "images/defaultImage.jpg"; mouseSelected:false}
        ListElement { small_picture_path: "images/defaultImage.jpg"; mouseSelected:false}
        ListElement { small_picture_path: "images/defaultImage.jpg"; mouseSelected:false}
        ListElement { small_picture_path: "images/defaultImage.jpg"; mouseSelected:false}
    }


    Component {
        id: appDelegate
        Item {
            id: main
            width: smallImageSize + 1; height: smallImageSize + 2
            Image {
                id: item; parent: loc
                x: main.x; y: main.y+1
                width: smallImageSize; height: smallImageSize


                fillMode: Image.PreserveAspectFit; smooth: true
                source: small_picture_path

                Rectangle {
                    anchors.fill: parent;
                    border.color: "#7390b1"; border.width: 1
                    color: "transparent"
                }

                Behavior on y { enabled: item.state != "active"; NumberAnimation { duration: 400; easing.type: Easing.OutBack } }

                states: [
                    State {
                        name: "active"; when: mouseSelected == true
                        PropertyChanges { target: item;  y: loc.mouseY - height/2; scale: 1.2; z: 10 }
                    }
                ]
                transitions: Transition { NumberAnimation { property: "scale"; duration: 200} }
            }
        }
    }

    Rectangle {
        id: listViewRect
        anchors {
            right: pictureshower.right
         //   rightMargin: 2
            top: columnChooser.bottom
            bottom: pictureshower.bottom
        }
        color: "transparent"
        width:smallImageSize+4
        ListView {
            id: list
            interactive: false
            anchors {
                top: parent.top; bottom: parent.bottom
                left:parent.left; right: parent.right
                fill: parent
            }

            property int highlightIndex: 0

            model: showingModel

            delegate: appDelegate
            MouseArea {
                id: loc
                property int currentId: -1                       // Original position in model
                property int newIndex                            // Current Position in model
                property int index:list.indexAt(mouseX, mouseY) // 光标下的索引
                property bool mouseInArea: false

                width:smallImageSize+4
                height:fullImageSize

                function handleClicked()
                {
                    if(index != -1)
                    {
                        list.currentIndex = index
                        showImagesWidget.setCurrentFullImage();
                    }

                    checkLeftClick();
                    checkRightClick();
                }

                function handlePressAndHold()
                {
                    isMoving = true
                    newIndex = index
                    if(index != -1)
                    {
                        currentId = index
                        showingModel.set(index,{"mouseSelected":true})
                        list.currentIndex = index
                        showImagesWidget.setCurrentFullImage();
                    }
                }

                function handleReleased()
                {
                    var i;
                    for(i=0; i<showingModel.count; i++)
                    {
                        showingModel.set(i,{"mouseSelected":false})
                    }
                    currentId = -1
                    isMoving = false
                    checkLeftClick();
                    checkRightClick();
                    showImagesWidget.setCurrentFullImage();
                }


                anchors.fill: parent
                onClicked:handleClicked()
                onPressed:handlePressAndHold()
                onReleased:handleReleased()

                hoverEnabled: true
                onEntered:mouseInArea = true
                onExited: mouseInArea = false

                onMousePositionChanged:
                {
                    if (index < 5 && newIndex < 5 && index >=0 && newIndex >=0 && loc.currentId != -1 && index != newIndex)
                    {
                        if(showImagesWidget.isValidSwape(column*5+newIndex, column*5+index))
                        {
                            showImagesWidget.swapeImages(column*5+newIndex, column*5+index)
                            showingModel.move(newIndex, newIndex = index, 1)
                            if(list.currentIndex == showingModel.count-1)
                            {
                                rightClicked = false
                            }
                        }
                        else
                        {
                            handleReleased()
                        }

                    }
                    else if(mouseY < 0 || mouseY > loc.height - columnChooser.height)
                    {
                        handleReleased()
                    }
                    showImagesWidget.setCurrentFullImage();
                }
            }
            highlight: highlight
            highlightFollowsCurrentItem: true
            focus: true

            Rectangle{
                id: borderRect
                border.color: "#a33a1f"; border.width: 2
                x:0; y:1+ loc.index * (smallImageSize + 2)
                width: smallImageSize
                height: smallImageSize
                color: "transparent"
                visible: loc.index != -1 && loc.mouseInArea == true
            }

            function increaseCurrentIndex()
            {
                leftClicked = true
                if(list.currentIndex < showingModel.count-1)
                {
                    list.currentIndex = list.currentIndex + 1
                }
                else if(list.currentIndex == showingModel.count-1 && pictureshower.containMorePics && pictureshower.column == 0)
                {
                    list.currentIndex = 0
                    pictureshower.swape()
                }

                checkRightClick();
                showImagesWidget.setCurrentFullImage();
            }

            function decreaseCurrentIndex()
            {
                rightClicked = true
                if(list.currentIndex != 0)
                {
                    list.currentIndex = list.currentIndex - 1
                }
                else if(pictureshower.column == 1)
                {
                    list.currentIndex = showingModel.count-1;
                    pictureshower.swape()
                }
                checkLeftClick();
                showImagesWidget.setCurrentFullImage();
            }


            Keys.onDownPressed:
            {
                if(list.currentIndex == imagesInOnePage -1 && !isMoving)
                {
                    hiddenListElements(list.currentIndex, showingModel.count)
                }

                if(!isMoving)
                {
                    increaseCurrentIndex()
                }
            }


            Keys.onUpPressed:
            {
                if(!isMoving)
                {
                    decreaseCurrentIndex()
                }
            }

        }
    }

    Component {
        id: highlight
        Rectangle {
            id:highLightRect
            border.color: "#3366cc"; border.width: 0
            color: "transparent"
            y: list.currentItem.y
            x: -1

            Rectangle{
                id:hightLightRectBorder
                border.color: "#3366cc"; border.width: 1
                color: "transparent"
                anchors{
                    top: parent.top; left: parent.left
                }

                width: smallImageSize+2; height: smallImageSize+2
            }

            Behavior on y {
                SpringAnimation {
                    spring: 3
                    damping: 0.2
                }
            }
            //add more
            Image {
                id: highLightImage
                source: "images/check.png"
                anchors{
                    verticalCenter: highLightRect.verticalCenter
                    right:highLightRect.left
                }
                width:4;height:7
            }
        }

    }

    Image {
        id: popDialogBtn

        fillMode: Image.PreserveAspectFit; smooth: true

        source: popUpDialogImagePath

        anchors {
            top: fullpicture.bottom
            topMargin: 10
            left: pictureshower.left
        }

        MouseArea {
            anchors.fill: parent

            hoverEnabled: true

            onClicked:
            {
                if(enablePopUpDialog)
                {
                   showImagesWidget.handlePopUpDialogBtnClicked()
                }
            }

            onEntered:
            {
                popUpDialogImagePath = "images/popUpDialogHover.png"
            }

            onExited:
            {
                popUpDialogImagePath = "images/popUpDialog.png"
            }
        }
    }

    Image {
        id: removeImageBtn

        fillMode: Image.PreserveAspectFit; smooth: true

        source: removeImagePath

        anchors {
            top: fullpicture.bottom
            topMargin: 10
            right: fullpicture.right
        }

        MouseArea {
            anchors.fill: parent

            hoverEnabled: true

            onClicked:
            {
                showImagesWidget.handleRemoveImageBtnClicked()
            }

            onEntered:
            {
                removeImagePath = "images/removeImageHover.png"
            }

            onExited:
            {
                removeImagePath = "images/removeImage.png"
            }
        }
    }

    Image {
        id: fullpicture

        fillMode: Image.PreserveAspectFit; smooth: true
        source:showingModel.get(list.currentIndex).small_picture_path

        anchors {
            top:listViewRect.top
            topMargin: 2
            right:listViewRect.left
            rightMargin: 10
            left: pictureshower.left
        }

        Rectangle {
            id: fullPictureBorder
            anchors.fill: parent;
            border.color: "#7390b1"; border.width: 1
            color: "transparent"
        }

        width:fullImageSize; height:fullImageSize

        Rectangle {
            id: defaultFullPicture

            anchors.fill: fullPictureBorder;

            anchors {
                topMargin: 1;
                leftMargin: 1;
            }

            color: "white";

            visible: showFullPic == false

            Text {
                text:"暂无图片"
                anchors {
                    horizontalCenter: parent.horizontalCenter;
                    verticalCenter: parent.verticalCenter;
                }
                font.pixelSize: 12;
            }
        }

        Rectangle {
            id: previousButton
            width: fullpicture.width/2; height: fullImageSize
            anchors {
                left: fullpicture.left
                verticalCenter: parent.verticalCenter
            }
            color: "transparent"
            property bool showLeftButton: false

            Image {
                id:backButtonImage
                source: "images/back.png"
                anchors {
                    left: parent.left
                    verticalCenter: parent.verticalCenter
                    leftMargin: 10
                }
                visible: previousButton.showLeftButton == true && leftClicked
            }
            Image {
                id: disablebackButtonImage
                source: "images/backDisable.png"
                anchors {
                    left: parent.left
                    verticalCenter: parent.verticalCenter
                    leftMargin: 10
                }
                visible: backButtonImage.visible == false && previousButton.showLeftButton == true
            }

            MouseArea {
                anchors.fill: parent
                onClicked: {
                    list.decreaseCurrentIndex();
                }
                hoverEnabled: true
                onEntered: previousButton.showLeftButton = true
                onExited: previousButton.showLeftButton = false
            }
        }

        Rectangle {
            id: nextButton
            width: fullpicture.width/2; height: fullpicture.height
            property bool showRightButton: false
            anchors {
                right: parent.right
                verticalCenter: parent.verticalCenter
            }

            color: "transparent"

            Image{
                id: nextButtonImage
                source: "images/next.png"
                anchors {
                    right: parent.right
                    verticalCenter: parent.verticalCenter
                    rightMargin: 10
                }
                visible: nextButton.showRightButton == true && rightClicked
            }
            Image{
                id: diableButtonImage
                source: "images/nextDisable.png"
                anchors {
                    right: parent.right
                    verticalCenter: parent.verticalCenter
                    rightMargin: 10
                }
                visible: nextButtonImage.visible == false && nextButton.showRightButton == true
            }

            MouseArea {
                anchors.fill: parent
                onClicked: {
                    list.increaseCurrentIndex();
                }
                hoverEnabled: true
                onEntered: nextButton.showRightButton = true
                onExited: nextButton.showRightButton = false
            }
        }
    }
}
