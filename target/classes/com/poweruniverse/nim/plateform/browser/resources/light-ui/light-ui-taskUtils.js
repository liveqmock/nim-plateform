LUI.TaskUtils = {
	tpl:'<div id="taskUtiWin" style="">'+
			'<ul style="list-style: none outside none; margin: 0;padding: 0;width: 100%;">'+
                '<li style="float: left;font-size: 14px; line-height: 28px;margin-top: 10px;width: 100%;">'+
                	'<span style="display: block;line-height: 28px;" id="taskUtiInfo">信息</span>'+
                '</li>'+
                '<li style="float: left;font-size: 14px; line-height: 28px;width: 100%;">'+
                	'<span style="display: block;float: left;line-height: 28px;width: 110px;" id="taskUtilLabel">标题：</span>'+
                    '<span style="float:left;" >'+
                    	'<textarea name="pingShengYJ" id="taskUtilText" class="field" style=" width:440px; height:136px;" value=""></textarea>'+
					'</span>'+
                '</li>'+
             '</ul>'+
		'</div>',
	hasTodoGNCZ:function(xiTongDH,gongNengDH,id,callback,context){
		//取得当前用户的待办操作
		if(context==null){
			context = this;
		}
		if(callback==null){
			LUI.Message.error("信息","调用hasTodoGNCZ方法时，必须提供callback参数!");
			return;
		}
		$.ajax({
			url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
			type: "POST", 
			data:{
				component:'nim-data',
				service:'task',
				method:'getTodoGNCZ',
				arguments:"{" +
					"xiTongDH:'"+xiTongDH+"'," +
					"gongNengDH:'"+gongNengDH+"'," +
					"id:'"+id+"'" +
				"}"
			},
			dataType:"json",
			context:context,
			success: function(result){
				callback.apply(this,[result.success]);
			},
			error:function(){
				LUI.Message.info("信息","访问服务器失败!");
			}
		});
	},
	getTodoGNCZ:function(xiTongDH,gongNengDH,id,callback,context){
		//取得当前用户的待办操作
		if(context==null){
			context = this;
		}
		$.ajax({
			url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
			type: "POST", 
			data:{
				component:'nim-data',
				service:'task',
				method:'getTodoGNCZ',
				arguments:"{" +
					"xiTongDH:'"+xiTongDH+"'," +
					"gongNengDH:'"+gongNengDH+"'," +
					"id:'"+id+"'" +
				"}"
			},
			dataType:"json",
			context:context,
			success: function(result){
				if(result.success){
					callback.apply(this,[result]);
				}else{
					LUI.Message.info("错误",result.errorMsg);
				}
			},
			error:function(){
				LUI.Message.info("信息","访问服务器失败!");
			}
		});
	},
	//收回
	retakeTask:function(xiTongDH,gongNengDH,reason,id,callback,context){
		//取得当前用户的待办操作
		if(context==null){
			context = this;
		}
		$.ajax({
			url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
			type: "POST", 
			data:{
				component:'nim-data',
				service:'task',
				method:'retake',
				arguments:"{" +
					"xiTongDH:'"+xiTongDH+"'," +
					"gongNengDH:'"+gongNengDH+"'," +
					"reason:'"+reason+"'," +
					"id:'"+id+"'" +
				"}"
			},
			dataType:"json",
			context:context,
			success: function(result){
				if(result.success){
					callback.apply(this,[result]);
				}else{
					LUI.Message.info("错误",result.errorMsg);
				}
			},
			error:function(){
				LUI.Message.info("信息","访问服务器失败!");
			}
		});
	},
	//转交
	changeAssignUser:function(xiTongDH,gongNengDH,id,callback,context){
		//取得当前用户的待办操作
		if(context==null){
			context = this;
		}
		//
		LUI.TaskUtils.getTodoGNCZ(xiTongDH,gongNengDH,id,function(result){
			if(result.success){
				var caoZuo = result;
				
				LUI.PageUtils.popup({
					page:'manager/authedUserSelect/authedUserSelect.html',
					params:{
						gongNengDH:gongNengDH,//传递功能 操作代号 用于选择有正确权限的用户
						caoZuoDH:caoZuo.caoZuoDH
					},
					open:function(){
						$(this).dialog('option', 'title', '将当前任务转交给...');
					},
					buttons: {
						"确定": function() {
							var grid = LUI.Grid.getInstance('authedUserSelectGrid');
							var selectedRow = grid.getSelectRow();
							if(selectedRow!=null){
								var yongHuDM = selectedRow.data.yongHuDM;
								var yongHuMC = selectedRow.data.yongHuMC;
								
								$( this ).dialog( "close" );
								//
								LUI.TaskUtils._changeAssignUser({
									xiTongDH:xiTongDH,
									gongNengDH:gongNengDH,
									id:id,
									callback:callback,
									context:context,
									yongHu:selectedRow.data,
									caoZuo:caoZuo
								});
								
								
							}else{
								LUI.Message.info("信息","请选择要转交的用户!");
							}
						},
						"取消": function() {
							$( this ).dialog( "close" );
						}
					}
				});
			}
		});
	},
	_changeAssignUser:function(cInfo){
		var popContent = $(LUI.TaskUtils.tpl);
		popContent.find('#taskUtiInfo').html('将待办任务【'+cInfo.caoZuo.caoZuoMC+'】转交给:'+cInfo.yongHu.yongHuMC);
		popContent.find('#taskUtilLabel').html('转交原因：');
		popContent.find('#taskUtilText').val('');
		
		popContent.dialog({
			width:470,
			height:315,
			title:'转交待办任务',
			open:function(){
				$( this ).find('#taskUtilText').focus();
			},
			buttons: {
				"确定": function() {
					var reason = $( this ).find('#taskUtilText').val();
					if(reason == null){
						reason = '';
					}
					$( this ).dialog( "close" );
					$.ajax({
						url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
						type: "POST", 
						data:{
							component:'nim-data',
							service:'task',
							method:'changeAssignUser',
							arguments:"{" +
								"xiTongDH:'"+cInfo.xiTongDH+"'," +
								"gongNengDH:'"+cInfo.gongNengDH+"'," +
								"caoZuoDH:'"+cInfo.caoZuo.caoZuoDH+"'," +
								"reason:'"+reason+"'," +
								"newUserId:'"+cInfo.yongHu.yongHuDM+"'," +
								"id:'"+cInfo.id+"'" +
							"}"
						},
						dataType:"json",
						success: function(result2){
							if(result2.success){
								if(cInfo.callback!=null){
									cInfo.callback.apply(cInfo.context,[result2]);
								}else{
									LUI.Message.info("信息","转交成功!");
								}
							}else{
								LUI.Message.info("错误",result2.errorMsg);
							}
						},
						error:function(){
							LUI.Message.info("信息","访问服务器失败!");
						}
					});
				},
				"取消": function() {
					$( this ).dialog( "close" );
				}
			}
		});
	}
}