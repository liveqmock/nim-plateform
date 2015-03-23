//表格行
LUI.Grid.Row = {
	createNew:function(grid,rowIndex,record){
		var row = $.extend(LUI.Widget.createNew(),{
			events:{
				rowClick:'_row_click',
				rowChange:'_row_change',
				validChange:'_row_valid_change'
			},
			cells:[],
			grid:grid,
			index:rowIndex,
			record:record,
			loaded:true,
			rendered:false,
			valid:true,
			validInfo:null,
			el:null,
			getCell:function(colIdentifier){
				//可使用数字或字段名称
				var cell = null;
				if(isNaN(colIdentifier)){
					var colName = colIdentifier;
					for(var i=0;i<this.cells.length;i++){
						if(this.cells[i].column.name == colName){
							cell = this.cells[i];
							break;
						}
					}
				}else{
					var index = parseInt(colIdentifier);
					cell = this.cells[index];
				}
				return cell;
			},
			addCell:function(cell){
				this.cells[this.cells.length] = cell;
				
				cell.addListener(cell.events.validChange,this,function(sCell,row,event,eventOrigin){
					this.validate();
				});
			},
			//清除所有单元格
			clear:function(){
				this.cells = [];
			},
			init:function(){
				//为所有cell设置初始值
				for(var k=0;k<this.cells.length;k++){
					var cell = this.cells[k];
					
					if(cell.column.name != "@index"){
						var v = this.record.getFieldValue(cell.column.name);
						if(v!=null && (cell.column.fieldType =='object' || cell.column.fieldType =='file' || cell.column.fieldType =='set'  || cell.column.fieldType =='fileset' ) ){
							v = v.getData();
						}
						cell.setValue(v,true,true,this.record);
					}else{
						cell.setValue(v,true,true,this.record);
					}
				}
				//为所有cell中的field发出初始化change事件 并监听单元格字段的变化
				for(var k=0;k<this.cells.length;k++){
					var cell = this.cells[k];
					//为cell设置初始值
					if(cell.column.name != "@index"){
						
						if(cell.field!=null){
							//为field发出初始化change事件
							var v = this.record.getFieldValue(cell.column.name);
							if(v!=null && (cell.column.fieldType =='object' || cell.column.fieldType =='file' || cell.column.fieldType =='set'  || cell.column.fieldType =='fileset' ) ){
								v = v.getData();
							}
							cell.field.fireEvent(cell.field.events.change,{
								oldValue:null,
								newValue:v,
								isInitial:true
							},cell.field);
							
							//record监听cell中 field的变化 
							cell.field.addListener(cell.field.events.change,this.record,function(sField,tRecord,event,eventOrigin){
								tRecord.setFieldValue(sField.name,event.params.newValue,false,false,eventOrigin);//不再以grid的名义 发出修改事件
							});
						}
						
						//cell监听record的变化 修改cell的显示
						this.record.addListener(this.record.events.change,cell,function(sRecord,tCell,event,eventOrigin){
							if(event.params.fieldName == tCell.column.name ){
								//与当前单元格有关的变化
								if(tCell.field == null || tCell.field.id != eventOrigin.id){
									//且非单元格内的字段 发出的变化
									var evtNewVal = sRecord.getFieldValue(tCell.column.name);
									if(evtNewVal!=null && (tCell.column.fieldType =='object' || tCell.column.fieldType =='file' || tCell.column.fieldType =='set' || tCell.column.fieldType =='fileset') ){
										evtNewVal = evtNewVal.getData();
									}
									tCell.setValue(evtNewVal,true,false,eventOrigin||sRecord);
								}
								
							}
						});
					}
				}
			},
			render:function(rowEl){
				if(!this.rendered){
					this.el = rowEl;
					for(var i=0;i<this.cells.length;i++){
						this.cells[i].render();
						
						//通知cell中的field 与设计器建立关联
						var field = this.cells[i].field;
						if(field!=null ){
	//						field.render();
							//设计模式下 为字段和设计器建立关联
							field.setRelationToHTML();
						}
					}
					this.rendered = true;
				}else{
					for(var i=0;i<this.cells.length;i++){
						this.cells[i].reRender();
					}
				}
				
			},
			isValid:function(){
				this.valid = true;
				//所有cell都valid row就valid
				for(var j=0;j<this.cells.length;j++){
					var cell = this.cells[j];
					if(cell.field!=null && !cell.field.isValid()){
						this.valid = false;
						this.validInfo = "第 "+(row.index +1)+" 行  "+(cell.column.label)+" "+cell.field.validInfo;
						break;
					}
				}
				return this.valid;
			},
			validate:function(){
				var oldValid = this.valid;
				
				this.valid = true;
				//所有cell都valid row就valid
				for(var j=0;j<this.cells.length;j++){
					var cell = this.cells[j];
					if(cell.field!=null && !cell.field.isValid()){
						this.valid = false;
						this.validInfo = cell.validInfo;
						break;
					}
				}
				
				if(oldValid!= this.valid){
					//this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.valid});
				}
				return this.valid;
			},
			getFirstInvalidField:function(){
				var field = null;
				//取row中第一个invalid 的field
				for(var j=0;j<this.cells.length;j++){
					if(!this.cells[j].isValid()){
						field = this.cells[j].field;
						break;
					}
				}
				return field;
			}
		});
		
		//根据表格中的列定义 生成单元格
		for(var j=0;j<grid.columns.length;j++){
			var column = grid.columns[j];
			var cell = column.createCell(row);//column创建并记录cell
			row.addCell(cell);//将cell同时记录在row中
		}
		
		return row;
	}
};
