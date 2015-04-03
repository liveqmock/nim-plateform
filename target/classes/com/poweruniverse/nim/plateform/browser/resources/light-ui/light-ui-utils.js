	/**
	*@param {string} url 完整的URL地址
	*@returns {object} 自定义的对象

	*@description 用法示例：var myURL = parseURL('http://abc.com:8080/dir/index.html?id=255&m=hello#top');

	myURL.file='index.html'

	myURL.hash= 'top'

	myURL.host= 'abc.com'

	myURL.query= '?id=255&m=hello'

	myURL.params= Object = { id: 255, m: hello }

	myURL.path= '/dir/index.html'

	myURL.segments= Array = ['dir', 'index.html']

	myURL.port= '8080'

	yURL.protocol= 'http'

	myURL.source= 'http://abc.com:8080/dir/index.html?id=255&m=hello#top'
	*/
	LUI.Util = {
		login:function(userName,userPassword,saveCookie,callback){
			//取得用户名
			if(userName==null || userName.length ==0){
				LUI.Message.info("提示","请输入登陆用户名!");
				return ;
			}
			//取得用户密码
			if(userPassword==null || userPassword.length ==0){
				LUI.Message.info("提示","请输入登陆密码!");
				return ;
			}
			$.ajax({
				url: "/sign/", 
				type: "POST", 
				data:{
					component:'nim-plateform',
					service:'sign',
					method:'login',
					arguments:"{" +
						"userName:'"+userName+"'," +
						"userPassword:'"+userPassword+"'," +
						"saveCookie:"+saveCookie+"" +
					"}"
				},
				dataType:"json",
				context:this,
				success: function(result){
					if(callback==null){
						if(result.success){
							window.location = homePageUrl;
						}else{
							LUI.Message.info("登陆失败",result.errorMsg);
						}
					}else{
						callback.apply(this,[result]);
					}
					
				},
				error:function(){
					LUI.Message.info("登陆失败","访问服务器失败！");
				}
			});
		},
		logout:function(){
			$.ajax({
				url: "/sign/", 
				type: "POST", 
				data:{
					component:'nim-plateform',
					service:'sign',
					method:'logout'
				},
				dataType:"json",
				context:this,
				success: function(result){
					//跳转至登录页面
					LUI.Page.instance.redirect(loginPageUrl);
				},
				error:function(){
					LUI.Message.info("错误","访问服务器失败！");
				}
			});
		},
		parseURL:function(url) {
			var a =  document.createElement('a');
			a.href = url;
			return {
				source: url,
				protocol: a.protocol.replace(':',''),
				host: a.hostname,
				port: a.port,
				query: a.search,
				params: (function(){
				var ret = {},
				seg = a.search.replace(/^\?/,'').split('&'),
				len = seg.length, i = 0, s;
				for (;i<len;i++) {
				if (!seg[i]) { continue; }
				s = seg[i].split('=');
				ret[s[0]] = s[1];
				}
				return ret;
				})(),
				file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
				hash: a.hash.replace('#',''),
				path: a.pathname.replace(/^([^\/])/,'/$1'),
				relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
				segments: a.pathname.replace(/^\//,'').split('/')
			};
		},
		showTime:function(elId){
			$('#'+elId).html(LUI.Util.formateDate(new Date(),true));
			window.setTimeout("LUI.Util.showTime('"+elId+"')", 1000);
		},
		formateChineseDate:function(datetime){
			var str;
			var yy = datetime.getYear();
			if(yy<1900) yy = yy+1900;
			var MM = datetime.getMonth()+1;
			if(MM<10) MM = '0' + MM;
			var dd = datetime.getDate();
			if(dd<10) dd = '0' + dd;
			
			str = yy + "年" + MM + "月" + dd +'日';
			return str;
		},
		formateDate:function(datetime,showTime,showWeekDay){
			var str;
			var yy = datetime.getYear();
			if(yy<1900) yy = yy+1900;
			var MM = datetime.getMonth()+1;
			if(MM<10) MM = '0' + MM;
			var dd = datetime.getDate();
			if(dd<10) dd = '0' + dd;
			
			str = yy + "-" + MM + "-" + dd ;
			if(showTime){
				var hh = datetime.getHours();
				if(hh<10) hh = '0' + hh;
				var mm = datetime.getMinutes();
				if(mm<10) mm = '0' + mm;
				var ss = datetime.getSeconds();
				if(ss<10) ss = '0' + ss;
				str +=  " " + hh + ":" + mm + ":" + ss ;
			}
			
			if(showWeekDay){
				var ww = datetime.getDay();
				if  (ww==0)  ww="星期日";
				if  (ww==1)  ww="星期一";
				if  (ww==2)  ww="星期二";
				if  (ww==3)  ww="星期三";
				if  (ww==4)  ww="星期四";
				if  (ww==5)  ww="星期五";
				if  (ww==6)  ww="星期六";
				str = str + "  " + ww ;
			}
			return str;
		},
		//根据日期判断是今天是周几  返回值 1-7
		getWeekDay:function(year,month,day) {
			var  checkDate = new Date(year,month,1);
			var ww = checkDate.getDay();
			return ww ==0?7:ww;
		},
		//根据日期判断是今年的第几周
		getWeekNumber:function(year,month,day) {
			//如果第一个参数是日期 忽略其它参数
			var checkDate = null;
			if(typeof(year) == 'object'){
				checkDate = year;
			}else{
				checkDate = new Date(Date.UTC(year,month,day));
			}
			var time,week;
			checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
			time = checkDate.getTime();
			checkDate.setMonth(0);
			checkDate.setDate(1);
			week=Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
			return week;
		},
		//取得本月最后一天是几号
		getMonthLastDay:function(year,month){
			if(month == 12){
				//12月有31天
				return 31;
			}
			var new_date = new Date(year,month,1);                //取下月中的第一天       
			return (new Date(new_date.getTime()-1000*60*60*24)).getDate();//获取当月最后一天日期        
		},
		//取得年内某个星期的第一天
		//year: 年 数字 （例：2014）
		//weeks:星期 数字 （取值范围：1到52）
		getFirstDayOfWeek:function (year,weeks){
			//用指定的年构造一个日期对象，并将日期设置成这个年的1月1日
			//因为计算机中的月份是从0开始的,所以有如下的构造方法
			var date = new Date(year,"0","1");
			var weekDay = date.getDay();
			//取得这个日期对象 date 的长整形时间 time
			var time = date.getTime();

			//将这个长整形时间加上第N周的时间偏移
			//因为第一周就是当前周,所以有:weeks-1,以此类推
			//7*24*3600000 是一星期的时间毫秒数,(JS中的日期精确到毫秒)
			time+=(weeks-1)*7*24*3600000;
			//星期一
			time -= weekDay*24*3600000;
			//为日期对象 date 重新设置成时间 time
			date.setTime(time);
			return date;
		},
		//取得年内某个星期的第一天
		//year: 年 数字 （例：2014）
		//weeks:星期 数字 （取值范围：1到52）
		getLastDayOfWeek:function(year,weeks){
			var date = LUI.Util.getFirstDayOfWeek(year,weeks);
			var time = date.getTime();
			time += 6*24*3600000;
			date.setTime(time);
			return date;
		},
		addStyle:function(cssCode){
            if (! +"\v1") {//增加自动转换透明度功能，用户只需输入W3C的透明样式，它会自动转换成IE的透明滤镜  
                var t = cssCode.match(/opacity:(\d?\.\d+);/);
                if (t != null) {
					  cssCode = cssCode.replace(t[0], "filter:alpha(opacity=" + parseFloat(t[1]) * 100 + ")")
                }
            }
            cssCode = cssCode + "\n"; //增加末尾的换行符，方便在firebug下的查看。  
            var headElement = document.getElementsByTagName("head")[0];
            var styleElements = headElement.getElementsByTagName("style");
            if (styleElements.length == 0) {//如果不存在style元素则创建  
                if (document.createStyleSheet) {    //ie  
  				document.createStyleSheet();
                } else {
					  var tempStyleElement = document.createElement('style'); //w3c  
					  tempStyleElement.setAttribute("type", "text/css");
					  headElement.appendChild(tempStyleElement);
                }
            }
            var styleElement = styleElements[0];
            var media = styleElement.getAttribute("media");
            if (media != null && !/screen/.test(media.toLowerCase())) {
                styleElement.setAttribute("media", "screen");
            }
            if (styleElement.styleSheet) {    //ie  
                styleElement.styleSheet.cssText += cssCode;
            } else if (doc.getBoxObjectFor) {
                styleElement.innerHTML += cssCode; //火狐支持直接innerHTML添加样式表字串  
            } else {
                styleElement.appendChild(doc.createTextNode(cssCode))
            }
        },
		addScript:function(scriptCode){
          cssCode = cssCode + "\n"; //增加末尾的换行符，方便在firebug下的查看。  
          
          var tempStyleElement = doc.createElement('script'); //w3c  
          tempStyleElement.setAttribute("type", "javascript");
          
          styleElement.innerHTML += scriptCode; //火狐支持直接innerHTML添加样式表字串  
		},
		stringify : function (obj) {
		var t = typeof (obj);
		if (t != "object" || obj === null) {
		// simple data type
		if (t == "string") obj = '"'+obj+'"';
		return String(obj);
		}else {
		// recurse array or object
		var n, v, json = [], arr = (obj && obj.constructor == Array);
		for (n in obj) {
		v = obj[n]; t = typeof(v);
		if(t!='function' && !(arr && t=='boolean')){
			if (t == "string"){
				v = '"'+v+'"';
			}else if (t == "object" && v !== null) {
				v = LUI.Util.stringify(v);
				
//				if (!$.support.leadingWhitespace) {
//					//ie 6,7,8
//					v = jQuery.parseJSON(v);
//				}else{
//					v = JSON.stringify(v);
//				}
			}
			json.push((arr ? "" : '"' + n + '":') + String(v));
		}
		}
		return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
		}
		},
		thousandth:function(number){
			var numberString = ""+number;
//		thisobj.value = thisobj.value.replace(/,/g, ""); 
//		if (thisobj.value.length > 10) {                 
//			thisobj.value = thisobj.value.substring(0, 10);                 
//		}   
		var re = /\d{1,3}(?=(\d{3})+$)/g;      
			var n1 = numberString.replace(/^(\d+)((\.\d+)?)$/,function(s,s1,s2){return s1.replace(re,"$&,")+s2;});
		return n1;
	},
	isEmpty:function(object) {
		for(var p in object) { 
			return false; 
		}
		return true;
	},
	isArray:function (object){
		return  object && typeof object==='object' &&   
		typeof object.length==='number' && 
		typeof object.splice==='function' &&   
		//判断length属性是否是可枚举的 对于数组 将得到false 
		!(object.propertyIsEnumerable('length'));
	},
	htmlEncode:function (value){
		if (value) {
		return jQuery('<div />').text(value).html();
		} else {
		return '';
		}
		},
		htmlDecode:function (value) {
		if (value) {
		return $('<div />').html(value).text();
		} else {
		return '';
		}
		},
		//下载业务数据关联的文件
		//参数：{
		//			xiTongDH:string			附件的关联业务数据xiTongDH(用于验证用户权限)
		//			gongNengDH:string		附件的关联业务数据gongNengDH(用于验证用户权限)
		//			caoZuoDH:string			附件的关联业务数据caoZuoDH(用于验证用户权限)
		//			dataId:number			附件的关联业务数据dataId (用于验证用户权限)
		//			fileId:number 			附件代码
		//		}
		//		callback:function(   		回调函数 （开始下载之后 ）
		//			params:JsonObject		{xiTongDH,gongNengDH,caoZuoDH,dataId,fileId}
		//			result:boolean  		{success:true|false,errorMsg:string,fileInfo:json}
		//		)
		downloadDataFile:function (options,callback) {
			//检查参数
			var xiTongDH = options.xiTongDH;
			var gongNengDH = options.gongNengDH;
			var caoZuoDH = options.caoZuoDH;
			var dataId = options.dataId;
			var fileId = options.fileId;
			if(xiTongDH == null || gongNengDH ==null || caoZuoDH==null || dataId ==null|| fileId ==null){
				LUI.Message.warn("错误的参数","请提供正确的参数列表({xiTongDH,gongNengDH,caoZuoDH,dataId,fileId})使用downloadDataFile方法!");
				return;
			}
			//先检查权限
			LUI.DataUtils.hasAuth(xiTongDH,gongNengDH,caoZuoDH,dataId,function(isAuthed){
				if(isAuthed){
					//开始下载
					document.getElementById('_downloadFrame').src = 
						'download?type=file&gn='+gongNengDH+'&cz='+caoZuoDH+'&id='+ dataId+ '&fjid='+fileId;
				}else{
					LUI.Message.warn("信息","当前用户无权访问此附件!");
				}
				if(callback!=null){
					callback.apply(options.context||this,[{
						xiTongDH:xiTongDH,
						gongNengDH:gongNengDH,
						caoZuoDH:caoZuoDH,
						dataId:dataId,
						fileId:fileId
					},isAuthed]);
				}
			});
			
		},
		//下载文件
		//参数：
		//		fileId:number 			附件代码
		downloadFile:function (fileId) {
			//检查参数
			if(fileId ==null){
				LUI.Message.warn("错误的参数","请提供正确的参数fileId使用downloadFile方法!");
				return;
			}
			//开始下载
			document.getElementById('_downloadFrame').src = 'download?type=file&fjid='+fileId;
			
		},
		//上传文件
		//参数：{
		//			extentions:[] 		允许的文件扩展名
		//			message:'' 			提示信息
		//			callback:function(   回调函数 
		//				id:0  文件id
		//				fileName:0 文件名
		//			){} 
		//		}
		uploadIeFile:function(options,callback){
			var divEl = $(
					'<div title="上传文件..." style="padding-top:25px;">'+
						'<input type="file" id="myfile2" name="myfile" style="height:22px;width: 520px;border: 1px solid #86888B;"/>'+
					'</div>');
			divEl.dialog({
				modal: true,
				close:function(){
					$(this).dialog( "destroy" );
					$(this).remove();
				},
				width:560,
				height:200,
				maxHeight:360,
				autoOpen: true,
//				show: { effect: "scale", percent:100,duration: 400 },
//				hide: { effect: "scale", percent: 0 ,duration: 400},
				open:function(){
					if(options.zIndex){
						var widget = divEl.dialog( "widget" );
						widget.css("z-index",parseInt(options.zIndex)+1);
					}
				},
				buttons: [{ 
					text: "上传",
					click:function(event) {
						$.ajaxFileUpload({
							url: 'upload/?fuJianLXDM='+options.fuJianLX, //用于文件上传的服务器端请求地址
							secureuri: false, //是否需要安全协议，一般设置为false
							fileElementId: 'myfile2', //文件上传域的ID
							dataType: 'json', //返回值类型 一般设置为json
							success: function (result, status) {  //服务器成功响应处理函数
								if (result.success) {
									if(callback!=null){
										callback.apply(options.context||this,[[result.fuJian]]);
									}
									divEl.dialog( "close" );
								}
							},
							error: function (data, status, e){//服务器响应失败处理函数
								alert(e);
							}
						})
					}
				},{
					text: "关闭",
					click:function() {
						$( this ).dialog( "close" );
					}
				}]
			});	
		},
		uploadFile:function (options,callback) {
			if(isIE){
				this.uploadIeFile(options,callback);
				return;
			}
			var uploadFileHandler = null;
		//弹出窗口
			var divEl = $(
					'<div title="上传文件..." >'+
						'<div id="fileuploader" >上传</div>'+
					'</div>');
			divEl.dialog({
				modal: true,
				close:function(){
					$(this).dialog( "destroy" );
					$(this).remove();
				},
				width:560,
				height:200,
				maxHeight:360,
				autoOpen: false,
				show: { effect: "scale", percent:100,duration: 400 },
				hide: { effect: "scale", percent: 0 ,duration: 400},
				open:function(){
					if(options.zIndex){
						var widget = divEl.dialog( "widget" );
						widget.css("z-index",parseInt(options.zIndex)+1);
					}
				},
				buttons: [{ 
					text: "上传",
					click:function(event) {
						$(event.currentTarget).button( "disable" );
						uploadFileHandler.startUpload();
					}
				},{
					text: "关闭",
					click:function() {
						$( this ).dialog( "close" );
					}
				}]
			});
			
			
			uploadFileHandler = divEl.find("#fileuploader").uploadFile($.extend({
				url:"upload/?fuJianLXDM="+options.fuJianLX,
				fileName:"myfile",
				dragDrop:false,
				autoSubmit:false,
				showCancel:false,
				returnType:'json',
				customErrorKeyStr:'errorMsg',
				dynamicFormData:function(form, s, pd, fileArray, obj, file){
					return {
						fileName:file.name //pd.filenameText.val()
					};
				},
				onSelect:function(files){
					if(files.length > 1){
						var mheight = 200 + 57 * (files.length -1);
						if(mheight > 360){
							mheight = 360;
						}
						divEl.dialog({ height: mheight});
					}
					uploadFileHandler.fuJians = [];
					
					divEl.dialog( "open" );
				},
				afterSelect:function(files){
					if(options.autoLoad){
						uploadFileHandler.startUpload();
					}
				},
				afterUploadAll:function(){
					if(callback!=null){
						callback.apply(options.context||this,[uploadFileHandler.fuJians]);
					}
					divEl.dialog( "close" );
				},
				onSuccess:function(files,result,xhr){
					if(result.success){
						uploadFileHandler.fuJians[uploadFileHandler.fuJians.length] = result.fuJian;
					}
				}
			},options||{}));
			divEl.find('div.ajax-file-upload form input').click();
		}
		
//		正则验证字符串：str.test(/正则表达式/)<div.*?>
//		正则提取字符串：str.match(/正则表达式/)
//		正则替换字符串：str.replace(/正则表达式/,'替换后的字符串') 
	};
