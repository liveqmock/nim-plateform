LUI.DataUtils = {
	requestShiTiLeiData:function(callback){
		var fieldsJson = [{
			name:'shiTiLeiDM'
		},{
			name:'shiTiLeiDH'
		},{
			name:'shiTiLeiMC'
		},{
			name:'zhuJianLie'
		},{
			name:'xianShiLie'
		},{
			name:'paiXuLie'
		},{
			name:'xiTong',fields:[{name:'xiTongDH'}]
		},{
			name:'zds',fields:[{
				name:'ziDuanDH'
			},{
				name:'ziDuanBT'
			},{
				name:'guanLianSTL',fields:[{name:'shiTiLeiDH'}]
			},{
				name:'ziDuanLX',fields:[{name:'ziDuanLXDH'}]
			}]
		}];
		LUI.DataUtils.listStlData('sys','SYS_ShiTiLei',0,0,fieldsJson,null,null,callback,this);
	},
	requestGongNengData:function(callback){
		var fieldsJson = [{
			name:'gongNengDM'
		},{
			name:'gongNengDH'
		},{
			name:'gongNengMC'
		},{
			name:'shiTiLei',fields:[{name:'shiTiLeiDH'}]
		},{
			name:'xiTong',fields:[{name:'xiTongDH'}]
		},{
			name:'czs',fields:[{name:'caoZuoDH'},{name:'caoZuoMC'},{name:'duiXiangXG'}]
		}];
		LUI.DataUtils.listStlData('sys','SYS_GongNeng',0,0,fieldsJson,null,null,callback,this);
	},
	requestXiTongData:function(callback){
		var fieldsJson = [{
			name:'xiTongDH'
		},{
			name:'xiTongMC'
		}];
		LUI.DataUtils.listStlData('sys','SYS_XiTong',0,0,fieldsJson,null,null,callback,this);
	},
	requestZiDuanLXData:function(callback){
		var fieldsJson = [{
			name:'ziDuanLXDM'
		},{
			name:'ziDuanLXDH'
		},{
			name:'ziDuanLXMC'
		}];
		LUI.DataUtils.listStlData('sys','SYS_ZiDuanLX',0,0,fieldsJson,null,null,callback,this);
	},
	getSqlVariable:function(xiTongDH,sqlString,callback,context){
		if(context==null){
			context = this;
		}
		$.ajax({
			url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
			type: "POST", 
			data:{
				component:'nim-data',
				service:'data',
				method:'getSqlVariable',
				arguments:"{" +
					"xiTongDH:'"+xiTongDH+"'," +
					"sql:\""+sqlString+"\"" +
				"}"
			},
			dataType:"json",
			context:context,
			success: function(result){
				if(result.success){
					callback.apply(this,[result]);
				}else{
					LUI.Message.info("信息",result.errorMsg);
				}
			},
			error:function(){
				LUI.Message.info("信息","访问服务器失败!");
			}
		});
	},
	listSqlData:function(xiTongDH,sqlString,start,limit,fieldsJson,callback,context){
		if(context==null){
			context = this;
		}
		$.ajax({
			url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
			type: "POST", 
			data:{
				component:'nim-data',
				service:'data',
				method:'getSqlList',
				arguments:"{" +
					"xiTongDH:'"+xiTongDH+"'," +
					"sql:\""+sqlString+"\"," +
					"start:" +start +"," +
					"limit:" +limit  +"," +
					"fields:" + LUI.Util.stringify(fieldsJson)+
					(context.lastParams.parameters!=null?(",params:"+LUI.Util.stringify(context.lastParams.parameters)):"")+
				"}"
			},
			dataType:"json",
			context:context,
			success: function(result){
				if(result.success){
					callback.apply(this,[result]);
				}else{
					LUI.Message.info("信息",result.errorMsg);
				}
			},
			error:function(){
				LUI.Message.info("信息","访问服务器失败!");
			}
		});
	},
	//对某些数据执行status类型的操作
	execute:function (xiTongDH,gongNengDH,caoZuoDH,dataArray,callback) {
		$.ajax({
			url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
			type: "POST", 
			data:{
				component:'nim-data',
				service:'data',
				method:'execute',
				arguments:"{" +
					"xiTongDH:'"+xiTongDH+"'," +
					"gongNengDH:'"+gongNengDH+"'," +
					"caoZuoDH:'"+caoZuoDH+"'," +
					"submitData:"+LUI.Util.stringify(dataArray) +
				"}"
			},
			dataType:"json",
			success: function(result){
				if(result.success){
					if(callback!=null){
						callback.apply(this,[result]);
					}else{
						LUI.Message.info("信息","操作成功！");
					}
				}else{
					LUI.Message.info("信息",result.errorMsg);
				}
			},
            error:function(){
				LUI.Message.info("信息","访问服务器失败!");
            }
		});
	},
	//加载一个对象 使用功能代号、操作代号、主键值
	loadGnData:function(xiTongDH,gongNengDH,caoZuoDH,id,fieldsJson,callback,context){
		if(context==null){
			context = this;
		}
		$.ajax({
			url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
			type: "POST", 
			data:{
				component:'nim-data',
				service:'data',
				method:'getGnRecord',
				arguments:"{" +
					"xiTongDH:'"+xiTongDH+"'," +
					"gongNengDH:'"+gongNengDH+"'," +
					"caoZuoDH:'"+caoZuoDH+"'," +
					(id==null?'id:null,':("id:'"+id+"',")) +
					"fields:" + LUI.Util.stringify(fieldsJson)+
				"}"
			},
			dataType:"json",
			context:context,
			success: function(result){
				if(result.success){
					callback.apply(this,[result]);
				}else{
					LUI.Message.info("信息",result.errorMsg);
				}
			},
			error:function(){
				LUI.Message.info("信息","访问服务器失败!");
			}
		});
	},
	listJavaData:function(className,start,limit,filters,parameters,callback,context){
		if(context==null){
			context = this;
		}
		$.ajax({
			url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
			type: "POST", 
			data:{
				component:'nim-data',
				service:'data',
				method:'getJavaList',
				arguments:"{" +
					"start:'"+start+"'," +
					"limit:'"+limit+"'," +
					"className:'"+className+"'" +
					(filters!=null?(",filters:" +LUI.Util.stringify(filters)):"")+
					(parameters!=null?(",parameters:" +LUI.Util.stringify(parameters)):"")+
				"}"
			},
			dataType:"json",
			context:context,
			success: function(result){
				if(result.success){
					callback.apply(this,[result]);
				}else{
					LUI.Message.info("信息",result.errorMsg);
				}
			},
			error:function(){
				LUI.Message.info("信息","访问服务器失败!");
			}
		});
	},
	listGnData:function(xiTongDH,gongNengDH,caoZuoDH,start,limit,fieldsJson,filterJson,sortsJson,callback,context){
		if(context==null){
			context = this;
		}
		$.ajax({
			url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
			type: "POST", 
			data:{
				component:'nim-data',
				service:'data',
				method:'getGnList',
				arguments:"{" +
					"xiTongDH:'"+xiTongDH+"'," +
					"gongNengDH:'"+gongNengDH+"'," +
					"caoZuoDH:'"+caoZuoDH+"'," +
					"start:" +start +"," +
					"limit:" +limit  +"," +
					"fields:" + LUI.Util.stringify(fieldsJson) +
					(filterJson!=null?(",filters:" +LUI.Util.stringify(filterJson)):"")+
					(sortsJson!=null?(",sorts:" +LUI.Util.stringify(sortsJson)):"")+
				"}"
			},
			dataType:"json",
			context:context,
			success: function(result){
				if(result.success){
					callback.apply(this,[result]);
				}else{
					LUI.Message.info("信息",result.errorMsg);
				}
			},
			error:function(){
				LUI.Message.info("信息","访问服务器失败!");
			}
		});
	},
	listStlData:function(xiTongDH,shiTiLeiDH,start,limit,fieldsJson,filterJson,sortsJson,callback,context){
		if(context==null){
			context = this;
		}
		var params = "{" +
			"xiTongDH:'"+xiTongDH+"'," +
			"shiTiLeiDH:'"+shiTiLeiDH+"'," +
			"start:" +start +"," +
			"limit:" +limit  +"," +
			"fields:" + LUI.Util.stringify(fieldsJson) +
			(filterJson!=null?(",filters:" +LUI.Util.stringify(filterJson)):"")+
			(sortsJson!=null?(",sorts:" +LUI.Util.stringify(sortsJson)):"")+
		"}";
		$.ajax({
			url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
			type: "POST", 
			data:{
				component:'nim-data',
				service:'data',
				method:'getStlList',
				arguments:params
			},
			dataType:"json",
			context:context,
			success: function(result){
				if(result.success){
					callback.apply(this,[result]);
				}else{
					LUI.Message.info("信息",result.errorMsg);
				}
			},
			error:function(){
				LUI.Message.info("信息","访问服务器失败!");
			}
		});
	},
	listTodoData:function(xiTongDH,shiTiLeiDH,start,limit,todoOnly,fieldsJson,filterJson,sortsJson,workflows,callback,context){
		if(context==null){
			context = this;
		}
		$.ajax({
			url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
			type: "POST", 
			data:{
				component:'nim-data',
				service:'data',
				method:'getTodoList',
				arguments:"{" +
					"xiTongDH:'sys'," +
					"shiTiLeiDH:'SYS_LiuChengJS'," +
					"start:" +start +"," +
					"limit:" +limit  +"," +
					"todoOnly:" +todoOnly  +"," +
					"fields:" + LUI.Util.stringify(fieldsJson) +
					(filterJson!=null?(",filters:" +LUI.Util.stringify(filterJson)):"")+
					(sortsJson!=null?(",sorts:" +LUI.Util.stringify(sortsJson)):"")+
					(workflows!=null?(",workflows:" +LUI.Util.stringify(workflows)):"")+
				"}"
			},
			dataType:"json",
			context:context,
			success: function(result){
				if(result.success){
					callback.apply(this,[result]);
				}else{
					LUI.Message.info("信息",result.errorMsg);
				}
			},
			error:function(){
				LUI.Message.info("信息","访问服务器失败!");
			}
		});
	},
	//检查当前用户对特定数据是否有权限
	hasAuth:function (xiTongDH,gongNengDH,caoZuoDH,id,callback){
		$.ajax({
			url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
			type: "POST", 
			data:{
				component:'nim-data',
				service:'auth',
				method:'hasAuth',
				arguments:"{" +
					"xiTongDH:'"+xiTongDH+"'," +
					"gongNengDH:'"+gongNengDH+"'," +
					"caoZuoDH:'" +caoZuoDH +"'," +
					"id:'" +id +"'" +
				"}"
			},
			dataType:"json",
			success: function(result){
				if(result.success){
					callback.apply(this,[result.data]);
				}else{
					LUI.Message.info("信息",result.errorMsg);
				}
			},
			error:function(){
				LUI.Message.info("信息","访问服务器失败!");
			}
		});
	},
	//检查当前用户是否有功能操作权限
	hasGNCZAuth:function (xiTongDH,gongNengDH,caoZuoDH,callback){
		$.ajax({
			url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
			type: "POST", 
			data:{
				component:'nim-data',
				service:'auth',
				method:'hasGNCZAuth',
				arguments:"{" +
					"xiTongDH:'"+xiTongDH+"'," +
					"gongNengDH:'"+gongNengDH+"'," +
					"caoZuoDH:'" +caoZuoDH +"'" +
				"}"
			},
			dataType:"json",
			success: function(result){
				if(result.success){
					callback.apply(this,[result.data]);
				}else{
					LUI.Message.info("信息",result.errorMsg);
				}
			},
			error:function(){
				LUI.Message.info("信息","访问服务器失败!");
			}
		});
	}
}


