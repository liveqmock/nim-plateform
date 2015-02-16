//alert("LUI.Page");

LUI.Page = {
	instance:null,
	createNew:function(config){
		LUI.Page.instance = $.extend({
			title:null,
			onLoad:null,
			widgets:[],
			listenerDefs:{},
			ready:function(){
				if(this.title!=null && this.title.length >0){
					document.title= this.title;
				}
				//页面加载完成
				if(this.listenerDefs!=null && this.listenerDefs.onLoad!=null){
					var onLoadFunc = window[this.listenerDefs.onLoad];
					if(onLoadFunc==null){
						LUI.Message.warn('警告','页面onLoad事件的处理函数('+this.listenerDefs.onLoad+')不存在！');
					}else{
						onLoadFunc.apply(this,[]);
					}
				}
			},
			close:function(){
				//页面加载完成
				if(this.listenerDefs!=null && this.listenerDefs.onClose!=null){
					var onCloseFunc = window[this.listenerDefs.onClose];
					if(onCloseFunc==null){
						LUI.Message.warn('警告','页面onClose事件的处理函数('+this.listenerDefs.onClose+')不存在！');
					}else{
						onCloseFunc.apply(this,[]);
					}
				}
			},
			register:function(widgetType,widget){
				if(this.hasRegister(widgetType,widget.name)){
					LUI.Message.warn('警告','同名控件('+widgetType+':'+widget.name+')已存在！');
					return;
				}
				widget.registerName = widgetType+'_'+widget.name;
				this.widgets[this.widgets.length] = widget;
			},
			getWidget:function(widgetType,widgetName){
				for(var i=0;i<this.widgets.length;i++){
					if(this.widgets[i].registerName == (widgetType+'_'+widgetName)){
						return this.widgets[i];
					}
				}
				return null;
			},
			hasRegister:function(widgetType,widgetName){
				for(var i=0;i<this.widgets.length;i++){
					if(this.widgets[i].registerName == (widgetType+'_'+widgetName)){
						return true;
					}
				}
				return false;
			}
		},config);
		return LUI.Page.instance;
	}
}


LUI.Subpage = {
	uniqueId:0,
	instances:LUI.Set.createNew(),
	createNew:function(config){
		//检查参数
		if(config.name==null){
			LUI.Message.info("错误","必须为子页面提供name参数!");
			return null;
		}
		
		var cmpInstance = $.extend({
			id:'_component_'+ (++LUI.Subpage.uniqueId),
			name:null,
			width:'100%',
			height:'100%',
			pageUrl:null,
			widgets:[],
			ready:function(loadParam){
				//子页面同名的js文件 要在xml解析的script之后 并且在页面的onLoad事件之前加载！
				var _this = this;
//				var jsPageUrl = this.pageUrl.substr(0,this.pageUrl.lastIndexOf('.'))+'.js';
//			    loadJS(jsPageUrl,function(){
				    //子页面解析出的script加载完成
					if(_this.listenerDefs!=null && _this.listenerDefs.onLoad!=null){
						var onLoadFunc = window[_this.listenerDefs.onLoad];
						if(onLoadFunc==null){
							LUI.Message.warn('警告','子页面onLoad事件的处理函数('+_this.listenerDefs.onLoad+')不存在！');
						}else{
							onLoadFunc.apply(_this,[loadParam]);
						}
					}
//			    });
			},
			close:function(){
				//页面关闭完成 子页面作为弹出窗口使用时 关闭后触发此事件
				if(this.listenerDefs!=null && this.listenerDefs.onClose!=null){
					var onCloseFunc = window[this.listenerDefs.onClose];
					if(onCloseFunc==null){
						LUI.Message.warn('警告','子页面onClose事件的处理函数('+this.listenerDefs.onClose+')不存在！');
					}else{
						onCloseFunc.apply(this,[]);
					}
				}
				//销毁子页面创建的对象
				for(var i=0;i<this.widgets.length;i++){
					this.widgets[i].destroy();
				}
				LUI.Subpage.instances.remove(this);
			},
			register:function(widgetType,widget){
				//检查子页面内是否有重复的元素
				if(this.hasRegister(widgetType,widget.name)){
					LUI.Message.warn('警告','子页面'+this.name+'内同名控件('+widgetType+':'+widget.name+')已存在！');
					return;
				}
				//检查父页面内是否有重复的元素
				if(LUI.Page.instance!=null && LUI.Page.instance.hasRegister(widgetType,widget.name)){
					LUI.Message.warn('警告','父页面中同名控件('+widgetType+':'+widget.name+')已存在！');
					return;
				}
				widget.registerName = widgetType+'_'+widget.name;
				this.widgets[this.widgets.length] = widget;
			},
			getWidget:function(widgetType,widgetName){
				for(var i=0;i<this.widgets.length;i++){
					if(this.widgets[i].registerName == (widgetType+'_'+widgetName)){
						return this.widgets[i];
					}
				}
				return null;
			},
			hasRegister:function(widgetType,widgetName){
				for(var i=0;i<this.widgets.length;i++){
					if(this.widgets[i].registerName == (widgetType+'_'+widgetName)){
						return true;
					}
				}
				return false;
			}
		},config);
		//登记此grid
		if(LUI.Subpage.hasInstance(cmpInstance.name)){
			LUI.Message.warn('警告','同名子页面(LUI.Subpage:'+cmpInstance.name+')已存在！');
		}
		LUI.Subpage.instances.put(cmpInstance);
		
		//子页面的加载完成事件
//		cmpInstance.ready(this.params);
		return cmpInstance;
	},
	hasInstance:function(cmpName){
		var cmpInstance = null;
		for(var i =0;i<LUI.Subpage.instances.size();i++){
			var _instance = LUI.Subpage.instances.get(i);
			if(_instance.name == cmpName){
				return true;
			}
		}
		return false;
	},
	getInstance:function(cmpName){
		var cmpInstance = null;
		for(var i =0;i<LUI.Subpage.instances.size();i++){
			var _instance = LUI.Subpage.instances.get(i);
			if(_instance.name == cmpName){
				cmpInstance = _instance;
				break;
			}
		}
		return cmpInstance;
	}
}


LUI.ImportPage = {
	uniqueId:0,
	instances:LUI.Set.createNew(),
	createNew:function(importCfg){
		//检查参数
		if(importCfg.name==null){
			LUI.Message.info("错误","必须为导入子页面提供name参数!");
			return null;
		}
		
		if(importCfg.renderto==null){
			LUI.Message.info("错误","必须为导入子页面提供renderto参数!");
			return null;
		}
		
		var cmpInstance = $.extend({
			id:'_import_page_'+ (++LUI.ImportPage.uniqueId),
			loaded:false,
			lastParams:{},
			load:function(config){
				var loadCfg = config||{};
				
				var subpageUrl = loadCfg.pageURL || this.pageURL;
				if(subpageUrl==null){
					LUI.Message.info("错误","必须为LUI.ImportPage对象提供pageURL参数!");
				}
				
				var subpageParam = {};
				if(this.parameters!=null){
					for(var i=0;i<this.parameters.length;i++){
						var parameter = this.parameters[i];
						subpageParam[parameter.name] = parameter.value;
					}
				}
				if(loadCfg.params!=null){
					subpageParam = $.extend(subpageParam,loadCfg.params);
				}
				
				var htmlPage = subpageUrl.substr(0,subpageUrl.lastIndexOf('.'))+'.html';
				var cssPage = subpageUrl.substr(0,subpageUrl.lastIndexOf('.'))+'.css';
				var jsPage = subpageUrl.substr(0,subpageUrl.lastIndexOf('.'))+'.js';
				var xmlPage = subpageUrl.substr(0,subpageUrl.lastIndexOf('.'))+'.xml';
				
				this.lastParams = subpageParam;
				
				var pageContainer = $(this.renderto);
				pageContainer.mask('正在加载页面，请稍候...');
				
				var _this = this;
				
				loadHTML(htmlPage,subpageParam,function(htmlResult){
					//加载css
					if(htmlResult.cssExists){
						loadCSS(cssPage);
					}
					//加载子页面内容
					var pageContent = htmlResult.content;
					//取得html中的script标记内容
					var scriptSrcReg = /\<script[^\>]+src[\s\r\n]*=[\s\r\n]*([\'\"])([^\>\1]+)\1[^\>]*>/;
					var scriptReg = /<script.*>*?<\/script>/;
					var scripts = pageContent.match(scriptReg);
					if(scripts!=null){
						for(var i=0;i<scripts.length;i++){
							$(scripts[i]).appendTo($('head'));
						}
						//清除html中的script标记
						pageContent = pageContent.replace(scriptReg ,'');
					}
					//取得link css标记内容
					var linkReg = /<link.*?\/>/;
					var links = pageContent.match(linkReg);
					if(links!=null){
						for(var i=0;i<links.length;i++){
							$(links[i]).appendTo($('head'));
						}
						//清除html中的script标记
						pageContent = pageContent.replace(linkReg ,'');
					}
					//处理要显示的内容 如果是唯一元素 设置其高度100%
//					pageContent = $($.parseHTML(pageContent));
					pageContainer.html(pageContent);
					
					if(htmlResult.jsExists){
						//有同名的js文件 要在解析xml之前加载！
						 loadJS(jsPage,function(){
				        	if(!_urlInfo.params.originMode){
				        		//加载xml
				        		loadXML(xmlPage,subpageParam,false,function(){
									//父页面的import控件加载完成事件
									_this._onLoad(subpageParam);
									//
									pageContainer.unmask();
								});
				        	}
						});
					}else{
						//没有同名的js文件 直接加载xml
						if(!_urlInfo.params.originMode){
			        		//加载xml
			        		loadXML(xmlPage,subpageParam,false,function(){
								//父页面的import控件加载完成事件
								_this._onLoad(subpageParam);
								//
								pageContainer.unmask();
							});
			        	}
					}
				});
				
			},
			_onLoad:function(loadParam){
				this.loaded = true;
				if(this.listenerDefs!=null && this.listenerDefs.onLoad!=null){
					var onLoadFunc = window[this.listenerDefs.onLoad];
					if(onLoadFunc==null){
						LUI.Message.warn('警告','导入子页面onLoad事件的处理函数('+this.listenerDefs.onLoad+')不存在！');
					}else{
						onLoadFunc.apply(this,[loadParam]);
					}
				}
			}
		},importCfg);
		//登记此ImportPage
		if(LUI.ImportPage.hasInstance(cmpInstance.name)){
			LUI.Message.warn('警告','同名控件(LUI.ImportPage:'+cmpInstance.name+')已存在！');
		}
		LUI.ImportPage.instances.put(cmpInstance);
		//是否autoload
		if(importCfg.autoLoad==null || importCfg.autoLoad == "true"){
			cmpInstance.load();
		}
		return cmpInstance;
	},
	hasInstance:function(cmpName){
		var cmpInstance = null;
		for(var i =0;i<LUI.ImportPage.instances.size();i++){
			var _instance = LUI.ImportPage.instances.get(i);
			if(_instance.name == cmpName){
				return true;
			}
		}
		return false;
	},
	getInstance:function(cmpName){
		var cmpInstance = null;
		for(var i =0;i<LUI.ImportPage.instances.size();i++){
			var _instance = LUI.ImportPage.instances.get(i);
			if(_instance.name == cmpName){
				cmpInstance = _instance;
				break;
			}
		}
		return cmpInstance;
	}
}


LUI.PageUtils = {
		//加载组件类型的页面 并在弹出窗口中显示
		/*
		 * 参数：
		 *	page:目标页面地址
		 *	params:传递给目标页面的参数（json对象）
		 *	其它： 所有的dialog（jquery UI）对象 支持的的配置
		 */
		popup:function (options){
			var config = options||{};
			
			var componentPageUrl = config.page;
			if(componentPageUrl==null){
				LUI.Message.info("错误","必须为LUI.PageUtils.popup方法提供page参数!");
			}
			
			options.modal = true;
			
			var componentPageParam = config.params||{};
			
			var htmlPage = componentPageUrl.substr(0,componentPageUrl.indexOf('.'))+'.html';
			var cssPage = componentPageUrl.substr(0,componentPageUrl.indexOf('.'))+'.css';
			var jsPage = componentPageUrl.substr(0,componentPageUrl.indexOf('.'))+'.js';
			var xmlPage = componentPageUrl.substr(0,componentPageUrl.indexOf('.'))+'.xml';
			
			var parameters = "{pageUrl:'"+ htmlPage+"',params:"+unescape(LUI.Util.stringify(componentPageParam))+"}";
			
			
			$('#_pageContent').mask('正在加载子页面，请稍候...');
			
			loadHTML(htmlPage,componentPageParam,function(data){
					//加载css
					if(data.cssExists){
						loadCSS(cssPage);
					}
					//加载子页面内容
					if(data.success || (data.needsLogin && _urlInfo.relative == loginPageUrl)){

						var pageContainer = $('<div id="'+htmlPage.replace(/\//g,"_").replace(/\./g,'_')+'"></div>')
						pageContainer.appendTo($(document.body));
						
						var pageContent = data.content;
						//取得html中的script标记内容
						var scriptSrcReg = /\<script[^\>]+src[\s\r\n]*=[\s\r\n]*([\'\"])([^\>\1]+)\1[^\>]*>/;
						var scriptReg = /<script.*>*?<\/script>/;
						var scripts = pageContent.match(scriptReg);
						if(scripts!=null){
							for(var i=0;i<scripts.length;i++){
								$(scripts[i]).appendTo($('head'));
							}
							//清除html中的script标记
							pageContent = pageContent.replace(scriptReg ,'');
						}
						//取得link css标记内容
						var linkReg = /<link.*?\/>/;
						var links = pageContent.match(linkReg);
						if(links!=null){
							for(var i=0;i<links.length;i++){
								$(links[i]).appendTo($('head'));
							}
							//清除html中的script标记
							pageContent = pageContent.replace(linkReg ,'');
						}
						pageContent = $($.parseHTML(pageContent));
						pageContent.appendTo(pageContainer);
						
						options.title = data.title;
						
						var width = $(window).width();
						if(data.width == null ){
							width = width/2;
						}else if(data.width.endWith('%') ){
							width = width * parseInt(data.width) / 100;
						}else{
							width = parseInt(data.width);
						}
						options.width = width;
						
						var height = $(window).height(); 
						if(data.height == null ){
							height = height/2;
						}else if(data.width.endWith('%') ){
							height = height * parseInt(data.height) / 100;
						}else{
							height = parseInt(data.height);
						}
						options.height = height;
						
						var openFunction = options.open;//调用时在配置中提供的open事件处理代码
						options.open = function(){
							//先执行页面组件的onload事件
							LUI.Subpage.getInstance(data.name).ready();
							//再执行配置中可能存在的open事件处理代码
							if(openFunction!=null){
								openFunction.apply(this,[]);
							}
						}
						
						var closeFunction = options.close;//调用时在配置中提供的close事件处理代码
						options.close = function(){
							try{
								//先执行配置中可能存在的close事件处理代码
								if(closeFunction!=null){
									closeFunction.apply(this,[]);
								}
								
								var pageIns = LUI.Subpage.getInstance(data.name);
								//再执行页面组件的onClose事件
								pageIns.close();
							}catch(e){
								console.error(e);
							}
							
							//最后销毁对象
							$(this).dialog( "destroy" );
							pageContainer.remove();
						}
						//设计模式下 添加一个button
						if(_isDesignMode){
							if(options.buttons == null){
								options.buttons = {};
							}
							options.buttons['在新窗口打开'] = function(){
								window.open('http://'+_urlInfo.host+':'+_urlInfo.port+'/nim.html?_pt_='+htmlPage+'&_ps_='+unescape(LUI.Util.stringify(componentPageParam)));
							}
						}
						//
						
						options.autoOpen = false;
						pageContent.dialog(options);
						
				    	//加载当前js文件（必须在后面的javascript之前加载）
			        	loadJS(jsPage,function(){
					    	//加载自动生成的javascript代码(在代码底部 会关闭#_pageContent层的mask)
							pageContent.dialog("open");
							$('#_pageContent').unmask();
			        	});
					}else if (data.needsLogin){
						alert('请登录！');
						$('#_pageContent').unmask();
					}else{
						alert("加载弹出子页面失败:"+data.errorMsg);
						$('#_pageContent').unmask();
					}
				
				
				//加载xml
				loadXML(xmlPage,subpageParam,false,function(xmlResult){
					//父页面的import控件加载完成事件
					_this._onLoad(subpageParam);
					//
					pageContainer.unmask();
				});
			});
		}
}