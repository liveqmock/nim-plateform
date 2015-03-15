//在选择器指定的元素内 生成包含两个panel的布局
//center: for Component Tree
//south: for Component Property
//alert("LUI.PageDesigner");

LUI.PageDesigner = {
	instance:null,
	getInstance:function(){
		if(LUI.PageDesigner.instance==null){
			var urlInfo = LUI.Util.parseURL(window.location);
			
//			var htmlPage = urlInfo.path.replace('module/','');
//			var ftlPage = htmlPage.substr(0,htmlPage.indexOf('.'))+'.ftl';
			
			var ftlPage = urlInfo.params._pt_;
			var htmlPage = ftlPage.substr(0,ftlPage.indexOf('.'))+'.html';
			
			var cssPage = htmlPage.substr(0,htmlPage.indexOf('.'))+'.css';
			var jsPage = htmlPage.substr(0,htmlPage.indexOf('.'))+'.js';
			var xmlPage = htmlPage.substr(0,htmlPage.indexOf('.'))+'.xml';
			LUI.PageDesigner.instance = {
				_types:{},
				_components:{},
				_xiTongs:[],
				_gongNengs:[],
				_shiTiLeis:[],
				_ziDuanLXs:[],
				_saveComponentBtn:null,
				_gnComponentBtn:null,
				_stlComponentBtn:null,
				_addComponentBtn:null,
				_addComponentMenu:null,
				_propertyToggleBtn:null,
				_removeComponentBtn:null,
				_pageCmpTree:null,
				_designerPanel:null,
				_tabs:null,
				_editingNode:null,
				_urlInfo:LUI.Util.parseURL(window.location),
				_pageInfo:{
					htmlPage:htmlPage,
					ftlPage:ftlPage,
					cssPage:cssPage,
					jsPage:jsPage,
					xmlPage:xmlPage
				},
				getComponent:function(code){
					return _components[code];
				},
				getComponentType:function(code){
					return _types[code];
				},
				openHtmlEditDialog:function(){
					$( "#_designer-edit-html-container" ).dialog({
						 height: 440,
						 width: 840,
						 modal: true,
						 autoOpen: true,
						 title:'编辑html文件',
						 open: function( event, ui ) {
							 //设置textarea宽度
							 $( "#_designer-edit-html-editor" ).css('padding','0px').css('width','100%');
							 // 创建CodeMirror编辑器
							 LUI.PageDesigner.instance.htmlCodeMirrorEdit.setSize('100%','100%');
						 },
						 resize: function( event, ui ) {
						 },
						 beforeClose : function(event, ui) {
						 },
						 buttons: {
							 "保存": function() {
								 LUI.Message.confirm('请确认','要保存html文件的内容吗？',function(result){
									 if(result){
										 var content = LUI.PageDesigner.instance.htmlCodeMirrorEdit.getValue();
										 content = content.replace(/\n/g,"\\n").replace(/\"/g,'\\"');
										 $.ajax({
												url: "/jservice/", 
												type: "POST", 
												data:{
													component:'nim-plateform',
													service:'designer',
													method:'saveFile',
													arguments:'{'+
														'pageUrl:"'+LUI.PageDesigner.instance._pageInfo.htmlPage+'",'+
														'content:"'+content+'"'+
													'}'
												},
												dataType:"json",
												success: function(result){
													if(result.success){
														$( "#_designer-edit-html-container" ).dialog( "close" );
													}else{
														LUI.Message.error("保存html文件","错误:"+result.errorMsg+"！");
													}
												},
												error:function(){
													LUI.Message.error("保存html文件","访问服务器失败！");
												}
											});
									 }
								 });
							 },
							 "关闭": function() {
								 $( "#_designer-edit-html-container" ).dialog( "close" );
							 }
						 }
					});
				},
				openCssEditDialog:function(){
					$( "#_designer-edit-css-container" ).dialog({
						 height: 440,
						 width: 840,
						 modal: true,
						 autoOpen: true,
						 title:'编辑js文件',
						 open: function( event, ui ) {
							 //设置textarea宽度
							 $( "#_designer-edit-css-editor" ).css('padding','0px').css('width','100%');
							 // 创建CodeMirror编辑器
							 LUI.PageDesigner.instance.cssCodeMirrorEdit.setSize('100%','100%');
						 },
						 resize: function( event, ui ) {
						 },
						 beforeClose : function(event, ui) {
						 },
						 buttons: {
							 "保存": function() {
								 LUI.Message.confirm('请确认','要保存css文件的内容吗？',function(result){
									 if(result){
										 var content = LUI.PageDesigner.instance.cssCodeMirrorEdit.getValue();
										 content = content.replace(/\n/g,"\\n").replace(/\"/g,'\\"');
										 $.ajax({
												url: "/jservice/", 
												type: "POST", 
												data:{
													component:'nim-plateform',
													service:'designer',
													method:'saveFile',
													arguments:'{'+
														'pageUrl:"'+LUI.PageDesigner.instance._pageInfo.cssPage+'",'+
														'content:"'+content+'"'+
													'}'
												},
												dataType:"json",
												success: function(result){
													if(result.success){
														$( "#_designer-edit-css-container" ).dialog( "close" );
													}else{
														LUI.Message.error("保存css文件","错误:"+result.errorMsg+"！");
													}
												},
												error:function(){
													LUI.Message.error("保存css文件","访问服务器失败！");
												}
											});
									 }
								 });
							 },
							 "关闭": function() {
								 $( "#_designer-edit-css-container" ).dialog( "close" );
							 }
						 }
					});
				},
				openJsEditDialog:function(){
					$( "#_designer-edit-js-container" ).dialog({
						 height: 440,
						 width: 840,
						 modal: true,
						 autoOpen: true,
						 title:'编辑js文件',
						 open: function( event, ui ) {
							 //设置textarea宽度
							 $( "#_designer-edit-js-editor" ).css('padding','0px').css('width','100%');
							 // 创建CodeMirror编辑器
							 LUI.PageDesigner.instance.jsCodeMirrorEdit.setSize('100%','100%')
						 },
						 resize: function( event, ui ) {
							 
						 },
						 beforeClose : function(event, ui) {
							// 关闭Dialog前移除编辑器
//							KindEditor.remove('textarea#_designer-edit-js-editor]');
						 },
						 buttons: {
							 "保存": function() {
								 LUI.Message.confirm('请确认','要保存js文件的内容吗？',function(result){
									 if(result){
										 var content = LUI.PageDesigner.instance.jsCodeMirrorEdit.getValue();
										 content = content.replace(/\n/g,"\\n").replace(/\"/g,'\\"');
										 $.ajax({
												url: "/jservice/", 
												type: "POST", 
												data:{
													component:'nim-plateform',
													service:'designer',
													method:'saveFile',
													arguments:'{'+
														'pageUrl:"'+LUI.PageDesigner.instance._pageInfo.jsPage+'",'+
														'content:"'+content+'"'+
													'}'
												},
												dataType:"json",
												success: function(result){
													if(result.success){
														$( "#_designer-edit-js-container" ).dialog( "close" );
													}else{
														LUI.Message.error("保存js文件","错误:"+result.errorMsg+"！");
													}
												},
												error:function(){
													LUI.Message.error("保存js文件","访问服务器失败！");
												}
											});
									 }
								 });
							 },
							 "关闭": function() {
								 $( "#_designer-edit-js-container" ).dialog( "close" );
							 }
						 }
					});
				},
				openXmlEditDialog:function(){
					$( "#_designer-edit-xml-container" ).dialog({
						 height: 440,
						 width: 840,
						 modal: true,
						 autoOpen: true,
						 title:'编辑XML文件',
						 open: function( event, ui ) {
							 //设置textarea宽度
							 $( "#_designer-edit-xml-editor" ).css('padding','0px').css('width','100%');
							 // 创建CodeMirror编辑器
							 LUI.PageDesigner.instance.xmlCodeMirrorEdit.setSize('100%','100%')
						 },
						 resize: function( event, ui ) {
						 },
						 beforeClose : function(event, ui) {
						 },
						 buttons: {
							 "保存": function() {
								 LUI.Message.confirm('请确认','要保存XML文件的内容吗？',function(result){
									 if(result){
										 var content = LUI.PageDesigner.instance.xmlCodeMirrorEdit.getValue();
										 content = content.replace(/\n/g,"\\n").replace(/\"/g,'\\"');
										 $.ajax({
												url: "/jservice/", 
												type: "POST", 
												data:{
													component:'nim-plateform',
													service:'designer',
													method:'saveFile',
													arguments:'{'+
														'pageUrl:"'+LUI.PageDesigner.instance._pageInfo.xmlPage+'",'+
														'content:"'+content+'"'+
													'}'
												},
												dataType:"json",
												success: function(result){
													if(result.success){
														$( "#_designer-edit-xml-container" ).dialog( "close" );
													}else{
														LUI.Message.error("保存XML文件","错误:"+result.errorMsg+"！");
													}
												},
												error:function(){
													LUI.Message.error("保存XML文件","访问服务器失败！");
												}
											});
									 }
								 });
							 },
							 "关闭": function() {
								 $( "#_designer-edit-xml-container" ).dialog( "close" );
							 }
						 }
					});
				},
				createDesigner:function(rootPanel,deignerId,xiTongDataArray,gongNengDataArray,shiTiLeiDataArray,ziDuanLXDataArray){
					this._designerPanel = $('#'+deignerId).html(LUI.PageDesigner._designerContent).layout( {
						north: {
							spacing_open:0,
							size:30
						},
						south: {
							initClosed:true,
							size:260
						},
						south__onresize:function (pane1, $pane, state1, options) {
							LUI.PageDesigner.instance._tabs.tabs( "option", "heightStyle", "fill" );
						}
					} );
					this._xiTongs = xiTongDataArray;
					this._gongNengs = gongNengDataArray;
					this._shiTiLeis = shiTiLeiDataArray;
					this._ziDuanLXs = ziDuanLXDataArray;
					//创建设计器按钮 及树的脚本结构 
					this._addComponentBtn = $('#_designer').find("#_designer-tools-add-node").button({
						disabled: true,
						icons: {
							secondary: "ui-icon-triangle-1-s"
						}
					});
					
					this._removeComponentBtn = $('#_designer').find( "#_designer-tools-remove-node" ).button({
						 text: false,
						 disabled: true,
						 icons: {
							 primary: "ui-icon-scissors"
						 }
					}).click(function(){
						//删除当前节点 并选中下一个兄弟节点
						var treeObj = LUI.PageDesigner.instance._pageCmpTree;
						var selectedNodes = treeObj.getSelectedNodes();
						if(selectedNodes.length==1){
							var selectedNode = selectedNodes[0];
							//
							var newSelectedNode = null;
							if(selectedNode.getNextNode()!=null){
								newSelectedNode = selectedNode.getNextNode();
								treeObj.selectNode(newSelectedNode,false);
							}else if(selectedNode.getPreNode()!=null){
								newSelectedNode = selectedNode.getPreNode();
								treeObj.selectNode(newSelectedNode,false);
							}else if(selectedNode.getParentNode()!=null){
								newSelectedNode = selectedNode.getParentNode();
								treeObj.selectNode(newSelectedNode,false);
							}
							   
							treeObj.removeNode(selectedNode,true);
							//删除了节点 允许保存
							LUI.PageDesigner.instance._saveComponentBtn.button( "enable");
							//重新选中了新的节点 需要更新显示内容(按钮是否可用 更新属性窗口内容)
							LUI.PageDesigner.instance.onComponentNodeSelected(newSelectedNode);
						}
					});
					
					//编辑html页面文件源代码
					$('#_designer').find( "#_designer-tools-edit-html-btn" ).button().click(function() {
						var edit_js_area = $( "#_designer-edit-html-container" );
						if(edit_js_area.length ==0){
							 $( "body" ).append('<div id="_designer-edit-html-container" > <textarea style="border:0px;margin:0px;width:100%;height:100%;" id="_designer-edit-html-editor"></textarea></div>');
							 LUI.PageDesigner.instance.htmlCodeMirrorEdit = CodeMirror.fromTextArea(document.getElementById("_designer-edit-html-editor"), {
							     lineNumbers: true,
							     matchBrackets: true,
							     continueComments: "Enter",
							     extraKeys: {"Ctrl-Q": "toggleComment"},
							     mode: "htmlmixed"
							 });
						}
						$.ajax({
							url: "/jservice/", 
							type: "POST", 
							data:{
								component:'nim-plateform',
								service:'designer',
								method:'readFile',
								arguments:'{'+
									'pageUrl:"'+LUI.PageDesigner.instance._pageInfo.htmlPage+'"'+
								'}'
							},
							dataType:"text",
							success: function(result){
								LUI.PageDesigner.instance.htmlCodeMirrorEdit.setValue(result);
								//$( "#_designer-edit-html-editor" ).text(result);
								LUI.PageDesigner.instance.openHtmlEditDialog();
							},
							error:function(){
								alert("读取html文件失败："+"访问服务器失败！");
							}
						});
						return false;
					});
					//编辑css文件源代码
					$('#_designer').find( "#_designer-tools-edit-css-btn" ).button().click(function() {
						var edit_js_area = $( "#_designer-edit-css-container" );
						if(edit_js_area.length ==0){
							 $( "body" ).append('<div id="_designer-edit-css-container" > <textarea style="border:0px;margin:0px;width:100%;height:100%;" id="_designer-edit-css-editor"></textarea></div>');
							 LUI.PageDesigner.instance.cssCodeMirrorEdit = CodeMirror.fromTextArea(document.getElementById("_designer-edit-css-editor"), {
							     lineNumbers: true,
							     matchBrackets: true,
							     continueComments: "Enter",
							     extraKeys: {"Ctrl-Q": "toggleComment"},
							     mode: "css"
							 });
						}
						$.ajax({
							url: "/jservice/", 
							type: "POST", 
							data:{
								component:'nim-plateform',
								service:'designer',
								method:'readFile',
								arguments:'{'+
									'pageUrl:"'+LUI.PageDesigner.instance._pageInfo.cssPage+'"'+
								'}'
							},
							dataType:"text",
							success: function(result){
								LUI.PageDesigner.instance.cssCodeMirrorEdit.setValue(result);
								//$( "#_designer-edit-css-editor" ).text(result);
								LUI.PageDesigner.instance.openCssEditDialog();
							},
							error:function(){
								alert("读取css文件失败："+"访问服务器失败！");
							}
						});
						return false;
					});
					//编辑js文件源代码
					$('#_designer').find( "#_designer-tools-edit-js-btn" ).button().click(function() {
						var edit_js_area = $( "#_designer-edit-js-container" );
						if(edit_js_area.length ==0){
							 $( "body" ).append('<div id="_designer-edit-js-container" ><textarea style="border:0px;margin:0px;width:100%;height:100%;" id="_designer-edit-js-editor"></textarea></div>');
							 LUI.PageDesigner.instance.jsCodeMirrorEdit = CodeMirror.fromTextArea(document.getElementById("_designer-edit-js-editor"), {
							     lineNumbers: true,
							     matchBrackets: true,
							     continueComments: "Enter",
							     extraKeys: {"Ctrl-Q": "toggleComment"},
							     mode: "javascript"
							 });
						}
						$.ajax({
							url: "/jservice/", 
							type: "POST", 
							data:{
								component:'nim-plateform',
								service:'designer',
								method:'readFile',
								arguments:'{'+
									'pageUrl:"'+LUI.PageDesigner.instance._pageInfo.jsPage+'"'+
								'}'
							},
							dataType:"text",
							success: function(result){
								LUI.PageDesigner.instance.jsCodeMirrorEdit.setValue(result);
								//$( "#_designer-edit-js-editor" ).text(result);
								LUI.PageDesigner.instance.openJsEditDialog();
							},
							error:function(){
								LUI.Message.info("访问服务器失败！");
							}
						});
						return false;
					});

					//编辑xml文件源代码
					$('#_designer').find( "#_designer-tools-edit-xml-btn" ).button().click(function() {
						var edit_js_area = $( "#_designer-edit-xml-container" );
						if(edit_js_area.length ==0){
							 $( "body" ).append('<div id="_designer-edit-xml-container" > <textarea style="border:0px;margin:0px;width:100%;height:100%;" id="_designer-edit-xml-editor"></textarea></div>');
							 LUI.PageDesigner.instance.xmlCodeMirrorEdit = CodeMirror.fromTextArea(document.getElementById("_designer-edit-xml-editor"), {
							     lineNumbers: true,
							     matchBrackets: true,
							     continueComments: "Enter",
							     mode: "xml"
							 });
						}
						$.ajax({
							url: "/jservice/", 
							type: "POST", 
							data:{
								component:'nim-plateform',
								service:'designer',
								method:'readFile',
								arguments:'{'+
									'pageUrl:"'+LUI.PageDesigner.instance._pageInfo.xmlPage+'"'+
								'}'
							},
							dataType:"text",
							success: function(result){
								LUI.PageDesigner.instance.xmlCodeMirrorEdit.setValue(result);
								//$( "#_designer-edit-xml-editor" ).text(result);
								LUI.PageDesigner.instance.openXmlEditDialog();
							},
							error:function(){
								LUI.Message.info("访问服务器失败！");
							}
						});
						return false;
					});
					
					this._saveComponentBtn = $('#_designer').find( "#_designer-tools-save" ).button({
						 text: false,
						 disabled: true,
						 icons: {
							 primary: "ui-icon-disk"
						 }
					}).click(function(){
						//保存页面定义
						if(!LUI.PageDesigner.instance.isValid()){
							LUI.Message.info("信息","节点中存在无效数据，请更改后重新保存!");
							return;
						}
						var node = LUI.PageDesigner.instance.findPageNode();
						var submitData = LUI.PageDesigner.instance.getSubmitData(node);
						$.ajax({
							url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
							type: "POST", 
							data:{
								component:'nim-plateform',
								service:'designer',
								method:'savePageDef',
								arguments:'{'+
									'pageUrl:"'+LUI.PageDesigner.instance._pageInfo.xmlPage+'",'+
									'pageDef:'+LUI.Util.stringify(submitData)+
								'}'
							},
							dataType:"json",
							context:this,
							success: function(result){
								if(result.success){
									LUI.Message.info("信息","保存成功!",null,{
										 buttons: [{ 
											 text: "刷新页面",
											 click:function() {
												 $( this ).dialog( "close" );
												 location.reload();
											 }
										},{ 
											 text: "确定",
											 click:function() {
												$( this ).dialog( "close" );
											 }
										}]
									});
								}else{
									LUI.Message.info("信息","保存失败:"+result.errorMsg);
								}
							},
							error:function(){
								LUI.Message.info("信息","访问服务器失败!");
							}
						});
					});
					
					this._gnComponentBtn = $('#_designer').find( "#_designer-tools-gn-node" ).button({
						 text: false,
//						 disabled: true,
						 icons: {
							 primary: "ui-icon-clipboard"
						 }
					}).click(function(){
						//取得当前节点对应的系统代号及功能代号
						window.open('nim.html?_pt_=system/gongNengList/gongNengList.html');
					});
					
					this._stlComponentBtn = $('#_designer').find( "#_designer-tools-stl-node" ).button({
						 text: false,
//						 disabled: true,
						 icons: {
							 primary: "ui-icon-copy"
						 }
					}).click(function(){
						//取得当前节点对应的系统代号及功能代号
						window.open('nim.html?_pt_=system/shiTiLeiList/shiTiLeiList.html');
					});
					
					this._propertyToggleBtn = $('#_designer').find( "#_designer-tools-property-toggle" ).button({
						text: false,
						icons: { 
							primary: "ui-icon-mail-open"
						} 
					}).click(function () {
				        if (this.checked) {
				            $(this).button("option", "icons", { primary: 'ui-icon-mail-open' });
				            
				            var treeObj = LUI.PageDesigner.instance._pageCmpTree;
							var selectedNodes = treeObj.getSelectedNodes();
							if(selectedNodes.length ==1){
								var selectedNode = selectedNodes[0];
					            if(selectedNode.component.isEditable == 'true'){
					            	LUI.PageDesigner.instance.applyDataToForm(selectedNode);
					            	if(LUI.PageDesigner.instance._designerPanel.south.state.isClosed){
										LUI.PageDesigner.instance._designerPanel.open('south');
									}
								}
							}
							
				        } else {
				            $(this).button("option", "icons", { primary: 'ui-icon-mail-closed' });
				            if(!LUI.PageDesigner.instance._designerPanel.south.state.isClosed){
								LUI.PageDesigner.instance._designerPanel.close('south');
							}
				        }
				    })[0];
					
				    //点击切换原始页面选择模式
				    $('#_designer').find( "#_designer-tools-orginal-toggle" ).button({
						text: false,
						checked: false,
						icons: {
							primary: "ui-icon-script"
						} 
					}).click(function () {
						if(this.checked){
							$("#_original")
								.css("height","100%")
								.css("width",$("#_pageContent").width()+"px")
								.css("top","0")
								.css("z-index","99")
								.append(_orginalContent)
								.scrollTop($("#_pageContent").scrollTop());
							$("#_pageContent").css("overflow","hidden").css("opacity","0");
						}else{
							$("#_pageContent").css("overflow","auto").css("opacity","1");
							$("#_original").css("height","0").css("width","0").css("z-index","-1").empty();
						}
//				        _isOriginalChoose = this.checked;
				    });
					//从服务器端加载预定义的控件信息
					//创建树 创建弹出菜单...
					$.ajax({
						url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
						type: "POST", 
						data:{
							component:'nim-plateform',
							service:'designer',
							method:'readCmpDef',
							arguments:"{}"
						},
						dataType:"json",
						context:this,
						success: LUI.PageDesigner.instance.componentDefineLoaded,
						error:function(){
							alert("加载组件定义失败："+"访问服务器失败！");
						}
					});
				},
				getSubmitData:function(node){
					//不添加结构节点
					var newData = {};
					//要保存全部信息 覆盖原有配置文件 而不是修改原有配置文件
					var nodeData = node.data;
					if(node.record!=null){
						nodeData = node.record.getSubmitData(false);
					}
					for(var p in nodeData){
						if(p.substr(0,1) != '_'){
							var vStr =  nodeData[p];
							if(vStr !=null && (''+vStr).length > 0){
								if(typeof(vStr) == 'string' ){
									vStr = vStr.replace(/\n/g,"\\n").replace(/\"/g,'\\"').replace(/\'/g,"\\'").replace(/\\\\"/g,'\\"').replace(/\\\\'/g,"\\'");
								}
								newData[p] = vStr;
							}
							
						}
					}
					
					if(node.children!=null){
						newData.children = [];
						for(var i=0;i<node.children.length;i++ ){
							var cnode = node.children[i];
							if(cnode.component ==null && cnode.children!=null){
								//结构节点
								for(var j=0;j<cnode.children.length;j++ ){
									var snode = cnode.children[j];
									newData.children[newData.children.length] = LUI.PageDesigner.instance.getSubmitData(snode);
								}
							}else if(cnode.component!=null){
								newData.children[newData.children.length] = LUI.PageDesigner.instance.getSubmitData(cnode);
							}
						}
					}
					newData.xmlElName = node.component.xmlElName;
					return newData;
				},
				isValid:function(){
					var treeObj = LUI.PageDesigner.instance._pageCmpTree;
					var nodes = treeObj.transformToArray(treeObj.getNodes());
					for(var i=0;i<nodes.length;i++ ){
						var node = nodes[i];
						if(node.component !=null){//非结构节点 要检查是否有效
							if(!node.data._isValid){
//								LUI.PageDesigner.instance.setInvalid(node);
//								LUI.PageDesigner.instance._pageCmpTree.selectNode(node,false);
								return false;
							}else{
								//不用在这里清除标志
							}
						}
					}
					return true;
				},
				setInvalid:function(node){
					node.iconSkin = "designer-tree-invalid" ;
					LUI.PageDesigner.instance._pageCmpTree.updateNode(node);
					node.data._isValid = false;
				},
				clearInvalid:function(node){
					node.iconSkin = null;
					LUI.PageDesigner.instance._pageCmpTree.updateNode(node);
					node.data._isValid = true;
				},
				createTypeMenu:function(addComponentBtn){
					//根据控件定义 创建下拉菜单 显示所有可用控件
					var menuHtml = '';
					for(var typeKey in this._types){
						if(this._types[typeKey].isAppendable != 'false'){
							var _typeSequence = '9990';
							if(this._types[typeKey].sequence!=null){
								_typeSequence = this._types[typeKey].sequence;
							}
							menuHtml+='<li _type_name="'+typeKey+'" _sequence="'+_typeSequence+'">';
							menuHtml+='<a href="#"><span class="ui-icon '+this._types[typeKey].iconClass+'"></span>'+this._types[typeKey].label+'</a>';
							
							var cmpText = '';
							for( var cmpKey in this._components){
								if(this._components[cmpKey].type == typeKey && this._components[cmpKey].isAppendable != 'false'){
									var _cmpSequence = '9999';
									if(this._components[cmpKey].sequence!=null){
										_cmpSequence = this._components[cmpKey].sequence;
									}
									cmpText +='<li  _sequence="'+_cmpSequence+'"  _type_name="'+typeKey+'" _component_name="'+cmpKey+'"><a href="#"><span class="ui-icon '+this._components[cmpKey].iconClass+'"></span>'+this._components[cmpKey].label+'</a></li>';
								}
							}
							if(cmpText.length >0){
								menuHtml += '<ul style="width:120px;">'+cmpText+'</ul>';
							}
							menuHtml+='</li>';
						}
					}
					
					this._types._field = {
							isAppendable:'true',
							dependencies:[{
								'component-name':"formFields"
							},{
								'component-name':"gridColumns"
							},{
								'component-name':"properties"
							},{
								'component-name':"workflowProperties"
							}]
						};
					//添加字段选项
					menuHtml+='<li _type_name="_field" _sequence="9999"><a href="#"><span class="ui-icon"></span>字段</a></li>';
					//排序
					var newMenuItems = $(menuHtml).sort(function (a,b){
						var aa = $(a).attr('_sequence');
						var bb = $(b).attr('_sequence');
					    return parseInt(aa) > parseInt(bb) ? 1 : -1;
					});
					
					newMenuItems.appendTo($("#_designer-tools-add-menu"));
					
					this._addComponentMenu = $("#_designer-tools-add-menu").hide().menu({
						select: function( event, ui ) {
							//检查当前组件树的选中情况
							var treeObj = LUI.PageDesigner.instance._pageCmpTree;
							var selectedNodes = treeObj.getSelectedNodes();
							if(selectedNodes.length >1){
								LUI.Message.info("信息","不允许同时对多个节点进行添加控件的操作!");
								return;
							}else if(selectedNodes.length==0 ){
								return;
							}
							var selectedNode = selectedNodes[0];
							
							//当前菜单项对应的类型 及定义
							var type_name = ui.item.attr('_type_name');
							var type_def = LUI.PageDesigner.instance._types[type_name];
							
							var component_name = ui.item.attr('_component_name');
							if(component_name == null && type_name!='_field'){
								component_name = type_def.defaultComponent;
								if(component_name == null){
									//type类型的节点 没有指定默认component的话 不允许选择
									event.stopPropagation();//不要关闭窗口
									return;
								}
							}
							
							if(type_name == "_field"){
								
								if(selectedNode.component.name == 'formFields'){
									//是否form节点
									var formNode = selectedNode.getParentNode();
									if(formNode.component.name == 'workflowForm'){
										//流程检视表单 从流程检视表选择字段信息
										var popupStlWin = LUI.stlWin.getInstance();
										popupStlWin._xiTongDH = 'system';
										popupStlWin._shiTiLeiDH = 'SYS_LiuChengJS';
										popupStlWin._gongNengDH = null;
										popupStlWin._callback = function(parentNode,selectNodes){
											for(var i=0;i<selectNodes.length;i++){
												var selectedData = selectNodes[i].data;
												var _columnName = selectedData.ziDuanDH;
												var _columnLabel = selectedData.ziDuanBT;
												var _columnType = selectedData.ziDuanLX.ziDuanLXDH;
												
												var _columnNodeComponent = _columnType+"Display";
												var _columnNode = LUI.PageDesigner.instance.addComponentNode(selectedNode,_columnNodeComponent,_columnLabel);
												
												//记录节点名称及数据
												_columnNode.data._isValid = true;
												_columnNode.data.name = _columnName;
												_columnNode.data.label = _columnLabel;
												_columnNode.data.fieldType = _columnType;
												_columnNode.data.renderTemplate = "{{"+_columnName+"}}";
											}
											if(selectNodes.length>0){
												LUI.PageDesigner.instance._pageCmpTree.expandNode(selectedNode);
											}
										};
										popupStlWin.requestZdsData(null,popupStlWin.showWindow);
									}else if(formNode.component.name == 'workflowSubForm'){
										//流程检视子表单 从流程检视表单的功能对应的实体类中  取得数据
										var wFormNode = selectedNode.getParentNode().getParentNode().getParentNode();
										if(wFormNode.data.gongNengDH==null){
											LUI.Message.info("错误","流程检视表单未设置流程功能代号!");
											LUI.PageDesigner.instance._pageCmpTree.selectNode(wFormNode,false);
											return;
										}else if(wFormNode.data.xiTongDH==null){
											LUI.Message.info("错误","流程检视表单未设置系统代号!");
											LUI.PageDesigner.instance._pageCmpTree.selectNode(wFormNode,false);
											return;
										}
										
										var popupStlWin = LUI.stlWin.getInstance();
										popupStlWin._xiTongDH = wFormNode.data.xiTongDH;
										popupStlWin._shiTiLeiDH = null;
										popupStlWin._gongNengDH = wFormNode.data.gongNengDH;
										
										popupStlWin._callback = function(parentNode,selectNodes){
											for(var i=0;i<selectNodes.length;i++){
												var selectedData = selectNodes[i].data;
												var _columnName = selectedData.ziDuanDH;
												var _columnLabel = selectedData.ziDuanBT;
												var _columnType = selectedData.ziDuanLX.ziDuanLXDH;
												
												var _columnNodeComponent = _columnType+"Display";
												var _columnNode = LUI.PageDesigner.instance.addComponentNode(selectedNode,_columnNodeComponent,_columnLabel);
												
												//记录节点名称及数据
												_columnNode.data._isValid = true;
												_columnNode.data.name = _columnName;
												_columnNode.data.label = _columnLabel;
												_columnNode.data.fieldType = _columnType;
												_columnNode.data.renderTemplate = "{{"+_columnName+"}}";
											}
											if(selectNodes.length>0){
												LUI.PageDesigner.instance._pageCmpTree.expandNode(selectedNode);
											}
										};
										popupStlWin.requestZdsData(null,popupStlWin.showWindow);
									}else if(formNode.component.type == 'form'){
										//关联页面元素 选择/设置表单的生成方式
										var datasourceNode = LUI.PageDesigner.instance.getDatasourceBySelectedNode(selectedNode);
										if(datasourceNode==null){
											LUI.Message.info("错误","当前表单未关联数据源!");
											return;
										}
										
										//取数据源定义
//										var dataset = LUI.Datasource.getInstance(datasourceNode.data.name);
//										if(dataset==null){
//											LUI.Message.info("错误","未找到当前表单关联的数据源对象，请保存后刷新页面，再重试！!");
//											return;
//										}
										
										var formRenderto = formNode.data.renderto;
										if(formRenderto==null){
											LUI.Message.info("错误","当前表单未设置目标元素!");
											return;
										}
										
										LUI.Mapping.openGridMaping(datasourceNode.data.name,selectedNode,null);
									}else{
										//下面的代码好像没有可能执行 注释掉试试
										LUI.Message.info("错误","以为不会执行的代码!");
										console.error('警告:以为不会执行的代码!');
										return;
										
//										//使用数据源字段选择窗口 选择下级字段
//										var datasourceNode = LUI.PageDesigner.instance.getDatasourceBySelectedNode(selectedNode);
//										var propertyName = LUI.PageDesigner.instance.getPropertyByNode(selectedNode);
//										//根据当前控件节点 查找关联的数据源节点
//										if(datasourceNode!=null){
//											//弹出实体类窗口 选择字段(多选  不展开对象节点 不展开集合节点)
//											LUI.zdWin.getInstance().openByNode(datasourceNode,propertyName,false,false,false,selectedNode,function(parentCmpNode,selectedNodes){
//												if(selectedNodes.length>0){
//													
//													for(var i=0;i<selectedNodes.length;i++){
//														var checkedNode = selectedNodes[i];
//														
//														var propertyLabel = checkedNode.data.label;
//														var propertyName = checkedNode.data.name;
//														
//														var loopNode = checkedNode.getParentNode();
//														while(loopNode.getParentNode()!=null){
//															propertyLabel = loopNode.data.label+"."+propertyLabel;
//															propertyName = loopNode.data.name+"."+propertyName;
//															
//															loopNode = loopNode.getParentNode();
//														}
//														
//														var componentName = "simpleField";
//														if(checkedNode.data.fieldType == "set" || checkedNode.data.fieldType == "object"){
//															componentName = "complexField";
//														}
//															
//														//为formFields节点添加字段 
//														var newNode = LUI.PageDesigner.instance.addComponentNode(parentCmpNode,componentName,propertyLabel);
//														if(newNode!=null){
//															newNode.data.fieldType = checkedNode.data.fieldType;
//															newNode.data.name = propertyName;
//															newNode.data.label = propertyLabel;
//														}
//													}
//													
//													//添加字段后 允许保存
//													LUI.PageDesigner.instance._saveComponentBtn.button( "enable");
//												}
//												
//											});
//										}else{
//											LUI.Message.info("错误","当前节点未关联数据源!");
//										}
									}
								}else if(selectedNode.component.name == 'sqlProperties' ){
									//直接添加字段
									var newNode = LUI.PageDesigner.instance.addComponentNode(selectedNode,"simpleProperty","简单属性");
									if(newNode!=null){
										newNode.data.fieldType = "string";
										newNode.data.name = 'cmp_simpleProperty_'+newNode.tId.substr(25);
										newNode.data.label = "简单属性"; 
										//添加字段后 允许保存
										LUI.PageDesigner.instance._saveComponentBtn.button( "enable");
									}
									
								}else if(selectedNode.component.name == 'properties'){
									//根据当前控件节点 查找关联的数据源节点
									var datasourceNode = LUI.PageDesigner.instance.getDatasourceBySelectedNode(selectedNode);
									if(datasourceNode!=null){
										
										if(datasourceNode.data.component == 'sqlDataset' || datasourceNode.data.component == 'javaDataset' || datasourceNode.data.component == 'sqlRecord'){
											var newNode = LUI.PageDesigner.instance.addComponentNode(selectedNode,"simpleProperty","简单属性");
											if(newNode!=null){
												newNode.data.fieldType = "string";
												newNode.data.name = 'cmp_simpleProperty_'+newNode.tId.substr(25);
												newNode.data.label = "简单属性"; 
												//添加字段后 允许保存
												LUI.PageDesigner.instance._saveComponentBtn.button( "enable");
											}
										}else if(datasourceNode.data.component == 'gnDataset' || datasourceNode.data.component == 'gnRecord'
											|| datasourceNode.data.component == 'stlDataset' || datasourceNode.data.component == 'stlRecord'
											|| datasourceNode.data.component == 'workflowDataset'){
											var propertyName = LUI.PageDesigner.instance.getPropertyByNode(selectedNode);
											
											//弹出实体类窗口 选择字段
											LUI.stlWin.getInstance().openByDatasourceNode(datasourceNode,propertyName,selectedNode,false,false,function(parentCmpNode,checkedZDNodes){
												//为数据源添加字段 
												if(checkedZDNodes.length>0){
													var zdArray = [];
													for(var i=0;i<checkedZDNodes.length;i++){
														//取得正确的上级节点
														var _parentZiDuanDH = checkedZDNodes[i]._parentZiDuanDH;
														var zddh = "";
														if(propertyName!=null && propertyName.length >0){
															zddh = propertyName;
														}
														if(checkedZDNodes[i]._parentZiDuanDH!=null && checkedZDNodes[i]._parentZiDuanDH.length >0){
															zddh = zddh + (zddh.length>0?".":"")+checkedZDNodes[i]._parentZiDuanDH;
														}
														
														zddh = zddh + (zddh.length>0?".":"")+checkedZDNodes[i].data.ziDuanDH;
														
														zdArray[zdArray.length] = {name:zddh};
													}
													
													LUI.PageDesigner.instance.addPropertyToDatasetNode(datasourceNode,datasourceNode.children[0],zdArray);
													//添加字段后 允许保存
													LUI.PageDesigner.instance._saveComponentBtn.button( "enable");
												}
											});
										}else if(datasourceNode.data.component == 'todoDataset'){

											//根据当前控件节点 查找关联的数据源节点
											var datasourceNode = selectedNode.getParentNode();;
											var propertyName = null;

											//弹出实体类窗口 选择字段openByDatasourceNode
											LUI.stlWin.getInstance().openByDatasourceNode(datasourceNode,propertyName,selectedNode,false,true,function(parentCmpNode,checkedZDNodes){
												//为数据源添加字段 
												if(checkedZDNodes.length ==1 && checkedZDNodes[0].name == null){
													//添加自定义属性字段
													newNode = LUI.PageDesigner.instance.addComponentNode(selectedNode,"simpleProperty","自定义");
													if(newNode!=null){
														newNode.data.fieldType = "string";
														newNode.data.name = "userDefine";
														newNode.data.label = "自定义"; 
													}
													return;
												}
												var newNode = null;
												for(var i=0;i<checkedZDNodes.length;i++){
													var parentNode = parentCmpNode
													//取得正确的上级节点
													var _parentZiDuanDH = checkedZDNodes[i]._parentZiDuanDH;
													if(_parentZiDuanDH != null){
														//查找当前字段的父节点
														var parentZDDHArray = _parentZiDuanDH.split(".");
														for(var k=0;k<parentZDDHArray.length;k++){
															var nodeFound = false;
															for(var j=0;j<parentNode.children.length;j++){
																if(parentNode.children[j].data.name == parentZDDHArray[k]){
																	parentNode = parentNode.children[j].children[0];
																	nodeFound = true;
																	break;
																}
															}
															if(!nodeFound){
																LUI.Message.info("信息","待添加字段的上级节点"+_parentZiDuanDH+"不存在!");
																return ;
															}
														}
													}
													
													//检查添加的字段是否已存在
													var nodeFound = false;
													if(parentNode.children!=null){
														for(var j=0;j<parentNode.children.length;j++){
															if(parentNode.children[j].data.name == checkedZDNodes[i].data.ziDuanDH){
																nodeFound = true;
																break;
															}
														}
													}
													
													if(!nodeFound){
														//添加字段
														var ziDuanType = checkedZDNodes[i].data.ziDuanLX.ziDuanLXDH;
														if(ziDuanType == 'object' || ziDuanType == 'set'){
															ziDuanType = "complexProperty";
														}else{
															ziDuanType = "simpleProperty";
														}
														newNode = LUI.PageDesigner.instance.addComponentNode(parentNode,ziDuanType,checkedZDNodes[i].data.ziDuanBT);
														if(newNode!=null){
															newNode.data.fieldType = checkedZDNodes[i].data.ziDuanLX.ziDuanLXDH;
															newNode.data.name = checkedZDNodes[i].data.ziDuanDH;
															newNode.data.label = checkedZDNodes[i].data.ziDuanBT; 
														}
													}
												}
												//选中最后一个添加的字段 
												if(newNode!=null){
//													LUI.PageDesigner.instance._pageCmpTree.expandNode(newNode.getParentNode());
													treeObj.selectNode(newNode,false);
													LUI.PageDesigner.instance.onComponentNodeSelected(newNode);
													
													//添加字段后 允许保存
													LUI.PageDesigner.instance._saveComponentBtn.button( "enable");
												}
											});
										}
									}
									
								}else if(selectedNode.component.name == 'workflowProperties' ){
									//直接添加字段
									var newNode = LUI.PageDesigner.instance.addComponentNode(selectedNode,"workflowProperty","属性");
									if(newNode!=null){
										newNode.data.fieldType = "string";
										newNode.data.name = 'cmp_workflowProperty_'+newNode.tId.substr(25);
										newNode.data.label = "属性"; 
										//添加字段后 允许保存
										LUI.PageDesigner.instance._saveComponentBtn.button( "enable");
									}
									
								}else if(selectedNode.component.name == 'gridColumns'){
									var datasourceNode = LUI.PageDesigner.instance.getDatasourceBySelectedNode(selectedNode);
									if(datasourceNode==null){
										LUI.Message.info("错误","当前表格未关联数据源!");
										return;
									}
									
									//取数据源节点
									if(datasourceNode.data.component == 'todoDataset' || datasourceNode.data.component == 'javaDataset'){
										//弹出实体类窗口 选择字段(单选 展开对象节点 不展开集合节点)
										LUI.zdWin.getInstance().openByNode(datasourceNode,null,false,true,false,selectedNode,function(parentCmpNode,selectedNodes){
											if(selectedNodes.length>0){
												
												for(var jj = 0;jj<selectedNodes.length;jj++){
													var checkedNode = selectedNodes[jj];
													
													var propertyLabel = checkedNode.data.label;
													var propertyName = checkedNode.data.name;
													
													var loopNode = checkedNode.getParentNode();
													while(loopNode.getParentNode()!=null){
														propertyLabel = loopNode.data.label+"."+propertyLabel;
														propertyName = loopNode.data.name+"."+propertyName;
														
														loopNode = loopNode.getParentNode();
													}
													
													//为gridColumns节点添加字段 
													var newNode = LUI.PageDesigner.instance.addComponentNode(parentCmpNode,"gridColumn",propertyLabel);
													if(newNode!=null){
														newNode.data.fieldType = checkedNode.data.fieldType;
														newNode.data.name = propertyName;
														newNode.data.label = propertyLabel;
													}
												}
												//添加字段后 允许保存
												LUI.PageDesigner.instance._saveComponentBtn.button( "enable");
											}
											
										});
									}else{
										//取数据源定义
//										var dataset = LUI.Datasource.getInstance(datasourceNode.data.name);
//										if(dataset==null){
//											LUI.Message.info("错误","未找到当前表格关联的数据源对象，请保存后刷新页面，再重试！!");
//											return;
//										}
										
										var propertyName = LUI.PageDesigner.instance.getPropertyByNode(selectedNode);
										
										//grid节点
										var gridNode = selectedNode.getParentNode();
										var gridRenderto = gridNode.data.renderto;
										if(gridRenderto==null){
											LUI.Message.info("错误","当前表格未设置目标元素!");
											return;
										}
										
										LUI.Mapping.openGridMaping(datasourceNode.data.name,selectedNode,propertyName);
									}
								}
							}else if(type_name == "filter" && selectedNode.component.name == 'filters'){
								//为功能数据集 设置过滤条件
								var fieldFilterComponentName = 'propertyFilter';
								var sqlFilterComponentName = 'sqlFilter';
								if(component_name == "propertyFilter"){
									//根据当前控件节点 查找关联的数据源节点
									var datasourceNode = LUI.PageDesigner.instance.getDatasourceBySelectedNode(selectedNode);
									
									var propertyName = LUI.PageDesigner.instance.getPropertyByNode(selectedNode);
									if(datasourceNode!=null){
										//弹出实体类窗口 选择字段
										LUI.stlWin.getInstance().openByDatasourceNode(datasourceNode,propertyName,selectedNode,false,true,function(parentCmpNode,checkedZDNodes){
											//为过滤条件列表节点 添加一个过滤条件
											var checkedNode = checkedZDNodes[0];
											
											var propertyLabel = "自定义";
											var propertyName = null;
											var propertyType = "string";
											if(checkedNode.data!=null){
												//选择了某个属性
												propertyLabel = checkedNode.data.ziDuanBT;
												propertyName = checkedNode.data.ziDuanDH;
												propertyType = checkedNode.data.ziDuanLX.ziDuanLXDH;
												//检查上级节点
												var loopNode = checkedNode.getParentNode();
												while(loopNode.getParentNode()!=null){
													propertyLabel = loopNode.data.ziDuanBT+"."+propertyLabel;
													propertyName = loopNode.data.ziDuanDH+"."+propertyName;
													
													loopNode = loopNode.getParentNode();
												}
											}
											
											var newNode = LUI.PageDesigner.instance.addComponentNode(parentCmpNode,fieldFilterComponentName,propertyLabel);
											if(newNode!=null){
												newNode.data.label = propertyLabel;
												newNode.data.type = propertyType;
												newNode.data.property = propertyName;
												newNode.data.operator = 'eq';
												newNode.data.value = null;
												
												treeObj.selectNode(newNode,false);
												LUI.PageDesigner.instance.onComponentNodeSelected(newNode);
											}
											//添加过滤条件后 允许保存
											LUI.PageDesigner.instance._saveComponentBtn.button( "enable");
										});
									}
								}else if(component_name == "sqlFilter"){
									//为数据源添加SQL过滤条件
									var newNode = LUI.PageDesigner.instance.addComponentNode(selectedNode,sqlFilterComponentName,'sql条件');
									if(newNode!=null){
										newNode.data.label = 'sql条件';
										treeObj.selectNode(newNode,false);
										LUI.PageDesigner.instance.onComponentNodeSelected(newNode);
									}
								}
							}else if(type_name == "filter" && selectedNode.component.name == 'searchFilters' && selectedNode.getParentNode().component.name == 'searchToPage'){
								//为查询表单()设置过滤条件
								var fieldFilterComponentName = 'searchFieldFilter';
								var sqlFilterComponentName = 'searchSqlFilter';
								
								if(component_name == "propertyFilter"){
									var newNode = LUI.PageDesigner.instance.addComponentNode(selectedNode,fieldFilterComponentName,'字段条件');
									if(newNode!=null){
										newNode.data.label = '字段条件';
										newNode.data.type = null;
										newNode.data.property = '';
										newNode.data.operator = 'eq';
										newNode.data.value = null;
										
										treeObj.selectNode(newNode,false);
										LUI.PageDesigner.instance.onComponentNodeSelected(newNode);
									}
								}else if(component_name == "sqlFilter"){
									//为数据源添加SQL过滤条件
									var newNode = LUI.PageDesigner.instance.addComponentNode(selectedNode,sqlFilterComponentName,'sql条件');
									if(newNode!=null){
										newNode.data.label = 'sql条件';
										treeObj.selectNode(newNode,false);
										LUI.PageDesigner.instance.onComponentNodeSelected(newNode);
									}
								}
								//添加过滤条件后 允许保存
								LUI.PageDesigner.instance._saveComponentBtn.button( "enable");
							}else if(type_name == "filter" && selectedNode.component.name == 'searchFilters' && selectedNode.getParentNode().component.name == 'searchToGrid'){
								//为查询表单()设置过滤条件
								var fieldFilterComponentName = 'searchFieldFilter';
								var sqlFilterComponentName = 'searchSqlFilter';
								
								//根据当前控件节点 查找关联的数据源节点
								var datasourceNode = LUI.PageDesigner.instance.getDatasourceBySelectedNode(selectedNode);
								if(datasourceNode==null){
									LUI.Message.info("错误","未找到数据源!");
									return;
								}
								var propertyName = LUI.PageDesigner.instance.getPropertyByNode(selectedNode);
								
								if(component_name == "propertyFilter"){
									//弹出实体类窗口 选择字段
									LUI.stlWin.getInstance().openByDatasourceNode(datasourceNode,propertyName,selectedNode,false,true,function(parentCmpNode,checkedZDNodes){
										//为过滤条件列表节点 添加一个过滤条件
										var checkedNode = checkedZDNodes[0];
										var propertyLabel = checkedNode.data.ziDuanBT;
										var propertyName = checkedNode.data.ziDuanDH;
										
										var loopNode = checkedNode.getParentNode();
										while(loopNode.getParentNode()!=null){
											propertyLabel = loopNode.data.ziDuanBT+"."+propertyLabel;
											propertyName = loopNode.data.ziDuanDH+"."+propertyName;
											
											loopNode = loopNode.getParentNode();
										}
										
										var newNode = LUI.PageDesigner.instance.addComponentNode(parentCmpNode,fieldFilterComponentName,propertyLabel);
										if(newNode!=null){
											newNode.data.label = propertyLabel;
											newNode.data.type = checkedNode.data.ziDuanLX.ziDuanLXDH;
											newNode.data.property = propertyName;
											newNode.data.operator = 'eq';
											newNode.data.value = null;
										}
										//添加过滤条件后 允许保存
										LUI.PageDesigner.instance._saveComponentBtn.button( "enable");
									});
								}else if(component_name == "sqlFilter"){
									//为数据源添加SQL过滤条件
									var newNode = LUI.PageDesigner.instance.addComponentNode(selectedNode,sqlFilterComponentName,'sql条件');
									if(newNode!=null){
										newNode.data.label = 'sql条件';
										treeObj.selectNode(newNode,false);
										LUI.PageDesigner.instance.onComponentNodeSelected(newNode);
									}
								}
								
								
								
							}else if(type_name == "sort"){
								var component_name = ui.item.attr('_component_name');
								if(component_name == null){
									component_name = type_def.defaultComponent;
								}
								//添加排序条件
								if(component_name == "propertySort"){
									//为数据源添加字段排序条件
									
									//根据当前控件节点 查找关联的数据源节点
									var datasourceNode = LUI.PageDesigner.instance.getDatasourceBySelectedNode(selectedNode);
									
									var propertyName = LUI.PageDesigner.instance.getPropertyByNode(selectedNode);
									if(datasourceNode!=null){
										//弹出实体类窗口 选择字段
										LUI.stlWin.getInstance().openByDatasourceNode(datasourceNode,propertyName,selectedNode,true,false,function(parentCmpNode,checkedZDNodes){
											//为排序条件列表节点 添加一个排序条件
											var checkedNode = checkedZDNodes[0];
											var propertyLabel = checkedNode.data.ziDuanBT;
											var propertyName = checkedNode.data.ziDuanDH;
											
											var loopNode = checkedNode.getParentNode();
											while(loopNode.getParentNode()!=null){
												propertyLabel = loopNode.data.ziDuanBT+"."+propertyLabel;
												propertyName = loopNode.data.ziDuanDH+"."+propertyName;
												
												loopNode = loopNode.getParentNode();
											}
											
											var newNode = LUI.PageDesigner.instance.addComponentNode(parentCmpNode,'propertySort',propertyLabel);
											if(newNode!=null){
												newNode.data.label = propertyLabel;
												newNode.data.property = propertyName;
												newNode.data.dir = 'ASC';
											}
											//添加排序条件后 允许保存
											LUI.PageDesigner.instance._saveComponentBtn.button( "enable");
										});
									}
								}else if(component_name == "sqlSort"){
									//为数据源添加SQL排序条件
								}
							
							}else{
								
								//添加新节点
								var newNode = null;
								
								var component_def = LUI.PageDesigner.instance._components[component_name];
								var isRootNode = false;
								var isMatch = false;
								for(var i=0;i< component_def.dependencies.length;i++){
									var itemDependency = component_def.dependencies[i];
									if(itemDependency['type-name'] == 'page' || itemDependency['component-name'] == 'page' ){
										isRootNode = true;
									}else if (itemDependency['type-name'] == selectedNode.component.type || itemDependency['component-name'] == selectedNode.component.name ){
										isMatch = true;
										break;
									}
								}
								
								if(!isMatch && isRootNode){
									//添加的是页面上的顶层组件 （分类型显示）
									var typeStructureNode = LUI.PageDesigner.instance.findTypeStructureNode(type_name);
									if(typeStructureNode==null){
										typeStructureNode = LUI.PageDesigner.instance.addTypeStructureNode(type_def);
									}
									newNode = LUI.PageDesigner.instance.addComponentNode(typeStructureNode,component_name,null);
								}else if(isMatch){
									//添加的是下层元素
									newNode = LUI.PageDesigner.instance.addComponentNode(selectedNode,component_name,null);
								}else{
									//兼容可能存在的错误
									if(_isDesignMode){
										LUI.Message.info("信息","请检查依赖关系是否正确!"+component_name);
									}
									newNode = LUI.PageDesigner.instance.addComponentNode(selectedNode,component_name,null);
								}
								if(newNode!=null){
//									LUI.PageDesigner.instance._pageCmpTree.expandNode(newNode.getParentNode());
									treeObj.selectNode(newNode,false);
									LUI.PageDesigner.instance.onComponentNodeSelected(newNode);
								}
							}
						}
					});
					//点击增加按钮 显示可用控件菜单
					this._addComponentBtn.click(function() {
						//查找树中的当前选中节点
						var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
						if(selectedNodes.length ==1){
							var componentName = 'page';//结构节点 同page
							if(selectedNodes[0].component!=null){
								componentName = selectedNodes[0].component.name;
							}
							//设置菜单中各选项的选中状态
							LUI.PageDesigner.instance.setMenuOptionStatus(componentName);
							//显示菜单
							LUI.PageDesigner.instance._addComponentMenu.show().position({
								my: "left top",
								at: "left bottom",
								of: this
							});
							$(document).one( "click", function() {
								LUI.PageDesigner.instance._addComponentMenu.hide();
							});
						}else{
							LUI.Message.info("信息","请在树中选择一个唯一的节点!");
						}
						return false;
					});
				},
				//添加某类型的默认组件节点
				addTypeStructureNode:function(type_def){
					var _cTypeLabel = type_def.label;
					var _cTypeName = type_def.name;
					if(_cTypeName == 'variable' || _cTypeName == 'record' || _cTypeName == 'dataset' ){
						_cTypeName = 'datasource';
						_cTypeLabel = '数据源';
					}
					
					var pageNode = LUI.PageDesigner.instance.findPageNode();
					var newNodeArray = LUI.PageDesigner.instance._pageCmpTree.addNodes(pageNode,{
						name:_cTypeLabel,
						form:{},
						type:{name:_cTypeName}
					},true);
					return newNodeArray[0];
				},
				//添加某类型的默认组件节点
				addTypeNode:function(parentNode,type_name,nodeLabel){
					var type_def = LUI.PageDesigner.instance._types[type_name];
					
					var component_name = type_def.defaultComponent;
					if(component_name==null){
						LUI.Message.info("信息","当前类型("+type_name+")未定义默认组件，不允许添加!");
						return null;
					}
					return this.addComponentNode(parentNode,component_name,nodeLabel);
				},
				getChildPropertyNode:function(fieldsNode,propertyName){
					var propertyNode = null;
					if(fieldsNode.children!=null && fieldsNode.children.length >0){
						for(var j=0;j<fieldsNode.children.length;j++){
							if(fieldsNode.children[j].data.name == propertyName){
								propertyNode = fieldsNode.children[j];
								break;
							}
						}
					}
					return propertyNode;
				},
				getShiTiLeiDefByDH:function(shiTiLeiDH){
					var shiTiLeiDef = null;
					for(var i=0;i<LUI.PageDesigner.instance._shiTiLeis.length;i++ ){
						var shiTiLeiData = LUI.PageDesigner.instance._shiTiLeis[i];
						if(shiTiLeiData.shiTiLeiDH == shiTiLeiDH){
							shiTiLeiDef = shiTiLeiData;
							break;
						}
					}
					return shiTiLeiDef;
				},
				getShiTiLeiDefByDatasourceNode:function(datasourceNode){
					var shiTiLeiDef = null;
					if(datasourceNode.component.name == 'gnDataset' || datasourceNode.component.name == 'gnRecord' ){
						for(var i=0;i<LUI.PageDesigner.instance._gongNengs.length;i++ ){
							var gongNengDefData = LUI.PageDesigner.instance._gongNengs[i];
							if(gongNengDefData.gongNengDH == datasourceNode.data.gongNengDH){
								shiTiLeiDef = LUI.PageDesigner.instance.getShiTiLeiDefByDH(gongNengDefData.shiTiLei.shiTiLeiDH);
								break;
							}
						}
					}else if(datasourceNode.component.name == 'stlDataset' || datasourceNode.component.name == 'stlRecord' || datasourceNode.component.name == 'workflowDataset'){
						shiTiLeiDef = LUI.PageDesigner.instance.getShiTiLeiDefByDH(datasourceNode.data.shiTiLeiDH);
					}
					return shiTiLeiDef;
				},
				getZiDuanByDH:function(shiTiLeiDef,ziDuanDH){
					var ziDuanDef = null;
					for(var i=0;i<shiTiLeiDef.zds.length;i++ ){
						var ziDuanData = shiTiLeiDef.zds[i];
						if(ziDuanData.ziDuanDH == ziDuanDH){
							ziDuanDef = ziDuanData;
							break;
						}
					}
					return ziDuanDef;
				},
				addPropertyToDatasetNode:function(datasetNode,fieldsNode,newFieldArray){
					//根据数据源的不同类型 取得对应的实体类定义
					var shiTiLeiDef = LUI.PageDesigner.instance.getShiTiLeiDefByDatasourceNode(datasetNode);
					var complexZdType = null;
					if(datasetNode.component.name == 'gnDataset' || datasetNode.component.name == 'gnRecord' ){
						complexZdType = "complexProperty";// "gnComplexProperty";
					}else if(datasetNode.component.name == 'stlDataset' || datasetNode.component.name == 'stlRecord' || datasetNode.component.name == 'workflowDataset' ){
						complexZdType =  "complexProperty";//"stlComplexProperty";
					}else if(datasetNode.component.name == 'sqlDataset' || datasetNode.component.name == 'sqlRecord' ){
						//为sql 数据源添加字段 
						var newNode = null;
						for(var i=0;i<newFieldArray.length;i++){
							if(newFieldArray[i].name !='@index'){
								var childZdNode = LUI.PageDesigner.instance.getChildPropertyNode(fieldsNode,newFieldArray[i].name);
								if(childZdNode == null){
									//此字段不存在 添加之
									var ziDuanDH = newFieldArray[i].name;
									var ziDuanBT = newFieldArray[i].name;
									var ziDuanLXDH = newFieldArray[i].type;
									var ziDuanComponent = 'simpleProperty';
									
									childZdNode = LUI.PageDesigner.instance.addComponentNode(fieldsNode,ziDuanComponent,ziDuanBT);
									childZdNode.data.fieldType = ziDuanLXDH;
									childZdNode.data.name = ziDuanDH;
									childZdNode.data.label = ziDuanBT;
									
									newNode = childZdNode;
								}
							}
						}
						//展开当前添加了字段的节点
						if(newNode!=null){
							LUI.PageDesigner.instance._pageCmpTree.expandNode(fieldsNode,true);
						}
					}else{
						LUI.Message.info("信息","未知的数据源类型（"+datasetNode.name+"）!");
						return ;
					}
					
					//为gn 和stl 数据源添加字段 
					if(shiTiLeiDef!=null){
						var newNode = null;
						for(var i=0;i<newFieldArray.length;i++){
							
							var currentShiTiLeiDef = shiTiLeiDef;
							var currentFieldsNode = fieldsNode;
							//取得正确的上级节点
							var currentZiDuanDH = newFieldArray[i].name;
							if(newFieldArray[i].name.indexOf('@index') < 0){
								//查找当前字段的父节点
								var zddhArray = currentZiDuanDH.split(".");
								for(var k=0;k<zddhArray.length;k++){
									var childZdNode = LUI.PageDesigner.instance.getChildPropertyNode(currentFieldsNode,zddhArray[k]);
									if(childZdNode == null){
										var ziDuanLXDH = null;
										var ziDuanDH = null;
										var ziDuanBT = null;
										var ziDuanComponent = null;
										
										if(zddhArray[k].indexOf('@index')>=0){
											ziDuanLXDH = 'int';
											ziDuanComponent = 'simpleProperty';
											ziDuanBT = '行号';
											ziDuanDH = '@index';
										}else{
											var childZdDef = LUI.PageDesigner.instance.getZiDuanByDH(currentShiTiLeiDef,zddhArray[k]);
											if(childZdDef == null){
												LUI.Message.info("信息","实体类("+currentShiTiLeiDef.shiTiLeiMC+")中未找到字段("+zddhArray[k]+")的定义!");
												return;
											}else{
												//添加字段
												ziDuanLXDH = childZdDef.ziDuanLX.ziDuanLXDH;
												if(ziDuanLXDH == 'object' || ziDuanLXDH == 'set'){
													ziDuanComponent = complexZdType;
												}else{
													ziDuanComponent = "simpleProperty";
												}
												ziDuanBT = childZdDef.ziDuanBT;
												ziDuanDH = childZdDef.ziDuanDH;
											}
										}
										
										childZdNode = LUI.PageDesigner.instance.addComponentNode(currentFieldsNode,ziDuanComponent,ziDuanBT);
										childZdNode.data.fieldType = ziDuanLXDH;
										childZdNode.data.name = ziDuanDH;
										childZdNode.data.label = ziDuanBT;
										
										newNode = childZdNode;
									}
									//改变上级字段为当前子节点的第一个下级节点（fields)
									if(childZdNode.component.name == complexZdType){
										currentFieldsNode = childZdNode.children[0];
										var childZdDef = LUI.PageDesigner.instance.getZiDuanByDH(currentShiTiLeiDef,childZdNode.data.name);
										if(childZdDef.guanLianSTL == null){
											LUI.Message.info("信息","字段("+childZdDef.ziDuanDH+":"+childZdDef.ziDuanBT+")未定义关联实体类!");
											return ;
										}else if(childZdDef.guanLianSTL.shiTiLeiDH == null){
											LUI.Message.info("信息","字段("+childZdDef.ziDuanDH+":"+childZdDef.ziDuanBT+")的关联实体类中实体类代号字段为空!");
											return ;
										}
										currentShiTiLeiDef = LUI.PageDesigner.instance.getShiTiLeiDefByDH(childZdDef.guanLianSTL.shiTiLeiDH);
									}else if(k +1 <zddhArray.length){
										//还有下级 但当前字段不支持
										LUI.Message.info("信息","字段("+childZdNode.data.ziDuanDH+")非对象或集合字段!");
										return ;
									}
								}
							}
						}
						
						//展开当前添加了字段的节点
						if(newNode!=null){
							LUI.PageDesigner.instance._pageCmpTree.expandNode(fieldsNode,true);
						}
					}
				},
				//添加组件节点
				addComponentNode:function(parentNode,component_name,nodeLabel){
					var component_def = LUI.PageDesigner.instance._components[component_name];
					if(component_def==null){
						LUI.Message.info("信息","此组件（"+component_name+"）不存在!");
						return null;
					}
					var type_def = LUI.PageDesigner.instance._types[component_def.type];
					//节点的数据
					var nodeData = {
						_isValid:true,
						component:component_def.name,
						xmlElName:component_def.xmlElName
					};
					//为节点数据赋初值
					
					var allArray = [].concat(type_def.properties||[])
						.concat(type_def.extensions||[])
						.concat(component_def.properties||[])
						.concat(component_def.extensions||[]);
					for(var i=0;i<allArray.length;i++){
						var p = allArray[i];
						if(p['default']!=null && p['default'].length >0){
							nodeData[p.name] = p['default'];
						}
					}
					//节点的显示值
					var nodeText = component_def.label;
					if(nodeLabel!=null && nodeLabel!= nodeText){
						nodeText = nodeText+"("+nodeLabel+")";
					}
					//当前选中的节点  与要添加的控件 之间的依赖关系已在显示菜单时检查 此处默认是正确的 
					var newNodeArray = LUI.PageDesigner.instance._pageCmpTree.addNodes(parentNode,{
						name:nodeText, 
						component:component_def,
						form:{},
						data:nodeData
					},true);
					//为可能存在的 name和label赋初值（如果此节点不需要此值也没关系 不会被显示和保存）
					newNodeArray[0].data.name = 'cmp_'+component_def.name+'_'+newNodeArray[0].tId.substr(25);
					newNodeArray[0].data.label = nodeText;
//					LUI.PageDesigner.instance._pageCmpTree.selectNode(newNodeArray[0],false);
					//是否需要添加结构节点
					var structureDef = [].concat(type_def.structure||[]).concat(component_def.structure||[]);
					for(var i=0;i<structureDef.length;i++ ){
						var structureName = structureDef[i]['component-name'];
						if(structureName==null){
							LUI.Message.info("添加结构节点错误","组件("+component_name+")或类型("+component_def.type+")的结构定义中，未定义component-name属性!");
							break;
						}
						var structure_component_def = LUI.PageDesigner.instance._components[structureName];
						if(structure_component_def == null){
							LUI.Message.info("添加结构节点错误","未找到组件("+structureName+")定义!");
							break;
						}
						if(structure_component_def.isArray == "true"){
							LUI.PageDesigner.instance._pageCmpTree.addNodes(newNodeArray[0],{
								name:structure_component_def.label, 
								component:structure_component_def,
								form:{},
								data:{
									_isValid:true,
									component:structure_component_def.name
								}
							},true);
						}else{
							//这里假设组件下的结构节点非数组的情况只有一种：私有数据源
							this.addComponentNode(newNodeArray[0],structureName,nodeLabel+'-'+structure_component_def.label);
						}
					}
					return newNodeArray[0];
				},
				checkComponentItemStatus:function(componentName,itemComponentName){
					var itemEnable = false;

					var cmpComponentDef = LUI.PageDesigner.instance._components[componentName];
					
					var itemComponentDef = LUI.PageDesigner.instance._components[itemComponentName];
					if(itemComponentDef.dependencies!=null){
						for(var i=0;i< itemComponentDef.dependencies.length;i++){
							var itemDependency = itemComponentDef.dependencies[i];
							if(itemDependency['type-name'] == cmpComponentDef.type || itemDependency['component-name'] == componentName ){
								itemEnable = true;
								break;
							}
						}
					}
					
					var itemTypeDef = LUI.PageDesigner.instance._types[itemComponentDef.type];
					if(!itemEnable && itemTypeDef.dependencies!=null){
						for(var i=0;i< itemTypeDef.dependencies.length;i++){
							var itemDependency = itemTypeDef.dependencies[i];
							if(itemDependency['type-name'] == cmpComponentDef.type || itemDependency['component-name'] == componentName ){
								itemEnable = true;
								break;
							}
						}
					}
					return itemEnable;
				},
				setMenuOptionStatus:function(componentName){
					var cmpComponentDef = null;
					if(componentName == null ){
						cmpComponentDef = LUI.PageDesigner.instance._components['page'];
					}else{
						cmpComponentDef = LUI.PageDesigner.instance._components[componentName];
					}
					//取得当前节点的定义
					$("#_designer-tools-add-menu").children("li").each(function(index,element){
						//当前menuItem的type
						var itemTypeName = $(this).attr("_type_name");
						var itemTypeDef = LUI.PageDesigner.instance._types[itemTypeName];
						
						var itemEnable = false;
						if($(this).attr('_component_name')==null){
							if($(this).find("li").length>0){
								//type类型的节点  检查下面的component节点
								$(this).find("li").each(function(index,element){
									var itemComponentName = $(this).attr('_component_name');
									if(LUI.PageDesigner.instance.checkComponentItemStatus(componentName,itemComponentName)){
										itemEnable = true;
										$(this).removeClass("ui-state-disabled");
									}else{
										$(this).addClass("ui-state-disabled");
									}
								});
							}else{
								//类似_field的辅助节点
								if(itemTypeDef.dependencies!=null){
									var cmpComponentDef = LUI.PageDesigner.instance._components[componentName];
									for(var i=0;i< itemTypeDef.dependencies.length;i++){
										var itemDependency = itemTypeDef.dependencies[i];
										if(itemDependency['type-name'] == cmpComponentDef.type || itemDependency['component-name'] == componentName ){
											itemEnable = true;
											break;
										}
									}
								}
							}
							
							//设置当前menuItem的enabled属性
							if(itemEnable){
								$(this).removeClass("ui-state-disabled");
							}else{
								$(this).addClass("ui-state-disabled");
							}
						}else{
							//component类型的节点
							var itemComponentName = $(this).attr('_component_name');
							if(LUI.PageDesigner.instance.checkComponentItemStatus(componentName,itemComponentName)){
								itemEnable = true;
								$(this).removeClass("ui-state-disabled");
							}else{
								$(this).addClass("ui-state-disabled");
							}
						}
					});
				},
//				onComponentNodeDblClick:function(){
//				},
				findFieldByNode:function(node,notWarn){
					var arrayNode = node.getParentNode();
					if(arrayNode!=null && arrayNode.component!=null && arrayNode.component.type == 'fields'){
						var formNode = arrayNode.getParentNode();
						if(formNode.component.type == 'form'){
							//确认是表单中的字段节点
							//查找对应的表单和字段实例
							var formInst = LUI.Form.getInstance(formNode.data.name);
							if(formInst!=null && formInst.getField!=null){
								var fieldInst = formInst.getField(node.data.name,notWarn);
								return fieldInst;
							}
							
						}
					}else if(arrayNode!=null && arrayNode.component!=null && arrayNode.component.type == 'columns'){
						var gridNode = arrayNode.getParentNode();
						if(gridNode.component.name == 'editGrid'){
							//确认是表格中的字段节点
							//查找对应的表格和字段实例
							var gridInst = LUI.Grid.getInstance(gridNode.data.name);
							if(gridInst!=null){
								var cellInst = gridInst.rows[0].getCell(node.data.name);
								if(cellInst!=null){
									return cellInst.field;
								}
							}
						}
					
					}
					return null;
				},
				onComponentNodeSelected:function(selectedNode){
					if(this._editingNode!=null){
						if(this._editingNode == selectedNode){
							//选中正在编辑的节点 什么都不需要做
							return;
						}
						//如果当前正在编辑  取消编辑
						if(this._editingNode.form.properties_1!=null){
							this._editingNode.form.properties_1.deRender();
						}
						if(this._editingNode.form.properties_2!=null){
							this._editingNode.form.properties_2.deRender();
						}
						if(this._editingNode.form.extensions_1!=null){
							this._editingNode.form.extensions_1.deRender();
						}
						if(this._editingNode.form.extensions_2!=null){
							this._editingNode.form.extensions_2.deRender();
						}
						if(this._editingNode.form.events_1!=null){
							this._editingNode.form.events_1.deRender();
						}
						if(this._editingNode.form.events_2!=null){
							this._editingNode.form.events_2.deRender();
						}
						//取消resizable
						var fieldInst = this.findFieldByNode(this._editingNode,true);
						if(fieldInst!=null){
							fieldInst.setSizeDesignable(this._editingNode,false);
						}
					}
					//记录最新编辑节点
					this._editingNode = selectedNode;
					//如果选中了表单中的字段节点 自动将对应的字段元素设为resizable
					var fieldInst = this.findFieldByNode(selectedNode,true);
					if(fieldInst!=null){
						fieldInst.setSizeDesignable(selectedNode,true);
					}
					//根据节点的isRemovable属性 确定删除按钮状态
					LUI.PageDesigner.instance._removeComponentBtn.button( "disable");
					LUI.PageDesigner.instance._addComponentBtn.button( "disable");
//					LUI.PageDesigner.instance._gnComponentBtn.button( "disable");
//					LUI.PageDesigner.instance._stlComponentBtn.button( "disable");
					
					if(selectedNode.component==null){
						//结构节点
						LUI.PageDesigner.instance._addComponentBtn.button( "enable");
						LUI.PageDesigner.instance._removeComponentBtn.button( "enable");
						
						LUI.PageDesigner.instance._designerPanel.close('south');
					}else if(selectedNode.component.type!='log'){
						//根据节点的type确定 功能 实体类 按钮的 状态
//						if(selectedNode.component.type == 'datastore'){
//							LUI.PageDesigner.instance._gnComponentBtn.button( "enable");
//							LUI.PageDesigner.instance._stlComponentBtn.button( "enable");
//						}
						
						//根据节点的isRemovable属性 确定删除按钮状态
						if(selectedNode.component.isRemovable == "true"){
							LUI.PageDesigner.instance._removeComponentBtn.button( "enable");
						}
						LUI.PageDesigner.instance._addComponentBtn.button( "enable");
						
						
						if(selectedNode.component.isEditable != 'true'){
							LUI.PageDesigner.instance._designerPanel.close('south');
						}else if(LUI.PageDesigner.instance._propertyToggleBtn.checked){
							//可以编辑的节点 且属性页面为打开状态 
							//显示节点内容进行编辑
							LUI.PageDesigner.instance.applyDataToForm(selectedNode);
							if(LUI.PageDesigner.instance._designerPanel.south.state.isClosed){
								LUI.PageDesigner.instance._designerPanel.open('south');
							}
						}

					}else{
						//log节点 不允许编辑
						LUI.PageDesigner.instance._designerPanel.close('south');
					}
					
					
				},
				applyDataToForm:function(selectedNode){
					//创建编辑表单 使用当前节点的数据为表单赋值
					var componentName = selectedNode.component.name;
					
//					$( ".selector" ).tabs( "instance" )
//					var this._tabs.tabs( "instance" );
					
					var typeName = selectedNode.component.type;
					var typeDef = LUI.PageDesigner.instance._types[typeName];
					
					var typePropertiesArray = typeDef.properties||[];
					var typeExtensionsArray = typeDef.extensions||[];
					var typeEventArray = typeDef.events||[];
					var componentPropertiesArray = selectedNode.component.properties||[];
					var componentExtensionsArray = selectedNode.component.extensions||[];
					var componentEventArray = selectedNode.component.events||[];
					
					var itemRecord = selectedNode.record;
					if(itemRecord==null){
						//创建新的record 记录在节点上
						itemRecord = LUI.Record.createNew(
							[].concat(
								typePropertiesArray,typeExtensionsArray,typeEventArray,
								componentPropertiesArray,componentExtensionsArray,componentEventArray
							),
							"none"
						);
						itemRecord.loadData(selectedNode.data);
						selectedNode.record = itemRecord;
						
						//name字段发生变化时 重新显示节点名称
						itemRecord.addListener(itemRecord.events.change,selectedNode,function(record,node,event){
							//监听 name、label字段的变化  更新节点的显示值
//							var codeText = '';
//							if(record.hasField('name')){
//								codeText = record.getFieldValue('name');
//							}
//							
//							var nodeText = codeText;
//							if(record.hasField('label')){
//								nodeText = record.getFieldValue('label');
//							}
//							if(nodeText!=null){
//								node.name = node.component.label+"("+nodeText+")";
//							}else{
//								node.name = node.component.label;
//							}
							//监听 name、label字段的变化  更新节点的显示值
							if(record.hasField('label')){
								node.name = node.component.label+"("+(record.getFieldValue('label')||'')+")";
							}else if(record.hasField('name')){
								node.name = node.component.label+"("+(record.getFieldValue('name')||'')+")";
							}else{
								node.name = node.component.label;
							}
							LUI.PageDesigner.instance._pageCmpTree.updateNode(node);
							
							//更新node.data中的值 
							node.data[event.params.fieldName] = record.getFieldValue(event.params.fieldName);
							
							//通过与当前节点关联的form 判断当前节点是否有效
							LUI.PageDesigner.instance.validateNode(node);
							//允许保存
							LUI.PageDesigner.instance._saveComponentBtn.button( "enable");
							
							////////////////////////////////////////
						});
					}
					
					//基础属性 form1(type.properties)
					if(selectedNode.form.properties_1==null){
						if(typePropertiesArray.length >0){
							selectedNode.form.properties_1 = LUI.Form.createNew({
								name:selectedNode.tId+'_properties_form1',
								renderto:'#_designer_tab_properties_form1',
								fields:typePropertiesArray
							},true);
							selectedNode.form.properties_1.render();
							selectedNode.form.properties_1.bindRecord(itemRecord);
						}
					}else{
						selectedNode.form.properties_1.render();
					}
					
					
					//扩展属性 form2(component.properties)
					if(selectedNode.form.properties_2==null){
						if(componentPropertiesArray.length >0){
							selectedNode.form.properties_2 = LUI.Form.createNew({
								name:selectedNode.tId+'_properties_form2',
								renderto:'#_designer_tab_properties_form2',
								fields:componentPropertiesArray
							},true);
							selectedNode.form.properties_2.render();
							selectedNode.form.properties_2.bindRecord(itemRecord);
						}
					}else{
						selectedNode.form.properties_2.render();
					}
					this._tabs.tabs("enable", 0 );

					
					//基础属性form1(type.extensions)
					var hasExtensions = "disable";
					if(selectedNode.form.extensions_1==null ){
						if(typeExtensionsArray.length >0){
							selectedNode.form.extensions_1 = LUI.Form.createNew({
								name:selectedNode.tId+'_extensions_form1',
								renderto:'#_designer_tab_extensions_form1',
								fields:typeExtensionsArray
							},true);
							selectedNode.form.extensions_1.render();
							selectedNode.form.extensions_1.bindRecord(itemRecord);
							hasExtensions = "enable";
						}
					}else{
						selectedNode.form.extensions_1.render();
						hasExtensions = "enable";
					}
					
					
					//扩展属性form2(component.extensions)
					if(selectedNode.form.extensions_2==null ){
						if(componentExtensionsArray.length >0){
							selectedNode.form.extensions_2 = LUI.Form.createNew({
								name:selectedNode.tId+'_extensions_form2',
								renderto:'#_designer_tab_extensions_form2',
								fields:componentExtensionsArray
							},true);
							selectedNode.form.extensions_2.render();
							selectedNode.form.extensions_2.bindRecord(itemRecord);
							hasExtensions = "enable";
						}
					}else{
						selectedNode.form.extensions_2.render();
						hasExtensions = "enable";
					}
					this._tabs.tabs(hasExtensions, 1 );
					
					
					//事件form1(type.events)
					var hasEvents = "disable";
					if(selectedNode.form.events_1==null){
						if( typeEventArray.length >0){
							selectedNode.form.events_1 = LUI.Form.createNew({
								name:selectedNode.tId+'_events_form1',
								renderto:'#_designer_tab_events_form1',
								fields:typeEventArray
							},true);
							selectedNode.form.events_1.render();
							selectedNode.form.events_1.bindRecord(itemRecord);
							hasEvents = "enable";
						}
					}else{
						selectedNode.form.events_1.render();
						hasEvents = "enable";
					}
					
					//扩展事件form2(component.events)
					if(selectedNode.form.events_2==null ){
						if( componentEventArray.length >0){
							selectedNode.form.events_2 = LUI.Form.createNew({
								name:selectedNode.tId+'_events_form2',
								renderto:'#_designer_tab_events_form2',
								fields:componentEventArray
							},true);
							selectedNode.form.events_2.render();
							selectedNode.form.events_2.bindRecord(itemRecord);
							hasEvents = "enable";
						}
					}else{
						selectedNode.form.events_2.render();
						hasEvents = "enable";
					}
					this._tabs.tabs(hasEvents, 2 );
					
					this._tabs.tabs("enable", 3 );
					
					if((this._tabs_active_index == 1 && hasExtensions == 'disable') || (this._tabs_active_index == 2 && hasEvents == 'disable')){
						this._tabs_active_index =0;
					}
					
					this._tabs.tabs({ active: this._tabs_active_index });
					
					//通过与当前节点关联的form 判断当前节点是否有效
					LUI.PageDesigner.instance.validateNode(selectedNode);
				},
				validateNode:function(node){
					var itemValid = true;
					if(node.form.properties_1!=null && !node.form.properties_1.isValid()){
						itemValid = false;
					}else if(node.form.properties_2!=null && !node.form.properties_2.isValid()){
						itemValid = false;
					}else if(node.form.extensions1!=null && !node.form.extensions1.isValid()){
						itemValid = false;
					}else if(node.form.extensions2!=null && !node.form.extensions2.isValid()){
						itemValid = false;
					}else if(node.form.events1!=null && !node.form.events1.isValid()){
						itemValid = false;
					}else if(node.form.events2!=null && !node.form.events2.isValid()){
						itemValid = false;
					}
					
					if(!itemValid){
						LUI.PageDesigner.instance.setInvalid(node);
					}else{
						LUI.PageDesigner.instance.clearInvalid(node);
					}
				},
				//根据从服务器加载的页面配置信息 构建功能树
				applyDataToTree:function(treeData){
					var treeChildData = treeData.children;
					delete treeData["children"];  
					
					var pageNode = LUI.PageDesigner.instance.findPageNode();
					treeData._isValid = true;
					pageNode.data = $.extend(pageNode.data,treeData);
					pageNode.component = LUI.PageDesigner.instance._components[pageNode.data.component];
					
					if(treeChildData!=null){
						for(var i=0;i<treeChildData.length;i++){
							var cmpName = treeChildData[i].component;
//							//兼容老代码
//							if(cmpName == ''){
//								cmpName = treeChildData[i].fieldType + 'Display';
//							}
							//
							var component_def = LUI.PageDesigner.instance._components[cmpName];
							if(component_def==null){
								LUI.Message.info("信息","component("+cmpName+")定义不存在!");
							}
							var type_def = LUI.PageDesigner.instance._types[component_def.type];
							if(component_def==null){
								LUI.Message.info("信息","type("+component_def.type+")定义不存在!");
							}
							//检查分组节点是否存在 不存在的话创建一个
							var typeStructureNode = LUI.PageDesigner.instance.findTypeStructureNode(component_def.type);
							if(typeStructureNode==null){
								typeStructureNode = LUI.PageDesigner.instance.addTypeStructureNode(type_def);
							}
							LUI.PageDesigner.instance.appendDataToNode(typeStructureNode,treeChildData[i]);
						}
					}
					//页面上只会有一个page节点
					LUI.PageDesigner.instance._pageCmpTree.expandNode(pageNode);
					LUI.PageDesigner.instance._pageCmpTree.selectNode(pageNode);
					LUI.PageDesigner.instance.onComponentNodeSelected(pageNode);
					//根据_pageCmpData 在树_pageCmpTree中添加对象结构
					//$.fn.zTree.init(this._pageCmpTree, setting, zNodes);
				},
				hasProperty:function(node,propertyName){
					var component_def = node.component;
					var type_def = LUI.PageDesigner.instance._types[component_def.type];
					
					var allArray = [].concat(type_def.properties||[])
						.concat(type_def.extensions||[])
						.concat(type_def.events||[])
						.concat(component_def.properties||[])
						.concat(component_def.extensions||[])
						.concat(component_def.events||[])
						;
					for(var j=0;j<allArray.length;j++){
			 			if(allArray[j].name == propertyName){
			 				return true;
			 			}
			 		}
					return false;
				},
				appendDataToNode:function(parentNode,nodeData){
					var cmpName = nodeData.component;
					//兼容老的代码
					if(cmpName == 'gnFilters' || cmpName == 'stlFilters'){
						cmpName = 'filters';
					}else if(cmpName == 'gnProperties' || cmpName == 'stlProperties' || cmpName == 'sqlProperties'|| cmpName == 'todoProperties'){
						cmpName = 'properties';
					}else if (cmpName == 'gnSorts' || cmpName == 'stlSorts'){
						cmpName = 'sorts';
					}else if(cmpName == 'gnComplexProperty' || cmpName == 'stlComplexProperty'){
						cmpName = 'complexProperty';
					}else if(parentNode.component!=null && parentNode.component.name == 'formFields' && (cmpName == 'simpleField' || cmpName == 'complexField')){
						cmpName = nodeData.fieldType+'Display';
					}
					nodeData.component = cmpName;
					//--
					var component_def = LUI.PageDesigner.instance._components[cmpName];
					if(component_def == null){
						LUI.Message.info("创建节点失败","component("+cmpName+")定义不存在!");
						console.error('错误:创建节点失败,component('+cmpName+')定义不存在!');
						return;
					}
					var type_def = LUI.PageDesigner.instance._types[component_def.type];
					var nodeChildData = nodeData.children;
					delete nodeData["children"];  
					
					//节点信息默认是有效的
					nodeData._isValid = true;
					var nodeText = nodeData.label||nodeData.code;
					if(nodeText!=null){
						nodeText = component_def.label+"("+nodeText+")";
					}else{
						nodeText = component_def.label;
					}
					var newNodeArray = LUI.PageDesigner.instance._pageCmpTree.addNodes(parentNode,{
						name:nodeText, 
						component:component_def,
						form:{},
						data:nodeData
					},true);
					if(nodeChildData!=null){
						for(var i=0;i<nodeChildData.length;i++){
							this.appendDataToNode(newNodeArray[0],nodeChildData[i]);
						}
					}
				},
				componentDefineLoaded:function(data){
					if(data.success){
						this._types = data.types;
						this._components = data.components;
						
//						this._editorTypes = data.editorTypes;
//						this._editors = data.editors;
						
						this.createTypeMenu();
						
						var page_component_def = LUI.PageDesigner.instance._components.page;

						//创建页面配置树的基础架构...就两个节点-->
						this._pageCmpTree = $.fn.zTree.init($('#_designer').find("#_designer-component-tree"), {
							view: {
								selectedMulti: false
							},
							callback:{
								onClick:function(event,treeId,node){
									LUI.PageDesigner.instance.onComponentNodeSelected(node);
								},
								onDblClick:this.onComponentNodeDblClick,
								onRemove:this.onComponentNodeRemoved
							}
						}, [{
							name:"页面",isParent:true,open:false,
//							iconSkin:"designer-tree-page",
							component:page_component_def,
							form:{},
							data:{
								component:'page',
								_isValid:false
							}
						},{
							name:"日志",isParent:true,open:false,
//							iconSkin:"designer-tree-changelog",
							component:{
								name:'log'
							},
							form:{},
							data:{
								component:'log',
								_isValid:true
							}
						}]);
						//创建控件信息tab ：属性页、事件页...-->
						this._tabs = $('#_designer').find("#_designer_tabs" );
						this._tabs_active_index = 0;
						var _this = this;
						this._tabs.tabs({ 
							heightStyle: "fill",
							activate: function( event, ui ) {
								_this._tabs_active_index = ui.newTab.index();
							}
						});
						
						//隐藏控件信息tab...-->
						this.loadPageDefine(_pageInfo.xmlPage);

					}else{
						alert("加载组件定义失败："+data.errorMsg);
					}
				},
				onComponentNodeRemoved:function zTreeOnRemove(event, treeId, treeNode) {
					//删除了节点 要清除listener
					if(treeNode.record!=null){
						//清除监听事件
						treeNode.record.removeListener(treeNode.record.events.change,treeNode);
					}
				},
				//查找page节点
				findPageNode:function(){
					var nodes = LUI.PageDesigner.instance._pageCmpTree.getNodes();
					for(var i=0;i<nodes.length;i++ ){
						var node = nodes[i];
						if(node.component && node.component.type == 'page'){
							return node;
						}
					}
					return null;
				},
				//查找某类型对应的分组节点
				findTypeStructureNode:function(typeName){
					var _cTypeName = typeName;
					if(_cTypeName == 'variable' || _cTypeName == 'record' || _cTypeName == 'dataset' ){
						_cTypeName = 'datasource';
					}
					
					var typeStructureNode = LUI.PageDesigner.instance._pageCmpTree.getNodesByFilter(function(node){
						//component属性为空且type属性符合条件的节点
						return node.component==null && node.type.name == _cTypeName;
					}, true); // 仅查找一个节点
					return typeStructureNode;
				},
				//查找所有数据源节点
				findDatasourceNodes:function(){
					var datasourceNodes = LUI.PageDesigner.instance._pageCmpTree.getNodesByFilter(function(node){
						return node.component!=null && (node.component.type == 'record' || node.component.type == 'dataset')
					});
					return datasourceNodes;
				},
				/**
				 * 根据控件节点 查找数据源下 关联字段名称 yongHu.buMen.buMenMC
				 */
				getPropertyByNode:function(node){
					var propertyName = null;
					//字段   取数据源实体类 
					var cmpNode = node;
					//一直取到上级非结构节点 如果上级节点是数据源节点 也不用再取了
					while(cmpNode.getParentNode()!=null && cmpNode.getParentNode().component!=null 
						&&　cmpNode.getParentNode().component.type !='page' &&　
						cmpNode.getParentNode().component.type != 'record' && cmpNode.getParentNode().component.type != 'dataset' ){
						if(cmpNode.component.type == 'complexProperty' //数据源中的字段
							|| cmpNode.component.type == 'complexField' //form中的字段
							|| cmpNode.component.type == 'setField' ){//是表单中的集合字段
							if(propertyName==null){
								propertyName = cmpNode.data.name
							}else{
								propertyName = cmpNode.data.name+"."+propertyName
							}
						}
						cmpNode = cmpNode.getParentNode();
					}
					return propertyName;
				},
				/**
				 * 根据数据源名称 在组件树种取得数据源定义节点
				 */
				getDatasourceNodeByName:function(datasourceName){
					var dsNodes = LUI.PageDesigner.instance.findDatasourceNodes();
					for(var i=0;i<dsNodes.length;i++ ){
						if(dsNodes[i].data.name == datasourceName){
							return dsNodes[i];
						}
					}
					return null;
				},
				/**
				 * 根据控件节点 查找关联的数据源节点
				 */
				getDatasourceBySelectedNode:function(node){
					var datasourceNode = null;
					//字段   取数据源实体类 
					var cmpNode = node;
					//取到上级非结构节点 存在上级节点 且上级节点不是结构节点 且上级节点不是根节点
					while(cmpNode.getParentNode()!=null && cmpNode.getParentNode().component!=null && cmpNode.getParentNode().component.type !='page'){
						cmpNode = cmpNode.getParentNode();
						var typeName = cmpNode.component.type;
						var componentName = cmpNode.component.name;
						if( typeName == 'record' || typeName == 'dataset' ){
							datasourceNode = cmpNode;
							break;
						}else if(typeName == 'grid'  || typeName == 'tree' 
							|| componentName == 'tabGenerator' || componentName == 'searchToGrid' 
							|| componentName == 'singleEditForm' || componentName == 'dataDisplayForm' || componentName == 'workflowForm'){
							if(cmpNode.data.datasourceType == 'public' || cmpNode.data.datasourceType == null){
								datasourceNode = this.getDatasourceNodeByName(cmpNode.data.datasourceName);
							}else{
								//在下级节点中 查找数据源节点。。。
								if(cmpNode.children!=null && cmpNode.children.length >0){
									for(var i=0;i<cmpNode.children.length;i++){
										var subComponentName = cmpNode.children[i].data.component;
										var subComponent_def = LUI.PageDesigner.instance._components[subComponentName];
										if(subComponent_def.type == 'dataset' || subComponent_def.type == 'record'){
											datasourceNode = cmpNode.children[i];
//											datasourceNode.data.name = cmpNode.data.name+'_datasource_';
											break;
										}
									}
								}
							}
							break;
						}else if ( typeName == 'objectField' && (cmpNode.data.datasourceType == 'public' || cmpNode.data.datasourceType == null)){
							//对象类型的数据源 只有在使用公共数据源的时候 才会到这里
							datasourceNode = this.getDatasourceNodeByName(cmpNode.data.datasourceName);
							break;
						}
					}
					return datasourceNode;
				},
				loadPageDefine:function(pageUrl){
					$.ajax({
						url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
						type: "POST", 
						data:{
							component:'nim-plateform',
							service:'designer',
							method:'readPageDef',
							arguments:"{" +
									"pageUrl:'"+pageUrl+"'" +
							"}"
						},
						dataType:"json",
						context:this,
						success: function(data){
							if(data.success){
								this.applyDataToTree(data.pageDef);
							}else{
								alert("加载页面配置信息失败："+data.errorMsg);
							}
						},
						error:function(){
							alert("加载页面配置信息失败："+"访问服务器失败！");
						}
					});
				},
				getComponentNode:function(node){
					//找到它的控件节点
					var cmpNode = node;
					while(cmpNode.getParentNode()!=null && cmpNode.getParentNode().component !=null ){
						cmpNode = cmpNode.getParentNode();
					}
					return cmpNode;
				},
				getFormField:function(node,fieldName){
					var field = null
					if(field == null && node.form.properties_1!=null && node.form.properties_1.hasField(fieldName)){
						field = node.form.properties_1.getField(fieldName);
					}
					if(field == null && node.form.properties_2!=null && node.form.properties_2.hasField(fieldName)){
						field = node.form.properties_2.getField(fieldName);
					}
					if(field == null && node.form.extensions_1!=null && node.form.extensions_1.hasField(fieldName)){
						field = node.form.extensions_1.getField(fieldName);
					}
					if(field == null && node.form.extensions_2!=null && node.form.extensions_2.hasField(fieldName)){
						field = node.form.extensions_2.getField(fieldName);
					}
					if(field == null && node.form.events_1!=null && node.form.events_1.hasField(fieldName)){
						field = node.form.events_1.getField(fieldName);
					}
					if(field == null && node.form.events_2!=null && node.form.events_2.hasField(fieldName)){
						field = node.form.events_2.getField(fieldName);
					}
					return field;
				}
			};
		}
		return LUI.PageDesigner.instance;
	},
	_designerContent:'<div class="ui-layout-north" style="overflow: hidden;">'+
						'<button id="_designer-tools-add-node" title="新增...">+</button>'+
						'<button id="_designer-tools-remove-node">删除</button>'+
						'<button id="_designer-tools-save">保存</button>'+
						'<button id="_designer-tools-gn-node">打开功能列表</button>'+
						'<button id="_designer-tools-stl-node">打开实体类列表</button>'+
						'<input id="_designer-tools-property-toggle" type="checkbox" checked  >' +
						'	<label for="_designer-tools-property-toggle" style="height:24px" title="显示/隐藏属性窗口"></label>'+
						'<input id="_designer-tools-orginal-toggle" type="checkbox" >' +
						'	<label for="_designer-tools-orginal-toggle" style="height:24px" title="切换原始页面选择"></label>'+
						'<span style="float:right;">'+
							'<button id="_designer-tools-edit-html-btn" title="编辑HTML文件">H</button>'+
							'<button id="_designer-tools-edit-css-btn" title="编辑CSS文件">C</button>'+
							'<button id="_designer-tools-edit-js-btn" title="编辑JS文件">J</button>'+
							'<button id="_designer-tools-edit-xml-btn" title="编辑XML文件">X</button>'+
						'</span>'+
					'</div>'+
					'<div class="ui-layout-center" style="border-bottom:1px solid #8db2e3;padding: 0px;">'+
						'<ul id="_designer-component-tree" class="ztree"></ul>'+
//						'<div style="border:1px solid #8db2e3;width: 200px;height: 200px;">'+
//							'asdasd'+
//						'</div>'+
					'</div>'+
					'<div class="ui-layout-south" style="border-top:1px solid #8db2e3;">'+
						'<div id="_designer_tabs" style="font-size: 12px;border:0px;padding:0px;">'+
							'<ul>'+
								'<li><a href="#_designer_tab_properties">属性</a></li>'+
								'<li><a href="#_designer_tab_extensions">扩展</a></li>'+
								'<li><a href="#_designer_tab_events">事件</a></li>'+
								'<li><a href="#_designer_tab_changelog">日志</a></li>'+
								'<li><a href="#_designer_tab_comment">备注</a></li>'+
							'</ul>'+
							'<div id="_designer_tab_properties">'+
								'<div id="_designer_tab_properties_form1"></div>'+
								'<div id="_designer_tab_properties_form2"></div>'+
							'</div>'+
							'<div id="_designer_tab_extensions">'+
								'<div id="_designer_tab_extensions_form1"></div>'+
								'<div id="_designer_tab_extensions_form2"></div>'+
							'</div>'+
							'<div id="_designer_tab_events">'+
								'<div id="_designer_tab_events_form1"></div>'+
								'<div id="_designer_tab_events_form2"></div>'+
							'</div>'+
							'<div id="_designer_tab_changelog"></div>'+
							'<div id="_designer_tab_comment"></div>'+
						'</div>'+
					'</div>'+
					'<ul id="_designer-tools-add-menu" style="z-index:3;width: 110px;" ></ul>'+
					'<div id="_designer-tools-stl-window" title="选择字段">'+
						'<input id="_designer-tools-stl-search" style="">'+
						'<ul id="_designer-tools-stl-tree" class="ztree"></ul>'+
					'</div>'
};


/**
 * 监听Component字段的变化  需要做如下处理
 * @param oldComponentName
 * @param newComponentName
 */
function refreshExtendForm(eventSource,eventTarget,event,eventOriginal){
	var oldComponentName = event.params.oldValue;
	var newComponentName = event.params.newValue;
	if(!event.params.isInitial){
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var node = selectedNodes[0];
		node.data.component = newComponentName;
		node.component = LUI.PageDesigner.instance._components[newComponentName];
		//record对Component字段的监听和对值的更新 有可能晚于本事件 需要手动设置
		node.record.setFieldValue('component',newComponentName,true);
		////////////////////////////////////////////////////////////
		//更新节点的显示值
		var nodeText = node.data.label||node.data.name;
		if(nodeText!=null){
			node.name = node.component.label+"("+nodeText+")";
		}else{
			node.name = node.component.label;
		}
		LUI.PageDesigner.instance._pageCmpTree.updateNode(node);
		////////////////////////////////////////////////////////////
		
		var typeDef = LUI.PageDesigner.instance._types[node.component.type];
		
		var componentPropertiesArray = node.component.properties||[];
		var componentExtensionsArray = node.component.extensions||[];
		var componentEventsArray = node.component.events||[];
		
		var allArray = [].concat(typeDef.properties||[])
			.concat(typeDef.extensions||[])
			.concat(node.component.properties||[])
			.concat(node.component.extensions||[])
			.concat(typeDef.events||[])
			.concat(node.component.events||[])
			;
		
		//重新创建基础属性2
		if(node.form.properties_2!=null) node.form.properties_2.destroy();
		if(componentPropertiesArray.length >0){
			node.form.properties_2 = LUI.Form.createNew({
				name:node.tId+'_properties_form2',
				renderto:'#_designer_tab_properties_form2',
				fields:componentPropertiesArray
			},true);
			
			for(var i=0;i<componentPropertiesArray.length;i++){
				var componentProperty = componentPropertiesArray[i];
				if(!node.record.hasField(componentProperty.name)){
					if(componentProperty['default']!=null && componentProperty['default'].length >0){
						node.record.data[componentProperty.name] = componentProperty['default'];
					}
					node.record.addField(componentProperty);
				}
			}
			node.form.properties_2.render();
			node.form.properties_2.bindRecord(node.record);
		}
		
		//重新创建扩展属性2
		var hasExtensions = (typeDef.extensions!=null && typeDef.extensions.length >0)?"enable":"disable";
		if(node.form.extensions_2!=null) node.form.extensions_2.destroy();
		if(componentExtensionsArray.length >0){
			node.form.extensions_2 = LUI.Form.createNew({
				name:node.tId+'_extensions_form2',
				renderto:'#_designer_tab_extensions_form2',
				fields:componentExtensionsArray
			},true);
			
			for(var i=0;i<componentExtensionsArray.length;i++){
				var componentExtension = componentExtensionsArray[i];
				if(!node.record.hasField(componentExtension.name)){
					if(componentExtension['default']!=null && componentExtension['default'].length >0){
						node.record.data[componentExtension.name] = componentExtension['default'];
					}
					node.record.addField(componentExtension);
				}
			}
			node.form.extensions_2.render();
			node.form.extensions_2.bindRecord(node.record);
			hasExtensions = "enable";
		}
		LUI.PageDesigner.instance._tabs.tabs(hasExtensions, 1 );

		//重新创建events属性2
		var hasEvents = (typeDef.events!=null && typeDef.events.length >0)?"enable":"disable";
		if(node.form.events_2!=null) node.form.events_2.destroy();
		if(componentEventsArray.length >0){
			node.form.events_2 = LUI.Form.createNew({
				name:node.tId+'_events_form2',
				renderto:'#_designer_tab_events_form2',
				fields:componentEventsArray
			},true);
			
			for(var i=0;i<componentEventsArray.length;i++){
				if(!node.record.hasField(componentEventsArray[i].name)){
					node.record.addField(componentEventsArray[i]);
				}
			}
			node.form.events_2.render();
			node.form.events_2.bindRecord(node.record);
			hasEvents = "enable";
		}
		LUI.PageDesigner.instance._tabs.tabs(hasEvents, 2 );
		//添加或删除下级节点
		var structureDef = [].concat(typeDef.structure||[]).concat(node.component.structure||[]);
		//删除下级节点(只删除已经不存在的节点)
		if(node.children!=null && node.children.length > 0){
			for(var k= node.children.length-1;k>=0;k--){
				var cNode = node.children[k];
				var isExsits = false;
				for(var i=0;i<structureDef.length;i++){
					var structureName = structureDef[i]['component-name'];
					var structure_component_def = LUI.PageDesigner.instance._components[structureName];
					if(structure_component_def != null && cNode.component.type == structure_component_def.type){
						isExsits = true;
						break;
					}
				}
				if(!isExsits){
					LUI.PageDesigner.instance._pageCmpTree.removeNode(cNode,true);
				}
			}
		}
		//添加下级节点(只添加不存在的节点)
		if(structureDef.length > 0 ){
			//添加下级节点
			for(var i=0;i<structureDef.length;i++ ){
				var structureName = structureDef[i]['component-name'];
				if(structureName==null){
					LUI.Message.info("添加结构节点错误","组件("+component_name+")或类型("+component_def.type+")的结构定义中，未定义component-name属性!");
					break;
				}
				var structure_component_def = LUI.PageDesigner.instance._components[structureName];
				if(structure_component_def == null){
					LUI.Message.info("添加结构节点错误","未找到组件("+structureName+")定义!");
					break;
				}
				//检查此节点是否已存在
				var isExsits = false;
				if(node.children!=null){
					for(var j=0;j<node.children.length;j++ ){
						if(structure_component_def != null && node.children[j].component.type == structure_component_def.type){
							isExsits = true;
							break;
						}
					}
				}
				//不存在 创建之
				if(!isExsits){
					if(structure_component_def.isArray == "true"){
						LUI.PageDesigner.instance._pageCmpTree.addNodes(node,{
							name:structure_component_def.label, 
							component:structure_component_def,
							form:{},
							data:{
								_isValid:true,
								component:structure_component_def.name
							}
						},true);
					}else{
						//如果是数据源节点 还需要检查 是否有数据源类型的设置：私有数据源的情况下 才添加
						if(structure_component_def.type == 'dataset' || structure_component_def.type == 'record'){
							var datasourceTypeField = LUI.PageDesigner.instance.getFormField(node,'datasourceType');
							var datasourceType = datasourceTypeField.getValue();
							if(datasourceType!=null && datasourceType == 'private'){
								LUI.PageDesigner.instance.addComponentNode(node,structureName,nodeText+'-'+structure_component_def.label);
							}
						}else{
							LUI.PageDesigner.instance.addComponentNode(node,structureName,nodeText+'-'+structure_component_def.label);
						}
					}
				}
				
			}
		}
		LUI.PageDesigner.instance.validateNode(node);
		LUI.PageDesigner.instance._saveComponentBtn.button( "enable");
	}
}

/**
 * 重新选择了grid 的Component时 需要做如下处理
 * @param oldComponentName
 * @param newComponentName
 */
function refreshGridExtendForm(eventSource,eventTarget,event,eventOriginal){
	if(!event.params.isInitial){
		//先执行通常的处理
		refreshExtendForm(eventSource,eventTarget,event,eventOriginal);
		
		//当前选中的节点
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var selectedNode = selectedNodes[0];
		//
		var newVal = event.params.newValue;
		var oldVal = event.params.oldValue;
		var isInitial = event.params.isInitial;
		//如果是显示类型的表格 -> 编辑类型的表格
		if(!isInitial && (oldVal == 'displayGrid' || oldVal == 'treeDisplayGrid') && (newVal == 'editGrid' || newVal == 'treeEditGrid')){
			//查找
			for(var i=0;i<selectedNode.children.length;i++ ){
				var cNode = selectedNode.children[i];
				if(cNode.component.type == 'columns'){
					var columnsNode= cNode;
					//循环检查表格列 设为对应的显示类型
					for(var j=0;j<columnsNode.children.length;j++ ){
						var dNode = columnsNode.children[j];
						var typeName = dNode.data.fieldType+'Column';
						var type_def = LUI.PageDesigner.instance._types[typeName];
						var component_name = type_def.defaultComponent;
						dNode.data.type = typeName;
						dNode.data.component = component_name;
						
						var component_def = LUI.PageDesigner.instance._components[component_name];
						dNode.component = component_def;
					}
					
					break;
				}
			}
		}else if(!isInitial && (newVal == 'displayGrid' || newVal == 'treeDisplayGrid') && (oldVal == 'editGrid' || oldVal == 'treeEditGrid')){
			//查找
			for(var i=0;i<selectedNode.children.length;i++ ){
				var cNode = selectedNode.children[i];
				if(cNode.component.type == 'columns'){
					var columnsNode= cNode;
					//循环检查表格列 设为对应的显示类型
					for(var j=0;j<columnsNode.children.length;j++ ){
						var dNode = columnsNode.children[j];
						dNode.data.type = 'column';
						dNode.data.component = 'gridColumn';
						
						dNode.component = LUI.PageDesigner.instance._components['gridColumn'];
					}
					break;
				}
			}
		}
	}
}


/**
 * 取得系统参数
 */
function getXiTongOptions(){
	var options = [];
	for(var i=0;i<LUI.PageDesigner.instance._xiTongs.length;i++ ){
		var xiTongData = LUI.PageDesigner.instance._xiTongs[i];
		options[options.length] = {text:xiTongData.xiTongMC,value:xiTongData.xiTongDH};
	}
	return options;
}

/**
 * 取得字段类型选项参数
 */
function getZiDuanLXOptions(){
	var options = [];
	for(var i=0;i<LUI.PageDesigner.instance._ziDuanLXs.length;i++ ){
		var ziDuanLXData = LUI.PageDesigner.instance._ziDuanLXs[i];
		options[options.length] = {text:ziDuanLXData.ziDuanLXMC,value:ziDuanLXData.ziDuanLXDH};
	}
	return options;
}

/**
 * 通知 “功能”字段 重新设置选项
 */
function setGongNengOptions(eventSource,eventTarget,event,eventOriginal){
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var gongNengDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'gongNengDH');
	
//	gongNengField.setValue(null);
	gongNengDHField.initOptions();
}

//为combobox类型的功能字段 设置选项
function setGongNengOptionsForSelect(eventSource,eventTarget,event,eventOriginal){
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var gongNengDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'gongNengDH');
	var xiTongDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'xiTongDH');
	var xiTongDH = xiTongDHField.getValue();
	
	if(xiTongDH == null){
		gongNengDHField.disable();
	}else{
		var options = [];
		for(var i=0;i<LUI.PageDesigner.instance._gongNengs.length;i++ ){
			var gongNengData = LUI.PageDesigner.instance._gongNengs[i];
			if(gongNengData.xiTong.xiTongDH == xiTongDH){
				options[options.length] = {text:gongNengData.gongNengMC,value:gongNengData.gongNengDH};
			}
		}
		gongNengDHField.setOptions(options);
		
		gongNengDHField.enable();
	}
}

//为combobox类型的实体类字段 设置选项
function setShiTiLeiOptionsForSelect(eventSource,eventTarget,event,eventOriginal){
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var shiTiLeiDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'shiTiLeiDH');
	var xiTongDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'xiTongDH');
	var xiTongDH = xiTongDHField.getValue();
	
	if(xiTongDH == null){
		this.disable();
	}else{
		var options = [];
		
		for(var i=0;i<LUI.PageDesigner.instance._shiTiLeis.length;i++ ){
			var shiTiLeiData = LUI.PageDesigner.instance._shiTiLeis[i];
			if(shiTiLeiData.xiTong == null){
				LUI.Message.error("错误","实体类（"+shiTiLeiData.shiTiLeiMC+"）未关联系统！");
			}else if(shiTiLeiData.xiTong.xiTongDH == xiTongDH){
				options[options.length] = {text:shiTiLeiData.shiTiLeiMC,value:shiTiLeiData.shiTiLeiDH};
			}
		}
		shiTiLeiDHField.setOptions(options);
		shiTiLeiDHField.enable();
	}
}

//combobox类型的功能字段 为操作字段设置选项
function setCaoZuoOptionsBySelect(eventSource,eventTarget,event,eventOriginal){
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var caoZuoDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'caoZuoDH');
	
	var gongNengDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'gongNengDH');
	var gongNengDH = gongNengDHField.getValue();
	if(gongNengDH == null){
		caoZuoDHField.disable();
	}else{
		var options = [];
		for(var i=0;i<LUI.PageDesigner.instance._gongNengs.length;i++ ){
			var gongNengData = LUI.PageDesigner.instance._gongNengs[i];
			if(gongNengData.gongNengDH == gongNengDH){
				for(var j=0;j<gongNengData.czs.length;j++ ){
					var caoZuoData = gongNengData.czs[j];
					options[options.length] = {text:caoZuoData.caoZuoMC,value:caoZuoData.caoZuoDH};
				}
				break;
			}
		}
		caoZuoDHField.setOptions(options);
		caoZuoDHField.enable();
	}
}

//打开功能新增或编辑按钮
function openGongNengPage(eventSource,eventTarget,event,eventOriginal){
	var gongNengDH = event.params.value;
	if(gongNengDH ==null){
		window.open('nim.html?_pt_=system/gongNengAppend/gongNengAppend.html');
	}else{
		for(var i=0;i<LUI.PageDesigner.instance._gongNengs.length;i++ ){
			var gongNengData = LUI.PageDesigner.instance._gongNengs[i];
			if(gongNengData.gongNengDH == gongNengDH){
				window.open('nim.html?_pt_=system/gongNengEdit/gongNengEdit.html&_ps_={id:'+gongNengData.gongNengDM+'}');
				break;
			}
		}
	}
}

//打开实体类新增或编辑按钮
function openShiTiLeiPage(eventSource,eventTarget,event,eventOriginal){
	var shiTiLeiDH = event.params.value;
	if(shiTiLeiDH ==null){
		window.open('nim.html?_pt_=system/shiTiLeiAppend/shiTiLeiAppend.html');
	}else{
		for(var i=0;i<LUI.PageDesigner.instance._shiTiLeis.length;i++ ){
			var _shiTiLeiData = LUI.PageDesigner.instance._shiTiLeis[i];
			if(_shiTiLeiData.shiTiLeiDH == shiTiLeiDH){
				window.open('nim.html?_pt_=system/shiTiLeiEdit/shiTiLeiEdit.html&_ps_={id:'+_shiTiLeiData.shiTiLeiDM+'}');
				break;
			}
		}
	}
}

/**
 * “功能”字段 重新设置选项
 */
function getRelaGongNengOptions(){
	var options = [];
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var xiTongDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'xiTongDH');
	
	var xiTongDH = xiTongDHField.getValue();
	if(xiTongDH == null){
		this.disable();
	}else{
		this.enable();
		for(var i=0;i<LUI.PageDesigner.instance._gongNengs.length;i++ ){
			var gongNengData = LUI.PageDesigner.instance._gongNengs[i];
			if(gongNengData.xiTong.xiTongDH == xiTongDH){
				options[options.length] = {text:gongNengData.gongNengMC,value:gongNengData.gongNengDH};
			}
		}
	}
	return options;
}




/**
 * 选择了实体类以后 通知“字段”字段重新设置下拉选项
 * @param eventSource
 * @param eventTarget
 * @param event
 * @param eventOriginal
 */
function setZiDuanOptions(eventSource,eventTarget,event,eventOriginal){
	//找到目标字段 通知它重新创建选项
	
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var newVal = event.params.newValue;
	var ziDuanField = eventSource.form.getField('ziDuanDH');
	
	ziDuanField.initOptions();
}

//根据功能代号和字段代号 取得ziduan类型代号
function setGongNengZDLX(eventSource,eventTarget,event,eventOriginal){
	var ziDuanDH = event.params.newValue;
	
	//当前选中的grid节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	//以第一个li为准 是需要迭代的
	var ziDuanLXDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'ziDuanLXDH');
	
	if(ziDuanDH!=null && ziDuanDH.length >0 && gongNengDH!=null && gongNengDH.length >0){
		for(var i=0;i<LUI.PageDesigner.instance._gongNengs.length;i++ ){
			var gongNengData = LUI.PageDesigner.instance._gongNengs[i];
			if(gongNengData.gongNengDH == gongNengDH){
				for(var j=0;j<LUI.PageDesigner.instance._shiTiLeis.length;j++ ){
					var shiTiLeiData = LUI.PageDesigner.instance._shiTiLeis[j];
					if(gongNengData.shiTiLei.shiTiLeiDH == shiTiLeiData.shiTiLeiDH){
						for(var k=0;k<shiTiLeiData.zds.length;k++ ){
							var ziDuanData = shiTiLeiData.zds[k];
							if(ziDuanData.ziDuanDH == ziDuanDH){
								ziDuanLXDHField.setValue(ziDuanData.ziDuanLX.ziDuanLXDH);
								break;
							}
						}
						break;
					}
				}
				break;
			}
		}
	}
}

//根据实体类代号和字段代号 为 “字段类型 ”字段设置值
function setShiTiLeiZDLX(eventSource,eventTarget,event,eventOriginal){
	var ziDuanDH = event.params.newValue;
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var shiTiLeiDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'shiTiLeiDH');
	var ziDuanLXDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'ziDuanLXDH');
	
	if(ziDuanDH!=null && ziDuanDH.length >0 && shiTiLeiDH!=null && shiTiLeiDH.length >0){
		for(var j=0;j<LUI.PageDesigner.instance._shiTiLeis.length;j++ ){
			var shiTiLeiData = LUI.PageDesigner.instance._shiTiLeis[j];
			if(shiTiLeiData.shiTiLeiDH == shiTiLeiDH){
				for(var k=0;k<shiTiLeiData.zds.length;k++ ){
					var ziDuanData = shiTiLeiData.zds[k];
					if(ziDuanData.ziDuanDH == ziDuanDH){
						ziDuanLXDHField.setValue(ziDuanData.ziDuanLX.ziDuanLXDH);
						break;
					}
				}
				break;
			}
		}
	}
}

//in workflow 选择了功能以后 将功能代号和名称设置到name label字段
function setWorkflowNameLabel(eventSource,eventTarget,event,eventOriginal){
	var newVal = event.params.newValue;
	var oldVal = event.params.oldValue;
	var isInitial = event.params.isInitial;
	
	if(newVal!=null && newVal != oldVal && !isInitial){
		//当前选中的节点
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var selectedNode = selectedNodes[0];
		//name设置为功能代号
		selectedNode.record.setFieldValue('name',newVal);
		//label设置为功能名称
		for(var i=0;i<LUI.PageDesigner.instance._gongNengs.length;i++ ){
			gongNengData = LUI.PageDesigner.instance._gongNengs[i];
			if(gongNengData.gongNengDH == newVal){
				selectedNode.record.setFieldValue('label',gongNengData.gongNengMC);
				break;
			}
		}
	}
}



//in workflowProperty  选择了待办属性 以后 将待办属性名称设置到name字段
function setWorkflowPropertyLabel(eventSource,eventTarget,event,eventOriginal){
	var newVal = event.params.newValue;
	var oldVal = event.params.oldValue;
	var isInitial = event.params.isInitial;
	
	if(newVal!=null && newVal != oldVal && !isInitial){
		//当前选中的节点
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var selectedNode = selectedNodes[0];
		//name设置为功能代号
		selectedNode.record.setFieldValue('name',newVal);
		//name设置为功能代号
		selectedNode.record.setFieldValue('freemarker',"${data."+newVal+"!''}");
	}
}

//为数据集节点, 取得下级属性列表 供选择
function getDatasourcePropertyOptions(){
	var options = [];
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	//当前选中节点为数据源节点
	var datasourceNode = selectedNodes[0];
	
	//查找数据源节点下的属性列表节点
	if(datasourceNode!=null){
		var propertiesNode = null;
		if(datasourceNode.children!=null){
			for(var i=0;i<datasourceNode.children.length;i++ ){
				var cNode = datasourceNode.children[i];
				if(cNode.component.type == 'properties'){
					propertiesNode= cNode;
					break;
				}
			}
		}
		
		if(propertiesNode==null){
			LUI.Message.error("取属性选项失败","未找到properties节点！");
		}else{
			//循环所有属性节点
			if(propertiesNode.children!=null){
				for(var i=0;i<propertiesNode.children.length;i++ ){
					options[options.length] = {
						text:propertiesNode.children[i].data.label,
						value:propertiesNode.children[i].data.name,
						type:propertiesNode.children[i].data.fieldType
					};
				}
			}
		}
	}
	
	return options;
}

//为集合节点, 取得关联公有数据源或下级私有数据源的属性列表 供选择
function getKeyPropertyOptions(){
	var options = [];
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	//当前选中节点关联的数据源名称
	var datasourceNode = LUI.PageDesigner.instance.getDatasourceBySelectedNode(selectedNode);
	
	//查找数据源节点下的属性列表节点
	if(datasourceNode!=null){
		var propertiesNode = null;
		if(datasourceNode.children!=null){
			for(var i=0;i<datasourceNode.children.length;i++ ){
				var cNode = datasourceNode.children[i];
				if(cNode.component.type == 'properties'){
					propertiesNode= cNode;
					break;
				}
			}
			//查找与当前字段对应的属性节点
			var propertyName = selectedNode.data.name;
			var propertyNode = null;
			if(propertiesNode!=null && propertiesNode.children!=null){
				for(var i=0;i<propertiesNode.children.length;i++ ){
					var cNode = propertiesNode.children[i];
					if(cNode.data.name == propertyName){
						propertyNode= cNode;
						break;
					}
				}
			}
			if(propertyNode==null){
				LUI.Message.error("取属性选项失败","数据源中未找到字段（"+propertyName+"）对应的属性节点！");
				return;
			}
			//
			if(propertyNode!=null && propertyNode.children!=null){
				for(var i=0;i<propertyNode.children.length;i++ ){
					var cNode = propertyNode.children[i];
					if(cNode.component.type == 'properties'){
						propertiesNode= cNode;
						break;
					}
				}
			}
		}
		
		if(propertiesNode==null){
			LUI.Message.error("取属性选项失败","未找到properties节点！");
		}else{
			//循环所有属性节点
			if(propertiesNode.children!=null){
				for(var i=0;i<propertiesNode.children.length;i++ ){
					options[options.length] = {
						text:propertiesNode.children[i].data.label,
						value:propertiesNode.children[i].data.name,
						type:propertiesNode.children[i].data.fieldType
					};
				}
			}
		}
	}
	
	return options;
}

//集合附件字段 设置了关键列以后 要为对应的数据源节点 添加附件代码、文件名、后缀名等字段
function setKeyFJProperty(eventSource,eventTarget,event,eventOriginal){
	var newVal = event.params.newValue;
	var oldVal = event.params.oldValue;
	var isInitial = event.params.isInitial;
	
	if(newVal!=null && newVal != oldVal ){
		//当前选中的节点
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var selectedNode = selectedNodes[0];
		//根据当前节点 查找数据源节点
		var datasourceNode = LUI.PageDesigner.instance.getDatasourceBySelectedNode(selectedNode);
		//查找数据源节点下对应的集合属性节点
		var propertyNode= null;
		if(datasourceNode.children!=null){
			for(var i=0;i<datasourceNode.children.length;i++ ){
				var cNode = datasourceNode.children[i];
				if(cNode.component.type == 'properties'){
					//循环所有属性节点
					if(cNode.children!=null){
						for(var j=0;j<cNode.children.length;j++ ){
							if(cNode.children[j].data.name == selectedNode.data.name){
								propertyNode = cNode.children[j];
								break;
							}
						}
					}
					break;
				}
			}
		}
		if(propertyNode == null){
			LUI.Message.error("取属性选项失败","在关联数据源中未找到当前字段对应的属性节点！");
			return;
		}
		//查找关键列对应的属性节点
		var keyPropertyNode= null;
		if(propertyNode.children!=null){
			for(var i=0;i<propertyNode.children.length;i++ ){
				var cNode = propertyNode.children[i];
				if(cNode.component.type == 'properties'){
					//循环所有属性节点
					if(cNode.children!=null){
						for(var j=0;j<cNode.children.length;j++ ){
							if(cNode.children[j].data.name == newVal){
								keyPropertyNode = cNode.children[j];
								break;
							}
						}
					}
					break;
				}
			}
		}
		if(keyPropertyNode == null){
			LUI.Message.error("取属性选项失败","在关联数据源中未找到附件字段对应的属性节点！");
			return;
		}
		//检查附件代码、文件名、后缀名等字段等是否存在
		var hasFuJianDM = false;
		var hasShangChuanWJM = false;
		var hasWenJianHZ = false;
		var keyPropertiesNode = null;
		if(keyPropertyNode.children!=null){
			for(var i=0;i<keyPropertyNode.children.length;i++ ){
				var cNode = keyPropertyNode.children[i];
				if(cNode.component.type == 'properties'){
					keyPropertiesNode = cNode;
					//循环所有属性节点
					if(keyPropertiesNode.children!=null){
						for(var j=0;j<keyPropertiesNode.children.length;j++ ){
							var fuJianDetailNode = keyPropertiesNode.children[j];
							if(fuJianDetailNode.data.name == 'fuJianDM'){
								hasFuJianDM = true;
							}else if(fuJianDetailNode.data.name == 'shangChuanWJM'){
								hasShangChuanWJM = true;
							}else if(fuJianDetailNode.data.name == 'wenJianHZ'){
								hasWenJianHZ = true;
							}
						}
					}
					break;
				}
			}
		}
		if(!hasFuJianDM || !hasShangChuanWJM || !hasWenJianHZ){
			LUI.Message.error("警告","必须为集合附件类型的字段在数据源中选择“附件代码、文件名、后缀名”等字段！");
			if(keyPropertiesNode!=null){
				LUI.PageDesigner.instance._pageCmpTree.expandNode(keyPropertiesNode);
				LUI.PageDesigner.instance._pageCmpTree.selectNode(keyPropertiesNode);
				LUI.PageDesigner.instance.onComponentNodeSelected(keyPropertiesNode);
			}else if(keyPropertyNode!=null){
				LUI.PageDesigner.instance._pageCmpTree.expandNode(keyPropertyNode);
				LUI.PageDesigner.instance._pageCmpTree.selectNode(keyPropertyNode);
				LUI.PageDesigner.instance.onComponentNodeSelected(keyPropertyNode);
			}
			return;
		}
	}
}


//查找 取得关联公有数据源或下级私有数据源的属性列表 供选择
function getRelaDatasourcePropertyOptions(){
	var options = [];
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	//当前选中节点关联的数据源名称
	var datasourceNode = LUI.PageDesigner.instance.getDatasourceBySelectedNode(selectedNode);
	
	//查找数据源节点下的属性列表节点
	if(datasourceNode!=null){
		var propertiesNode = null;
		if(datasourceNode.children!=null){
			for(var i=0;i<datasourceNode.children.length;i++ ){
				var cNode = datasourceNode.children[i];
				if(cNode.component.type == 'properties'){
					propertiesNode= cNode;
					break;
				}
			}
		}
		
		if(propertiesNode==null){
			LUI.Message.error("取属性选项失败","未找到properties节点！");
		}else{
			//循环所有属性节点
			if(propertiesNode.children!=null){
				for(var i=0;i<propertiesNode.children.length;i++ ){
					options[options.length] = {
						text:propertiesNode.children[i].data.label,
						value:propertiesNode.children[i].data.name,
						type:propertiesNode.children[i].data.fieldType
					};
				}
			}
		}
	}else{
		LUI.Message.error("取属性选项失败","未找到datasource节点！");
	}
	
	return options;
}

//集合复选框类型的字段 设置了关键字段
function setKeyProperty(eventSource,eventTarget,event,eventOriginal){
	var newVal = event.params.newValue;
	var oldVal = event.params.oldValue;
	var isInitial = event.params.isInitial;
	
	if(newVal!=null && newVal != oldVal && !isInitial){
		//当前选中的节点
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var selectedNode = selectedNodes[0];
		//取得字段名
		var fieldName = selectedNode.data.name;
		//关键字段名
		var keyName = newVal;
		//从当前集合字段的关联数据源取得显示列名
		var datasourceNode = null;
		if(selectedNode.data.datasourceType == 'public' || selectedNode.data.datasourceType == null){
			datasourceNode = LUI.PageDesigner.instance.getDatasourceNodeByName(cmpNode.data.datasourceName);
		}else{
			//在下级节点中 查找数据源节点。。。
			if(selectedNode.children!=null && selectedNode.children.length >0){
				for(var i=0;i<selectedNode.children.length;i++){
					var subComponentName = selectedNode.children[i].data.component;
					var subComponent_def = LUI.PageDesigner.instance._components[subComponentName];
					if(subComponent_def.type == 'dataset' ){
						datasourceNode = selectedNode.children[i];
						break;
					}
				}
			}
		}
		if(datasourceNode!=null){
			var shiTiLeiDef = LUI.PageDesigner.instance.getShiTiLeiDefByDatasourceNode(datasourceNode);
			selectedNode.record.setFieldValue('renderTemplate',"{{"+fieldName+'.'+keyName+'.'+shiTiLeiDef.xianShiLie+"}}");
			//尝试为关联数据源添加字段
			var zdArray = [{name:shiTiLeiDef.zhuJianLie},{name:shiTiLeiDef.xianShiLie}] ;
			LUI.PageDesigner.instance.addPropertyToDatasetNode(datasourceNode,datasourceNode.children[0],zdArray);
		}else{
			LUI.Message.error("错误","设置显示表达式失败：未找到datasource节点！");
		}
	}
}

function setLevelFieldProperty(eventSource,eventTarget,event,eventOriginal){
	var newVal = event.params.newValue;
	var oldVal = event.params.oldValue;
	var isInitial = event.params.isInitial;
	
	if(newVal!=null && newVal != oldVal && !isInitial){
		//当前选中的节点
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var selectedNode = selectedNodes[0];
		//name设置为功能代号
		selectedNode.record.setFieldValue('renderTemplate',"{{"+newVal+"}}");
	}
}


/**
 * Grid column节点 选择了数据字段以后 需要更新当前表单中的信息
 */
function setInfoToColumn(eventSource,eventTarget,event,eventOriginal){
	var newVal = event.params.newValue;
	var oldVal = event.params.oldValue;
	var isInitial = event.params.isInitial;
	
	if(newVal!=null && newVal != oldVal){
		
	}
}

/**
 * 选择了功能以后
 * 通知关联的 功能操作 及 字段 重新设置选项
 * getRelaGnZiDuanOptions
 */
function setCaoZuoZiDuanOptions(eventSource,eventTarget,event,eventOriginal){
	
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var caoZuoDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'caoZuoDH');
	caoZuoDHField.initOptions();
	
	var ziDuanDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'ziDuanDH');
	ziDuanDHField.initOptions();
	
	
	
	var newVal = event.params.newValue;
	var oldVal = event.params.oldValue;
	var isInitial = event.params.isInitial;
	
	if(newVal!=null && newVal != oldVal){
		var caoZuoField = this.form.getField('caoZuoDH');
		var options = [];
		var gongNengData = null;
		for(var i=0;i<LUI.PageDesigner.instance._gongNengs.length;i++ ){
			gongNengData = LUI.PageDesigner.instance._gongNengs[i];
			if(gongNengData.gongNengDH == newVal){
				for(var j=0;j<gongNengData.czs.length;j++ ){
					var caoZuoData = gongNengData.czs[j];
					options[options.length] = {text:caoZuoData.caoZuoMC,value:caoZuoData.caoZuoDH};
				}
				break;
			}else{
				gongNengData = null;
			}
		}
		
		if(caoZuoField.allowBlank || options.length ==0){
			caoZuoField.setValue(null);
		}else{
			caoZuoField.setValue(options[0].value);
		}
		caoZuoField.initOptions();
		
		var shiTiLeiData = null;
		if(gongNengData!=null){
			for(var i=0;i<LUI.PageDesigner.instance._shiTiLeis.length;i++ ){
				shiTiLeiData = LUI.PageDesigner.instance._shiTiLeis[i];
				if(shiTiLeiData.shiTiLeiDH == gongNengData.shiTiLei.shiTiLeiDH){
					break;
				}else{
					shiTiLeiData = null;
				}
			}
		}

		if(shiTiLeiData!=null){
			var ziDuanField = this.form.getField('ziDuanDH');
			var options = [];
			for(var j=0;j<shiTiLeiData.zds.length;j++ ){
				var ziDuanData = shiTiLeiData.zds[j];
				options[options.length] = {text:ziDuanData.ziDuanBT,value:ziDuanData.ziDuanDH};
			}
			
			if(ziDuanField.allowBlank || options.length ==0){
				ziDuanField.setValue(null);
			}else{
				ziDuanField.setValue(options[0].value);
			}
			
			ziDuanField.initOptions();
		}
	}
}

/**
 * “功能字段”字段 重新设置选项
 */
function getRelaGnZiDuanOptions(){
	var options = [];
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var gongNengDHField =  LUI.PageDesigner.instance.getFormField(selectedNode,'gongNengDH');
	var gongNengDH =  gongNengDHField.getValue();
	//先根据功能代号 找到功能对象
	var gongNengData = null;
	for(var i=0;i<LUI.PageDesigner.instance._gongNengs.length;i++ ){
		var gnData = LUI.PageDesigner.instance._gongNengs[i];
		if(gnData.gongNengDH == gongNengDH){
			gongNengData = gnData;
			break;
		}
	}
	//再根据功能对象 找到实体类对象
	var shiTiLeiData = null;
	if(gongNengData!=null){
		for(var i=0;i<LUI.PageDesigner.instance._shiTiLeis.length;i++ ){
			shiTiLeiData = LUI.PageDesigner.instance._shiTiLeis[i];
			if(shiTiLeiData.shiTiLeiDH == gongNengData.shiTiLei.shiTiLeiDH){
				for(var j=0;j<shiTiLeiData.zds.length;j++ ){
					var ziDuanData = shiTiLeiData.zds[j];
					options[options.length] = {text:ziDuanData.ziDuanBT,value:ziDuanData.ziDuanDH};
				}
				break;
			}
		}
	}
	return options;
}




/**
 * 取得流程属性的选择项 （from 待办属性）
 */
function getTodoPropertyOptions(){
	
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var todoDatasetNode = selectedNode.getParentNode().getParentNode().getParentNode().getParentNode();
	var todoPropertiesNode = null;
	if(todoDatasetNode.children!=null){
		for(var i=0;i<todoDatasetNode.children.length;i++ ){
			var cNode = todoDatasetNode.children[i];
			if(cNode.component.name == 'properties'){
				todoPropertiesNode= cNode;
				break;
			}
		}
	}
	
	
	var options = [];
	if(todoPropertiesNode!=null){
		if(todoPropertiesNode.children!=null){
			for(var i=0;i<todoPropertiesNode.children.length;i++ ){
				var cNode = todoPropertiesNode.children[i];
				options[options.length] = {text:cNode.data.label,value:cNode.data.name};
			}
		}
	}else{
		LUI.Message.error("取流程属性选项失败","未找到properties节点！");
	}
	return options;
}

/**
 * 通知 “实体类”字段 重新设置选项
 */
function setShiTiLeiOptions(eventSource,eventTarget,event,eventOriginal){
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var shiTiLeiDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'shiTiLeiDH');
	
//	shiTiLeiDHField.setValue(null);
	shiTiLeiDHField.initOptions();
}

/**
 * “实体类”字段 重新设置选项
 */
function getRelaShiTiLeiOptions(){
	var options = [];
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var xiTongDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'xiTongDH');
	
	var xiTongDH = xiTongDHField.getValue();
	if(xiTongDH == null){
		this.disable();
	}else{
		this.enable();
		for(var i=0;i<LUI.PageDesigner.instance._shiTiLeis.length;i++ ){
			var shiTiLeiData = LUI.PageDesigner.instance._shiTiLeis[i];
			if(shiTiLeiData.xiTong == null){
				LUI.Message.error("错误","实体类（"+shiTiLeiData.shiTiLeiMC+"）未关联系统！");
			}else if(shiTiLeiData.xiTong.xiTongDH == xiTongDH){
				options[options.length] = {text:shiTiLeiData.shiTiLeiMC,value:shiTiLeiData.shiTiLeiDH};
			}
		}
	}
	return options;
}

/**
 * 根据当前fieldType 设置编辑控件选项
 * @param oldVal
 * @param newVal
 */
function setWidgetOptions(eventSource,eventTarget,event,eventOriginal){
	
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var widgetField = LUI.PageDesigner.instance.getFormField(selectedNode,'widget');
	
	widgetField.initOptions();
}


/**
 * 取同类型的组件 作为选择项 提供给文本选择框
 * @param typeName
 * @returns {Array}
 */
function getEditorTypesOptions(){
	var keys = LUI.FieldFactoryManager.types.keySet();
	var options = [];
	for(  var i=0;i<keys.length;i++){
//		var editorType = LUI.FieldFactoryManager.types.get(keys[i]);
		options[options.length] = {text:keys[i],value:keys[i]};
	}
	return options;
}


/**
 * “编辑控件” 设置选项
 */
function getRelaWidgetOptions(){
	var options = [];
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var fieldTypeField =  LUI.PageDesigner.instance.getFormField(selectedNode,'fieldType');
//	var widgetField = LUI.PageDesigner.instance.getFormField(selectedNode,'widget');
	
	var fieldType = fieldTypeField.getValue();
	if(fieldType!=null){
		var dataTypeMap = LUI.FieldFactoryManager.types.get(fieldTypeField.getValue());
		if(dataTypeMap!=null){
			var dataTypeKeys = dataTypeMap.keySet();
			
			var options = [];
			for(var i =0;i<dataTypeKeys.length;i++){
				options[options.length] = {text:dataTypeKeys[i],value:dataTypeKeys[i]};
			}
		}
	}
	
	return options;
}


/**
 * “操作”字段 重新设置选项
 */
/**
 * “功能操作”字段 重新设置选项
 */
function getRelaCaoZuoOptions(){
	var options = [];
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var gongNengDHField =  LUI.PageDesigner.instance.getFormField(selectedNode,'gongNengDH');
	var gongNengDH =  gongNengDHField.getValue();
	if(gongNengDH == null){
		this.disable();
	}else{
		this.enable();
		for(var i=0;i<LUI.PageDesigner.instance._gongNengs.length;i++ ){
			var gongNengData = LUI.PageDesigner.instance._gongNengs[i];
			if(gongNengData.gongNengDH == gongNengDH){
				for(var j=0;j<gongNengData.czs.length;j++ ){
					var caoZuoData = gongNengData.czs[j];
					options[options.length] = {text:caoZuoData.caoZuoMC,value:caoZuoData.caoZuoDH};
				}
				break;
			}
		}
	}
	return options;
}


/**
 * 取同类型的组件 作为选择项 提供给文本选择框
 * @param typeName
 * @returns {Array}
 */
function getComponentOfType(){
	//当前选中节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	//
	var typeName = selectedNode.component.type;
	var options = [];
	for(  var cmpKey in  LUI.PageDesigner.instance._components){
		var comp = LUI.PageDesigner.instance._components[cmpKey];
		if(comp.type == typeName && comp.isAppendable != 'false'){
			options[options.length] = {text:comp.label,value:comp.name};
		}
	}
	return options;
}

/**
 * 取同类型的组件 作为选择项 提供给文本选择框
 * @param typeName
 * @returns {Array}
 */
function getFieldsTypeOfForm(){
	//如果是显示表单 只显示显示字段控件
	//当前选中节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	//取得目标地址
	var formNode = selectedNode.getParentNode().getParentNode();
	var formComponentName = formNode.data.component;
	//
	var typeName = selectedNode.component.type;
	var options = [];
	for(  var cmpKey in  LUI.PageDesigner.instance._components){
		var comp = LUI.PageDesigner.instance._components[cmpKey];
		if(comp.type == typeName && comp.isAppendable != 'false'){
			//如果是显示表单 只显示显示字段控件
			if(formComponentName == 'workflowForm' || formComponentName == 'dataDisplayForm'){
				if(comp.name.indexOf("Display") >=0){
					options[options.length] = {text:comp.label,value:comp.name};
				}
			}else{
				options[options.length] = {text:comp.label,value:comp.name};
			}
		}
	}
	return options;
}


/**
 * 取数据源节点信息 作为选择项 提供给数据源字段的文本选择框
 * @param typeName
 * @returns {Array}
 */

//取得对象类型的数据源 作为选择项
function getDataRecordOptions(){
	var options = [];
	var dsNodes = LUI.PageDesigner.instance.findDatasourceNodes();
	for(var j=0;j<dsNodes.length;j++ ){
		//需要对象类型的数据源
		if(dsNodes[j].component.type == 'record'){
			options[options.length] = {text:dsNodes[j].name,value:dsNodes[j].data.name};
		}
	}	
	return options;
}

//取得对象类型的数据源 作为选择项
function getWorkflowDatasetOptions(){
	var options = [];
	var dsNodes = LUI.PageDesigner.instance.findDatasourceNodes();
	for(var j=0;j<dsNodes.length;j++ ){
		//需要对象类型的数据源
		if(dsNodes[j].component.name == 'workflowDataset'){
			options[options.length] = {text:dsNodes[j].name,value:dsNodes[j].data.name};
		}
	}	
	return options;
}

//取得集合类型的数据源 作为选择项
function getDatasetOptions(){
	var options = [];
	var dsNodes = LUI.PageDesigner.instance.findDatasourceNodes();
	for(var j=0;j<dsNodes.length;j++ ){
		//需要集合类型的数据源（包括集合类型数据 和对象类型数据的集合字段）
		if(dsNodes[j].component.type == 'dataset'){
			options[options.length] = {text:dsNodes[j].name,value:dsNodes[j].data.name};
		}
	}
	return options;
}



/**
 * 选中了查询表单
 * 需要取得其中设置的页面地址
 * @param oldVal
 * @param newVal
 * @param isInitial
 */
function setSearchToPageRenderTo(eventSource,eventTarget,event,eventOriginal){
	var newVal = event.params.newValue;
	var oldVal = event.params.oldValue;
	var isInitial = event.params.isInitial;
	
	if(newVal!=null && newVal != oldVal && !isInitial){
		//目标表单
		var targetForm = $("#_pageContent "+newVal+".form");
		//当前选中的节点
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var selectedNode = selectedNodes[0];
		//取得目标地址
		var targetFieldValue = selectedNode.record.getFieldValue('target');
		if(targetFieldValue == null || targetFieldValue.length==0){
			var targetUrl = targetForm.attr('href');
			selectedNode.record.setFieldValue('target',targetUrl);
//			targetField.setValue(targetUrl);//因为事件的监听顺序原因 节点的无效标志不会被取消 所以再来一次
		}
		//取得表单内的按钮
		var buttonsNode = LUI.PageDesigner.instance._pageCmpTree.getNodesByFilter(function(node){
			return node.component!=null && (node.component.type == 'buttons');
		},true,selectedNode);
		
		targetForm.find('.button').each(function(){
			var nodes = LUI.PageDesigner.instance.addComponentNode(buttonsNode,'submitButton',$(this).text());
			nodes.data.renderto = '#'+this.id;
		});
		
		//取得表单内的字段
		var filtersNode = LUI.PageDesigner.instance._pageCmpTree.getNodesByFilter(function(node){
			return node.component!=null && (node.component.name == 'searchFilters');
		},true,selectedNode);
		
		targetForm.find('.field').each(function(){
			var nodes = LUI.PageDesigner.instance.addComponentNode(filtersNode,'searchFieldFilter','查询字段');
//			var nodes = LUI.PageDesigner.instance.addTypeNode(fieldsNode,'string','查询字段');
			nodes.data.operator = 'eq';
			nodes.data.fieldType = 'string';
			nodes.data.renderto = '#'+this.id;
		});
		
	}
}

function setSearchToGridRenderTo(eventSource,eventTarget,event,eventOriginal){
	var newVal = event.params.newValue;
	var oldVal = event.params.oldValue;
	var isInitial = event.params.isInitial;
	
	if(newVal!=null && newVal != oldVal && !isInitial){
		//目标表单
		var targetForm = $("#_pageContent "+newVal+".form");
		//当前选中的节点
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var selectedNode = selectedNodes[0];
		//取得表单内的按钮
		var buttonsNode = LUI.PageDesigner.instance._pageCmpTree.getNodesByFilter(function(node){
			return node.component!=null && (node.component.type == 'buttons');
		},true,selectedNode);
		
		targetForm.find('.button').each(function(){
			var nodes = LUI.PageDesigner.instance.addComponentNode(buttonsNode,'submitButton',$(this).text());
			nodes.data.renderto = '#'+this.id;
		});
		
		//取得表单内的字段
		var fieldsNode = LUI.PageDesigner.instance._pageCmpTree.getNodesByFilter(function(node){
			return node.component!=null && (node.component.type == 'fields');
		},true,selectedNode);
		
		targetForm.find('.field').each(function(){
			var nodes = LUI.PageDesigner.instance.addComponentNode(fieldsNode,'searchFieldFilter','查询字段');
//			var nodes = LUI.PageDesigner.instance.addTypeNode(fieldsNode,'string','查询字段');
			nodes.data.operator = 'eq';
			nodes.data.fieldType = 'string';
			nodes.data.renderto = '#'+this.id;
		});
		
	}
}
/**
 * 查询所有列表控件
 * @param datasourceType
 * @returns {Array}
 */
function getGridOptions(){
	var options = [];
	var gridNodes = LUI.PageDesigner.instance._pageCmpTree.getNodesByFilter(function(node){
		return node.component!=null && (node.component.type == 'grid')
	});
	for(var j=0;j<gridNodes.length;j++ ){
		options[options.length] = {text:gridNodes[j].name,value:gridNodes[j].data.name};
	}
	return options;
}

/**
 * 为顶级控件设置了关联元素
 * 检查是否唯一
 * @param typeName
 * @returns {Array}
 */
//function setTopWidgetRenderTo(eventSource,eventTarget,event,eventOriginal){
//	var newVal = event.params.newValue;
//	var oldVal = event.params.oldValue;
//	var isInitial = event.params.isInitial;
//	
//}

//对象类型的字段 是否隐藏 （隐藏的字段 就不需要数据源了）
function changeFieldHidden(eventSource,eventTarget,event,eventOriginal){
	if(!event.params.isInitial){
		var newVal = event.params.newValue;
		var oldVal = event.params.oldValue;
	//	var isInitial = event.params.isInitial;
		
		if(newVal!=null && newVal != oldVal ){
			//如果是隐藏字段 不需要编辑生成方式 生成目标等字段
			var isHidden = false;
			if(newVal == "true"){
				isHidden = true;
			}
			if(eventSource.form.hasField('renderType')){
				eventSource.form.getField('renderType').setHidden(isHidden);
			}
			if(eventSource.form.hasField('renderto')){
				eventSource.form.getField('renderto').setHidden(isHidden);
			}
			
			if(eventSource.form.hasField('renderTemplate')){
				eventSource.form.getField('renderTemplate').setHidden(isHidden);
			}
			
			if(eventSource.form.hasField('datasourceType')){
				eventSource.form.getField('datasourceType').setHidden(isHidden);
				changeFieldSourceType(eventSource,eventTarget,{
					params:{
						newValue:eventSource.form.record.getFieldValue('datasourceType')
					}
				},eventOriginal);
			}
			
			//当前节点
			var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
			var selectedNode = selectedNodes[0];
			//判断当前节点 输入值是否有效
			LUI.PageDesigner.instance.validateNode(selectedNode); 
		}
	}
}

//对象类型 的字段   切换下拉选项数据来源（公共数据源/私有数据源）
function changeFieldSourceType(eventSource,eventTarget,event,eventOriginal){
//	if(!event.params.isInitial){
		var newVal = event.params.newValue;
	
		//当前选中的field节点
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var selectedNode = selectedNodes[0];
		//当前节点下是否存在私有数据源节点
		var hasChildNode = false;
		if(selectedNode.children!=null && selectedNode.children.length >0){
			hasChildNode = true;
		}
				
		
		var hidden = 'false';
		if(eventSource.form.record.hasField('hidden')){
			hidden =  eventSource.form.record.getFieldValue('hidden');
		}
		if(hidden != 'true'){
			if(newVal == 'public'){
				//显示公共数据源字段 
				eventSource.form.getField('datasourceName').setHidden(false);
				//如果私有数据源节点存在 删除
				if(hasChildNode){
					LUI.PageDesigner.instance._pageCmpTree.removeChildNodes(selectedNode);
				}
			}else if(newVal == 'private'){
				//隐藏公共数据源字段
				eventSource.form.getField('datasourceName').setHidden(true);
				//如果私有数据源节点不存在 添加
				if(!hasChildNode){
					var newNode = LUI.PageDesigner.instance.addComponentNode(selectedNode,'gnDataset','数据源');
					if(newNode!=null){
						newNode.data.name = 'dataset';
						newNode.data.label = '数据源';
					}
				}
			}
		}else{
			//隐藏公共数据源字段 
			eventSource.form.getField('datasourceName').setHidden(true);
			//如果私有数据源节点存在 删除
			if(hasChildNode){
				LUI.PageDesigner.instance._pageCmpTree.removeChildNodes(selectedNode);
			}
		}
		
		//判断当前节点是否有效
		LUI.PageDesigner.instance.validateNode(selectedNode); 
//	}
}

//树控件   切分级类型（关联/编码）
function changeLevelType(eventSource,eventTarget,event,eventOriginal){
	if(!event.params.isInitial){
		var newVal = event.params.newValue;
	
		if(newVal == 'parent'){
			//隐藏编码方式字段
			eventSource.form.getField('levelSectionFormat').setHidden(true);
		}else if(newVal == 'section'){
			//隐藏编码方式字段
			eventSource.form.getField('levelSectionFormat').setHidden(false);
		}
	}
}

//显示控件   切换数据来源（公共数据源/私有数据源）
function changeDataSourceType(eventSource,eventTarget,event,eventOriginal){
//	if(!event.params.isInitial){
		var newVal = event.params.newValue;
	
		//当前选中的field节点
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var selectedNode = selectedNodes[0];
		//当前节点下是否存在私有数据源节点
		var privateDatasourceNode = null;
		if(selectedNode.children!=null && selectedNode.children.length >0){
			for(var i=0;i<selectedNode.children.length;i++){
				var componentName = selectedNode.children[i].data.component;
				var component_def = LUI.PageDesigner.instance._components[componentName];
				
				if(component_def.type == 'dataset' || component_def.type == 'record'){
					privateDatasourceNode = selectedNode.children[i];
					break;
				}
			}
		}
	
		if(newVal == 'public'){
			//显示公共数据源字段 
			eventSource.form.getField('datasourceName').setHidden(false);
			//如果私有数据源节点存在 删除
			if(privateDatasourceNode!=null){
				LUI.PageDesigner.instance._pageCmpTree.removeNode(privateDatasourceNode,true);
			}
		}else if(newVal == 'private'){
			//隐藏公共数据源字段
			eventSource.form.getField('datasourceName').setHidden(true);
			//如果私有数据源节点不存在 添加
			if(privateDatasourceNode == null){
				var componentName = selectedNode.data.component;
				var component_def = LUI.PageDesigner.instance._components[componentName];
				var type_def = LUI.PageDesigner.instance._types[component_def.type];
				var allStructureArray = [].concat(component_def.structure||[])
					.concat(type_def.structure||[]);
				
				if(allStructureArray.length >0){
					for(var i=0;i<allStructureArray.length;i++){
						var dsCmpName = allStructureArray[i]['component-name'];
						var dsComponent_def = LUI.PageDesigner.instance._components[dsCmpName];
						if(dsComponent_def.type == 'dataset' || dsComponent_def.type == 'record'){
							var newNode = LUI.PageDesigner.instance.addComponentNode(selectedNode,dsCmpName,'数据源');
							if(newNode!=null){
								newNode.data.name = selectedNode.data.name+'_datasource_';
								newNode.data.label = '私有数据源';
							}
							break;
						}
					}
				}
			}
		}else if(newVal!=null){
			//隐藏公共数据源字段
			eventSource.form.getField('datasourceName').setHidden(true);
			//如果私有数据源节点存在 删除
			if(privateDatasourceNode!=null){
				LUI.PageDesigner.instance._pageCmpTree.removeNode(privateDatasourceNode,true);
			}
		}
		//判断当前节点是否有效
		LUI.PageDesigner.instance.validateNode(selectedNode);
//	}
}

/**
 * 通知 “功能”或“实体类”字段 重新设置选项
 */
function setGNSTLOptions(eventSource,eventTarget,event,eventOriginal){
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var gongNengDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'gongNengDH');
	if(!gongNengDHField.isHidden()){
		gongNengDHField.initOptions();
	}else{
		var shiTiLeiDHField = LUI.PageDesigner.instance.getFormField(selectedNode,'shiTiLeiDH');
		if(!shiTiLeiDHField.isHidden()){
			shiTiLeiDHField.initOptions();
		}
	}
	
}

/**
 * 为表单下的field显示设置了关联元素
 * 检查目标元素的大小 设置当前field的宽度、高度
 * @param typeName
 * @returns {Array}
 */
function setFormFieldRenderTo(eventSource,eventTarget,event,eventOriginal){
	var newVal = event.params.newValue;
	var isInitial = event.params.isInitial;
	
	if(newVal!=null && newVal.length >0 && !isInitial){
		//当前选中的field节点
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var selectedNode = selectedNodes[0];
		//上级的form节点
		var formNode = selectedNode.getParentNode().getParentNode();
		//目标元素的大小
		var formRenderTo = formNode.data.renderto;
		var renderTarget = $(formRenderTo+" "+newVal);
		if(renderTarget.length == 1){
			var width = renderTarget.outerWidth();
			var height = renderTarget.outerHeight();
			//目标元素
			if(selectedNode.record.hasField('width')){
				selectedNode.record.setFieldValue('width',width+'px');
			}
			
			if(selectedNode.record.hasField('height')){
				selectedNode.record.setFieldValue('height',height+'px');
			}
			
			//还有可能用字符类型的字段 关联了text
			if(renderTarget.is('textarea') ){
				var fieldType = selectedNode.record.getFieldValue('fieldType');
				var component = selectedNode.record.getFieldValue('component');
				if(fieldType == 'string' && component!= 'stringTextEditor'){
					eventSource.form.setFieldValue('component','stringTextEditor');
					LUI.Message.info("提示","关联了textarea元素的字符字段，已自动选择文本控件!");
				}
			}
		}else if(renderTarget.length > 1){
			LUI.Message.info("警告","id为"+newVal+"的html元素("+formRenderTo+" "+newVal+")不唯一!");
		}else{
			LUI.Message.info("警告","id为"+newVal+"的html元素("+formRenderTo+" "+newVal+")不存在!");
		}
		
	}
}



/**
 * 为列表下的column 显示设置了关联元素
 * @param typeName
 * @returns {Array}
 */
function setGridColumnRenderTo(eventSource,eventTarget,event,eventOriginal){
	var newVal = event.params.newValue;
	var oldVal = event.params.oldValue;
	var isInitial = event.params.isInitial;
	
	if(newVal!=null && newVal != oldVal && !isInitial){
		//当前选中的grid节点
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var selectedNode = selectedNodes[0];
		//目标元素
		var fieldValue = selectedNode.record.getFieldValue('renderTemplate');
		if(fieldValue == null || fieldValue.length==0){
			var nameValue = selectedNode.record.getFieldValue('name');
			selectedNode.record.setFieldValue('renderTemplate',"{{"+nameValue+"}}");
		}
		
	}
}

/**
 * 为列表下的column 显示设置了关联元素
 * @param typeName
 * @returns {Array}
 */
function setTabSelectorRenderTo(eventSource,eventTarget,event,eventOriginal){
	var newVal = event.params.newValue;
	var oldVal = event.params.oldValue;
	var isInitial = event.params.isInitial;
	
	if(newVal!=null && newVal != oldVal && !isInitial){
		//当前选中的grid节点
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var selectedNode = selectedNodes[0];
		//目标元素
		//从第一个li中 取选中的效果
		var firstLI = $("#_pageContent "+newVal+" li:first");
		var activeClassValue = selectedNode.record.getFieldValue('activeClass');
		if( activeClassValue == null || activeClassValue.length==0 ){
			selectedNode.record.setFieldValue('activeClass',firstLI.attr("class"));
		}
		
		//以第二个li为准 是disable的效果
		var nextLI = firstLI.next();
		var disableClassValue = selectedNode.record.getFieldValue('disableClass');
		if(disableClassValue == null || disableClassValue.length==0){
			selectedNode.record.setFieldValue('disableClass',nextLI.attr("class"));
		}
		
		//从目标元素的href属性中 取得显示名称
		var labelValue = selectedNode.record.getFieldValue('label');
		if(labelValue == null || labelValue.length==0 || labelValue == selectedNode.component.label){
			var elLiTexts = $("#_pageContent "+newVal+" li").text();
			if( elLiTexts != null && elLiTexts.length>=0 ){
				selectedNode.record.setFieldValue('label',elLiTexts);
			}			
		}
	}
}

		
/**
 * 为列表编辑设置了关联元素
 * @param typeName
 * @returns {Array}
 */
function setEditGridRenderTo(){
	
}

/**
 * 为列表操作设置了关联元素
 * @param typeName
 * @returns {Array}
 */
function setOperateGridRenderTo(){
	
}

/**
 * 为链接设置了关联元素
 * @param typeName
 * @returns {Array}
 */
function setLinkRenderTo(eventSource,eventTarget,event,eventOriginal){
	var newVal = event.params.newValue;
	var oldVal = event.params.oldValue;
	var isInitial = event.params.isInitial;
	
	if(newVal!=null && !isInitial){
		//当前选中的grid节点
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var selectedNode = selectedNodes[0];
		//目标元素
		var el = $("#_pageContent "+newVal);
		//从目标元素的target属性中 取得目标
		var target = el.attr("target");
		if( target != null && target.length>=0 ){
			selectedNode.record.setFieldValue('target',target);
		}
		//从目标元素的href属性中 取得链接地址 
		var href = el.attr("href");
		if( href != null && href.length>=0 ){
			selectedNode.record.setFieldValue('href',href);
		}
		//从目标元素的href属性中 取得显示名称
		var labelFieldValue = selectedNode.record.getFieldValue('label');
		if(labelFieldValue == null || labelFieldValue.length==0 || labelFieldValue == selectedNode.component.label){
			if( el.text() != null && el.text().length>=0 ){
				selectedNode.record.setFieldValue('label',el.text());
			}			
		}
	}
}

/**
 * 为变量设置生成模板
 * @param typeName
 * @returns {Array}
 */
function setVariableRenderTemplate(eventSource,eventTarget,event,eventOriginal){
	var newVal = event.params.newValue;
	var oldVal = event.params.oldValue;
	var isInitial = event.params.isInitial;
	
	if(newVal!=null && !isInitial){
		//当前选中的grid节点
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var selectedNode = selectedNodes[0];
		//name字段值
		var nameFieldValue = selectedNode.record.getFieldValue('name');
		//设置模板表达式
		if(nameFieldValue!=null && nameFieldValue.length >0 && selectedNode.record.hasField('renderTemplate')){
			selectedNode.record.setFieldValue('renderTemplate',"{{"+nameFieldValue+"}}");
		}
	}
}

/**
 * 为显示/隐藏操作设置了关联元素
 * @param typeName
 * @returns {Array}
 */
function setShowHideRenderTo(eventSource,eventTarget,event,eventOriginal){
	var newVal = event.params.newValue;
	var oldVal = event.params.oldValue;
	var isInitial = event.params.isInitial;
	
	if(newVal!=null && !isInitial){
		//当前选中的grid节点
		var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
		var selectedNode = selectedNodes[0];
		//目标元素
		var el = $("#_pageContent "+newVal);
		//从目标元素的href属性中 取得目标元素名称
		var href = el.attr("href");
		if(href != null && href.length>0){
			selectedNode.record.setFieldValue('renderto',href);
		}
		//从目标元素的href属性中 取得链接地址 
		var toggleClass = el.attr("toggleClass");
		if( toggleClass != null && toggleClass.length>=0 ){
			var toggleClassArray = toggleClass.split(' ');
			
			if(toggleClassArray.length >0 && toggleClassArray[0] != null && toggleClassArray[0].length>=0 ){
				selectedNode.record.setValue('showClass',toggleClassArray[0]);
			}
			//从目标元素的href属性中 取得链接地址 
			if(toggleClassArray.length >1 && toggleClassArray[1] != null && toggleClassArray[1].length>=0 ){
				selectedNode.record.setValue('hiddenClass',toggleClassArray[1]);
			}
		}
		//从目标元素的label属性中 取得显示名称
		var labelFieldValue = selectedNode.record.getFieldValue('label');
		if(labelFieldValue == null || labelFieldValue.length==0 || labelFieldValue == selectedNode.component.label){
			if( el.text() != null && el.text().length>=0 ){
				selectedNode.record.setFieldValue('label',el.text());
			}			
		}
	}
}


/**
 * 表格中的列 设置是否有编辑控件
 * @param {} eventSource
 * @param {} eventTarget
 * @param {} event
 * @param {} eventOriginal
 */
//function onColumnEditorChanged(eventSource,eventTarget,event,eventOriginal){
//	var newVal = event.params.newValue;
//	
//	//当前选中的column节点
//	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
//	var selectedNode = selectedNodes[0];
//	//当前节点下是否存在编辑节点
//	var hasChildNode = false;
//	if(selectedNode.children!=null && selectedNode.children.length >0){
//		hasChildNode = true;
//	}
//			
//	if(newVal == 'false'){
//		//如果私有数据源节点存在 删除
//		if(hasChildNode){
//			LUI.PageDesigner.instance._pageCmpTree.removeChildNodes(selectedNode);
//		}
//	}else if(newVal == 'true'){
//		//如果私有数据源节点不存在 添加
//		if(!hasChildNode){
//			var newNode = LUI.PageDesigner.instance.addTypeNode(selectedNode,selectedNode.data.fieldType+'CellField',selectedNode.data.label);
//			if(newNode!=null){
//				newNode.data.fieldType = selectedNode.data.fieldType;
//			}
//		}
//	}
//	
//	//判断当前节点是否有效
//	LUI.PageDesigner.instance.validateNode(selectedNode); 
//}

//根据上级的表列节点的类型 确定单元格编辑控件的可选范围
//function getComponentOfColumn(){
//
//	//当前选中节点
//	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
//	var selectedNode = selectedNodes[0];
//	//
//	var parentGridColumnNode = selectedNode.getParentNode();
//	var typeName = parentGridColumnNode.data.fieldType+"CellField";
//	var options = [];
//	for(  var cmpKey in  LUI.PageDesigner.instance._components){
//		var comp = LUI.PageDesigner.instance._components[cmpKey];
//		if(comp.type == typeName && comp.isAppendable != 'false'){
//			options[options.length] = {text:comp.label,value:comp.name};
//		}
//	}
//	return options;
//
//}

function getWorkflowCaoZuoOptions(){
	
	var options = [];
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];
	
	var wokflowFormNode = selectedNode.getParentNode().getParentNode();
	
	var gongNengDH =  wokflowFormNode.data.gongNengDH;
	if(gongNengDH == null){
		LUI.Message.info("警告","流程表单节点未设置流程功能代号!");
	}else{
		for(var i=0;i<LUI.PageDesigner.instance._gongNengs.length;i++ ){
			var gongNengData = LUI.PageDesigner.instance._gongNengs[i];
			if(gongNengData.gongNengDH == gongNengDH){
				for(var j=0;j<gongNengData.czs.length;j++ ){
					var caoZuoData = gongNengData.czs[j];
					options[options.length] = {text:caoZuoData.caoZuoMC,value:caoZuoData.caoZuoDH};
				}
				break;
			}
		}
	}
	return options;

}

//为分级节点 取得数据源属性作为下拉选项
function getLevelFieldOptions(){
	var options = [];
	//当前选中的节点
	var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
	var selectedNode = selectedNodes[0];

	var datasourceNode = null;
	if(selectedNode.data.datasourceType == 'public' || selectedNode.data.datasourceType == null){
		datasourceNode = LUI.PageDesigner.instance.getDatasourceNodeByName(cmpNode.data.datasourceName);
	}else{
		//在下级节点中 查找数据源节点。。。
		if(selectedNode.children!=null && selectedNode.children.length >0){
			for(var i=0;i<selectedNode.children.length;i++){
				var subComponentName = selectedNode.children[i].data.component;
				var subComponent_def = LUI.PageDesigner.instance._components[subComponentName];
				if(subComponent_def.type == 'dataset' ){
					datasourceNode = selectedNode.children[i];
					break;
				}
			}
		}
	}
	
	//查找数据源节点下的属性列表节点
	if(datasourceNode!=null){
		var propertiesNode = null;
		if(datasourceNode.children!=null){
			for(var i=0;i<datasourceNode.children.length;i++ ){
				var cNode = datasourceNode.children[i];
				if(cNode.component.type == 'properties'){
					propertiesNode= cNode;
					break;
				}
			}
		}
		
		if(propertiesNode==null){
			LUI.Message.error("取属性选项失败","未找到properties节点！");
		}else{
			//循环所有属性节点
			if(propertiesNode.children!=null){
				for(var i=0;i<propertiesNode.children.length;i++ ){
					options[options.length] = {
						text:propertiesNode.children[i].data.label,
						value:propertiesNode.children[i].data.name,
						type:propertiesNode.children[i].data.fieldType
					};
				}
			}
		}
	}else{
		LUI.Message.error("取属性选项失败","未找到datasource节点！");
	}
	
	return options;

}