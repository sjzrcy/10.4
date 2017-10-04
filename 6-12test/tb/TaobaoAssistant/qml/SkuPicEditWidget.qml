import QtQuick 1.1
import NativeQuickWidgets 1.0
import "nativequickwidgets"

Rectangle {
    id: skuPicEditUi
    color: "#F7F8FA"
    width: 90
    height: 90
    property string pid: ""
    property string vid: ""
    property bool hasImage: false
    property alias source: skuPicDispUi.source
    property bool skuImageOn: true

    function updateColorPicValue(newPic)
    {
        skuValueOperator.updateColorPicValue(pid, vid, newPic);
    }
    function selectImage()
    {
        var selectedImg = skuValueOperator.selectImages();
        if(selectedImg !== "")
        {
            updateColorPicValue(selectedImg);
        }
    }

    Text {
        id: noImageRequiredUi
        z: 2
        text: "无需图片"
        color: "#999"
        height: 20
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.verticalCenter: parent.verticalCenter
        horizontalAlignment: Text.AlignHCenter
        visible: !skuImageOn
    }

    Image {
        id: skuPicDispUi
        z: 1
        anchors.fill: parent
        fillMode: Image.PreserveAspectFit
        source: "images/no_image.png"
        sourceSize.width: 90
        sourceSize.height: 90
        visible: !noImageRequiredUi.visible
        cache: false

        Text {
            id: uploadImageUi
            z: 1
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.bottom: parent.bottom
            height: 20
            text: "上传图片"
            color: "#4D7FD2"
            visible: !hasImage
            horizontalAlignment: Text.AlignHCenter

            CursorArea {
                z: 1
                anchors.fill: parent
                cursorShape: "hand"
            }
        }

        MouseArea
        {
            z: 3
            anchors.fill: uploadImageUi
            onClicked: {
                console.debug("add picture clicked");
                selectImage();
            }
        }

        MouseArea
        {
            id: pictureMouseArea
            z: 2
            anchors.fill: parent
            hoverEnabled: true
        }
    }


    Rectangle
    {
       id: toolBar
       z: 3
       height: 25
       color: "#E8E8E8"
       opacity: 0.65
       visible: pictureMouseArea.containsMouse && !uploadImageUi.visible
       anchors.bottom: parent.bottom
       anchors.rightMargin: 0
       anchors.bottomMargin: 0
       anchors.right: parent.right
       anchors.leftMargin: 0
       anchors.left: parent.left

       Row {
           x: 20
           y: 5
           spacing: 20

       Image {
           id: updateColorPicValueButtonUi
           width: 15
           height: 15
           source: "images/update_image.png"
           sourceSize.width: 12
           sourceSize.height: 12

           MouseArea
           {
               anchors.fill : parent;
               onClicked:
               {
                   console.debug("update clicked");
                   selectImage();

               }
           }
       }

       Image {
           id: deleteColorPicValueButtonUi
           width: 15
           height: 15
           source: "images/del_image.png"
           sourceSize.width: 12
           sourceSize.height: 12

           MouseArea
           {
               anchors.fill : parent;
               onClicked:
               {
                   console.debug("del clicked");
                   updateColorPicValue("");
               }
           }
       }
       }
    }
}
