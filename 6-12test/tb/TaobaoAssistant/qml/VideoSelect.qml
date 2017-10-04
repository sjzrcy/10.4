import QtQuick 1.0
import QtWebKit 1.0

Rectangle {
    id: pictureshower
    property bool containMorePics:false
    property bool showFullPic:true

    property bool enablePopUpDialog: true
    property string popUpDialogImagePath: "images/addVideo.png"
    property string removeImagePath: "images/deleteVideo.png"

    function enablePopUpDialogBtn()
    {
        enablePopUpDialog = true;
    }

    function disablePopUpDialogBtn()
    {
        enablePopUpDialog = false;
    }

    function replace(index, newElement)
    {
        webview.url = newElement;

    }

    function loadHtml(index, url){
        var html;

        if (index === -1){
            //html = "<img width=\"" + 30 + "\" height=\""+ 30 + "\" src=\"" + url + " \" >"
            image.source = url;
            image.visible = true;
            webview.visible = false;

        }
        else{

            var height =  webview.height - 6
            var width = webview.width

            if (height < 215)
                height = 215;
            if (width < 222)
                width = 222;

            html = "<EMBED style=\"margin-left:-9px; margin-top:-10px;margin-bottom:6px\" width=\"" + width + "\" height=\"" + height  + "\" type=\"application/x-shockwave-flash\" src=\"" + url + "\" quality=\"high\"></EMBED>";

            image.visible = false;
            webview.visible = true;

            webview.html = html;

            //console.log(html)
        }
       }

    anchors.fill: parent;

    //color: "black"

    Column{

        width:parent.width;
        height: parent.height;

        Image {
            id: image
            height: parent.height- 16;
            width: parent.width

            fillMode: Image.PreserveAspectFit
            smooth: true
        }

    WebView{
            id: webview
            height: parent.height- 16;
            width: parent.width
            settings.pluginsEnabled: true
            settings.javascriptEnabled: true
            settings.privateBrowsingEnabled: true

            MouseArea{
                acceptedButtons: Qt.LeftButton
            }
         }

    Row{
        height: 16
        spacing: parent.width - popDialogBtn.width- removeImageBtn.width;
    Image {
        id: popDialogBtn

        height: 16
        fillMode: Image.PreserveAspectFit; smooth: true

        source: popUpDialogImagePath



        MouseArea {
            anchors.fill: parent

            hoverEnabled: true

            onClicked:
            {
                if(enablePopUpDialog)
                {
                   ShowVideosWidget.handlePopUpDialogBtnClicked()
                }
            }

            onEntered:
            {
                popUpDialogImagePath = "images/addVideoHover.png"
            }

            onExited:
            {
                popUpDialogImagePath = "images/addVideo.png"
            }
        }
    }

    Image {
        id: removeImageBtn

        fillMode: Image.PreserveAspectFit; smooth: true

         height: 16

        source: removeImagePath


        MouseArea {
            anchors.fill: parent

            hoverEnabled: true

            onClicked:
            {
                console.log("video:"+ pictureshower .height)
                ShowVideosWidget.handleRemoveVideoBtnClicked()
            }

            onEntered:
            {
                removeImagePath = "images/deleteVideoHover.png"
            }

            onExited:
            {
                removeImagePath = "images/deleteVideo.png"
            }
        }
    }


  }
    }
}
