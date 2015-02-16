LUI.gnWin = {
	uniqueId:0,
	instance:null,
	createNew:function(){
		LUI.gnWin.uniqueId = LUI.gnWin.uniqueId++;
		var gn_form_win = {
			id:LUI.gnWin.uniqueId,
			initialByXTGN:function(){
				
			}
		};
		return gn_form_win;
	},
	getInstance:function(){
		if(LUI.gnWin.instance == null){
			LUI.gnWin.instance = LUI.gnWin.createNew();
		}
		return LUI.gnWin.instance;
	}
};


LUI.stlWin = {
	uniqueId:0,
	instance:null,
	createNew:function(){
		LUI.stlWin.uniqueId = LUI.stlWin.uniqueId++;
		var stl_form_win = {
			id:LUI.stlWin.uniqueId,
			_zdTree:null,
			_parentNode:null,
			_callback:null,
			_isSingleSelect:false,
			_allowUserDefine:false,
			openByDatasourceNode:function(datasourceNode,propertyName,parentCmpNode,isSingleSelect,allowUserDefine,callback){
				
				//根据数据源节点 添加字段
				this._parentNode = parentCmpNode;
				this._callback = callback;
				this._isSingleSelect = isSingleSelect;
				
				this._allowUserDefine = allowUserDefine;
				
				this._propertyName = (propertyName==null?"":propertyName);
				
				if(datasourceNode.data.component == 'stlDataset' || datasourceNode.data.component == 'stlRecord' || datasourceNode.data.component == 'workflowDataset'){
					this._xiTongDH = datasourceNode.data.xiTongDH;
					if(this._xiTongDH == null){
						LUI.Message.info("信息","当前数据源未填写系统代号!");
						return;
					}
					this._shiTiLeiDH = datasourceNode.data.shiTiLeiDH;
					if(this._shiTiLeiDH == null){
						LUI.Message.info("信息","当前数据源未填写实体类代号!");
						return;
					}
					LUI.stlWin.getInstance().requestZdsData(this._propertyName,this.showWindow);
				}else if(datasourceNode.data.component == "todoDataset"){
					this._xiTongDH = 'system';
					this._shiTiLeiDH = 'SYS_LiuChengJS';
					LUI.stlWin.getInstance().requestZdsData(this._propertyName,this.showWindow);
				}else if(datasourceNode.data.component == 'gnDataset' || datasourceNode.data.component == 'gnRecord'){
					this._xiTongDH = datasourceNode.data.xiTongDH;
					if(this._xiTongDH == null){
						LUI.Message.info("信息","当前数据源未填写系统代号!");
						return;
					}
					this._gongNengDH = datasourceNode.data.gongNengDH;
					if(this._gongNengDH == null){
						LUI.Message.info("信息","当前数据源未填写功能代号!");
						return;
					}
					LUI.stlWin.getInstance().requestZdsData(this._propertyName,this.showWindow);
				}else{
					LUI.Message.info("信息","未定义处理方式的数据源类别!");
					return;
				}
			},
			requestZdsData:function(fieldName,callback){
				//取得 实体类定义
				$.ajax({
					url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
					type: "POST", 
					data:{
						component:'nim-data',
						service:'data',
						method:'getZdList',
						arguments:"{" +
							"xiTongDH:'"+this._xiTongDH+"'," +
							(this._gongNengDH!=null?("gongNengDH:'"+this._gongNengDH+"',"):"") +
							(this._shiTiLeiDH!=null?("shiTiLeiDH:'"+this._shiTiLeiDH+"',"):"") +
							(fieldName==null?"":("property:'"+fieldName+"',"))+
							"fields:[{" +
								"name:'ziDuanDM'" +
							"},{" +
								"name:'ziDuanDH'" +
							"},{" +
								"name:'ziDuanBT'" +
							"},{" +
								"name:'ziDuanLX',fields:[{" +
									"name:'ziDuanLXDH'" +
								"}]" +
							"},{" +
								"name:'guanLianSTL',fields:[{" +
									"name:'shiTiLeiMC'" +
								"}]" +
							"}]" +
						"}"
					},
					dataType:"json",
					context:this,
					success:callback,
					error:function(){
						LUI.Message.info("信息","访问服务器失败!");
					}
				});
			},
			showWindow:function(result){
				if(result.success){
					this._zdTree = $.fn.zTree.init($('#_designer-tools-stl-window').find("#_designer-tools-stl-tree"), {
						check: {
							enable: !LUI.stlWin.getInstance()._isSingleSelect
						},
						view: {
							selectedMulti: !LUI.stlWin.getInstance()._isSingleSelect
						},
						callback: {
							beforeExpand: function(treeId,treeNode){
								//展开节点时 如果没有下级 取子节点
								if(treeNode.children==null || treeNode.children.length ==0){
									var propertyName = null;
									//取得当前节点的层次信息
									var cNode = treeNode;
									while(cNode!=null){
										if(cNode.getParentNode()!=null){
											//非根节点
											if(propertyName==null || propertyName.length == 0){
												propertyName = cNode.data.ziDuanDH;
											}else{
												propertyName = cNode.data.ziDuanDH+"."+propertyName;
											}
										}
										cNode = cNode.getParentNode();
									}
									
									var finPropertyName = LUI.stlWin.getInstance()._propertyName;
									if((finPropertyName==null || finPropertyName.length ==0) && propertyName!=null){
										finPropertyName = propertyName;
									}else if((finPropertyName!=null && finPropertyName.length >0)  && propertyName!=null){
										finPropertyName = finPropertyName+"."+propertyName;
									}
									//取子节点数据
									LUI.stlWin.getInstance().requestZdsData(finPropertyName,function(result){
										if(result.success){
											LUI.stlWin.getInstance().appendDataToNode(result.rows,treeNode);
										}else{
											LUI.Message.info("信息",result.errorMsg);
										}
									});
								}
								return true;
							}
						}
					}, []);
					this.createZdTree(result.rows);

					var dialogBtnCfg = {
						"确定": function() {
							//将选中的节点 加入字段集合
							var stlWinObj = LUI.stlWin.getInstance();
							if(stlWinObj._isSingleSelect){
								stlWinObj._callback(stlWinObj._parentNode,stlWinObj._zdTree.getSelectedNodes());
							}else{
								stlWinObj._callback(stlWinObj._parentNode,stlWinObj._zdTree.getCheckedNodes());
							}
							
							$("#_designer-tools-stl-window").dialog( "close" );
							$.fn.zTree.destroy($('#_designer-tools-stl-window').find("#_designer-tools-stl-tree"));
						 },
						 "关闭": function() {
							 $("#_designer-tools-stl-window").dialog( "close" );
							 $.fn.zTree.destroy($('#_designer-tools-stl-window').find("#_designer-tools-stl-tree"));
						 }
					};
					if(this._allowUserDefine){
						dialogBtnCfg["自定义"] = function() {
							var stlWinObj = LUI.stlWin.getInstance();
							//将选中的节点 加入字段集合
							stlWinObj._callback(stlWinObj._parentNode,[{}]);
							$("#_designer-tools-stl-window").dialog( "close" );
							$.fn.zTree.destroy($('#_designer-tools-stl-window').find("#_designer-tools-stl-tree"));
						 }
					}
					$("#_designer-tools-stl-search").change(function(){
						var searchValue = $(this).val();
						if(searchValue!=null && searchValue.length ==0){
							searchValue = null;
						}
						//隐藏所有叶子节点 以及没有叶子节点的上级节点
						var stlWinObj = LUI.stlWin.getInstance();
						var nodes = stlWinObj._zdTree.transformToArray(stlWinObj._zdTree.getNodes());
						for(var i=0;i<nodes.length;i++ ){
							var node = nodes[i];
							if(node.children==null || node.children.length ==0){
								if(searchValue==null || node.name.indexOf(searchValue) >= 0 ){
									stlWinObj._zdTree.showNode(node);
								}else{
									stlWinObj._zdTree.hideNode(node);
								}
							}
						}
					})
					
					$("#_designer-tools-stl-window").dialog({
						autoOpen: true,
						height: 300,
						width: 350,
						modal: true,
						buttons: dialogBtnCfg
					});
					$("#_designer-tools-stl-search").val('');
				}else{
					LUI.Message.info("信息",result.errorMsg);
				}
			},
			appendDataToNode:function(zdRows,node){
				var childNodeArray = [];
				for(var i=0;i<zdRows.length;i++){
					var nodeX = {
						name:zdRows[i].ziDuanBT,
						isParent:zdRows[i].ziDuanLX.ziDuanLXDH=="set" || zdRows[i].ziDuanLX.ziDuanLXDH=="object",
						nocheck:false,
						data:zdRows[i]
					};
					//关联字段代号为上级关联字段代号+当前字段代号
					if(node._parentZiDuanDH!=null){
						nodeX._parentZiDuanDH = node._parentZiDuanDH +"."+node.data.ziDuanDH;
					}else{
						nodeX._parentZiDuanDH = node.data.ziDuanDH;
					}
					
					childNodeArray[childNodeArray.length] = nodeX;
				}
				this._zdTree.addNodes(node,childNodeArray);
			
			},
			createZdTree:function(zdRows){
				//创建字段树
				var nodes = this._zdTree.addNodes(null,[{
					name:'实体类',isParent:true,open:true,nocheck:true
				}]);
				
				var childNodeArray = [];
				for(var i=0;i<zdRows.length;i++){
					var nodeX = {
						name:zdRows[i].ziDuanBT,
						isParent:zdRows[i].ziDuanLX.ziDuanLXDH=="set" || zdRows[i].ziDuanLX.ziDuanLXDH=="object",
						nocheck:false,
						data:zdRows[i]
					};
					nodeX._parentZiDuanDH = null;
					childNodeArray[childNodeArray.length] = nodeX;
				}
				this._zdTree.addNodes(nodes[0],childNodeArray);
			}
		};
		return stl_form_win;
	},
	getInstance:function(){
		if(LUI.stlWin.instance == null){
			LUI.stlWin.instance = LUI.stlWin.createNew();
		}
		return LUI.stlWin.instance;
	}
};

/**
 * form grid 类型的控件 从数据集中选择字段
 */
LUI.zdWin = {
	uniqueId:0,
	instance:null,
	createNew:function(){
		LUI.zdWin.uniqueId = LUI.zdWin.uniqueId++;
		var form_ziDuan_win = {
			id:LUI.zdWin.uniqueId,
			_callback:null,
			_isSingleSelect:null,
			_expandObjectField:null,
			_expandSetField:null,
			_parentNode:null,
			openByNode:function(datasourceNode,propertyNames,isSingleSelect,expandObjectField,expandSetField,parentNode,callback){
				
				this._callback = callback;
				this._isSingleSelect = isSingleSelect;
				this._expandObjectField = expandObjectField;
				this._expandSetField = expandSetField;
				this._parentNode = parentNode;
				
				
				if(propertyNames!=null && propertyNames.length >=1){
					var datasourceNameArray = propertyNames.split(".");
					var tdataSourceNode = datasourceNode;
					for(var i=1;i<datasourceNameArray.length;i++){
						//找到当前节点下的fields节点 
						var structureNode = null;
						if(tdataSourceNode.children!=null && tdataSourceNode.children.length >0){
							for(var j=0;j<tdataSourceNode.children.length;j++){
								if(tdataSourceNode.children[j].component.type == 'properties'){
									structureNode = tdataSourceNode.children[j];
									break;
								}
							}
						}
						
						if(structureNode!=null ){
							if(structureNode.children!=null && structureNode.children.length >0){
								for(var j=0;j<structureNode.children.length;j++){
									if(structureNode.children[j].data.name == datasourceNameArray[i]){
										tdataSourceNode = structureNode.children[j];
										break;
									}
								}
							}
						}else{
							LUI.Message.info("信息","当前数据源下未找到fields节点!");
							return;
						}
					}
					datasourceNode = tdataSourceNode;
				}
				
				//根据数据源节点 显示并选择字段
				this.showWindow(datasourceNode);
			},
			addNodeToTree:function(parentNode,tdataSourceNode){
				//找到dataSourceNode节点下的fields节点 
				var structureNode = null;
				if(tdataSourceNode.children!=null && tdataSourceNode.children.length >0){
					for(var j=0;j<tdataSourceNode.children.length;j++){
						if(tdataSourceNode.children[j].component.type == 'properties'){
							structureNode = tdataSourceNode.children[j];
							break;
						}
					}
				}
				
				if(structureNode!=null ){
					if(structureNode.children!=null && structureNode.children.length >0){
						for(var j=0;j<structureNode.children.length;j++){
							var childDatasourceNode = structureNode.children[j];
							//添加当前节点
							var childZdNodes = this._zdTree.addNodes(parentNode,[{
								name:childDatasourceNode.data.label,
								data:childDatasourceNode.data
							}]);
							//添加children节点
							if((childDatasourceNode.data.fieldType == 'object' && LUI.zdWin.instance._expandObjectField)
									|| (childDatasourceNode.data.fieldType == 'set' && LUI.zdWin.instance._expandSetField)){
								this.addNodeToTree(childZdNodes[0],childDatasourceNode);
							}
						}
					}
				}else{
					LUI.Message.info("信息","当前数据源下未找到fields节点!");
					return;
				}
			
			},
			//显示数据源中的字段信息 用于选择
			showWindow:function(dataSourceNode){
				//创建字段树
				this._zdTree = $.fn.zTree.init($('#_designer-tools-stl-window').find("#_designer-tools-stl-tree"), {
					check: {
						enable: !LUI.zdWin.instance._isSingleSelect
					},
					view: {
						selectedMulti: !LUI.zdWin.instance._isSingleSelect
					}
				}, []);
				//创建根节点
				var rootNodes = this._zdTree.addNodes(null,[{
					name:dataSourceNode.data.label,isParent:true,open:true,nocheck:true
				}]);
				//创建索引节点
				var rowIndexNodes = this._zdTree.addNodes(rootNodes[0],[{
					name:"行号",isParent:false,open:false,nocheck:false,
					data:{
						name:'@index',
						label:'索引号',
						fieldType:'int'
					}
				}]);
				this.addNodeToTree(rootNodes[0],dataSourceNode);
				//显示
				$("#_designer-tools-stl-window").dialog({
					autoOpen: true,
					height: 300,
					width: 350,
					modal: true,
					buttons: {
						"确定": function() {
							//将选中的节点 加入字段集合
							var zdWinObj = LUI.zdWin.instance;
							if(zdWinObj._isSingleSelect){
								zdWinObj._callback(zdWinObj._parentNode,zdWinObj._zdTree.getSelectedNodes());
							}else{
								zdWinObj._callback(zdWinObj._parentNode,zdWinObj._zdTree.getCheckedNodes());
							}
							
							$("#_designer-tools-stl-window").dialog( "close" );
							$.fn.zTree.destroy($('#_designer-tools-stl-window').find("#_designer-tools-stl-tree"));
						 },
						 "关闭": function() {
							 $("#_designer-tools-stl-window").dialog( "close" );
							 $.fn.zTree.destroy($('#_designer-tools-stl-window').find("#_designer-tools-stl-tree"));
						 }
					}
				});
			}
		};
		return form_ziDuan_win;
	},
	getInstance:function(){
		if(LUI.zdWin.instance == null){
			LUI.zdWin.instance = LUI.zdWin.createNew();
		}
		return LUI.zdWin.instance;
	}
};
