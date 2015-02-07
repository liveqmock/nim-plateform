//alert("LUI.Widget.elWin");

LUI.Widget.elWin = {
	html:'<div title="选择元素"><div id="container"></div></div>',
	select:function(firstChoosedEl,lastChoosedEl,callback){
		this.el = $(this.html);
		
		var elTreeData = {text:LUI.Widget.elWin.getDisplayTextOfEl($(lastChoosedEl)),el:$(lastChoosedEl)};
		var parentEl = $(lastChoosedEl).parent();
		while(parentEl!=null && parentEl.closest($(firstChoosedEl)).length > 0){
			elTreeData = {text:LUI.Widget.elWin.getDisplayTextOfEl(parentEl),children:[elTreeData],el:parentEl};
			parentEl = parentEl.parent();
		}
		
		//创建树树:cmp_tree_17对象
		var _elTreeObj = LUI.Tree.JSONTree.createNew({
			component:"tree",
			border:"false",
			name:"elTree",
			autoRender:"true",
			renderType:"replace",
			width:"100%",
			height:"100%",
			renderto:this.el.children('div#container'),
			renderTemplate:"{{{text}}}",
			requestChildrenData:function(node){
				var childrenData = [];
				var childEls =  node.data.el.children().each(function(index,el){
					var cEl = $(el);
					childrenData[childrenData.length] = {text:LUI.Widget.elWin.getDisplayTextOfEl(cEl),el:cEl};
				});
				return childrenData;
			}
		}); 

		this.el.dialog({
			 modal: true,
			 width:450,
			 height:300,
			 autoOpen: false,
//			 show: { effect: "scale", percent:100,duration: 400 },
//			 hide: { effect: "scale", percent: 0 ,duration: 400},
			 open:function(){
				$(".ui-dialog-titlebar-close", $(this).parent()).hide();
			 },
			 close:function(){
			 	_elTreeObj.destroy();
			 	
				 $(this).dialog( "destroy" );
				 $(this).remove();
			 },
			 buttons: [{ 
				 text: "确定",
				 click:function() {
				 	//检查tree的选中情况
				 	if(_elTreeObj.selectedNodes.size()>0){
				 		var nodeData = _elTreeObj.selectedNodes.get(0).data;
						if(callback!=null){
							callback.call(this,[nodeData]);
						}
						$( this ).dialog( "close" );
				 	}else{
				 		LUI.Message.info("提示","请选择目标元素!");
				 	}
				 }
			},{ 
				text: "关闭",
				click:function() {
					 $( this ).dialog( "close" );
				 }
			}]
		});
		_elTreeObj.addListener(_elTreeObj.events.nodeClick,this,function(source,target,event){
    		var currentNodeEl = $(event.params.node.data.el);
			var currentColor = currentNodeEl.css( 'background-color' );
    		currentNodeEl.animate( { 'background-color': '#FFE6B0' }, 1000  / 2 );
    		currentNodeEl.animate( { 'background-color': currentColor }, 1000  );
		});

		_elTreeObj.load([elTreeData]);
		_elTreeObj.getFirstRootNode().expand(true);
//		_elTreeObj.render(containerEl);
		this.el.dialog( "open" );
		
	},
	getDisplayTextOfEl:function (jqElObj){
		var elText = jqElObj[0].tagName;
		
		var elId = jqElObj.attr('id');
		if(elId!=null && elId.length >0){
			elText += '<span style="color: rgb(255, 0, 0);">#'+elId+'</span>';
		}
		
		var elClass = jqElObj.attr('class');
		if(elClass!=null && elClass.length >0){
			elText += "."+(elClass.split(' ')[0]);
		}
		return elText;
	}
};