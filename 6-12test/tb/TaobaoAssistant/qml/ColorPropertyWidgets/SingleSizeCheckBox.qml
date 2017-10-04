/***************************************************************************
 *   Copyright (C) 2011 by Víctor Fernández Martínez                       *
 *   deejayworld@gmail.com                                                 *
 *                                                                         *
 *   This program is free software; you can redistribute it and/or modify  *
 *   it under the terms of the GNU General Public License as published by  *
 *   the Free Software Foundation; either version 3 of the License, or     *
 *   (at your option) any later version.                                   *
 *                                                                         *
 *   This program is distributed in the hope that it will be useful,       *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the         *
 *   GNU General Public License for more details.                          *
 *                                                                         *
 *   You should have received a copy of the GNU General Public License     *
 *   along with this program; if not, write to the                         *
 *   Free Software Foundation, Inc.,                                       *
 *   59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.             *
 ***************************************************************************/
import QtQuick 1.0
import NativeQuickWidgets 1.0
import "../nativequickwidgets"

Item {
	id: container
    property alias sizeAlias_: sizeAliasUi_.text
    property alias selected_: contents.checked
    property alias sizeMemo_: sizeMemoEditUi_.text
    property bool supportAlias_: false
    property bool supportMemo_: false
    property bool isMemoEditState_: false

    signal clicked(bool checked)
    signal nameAliasChanged(string nameAlias)
    signal memoChanged(string memo)

    width: sizeCheckBoxUi.width
    height: sizeCheckBoxUi.height

    ToolTip {
        id: sizeAliasToolTip
        target: sizeAliasUi_
        text: sizeAliasUi_.text
        radius: 2.5
        backgroundColor: "#F7F8FA"
        borderColor: "#878787"
        textColor: "#878787"
        height: aliasContent.height+4
        width: aliasContent.width+10
        xBias: 0.5*width
        yBias: 2*height
        onCondition: sizeAliasUi_.truncated
    }
    ToolTip {
        id: sizeMemoToolTip
        target: sizeMemoFlag_
        text: memoContent.text
        radius: 0
        backgroundColor: "#FFE8C0"
        borderColor: "#E3B66C"
        height: memoContent.height+4
        width: memoContent.width+10
        xBias: 0.5*width
        yBias: 2*height
    }

	Row {
        id: sizeCheckBoxUi
        spacing: 3
        width: contents.width + 3 + sizeMemoFlag_.width + 3 + sizeTextBlock_.width;
        height: contents.height

        CheckBox {
			id: contents
            width: 20; height: 20
            onClicked:{
                container.clicked(contents.checked);
            }
		}

        Image {
            id: sizeMemoFlag_
            source: "../images/exclamMark.png"
            visible: supportMemo_ && sizeMemo_.length > 0 && !isMemoEditState_
            anchors.verticalCenter: contents.verticalCenter
        }

        Item {
            id: sizeTextBlock_
            anchors.left: sizeMemoFlag_.visible? sizeMemoFlag_.right : contents.right
            anchors.leftMargin: 3

            Text {
                id: sizeAliasUi_
                width: 60
                height: 20
                elide: Text.ElideRight
                verticalAlignment: Text.AlignVCenter
                opacity: !sizeAliasEditUi_.visible ?
                             (sizeMemoEditUi_.visible ?
                                  (sizeMemoEditUi_.text.length == 0 ? 0.5 : 0) : 1):0
                z: 1
                textFormat: Text.PlainText
            }

            LineEdit {
                id: sizeAliasEditUi_
                anchors.fill: sizeAliasUi_
                visible: selected_ && supportAlias_ && !supportMemo_
                onTextChanged: {
                    console.debug("size alias changed"+text);
                    var finalText = text;
                    finalText = finalText.replace(/[:;\r\n]/g, "");
                    sizeAliasEditUi_.text = finalText;
                    container.nameAliasChanged(finalText);
                }
                text: sizeAlias_
                z: 2
                Text {
                    id: aliasContent
                    text: sizeAliasEditUi_.text
                    opacity: 0
                    textFormat: Text.PlainText
                }
            }
            LineEdit {
                id: sizeMemoEditUi_
                anchors.fill: sizeAliasUi_
                visible: supportMemo_ && selected_ && isMemoEditState_
                opacity: text.length > 0 ? 1 : 0.5
                onTextChanged: {
                    console.debug("memo changed"+text);
                    var finalText = text;
                    finalText = finalText.replace(/[:;\r\n]/g, "");
                    sizeMemoEditUi_.text = finalText;
                    container.memoChanged(finalText);
                }
                z: 3
                Text {
                    id: memoContent
                    text: sizeMemoEditUi_.text
                    opacity: 0
                    textFormat: Text.PlainText
                }
            }
        }

	}
}
