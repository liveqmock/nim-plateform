// 因为columnName字段值已改变 重新显示节点相应列的内容
Core4j.toolbox.TableTree4j.prototype.refreshNode = function (node, columnName) {
	var rowObject= node.rowObj;
	var index = rowObject.rowIndex;
	for(var i=0,n=this.columns.length;i<n;i++){

		var tmpColum=this.columns[i];
		var value=null;
		var width=null;
		var renderFunction=null;
		var isNodeClick=false;
		
		var dateValueEl= null;
		if(tmpColum.isNodeClick!=null&&(tmpColum.isNodeClick==true||tmpColum.isNodeClick=='true')){
			dateValueEl= $('#'+rowObject.id+'_nodeclick_vl')[0];
		}else{
			dateValueEl= $('#'+rowObject.id+'_'+i+'_vl')[0];
		}

		if(dateValueEl!=null){
			if(node.dataObject!=null){
				value=eval("node.dataObject."+tmpColum.dataIndex);
				width=tmpColum.width;
				renderFunction=tmpColum.renderFunction;
			}

			var showvalue=null;
			if(renderFunction!=null&&typeof(renderFunction)=='function'){
				showvalue=renderFunction({
					dataValue:value,
					node:node,
					tabletreeObj:this,
					rowObj:rowObject,
					rowIndex:index,
					container:dateValueEl,
					columnIndex:i
				});
			}else{
				showvalue=value;
			}
			if (showvalue != null) {
				if (typeof(showvalue) == 'object') {
					dateValueEl.innerHTML = LUI.Util.stringify(showvalue);
				} else {
					dateValueEl.innerHTML = showvalue;
				}
			}else{
				dateValueEl.innerHTML = '';
			}
		}
		
		//!!!fire onBuildTreeAddNodeEvent
		if(this.onBuildTreeAddNodeEvents!=null){
			for(var t1=0,n1=this.onBuildTreeAddNodeEvents.length;t1<n1;t1++){
				var onBuildTreeAddNodeEvent=this.onBuildTreeAddNodeEvents[t1];
				if(onBuildTreeAddNodeEvent!=null&&typeof(onBuildTreeAddNodeEvent)=='function'){
					onBuildTreeAddNodeEvent(node,this);
				}
			}
		}
	}
}

Core4j.toolbox.TableTree4j.prototype.filter = function (filterFunc) {
	for(var i=0;i<this.rootNodes.length;i++){
		this.rootNodes[i].matchFilter(filterFunc);
	}
}


Core4j.toolbox.TableTreeNode.prototype.matchFilter = function (filterFunc) {
	var text = $(this.rowObj).text().trim();
	var isMatch = filterFunc.apply(this,[text]);
	
	if(this.childs!=null && this.childs.length >0){
		for(var i=0;i<this.childs.length;i++){
			if(this.childs[i].matchFilter(filterFunc)){
				isMatch = true;
			}
		}
	}
	
	if(!isMatch){
		//隐藏此节点
		$(this.rowObj).css("display","none");
	}else{
		//显示此节点
		$(this.rowObj).css("display","table-row");
	}
}