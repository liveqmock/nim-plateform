//工具栏 在此文件内定义


LUI.Toolsbar = {
	createNew:function(){
		var toolsbar = $.extend(LUI.Widget.createNew(),{
			buttons:[],
			render:function(){
				for(var i=0;i<this.buttons.length;i++){
					this.buttons[i].render();
				}
			},
			deRender:function(){
				for(var i=0;i<this.buttons.length;i++){
					this.buttons[i].deRender();
				}
			},
			addButton:function (button){
				this.buttons[this.buttons.length] = button;
				if(button.autoRender == "true" && button.rendered == false){
					button.render();
				}
			},
			/**
			 * 将显示值转换为数据值
			 */
			removeButton:function(button){
				for(var i=0;i<this.buttons.length;i++){
					if(button.name == this.buttons[i].name){
						button.deRender();
						this.buttons.splice(i,1);
						break;
					}
				}
			},
			/**
			 * 将数据值格式化为显示值 (对每个可选对象 处理为checkbox的label)
			 */
			enable:function(){
				for(var i=0;i<this.buttons.length;i++){
					this.buttons[i].enable();
				}
			},
			disable:function(){
				for(var i=0;i<this.buttons.length;i++){
					this.buttons[i].disable();
				}
			},
			enableButton:function(button){
				for(var i=0;i<this.buttons.length;i++){
					if(button.name == this.buttons[i].name){
						button.enable();
						break;
					}
				}
			},
			disableButton:function(button){
				for(var i=0;i<this.buttons.length;i++){
					if(button.name == this.buttons[i].name){
						button.disable();
						break;
					}
				}
			}
		});
		return toolsbar;
	}
};



LUI.Toolsbar.Button = {
	createNew:function(btnCfg){
		
		var onClickFunctionName = btnCfg.onClick;
		var onClickFunc = null;
		if(onClickFunctionName!=null && onClickFunctionName.length >0){
			onClickFunc = window[onClickFunctionName];
			if(onClickFunc==null){
				LUI.Message.warn('查询失败','按钮onClick事件的处理函数('+onClickFunctionName+')不存在！');
			}
		}
		
		var btn = $.extend(LUI.Widget.createNew(),{
			renderto:null,
			action:null,
			rendered:false,
			renderType:'none',
			enabled:"false",
			onClickFunction:onClickFunc,
			events:{
				click:'_btn_click'
			},
			render:function(){
				if(!this.rendered && this.renderType != 'none' ){
					//根据构建类型 确定如何render
					if(this.createFieldEl(LUI.Template.Toolsbar.button)){
						//按钮的默认事件
						var _this = this;
						if(this.el!=null ){
							this.el.bind("click",function(){
								if(_this.enabled == "true"){
									if(_this.action!=null){
										_this.action.apply(_this,[_this]);
									}
									
									_this.fireEvent(_this.events.click,{
											button:_this
									},_this);
								}
								
							});
						}
						//将自定义onchange方法 绑定到当前对象
						if(this.onClickFunction!=null){
							this.addListener(this.events.click,this._observer,this.onClickFunction);
						}
						this.rendered = true;
					}
				}
			},
			createFieldEl:function(_templateString){
				var _template = null;
				var fieldContentString = null;
				
				if(_templateString!=null){
					_template = Handlebars.compile(_templateString);
					fieldContentString = _template(this);
				}
				//根据构建类型 确定如何render
				if(this.renderType == 'append' ){
					//创建新的label、input元素 放置到form内部 
					LUI.Message.warn('错误','按钮不支持此生成方式('+this.renderType+')！');
				}else if(this.renderType == 'insert' ){
					//创建新的input元素 放置到原有元素内部 
					this.el = $(fieldContentString);
					this.el.appendTo($(this.renderto).first());
				}else if(this.renderType == 'replace'){
					//替换原有input
					this.oldEl = $(this.renderto).first();
					if(this.oldEl.length == 0){
						LUI.Message.warn('未替换按钮','未找到按钮'+this.name+'('+this.label+')的目标元素('+this.renderto+')！');
						return false;
					}
					//在原有元素后 插入新的input元素
					this.oldEl.after($(fieldContentString));
					this.el = this.oldEl.next();
					//删除原有元素
					this.oldEl.remove();
				}else if(this.renderType == 'rela'){
					this.el = $(this.renderto).first();
					if(this.el.length == 0){
						LUI.Message.warn('未关联按钮','未找到按钮'+this.name+'('+this.label+')的目标元素('+this.renderto+')！');
						return false;
					}
				}
				return true;
			},
			//撤销对按钮元素的创建
			deRender:function(forceDeRender){
				if(this.renderType != 'none' ){
					//根据构建类型 确定如何derender此按钮
					if(this.renderType == 'append'){
						//从form中 删除当前元素
						this.el.remove();
					}else if(this.renderType == 'insert'){
						//删除新的input元素
						this.el.remove();
					}else if(this.renderType == 'replace'){
						//将保存的原有元素信息 放回原处
						this.el.after(this.oldEl);
						//删除新的input元素
						this.el.remove();
					}else if(this.renderType == 'rela'){
						
					}
					
					//与页面元素取消关联
					this.el.unbind("click");
					this.removeAllListener();
				}
				
				this.el = null;
				this.rendered = false;
			},
			/**
			 * 将数据值格式化为显示值 (对每个可选对象 处理为checkbox的label)
			 */
			enable:function(){
				this.el.removeClass('nim-button-disabled');
				this.enabled = true;
			},
			disable:function(){
				this.el.addClass('nim-button-disabled');
				this.enabled = false;
			}
		},btnCfg);
		return btn;
	}
};

