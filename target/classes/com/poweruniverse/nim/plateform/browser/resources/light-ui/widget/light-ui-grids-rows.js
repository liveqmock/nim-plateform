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
			isValid:true,
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
					this._onValidate();
				});
			},
			//清除所有单元格
			clear:function(){
				this.cells = [];
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
			_onValidate:function(){
				var oldValid = this.isValid;
				
				this.isValid = true;
				//所有field都valid form就valid
				for(var j=0;j<this.cells.length;j++){
					if(!this.cells[j].isValid){
						this.isValid = false;
						this.validInfo = this.cells[j].validInfo;
						break;
					}
				}
				
				if( oldValid!= this.isValid){
					this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.isValid});
				}
				return this.isValid;
			},
			getFirstInvalidField:function(){
				var field = null;
				//取row中第一个invalid 的field
				for(var j=0;j<this.cells.length;j++){
					if(!this.cells[j].isValid){
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
