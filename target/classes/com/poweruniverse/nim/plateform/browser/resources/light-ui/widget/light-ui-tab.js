//alert("LUI.Form.Field");

/**
 * 显示用的字段定义
 */
LUI.Tab = {
	uniqueId:0,
	instances:LUI.Set.createNew(),
	createNew:function(tabCfg){
		var tabConfig = $.extend({},tabCfg);
		var tabInst = $.extend(LUI.Observable.createNew(),{
			id:'_tab_'+ (++LUI.Tab.uniqueId),
			config:tabCfg,
			renderType:'rela',
			events:{
				render:'_tab_render',
				tabpageSelect:'_tabpage_select'
			},
			el:null,
			tabpageCount:-1,
			currentTabpageIndex:-1,
			rendered:false,
			//创建页面元素
			render:function(){
				this.el = $(this.renderto);
				if(this.activeClass==null || this.activeClass.length == 0){
					LUI.Message.info("错误","必须为标签页"+this.name+"提供activeClass参数！");
					return false;
				}
				if(this.renderto==null || this.renderto.length == 0){
					LUI.Message.info("错误","必须为标签页"+this.name+"提供renderto参数！");
					return false;
				}
				if(this.el.length == 0){
					LUI.Message.info("错误","标签页"+this.name+"的目标元素"+this.renderto+"不存在！");
					return false;
				}
				var tabEls = this.el.find('> li');
				this.tabpageCount = tabEls.length;
				var _this = this;
				//显示第一个标签
				tabEls.each(function(index,element){
					var cTab = $(element);
					cTab.removeAttr('onclick').click(function(){
						_this.select(index);
					});
					cTab.removeClass(_this.activeClass);
					$(cTab.attr('href')).hide();
				});
				
				if(this.listenerDefs!=null){
					if(this.listenerDefs.onRender!=null){
						var onRenderFunc = window[this.listenerDefs.onRender];
						if(onRenderFunc==null){
							LUI.Message.warn('警告','tab'+this.label+'onRender事件的处理函数('+this.listenerDefs.onRender+')不存在！');
						}else{
							this.addListener(this.events.render,null,onLoadFunc);
						}
					}
					
					if(this.listenerDefs.onSelect!=null){
						var onSelectFunc = window[this.listenerDefs.onSelect];
						if(onSelectFunc==null){
							LUI.Message.warn('警告','tab'+this.label+'onSelect事件的处理函数('+this.listenerDefs.onSelect+')不存在！');
						}else{
							this.addListener(this.events.tabpageSelect,null,onSelectFunc);
						}
					}
				}
				this._onRender();
				this.select(0);
				return true;
			},
			_onRender:function(){
				this.fireEvent(this.events.render,{
					tab:this
				});
			},
			select:function(tIndex){
				if(this.currentTabpageIndex == tIndex){
					return false;
				}
				if(tIndex < 0 || tIndex >= this.tabpageCount ){
					LUI.Message.info("错误","无效的标签序号"+tIndex);
					return false;
				}
				
				var currentTabpage = this.el.find('> li').eq(tIndex);
				if(currentTabpage.is(':hidden')){
					LUI.Message.info("错误","序号"+tIndex+"的标签不允许选择");
					return false;
				}
				//取消原标签的选中效果
				var oldIndex = this.currentTabpageIndex;
				if(oldIndex >=0 ){
					var oldTabpage = this.el.find('> li').eq(this.currentTabpageIndex);
					oldTabpage.removeClass(this.activeClass);
					$(oldTabpage.attr('href')).hide();
				}
				
				//选中新标签
				currentTabpage.addClass(this.activeClass);
				$(currentTabpage.attr('href')).show();
				this.currentTabpageIndex = tIndex;
				
				this._onTabpageSelect(oldIndex,tIndex);
				return true;
			},
			_onTabpageSelect:function(oldIndex,newIndex){
				this.fireEvent(this.events.tabpageSelect,{
					tab:this,
					newIndex:newIndex,
					oldIndex:oldIndex
				});
			},
			show:function(index){
				if(index < 0 || index >= this.tabpageCount ){
					LUI.Message.info("错误","无效的标签序号"+tIndex);
					return false;
				}
				this.el.find('> li').eq(index).show();
				return true;
			},
			hide:function(index){
				if(index < 0 || index >= this.tabpageCount ){
					LUI.Message.info("错误","无效的标签序号"+tIndex);
					return false;
				}
				
				this.el.find('> li').eq(index).hide();
				if(this.currentTabpageIndex == index){
					if(index < this.tabpageCount -1){
						//选择后一个标签
						this.select(index+1);
					}else{
						//选择前一个标签
						this.select(index -1);
					}
				}
				return true;
			},
			enable:function(index){
				if(this.disableClass == null || this.disableClass.length ==0){
					return false;
				}
				if(index < 0 || index >= this.tabpageCount ){
					LUI.Message.info("错误","无效的标签序号"+tIndex);
					return false;
				}
				this.el.find('> li').eq(index).addClass(this.disableClass);
				return true;
			},
			disable:function(index){
				if(this.disableClass == null || this.disableClass.length ==0){
					return false;
				}
				if(index < 0 || index >= this.tabpageCount ){
					LUI.Message.info("错误","无效的标签序号"+tIndex);
					return false;
				}
				this.el.find('> li').eq(index).removeClass(this.disableClass);
				return true;
			}
		},tabConfig);
		
		if(tabInst.autoRender == 'true'){
			tabInst.render();
		}
		
		if(LUI.Tab.hasInstance(tabInst.name)){
			LUI.Message.warn('警告','同名标签页(LUI.Tab:'+tabInst.name+')已存在！');
		}
		LUI.Tab.instances.put(tabInst);
		return tabInst;
	},
	hasInstance:function(tabName){
		var imgInstance = null;
		for(var i =0;i<LUI.Tab.instances.size();i++){
			var _instance = LUI.Tab.instances.get(i);
			if(_instance.name == tabName){
				return true;
			}
		}
		return false;
	},
	getInstance:function(tabName){
		var imgInstance = null;
		for(var i =0;i<LUI.Tab.instances.size();i++){
			var _instance = LUI.Tab.instances.get(i);
			if(_instance.name == tabName){
				imgInstance = _instance;
				break;
			}
		}
		return imgInstance;
	},
	removeInstance:function(tabName){
		for(var i =0;i<LUI.Tab.instances.size();i++){
			var _instance = LUI.Tab.instances.get(i);
			if(_instance.name == tabName){
				LUI.Tab.instances.remove(_instance);
				break;
			}
		}
		
	}
};

