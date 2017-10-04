import QtQuick 1.0
import NativeQuickWidgets 1.0
import "../nativequickwidgets"

Item {
	id: container

    //model
    property alias checked: contents.checked
    property string pidStr: ""
    property string vidStr: ""
    property alias userDefinedValue: propertyValueEditUi.text
    //view
    property string defaultPropertyValue: ""

    signal clicked(string vid, bool checked, string userDefinedValue)
    signal valueChanged(string vid, string userDefinedValue)

    width: propertyValueCheckBoxUi.width
    height: propertyValueCheckBoxUi.height

	Row {
        id: propertyValueCheckBoxUi
        spacing: 3
        width: contents.width + spacing + propertyValueTextBlock.width;
        height: contents.height

        CheckBox {
			id: contents
            width: 20; height: 20
            focus: false
            onClicked: {
                var finalText = propertyValueEditUi.text;
                finalText = finalText.replace(/[,;\r\n]/g, "");
                if(finalText == "") {
                    finalText = defaultPropertyValue;
                }
                propertyValueEditUi.text = finalText;
                container.clicked(vidStr, contents.checked, finalText)
            }
        }

        Item {
            id: propertyValueTextBlock
            anchors.left: contents.right
            anchors.leftMargin: 3
            Text {
                id: propertyValueDefaultTextUi
                text: defaultPropertyValue
                opacity: (propertyValueEditUi.text.length > 0)
                         ? 0 : 1
                height: 20
                width: 70
                verticalAlignment: Text.AlignVCenter
                z: 1
            }

            LineEdit {
                id: propertyValueEditUi
                anchors.fill: propertyValueDefaultTextUi
                opacity: text.length > 0 ? 1 : 0.5
                onTextChanged: {
                    if(contents.checked){
                        var finalText = text;
                        finalText = finalText.replace(/[,;\r\n]/g, "");
                        if(finalText == "") {
                            finalText = defaultPropertyValue;
                        }
                        propertyValueEditUi.text = finalText;
                        container.valueChanged(vidStr, finalText);
                    }
                }
                z: 2
            }
        }

	}
}
