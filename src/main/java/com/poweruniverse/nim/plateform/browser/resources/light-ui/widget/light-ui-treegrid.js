//alert("LUI.Grid.TreeGrid");


LUI.Grid.TreeGrid = {
	createNew:function(config){
		var treeConfig = config.tree;
		delete config.tree;
		
		var treeGridInstance = $.extend(LUI.Grid.createNew(config),{
			load:function(){
				if(this.datasource!=null ){
					//根据分级类型 取得根节点数据
					for(var i=0;i<this.datasource.size();i++){
						var record = this.datasource.getRecord(i);
						var codeVal = record.getFieldValue(this.tree.levelField);
						if(this.tree.levelType == 'parent'){
							if(codeVal == null){
								this.tree.appendRootNode(false,record);
							}
						}else if(this.tree.levelType == 'section'){
							//根据编号分级 查找当前数据源中 满足添加的下级节点数据
							var levelPartArray = this.tree.levelSectionFormat.split('-');
							var thisCodeLength = parseInt(levelPartArray[0]);
							if(codeVal!=null && codeVal.length == thisCodeLength){
								this.tree.appendRootNode(false,record);
							}
						}
					}
					
					if(this.autoRender == "true"){
						this.render();
					}
				}
			},
			render:function(){
				//生成 treegrid
//				if(targetEl==null && this.renderto==null){
//					LUI.Message.info("错误","必须为树提供renderto参数!");
//					return null;
//				}else if(targetEl!=null){
//					this.renderto = targetEl;
//				}
//
//				if(typeof(this.renderto) == 'string'){
//					this.renderto = $(this.renderto);
//				}
				
				//删除除header和footer以外的行 
				if(this.footerLines>0){
					$(this.renderto +' li').slice(this.headerLines, -this.footerLines).remove();
				}else{
					$(this.renderto +' li').slice(this.headerLines).remove();
				}
				//监听tree的nodeRender事件
				this.tree.addListener(this.tree.events.nodeRender,this,function(sourceTree,listnerGrid,event){
					var node = event.params.node;
					var eventTree = event.params.tree;
					eventTree.grid.fireEvent(eventTree.grid.events.rowRendered,{
						grid:eventTree.grid,
						rowEl:node.el,
						rowData:node.data.getData()
					});
				});
				//创建/显示tree
				if(!this.rendered){
					this.tree.render();
					//创建节点
					this.rendered = true;
				}
			}
		});
		
		var treeInstance = LUI.Grid.TreeGrid.Tree.createNew(treeGridInstance,treeConfig);
		treeGridInstance.tree = treeInstance;
		
//		if(treeGridInstance.autoLoad == "true" && treeGridInstance.datasource!=null){
//			//监听数据源的load事件 
//			treeGridInstance.datasource.addListener(treeGridInstance.datasource.events.load,treeGridInstance,function(source,target,event){
//				target.load();
//			});
//		}
		
		//登记此grid
//		if(LUI.Grid.hasInstance(treeGridInstance.name)){
//			LUI.Message.warn('警告','同名表格控件(LUI.Grid:'+treeGridInstance.name+')已存在！');
//		}
//		LUI.Grid.instances.put(treeGridInstance);
		return treeGridInstance;
	}
}


LUI.Grid.TreeGrid.Tree = {
	createNew:function(grid,config){

		var treeInstance = $.extend(LUI.Tree.createNew(config),{
			grid:grid,
			render:function(){
				//创建/显示tree nodes
				if(!this.rendered){
					for(var i=0;i<this.rootNodes.size();i++){
						var node = this.rootNodes.get(i);
						if(!node.rendered){
							node.render();
						}
					}
					//创建节点
					this.rendered = true;
				}
			},
			appendRootNode:function(isLeaf,data){
				//
				var lastChildNode = this.getLastRootNode();;
				
				var node = LUI.Grid.TreeGrid.Tree.Node.createNew({
					tree:this,
					parent:this,
					previousNode:lastChildNode,//前一节点
					nextNode:null,//下一节点
					isLeaf:isLeaf,
					data:data,
					level:0
				});
				this.rootNodes.put(node);
				//在html中显示节点
				if(lastChildNode!=null){
					lastChildNode.nextNode = node;
					lastChildNode.nodeSwitchType = lastChildNode._getNodeSwitchType();
				}
				if(this.rendered){
//					node.render();
					//最后一个子节点不再是最后
					if(lastChildNode!=null && lastChildNode.rendered){
						lastChildNode._refreshSwitchClass();
					}
				}
				//
				this._onNodeAppend(node);
				return node;
			},
			_requestChild:function(node,callback){
				if(this.loadMode == 'local'){
					if(this.levelType == 'parent'){
						//根据上下级关系 查找当前数据源中 满足添加的下级节点数据
						var thisPKVal = node.data.primaryFieldValue;
						var childRecords = [];
						for(var i=0;i< this.grid.datasource.size();i++){
							var r = this.grid.datasource.getRecord(i);
							var childCodeVal = r.getFieldValue(this.levelField);
							if(childCodeVal!=null && childCodeVal.primaryFieldValue == thisPKVal ){
								childRecords[childRecords.length] = r;
							}
						}
						callback.apply(node,[childRecords]);
					}else if(this.levelType == 'section'){
						//根据编号分级 查找当前数据源中 满足添加的下级节点数据
						var levelPartArray = this.levelSectionFormat.split('-');
						var thisCodeLength = 0;
						var childCodeLength = 0;
						for(var i=0;i<= node.level +1;i++){
							thisCodeLength = childCodeLength;
//							childCodeLength += parseInt(levelPartArray[i]);
							
							if(i> levelPartArray.length-1 ){
								childCodeLength += parseInt(levelPartArray[levelPartArray.length-1]);
							}else{
								childCodeLength += parseInt(levelPartArray[i]);
							}
						}
						
						var thisCodeVal = node.data.getFieldValue(this.levelField);
						var childRecords = [];
						for(var i=0;i< this.grid.datasource.size();i++){
							var r = this.grid.datasource.getRecord(i);
							var childCodeVal = r.getFieldValue(this.levelField);
							if(childCodeVal!=null && childCodeVal.length == childCodeLength && childCodeVal.substring(0,thisCodeLength) == thisCodeVal ){
								childRecords[childRecords.length] = r;
							}
						}
						callback.apply(node,[childRecords]);
					}
				}else if(this.loadMode == 'remote'){
					if(this.levelType == 'parent'){
						var thisPKVal = node.data.primaryFieldValue;
						//根据上下级关系 通知数据源查询 满足添加的下级节点数据
						this.grid.datasource.load({
							filters:[{
								property:this.levelField+".id",value:thisPKVal
							}]
						},function(params,result){
							var childRecords = [];
							for(var i=0;i<result.rows.length;i++){
								var rowData = result.rows[i];
								var r = this.getRecordById(rowData._record_id);
								childRecords[childRecords.length] = r;
							}
							callback.apply(node,[childRecords]);
						},true,true);
					}else if(this.levelType == 'section'){
						//根据编号分级 通知数据源查询 满足添加的下级节点数据
						//根据编号分级 查找当前数据源中 满足添加的下级节点数据
						var levelPartArray = this.levelSectionFormat.split('-');
						var childCodeLength = 0;
						for(var i=0;i<= node.level +1;i++){
//							childCodeLength += parseInt(levelPartArray[i]);
							
							if(i> levelPartArray.length-1 ){
								childCodeLength += parseInt(levelPartArray[levelPartArray.length-1]);
							}else{
								childCodeLength += parseInt(levelPartArray[i]);
							}
						}
						
						var thisCodeVal = node.data.getFieldValue(this.levelField);
						this.grid.datasource.load({
							filters:[{
								operator:"sql",sql:"(length("+this.levelField+") = "+childCodeLength+" and "+this.levelField+" like "+thisCodeVal+"%')"
							}]
						},function(params,result){
							var childRecords = [];
							for(var i=0;i<result.rows.length;i++){
								var rowData = result.rows[i];
								var r = this.getRecordById(rowData._record_id);
								childRecords[childRecords.length] = r;
							}
							callback.apply(node,[childRecords]);
						},true,true);
					
					}
				}
			}
		});
		return treeInstance;
	}
};


LUI.Grid.TreeGrid.Tree.Node = {
	createNew:function(config){
		var nodeInstance = $.extend(LUI.Tree.Node.createNew(config),{
			render:function(){
				this.nodeSwitchType = this._getNodeSwitchType();
				//生成新节点的时候 要将上一兄弟节点设为middle
				this._createNodeEl();
				this.rendered = true;
				//事件
				this.tree._onNodeRender(this);
			},
			_createNodeEl:function(){
				if(this.level == 0 && this.tree.getRootNode().id == this.id){
					//树中的第一个根节点
					if(this.tree.grid.headerLines>0){
						this.el = $(this.tree.grid.gridLineContent).insertAfter($(this.tree.grid.renderto+' li').eq(this.tree.grid.headerLines -1));
					}else{
						this.el = $(this.tree.grid.gridLineContent).appendTo($(this.tree.grid.renderto));
					}
				}else if(this.previousNode!=null){
					//有前置节点的 生成到前一节点后面
					this.el = $(this.tree.grid.gridLineContent).insertAfter(this.previousNode.el.closest('li'));
				}else{
					//生成到父节点的后面
					this.el = $(this.tree.grid.gridLineContent).insertAfter(this.parent.el.closest('li'));
				}
				
				this.el.attr('_record_id',this.data.id);
				this.el.attr('_node_id',this.id);
				
				var rowData = this.data.getData();
				//编译动态内容
				this.nodeEl = null;
				for(var j=0;j<this.tree.grid.columns.length;j++){
					//单元格内容
					var cellEl = this.el.children(this.tree.grid.columns[j].renderto);
					cellEl.attr('_col_index',j);
					cellEl.attr('_col_name',this.tree.grid.columns[j].name);
					if(this.tree.grid.columns[j].name.indexOf('@index') >=0){
						cellEl.html(data.start + i +1);
					}else{
						var _compiledValue = this.tree.grid._compiledCellTemplates[j](rowData);
						if(_compiledValue!=null && _compiledValue.length > 0){
							//如果使用千分符
							if(this.tree.grid.columns[j].showThousand == 'true'){
								_compiledValue = LUI.Util.thousandth(_compiledValue);
							}
							cellEl.html(_compiledValue);
						}else{
							cellEl.html('&nbsp;');
						}
					}
					
					//单元格提示信息
					if(this.tree.grid.columns[j].showTips == 'true'){
						cellEl.attr('title',this.tree.grid._compiledTipTemplates[j](rowData));
					}else{
						cellEl.attr('title','');
					}
					//是否树形结构字段
					if(this.tree.levelField == this.tree.grid.columns[j].name){
						this.nodeEl = cellEl;
					}
				}
				//为树状结构的节点 创建html
				if(this.nodeEl==null){
					LUI.Message.info("错误","表格中未找到与树型结构关联的字段："+this.tree.levelField+"!");
				}else{
					this.nodeEl
						.html(
							'<span id="switch" class="nim-tree-node-switch nim-tree-node-switch-'+this.nodeSwitchType+'-collapse" style="margin-left:'+(18*this.level)+'px;clear: both;"></span>'+
							'<a class="nim-tree-node-label" onclick="">'+
								'<span id="icon" class="nim-tree-node-icon nim-tree-node-icon-close"></span>'+
								'<span id="text" class="nim-tree-node-text">'+this.nodeEl.html()+'</span>'+
							'</a>'
						);
//					= $().insertAfter(this.nodeEl);
					var _thisNode = this;
					//点击 展开 关闭
					this.nodeEl.children('span').bind('click',function(){
						//切换显示
						if(_thisNode.expanded){
							_thisNode.collapse();
						}else{
							_thisNode.expand();
						}
					});
					//选中
					var _this = this;
					this.nodeEl.children('a').click(function(event){
						_thisNode.tree._onNodeClick(_thisNode);
						//切换显示
						if(event.ctrlKey && _this.tree.multiSelect){
							_thisNode.select(false,true);
						}else{
							_thisNode.select(false,false);
						}
					});
				}
				this.el = this.nodeEl;
			},
			appendChildNode:function(record){
				var lastChildNode = this.getLastChild();
				var node = LUI.Grid.TreeGrid.Tree.Node.createNew({
					tree:this.tree,
					parent:this,
					previousNode:lastChildNode,//前一节点
					nextNode:null,//下一节点
					isLeaf:false,
					data:record,
					level:this.level+1
				});
				//
				this.children.put(node);
				//在html中显示节点
//				node.render();
				//最后一个子节点不再是最后
				if(lastChildNode!=null){
					lastChildNode.nextNode = node;
					lastChildNode.nodeSwitchType = lastChildNode._getNodeSwitchType();
					if(lastChildNode.rendered){
						lastChildNode._refreshSwitchClass();
					}
				}
				//
				this.tree._onNodeAppend(node);
				return node;
			},
			expand:function(deep){
				if(!this.expanding){
					if(this.initialed){
						//
						this.expanded = true;
						//显示展开图标
						this._refreshSwitchClass();
						//显示子节点
						if(this.children.size()>0){
							for(var i=0;i<this.children.size();i++){
								var childNode = this.children.get(i);
								if(!childNode.rendered){
									childNode.render();
								}else{
									childNode.el.closest('li').css("display","block");
								}
								if(deep && childNode.initialed){
									//要求级联展开 且子节点已初始化
									childNode.expand(true);
								}
							}
						}
						this.tree._onNodeExpand(this);
					}else{
						var _this = this;
						this.expanding = true;
						//显示loading图标
						this._refreshSwitchClass();
						//查询子节点
						this.tree._requestChild(this,function(records){
							//显示展开图标
							_this.expanding = false;
							_this.expanded = true;
							_this.initialed = true;
							//显示子节点container
							if(records!=null && records.length>0){
								_this.isLeaf = false;
								//显示子节点容器
//								_this.el.children('ul').css("display","block");
								//添加子节点
								for(var i=0;i<records.length;i++){
									var childNode = _this.appendChildNode(records[i]);
									childNode.render();
									if(deep && childNode.initialed){
										childNode.expand(true);
									}
								}
							}else{
								_this.isLeaf = true;
								//取消点击 展开 关闭
								this.nodeEl.children('span').unbind('click');
							}
							//
							_this._refreshSwitchClass();
							_this.tree._onNodeExpand(_this);
						});
					}
				}
			},
			collapse:function(){
				if(!this.expanding){
					this.expanded = false;
					//显示收起图标
					this._refreshSwitchClass();
					//隐藏子节点
					for(var i=0;i<this.children.size();i++){
						var childNode = this.children.get(i);
						childNode.el.closest('li').css("display","none");
					}
					//事件
					this.tree._onNodeCollapse(this);
				}
			}
		});
		return nodeInstance;
	}
};