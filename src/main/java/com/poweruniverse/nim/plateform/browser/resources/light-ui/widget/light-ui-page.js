//独立打开的页面 生成为page对象 在当前页面内唯一
//使用LUI.Page.instance访问此对象
LUI.Page = {
	instance:null,
	createNew:function(config){
		LUI.Page.instance = $.extend({
			title:null,
			onLoad:null,
			widgets:[],
			isModified:false,
			isSilenced:false,
			listenerDefs:{},
			maskMaxId:0,
			masks:LUI.Map.createNew(), 
			importingPages:0,
			importedPages:0,
			events:{
				load:'page_load'//
			},
			load:function(){
				console.info('page load');
				//
				if(this.title!=null && this.title.length >0){
					document.title= this.title;
				}
				//如果当前页面下 有设计器中定义需要加载的子页面
				if(LUI.ImportPage.instances.size() >0){
					this.importingPages = LUI.ImportPage.instances.size();
					console.info('page importingPages:'+this.importingPages);
					for(var i=0;i<LUI.ImportPage.instances.size();i++){
						var importPageInstance = LUI.ImportPage.instances.get(i);
						importPageInstance.addListener(importPageInstance.events.load,this,function(importInstance,pageInstance,e){
							//如果所有LUI.ImportPage.instances都加载完成  执行page的onload
							pageInstance.importedPages = pageInstance.importedPages+1;
							console.info('page importedPages:'+pageInstance.importedPages);
							if(pageInstance.importingPages == pageInstance.importedPages){
								pageInstance._onload();
							}
							//删除监听
							importInstance.removeListener(importInstance.events.load,pageInstance);
						});
					}
				}else{
					this._onload();
				}
			},
			_onload:function(){
				console.info('page onload!');
				LUI.Page.instance.unmask();
				//页面加载完成
				if(this.listenerDefs!=null && this.listenerDefs.onLoad!=null){
					var onLoadFunc = window[this.listenerDefs.onLoad];
					if(onLoadFunc==null){
						LUI.Message.warn('警告','页面onLoad事件的处理函数('+this.listenerDefs.onLoad+')不存在！');
					}else{
						onLoadFunc.apply(this,[]);
					}
				}
				//
				//检查是否有子页面需要加载 由_ct_ _cs_ _ce_指定的
        		if(_urlInfo.params._ct_!=null){
        			var subParams = {};
	        		if(_urlInfo.params._cs_!=null){
	        			subParams = eval("("+_urlInfo.params._cs_+")");
	        		}
        			var loadingImportMsgId = LUI.Page.instance.mask('正在加载子页面...');
					LUI.Page.include(_urlInfo.params._ct_,subParams,'#'+_urlInfo.params._ce_,false,function(){
						LUI.Page.instance.unmask(loadingImportMsgId);
					});
        		}
			},
			close:function(){
				//页面关闭时的清理工作 检查是否需要提示或阻止窗口关闭
				if(this.listenerDefs!=null && this.listenerDefs.onClose!=null){
					var onCloseFunc = window[this.listenerDefs.onClose];
					if(onCloseFunc==null){
						LUI.Message.warn('警告','页面onClose事件的处理函数('+this.listenerDefs.onClose+')不存在！');
					}else{
						onCloseFunc.apply(this,[]);
					}
				}
			},
			setSilence:function(si){
				this.isSilenced = si;
			},
			setModified:function(mo){
				this.isModified = mo;
			},
			mask:function(info){
				var maskId = this.maskMaxId;
				this.maskMaxId = this.maskMaxId+1;
				this.masks.put(maskId,info);
				
				if(this.masks.size() == 1){
					//显示mask 限制_pageContent的高度 与窗口一致 （使不显示滚动条）
					$("#_pageContent").css("height",$(document).height() );
					$("#_pageContent").css("overflow",'hidden' );
				}
				//更新mask
				var maskInfo = [];
				var keys = this.masks.keySet();
				for(var i=0;i<keys.length;i++){
					maskInfo[maskInfo.length] = this.masks.get(keys[i]);
				}
				$('#_pageContent').maskInfo(info);
				return maskId;
			},
			unmask:function(maskid){
				this.masks.remove(maskid);
				if(this.masks.size() == 0){
					//关闭mask
					$('#_pageContent').unmask();
					//解除高度限制 （允许出现滚动条）
					$("#_pageContent").css("height",'');
					$("#_pageContent").css("overflow",'auto' );
				}else{
					//更新mask
					var maskInfo = [];
					var keys = this.masks.keySet();
					for(var i=0;i<keys.length;i++){
						maskInfo[maskInfo.length] = this.masks.get(keys[i]);
					}
					$('#_pageContent').maskInfo(maskInfo);
				}
			},
			//跳转到新页面地址
			redirect:function(url){
				this.setSilence(true);
				window.location = url;
			},
			//在当前页面登记控件
			register:function(widgetType,widget){
				if(this.hasRegister(widgetType,widget.name)){
					LUI.Message.warn('警告','同名控件('+widgetType+':'+widget.name+')已存在！');
					return;
				}
				widget.registerName = widgetType+'_'+widget.name;
				this.widgets[this.widgets.length] = widget;
			},
			//取得当前页面已登记控件
			getWidget:function(widgetType,widgetName){
				for(var i=0;i<this.widgets.length;i++){
					if(this.widgets[i].registerName == (widgetType+'_'+widgetName)){
						return this.widgets[i];
					}
				}
				return null;
			},
			//检查当前页面是否存在指定类型和名称的控件
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
	},
	//引用css文件
	importedCSS:LUI.Set.createNew(),
	importCSS:function(cssPageUrl,catchFile){
		if(!LUI.Page.importedCSS.contains(cssPageUrl)){
			LUI.Page.importedCSS.put(cssPageUrl);
			//
			$("head").append('<link href="'+ cssPageUrl+'?rnd='+(catchFile?noCacheFlag:Math.random())+'" type="text/css" rel="stylesheet">');
		}
	},
	//引用js文件
	importedJS:LUI.Set.createNew(),
	importJS:function(jsPageUrl,catchFile,callback){
		if(!LUI.Page.importedJS.contains(jsPageUrl)){
			LUI.Page.importedJS.put(jsPageUrl);
			//加载同名js文件
	    	jQuery.ajax({
	            crossDomain: true,
	            dataType: "script",
	            cache:true,
	            url: jsPageUrl+'?rnd=' + (catchFile?noCacheFlag:Math.random()),
	            success:function(){
	            	if(callback!=null){
				        callback.apply(this,[]);
				    }
	            }
	        })
		}else{
			if(callback!=null){
		        callback.apply(this,[]);
		    }
		}
	},
	//引用另一个页面 显示在当前页面的指定位置 
	include:function(htmlPage,params,targetId,isIndependent,callback){
		var cssPage = htmlPage.substr(0,htmlPage.lastIndexOf('.'))+'.css';
		var jsPage = htmlPage.substr(0,htmlPage.lastIndexOf('.'))+'.js';
		var xmlPage = htmlPage.substr(0,htmlPage.lastIndexOf('.'))+'.xml';
		
		LUI.Page.loadHTML(htmlPage,params,function(htmlResult){//这里的htmlPage 是module目录下的文件
			//加载css
			if(htmlResult.cssExists){
				LUI.Page.importCSS('module/'+cssPage,false);
			}
			//加载子页面内容
			var pageContent = htmlResult.content;
			//取得html中的script标记内容
			var scriptSrcReg = /\<script[^\>]+src[\s\r\n]*=[\s\r\n]*([\'\"])([^\>\1]+)\1[^\>]*>/;
			var scriptReg = /<script.*>*?<\/script>/;
			var scripts = pageContent.match(scriptReg);
			if(scripts!=null){
				for(var i=0;i<scripts.length;i++){
					var scriptSrc = scripts[i].match(scriptSrcReg);
					if(scriptSrc==null){
						alert("不能识别的script字符串,请检查格式是否规范！ 例:<script src='/aa/bb.js'></script>");
					}else{
						LUI.Page.importJS(scriptSrc[2],false);//这里的地址 需要是全路径的可访问资源
					}
				}
				//清除html中的script标记
				pageContent = pageContent.replace(scriptReg ,'');
			}
			
			//取得link css标记内容
			var linkHrefReg =/href=['"]?([^'"]*)['"]?/;
			var linkReg = /<link.*?\/>/;
			var links = pageContent.match(linkReg);
			if(links!=null){
				for(var i=0;i<links.length;i++){
					var linkHref = links[i].match(linkHrefReg);
					if(linkHref==null){
						alert("不能识别的link字符串,请检查格式是否规范！ 例:<link href='/aa/bb.css' />");
					}else{
						LUI.Page.importCSS(linkHref[1],false);//这里的地址 需要是全路径的可访问资源
					}
				}
				//清除html中的script标记
				pageContent = pageContent.replace(linkReg ,'');
			}
			//处理要显示的内容 如果是唯一元素 设置其高度100%
			$(targetId).css('opacity','0').html(pageContent);
			//有同名的js文件 要在解析xml之前加载！
			if(htmlResult.jsExists){
				LUI.Page.loadJS(jsPage,true,function(){//这里的jsPage 是module目录下的文件
		        	if(!_urlInfo.params.originMode){
		        		//加载xml
		        		LUI.Page.loadXML(xmlPage,htmlResult.currentPage.name,params,isIndependent,function(){
		        			$(targetId).css('opacity','1');
		        			//callback执行之前 此页面的load事件已执行
							if(callback!=null){
								callback.apply(this,[htmlResult.currentPage]);
							}
						});
		        	}else{
		        		$(targetId).css('opacity','1');
		        	}
				});
			}else{
				if(!_urlInfo.params.originMode){
	        		//加载xml
	        		LUI.Page.loadXML(xmlPage,htmlResult.currentPage.name,params,isIndependent,function(){
	        			$(targetId).css('opacity','1');
	        			//callback执行之前 此页面的load事件已执行
						if(callback!=null){
							callback.apply(this,[htmlResult.currentPage]);
						}
					});
	        	}else{
	        		$(targetId).css('opacity','1');
	        	}
			}
		});
	},
	//加载module目录下的html文件
	loadHTML:function (htmlPage,paramsJson,callback){
		$.ajax({
			url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
			type: "POST", 
			data:{
				component:'nim-plateform',
				service:'page',
				method:'html',
				arguments:"{pageUrl:'"+ htmlPage+"',params:"+unescape(LUI.Util.stringify(paramsJson))+"}"
			},
			dataType:"json",
			success: function(htmlResult){
				if(htmlResult.success){
					//如果未登录 且页面需要登录
					if(!htmlResult.isLogged && htmlResult.currentPage.needsLogin){
						//跳转至登录页面
						if(LUI.Page.instance!=null){
							LUI.Page.instance.setSilence(true);
						}
						window.location = htmlResult.loginPage;
					}else{
						//加载css
						loginPageUrl = htmlResult.loginPage;//本系统登录页面
						homePageUrl = htmlResult.homePage;//本系统首页
						callback.apply(this,[htmlResult]);
					}
				}else{
					alert(htmlResult.errorMsg);
				}
			},
			error:function(){
				alert("获取html失败：服务器返回错误");
			}
		});
	},
	//加载module目录下的js文件
	loadJS:function(jsPageUrl,catchFile,callback){
		if(!LUI.Page.importedJS.contains(jsPageUrl)){
			LUI.Page.importedJS.put(jsPageUrl);
			//加载同名js文件
	    	jQuery.ajax({
	            crossDomain: true,
	            dataType: "script",
	            cache:true,
	            url: '/jservice/nim-plateform/page/js/'+jsPageUrl+'?rnd=' + (catchFile?noCacheFlag:Math.random()),
	            success:function(){
	            	if(callback!=null){
				        callback.apply(this,[]);
				    }
	            }
	        })
		}else{
			if(callback!=null){
		        callback.apply(this,[]);
		    }
		}
	},
	//加载module目录下的xml文件解析结果(javascript)
	loadXML:function (xmlPage,pageName,xmlParamsJson,isIndependent,callback){
		if(callback==null){
	        alert("获取xml失败：必须提供callback参数");		
	    }
		//加载xml的解析结果（javascript）
		//独立解析的时候 会将子页面解析为页面对象
		var arguments = null;
		if( xmlParamsJson ==null){
			arguments = "{pageName:'"+pageName+"',isIndependent:"+isIndependent+"}";
		}else{
			if(typeof(xmlParamsJson) == 'string'){
				alert("获取xml失败：loadXML方法的第二个参数必须为json object格式");	
			}
			arguments = "{pageName:'"+pageName+"',isIndependent:"+isIndependent+",params:"+unescape(LUI.Util.stringify(xmlParamsJson))+"}";
		}
		$.ajax({
	        crossDomain: true,
	        dataType: "script",
	        cache:true,
	        url: "/jservice/nim-plateform/page/analyse/"+xmlPage+"?arguments="+arguments, 
	        success: function(){
	        	callback.apply(this,[]);
			}
	    });
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
		//允许重复加载子页面
		if(LUI.Subpage.hasInstance(config.name)){
			var subpageInstance = LUI.Subpage.getInstance(config.name);
			subpageInstance.close();
		}
		//创建子页面对象
		var cmpInstance = $.extend({
			id:'_subpage_'+ (++LUI.Subpage.uniqueId),
			name:null,
			width:'100%',
			height:'100%',
			pageUrl:null,
			widgets:[],
			load:function(loadParam){
				console.info('subpage '+this.name+' load');
				this._onload(loadParam);
			},
			_onload:function(loadParam){
				console.info('subpage '+this.name+' onload!');
			    //子页面加载完成
				if(this.listenerDefs!=null && this.listenerDefs.onLoad!=null){
					var onLoadFunc = window[this.listenerDefs.onLoad];
					if(onLoadFunc==null){
						LUI.Message.warn('警告','子页面onLoad事件的处理函数('+this.listenerDefs.onLoad+')不存在！');
					}else{
						onLoadFunc.apply(this,[loadParam]);
					}
				}
			},
			close:function(){
				console.info('subpage '+this.name+' closing...');
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
				console.info('subpage '+this.name+' closed');
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
		
		LUI.Subpage.instances.put(cmpInstance);
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
		
		var cmpInstance = $.extend(LUI.Observable.createNew(),{
			id:'_import_page_'+ (++LUI.ImportPage.uniqueId),
			loaded:false,
			lastParams:{},
			autoLoad:"true",
			events:{
				load:'import_page_load'//
			},
			load:function(config){
				var loadCfg = config||{};
				var _this = this;
				
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
				var loadingImportMsgId = LUI.Page.instance.mask('正在加载页面('+this.label+')...');
				LUI.Page.include(subpageUrl,subpageParam,this.renderto,false,function(){
					LUI.Page.instance.unmask(loadingImportMsgId);
					_this._onLoad(subpageParam);
				});
			},
			_onLoad:function(loadParam){
				console.info('import page '+this.name+' loaded!');
				this.loaded = true;
				if(this.listenerDefs!=null && this.listenerDefs.onLoad!=null){
					var onLoadFunc = window[this.listenerDefs.onLoad];
					if(onLoadFunc==null){
						LUI.Message.warn('警告','导入子页面onLoad事件的处理函数('+this.listenerDefs.onLoad+')不存在！');
					}else{
						onLoadFunc.apply(this,[loadParam]);
					}
				}
				//代码中 对事件的监听 要晚于设计器中配置对事件的监听
				this.fireEvent(this.events.load,{},this);
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
		
		var componentPageParam = config.params||{};
//		var parameters = "{pageUrl:'"+ componentPageUrl+"',params:"+unescape(LUI.Util.stringify(componentPageParam))+"}";
		
		var pageContainerId= componentPageUrl.replace(/\//g,"_").replace(/\./g,'_');
		var pageContainer = $('<div id="'+pageContainerId+'" style="display:none;"></div>')
		pageContainer.appendTo($(document.body));
				
		var loadingPopupMsgId = LUI.Page.instance.mask('正在加载弹出窗口...');
		LUI.Page.include(options.page,componentPageParam,'#'+pageContainerId,false,function(currentPage){
			LUI.Page.instance.unmask(loadingPopupMsgId);
			
			options.title = '子页面';
			options.modal = true;
			options.width = $(window).width()/2;
			options.height = $(window).height()/2;
			
			var subPageInst = null;
			if(currentPage.name != null){
				//子页面有xml文件
				subPageInst = LUI.Subpage.getInstance(currentPage.name);
				options.title = subPageInst.title;
				if(subPageInst.width != null ){
					options.width = parseInt(subPageInst.width);
				}
				if(subPageInst.height != null ){
					options.height = parseInt(subPageInst.height);
				}
			}
			
			
			var openFunction = options.open;//调用时在配置中提供的open事件处理代码
			options.open = function(){
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
					//再执行页面组件的onClose事件
					if(subPageInst!=null){
						subPageInst.close();
					}
				}catch(e){
					console.error(e);
				}
				
				//最后销毁对象
				$(this).dialog( "destroy" );
				pageContainer.remove();
			}
			
			//设计模式下 添加一个在新窗口打开页面的button
			if(_isDesignMode){
				if(options.buttons == null){
					options.buttons = {};
				}
				options.buttons['在新窗口打开'] = function(){
					window.open('http://'+_urlInfo.host+':'+_urlInfo.port+'/nim.html?_pt_='+options.page+'&_ps_='+unescape(LUI.Util.stringify(componentPageParam)));
				}
			}
			
			options.autoOpen = true;
			pageContainer.dialog(options);
		});
	}
}