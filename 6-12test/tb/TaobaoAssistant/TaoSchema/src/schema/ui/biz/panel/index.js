/*
 * 支持disable规则的布局：(biz: panel)
 * 其子皆为简单业务组件，其内不可再包含组件层次
 */

define(function(require, exports, module){
	//
	var Base = require('src/schema/layout/view');
	var Action = require('src/schema/control/action');

	//
	var View = Base.extend({
		initialize: function(){
			// 继承
			Base.prototype.initialize.apply(arguments, this);

			// 处理 control
			this.initControl();

			// 告知布局，已经ready，直接渲染即可
			// 否则会出现死循环
			this.model.ready = true;
		},

		initControl: function(){
			//
			var control = this.model.get('control');
			// reactions - control别名
			var reactions = this.model.get('reactions');
			if(reactions){
				// control和reaction互斥
				control = reactions;
			}
			if(!_.isArray(control)){
				return;
			}

			// 为每一个control项，监听
			var me = this;
			var actions = [];
			_.each(control, function(actionCfg){
				var action = new Action(_.extend({'field': me}, actionCfg));
				if(!action.isValid()){
					return;
				}

				var expression = action.get('expression');
				var depends = expression.depends();
				_.each(depends, function(depend){
					depend = as.schema.find(depend.substr(1));
					if(depend){
						depend.on('valueChanged', action.check, action);
					}
				});

				actions.push(action);
			});

			// 缓存action列表
			this.actions = actions;
			var me  = this;
			setTimeout(function(){
				_.each(me.actions, function(action){
					action.check();
				});
			}, 0);
		},

		setActionStatus: function(name, value){
			if(name === 'disable'){
				if(this.disable !== value){
					this.disable = value;
					this.onDisableStatusChanged(value);	
				}
			}
		},

		onDisableStatusChanged: function(value){
			if(value === true){
				this.$el.hide();
			}else{
				this.$el.show();
			}
			this.setPanelDisableStatus(value);
		},

		setPanelDisableStatus: function(isDisable){
			var setLayoutDisableState = function(layoutModel, isDisable){
				var self = arguments.callee;
				_.each(layoutModel.children(), function(child){
					if(child.get('type') === 'layout'){
						// 当子布局没有自己的控制时，才去联动控制
						if(!child.get('control') && !child.get('reactions')){
							self(child, isDisable);
						}
					}else{
						child.setActionStatus('disable', isDisable);
					}
				});
			};

			// 递归设置状态
			setLayoutDisableState(this.model, isDisable);
		}
	});

	//
	module.exports = View;
});