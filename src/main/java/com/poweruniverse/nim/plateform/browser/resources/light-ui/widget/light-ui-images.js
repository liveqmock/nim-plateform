//alert("LUI.Form.Field");

/**
 * 显示用的字段定义
 */
LUI.WorkflowImg = {
	instances:LUI.Set.createNew(),
	createNew:function(imgCfg){
		var imgConfig = $.extend({},imgCfg);
		
		var imgInst = $.extend({
			config:imgCfg,
			renderType:'rela',
			el:null,
			rendered:false,
			//创建页面元素
			load:function(id){
				this.render(id);
			},
			render:function(id){
				if(id!=null){
					this.id = id;
				}
				if(this.renderType != 'none' ){
					var width = this.width;
					if(width == null){
						width = '998px';
					}
					var height = this.height;
					if(height == null){
						height = '240px';
					}
					var dt = new Date().getTime();
					$(this.renderto).html('<img class="adm-xny-fl" src="bpmn/diagram/'+this.gongNengDH+'/'+this.id+'/'+dt+'" style="width:'+width+';height:'+height+';">');
					this.rendered = true;
				}
			}
		},imgCfg);
		
		if(imgInst.autoRender == 'true'){
			imgInst.render();
		}
		
		if(LUI.WorkflowImg.hasInstance(imgInst.name)){
			LUI.Message.warn('警告','同名流程图(LUI.WorkflowImg:'+imgInst.name+')已存在！');
		}
		LUI.WorkflowImg.instances.put(imgInst);
		return imgInst;
	},
	hasInstance:function(imgName){
		var imgInstance = null;
		for(var i =0;i<LUI.WorkflowImg.instances.size();i++){
			var _instance = LUI.WorkflowImg.instances.get(i);
			if(_instance.name == imgName){
				return true;
			}
		}
		return false;
	},
	getInstance:function(imgName){
		var imgInstance = null;
		for(var i =0;i<LUI.WorkflowImg.instances.size();i++){
			var _instance = LUI.WorkflowImg.instances.get(i);
			if(_instance.name == imgName){
				imgInstance = _instance;
				break;
			}
		}
		return imgInstance;
	},
	removeInstance:function(imgName){
		for(var i =0;i<LUI.WorkflowImg.instances.size();i++){
			var _instance = LUI.WorkflowImg.instances.get(i);
			if(_instance.name == imgName){
				LUI.WorkflowImg.instances.remove(_instance);
				break;
			}
		}
		
	}
};

