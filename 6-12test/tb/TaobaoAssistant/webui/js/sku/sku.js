// JavaScript Document

/*
#.所有sku元数据组件都使用optionsInited，作为数据初始化信号，此时需要重绘组件
#组件信号：{
	out:[optionCountChanged,optionInfoChanged]
	in(仅仅组件内部关注):[optionStatusChanged]
}
#.初始化选项option{value:"", id:""}

#组件标准方法：[
	id, inputId, name,
	setSelectedOptions, selectedOptions,
	isMust,
	isReady(ready===true)--for view
]

#.sku和组件之间的option不共享
#.标准option{
	id:"",
	checked:"",
	value:"",
	text:"",
	alias:"",
	isCustom:bool,
	basecolor:[],
	url:"",
	sizeTip:""
	complexid:"",
}

#.接收组件信号：
optionCountChanged：选中项数量发生变化
optionInfoChanged：选中项信息发生变化（局部更新）

#
所有往后台写的数据，都是直接来源于table的td上，而不从model里面取。model的职责为辅助UI渲染和sku数据缓存
sku数据流程：
在渲染指定key时，将元数据保存在原来的数据上，
#
ui实现要点：所见即所得

*/