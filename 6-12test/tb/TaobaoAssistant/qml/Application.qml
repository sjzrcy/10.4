import QtQuick 1.1

Rectangle {
    id: applicationRect
    width: 300;
    height: 300
    color:"#EFF5FB"

    function append(newElement)
    {
        elements.append(newElement);
    }

    function insert(index,newElement)
    {
        elements.insert(index,newElement);
        grid.model=elements;
    }

    ListModel {
        id: elements

        ListElement
        {
            picture_path :  "http://img04.taobaocdn.com/tps/i4/T1aM5YXl4fXXXXXXXX-80-80.png"
            title :  "会员关系管理"
            url: "http://i.taobao.com/my_taobao.htm&tracelog=tbzl"
            target: "internal"
            type:"web"
			identity:""
            description:"设置会员优惠等级设置，会员资料管理，资料导出，设置会员分组、促销，会员消费分析。"
        }

        ListElement
        {
            picture_path :  "http://img04.taobaocdn.com/tps/i4/T1ox52XjpqXXXXXXXX-80-80.png"
            title :  "我要进货"
            url: "http://fenxiao.taobao.com/index.htm?from=tbzhuli"
            target: "external"
            type:"web"
			identity:""
            description:"海量货源，品质保障"
        }

        ListElement
        {
            picture_path :  "http://img01.taobaocdn.com/top/i1/T1.IC2XgduXXaCwpjX.png"
            title :  "子帐号管理"
            url: "http://mai.taobao.com/seller_admin.htm?svid=1501&tracelog=tbzl"
            target: "internal"
            type:"web"
			identity:""
            description:"对卖家员工淘宝内部行为的授权及管理，实现与商家的内部管理系统员工账号体系打通，为商家提供一体化的账号管理服务并降低商家员工管理成本。"
        }

        ListElement
        {
            picture_path :  "http://img01.taobaocdn.com/tps/i1/T1pNW2XhxhXXXXXXXX-80-80.png"
            title :  "满就送"
            url: "http://fuwu.taobao.com/serv/detail.htm?service_id=6828&tracelog=tbzl"
            target: "external"
            type:"web"
			identity:""
            description:"1、详情：满就送积分；满就送礼物；满就减现金；满就免邮。 2、功能：提升店铺销售业绩，提高店铺购买转化率，提升销售笔数，增加商品曝光力度，节约人力成本。"
        }

        ListElement
        {
            picture_path :  "http://img04.taobaocdn.com/tps/i4/T1k5G2XiJhXXXXXXXX-80-80.png"
            title :  "限时打折"
            url: "http://fuwu.taobao.com/serv/detail.htm?service_id=6830&tracelog=tbzl"
            target: "external"
            type:"web"
			identity:""
            description:"1、详情：系统帮助卖家设置限时限量的打折活动，买家方便迅速寻找打折商品。2、功能：超低折扣吸引流量，限时限量刺激购买行动力。"
        }

        ListElement
        {
            picture_path :  "http://img03.taobaocdn.com/tps/i3/T1wiS2XclhXXXXXXXX-80-80.png"
            title :  "搭配套餐"
            url: "http://fuwu.taobao.com/serv/detail.htm?service_id=6829&tracelog=tbzl"
            target: "external"
            type:"web"
			identity:""
            description:"1、详情：将几种商品组合设置成套餐来销售，通过促销套餐让买家一次性购买更多商品。 2、功能：提升销售业绩，提高购买转化率，提升销售笔数，增加商品曝光率，节约人力成本。"
        }

        ListElement
        {
            picture_path :  "http://img02.taobaocdn.com/tps/i2/T1ut52XklqXXXXXXXX-80-80.png"
            title :  "店铺优惠券"
            url: "http://fuwu.taobao.com/serv/detail.htm?service_id=6831&tracelog=tbzl"
            target: "external"
            type:"web"
			identity:""
            description:"1、详情：虚拟电子现金券，设置优惠券由买家主动领取，也可通过满就送、会员关系管理来发放优惠券，促进买家再次消费。 2、功能：促进店铺销量，有效提升店铺购买转化率。"
        }

        ListElement
        {
            picture_path :  "http://img02.taobaocdn.com/tps/i2/T1NOO2XdVhXXXXXXXX-80-80.png"
            title :  "数据魔方标准版"
            url: "http://fuwu.taobao.com/serv/detail.htm?service_id=11108&tracelog=tbzl"
            target: "external"
            type:"web"
			identity:""
            description:"数据魔方标准版服务日均成交低于5000元的客户； 优化搜索流量。"
        }


        ListElement
        {
            picture_path :  "http://img01.taobaocdn.com/tps/i1/T1CiW2XadhXXXXXXXX-80-80.png"
            title :  "旺铺装修模板"
            url: "http://fuwu.taobao.com/serv/detail.htm?service_id=10637&tracelog=tbzl"
            target: "external"
            type:"web"
			identity:""
            description:"1、动态店招：吸引留住会员的脚步；2、上千个模：可以每天让店铺换换妆；3、操作简单：在这里会打字我也就是设计师啦！"
        }

        ListElement
        {
            picture_path :  "http://img02.taobaocdn.com/tps/i2/T1ly52XmVgXXXXXXXX-80-80.png"
            title :  "旺铺拓展版"
            url: "http://fuwu.taobao.com/serv/detail.htm?service_id=10335&tracelog=tbzl"
            target: "external"
            type:"web"
			identity:""
            description:"统一模板高效配置、自由多变的个性布局、实现完整装修方案。"
        }
    }

    Component {
        id: appDelegate

        Rectangle {
            id: mainBox
            width: 140
            height: 140
            color: "#00000000"

            Image {
                id: pic
                width: 80
                height: 80
                anchors.top: parent.top
                anchors.topMargin: 20
                fillMode: Image.PreserveAspectFit
                anchors.horizontalCenter: parent.horizontalCenter
                source: picture_path


                Image {
                    id: busyIndicator
                    source: "http://img01.taobaocdn.com/tps/i1/T1qQa3XodeXXXXXXXX-18-18.png";
                    visible: pic.status != Image.Ready
                    NumberAnimation on rotation { running: pic.status != Image.Ready; from: 0; to: 360; loops: Animation.Infinite; duration: 1200 }
                }



                MouseArea
                {
                    id: picMouseArea
                    anchors.fill: parent
                    hoverEnabled: true

                    onEntered :
                    {
                        descriptionBox.visible=true;

                        mainBox.z=10;
                        pic.z=10;
                        titleText.z=10;

                        var positonInRoot = mapToItem(null, descriptionBox.width, descriptionBox.y);

                        if(positonInRoot.x>(grid.width))
                        {
                            descriptionBox.anchors.left=undefined;
                            descriptionBox.anchors.right=parent.right;

                            descriptionText.anchors.rightMargin=0;
                            descriptionText.anchors.leftMargin=12;
                            descriptionText.anchors.right=undefined;
                            descriptionText.anchors.left=descriptionBox.left;
                        }
                        else
                        {
                            descriptionBox.anchors.right=undefined;
                            descriptionBox.anchors.left=parent.left;

                            descriptionText.anchors.leftMargin=0;
                            descriptionText.anchors.rightMargin=12;
                            descriptionText.anchors.left=undefined;
                            descriptionText.anchors.right=descriptionBox.right;
                        }
                    }

                    onExited:
                    {
                        descriptionBox.visible=false;

                        mainBox.z=0;
                        pic.z=10;
                        titleText.z=0;
                    }

                    onClicked:
                    {
                        if(type=="web")
                        {
                            applicationOperator.openUrl(title,url,target);
                        }
                        else
                        {
                            applicationOperator.openApp(identity);
                        }
                    }
                }

                Image {
                    id: webMarkImage
                    anchors.left: pic.left
                    anchors.bottom: pic.bottom
                    source : "http://img02.taobaocdn.com/tps/i2/T1Gy53XlVgXXXXXXXX-28-28.png"
                    visible: (type=="web" && picMouseArea.containsMouse)
                }

            }

            Text {
                id: titleText
                height: 24
                text: title
                font.bold: true
                anchors.bottom: parent.bottom
                anchors.bottomMargin: 4
                horizontalAlignment: Text.AlignHCenter
                anchors.right: parent.right
                anchors.rightMargin: 0
                anchors.left: parent.left
                anchors.leftMargin: 0
                font.pixelSize: 14
            }


            Rectangle {
                id: descriptionBox
                height:140
                width: 280
                color:"white"
                radius: 12
                anchors.left: parent.left
                visible: false;

                Text {
                    id: descriptionText
                    width: 150
                    height: parent.height
                    anchors.top: descriptionBox.top
                    anchors.topMargin: 12
                    anchors.right: parent.right
                    anchors.rightMargin: 12
                    color:"#1E395B"

                    text:description
                    verticalAlignment: Text.AlignVCenter

                    lineHeightMode: Text.FixedHeight
                    lineHeight: 17

                    wrapMode: Text.WrapAtWordBoundaryOrAnywhere

                    anchors.verticalCenter: parent.verticalCenter
                    font.pixelSize: 12
                }

                MouseArea
                {
                    id : descriptionMouseArea
                    anchors.fill: parent;
                    hoverEnabled: true

                    onContainsMouseChanged:
                    {
                        if(!descriptionMouseArea.containsMouse )
                        {
                            descriptionBox.visible=false;

                            if(descriptionBox.visible)
                            {
                                mainBox.z=10;
                                pic.z=10;
                                titleText.z=10
                            }
                            else
                            {
                                mainBox.z=0;
                                pic.z=10;
                                titleText.z=0
                            }
                        }
                    }
                }
            }

        }
    }


    GridView {
        id : grid
        anchors.fill: parent
        cellWidth: 140;
        cellHeight: 140
        focus: true
        model: elements
        delegate: appDelegate

        cacheBuffer : 60

        snapMode: GridView.SnapToRow
        boundsBehavior: Flickable.StopAtBounds

        transitions: Transition {
            NumberAnimation { properties: "opacity"; duration: 400 }
        }
    }

}
