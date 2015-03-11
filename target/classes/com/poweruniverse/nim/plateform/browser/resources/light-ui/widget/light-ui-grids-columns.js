//表格列
LUI.Grid.Column = {
	createNew:function(grid,colIndex,colCfg){
		//检查参数
		if(colCfg.name==null){
			LUI.Message.info("错误","必须为表列提供name参数!");
			return null;
		}
		if(colCfg.label==null){
			LUI.Message.info("错误","必须为表列提供label参数!");
			return null;
		}
		if(colCfg.fieldType==null){
			LUI.Message.info("错误","必须为表列提供fieldType参数!");
			return null;
		}

		//创建column对象
		var columnInstance = $.extend(LUI.Widget.createNew(),{
			initConfig:colCfg,
			events:{
			},
			grid:grid,
			index:colIndex,
			cells:[],
			cellFactory:null,
			size:function(){
				return this.cells.length;
			},
			removeCell:function(colIndex){
				return this.cells.splice(colIndex,1);
			},
			getCell:function(colIndex){
				return this.cells[colIndex];
			},
			createCell:function(row){
				if(this.cellFactory == null){
					var type = this.type || this.fieldType;
					var widget = this.widget || this.component;
					if(this.name == "@index"){
						widget = 'intDisplayColumn';
					}
					this.cellFactory = LUI.Grid.CellFactoryManager.getCellFactory(type,widget);
				}
				var cell = this.cellFactory.createNew(this.grid,row,this);
				//为cell设置初始值
				if(this.name != "@index"){
					var v = row.record.getFieldValue(this.name);
					if(v!=null && (this.fieldType =='object' || this.fieldType =='set' ) ){
						v = v.getData();
					}
					cell.setValue(v,true,true,row.record);
			
					
					//record监听cell的变化 修改自身的值
					if(cell.field!=null){
						var _grid = this.grid;
						cell.field.addListener(cell.field.events.change,row.record,function(sField,tRecord,event,eventOrigin){
							tRecord.setFieldValue(sField.name,event.params.newValue,false,false,_grid);//表格中 单元格的变化 统一以grid的名义 发出事件
						});
					}
					
					
					//cell监听record的变化 修改cell的值
					row.record.addListener(row.record.events.change,cell,function(sRecord,tCell,event,eventOrigin){
						if(event.params.fieldName == tCell.column.name){
							var evtNewVal = sRecord.getFieldValue(tCell.column.name);
							if(evtNewVal!=null && (tCell.column.fieldType =='object' || tCell.column.fieldType =='set' ) ){
								evtNewVal = evtNewVal.getData();
							}
							tCell.setValue(evtNewVal,true,false,eventOrigin||sRecord);
						}
					});
				}else{
					cell.setValue(v,true,true,row.record);
				}
				
				this.cells[this.cells.length] = cell;
				return cell;
			},
			//清除所有单元格
			clear:function(){
				this.cells = [];
			}
		},colCfg);
		return columnInstance;
	}
};

//将表单字段转换为表格编辑字段
LUI.Grid.CellEditor = {
	createNew:function(grid,cell,field){
		var cellEditor = $.extend(field,{
			cell:cell,
			createFieldEl:function(_templateString){
				
				var _template = null;
				var fieldContentString = null;
				
				if(_templateString!=null){
					_template = Handlebars.compile(_templateString);
					fieldContentString = _template(this);
				}
				//根据构建类型 确定如何render
				if(this.renderType == 'append' ){
					//创建新的label、input元素 放置到form内部 
					LUI.Message.warn('未生成字段','不支持字段'+this.name+'('+this.label+')的生成方式(append),请选择insert|replace|rela！');
					return false;
				}else if(this.renderType == 'insert' ){
					//创建新的input元素 放置到原有元素内部 
					this.el = $(fieldContentString).find('.nim-field-wrapper');
					//在目标元素内插入元素的时候 先清空其中的内容
					this.cell.el.empty();
					//
					this.el.appendTo(this.cell.el);
				}else if(this.renderType == 'replace'){
					//替换原有input
					this.oldEl = this.cell.el;
					if(this.oldEl.length == 0){
						LUI.Message.warn('未替换字段','在当前表格行内未找到字段'+this.name+'('+this.label+')的目标元素('+this.cell.column.renderto+')！');
						return false;
					}
					//在原有元素后 插入新的input元素
					this.oldEl.after($(fieldContentString).find('.nim-field-wrapper'));
					this.el = this.oldEl.next();
					//删除原有元素
					this.oldEl.remove();
				}else if(this.renderType == 'rela'){
					this.el = this.cell.el;
					if(this.el.length == 0){
						LUI.Message.warn('未关联字段','在当前表格行内未找到字段'+this.name+'('+this.label+')的目标元素('+this.cell.column.renderto+')！');
						return false;
					}
				}
				
				if(this.el!=null){
					this.inputEl = this.el.find('.nim-field-el');
					if(this.inputEl.size()==0){
						this.inputEl = this.el;
					}
				}
				return true;
			},
			//在设计模式下 监听inputEl的ctrl+click事件 选中设计器中的节点
			setRelationToHTML:function(){
				if(this.inputEl!=null && _isDesignMode ){
					var _fieldName = this.name;
					var _gridName = this.cell.row.grid.name;
					var _this = this;
					this.inputEl.bind('click',function(event){
						if(event.ctrlKey){
							var treeObj = LUI.PageDesigner.instance._pageCmpTree;
							if(_this.designNode == null){
								var fieldNodes = treeObj.getNodesByFilter(function(node){
									var fieldsNode = node.getParentNode();
									if(fieldsNode!=null && fieldsNode.getParentNode()!=null && fieldsNode.component!=null && fieldsNode.component.type == 'columns'){
										var formNode = fieldsNode.getParentNode();
										if(node.data.name == _fieldName && formNode.data.name == _gridName){
											return true;
										}
									}
									return false;
								});
								_this.designNode = fieldNodes[0];
							}
							//选中设计器中 对应的节点
							treeObj.selectNode(_this.designNode,false);
							LUI.PageDesigner.instance.onComponentNodeSelected(_this.designNode);
						}
					});
				}
			}
		});
		return cellEditor;
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//显示 单元格
LUI.Grid.Cell = {
	createNew:function(grid,row,column){
		//检查参数
		if(column.renderto==null){
			LUI.Message.info("错误","必须为表列提供renderto参数!");
			return null;
		}
		if(column.renderTemplate==null){
			LUI.Message.info("错误","必须为表列提供renderTemplate参数!");
			return null;
		}else if(column._compiledTemplate == null){
			column._compiledTemplate = Handlebars.compile(column.renderTemplate);
		}
		
		//创建column对象
		var cellInstance = $.extend(LUI.Widget.createNew(),{
			row:row,
			column:column,
			rendered:false,
			valid:true,
			validInfo:null,
			events:{
				click:'_cell_click',
				change:'_cell_change',
				validChange:'_cell_valid_change'
			},
			setValue:function(newVal,silence,isInitial,originSource){
				//显示列setValue只是显示
				if(this.rendered){
					this.render();
				}
			},
			getValue:function(){
				//显示列没有getValue
				return null;
			},
			reRender:function(){
				//没有field的时候 才生成显示内容
				if(this.field == null){
					this.render();
				}
			},
			render:function(){
				if(this.field == null){
					//没有field的时候 才生成显示内容
					var rowData = this.row.record.getData();
					this.el = this.row.el.find(this.column.renderto);
					
					//显示单元格内容
					if(this.column.name.indexOf('@index') >=0){
						//显示行号
						this.el.html(this.row.index +1);
					}else{
						var _compiledValue = this.column._compiledTemplate(rowData);
						if(_compiledValue!=null && _compiledValue.length > 0){
							this.el.html(_compiledValue);
						}else{
							this.el.html('&nbsp;');
						}
					}
					//是否显示提示信息
					if(this.column._compiledTipsTemplate!=null){
						this.el.attr('title',this.column._compiledTipsTemplate(rowData));
					}else{
						this.el.attr('title','');
					}
				}
				this.rendered = true;
			},
			validate:function(){
				var oldValid = this.valid;
				this.valid = this.field.isValid();
				this.validInfo = "第 "+(row.index +1)+" 行  "+(this.column.label)+" "+this.field.validInfo;
				
				if( oldValid!= this.valid){
					this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.valid});
				}
				return this.valid;
			},
			getField:function(){
				return this.field;
			},
			setField:function(tField){
				this.field = tField;
				this.field.addListener(this.field.events.validChange,this,function(sField,cell,event,eventOrigin){
					this.validate();
				});
			}
		});
		return cellInstance;
	}
};

//1、字符类型//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//字符 显示单元格
LUI.Grid.Cell.StringDisplayCell = {
	type:'stringDisplayColumn',
	createNew:function(grid,row,column){
		return $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
		});
	}
};

//字符 编辑单元格
LUI.Grid.Cell.StringCell = {
	type:'stringColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.String.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};

LUI.Grid.Cell.PasswordCell = {
	type:'passwordColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.Password.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};

LUI.Grid.Cell.StringSelectCell = {
	type:'stringSelectColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.StringSelect.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};

LUI.Grid.Cell.MobileCell = {
	type:'mobileColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.MobileNumber.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};

LUI.Grid.Cell.PostCodeCell = {
	type:'postCodeColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.PostCode.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};

LUI.Grid.Cell.EmailCell = {
	type:'emailColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.Email.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};

LUI.Grid.Cell.ChooseElCell = {
	type:'chooseElColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.StringChooseEl.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};

LUI.Grid.Cell.StringTextCell = {
	type:'stringTextColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.StringText.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};


//2、文本类型//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//文本 显示单元格
LUI.Grid.Cell.TextDisplayCell = {
	type:'textDisplayColumn',
	createNew:function(grid,row,column){
		return $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
		});
	}
};

LUI.Grid.Cell.TextCell = {
	type:'textColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.Textarea.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};

//3、逻辑类型//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//逻辑 显示列
LUI.Grid.Cell.BooleanDisplayCell = {
	type:'booleanDisplayColumn',
	createNew:function(grid,row,column){
		return $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			render:function(){
				if(this.field == null){
					//没有field的时候 才生成显示内容
					var rowData = this.row.record.getData();
					this.el = this.row.el.find(this.column.renderto);
					
					//显示单元格内容
					var _colValue = this.row.record.getFieldValue(this.column.name);
					if(this.column.initConfig.showCheckbox == "true"){
						var _colText = '<input type="checkbox" disabled '+(_colValue==true?'checked':'')+' style="width:14px;" class=" nim-field-el nim-field-disabled">';
						if(_colValue!=null){
							if(_colValue==true && this.column.initConfig.trueText !=null){
								_colText = _colText+this.column.initConfig.trueText;
							}

							if(_colValue==false && this.column.initConfig.falseText !=null){
								_colText = _colText+this.column.initConfig.falseText;
							}
						}
						this.el.html(_colText);
					}else{
						var _colText = "";
						if(_colValue!=null){
							_colText = ""+_colValue;
							if(_colValue && this.column.initConfig.trueText !=null){
								_colText = this.column.initConfig.trueText;
							}

							if(!_colValue && this.column.initConfig.falseText !=null){
								_colText = this.column.initConfig.falseText;
							}
						}
						this.el.html(_colText);
					}
					
				}
				this.rendered = true;
			}
		});
	}
};

LUI.Grid.Cell.BooleanCheckCell = {
	type:'booleanCheckColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.BooleanCheckEditor.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};

LUI.Grid.Cell.BooleanSelectCell = {
	type:'booleanSelectColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.BooleanCheckEditor.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};

LUI.Grid.Cell.BooleanRadioCell = {
	type:'booleanRadioColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.BooleanRadioEditor.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};


//4、整数类型//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//整数 显示列
LUI.Grid.Cell.IntDisplayCell = {
	type:'intDisplayColumn',
	createNew:function(grid,row,column){
		return $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				//显示单元格内容
				if(this.column.name.indexOf('@index') >=0){
					//显示序号
					this.el.html(this.row.index +1);
				}else{
					//显示单元格内容
					var rowData = this.row.record.getData();
					var _compiledValue = this.column._compiledTemplate(rowData);
					if(_compiledValue!=null && _compiledValue.length > 0){
						//不显示零值
						if(this.column.initConfig.zeroAsBlank=='true' && parseInt(_compiledValue) == 0){
							_compiledValue = '&nbsp;';
						}else{
							//如果使用千分符
							if(this.column.initConfig.showThousand == 'true'){
								_compiledValue = LUI.Util.thousandth(_compiledValue);
							}
							//对齐方式
							if(this.column.initConfig.textAlign != null){
								this.el.css('text-align',this.column.initConfig.textAlign);
							}
						}
						this.el.html(_compiledValue);
					}else{
						this.el.html('&nbsp;');
					}
				}
			}
		});
	}
};

LUI.Grid.Cell.IntCell = {
	type:'intColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.Int.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};

//5、小数类型//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//小数 显示列
LUI.Grid.Cell.DoubleDisplayCell = {
	type:'doubleDisplayColumn',
	createNew:function(grid,row,column){
		return $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				//显示单元格内容
				var rowData = this.row.record.getData();
				var _compiledValue = this.column._compiledTemplate(rowData);
				if(_compiledValue!=null && _compiledValue.length > 0){
					//不显示零值
					if(this.column.initConfig.zeroAsBlank=='true' && parseFloat(_compiledValue) == 0){
						_compiledValue = '&nbsp;';
					}else{
						//如果使用千分符
						if(this.column.initConfig.showThousand == 'true'){
							_compiledValue = LUI.Util.thousandth(_compiledValue);
						}
						//是否需要补齐小数位
						if(this.column.initConfig.decLength != null && this.column.initConfig.decLength !='0'){
							var cDecLength = 0;
							if(_compiledValue.indexOf('.') > 0){
								cDecLength = _compiledValue.substr(_compiledValue.indexOf('.')).length -1;
							}else{
								_compiledValue +='.';
							}
							_compiledValue += '000000'.substr(0,parseInt(this.column.initConfig.decLength)-cDecLength);
						}
						//对齐方式
						if(this.column.initConfig.textAlign != null){
							this.el.css('text-align',this.column.initConfig.textAlign);
						}
					}
					this.el.html(_compiledValue);
				}else{
					this.el.html('&nbsp;');
				}
			}
		});
	}
};
//小数 编辑列
LUI.Grid.Cell.DoubleCell = {
	type:'doubleColumn',
	createNew:function(grid,row,column){
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.Double.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};
//6、日期类型//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//日期 显示列
LUI.Grid.Cell.DateDisplayCell = {
	type:'dateDisplayColumn',
	createNew:function(grid,row,column){
		return $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
		});
	}
};

//日期 编辑列
LUI.Grid.Cell.DateCell = {
	type:'dateColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.Date.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};

LUI.Grid.Cell.TimeCell = {
	type:'timeColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.Time.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};

LUI.Grid.Cell.MonthCell = {
	type:'monthColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.Month.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};

//7、对象类型//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//对象 显示列
LUI.Grid.Cell.ObjectDisplayCell = {
	type:'objectDisplayColumn',
	createNew:function(grid,row,column){
		return $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
		});
	}
};

//对象 下拉选择列
LUI.Grid.Cell.ObjectSelectCell = {
	type:'objectSelectColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.ObjectSelect.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};

//对象 无线按钮列
LUI.Grid.Cell.ObjectRadioCell = {
	type:'objectRadioColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.ObjectRadioEditor.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};

//对象 附件上传列
LUI.Grid.Cell.FileUploaderCell = {
	type:'fileUploaderColumn',
	createNew:function(grid,row,column){
		//创建单元格
		var cell = $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
			setValue:function(newVal,silence,isInitial,originSource){
				//通知编辑列setValue
				this.field.setValue(newVal,silence,isInitial,originSource);
			},
			getValue:function(){
				//显示列没有getValue
				return this.field.getValue();
			},
			render:function(){
				this.el = this.row.el.find(this.column.renderto);
				
				this.field.render();
			}
		});
		//创建编辑控件
		var f = LUI.Form.Field.File.createNew(column.initConfig,null,false);
		cell.setField(LUI.Grid.CellEditor.createNew(grid,cell,f));
		return cell;
	}
};
//8、集合类型//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//集合 显示列
LUI.Grid.Cell.SetDisplayCell = {
	type:'setDisplayColumn',
	createNew:function(grid,row,column){
		return $.extend(LUI.Grid.Cell.createNew(grid,row,column),{
		});
	}
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//注册//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
LUI.Grid.CellFactoryManager = {
	types:LUI.Map.createNew(),
	getCellFactory:function(type,component){
		var dataType = type;
		if(dataType==null || !dataType.endWith("Column") ){
			dataType = (dataType||'string')+"Column";
		}
		var fieldEditSet = LUI.Grid.CellFactoryManager.types.get(dataType);
		if(fieldEditSet==null){
			LUI.Message.warn('创建列失败','列类型('+type+'：'+dataType+')不存在！');
			return null;
		}
		
		var widgetType = component||'default';
		var columnFactory = fieldEditSet.get(widgetType);
		if(columnFactory==null){
			LUI.Message.warn('创建列失败','列('+dataType+'.'+widgetType+')不存在！');
			return null;
		}
		return columnFactory;
	},
	regsterCellFactory:function(dataType,column_subclass,isDefault){
		if(column_subclass == null){
//			LUI.Message.warn('注册field失败','未提供字段对象！'+dataType);
			return null;
		}
		var dataTypeMap = LUI.Grid.CellFactoryManager.types.get(dataType);
		if(dataTypeMap==null){
			dataTypeMap = LUI.Map.createNew();
			LUI.Grid.CellFactoryManager.types.put(dataType,dataTypeMap); 
		}
		
		dataTypeMap.put(column_subclass.type,column_subclass);
		if(isDefault){
			dataTypeMap.put('default',column_subclass);
		}
	}
};

//	LUI.Grid.CellFactoryManager.regsterCellFactory('stringColumn',LUI.Grid.Cell.StringSelectCell);
//	LUI.Grid.CellFactoryManager.regsterCellFactory('stringColumn',LUI.Grid.Cell.StringPlusSelect);
	LUI.Grid.CellFactoryManager.regsterCellFactory('stringColumn',LUI.Grid.Cell.EmailCell);//邮箱
	LUI.Grid.CellFactoryManager.regsterCellFactory('stringColumn',LUI.Grid.Cell.MobileCell);//手机号
	LUI.Grid.CellFactoryManager.regsterCellFactory('stringColumn',LUI.Grid.Cell.PostCodeCell);//邮编
	LUI.Grid.CellFactoryManager.regsterCellFactory('stringColumn',LUI.Grid.Cell.ChooseElCell);
	LUI.Grid.CellFactoryManager.regsterCellFactory('stringColumn',LUI.Grid.Cell.StringTextCell);
	LUI.Grid.CellFactoryManager.regsterCellFactory('stringColumn',LUI.Grid.Cell.PasswordCell);
	LUI.Grid.CellFactoryManager.regsterCellFactory('stringColumn',LUI.Grid.Cell.StringCell);
	LUI.Grid.CellFactoryManager.regsterCellFactory('stringColumn',LUI.Grid.Cell.StringDisplayCell,true);

	
	LUI.Grid.CellFactoryManager.regsterCellFactory('textColumn',LUI.Grid.Cell.TextCell);
	LUI.Grid.CellFactoryManager.regsterCellFactory('textColumn',LUI.Grid.Cell.TextDisplayCell,true);

	LUI.Grid.CellFactoryManager.regsterCellFactory('intColumn',LUI.Grid.Cell.IntCell);
	LUI.Grid.CellFactoryManager.regsterCellFactory('intColumn',LUI.Grid.Cell.IntDisplayCell,true);

//	LUI.Grid.CellFactoryManager.regsterCellFactory('doubleColumn',LUI.Grid.Cell.Money);//元
//	LUI.Grid.CellFactoryManager.regsterCellFactory('doubleColumn',LUI.Grid.Cell.TenThousandMoney);//万元
//	LUI.Grid.CellFactoryManager.regsterCellFactory('doubleColumn',LUI.Grid.Cell.RenMinB);//人民币元
//	LUI.Grid.CellFactoryManager.regsterCellFactory('doubleColumn',LUI.Grid.Cell.TenThousandRenMinB);//人民币万元
	LUI.Grid.CellFactoryManager.regsterCellFactory('doubleColumn',LUI.Grid.Cell.DoubleCell);//人民币万元
	LUI.Grid.CellFactoryManager.regsterCellFactory('doubleColumn',LUI.Grid.Cell.DoubleDisplayCell,true);//小数

	LUI.Grid.CellFactoryManager.regsterCellFactory('booleanColumn',LUI.Grid.Cell.BooleanSelectCell);
	LUI.Grid.CellFactoryManager.regsterCellFactory('booleanColumn',LUI.Grid.Cell.BooleanRadioCell);
	LUI.Grid.CellFactoryManager.regsterCellFactory('booleanColumn',LUI.Grid.Cell.BooleanCheckCell);
	LUI.Grid.CellFactoryManager.regsterCellFactory('booleanColumn',LUI.Grid.Cell.BooleanDisplayCell,true);

	LUI.Grid.CellFactoryManager.regsterCellFactory('dateColumn',LUI.Grid.Cell.MonthCell);
	LUI.Grid.CellFactoryManager.regsterCellFactory('dateColumn',LUI.Grid.Cell.TimeCell);
	LUI.Grid.CellFactoryManager.regsterCellFactory('dateColumn',LUI.Grid.Cell.DateCell);
	LUI.Grid.CellFactoryManager.regsterCellFactory('dateColumn',LUI.Grid.Cell.DateDisplayCell,true);

//	LUI.Grid.CellFactoryManager.regsterCellFactory('objectColumn',LUI.Grid.Cell.ObjectRadioOther);//无线按钮选择+其它
//	LUI.Grid.CellFactoryManager.regsterCellFactory('objectColumn',LUI.Grid.Cell.ObjectPopup);//弹出式选择
	LUI.Grid.CellFactoryManager.regsterCellFactory('objectColumn',LUI.Grid.Cell.FileUploaderCell);//文件
	LUI.Grid.CellFactoryManager.regsterCellFactory('objectColumn',LUI.Grid.Cell.ObjectRadioCell);//无线按钮选择
	LUI.Grid.CellFactoryManager.regsterCellFactory('objectColumn',LUI.Grid.Cell.ObjectSelectCell);//下拉选择
	LUI.Grid.CellFactoryManager.regsterCellFactory('objectColumn',LUI.Grid.Cell.ObjectDisplayCell,true);//下拉选择

	LUI.Grid.CellFactoryManager.regsterCellFactory('setColumn',LUI.Grid.Cell.SetCheckboxEditor);
	LUI.Grid.CellFactoryManager.regsterCellFactory('setColumn',LUI.Grid.Cell.SetFileEditor);
	LUI.Grid.CellFactoryManager.regsterCellFactory('setColumn',LUI.Grid.Cell.SetGridEditor);
	LUI.Grid.CellFactoryManager.regsterCellFactory('setColumn',LUI.Grid.Cell.SetDisplayCell,true);
	

