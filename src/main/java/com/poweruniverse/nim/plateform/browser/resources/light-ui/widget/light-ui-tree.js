//alert("LUI.Tree");

/**
 * 树的祖先类
 */
 
 LUI.Tree = {
	uniqueId:0,
	instances:LUI.Set.createNew(),
	createNew:function(config){
		//检查参数
		if(config.name==null){
			LUI.Message.info("错误","必须为树提供name参数!");
			return null;
		}
		
		var fConfig = $.extend({
			border:"true"
		},config);
		
		fConfig.multiSelect = false;
		if(config.multiSelect!=null && (config.multiSelect==true || config.multiSelect == "true")){
			fConfig.multiSelect = true;
		}
		
		fConfig.checkable = false;
		if(config.checkable!=null && (config.checkable==true || config.checkable == "true")){
			fConfig.checkable = true;
			fConfig.multiSelect = true;//允许check的 一定是multiSelect
		}
		
		var treeInstance = $.extend(LUI.Widget.createNew(),{
			id:'_tree_'+ (++LUI.Tree.uniqueId),
			initOption:config,
			rendered:false,
			rootNodes:LUI.Set.createNew(),//全部根节点
			selectedNodes:LUI.Set.createNew(),//选中的节点
			checkedNodes:LUI.Set.createNew(),//复选框选中的节点
			leafExpression:null,
			events:{
				treeRender:'tree_render',
				nodeRender:'node_render',
				nodeAppend:'node_append',
				nodeRemove:'node_remove',
				nodeClick:'node_click',
				nodeSelect:'node_select',
				nodeUnselect:'node_unselect',
				nodeCheck:'node_check',
				nodeUncheck:'node_uncheck',
				nodeExpand:'node_uncheck',
				nodeCollapse:'node_uncheck'
			},
			//为树添加根节点
			appendRootNode:function(isLeaf,data){
				var lastChildNode = this.getLastRootNode();;
				
				var node = LUI.Tree.Node.createNew({
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
			removeRootNode:function(node){
				//级联取消当前节点及下级节点的选中状态
				node.uncheck(true);
				node.unselect(true);
				//从html中删除节点显示
				node.deRender();
				//
				this.rootNodes.remove(node);
				//
				if(node.previousNode!=null){
					node.previousNode.nextNode = node.nextNode;
					node.previousNode.nodeSwitchType = node.previousNode._getNodeSwitchType();
					if(node.previousNode.rendered){
						node.previousNode._refreshSwitchClass();
					}
				}
				if(node.nextNode!=null){
					node.nextNode.previousNode = node.previousNode;
					node.nextNode.nodeSwitchType = node.nextNode._getNodeSwitchType();
					if(node.nextNode.rendered){
						node.nextNode._refreshSwitchClass();
					}
				}
				//
				this._onNodeRemove(node);
			},
			getRootNodes:function(){
				return this.rootNodes.all;
			},
			getRootNode:function(){
				var node = null;
				if(this.rootNodes.size()>0){
					node =  this.rootNodes.get(0);
				}
				return node;
			},
			getLastRootNode:function(){
				var node = null;
				if(this.rootNodes.size()>0){
					node =  this.rootNodes.get(this.rootNodes.size()-1);
				}
				return node;
			},
			getSelectNode:function(){
				var node=null;
				if(this.selectedNodes.size()>0){
					node = this.selectedNodes.get(0);
				}
				return node;
			},
			getSelectNodes:function(){
				return this.selectedNodes;
			},
			checkAllNode:function(){
				for(var i =0;i<this.rootNodes.size();i++){
					this.rootNodes.get(i).check(true,true);
				}
			},
			uncheckAllNode:function(){
				for(var i =0;i<this.checkedNodes.size();i++){
					this.checkedNodes.get(i).uncheck(false);
				}
			},
			selectAllNode:function(){
				if(this.multiSelect){
					for(var i =0;i<this.rootNodes.size();i++){
						this.rootNodes.get(i).select(true,true);
					}
				}else if(this.getRootNode()!=null){
					this.getRootNode().select(false,false);
				}
				
			},
			unselectAllNode:function(){
				for(var i =0;i<this.selectedNodes.size();i++){
					this.selectedNodes.get(i).unselect(false);
				}
			},
			_onTreeRender:function(){
				this.fireEvent(this.events.treeRender,{
					tree:this
				});
			},
			_onNodeRender:function(node){
				this.fireEvent(this.events.nodeRender,{
					tree:this,
					node:node
				});
			},
			_onNodeSelect:function(node){
				this.selectedNodes.put(node);
				this.fireEvent(this.events.nodeSelect,{
					tree:this,
					node:node
				});
			},
			_onNodeUnselect:function(node){
				this.selectedNodes.remove(node);
				this.fireEvent(this.events.nodeUnselect,{
					tree:this,
					node:node
				});
			},
			_onNodeCheck:function(node){
				this.checkedNodes.put(node);
				this.fireEvent(this.events.nodeCheck,{
					tree:this,
					node:node
				});
			},
			_onNodeUncheck:function(node){
				this.checkedNodes.remove(node);
				this.fireEvent(this.events.nodeUncheck,{
					tree:this,
					node:node
				});
			},
			_onNodeAppend:function(node){
				this.fireEvent(this.events.nodeAppend,{
					tree:this,
					node:node
				});
			},
			_onNodeRemove:function(node){
				this.fireEvent(this.events.nodeRemove,{
					tree:this,
					node:node
				});
			},
			_onNodeClick:function(node){
				this.fireEvent(this.events.nodeClick,{
					tree:this,
					node:node
				});
			},
			_onNodeExpand:function(node){
				this.fireEvent(this.events.nodeExpand,{
					tree:this,
					node:node
				});
			},
			_onNodeCollapse:function(node){
				this.fireEvent(this.events.nodeCollapse,{
					tree:this,
					node:node
				});
			},
			//查询此节点的下级节点数据
			_requestChild:function(node,callback){
				alert('Lui.Tree的后代实现类必须覆盖此方法:_requestChild！');
			},
			/*
			 * 从数据源中 取得数据 创建根节点
			 */
			load:function(){
				alert('Lui.Tree的后代实现类必须覆盖此方法:load！');
			},
			/**
			 */ 
			render:function(targetEl){
				if(targetEl==null && this.renderto==null){
					LUI.Message.info("错误","必须为树提供renderto参数!");
					return null;
				}else if(targetEl!=null){
					this.renderto = targetEl;
				}

				if(typeof(this.renderto) == 'string'){
					this.renderto = $(this.renderto);
				}
				//创建/显示tree
				if(!this.rendered){
					var _template = Handlebars.compile(LUI.Tree.Template.tree);
					var elContent = _template(this);
					//根据构建类型 确定如何render
					if(this.renderType == 'insert' ){
						//创建新的form 放置到原有元素内部 
						this.el = $(elContent);
						this.el.appendTo(this.renderto);
					}else if(this.renderType == 'replace'){
						//替换原有el
						this.oldEl = this.renderto;
						//在原有el元素后 插入新的 form元素
						this.el = $(elContent);
						this.oldEl.after(this.el);
						//删除原有form元素
						this.oldEl.remove();
					}
					
					for(var i=0;i<this.rootNodes.size();i++){
						var node = this.rootNodes.get(i);
						if(!node.rendered){
							node.render();
						}
					}
					//创建树完成
					this.rendered = true;
					//
					this._onTreeRender();
				}
			},
			deRender:function(){
				if(this.rendered){
					this.el.remove();
					this.rendered = false;
				}
			},
			//彻底销毁tree
			destroy:function(){
				this.removeAllListener();
				this.deRender();
				LUI.Tree.instances.remove(this);
			}
		},fConfig);
		//登记此tree
		if(LUI.Tree.hasInstance(treeInstance.name)){
			LUI.Message.warn('警告','同名控件(LUI.Tree:'+treeInstance.name+')已存在！');
		}
		LUI.Tree.instances.put(treeInstance);
		//事件监听
		if(treeInstance.listenerDefs!=null){
			if(treeInstance.listenerDefs.onTreeRender!=null){
				var onLoadFunc = window[treeInstance.listenerDefs.onTreeRender];
				if(onLoadFunc==null){
					LUI.Message.warn('警告','树'+fConfig.label+'onTreeRender事件的处理函数('+treeInstance.listenerDefs.onTreeRender+')不存在！');
				}else{
					treeInstance.addListener(treeInstance.events.treeRender,null,onLoadFunc);
				}
			}
			
			if(treeInstance.listenerDefs.onNodeSelect!=null){
				var onLoadFunc = window[treeInstance.listenerDefs.onNodeSelect];
				if(onLoadFunc==null){
					LUI.Message.warn('警告','树'+fConfig.label+'nodeSelect事件的处理函数('+treeInstance.listenerDefs.onNodeSelect+')不存在！');
				}else{
					treeInstance.addListener(treeInstance.events.nodeSelect,null,onLoadFunc);
				}
			}
			
			if(treeInstance.listenerDefs.onNodeClick!=null){
				var onLoadFunc = window[treeInstance.listenerDefs.onNodeClick];
				if(onLoadFunc==null){
					LUI.Message.warn('警告','树'+fConfig.label+'nodeClick事件的处理函数('+treeInstance.listenerDefs.onNodeClick+')不存在！');
				}else{
					treeInstance.addListener(treeInstance.events.nodeClick,null,onLoadFunc);
				}
			}
		}
		
		return treeInstance;
	},
	hasInstance:function(treeName){
		for(var i =0;i<LUI.Tree.instances.size();i++){
			var _instance = LUI.Tree.instances.get(i);
			if(_instance.name == treeName){
				return true;
			}
		}
		return false;
	},
	getInstance:function(treeName){
		for(var i =0;i<LUI.Tree.instances.size();i++){
			var _instance = LUI.Tree.instances.get(i);
			if(_instance.name == treeName){
				return _instance;
			}
		}
		return null;
	},
	removeInstance:function(treeName){
		for(var i =0;i<LUI.Tree.instances.size();i++){
			var _instance = LUI.Tree.instances.get(i);
			if(_instance.name == treeName){
				LUI.Tree.instances.remove(_instance);
				break;
			}
		}
	}
};

//从数据源得到数据的树型控件
LUI.Tree.DatasourceTree = {
	createNew:function(config){
		var autoLoad = true;
		if(config.autoLoad!=null && (config.autoLoad==false || config.autoLoad == "false")){
			autoLoad = false;
		}

		var autoRender = true;
		if(config.autoRender!=null && (config.autoRender==false || config.autoRender == "false")){
			autoRender = false;
		}
		
		//检查参数
		var datasource = null;
		if(config.datasourceType!=null && config.datasourceType!='none'){
			if(config.datasourceName==null){
				LUI.Message.info("错误","必须为树"+name+"提供datasourceName参数!");
				return null;
			}
			datasource = LUI.Datasource.getInstance(config.datasourceName);
			if(datasource == null){
				LUI.Message.info("错误","未找到树"+name+"的数据源"+config.datasourceName+"!");
				return null;
			}
		}
		
		var treeInstance = $.extend(LUI.Tree.createNew(config),{
			datasource:datasource,
			autoLoad:autoLoad,
			autoRender:autoRender,
			//为树添加根节点
			appendRootNode:function(isLeaf,record){
				var lastChildNode = null;
				if(this.rootNodes.size()>0){
					lastChildNode =  this.rootNodes.get(this.rootNodes.size()-1);
				}
				
				var node = LUI.Tree.DatasourceNode.createNew({
					tree:this,
					parent:this,
					previousNode:lastChildNode,//前一节点
					nextNode:null,//下一节点
					isLeaf:isLeaf,
					data:record,
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
			//查询此节点的下级节点数据
			_requestChild:function(node,callback){
				if(this.loadMode == 'local'){
					if(this.levelType == 'parent'){
						//根据上下级关系 查找当前数据源中 满足添加的下级节点数据
						var thisPKVal = node.data.primaryFieldValue;
						var childRecords = [];
						for(var i=0;i< this.datasource.size();i++){
							var r = this.datasource.getRecord(i);
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
							if(i> levelPartArray.length-1 ){
								childCodeLength += parseInt(levelPartArray[levelPartArray.length-1]);
							}else{
								childCodeLength += parseInt(levelPartArray[i]);
							}
						}
						
						var thisCodeVal = node.data.getFieldValue(this.levelField);
						var childRecords = [];
						for(var i=0;i< this.datasource.size();i++){
							var r = this.datasource.getRecord(i);
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
						this.datasource.load({
							filters:[{
								property:this.levelField+".id",value:thisPKVal
							}]
						},function(params,result){
							var childRecords = [];
							for(var i=0;i<result.rows.length;i++){
								var rowData = result.rows[i];
								var rowPkValue = rowData[this.primaryFieldName];
								var r = this.getRecordByPKValue(rowPkValue);
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
							childCodeLength += parseInt(levelPartArray[i]);
							if(i> levelPartArray.length-1 ){
								childCodeLength += parseInt(levelPartArray[levelPartArray.length-1]);
							}else{
								childCodeLength += parseInt(levelPartArray[i]);
							}
						}
						
						var thisCodeVal = node.data.getFieldValue(this.levelField);
						this.datasource.load({
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
			},
			/*
			 * 从数据源中 取得数据 创建根节点
			 */
			load:function(){
				if(this.datasource!=null ){
					//根据分级类型 取得根节点数据
					for(var i=0;i<this.datasource.size();i++){
						var record = this.datasource.getRecord(i);
						var codeVal = record.getFieldValue(this.levelField);
						
						var isLeaf = false;
						//根据条件判断
						if(this.leafExpression!=null && this.leafExpression.length > 0){
							//Handlebars表达式先执行
							var _expression_template = Handlebars.compile(this.leafExpression);
							var _expression_value = _expression_template(record.data);
							//再执行javascript表达式的计算
							if(_expression_value != null && _expression_value.replace(/(^\s*)|(\s*$)/g, "") == 'true'){
								isLeaf = true;
							}
						}
						if(this.levelType == 'parent'){
							if(codeVal == null){
								this.appendRootNode(isLeaf,record);
							}
						}else if(this.levelType == 'section'){
							//根据编号分级 将当前数据源中 满足条件的数据 添加为根节点
							var levelPartArray = this.levelSectionFormat.split('-');
							var thisCodeLength = parseInt(levelPartArray[0]);
							if(codeVal!=null && codeVal.length == thisCodeLength){
								this.appendRootNode(isLeaf,record);
							}
						}
					}
					
					if(this.autoRender == true){
						this.render();
					}
				}
			}
		});
		//
		if(treeInstance.autoLoad == true && treeInstance.datasource!=null){
			//监听数据源的load事件 
			treeInstance.datasource.addListener(treeInstance.datasource.events.load,treeInstance,function(source,target,event){
				target.load();
			});
		}
		return treeInstance;
	}
};


/**
 * 根据json :[{
 * 		text:'',
 * 		...,
 * 		children:[{
 * 			text:'',
 * 			...
 * 		},{
 * 			text:'',
 * 			...
 * 		}]
 * }]
 * @type 
 */
LUI.Tree.JSONTree = {
	createNew:function(config){
		var autoRender = true;
		if(config.autoRender!=null && (config.autoRender==false || config.autoRender == "false")){
			autoRender = false;
		}
		
		if(config.requestChildrenData == null){
			config.requestChildrenData = function(node){
				//实例化时提供此方法 在expand的时候通过子节点信息
				return [];
			}
		}
		
		var treeInstance = $.extend(LUI.Tree.createNew(config),{
			autoRender:autoRender,
			load:function(jsonData){
				//根据分级类型 取得根节点数据
				for(var i=0;i<jsonData.length;i++){
					this.appendRootNode(jsonData[i]);
				}
				if(this.autoRender == true){
					this.render();
				}
			},
			appendRootNode:function(data){
				var lastChildNode = null;
				if(this.rootNodes.size()>0){
					lastChildNode =  this.rootNodes.get(this.rootNodes.size()-1);
				}
				
				var isLeaf = true;
				var children = data.children;
				if(children!=null){
					if(children.length>0){
						//有children且数量大于零 非叶子节点
						isLeaf = false;
					}
					delete data.children;
				}
				var node = LUI.Tree.JSONNode.createNew({
					tree:this,
					parent:this,
					previousNode:lastChildNode,//前一节点
					nextNode:null,//下一节点
					isLeaf:isLeaf,
					data:data,
					level:0,
					initialed:children!=null
				});
				this.rootNodes.put(node);
				//在html中显示节点
				if(lastChildNode!=null){
					lastChildNode.nextNode = node;
					lastChildNode.nodeSwitchType = lastChildNode._getNodeSwitchType();
				}
				if(this.rendered){
					//最后一个子节点不再是最后
					if(lastChildNode!=null && lastChildNode.rendered){
						lastChildNode._refreshSwitchClass();
					}
				}
				
				this._onNodeAppend(node);
				//非叶子节点 创建下级节点
				if(!isLeaf){
					for(var i=0;i<children.length;i++){
						var isChildLeaf = false;
						//根据条件判断
						if(this.leafExpression!=null && this.leafExpression.length > 0){
							//Handlebars表达式先执行
							var _expression_template = Handlebars.compile(this.leafExpression);
							var _expression_value = _expression_template(children[i]);
							if(_expression_value != null && _expression_value.replace(/(^\s*)|(\s*$)/g, "") == 'true'){
								isChildLeaf = true;
							}
						}
						node.appendChildNode(isChildLeaf,children[i]);
					}
				}
				//
				return node;
			},
			_requestChild:function(node,callback){
				callback.apply(node,[this.requestChildrenData(node)]);
			}
		});
		//
		return treeInstance;
	}

};


 
 
LUI.Tree.Node = {
	uniqueId:0,
	instances:LUI.Set.createNew(),
	createNew:function(config){
		var nodeInstance = $.extend(LUI.Widget.createNew(),{
			id:'_tree_node_'+ (++LUI.Tree.Node.uniqueId),
			initOption:config,
			tree:null,//所属树
			parent:null,//父节点 可能是节点或者是树本身
			previousNode:null,//前一节点
			nextNode:null,//下一节点
			children:LUI.Set.createNew(),//子节点
			initialed:false,//是否加载完成
			expanding:false,//是否正在加载
			expanded:false,//是否展开状态
			isLeaf:false,//是否叶子节点
			selected:false,//节点是否选中
			checked:false,//复选框是否选中
			data:null,//关联数据/记录
			el:null,//node关联的html元素
			_template:null,//编译后的节点模板
			renderer:null,//参数中指定的节点内容生成函数
			level:-1,//当前节点层次
			render:function(){
				alert('Lui.Tree.Node的后代实现类必须覆盖此方法:render！');
			},
			_refreshSwitchClass:function(){
				//显示展开、收起
				this.el.children('span').removeClass()
					.addClass("nim-tree-node-switch")
					.addClass("nim-tree-node-switch-"+this.nodeSwitchType+(this.isLeaf?'':(this.expanded?'-expand':'-collapse')));
				//显示打开、关闭、loading、叶子等图标
				this.el.children('a').children('span#icon').removeClass().addClass("nim-tree-node-icon");
				var keyIconName = "";
				if(this.expanding){
					keyIconName= 'loading';
				}else if(this.isLeaf){
					keyIconName= 'leaf';
				}else if(this.expanded){
					keyIconName= 'open';
				}else{
					keyIconName= 'close';
				}
				this.el.children('a').children('span#icon').addClass("nim-tree-node-icon-"+keyIconName);
				//是否有连接线
				if(this.nodeSwitchType == 'bottom' || this.nodeSwitchType == 'single'){
					this.el.children('ul').removeClass("nim-tree-line");
				}else if(!this.el.children('ul').hasClass("nim-tree-line")){
					this.el.children('ul').addClass("nim-tree-line");
				}
			},
			_getNodeSwitchType:function(){
				var nodeSwitchType = 'single';
				if(this.tree.showLine == "true"){
					if(this.level == 0 && this.previousNode == null && this.nextNode == null){
						//是否唯一的根节点
						nodeSwitchType = "single";
					}else if(this.level == 0 && this.previousNode == null){
						//第一个根节点
						nodeSwitchType = "top";
					}else if( this.nextNode == null){
						//最后一个节点
						nodeSwitchType = "bottom";
					}else{
						//中间节点
						nodeSwitchType = "middle";
					}
				}
				return nodeSwitchType;
			},
			_createNodeEl:function(){
				var elContent = null;
				if(this._template==null){
					this._template = Handlebars.compile(LUI.Tree.Template.node);
					elContent = this._template(this);
				}
				this.el = $(elContent).appendTo(this.parent.el.children('ul'));
				var _thisNode = this;
				//点击 展开 关闭
				this.el.children('span').bind('click',function(){
					//切换显示
					if(_thisNode.expanded){
						_thisNode.collapse();
					}else{
						_thisNode.expand();
					}
				});
				//选中
				var _this = this;
				this.el.children('a').click(function(event){
					_thisNode.tree._onNodeClick(_thisNode);
					//切换显示
					if(event.ctrlKey && _this.tree.multiSelect){
						_thisNode.select(false,true);
					}else{
						_thisNode.select(false,false);
					}
				});
			},
			getData:function(){
				return this.data;
			},
			getParent:function(){
				return this.parent;
			},
			getPreviousNode:function(){
				return this.previousNode;
			},
			getNextNode:function(){
				return this.nextNode;
			},
			getChildren:function(){
				return this.children.all;
			},
			getFirstChild:function(){
				if(this.children.size()>0){
					return this.children.get(0);
				}
				return null;
			},
			getLastChild:function(){
				if(this.children.size()>0){
					return this.children.get(this.children.size()-1);
				}
				return null;
			},
			appendChildNode:function(isLeaf,data){
				alert('Lui.Tree.Node的后代实现类必须覆盖此方法:appendChildNode！');
			},
			removeChildNode:function(node){
				//级联取消当前节点及下级节点的选中状态
				node.uncheck(true);
				node.unselect(true);
				//从html中删除节点显示
				node.deRender();
				//
				this.children.remove(node);
				//
				if(node.previousNode!=null){
					node.previousNode.nextNode = node.nextNode;
					node.previousNode.nodeSwitchType = node.previousNode._getNodeSwitchType();
					if(node.previousNode.rendered){
						node.previousNode._refreshSwitchClass();
					}
				}
				if(node.nextNode!=null){
					node.nextNode.previousNode = node.previousNode;
					node.nextNode.nodeSwitchType = node.nextNode._getNodeSwitchType();
					if(node.nextNode.rendered){
						node.nextNode._refreshSwitchClass();
					}
				}
				//
				this.tree._onNodeRemove(node);
			},
			select:function(deep,keepSelection){
				
				//改变class 显示选中效果
				if(this.selected == false){
					this.selected = true;
					this.el.children('a').addClass('nim-tree-node-selected');
					
					//通知tree
					if(!keepSelection || !this.tree.multiSelect){
						this.tree.unselectAllNode();
					}
					this.tree._onNodeSelect(this);
					if(this.tree.multiSelect && deep){
						for(var i =0;i<this.children.size();i++){
							var _childNode = this.children.get(i);
							_childNode.select(true,true);//级联选择的话 必须keepSelection
						}
					}
				}
			},
			unselect:function(deep){
				if(this.selected == true){
					this.selected = false;
					//改变class 显示选中效果
					this.el.children('a').removeClass('nim-tree-node-selected');
					//通知tree
					this.tree._onNodeUnselect(this);
					if(deep){
						for(var i =0;i<this.children.size();i++){
							var _childNode = this.children.get(i);
							_childNode.unselect(true);//级联取消
						}
					}
				}
			},
			check:function(deep,keepCheck){
				this.checked = true;
				//改变class 显示选中效果
				this.el.children('a').addClass('nim-tree-node-checked');
				//通知tree
				if(!keepCheck){
					this.tree.uncheckAllNode();
				}
				this.tree._onNodeCheck(this);
				if(deep){
					for(var i =0;i<this.children.size();i++){
						var _childNode = this.children.get(i);
						_childNode.check(true,true);//级联选择的话 必须keepCheck
					}
				}
			},
			uncheck:function(deep){
				this.checked = false;
				//改变class 显示选中效果
				this.el.children('a').removeClass('nim-tree-node-checked');
				//通知tree
				this.tree._onNodeUncheck(this);
				if(deep){
					for(var i =0;i<this.children.size();i++){
						var _childNode = this.children.get(i);
						_childNode.uncheck(true);//级联取消
					}
				}
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
							this.el.children('ul').css("display","block");
							for(var i=0;i<this.children.size();i++){
								var node = this.children.get(i);
								if(!node.rendered){
									node.render();
								}
								if(deep && node.initialed){
									//要求级联展开 且子节点已初始化
									node.expand(true);
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
								_this.el.children('ul').css("display","block");
								//添加子节点
								for(var i=0;i<records.length;i++){
									var isChildLeaf = false;
									//根据条件判断
									if(_this.tree.leafExpression!=null && _this.tree.leafExpression.length > 0){
										//Handlebars表达式先执行
										var _expression_template = Handlebars.compile(_this.tree.leafExpression);
										var _expression_value = _expression_template(records[i].data);
										if(_expression_value != null && _expression_value.replace(/(^\s*)|(\s*$)/g, "") == 'true'){
											isChildLeaf = true;
										}
									}
									var node = _this.appendChildNode(isChildLeaf,records[i]);
									node.render();
									if(deep && node.initialed){
										node.expand(true);
									}
								}
							}else{
								_this.isLeaf = true;
								//点击 展开 关闭
								this.el.children('span').unbind('click');
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
					this.el.children('ul').css("display","none");
					//事件
					this.tree._onNodeCollapse(this);
				}
			}
		},config);
		//登记此grid
		LUI.Tree.Node.instances.put(nodeInstance);
		return nodeInstance;
	},
	getInstance:function(nodeId){
		for(var i =0;i<LUI.Tree.Node.instances.size();i++){
			var _instance = LUI.Tree.Node.instances.get(i);
			if(_instance.id == nodeId){
				return _instance;
			}
		}
		return null;
	},
	removeInstance:function(treeName){
		for(var i =0;i<LUI.Tree.Node.instances.size();i++){
			var _instance = LUI.Tree.Node.instances.get(i);
			if(_instance.id == nodeId){
				LUI.Tree.Node.instances.remove(_instance);
				break;
			}
		}
	}
};

LUI.Tree.JSONNode = {
	createNew:function(config){
		var nodeInstance = $.extend(LUI.Tree.Node.createNew(config),{
			appendChildNode:function(isLeaf,data){
				var hasChildren = false;
				var children = data.children;
				if(children!=null){
					hasChildren = true;
					delete data.children;
				}
				
				var lastChildNode = this.getLastChild();
				var node = LUI.Tree.JSONNode.createNew({
					tree:this.tree,
					parent:this,
					previousNode:lastChildNode,//前一节点
					nextNode:null,//下一节点
					isLeaf:isLeaf,
					data:data,
					level:this.level+1,
					initialed:hasChildren
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
				
				//非叶子节点 创建下级节点
				if(hasChildren){
					for(var i=0;i<children.length;i++){
						var isChildLeaf = false;
						//根据条件判断
						if(this.tree.leafExpression!=null && this.tree.leafExpression.length > 0){
							//Handlebars表达式先执行
							var _expression_template = Handlebars.compile(this.tree.leafExpression);
							var _expression_value = _expression_template(children[i]);
							if(_expression_value != null && _expression_value.replace(/(^\s*)|(\s*$)/g,"") == 'true'){
								isChildLeaf = true;
							}
						}
						node.appendChildNode(isChildLeaf,children[i]);
					}
				}
				
				return node;
			},
			render:function(){
				if(this.tree._template==null){
					this.tree._template = Handlebars.compile(this.tree.renderTemplate);
				}
				this.nodeText = this.tree._template(this.data);
				this.nodeSwitchType = this._getNodeSwitchType();
				//生成新节点的时候 要将上一兄弟节点设为middle
				this._createNodeEl();
				this.rendered = true;
				//事件
				this.tree._onNodeRender(this);
			}
		});
		return nodeInstance;
	}
}

LUI.Tree.DatasourceNode = {
	createNew:function(config){
		var nodeInstance = $.extend(LUI.Tree.Node.createNew(config),{
			appendChildNode:function(isLeaf,record){
				var lastChildNode = this.getLastChild();
				var node = LUI.Tree.DatasourceNode.createNew({
					tree:this.tree,
					parent:this,
					previousNode:lastChildNode,//前一节点
					nextNode:null,//下一节点
					isLeaf:isLeaf,
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
			render:function(){
				//节点的生成模板
				if(this.tree._template==null){
					this.tree._template = Handlebars.compile(this.tree.renderTemplate);
				}
				this.nodeText = this.tree._template(this.data.getData());
				this.nodeSwitchType = this._getNodeSwitchType();
				//生成新节点的时候 要将上一兄弟节点设为middle
				this._createNodeEl();
				this.rendered = true;
				//事件
				this.tree._onNodeRender(this);
			}
		});
		return nodeInstance;
	}
};

//节点选中效果
//.nim-tree-node-selected{}
//复选框选中效果
//.nim-tree-node-checked{}

LUI.Tree.Template = {
	tree:'<div style="height:{{height}}; width:{{width}};{{#equals border "false"}}border:0px;{{/equals}} " class="nim-tree-container" >' +
			'<ul id="tree_{{name}}_{{id}}" style="display:block" class="nim-tree" >' +
			'</ul>' +
		'</div>',
	node:'<li id="node" class="nim-tree-node">'+
			'<span id="switch" class="nim-tree-node-switch nim-tree-node-switch-{{nodeSwitchType}}{{#unless isLeaf}}-collapse{{/unless}}" title=""></span>'+
			'<a class="nim-tree-node-label" onclick="">'+
				'<span id="icon" class="nim-tree-node-icon {{#if isLeaf}}nim-tree-node-icon-leaf{{else}}nim-tree-node-icon-close{{/if}}"></span>'+
				'<span id="text" class="nim-tree-node-text">{{{nodeText}}}</span>'+
			'</a>'+
			'<ul id="children" class="nim-tree-children-container {{#notEqual nodeSwitchType "bottom"}}nim-tree-line{{/notEqual}} ">'+
			'</ul>'+
		'</li>'
}



