import QtQuick 1.1
import "widget"

Rectangle {
    id: mainWindows
    width:400
    height:400
    property int contactInfoWidth: 249
    property int contactInfoHeight:220
    property int contactInfoTopMargin: 10
    property int contactInfoLeftMargin: 15
    property int textTopMargin: 10
    property int textLeftMargin: 10
    property int titleTextPixelSize: 16
    property int contextPixelSize: 12
    property int detailTitleTextPixelSize: 20
    property int detailContextPixelSize: 16
    property string detailContactName: ""
    property string detailContactLocation: ""
    property string detailContactAddress: ""
    property string detailContactCompany: ""
    property string detailContactZip: ""
    property string detailContactMobile: ""
    property string detailContactPhone: ""

    color: '#EDEDED'

    ListModel {
        id: contactInfoList
    }    function clearListModel()
    {
        contactInfoList.clear()
    }

    function appendListModel(newElement)
    {
        contactInfoList.append(newElement);
    }

    function editBtnClicked(contactId)
    {
        contactOperator.handleModifyContact(contactId)
    }

    function deleteBtnClicked(contactId, name)
    {
        contactOperator.handleDeleteContact(contactId, name)
    }

    function insertBtnClicked()
    {
        contactOperator.handleModifyContact()
    }

    Component {
        id: mainDelegate

        Item{
            id: contactInfoBox
            width:mainGrid.cellWidth
            height:mainGrid.cellHeight

            Image{
                id: insertBtn
                anchors
                {
                    horizontalCenter: parent.horizontalCenter
                    verticalCenter: parent.verticalCenter
                }
                width:contactInfoWidth - 2*contactInfoLeftMargin
                height:contactInfoHeight - 2*contactInfoTopMargin
                x: contactInfoBox.x + contactInfoLeftMargin
                y: contactInfoBox.y + contactInfoTopMargin
                source: "icon/newContacts.png"
                visible: listEnd == "true"
                enabled: listEnd == "true"
                MouseArea {
                    id: insertloc
                    anchors.fill: parent
                    onClicked: insertBtnClicked()
                }
            }

            Image{
                id: contactInfo
                anchors
                {
                    horizontalCenter: parent.horizontalCenter
                    verticalCenter: parent.verticalCenter
                }

                width:contactInfoWidth - 2*contactInfoLeftMargin
                height:contactInfoHeight - 2*contactInfoTopMargin
                x: contactInfoBox.x + contactInfoLeftMargin
                y: contactInfoBox.y + contactInfoTopMargin
                source:  "icon/addressBackground.png"
                visible: listEnd == "false"

                property bool iconEnable:false
                MouseArea {
                    id: contactInfoLoc
                    anchors.fill: parent
                    hoverEnabled: true
                    onPressed: {
                        editBtnClicked(contactId)
                    }
                    onEntered: {
                        contactInfo.iconEnable = true
                        contactInfo.source = "icon/addressBackgroundHover.png"
                    }
                    onExited: {
                        contactInfo.iconEnable = false
                        contactInfo.source = "icon/addressBackground.png"
                    }
                }

                Image {
                    id: deleteIcon
                    anchors{
                        top: parent.top
                        topMargin:10
                        right:parent.right
                        rightMargin:10
                    }

                    source: "icon/deleteIcon.png"
                    visible: contactInfo.iconEnable == true
                    MouseArea {
                        id: deleteLoc
                        anchors.fill: parent
                        onPressed: deleteBtnClicked(contactId, name)
                    }
                }
                Image {
                    id: editIcon
                    anchors{
                        top: parent.top
                        topMargin:10
                        right:deleteIcon.left
                        rightMargin:10
                    }
                    source: "icon/editIcon.png"
                    visible: contactInfo.iconEnable == true
                    MouseArea {
                        id: editLoc
                        anchors.fill: parent
                        onPressed: editBtnClicked(contactId)
                    }
                }
                Text {
                    id: customerName
                    anchors{
                        top: parent.top
                        topMargin: textTopMargin
                        left: parent.left
                        leftMargin: textLeftMargin
                    }
                    text: name
                    font.pixelSize: titleTextPixelSize
                }

                Image {
                    id: cancelDefIcon
                    anchors{
                        verticalCenter: customerName.verticalCenter
                        left: customerName.right
                    }
                    source: "icon/cancelDef.png"
                    visible: cancelDef == "true"
                }

                Image {
                    id: sendDefIcon
                    anchors{
                        verticalCenter: customerName.verticalCenter
                        left: cancelDefIcon.right
                    }
                    source: "icon/sendDef.png"
                    visible: sendDef == "true"
                }

                Text {
                    id: customerLocation
                    anchors{
                        top: customerName.bottom
                        topMargin: 5
                        left: parent.left
                        leftMargin: 10
                    }
                    text: location
                    font.pixelSize: contextPixelSize
                }

                Text {
                    id: customerAddress
                    anchors{
                        top: customerLocation.bottom
                        topMargin: textTopMargin
                        left: parent.left
                        leftMargin: textLeftMargin
                    }
                    text: address
                    font.pixelSize: contextPixelSize
                }

                Text {
                    id: customerCompany
                    anchors{
                        top: customerAddress.bottom
                        topMargin: textTopMargin
                        left: parent.left
                        leftMargin: textLeftMargin
                    }
                    text: company
                    font.pixelSize: contextPixelSize
                }

                Text {
                    id: customerZip
                    anchors{
                        top: customerCompany.bottom
                        topMargin: textTopMargin
                        left: parent.left
                        leftMargin: textLeftMargin
                    }
                    text: zip
                    font.pixelSize: contextPixelSize
                }

                Text {
                    id: customerMobile
                    anchors{
                        top: customerZip.bottom
                        topMargin: textTopMargin
                        left: parent.left
                        leftMargin: textLeftMargin
                    }
                    text: mobile
                    font.pixelSize: contextPixelSize
                }

                Text {
                    id: customerPhone
                    anchors{
                        top: customerMobile.bottom
                        topMargin: textTopMargin
                        left: parent.left
                        leftMargin: textLeftMargin
                    }
                    text: phone
                    font.pixelSize: contextPixelSize
                }
            }
        }
    }

    GridView {
        id: mainGrid
        anchors.fill: parent
        cellWidth: contactInfoWidth
        cellHeight: contactInfoHeight
        model: contactInfoList
        delegate: mainDelegate
        highlightMoveDuration:50
        focus: true
        cacheBuffer:60

        snapMode: GridView.SnapToRow
        boundsBehavior: Flickable.StopAtBounds

        // Only show the scrollbars when the view is moving.
        states: State {
            name: "ShowBars"
            when: mainGrid.movingVertically
            PropertyChanges { target: verticalScrollBar; opacity: 1 }
        }

        transitions: Transition {
            NumberAnimation { properties: "opacity"; duration: 400 }
        }
    }

    ScrollBar {
        id: verticalScrollBar
        width: 12; height: mainGrid.height-12
        anchors.right: parent.right
        opacity: 0
        orientation: Qt.Vertical
        position: mainGrid.visibleArea.yPosition
        pageSize: mainGrid.visibleArea.heightRatio
    }
}
