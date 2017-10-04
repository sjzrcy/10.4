import QtQuick 1.1
import NativeQuickWidgets 1.0

Item {
    id: toolTipRoot
    width: toolTip.width
    height: toolTip.height
    visible: false
    clip: false
    z: 999999999

    property alias text: toolTip.text
    property alias radius: content.radius
    property color backgroundColor: "#F7F8FA"
    property color borderColor: "#878990"
    property alias textColor: toolTip.color
    property alias font: toolTip.font
    property variant target: null
    property int yBias: 22
    property int xBias: 0
    property bool onCondition: true

    function onMouseHover(x, y)
    {
        var obj = toolTipRoot.target.mapToItem(toolTipRoot.parent, x, y);
        toolTipRoot.x = obj.x + xBias;
        toolTipRoot.y = obj.y + yBias;
    }

    function onVisibleStatus(flag)
    {
        toolTipRoot.visible = flag;
    }

    Component.onCompleted: {
        if(onCondition) {
            var itemParent = toolTipRoot.target;
            var newObject = Qt.createQmlObject('import QtQuick 1.1; MouseArea {signal mouserHover(int x, int y); signal showChanged(bool flag); anchors.fill:parent;hoverEnabled: true; onPositionChanged: {mouserHover(mouseX, mouseY)} onEntered: {showChanged(true)} onExited: {showChanged(false)} onClicked: {parent.focus = true}}'
                                               , itemParent, "mouseItem");
            newObject.mouserHover.connect(onMouseHover);
            newObject.showChanged.connect(onVisibleStatus);
        }
    }

    Item {
        id: toolTipContainer
        z: toolTipRoot.z + 1
        Rectangle {
            id: content
            width: toolTipRoot.width
            height: toolTipRoot.height
            border.color: borderColor
            color: backgroundColor
            anchors.centerIn: parent
            radius: 2.5
            Text {
                id:toolTip
                anchors.fill: parent
                anchors.margins: 3
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
            }
        }
    }

    Behavior on visible { NumberAnimation { duration: 1000 }}
}
