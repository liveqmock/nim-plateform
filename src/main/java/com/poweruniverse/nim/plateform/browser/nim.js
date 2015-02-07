	var _pageInfo = null;
	var _isLogin = null;
	var _isDesignMode = false;
	var _isOriginalChoose = false;//设计时是否在原始页面选择元素
	var _nim_page_container  = $(window);
	var loginPageUrl = '';
	var homePageUrl = '';
	var ssoLoginPageUrl = '';
	
	var	_orginalContent = null;
	$(document).ready(function(){
		//显示loading 
		var h = $(document).height();
		$("#_pageContent").css("height",h );
		$('#_pageContent').mask('正在加载页面，请稍候...');
		
		//获取页面相关文件
		var ftlPage = _urlInfo.params._pt_;
		var htmlPage = ftlPage.substr(0,ftlPage.indexOf('.'))+'.html';
		var cssPage = htmlPage.substr(0,htmlPage.indexOf('.'))+'.css';
		var jsPage = htmlPage.substr(0,htmlPage.indexOf('.'))+'.js';
		var xmlPage = htmlPage.substr(0,htmlPage.indexOf('.'))+'.xml';
		_pageInfo = {
			htmlPage:htmlPage,
			ftlPage:ftlPage,
			cssPage:cssPage,
			jsPage:jsPage,
			xmlPage:xmlPage
		};
		//判断是否为设计模式
    	if(_urlInfo.host == '127.0.0.1' && _urlInfo.port == "8080"){
			_isDesignMode = true;
			//加载原始页面
			$.ajax({
				url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
				type: "POST", 
				data:{
					application:'nsb',
					service:'page',
					method:'orginal',
					parameters:"{pageUrl:\'" + _pageInfo.htmlPage + "\'}"
				},
				dataType:"json",
				success: function(data){
					_orginalContent = $($.parseHTML(data.content));
//					_orginalContent = $(data.content);
				}
			});
		}

		//必须以这种方式加载css 保证其中引用的路径正确
		$("head").append('<link href="module/'+ _pageInfo.cssPage+'" type="text/css" rel="stylesheet">');
		//加载页面html文件
		
		var params = _urlInfo.params._ps_;
		var parameters = null;
		if(params==null){
			parameters = "{pageUrl:'"+ _pageInfo.htmlPage+"'}";
		}else{
			parameters = "{pageUrl:'"+ _pageInfo.htmlPage+"',params:"+unescape(params)+"}";
		}
		$.ajax({
			url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
			type: "POST", 
			data:{
				application:'nsb',
				service:'page',
				method:'html',
				parameters:parameters
			},
			dataType:"json",
			success: function(data){
				_isLogin = data.isLogged;//记录用户当前是否已登录
				loginPageUrl = data.loginPage;//本系统登录页面
				homePageUrl = data.homePage;//本系统首页
				ssoLoginPageUrl = data.ssoLoginPage;//sso系统url

				if(data.success){
					$("#_pageContent").css("height",'');
//					alert(data.content);
					
					var pageContent = $($.parseHTML(data.content));
					if(pageContent.length ==1){
						pageContent.css('height','100%')
					}
					
					
					pageContent.appendTo($('#_pageContent'));
			    	//加载当前js文件（必须在后面的javascript之前加载）
					
					jQuery.ajax({
			            crossDomain: true,
			            dataType: "script",
			            cache:true,
			            url: '/jservice/?application=nsb&service=page&method=js&parameters={pageUrl:\'' + _pageInfo.jsPage + '\'}',
			            success: function(){
							//加载javascript模板信息
							var templateString = data.template;
							if(templateString!=null){
								templateString = templateString.replace(/\\n/g,"\n").replace(/\\"/g,'\"').replace(/\\'/g,"\'");
						    	$("body").append(templateString);
							}
							
					    	//加载自动生成的javascript代码(在代码底部 会关闭#_pageContent层的mask)
							if(data.script!=null){
								try{
									$("body").append('<script language="JavaScript">'+data.script+'</script>');
									_page_widget.ready(params);
								}catch(e){
									console.error("加载自动生成的javascript代码失败:"+e);
									console.error(e);
									$('#_pageContent').unmask();
								}
							}else{
								//无xml文件
								$('#_pageContent').unmask();
							}
							
					    	
					    	//创建designer
					    	if(_isDesignMode){
//					    		$("#_original").appendTo($('#_pageContent'));
								showDesigner();
							}
						}
			        })
			        
//					$.getScript('/jservice/?application=nsb&service=page&method=js&parameters={pageUrl:\'' + _pageInfo.jsPage + '\'}',function(){});
			    	//$("body").append('<script src="/jservice/?application=nsb&service=page&method=js&parameters={pageUrl:\'' + _pageInfo.jsPage + '\'}" language="JavaScript"></script>');
			    	
			    	//
				}else if (data.needsLogin == true && data.isLogged == false){
					window.location = loginPageUrl; 
				}else{
					alert(data.errorMsg);
					//创建designer
			    	if(_isDesignMode){
//			    		$("#_original").appendTo($('#_pageContent'));
			    		showDesigner();
			    	}
				}
			},
			error:function(){
				alert("访问服务器失败！");
			}
		});
		
	});
	
	
	/**
	 * 定义ForceWindow类构造函数
	 * 无参数
	 * 无返回值
	 */
	function ForceWindow (){
	  this.r = document.documentElement;
	  this.f = document.createElement("FORM");
	  this.f.target = "_blank";
	  this.f.method = "post";
	  this.r.insertBefore(this.f, this.r.childNodes[0]);
	}

	/**
	 * 定义open方法
	 * 参数sUrl：字符串，要打开窗口的URL。
	 * 无返回值
	 */
	ForceWindow.prototype.open = function (sUrl){
	  this.f.action = sUrl;
	  this.f.submit();
	}


	function showDesigner(){
		//--------------------------------------------------------------------
		//开启调试器
		//--------------------------------------------------------------------
		//加载“系统”信息
		_nim_page_container = $('#_pageContent');
		var xiTongDataArray = null;
		var gongNengDataArray = null;
		var shiTiLeiDataArray = null;
		var ziDuanLXDataArray = null;
		
		LUI.DataUtils.requestXiTongData(function(result){
			xiTongDataArray = result.rows;
			if(xiTongDataArray!=null && gongNengDataArray!=null && shiTiLeiDataArray!=null && ziDuanLXDataArray!=null ){
				LUI.PageDesigner.getInstance().createDesigner($('body').layout({
					center: {
						applyDemoStyles:true
					},
					east: {
						paneClass:'ui-layout-pane',
						size:370
					}
				}),'_designer',xiTongDataArray,gongNengDataArray,shiTiLeiDataArray,ziDuanLXDataArray);
			}
		});
		
		//加载“功能”信息
		LUI.DataUtils.requestGongNengData(function(result){
			gongNengDataArray = result.rows;
			if(xiTongDataArray!=null && gongNengDataArray!=null && shiTiLeiDataArray!=null && ziDuanLXDataArray!=null ){
				LUI.PageDesigner.getInstance().createDesigner($('body').layout({
					center: {
						applyDemoStyles:true
					},
					east: {
						paneClass:'ui-layout-pane',
						size:370
					}
				}),'_designer',xiTongDataArray,gongNengDataArray,shiTiLeiDataArray,ziDuanLXDataArray);
			}
		});
		
		//加载“实体类”信息
		LUI.DataUtils.requestShiTiLeiData(function(result){
			shiTiLeiDataArray = result.rows;
			if(xiTongDataArray!=null && gongNengDataArray!=null && shiTiLeiDataArray!=null && ziDuanLXDataArray!=null ){
				LUI.PageDesigner.getInstance().createDesigner($('body').layout({
					center: {
						applyDemoStyles:true
					},
					east: {
						paneClass:'ui-layout-pane',
						size:370
					}
				}),'_designer',xiTongDataArray,gongNengDataArray,shiTiLeiDataArray,ziDuanLXDataArray);
			}
		});
		
		//加载“实体类”信息
		LUI.DataUtils.requestZiDuanLXData(function(result){
			ziDuanLXDataArray = result.rows;
			if(xiTongDataArray!=null && gongNengDataArray!=null && shiTiLeiDataArray!=null && ziDuanLXDataArray!=null ){
				LUI.PageDesigner.getInstance().createDesigner($('body').layout({
					center: {
						applyDemoStyles:true
					},
					east: {
						paneClass:'ui-layout-pane',
						size:370
					}
				}),'_designer',xiTongDataArray,gongNengDataArray,shiTiLeiDataArray,ziDuanLXDataArray);
			}
		});
	
	}
	
	function logout(){
		$.ajax({
			url: "/jservice/", 
			type: "POST", 
			data:{
				application:'nsb',
				service:'data',
				method:'logout'
			},
			dataType:"json",
			context:this,
			success: function(result){
				window.location = loginPageUrl;
			},
			error:function(){
				LUI.Message.info("错误","访问服务器失败！");
			}
		});
	}
	
	
//////////////////////////////////////////////////////////
	/**
	* 日期格式化
	* @param format
	* yyyy-MM-dd HH:mm:ss:SSS 星期E 时区:Z
	*
	* @returns {string}
	*/
	Date.prototype.format = function (format) {
		// 数字时区
		var timezone = this.getTimezoneOffset() / 60;
		format = format.replace(/z/g, timezone);
		// 汉字时区
		var zone = {
			'12': '东西十二区',
			'11': '西十一区',
			'10': '西十区',
			'9': '西九区',
			'8': '西八区',
			'7': '西七区',
			'6': '西六区',
			'5': '西五区',
			'4': '西四区',
			'3': '西三区',
			'2': '西二区',
			'1': '西一区',
			'0': '中时区',
			'-1': '东一区',
			'-2': '东二区',
			'-3': '东三区',
			'-4': '东四区',
			'-5': '东五区',
			'-6': '东六区',
			'-7': '东七区',
			'-8': '东八区',
			'-9': '东九区',
			'-10': '东十区',
			'-11': '东十一区',
			'-12': '东西十二区'
		}
		
		format = format.replace(/Z/g, zone[timezone]);
		// 汉字星期
		format = format.replace(/E/g, ['日', '一', '二', '三', '四', '五', '六'][this.getDay()]);
		// 数字星期
		format = format.replace(/e/g, this.getDay());
		// 4位年份
		format = format.replace(/yyyy/g, this.getFullYear());
		// 2位年份 .兼容浏览器.getYear() IE返回4位.其它返回2位
		var year = this.getYear();
		year = year < 2000 ? year + 1900 : year;
		format = format.replace(/yy/g, year.toString().substr(2, 2));
		
		function f(value) {
			return value < 10 ? ('0' + value) : value;
		}
		// 不足补0 月份
		var month = this.getMonth() + 1;
		format = format.replace(/MM/g, f(month));
		// 不补0 月份
		format = format.replace(/M/g, month);
		// 不足补0 日期
		var date = this.getDate();
		format = format.replace(/dd/g, f(date));
		// 不补0 日期
		format = format.replace(/d/g, date);
		// 不足补0 小时
		var hours = this.getHours();
		format = format.replace(/HH/g, f(hours));
		// 不补0 小时
		format = format.replace(/H/g, hours);
		// 不足补0 分钟
		var minute = this.getMinutes();
		format = format.replace(/mm/g, f(minute));
		// 不补0 分钟
		format = format.replace(/m/g, minute);
		// 不足补0 秒钟
		var second = this.getSeconds();
		format = format.replace(/ss/g, f(second));
		// 不补0 分钟
		format = format.replace(/s/g, second);
		// 不足补0 毫秒
		var milliSecond = this.getMilliseconds();
		format = format.replace(/SSS/g, f(milliSecond));
		// 不补0 毫秒
		format = format.replace(/S/g, milliSecond);
		return format;
	}
