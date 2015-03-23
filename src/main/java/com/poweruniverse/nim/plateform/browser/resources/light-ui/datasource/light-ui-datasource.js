//alert("LUI.Datasource");
//
/**
 * 所有数据集的祖先，不要直接创建LUI.Dataset的实例
 * 子类需重写 doLoad方法
 */
LUI.Datasource = {
	uniqueId:0,
	instances:LUI.Set.createNew(),
	createNew:function(config){
		//检查参数
		if(config.name==null){
			LUI.Message.info("错误","必须为数据集提供name参数!");
			return null;
		}
		//参数的默认值
		var datasetConfig = $.extend({
			id:'_dataset_'+ (++LUI.Datasource.uniqueId),
			loaded:false,
			loadTimes:0,
			component:{
				type:'datasource'
			},
			name:null,
			label:null,
			filters:[],
			parameters:{},//用于java数据源
			fields:config.fields,
			primaryFieldName:null,
			lastParams:{
				start:config.start||0,
				limit:config.limit||0,
				xiTongDH:config.xiTongDH,
				fields:config.fields
			},//最后一次调用的参数
			records:LUI.Map.createNew(),//有状态的数据记录 以record内部序号为索引
			lastResult:null,//最后得到的数据 格式为{ start:0,limit:0,totalCount:0,rows:[{},{},{}]}
			events:{
				load:'dataset_load',//加载记录（初始化）
				reset:'dataset_reset',//重置 取消所有修改
				remove:'dataset_remove',//删除记录
				add:'dataset_add',//增加记录
				submit:'dataset_submit',//提交记录
				save:'dataset_save'//保存记录
			},
			//设置或添加过滤条件
			setFilter:function(property,operator,value){
				var filter = this.getFilter(property);
				if(filter!=null){
					filter.operator = operator;
					filter.value = value;
				}else{
					this.addFilter(property,operator,value);
				}
			},
			//添加一个基础过滤条件
			addFilter:function(property,operator,value){
				this.filters[this.filters.length] = {property:property,operator:operator,value:value};
			},
			removeFilter:function(property){
				var filter = null;
				if(this.filters.length >0 ){
					for(var i=0;i<this.filters.length;i++){
						if(this.filters[i].property == property){
							filter = this.filters[i];
							this.filters.splice(i,1);
							break;
						}
					}
				}
				return filter;
			},
			getFilter:function(property){
				var filter = null;
				if(this.filters.length >0 ){
					for(var i=0;i<this.filters.length;i++){
						if(this.filters[i].property == property){
							filter = this.filters[i];
							break;
						}
					}
				}
				return filter;
			},
			/**
			 * 调用此方法 通知数据源向服务器请求数据
			 * 参数：[{property:'xiangMuMC',operator:'like',value:'山东'},{operator:'sql',sql:'山东'}]
			 */
			load:function(params,callback1,isBothAffect,isAppend){
				this.loadTimes =this.loadTimes+1;
				console.log("数据源"+this.name+"("+this.label+")加载，第"+this.loadTimes+"次  >>>");
				
				var cParams = params||{};
				//结合数据源定义的filters和传递来的filters 作为本次查询的数据源条件
				var cFilter = (cParams.filters||[]).concat(this.filters||[]);
				cParams.filters = cFilter;
				//结合数据源定义的parameters和传递来的parameters 作为本次查询的数据源条件
//				var cparameters = (cParams.parameters||[]).concat(this.parameters||{});
				var cparameters = $.extend((cParams.parameters||{}), this.parameters||{});
				cParams.parameters = cparameters;
				
				//还有机会修改limit fields sorts 
				var currentParams =  $.extend(this.lastParams, cParams);
				//每次重新查询 都从0开始
				currentParams.start = 0;
				
				var loadingMsgId = LUI.Page.instance.mask('数据源('+this.label+')加载数据...');
				
				var _this = this;
				this.doLoad(currentParams,function(params,result){
					if(callback1!=null){
						if(isBothAffect!=null && isBothAffect == true){
							//重新查询  需要清空原有状态
							if(isAppend==null || isAppend == false){
								_this.lastResult = null;
								_this.records = LUI.Map.createNew();
							}
							_this.onLoad(params,result);
						}
						callback1.apply(_this,[params,result]);
					}else{
						//重新查询  需要清空原有状态
						if(isAppend==null || isAppend == false){
							_this.lastResult = null;
							_this.records = LUI.Map.createNew();
						}
						_this.onLoad(params,result);
					}
					
					LUI.Page.instance.unmask(loadingMsgId);
				});
			},
			page:function(pageNum){
				var newStart = this.lastParams.limit * pageNum;
				if(!this.loaded || this.lastParams.start != newStart){
					//翻页需要清空原有记录
					this.lastResult = null;
					this.records = LUI.Map.createNew();
					
					this.lastParams.start = newStart;
					this.doLoad(this.lastParams,this.onLoad);
				}
			},
			/**
			 * 调用此方法 通知数据源加载本地数据
			 * 参数：[{property:'xiangMuMC',operator:'like',value:'山东'},{operator:'sql',sql:'山东'}]
			 */
			loadData:function(result,isAppend){
				this.loadTimes =this.loadTimes+1;
				console.log("数据源"+this.name+"("+this.label+")初始化，第"+this.loadTimes+"次");
				if(isAppend==null || isAppend == false){
					this.lastResult = null;
					this.records = LUI.Map.createNew();
				}
				this.onLoad(this.lastParams,result);
			},
			doLoad:function(params,callback){
				LUI.Message.info("信息","请在数据集子类中覆盖此方法，提供从服务器端取数的代码!");
			},
			onLoad:function(params,result){
				this.loaded = true;
				this.lastParams = params;
				this.lastResult = result;
				//根据当前取得的数据 创建record
				var records = [];
				for(var i=0;i<this.lastResult.rows.length;i++){
					var rowData = this.lastResult.rows[i];
					var r = LUI.Record.createNew(this.fields,this.primaryFieldName);
					
					if(r!=null){
						r.loadData(rowData);
						this.records.put(r.id,r);
//						rowData._record_id = r.id; 
						records[records.length] = r;
						
						this.fireEvent(this.events.add,{
							record:r
						});
						
						r.addListener(r.events.remove,this,function(record,datasource,event,eventOrigin){
							this.removeRecord(record);
						});
					}
				}
			
				this.fireEvent(this.events.load,{
					params:this.lastParams,
					result:this.lastResult,
					records:records
				});
			},
			getResult:function(){
				return this.lastResult;
			},
			//兼容老代码
			getData:function(){
				return this.getResult();
			},
			getRow:function(index){
				return this.getResult().rows[index];
			},
			getRows:function(){
				return this.getResult().rows;
			},
			getRecordByPKValue:function(_pk_val){
				for(var i=0;i<this.records.size();i++){
					var r = this.getRecord(i);
					if(r.primaryFieldValue == _pk_val){
						return r;
					}
				}
				return null;
			},
			size:function(){
				return this.records.size();
			},
			clear:function(){
				this.lastResult = null;
				this.records = LUI.Map.createNew();
			},
			getRecordById:function(_rec_id){
				return this.records.get(_rec_id);
			},
			getRecord:function(index){
				var r = null;
				if(index!=null){
					if(typeof(index) == 'number'){
						//按序号得到
						r = this.records.array[index];
					}else if(typeof(index) == 'object' && index._record_id !=null){
						//按key得到
						r = this.records.get(index._record_id);
					}else{
						LUI.Message.info("getRecord失败","错误的参数！!");
					}
				}
				return r;
			},
			addRecord:function(rowData){
				var r = LUI.Record.createNew(this.fields,this.primaryFieldName);
				
				if(r!=null){
					r.loadData({});
					for(var p in rowData){
						r.setFieldValue(p,rowData[p])
					}
					this.records.put(r.id,r);
//					rowData._record_id = r.id; 
					
					this.fireEvent(this.events.add,{
						record:r
					});
					
					r.addListener(r.events.remove,this,function(record,datasource,event,eventOrigin){
						this.removeRecord(record);
					});
				}
				
				return r;
			},
			removeRecord:function(record){
				for(var i=0;i<this.records.size();i++){
					var r = this.getRecord(i);
					if(r.id == record.id){
						this.records.remove(r.id);
						
						this.fireEvent(this.events.remove,{record:r});
						break;
					}
				}
			},
			_onSave:function(xiTongDH_p,gongNengDH_p,caoZuoDH_p,isCommit,callback){
				var xiTongDH = xiTongDH_p||this.xiTongDH;
				var gongNengDH = gongNengDH_p||this.gongNengDH;
				var caoZuoDH = caoZuoDH_p||this.caoZuoDH;
				//显示等待mask
				var dsSavingMsgId = LUI.Page.instance.mask('数据源('+this.label+')正在保存，请稍候...');
				var submitData = {};
				var insertedRows = [];
				var modifiedRows = [];
				var deletedRows = [];
				var submitCount = 0;
				for(var i=0;i<this.records.size();i++){
					var r = this.getRecord(i);
					if(r.isDeleted && !r.isNew){
						//旧数据 删除 仅传递主键值
						var removeData = {};
						removeData[r.primaryFieldName] = r.primaryFieldValue;
						
						deletedRows[deletedRows.length] = removeData;
						submitCount++;
					}else if(r.isNew && r.isModified()){
						//新数据 修改
						insertedRows[insertedRows.length] = r.getSubmitData(true);
						submitCount++;
					}else if(!r.isNew && r.isModified()){
						//旧数据 修改
						modifiedRows[modifiedRows.length] = r.getSubmitData(true);
						submitCount++;
					}else if(isCommit && !r.isModified() && r.isNew){
						//旧数据 未修改 强制保存 仅传递主键值
						var removeData = {};
						removeData[r.primaryFieldName] = r.primaryFieldValue;
						
						modifiedRows[modifiedRows.length] = removeData;
						submitCount++;
					}
				}
				
				if(submitCount ==0 ){
					//无待提交的数据
					//关闭等待的mask
					LUI.Page.instance.unmask(dsSavingMsgId);
					if(callback!=null){
						callback.apply(this,[{success:true,info:'未修改数据'}])
					}else{
						//未保存 且无回调函数 弹出提示信息
						LUI.Message.info("信息","未找到需要保存的数据！");
					}
					return;
				}
				
				if(insertedRows.length >0){
					submitData.inserted = insertedRows;
				}
				if(modifiedRows.length >0){
					submitData.modified = modifiedRows;
				}
				if(deletedRows.length >0){
					submitData.deleted = deletedRows;
				}
				
				$.ajax({
					url: "/jservice/", 
					type: "POST", 
					data:{
						component:'nim-data',
						service:'data',
						method:'save',
						arguments:"{" +
							"xiTongDH:'"+xiTongDH+"'," +
							"gongNengDH:'"+gongNengDH+"'," +
							"caoZuoDH:'"+caoZuoDH+"'," +
							"isCommit:"+isCommit+"," +
							"submitData:"+LUI.Util.stringify(submitData)+
						"}"
					},
					dataType:"json",
					context:this,
					success: function(result){
						if(result.success){
							//服务器返回的rows 是包括主、从表的全部记录
							if(result.rows!=null){
								for(var i=0;i<result.rows.length;i++){
									var r = LUI.Record.getInstance(result.rows[i]._record_id);
									r.saveOK(result.rows[i]);
								}
							}
						}else{
							LUI.Message.info("保存失败",result.errorMsg);
						}
						//只向回调函数传递是否成功的消息
						var ret = {
							success:result.success,
							errorMsg:result.errorMsg
						}
						if(callback!=null){
							callback.apply(this,[ret])
						}
						//关闭等待的mask
						LUI.Page.instance.unmask(dsSavingMsgId);
					},
					error:function(){
						LUI.Message.info("登陆失败","访问服务器失败！");
						//关闭等待的mask
						LUI.Page.instance.unmask(dsSavingMsgId);
					}
				});
			},
			save:function(xiTongDH_p,gongNengDH_p,caoZuoDH_p,callback){
				//保存当前新增、修改或删除的数据
				this._onSave(xiTongDH_p,gongNengDH_p,caoZuoDH_p,false,function(result){
					if(callback!=null){
						callback.apply(this,[result])
					}
					this.fireEvent(this.events.save,result,this);
				});
			},
			submit:function(xiTongDH_p,gongNengDH_p,caoZuoDH_p,callback){
				//提交全部数据
				//1、未修改或删除的 也要提交数据主键值
				this._onSave(xiTongDH_p,gongNengDH_p,caoZuoDH_p,true,function(result){
					if(callback!=null){
						callback.apply(this,[result])
					}
					this.fireEvent(this.events.submit,result,this);
				});
			},
			destroy:function(){
				for(var i=0;i<this.records.size();i++){
					var r = this.getRecord(i);
					r.destroy();
				}
				this.records.removeAll();
				
				this.removeAllListener();
				LUI.Datasource.instances.remove(this);
			}
		},config);
		//创建datasource对象
		var datasetInstance = $.extend(LUI.Widget.createNew(),datasetConfig);
		//登记此datasource
		if(LUI.Datasource.hasInstance(datasetInstance.name)){
			LUI.Message.warn('警告','同名数据源控件(LUI.Datasource:'+datasetInstance.name+')已存在！');
		}
		LUI.Datasource.instances.put(datasetInstance);
		//事件监听
		if(datasetInstance.listenerDefs!=null){
			if(datasetInstance.listenerDefs.onLoad!=null){
				var onLoadFunc = window[datasetInstance.listenerDefs.onLoad];
				if(onLoadFunc==null){
					LUI.Message.warn('警告','数据源'+datasetConfig.label+'onLoad事件的处理函数('+datasetInstance.listenerDefs.onLoad+')不存在！');
				}else{
					datasetInstance.addListener(datasetInstance.events.load,null,onLoadFunc);
				}
			}
			if(datasetInstance.listenerDefs.onSave!=null){
				var onSaveFunc = window[datasetInstance.listenerDefs.onSave];
				if(onSaveFunc==null){
					LUI.Message.warn('警告','数据源'+datasetConfig.label+'onSave事件的处理函数('+datasetInstance.listenerDefs.onSave+')不存在！');
				}else{
					datasetInstance.addListener(datasetInstance.events.save,null,onSaveFunc);
				}
			}
			if(datasetInstance.listenerDefs.onSubmit!=null){
				var onSubmitFunc = window[datasetInstance.listenerDefs.onSubmit];
				if(onSubmitFunc==null){
					LUI.Message.warn('警告','数据源'+datasetConfig.label+'onSubmit事件的处理函数('+datasetInstance.listenerDefs.onSubmit+')不存在！');
				}else{
					datasetInstance.addListener(datasetInstance.events.submit,null,onSubmitFunc);
				}
			}
		}
		return datasetInstance;
	},
	hasInstance:function(datasetName){
		var datasetInstance = null;
		for(var i =0;i<LUI.Datasource.instances.size();i++){
			var _instance = LUI.Datasource.instances.get(i);
			if(_instance.name == datasetName){
				return true;
			}
		}
		return false;
	},
	getInstance:function(datasetName){
		var datasetInstance = null;
		for(var i =0;i<LUI.Datasource.instances.size();i++){
			var _instance = LUI.Datasource.instances.get(i);
			if(_instance.name == datasetName){
				datasetInstance = _instance;
				break;
			}
		}
		return datasetInstance;
	},
	removeInstance:function(datasetName){
		for(var i =0;i<LUI.Datasource.instances.size();i++){
			var _instance = LUI.Datasource.instances.get(i);
			if(_instance.name == datasetName){
				LUI.Datasource.instances.remove(_instance);
				break;
			}
		}
	}
};


/**
 * 
 */
LUI.Datasource.javaDataset = {
	createNew:function(config){
		//检查参数
		if(config.className==null){
			LUI.Message.info("错误","必须为数据对象提供className参数!");
			return null;
		}
		if(config.fields==null){
			LUI.Message.info("错误","必须为数据集提供fields参数!");
			return null;
		}
		//参数的默认值
		return LUI.Datasource.createNew($.extend({
			component:{
				type:'datasource',
				name:'javaDataset'
			},
			lastParams:{
				parameters:config.parameters,
				className:config.className,
				start:config.start,
				limit:config.limit
			},
			doLoad:function(params,callback){
				LUI.DataUtils.listJavaData(
					params.className,
					params.start,
					params.limit,
					params.filters,
					params.parameters,
					function(result){
						callback.apply(this,[params,result]);
					},
					this
				);
			}
		},config));
	}
};

/**
 * 
 */
LUI.Datasource.gnDataset = {
	createNew:function(config){
		//检查参数
		if(config.xiTongDH==null){
			LUI.Message.info("错误","必须为数据集"+name+"提供xiTongDH参数!");
			return null;
		}
		if(config.fields==null){
			LUI.Message.info("错误","必须为数据集提供fields参数!");
			return null;
		}
		if(config.gongNengDH==null){
			LUI.Message.info("错误","必须为数据对象提供gongNengDH参数!");
			return null;
		}
		if(config.caoZuoDH==null){
			LUI.Message.info("错误","必须为数据对象提供caoZuoDH参数!");
			return null;
		}
		if(config.primaryFieldName==null){
			LUI.Message.info("错误","必须为数据对象提供primaryFieldName参数!");
			return null;
		}
		//参数的默认值
		return LUI.Datasource.createNew($.extend({
			component:{
				type:'datasource',
				name:'gnDataset'
			},
			lastParams:{
				xiTongDH:config.xiTongDH,
				gongNengDH:config.gongNengDH,
				caoZuoDH:config.caoZuoDH,
				start:config.start,
				limit:config.limit,
				fields:config.fields,
				filters:config.filters,
				sorts:config.sorts
			},
			doLoad:function(params,callback){
				LUI.DataUtils.listGnData(
					params.xiTongDH,
					params.gongNengDH,
					params.caoZuoDH,
					params.start,
					params.limit,
					params.fields,
					params.filters,
					params.sorts,
					function(result){
						callback.apply(this,[params,result]);
					},
					this
				);
			}
		},config));
	}
};

/**
 * 
 */
LUI.Datasource.stlDataset = {
	createNew:function(config){
		if(config.xiTongDH==null){
			LUI.Message.info("错误","必须为数据集"+name+"提供xiTongDH参数!");
			return null;
		}
		if(config.fields==null){
			LUI.Message.info("错误","必须为数据集提供fields参数!");
			return null;
		}
		//检查参数
		if(config.shiTiLeiDH==null){
			LUI.Message.info("错误","必须为数据对象提供shiTiLeiDH参数!");
			return null;
		}
		if(config.primaryFieldName==null){
			LUI.Message.info("错误","必须为数据对象提供primaryFieldName参数!");
			return null;
		}
		//参数的默认值
		return LUI.Datasource.createNew($.extend({
			component:{
				type:'datasource',
				name:'stlDataset'
			},
			lastParams:{
				xiTongDH:config.xiTongDH,
				shiTiLeiDH:config.shiTiLeiDH,
				start:config.start,
				limit:config.limit,
				fields:config.fields,
				filters:config.filters,
				sorts:config.sorts
			},
			doLoad:function(params,callback){
				LUI.DataUtils.listStlData(
					params.xiTongDH,
					params.shiTiLeiDH,
					params.start,
					params.limit,
					params.fields,
					params.filters,
					params.sorts,
					function(result){
						callback.apply(this,[params,result]);
					},
					this
				);
			}
		},config));
	}
};


/**
 * 
 */
LUI.Datasource.sqlDataset = {
	createNew:function(config){
		
		//检查参数
		if(config.xiTongDH==null){
			LUI.Message.info("错误","必须为数据集"+name+"提供xiTongDH参数!");
			return null;
		}
		if(config.fields==null){
			LUI.Message.info("错误","必须为数据集提供fields参数!");
			return null;
		}

		if(config.sql==null){
			LUI.Message.info("错误","必须为数据集提供sql参数!");
			return null;
		}
		//参数的默认值
		return LUI.Datasource.createNew($.extend({
			component:{
				type:'datasource',
				name:'sqlDataset'
			},
			lastParams:{
				xiTongDH:config.xiTongDH,
				sql:config.sql,
				start:config.start,
				limit:config.limit,
				fields:config.fields
			},
			doLoad:function(params,callback){
				LUI.DataUtils.listSqlData(
					params.xiTongDH,
					params.sql,
					params.start,
					params.limit,
					params.fields,
					function(result){
						callback.apply(this,[params,result]);
					},
					this
				);
			}
		},config));
	}
};


/**
 * 
 */
LUI.Datasource.TodoDataset = {
	createNew:function(config){
		//检查参数
		if(config.xiTongDH==null){
			LUI.Message.info("错误","必须为数据集"+name+"提供xiTongDH参数!");
			return null;
		}
		if(config.fields==null){
			LUI.Message.info("错误","必须为数据集提供fields参数!");
			return null;
		}

		if(config.shiTiLeiDH==null){
			LUI.Message.info("错误","必须为数据集提供shiTiLeiDH参数!");
			return null;
		}
		if(config.workflows==null){
			LUI.Message.info("错误","必须为数据集提供workflows参数!");
			return null;
		}
		//参数的默认值
		return LUI.Datasource.createNew($.extend({
			component:{
				type:'datasource',
				name:'todoDataset'
			},
			lastParams:{
				xiTongDH:config.xiTongDH,
				shiTiLeiDH:config.shiTiLeiDH,
				start:config.start,
				limit:config.limit,
				todoOnly:config.todoOnly,
				fields:config.fields,
				filters:config.filters,
				sorts:config.sorts,
				workflows:config.workflows
			},
			doLoad:function(params,callback){
				LUI.DataUtils.listTodoData(
					params.xiTongDH,
					params.shiTiLeiDH,
					params.start,
					params.limit,
					params.todoOnly,
					params.fields,
					params.filters,
					params.sorts,
					params.workflows,
					function(result){
						callback.apply(this,[params,result]);
					},
					this
				);
			}
		},config));
	}
};


/**
 * 
 */
LUI.Datasource.gnDataRecord = {
	createNew:function(config){
		//检查参数
		if(config.xiTongDH==null){
			LUI.Message.info("错误","必须为数据集"+name+"提供xiTongDH参数!");
			return null;
		}
		if(config.fields==null){
			LUI.Message.info("错误","必须为数据集提供fields参数!");
			return null;
		}

		if(config.gongNengDH==null){
			LUI.Message.info("错误","必须为数据对象提供gongNengDH参数!");
			return null;
		}
		if(config.caoZuoDH==null){
			LUI.Message.info("错误","必须为数据对象提供caoZuoDH参数!");
			return null;
		}
		//检查参数
//		if(config.dataId==null){
//			LUI.Message.info("错误","必须为数据对象提供dataId参数!");
//			return null;
//		}
		if(config.primaryFieldName==null){
			LUI.Message.info("错误","必须为数据集提供primaryFieldName参数!");
			return null;
		}

		return LUI.Datasource.createNew($.extend({
			component:{
				type:'datasource',
				name:'gnRecord'
			},
			lastParams:{
				xiTongDH:config.xiTongDH,
				gongNengDH:config.gongNengDH,
				caoZuoDH:config.caoZuoDH,
				dataId:config.dataId,
				fields:config.fields
			},
			doLoad:function(params,callback){
				//按主键过滤
				LUI.DataUtils.loadGnData(
					params.xiTongDH,
					params.gongNengDH,
					params.caoZuoDH,
					params.dataId,
					params.fields,
					function(result){
						callback.apply(this,[params,result]);
					},
					this
				);
			}
		},config));
	}
};

/**
 * 实体类数据对象
 */
LUI.Datasource.stlDataRecord = {
	createNew:function(config){
		//检查参数
		if(config.xiTongDH==null){
			LUI.Message.info("错误","必须为数据集"+name+"提供xiTongDH参数!");
			return null;
		}
		if(config.fields==null){
			LUI.Message.info("错误","必须为数据集提供fields参数!");
			return null;
		}

		if(config.shiTiLeiDH==null){
			LUI.Message.info("错误","必须为数据对象提供shiTiLeiDH参数!");
			return null;
		}
		//检查参数
//		if(config.dataId==null){
//			LUI.Message.info("错误","必须为数据对象提供dataId参数!");
//			return null;
//		}
		if(config.primaryFieldName==null){
			LUI.Message.info("错误","必须为数据集提供primaryFieldName参数!");
			return null;
		}

		//参数的默认值
		return LUI.Datasource.createNew($.extend({
			component:{
				type:'datasource',
				name:'stlRecord'
			},
			lastParams:{
				xiTongDH:config.xiTongDH,
				shiTiLeiDH:config.shiTiLeiDH,
				dataId:config.dataId,
				fields:config.fields
			},
			doLoad:function(params,callback){
				//按主键过滤
				var filters = [{property:this.primaryFieldName,value:params.dataId}];
				
				LUI.DataUtils.listStlData(
					params.xiTongDH,
					params.shiTiLeiDH,
					0,
					1,
					params.fields,
					filters,
					null,
					function(result){
						callback.apply(this,[params,result]);
					},
					this
				);
			}
		},config));
	}
};

/**
 * SQL 数据对象
 */
LUI.Datasource.sqlDataRecord = {
	createNew:function(config){
		//检查参数
		if(config.xiTongDH==null){
			LUI.Message.info("错误","必须为数据集"+name+"提供xiTongDH参数!");
			return null;
		}
		if(config.fields==null){
			LUI.Message.info("错误","必须为数据集提供fields参数!");
			return null;
		}

		if(config.sql==null){
			LUI.Message.info("错误","必须为数据对象提供sql参数!");
			return null;
		}
		//参数的默认值
		return LUI.Datasource.createNew($.extend({
			component:{
				type:'datasource',
				name:'sqlRecord'
			},
			lastParams:{
				xiTongDH:config.xiTongDH,
				sql:config.sql,
				fields:config.fields
			},
			doLoad:function(params,callback){
				LUI.DataUtils.listSqlData(
					params.xiTongDH,
					params.sql,
					0,
					1,
					params.fields,
					function(result){
						callback.apply(this,[params,result]);
					},
					this
				);
			}
		},config));
	}
};




/**
 * 所有数据集的祖先，不要直接创建LUI.Dataset的实例
 * 子类需重写 doLoad方法
 */
LUI.Datasource.sqlDataVariable = {
	uniqueId:0,
	createNew:function(config){
		//检查参数
		if(config.xiTongDH==null){
			LUI.Message.info("错误","必须为数据集"+name+"提供xiTongDH参数!");
			return null;
		}
		if(config.name==null){
			LUI.Message.info("错误","必须为数据变量提供name参数!");
			return null;
		}
		//参数的默认值
		var datasetInstance =LUI.Datasource.createNew($.extend({
			id:'_dataVariable_'+ (++LUI.Datasource.sqlDataVariable.uniqueId),
			loaded:false,
			component:{
				type:'datasource',
				name:'sqlVariable'
			},
			name:null,
			label:null,
			value:null,
			lastParams:{
				xiTongDH:config.xiTongDH,
				sql:config.sql,
				params:{}
			},//最后一次调用的参数
			events:{
				load:'dataset_load'//加载记录（初始化）
			},
			// 调用此方法 通知数据源向服务器请求数据
			//参数：[{property:'xiangMuMC',operator:'like',value:'山东'},{operator:'sql',sql:'山东'}]
			load:function(params,callback1,bothEffect){
				var cParams = params||{};
				//还有机会修改xiTongDH sql
				var currentParams =  $.extend(this.lastParams, cParams);
				var _this = this;
				if(callback1!=null){
					this.doLoad(currentParams,function(params,result){
						if(bothEffect){
							_this.onLoad.apply(this,[params,result]);
						}
						callback1.apply(this,[params,result]);
					});
				}else{
					this.doLoad(currentParams,this.onLoad);
				}
			},
			// 调用此方法 通知数据源加载本地数据
			// 参数：[{property:'xiangMuMC',operator:'like',value:'山东'},{operator:'sql',sql:'山东'}]
			loadData:function(val){
				this.onLoad(this.lastParams,{
					success:true,
					data:val
				});
			},
			doLoad:function(params,callback){
				//
				var sqlString = params.sql;
				if(params.params !=null){
					for(var p in params.params){
						sqlString = sqlString.replace(new RegExp("\\("+p+"\\)","gm"), params.params[p]); 
					}
				}
				
				LUI.DataUtils.getSqlVariable(
					params.xiTongDH,
					sqlString,
					function(result){
						callback.apply(this,[params,result]);
					},
					this
				);
			},
			onLoad:function(params,result){
				this.loaded = true;
				this.value = result.data;
				//根据当前取得的数据 render到目标元素
				if(this.renderto!=null){
					var _data = {};
					_data[this.name] = this.value;
					
					var _template = Handlebars.compile(this.renderTemplate);
					var _compiledValue = _template(_data);
					
					if(this.showThousand == "true"){
						_compiledValue = LUI.Util.thousandth(_compiledValue);
					}
					$(this.renderto).html(_compiledValue);
				}
				//触发onload事件
				this.fireEvent(this.events.load,{
					params:this.lastParams,
					result:result
				});
			},
			//兼容老代码
			getData:function(){
				return this.value;
			}
		},config));
		//事件监听
		if(datasetInstance.listenerDefs!=null){
			if(datasetInstance.listenerDefs.onLoad!=null){
				var onLoadFunc = window[datasetInstance.listenerDefs.onLoad];
				if(onLoadFunc==null){
					LUI.Message.warn('查询失败','事件onLoad的处理函数('+datasetInstance.listenerDefs.onLoad+')不存在！');
				}else{
					datasetInstance.addListener(datasetInstance.events.load,null,onLoadFunc);
				}
			}
		}
		//登记此dataset
//		LUI.Datasource.instances.put(datasetInstance);
		return datasetInstance;
	}
};
