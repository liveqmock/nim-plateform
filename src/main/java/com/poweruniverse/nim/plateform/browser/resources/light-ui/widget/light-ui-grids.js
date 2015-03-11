////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
LUI.Grid = {
	uniqueId:0,
	instances:LUI.Set.createNew(),
	createNew:function(config){
		//检查参数
		if(config.name==null){
			LUI.Message.info("错误","必须为列表提供name参数!");
			return null;
		}
		if(config.renderto==null){
			LUI.Message.info("错误","必须为列表提供renderto参数!");
			return null;
		}
		var datasource = null;
		if(config.datasourceType!=null && config.datasourceType!='none'){
			if(config.datasourceName==null){
				LUI.Message.info("错误","必须为列表"+config.name+"提供datasourceName参数!");
				return null;
			}
			datasource = LUI.Datasource.getInstance(config.datasourceName);
			if(datasource == null){
				LUI.Message.info("错误","未找到列表"+config.name+"的数据源"+config.datasourceName+"!");
				return null;
			}
		}
		//
		if(config.headerLines!=null){
			config.headerLines = parseInt(config.headerLines);
		}else{
			config.headerLines = 0;
		}
		
		if(config.footerLines!=null){
			config.footerLines = parseInt(config.footerLines);
		}else{
			config.footerLines = 0;
		}
		
		
		//记录第一行内容 作为迭代的模板
		var gridLine = $(config.renderto+' li').eq(config.headerLines);
		var gridLineContent = $("<p>").append(gridLine.clone()).html();
		
		//参数的默认值
		var gridConfig = $.extend({
			id:'_grid_'+ (++LUI.Grid.uniqueId),
			headerLines:0,
			footerLines:0,
			columns:[],
			rows:[],//选中的行
			gridLineContent:gridLineContent,
			pagiTarget:null,
			autoLoad:"true",
			initialed:false,
			datasource:datasource,
			selectedRows:LUI.Set.createNew(),//选中的行
			events:{
				gridRendered:'grid_render',
				rowRendered:'row_render',
				rowSelect:'row_select',
				rowUnselect:'row_unselect',
				rowClick:'row_click',
				pagiRendered:'pagi_render'
			},
			/**
			 * 通知grid  根据绑定的数据 
			 * 重新显示列表内容 显示grid 分页工具栏
			 */
			load:function(){
				this.render();
			},
			_onRowClick:function(rowEl){
				var rowIndex = $(rowEl).attr('_row_index');
				var row = this.rows[rowIndex];
				this.fireEvent(this.events.rowClick,{
					grid:this,
					rowIndex:row.index,
					rowEl:row.el,
					rowData:row.data
				});
				
				if(!this.selectedRows.contains(row)){
					this.selectRow(rowIndex);
				}
			},
			_onRowSelect:function(rowEl){
				var rowIndex = $(rowEl).attr('_row_index');
				var row = this.rows[rowIndex];
				
				this.selectedRows.put(row);
				
				this.fireEvent(this.events.rowSelect,{
					grid:this,
					rowIndex:row.index,
					rowEl:row.el,
					rowData:row.data
				});
			},
			_onRowUnselect:function(rowEl){
				var rowIndex = $(rowEl).attr('_row_index');
				var row = this.rows[rowIndex];
				
				this.selectedRows.remove(row);
				this.fireEvent(this.events.rowUnselect,{
					grid:this,
					rowIndex:row.index,
					rowEl:row.el,
					rowData:row.data
				});
			},
			selectRow:function(index,keepSelection){
				if(index >=0 && index < this.rows.length){
					var row = this.rows[index];
					//通知tree
					if(!keepSelection || !this.multiSelect){
						for(var i =0;i<this.selectedRows.size();i++){
							this._onRowUnselect(this.selectedRows.get(i).el);
						}
					}
					if(!this.selectedRows.contains(row)){
						this._onRowSelect(row.el);
					}
				}
			},
			unselectRow:function(index){
				var row = this.rows[index];
				if(this.selectedRows.contains(row)){
					this._onRowUnselect(row.el);
				}
			},
			getSelectRow:function(){
				var row = null;
				if(this.selectedRows.size()>0){
					row = this.selectedRows.get(0);
				}
				return row;
			},
			render:function(){
				//预编译行模板
				var data={
					totalCount:0,//用于分页显示
					start:0,//用于分页显示
					limit:0,//用于分页显示
					rows:[]
				};
				if(this.datasource!=null ){
					var dsData = this.datasource.getResult();
					if(dsData!=null){
						data.totalCount = dsData.totalCount;
						data.start = dsData.start;
						data.limit = dsData.limit;
						for(var i=0;i<this.datasource.size();i++){
							var record = this.datasource.getRecord(i);
							data.rows[i] = record.getData();
							data.rows[i]._record_id = record.id;
						}
					}
					
					//生成表格内容
					this.doRender(data);
					
					//需要分页的话 重新 显示分页工具栏
					if(this.pagiTarget!=null){
						var currentPage = data.limit>0?Math.floor(data.start/data.limit):0;
						
						$(this.pagiTarget).pagination(data.totalCount, {
							items_per_page:data.limit,
							num_display_entries:2,
							num_edge_entries:2,
							prev_text:'前一页',
							next_text:'后一页',
							gridInstance:this,
							current_page:currentPage,
							callback:function(page_index, jq){
								if(gridInstance.datasource!=null){
									gridInstance.datasource.page(page_index);
								}
								return false;
							}
						});
						this.fireEvent(this.events.pagiRendered,{
							grid:this,
							pagiEl:this.pagiTarget,
							start:data.start,
							limit:data.limit,
							pageIndex:currentPage
						});
					}
				}
				//
				this.initialed = true;
				
				this.fireEvent(this.events.gridRendered,{
					grid:this,
					data:data
				});
			},
			doRender:function(data){
				//删除除header和footer以外的行 
				if(this.footerLines>0){
					$(this.renderto+' li').slice(this.headerLines, -this.footerLines).remove();
				}else{
					$(this.renderto+' li').slice(this.headerLines).remove();
				}
				this.rows = [];
				
				//重新显示列表
				if(data.rows!=null && data.rows.length >0){
					var newLineEl = null;
					for(var i=0;i<data.rows.length;i++){
						var rowData = data.rows[i];
						//在表格中增加一行
						if(newLineEl == null){
							if(this.headerLines>0){
								newLineEl = $(this.gridLineContent).insertAfter($(this.renderto+' li').eq(this.headerLines -1));
							}else{
								newLineEl = $(this.gridLineContent).appendTo($(this.renderto));
							}
						}else{
							newLineEl = $(this.gridLineContent).insertAfter(newLineEl);
						}
						newLineEl.attr('_row_index',i);
						newLineEl.attr('_record_id',rowData._record_id);
						//编译动态内容
						for(var j=0;j<this.columns.length;j++){
							//单元格内容
							var cellEl = newLineEl.find(this.columns[j].renderto);
							cellEl.attr('_col_index',j);
							cellEl.attr('_col_name',this.columns[j].name);
							if(this.columns[j].name.indexOf('@index') >=0){
								cellEl.html(data.start + i +1);
							}else{
								var _compiledValue = this._compiledCellTemplates[j](rowData);
								if(_compiledValue!=null && _compiledValue.length > 0){
									//如果使用千分符
									if(this.columns[j].showThousand == 'true'){
										_compiledValue = LUI.Util.thousandth(_compiledValue);
									}
									cellEl.html(_compiledValue);
								}else{
									cellEl.html('&nbsp;');
								}
							}
							
							//单元格提示信息
							if(this.columns[j].showTips == 'true'){
								cellEl.attr('title',this._compiledTipTemplates[j](rowData));
							}else{
								cellEl.attr('title','');
							}
						}
						//
						this.rows[this.rows.length] = {
							id:"row_"+rowData._record_id,
							index:i,
							el:newLineEl,
							data:rowData
						};
						//
						var _this = this;
						newLineEl.click(function(){
							_this._onRowClick(this);
						});
						//
						this.fireEvent(this.events.rowRendered,{
							grid:this,
							rowIndex:i,
							rowEl:newLineEl,
							rowData:rowData
						});
					}
				}
			},
			//彻底销毁grid
			destroy:function(){
				this.removeAllListener();
				LUI.Grid.instances.remove(this);
			}
		},config);
		//创建grid对象
		var gridInstance = $.extend(LUI.Widget.createNew(),gridConfig);
		//记录原模板行信息
		if(gridInstance.renderto!=null){
			gridInstance._originalContent = $(gridInstance.renderto).html();
		}
		//事件监听
		if(gridInstance.listenerDefs!=null){
			if(gridInstance.listenerDefs.onGridRendered!=null){
				var onGridRenderFunc = window[gridInstance.listenerDefs.onGridRendered];
				if(onGridRenderFunc==null){
					LUI.Message.warn('查询失败','事件onGridRendered的处理函数('+gridInstance.listenerDefs.onGridRendered+')不存在！');
				}else{
					gridInstance.addListener(gridInstance.events.gridRendered,LUI.Observable.createNew(),onGridRenderFunc);
				}
			}
			
			if(gridInstance.listenerDefs.onRowRendered!=null){
				var onRowRenderFunc = window[gridInstance.listenerDefs.onRowRendered];
				if(onRowRenderFunc==null){
					LUI.Message.warn('查询失败','事件onRowRendered的处理函数('+gridInstance.listenerDefs.onRowRendered+')不存在！');
				}else{
					gridInstance.addListener(gridInstance.events.rowRendered,LUI.Observable.createNew(),onRowRenderFunc);
				}
			}
			
			if(gridInstance.listenerDefs.onPagiRendered!=null){
				var onPagiRenderFunc = window[gridInstance.listenerDefs.onPagiRendered];
				if(onPagiRenderFunc==null){
					LUI.Message.warn('查询失败','事件onPagiRendered的处理函数('+gridInstance.listenerDefs.onPagiRendered+')不存在！');
				}else{
					gridInstance.addListener(gridInstance.events.pagiRendered,LUI.Observable.createNew(),onPagiRenderFunc);
				}
			}
		}
		//预编译
		gridInstance._compiledCellTemplates = [];
		gridInstance._compiledTipTemplates = [];
		
		for(var j=0;j<gridInstance.columns.length;j++){
			gridInstance._compiledCellTemplates[j] = Handlebars.compile(gridInstance.columns[j].renderTemplate);
			if( gridInstance.columns[j].tipsTemplate == null || 
				gridInstance.columns[j].tipsTemplate.length ==0 || 
				gridInstance.columns[j].tipsTemplate == gridInstance.columns[j].renderTemplate){
				gridInstance._compiledTipTemplates[j] = gridInstance._compiledCellTemplates[j];
			}else if(gridInstance.columns[j].showTips == 'true'){
				gridInstance._compiledTipTemplates[j] = Handlebars.compile(gridInstance.columns[j].tipsTemplate);
			}
		}
		if(gridInstance.autoLoad == "true" && gridInstance.datasource!=null){
			//监听数据源的load事件 重新显示
			gridInstance.datasource.addListener(gridInstance.datasource.events.load,gridInstance,function(source,target,event){
				target.load();
			});
		}
		
		//登记此grid
		if(LUI.Grid.hasInstance(gridInstance.name)){
			LUI.Message.warn('警告','同名表格控件(LUI.Grid:'+gridInstance.name+')已存在！');
		}
		LUI.Grid.instances.put(gridInstance);
		return gridInstance;
	},
	hasInstance:function(gridName){
		var gridInstance = null;
		for(var i =0;i<LUI.Grid.instances.size();i++){
			var _instance = LUI.Grid.instances.get(i);
			if(_instance.name == gridName){
				return true;
			}
		}
		return false;
	},
	getInstance:function(gridName){
		var gridInstance = null;
		for(var i =0;i<LUI.Grid.instances.size();i++){
			var _instance = LUI.Grid.instances.get(i);
			if(_instance.name == gridName){
				gridInstance = _instance;
				break;
			}
		}
		return gridInstance;
	},
	removeInstance:function(gridName){
		for(var i =0;i<LUI.Grid.instances.size();i++){
			var _instance = LUI.Grid.instances.get(i);
			if(_instance.name == gridName){
				LUI.Grid.instances.remove(_instance);
				break;
			}
		}
	}
};

//子表格 用于显示/处理集合类型的字段数据 
//不关联数据源 不分页
LUI.SubGrid = {
	createNew:function(config){
		//检查参数
		if(config.name==null){
			LUI.Message.info("错误","必须为子表格提供name参数!");
			return null;
		}
		if(config.renderto==null){
			LUI.Message.info("错误","必须为子表格提供renderto参数!");
			return null;
		}
		
		if(config.headerLines!=null){
			config.headerLines = parseInt(config.headerLines);
		}else{
			config.headerLines = 0;
		}
		
		if(config.footerLines!=null){
			config.footerLines = parseInt(config.footerLines);
		}else{
			config.footerLines = 0;
		}
		
		//记录第一行内容 作为迭代的模板
		var gridLine = $(config.renderto+' li').eq(config.headerLines);
		var gridLineContent = $("<p>").append(gridLine.clone()).html();
		
		var columnsCfg = config.columns||[];
		delete config.columns;
		
		//参数的默认值
		var gridConfig = $.extend({
			id:'_subgrid_'+ (++LUI.Grid.uniqueId),
			headerLines:0,
			footerLines:0,
			columns:[],
			rows:[],
			gridLineContent:gridLineContent,
			loaded:false,
			parentField:null,
			parentResultSet:null,
			rendered:false,
			valid:true,
			validInfo:null,
			events:{
				change:'grid_change',
				gridRendered:'grid_render',
				rowRendered:'row_render',
				validChange:'_grid_valid_change'
			},
			getCell:function(rowIndex,colIdentifier){
				var row = this.getRow(rowIndex);
				var cell = row.getCell(colIdentifier);
				return cell;
			},
			getRow:function(rowIndex){
				return this.rows[parseInt(rowIndex)];
			},
			getRowByRecord:function(record){
				var rrow = null;
				for(var i=0;i<this.rows.length;i++){
					var row = this.rows[i];
					if(row.record.id == record.id){
						rrow = row;
					}
				}
				return rrow;
			},
			addRow:function(record){
				//
				var row = LUI.Grid.Row.createNew(this,this.rows.length,record);
				this.rows[this.rows.length] = row;
				
				row.addListener(row.events.validChange,this,function(sRow,grid,event,eventOrigin){
					this.validate();
				});
				//如果表格已rendered 
				if(this.rendered){
					this.renderRow(row);
				}
			},
			renderRow:function(row){
				//
				var isInitial = true;
				var rowEl = null;
				if(!row.rendered){
					if(row.index == 0){
						//第一行
						if(this.headerLines>0){
							rowEl = $(this.gridLineContent).insertAfter($(this.renderto+' li').eq(this.headerLines -1));
						}else{
							rowEl = $(this.gridLineContent).appendTo($(this.renderto));
						}
					}else{
						var prevRow = this.getRow(row.index -1);
						rowEl = $(this.gridLineContent).insertAfter(prevRow.el);
					}
				}else{
					rowEl = row.el;
					isInitial = false;
				}
				
				rowEl.attr('_row_index',row.index);
				rowEl.attr('_record_id',row.record.id);
				//显示行
				row.render(rowEl);
				//
				this.fireEvent(this.events.rowRendered,{
					grid:this,
					rowIndex:row.index,
					rowEl:row.el,
					record:row.record,
					isInitial:isInitial,
					rowData:row.record.getData()
				});
			},
			removeRow:function(delRecord){
				//表格中删除此行
				var delRow = null;
				for(var i=0;i<this.rows.length;i++){
					if(this.rows[i].record.id == delRecord.id){
						delRow = this.rows[i];
						this.rows.splice(i,1)
						break;
					}
				}
				if(delRow==null){
					LUI.Message.info("删除行失败","表格中未找到对应此记录的行!");
					return;
				}
				//先删除columns中对应此行的单元格
				for(var i=0;i<this.columns.length;i++){
					var column = this.columns[i];
					for(var j=column.size()-1;j>=0;j--){
						if(column.getCell(j).row.index == delRow.index){
							column.removeCell(j);
							break;
						}
					}
				}
				//再修改rows中大于此行的row index
				for(var i=0;i<this.rows.length;i++){
					var row2 = this.rows[i];
					if(row2.index > delRow.index ){
						row2.index = row2.index -1;
					}
					//刷新行显示
					if(this.rendered){
						this.renderRow(row2);
					}
					
					this.fireEvent(this.events.rowRendered,{
						grid:this,
						rowIndex:row2.index,
						rowEl:row2.el,
						record:row2.record,
						rowData:row2.record.getData()
					});
				}
				//最后删除行显示
				if(delRow.rendered){
					delRow.el.remove();
				}
				return delRow;
			},
			/**
			 * 通知grid  根据绑定的数据 
			 */
			render:function(){
				//表单集合字段render的时候 子表格会自动render
				//如果已经生成了 需要消除影响
				if(this.rendered){
					//清除原信息
					LUI.Message.info("删除行失败","子表格已生成，不允许重复执行render方法!");
					return;
				}
				//删除除header和footer以外的行 
				if(this.footerLines>0){
					$(this.renderto+' li').slice(this.headerLines, -this.footerLines).remove();
				}else{
					$(this.renderto+' li').slice(this.headerLines).remove();
				}
				//显示表格行
				var newLineEl = null;
				for(var i=0;i<this.rows.length;i++){
					var row = this.rows[i];
					if(!row.rendered){
						this.renderRow(row);
					}
				}
				//
				this.rendered = true;
				
				this.fireEvent(this.events.gridRendered,{
					grid:this
				});
			},
			//彻底销毁grid
			destroy:function(){
				this.removeAllListener();
				LUI.Grid.instances.remove(this);
			},
			reset:function(){
				//表单重置 
				for(var j=0;j<this.rows.length;j++){
					var row = this.rows[j];
					row.record.reset();
				}
			},
			isValid:function(){
				//所有row都valid grid就valid
				for(var j=0;j<this.rows.length;j++){
					var row = this.rows[j];
					if(!row.isValid()){
						return false;
					}
				}
				return true;
			},
			validate:function(){
				var oldValid = this.valid;
				//所有row都valid grid就valid
				this.valid = true;
				for(var j=0;j<this.rows.length;j++){
					var row = this.rows[j];
					if(!row.isValid()){
						this.valid = false;
						this.validInfo = row.validInfo;
						break;
					}
				}
				
				if( oldValid!= this.valid){
					this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.valid});
				}
				return this.valid;
			},
			getFirstInvalidField:function(){
				var field = null;
				//取row中第一个invalid 的field
				for(var j=0;j<this.rows.length;j++){
					field = this.rows[j].getFirstInvalidField();
					if(field!=null){
						break;
					}
				}
				return field;
			}
		},config);
		//创建grid对象
		var gridInstance = $.extend(LUI.Widget.createNew(),gridConfig);
		
		//事件监听
		if(gridInstance.listenerDefs!=null){
			if(gridInstance.listenerDefs.onGridRendered!=null){
				var onGridRenderFunc = window[gridInstance.listenerDefs.onGridRendered];
				if(onGridRenderFunc==null){
					LUI.Message.warn('错误','事件onGridRendered的处理函数('+gridInstance.listenerDefs.onGridRendered+')不存在！');
				}else{
					gridInstance.addListener(gridInstance.events.gridRendered,LUI.Observable.createNew(),onGridRenderFunc);
				}
			}
			
			if(gridInstance.listenerDefs.onRowRendered!=null){
				var onRowRenderFunc = window[gridInstance.listenerDefs.onRowRendered];
				if(onRowRenderFunc==null){
					LUI.Message.warn('错误','事件onRowRendered的处理函数('+gridInstance.listenerDefs.onRowRendered+')不存在！');
				}else{
					gridInstance.addListener(gridInstance.events.rowRendered,LUI.Observable.createNew(),onRowRenderFunc);
				}
			}
			
			if(gridInstance.listenerDefs.onPagiRendered!=null){
				var onPagiRenderFunc = window[gridInstance.listenerDefs.onPagiRendered];
				if(onPagiRenderFunc==null){
					LUI.Message.warn('错误','事件onPagiRendered的处理函数('+gridInstance.listenerDefs.onPagiRendered+')不存在！');
				}else{
					gridInstance.addListener(gridInstance.events.pagiRendered,LUI.Observable.createNew(),onPagiRenderFunc);
				}
			}
		}
		//创建表格的列对象
		for(var j=0;j<columnsCfg.length;j++){
			gridInstance.columns[gridInstance.columns.length] = LUI.Grid.Column.createNew(gridInstance,j,columnsCfg[j]);
		}
		
		//登记此grid
		if(LUI.Grid.hasInstance(gridInstance.name)){
			LUI.Message.warn('警告','同名表格控件(LUI.Grid:'+gridInstance.name+')已存在！');
		}
		LUI.Grid.instances.put(gridInstance);
		return gridInstance;
	}
};

//可编辑的表格
LUI.EditGrid = {
	createNew:function(config){
		//检查参数
		if(config.name==null){
			LUI.Message.info("错误","必须为列表提供name参数!");
			return null;
		}
		if(config.renderto==null){
			LUI.Message.info("错误","必须为列表提供renderto参数!");
			return null;
		}
		var datasource = null;
		if(config.datasourceType!=null && config.datasourceType!='none'){
			if(config.datasourceName==null){
				LUI.Message.info("错误","必须为列表"+config.name+"提供datasourceName参数!");
				return null;
			}
			datasource = LUI.Datasource.getInstance(config.datasourceName);
			if(datasource == null){
				LUI.Message.info("错误","未找到列表"+config.name+"的数据源"+config.datasourceName+"!");
				return null;
			}
		}
		
		if(config.headerLines!=null){
			config.headerLines = parseInt(config.headerLines);
		}else{
			config.headerLines = 0;
		}
		
		if(config.footerLines!=null){
			config.footerLines = parseInt(config.footerLines);
		}else{
			config.footerLines = 0;
		}
		
		//记录第一行内容 作为迭代的模板
		var gridLine = $(config.renderto+' li').eq(config.headerLines);
		var gridLineContent = $("<p>").append(gridLine.clone()).html();
		
		var columnsCfg = config.columns||[];
		delete config.columns;
		
		//参数的默认值
		var gridConfig = $.extend({
			id:'_editor_grid_'+ (++LUI.Grid.uniqueId),
			headerLines:0,
			footerLines:0,
			columns:[],
			rows:[],
			gridLineContent:gridLineContent,
			autoLoad:"true",
			loaded:false,
			datasource:datasource,
			rendered:false,
			events:{
				load:'grid_load',
				change:'grid_change',
				save:'grid_save',
				submit:'grid_submit',
				gridRendered:'grid_render',
				rowRendered:'row_render'
			},
			getRow:function(rowIndex){
				return this.rows[parseInt(rowIndex)];
			},
			addRow:function(record){
				//
				var row = LUI.Grid.Row.createNew(this,this.rows.length,record);
				this.rows[this.rows.length] = row;
				//如果表格已rendered 
				if(this.rendered){
					this.renderRow(row);
				}
			},
			renderRow:function(row){
				//
				var rowEl = null;
				if(row.index == 0){
					//第一行
					if(this.headerLines>0){
						rowEl = $(this.gridLineContent).insertAfter($(this.renderto+' li').eq(this.headerLines -1));
					}else{
						rowEl = $(this.gridLineContent).appendTo($(this.renderto));
					}
				}else{
					var prevRow = this.getRow(row.index -1);
					rowEl = $(this.gridLineContent).insertAfter(prevRow.el);
				}
				rowEl.attr('_row_index',row.index);
				rowEl.attr('_record_id',row.record.id);
				//显示行
				row.render(rowEl);
				//
				this.fireEvent(this.events.rowRendered,{
					grid:this,
					rowIndex:row.index,
					rowEl:row.el,
					record:row.record,
					rowData:row.record.getData()
				});
			},
			removeRow:function(delRecord){
				//表格中删除此行
				var delRow = null;
				for(var i=0;i<this.rows.length;i++){
					if(this.rows[i].record.id == delRecord.id){
						delRow = this.rows[i];
						this.rows.splice(i,1)
						break;
					}
				}
				if(delRow==null){
					LUI.Message.info("删除行失败","表格中未找到对应此记录的行!");
					return;
				}
				//先删除columns中对应此行的单元格
				for(var i=0;i<this.columns.length;i++){
					var column = this.columns[i];
					for(var j=column.size()-1;j>=0;j--){
						if(column.getCell(j).row.index == delRow.index){
							column.removeCell(j);
							break;
						}
					}
				}
				//再修改rows中大于此行的row index
				for(var i=0;i<this.rows.length;i++){
					var row2 = this.rows[i];
					if(row2.index > delRow.index ){
						row2.index = row2.index -1;
					}
					//刷新行显示
					row2.render();
					
					this.fireEvent(this.events.rowRendered,{
						grid:this,
						rowIndex:row2.index,
						rowEl:row2.el,
						record:row2.record,
						rowData:row2.record.getData()
					});
				}
				//最后删除行显示
				if(delRow.rendered){
					delRow.el.remove();
				}
				return delRow;
			},
			/**
			 * 通知grid  根据绑定的数据 
			 * 重新显示列表内容 显示grid 分页工具栏
			 */
			load:function(){
				//如果有数据 需要消除影响
				if(this.loaded){
					//清除原信息
					this.rows = [];//清除所有表格行
					for(var j=0;j<this.columns.length;j++){
						this.columns[j].clear();//清除其中的单元格信息
					}
					//取消对数据源添加、删除事件的监听
					this.datasource.removeListener(this.datasource.events.add,this);
					this.datasource.removeListener(this.datasource.events.remove,this);
				}
				//从关联数据源取得数据 
				if(!this.datasource.loaded){
					LUI.Message.info("加载数据失败","请监听数据源的onload事件，为表格加载数据!");
					return;
				}
				//生成表格行
				for(var i=0;i<this.datasource.size();i++){
					var record = this.datasource.getRecord(i);
					//生成表格行对象 同时建立表格行与数据记录之间的监听关系
					this.addRow(record);
				}
				//监听数据源的添加事件 创建新行
				this.datasource.addListener(this.datasource.events.add,this,function(ds,grid,event){
					//数据集中 新增了记录
					var newRecord = event.params.record;
					this.addRow(newRecord);
				});
				//监听此数据源的删除事件
				this.datasource.addListener(this.datasource.events.remove,this,function(ds,grid,event){
					var delRecord = event.params.record;
					this.removeRow(delRecord);
				});

				
				this.loaded = true;
				
				if(this.autoRender == "true"){
					this.render();
				}
				
			},
			render:function(){
				//清空列表 
				//删除除header和footer以外的行 
				if(this.footerLines>0){
					$(this.renderto+' li').slice(this.headerLines, -this.footerLines).remove();
				}else{
					$(this.renderto+' li').slice(this.headerLines).remove();
				}
				//显示表格行
				var newLineEl = null;
				for(var i=0;i<this.rows.length;i++){
					var row = this.rows[i];
					if(!row.rendered){
						this.renderRow(row);
					}
				}
				//
				this.rendered = true;
				
				this.fireEvent(this.events.gridRendered,{
					grid:this
				});
			},
			//彻底销毁grid
			destroy:function(){
				this.removeAllListener();
				LUI.Grid.instances.remove(this);
			},
			save:function(){
				var xiTongDH = null;
				if(this.xiTongDH!=null){
					xiTongDH = this.xiTongDH;
				}
				var gongNengDH = null;
				if(this.gongNengDH!=null){
					gongNengDH = this.gongNengDH;
				}
				var caoZuoDH = null;
				if(this.caoZuoDH!=null){
					caoZuoDH = this.caoZuoDH;
				}
				
				this.datasource.save(xiTongDH,gongNengDH,caoZuoDH);
			},
			submit:function(){
				if(this.isValid()){
					var xiTongDH = null;
					if(this.xiTongDH!=null){
						xiTongDH = this.xiTongDH;
					}
					var gongNengDH = null;
					if(this.gongNengDH!=null){
						gongNengDH = this.gongNengDH;
					}
					var caoZuoDH = null;
					if(this.caoZuoDH!=null){
						caoZuoDH = this.caoZuoDH;
					}
					
					this.datasource.submit(xiTongDH,gongNengDH,caoZuoDH);
				}else{
					var invalidField = this.getFirstInvalidField();
					
					LUI.Message.error('表格验证不通过','字段('+invalidField.label+'):'+invalidField.validInfo,null,{
						callback:function(){
							invalidField.focus();
						}
					});
					return ;
				}
			},
			reset:function(){
				//表单重置 
				for(var j=0;j<this.rows.length;j++){
					var row = this.rows[j];
					row.record.reset();
				}
			},
			isValid:function(){
				//所有row都valid grid就valid
				for(var j=0;j<this.rows.length;j++){
					var row = this.rows[j];
					if(!row.isValid()){
						return false;
					}
				}
				return true;
			},
			getFirstInvalidField:function(){
				var field = null;
				//取row中第一个invalid 的field
				for(var j=0;j<this.rows.length;j++){
					field = this.rows[j].getFirstInvalidField();
					if(field!=null){
						break;
					}
				}
				return field;
			}
		},config);
		//创建grid对象
		var gridInstance = $.extend(LUI.Widget.createNew(),gridConfig);
		
		//事件监听
		if(gridInstance.listenerDefs!=null){
			if(gridInstance.listenerDefs.onGridRendered!=null){
				var onGridRenderFunc = window[gridInstance.listenerDefs.onGridRendered];
				if(onGridRenderFunc==null){
					LUI.Message.warn('错误','事件onGridRendered的处理函数('+gridInstance.listenerDefs.onGridRendered+')不存在！');
				}else{
					gridInstance.addListener(gridInstance.events.gridRendered,LUI.Observable.createNew(),onGridRenderFunc);
				}
			}
			
			if(gridInstance.listenerDefs.onRowRendered!=null){
				var onRowRenderFunc = window[gridInstance.listenerDefs.onRowRendered];
				if(onRowRenderFunc==null){
					LUI.Message.warn('错误','事件onRowRendered的处理函数('+gridInstance.listenerDefs.onRowRendered+')不存在！');
				}else{
					gridInstance.addListener(gridInstance.events.rowRendered,LUI.Observable.createNew(),onRowRenderFunc);
				}
			}
			
			if(gridInstance.listenerDefs.onPagiRendered!=null){
				var onPagiRenderFunc = window[gridInstance.listenerDefs.onPagiRendered];
				if(onPagiRenderFunc==null){
					LUI.Message.warn('错误','事件onPagiRendered的处理函数('+gridInstance.listenerDefs.onPagiRendered+')不存在！');
				}else{
					gridInstance.addListener(gridInstance.events.pagiRendered,LUI.Observable.createNew(),onPagiRenderFunc);
				}
			}
		}
		//创建表格的列对象
		for(var j=0;j<columnsCfg.length;j++){
			gridInstance.columns[gridInstance.columns.length] = LUI.Grid.Column.createNew(gridInstance,j,columnsCfg[j]);
		}
		if(gridInstance.autoLoad == "true" && gridInstance.datasource!=null){
			//监听数据源的load事件 重新显示
			gridInstance.datasource.addListener(gridInstance.datasource.events.load,gridInstance,function(source,target,event){
				target.load();
			});
		}
		
		//登记此grid
		if(LUI.Grid.hasInstance(gridInstance.name)){
			LUI.Message.warn('警告','同名表格控件(LUI.Grid:'+gridInstance.name+')已存在！');
		}
		LUI.Grid.instances.put(gridInstance);
		return gridInstance;
	}
};