//集合类型的字段 在此文件内定义
//集合类型的字段提供：
//1、removeAll
//2、insertItem
//2、addItem
//3、removeItem
//除了初始化的时候 数据源自动为字段setValue 不允许手工调用setValue

LUI.Form.SetField = {
	createNew:function(fieldMeta,lui_form){
		var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
			options:[],
			render:function(){
				LUI.Message.warn('警告','必须为集合类型的类提供render方法！');
				return;
			},
			setValue:function (val,silence,isInitial,originSource){
				LUI.Message.warn('警告','必须为集合类型的类提供setValue方法！');
				return;
			},
			_onAdd:function (record,silence,originSource){
				return;
			},
			_onRemove:function (record,silence,originSource){
				return;
			},
			_onChange:function (record,silence,originSource){
				return;
			},
			/**
			 * 将显示值转换为数据值
			 */
			parseRawValue:function(rawVal){
				LUI.Message.warn('错误','集合类型的字段不需要转换数据值！');				
				return null;
			},
			/**
			 * 将数据值格式化为显示值 (对每个可选对象 处理为checkbox的label)
			 */
			formatRawValue:function(dataVal){
				LUI.Message.warn('错误','集合类型的字段不需要转换显示值！');				
				return null;
			},
			displayRawValue:function (){
				LUI.Message.warn('错误','集合类型的字段不需要重新显示！');
				return ;
			},
			validate:function(){
				//集合字段 默认只检查是否允许为空（以后可以加上最大行数 最小行数）
				this.isValid = true;
				//检查存储值是否 有效
				if((this.value==null || this.value.length ==0) && !this.allowBlank){
					this.isValid = false;
					this.validInfo = '此字段不允许为空!';
				}else{
					this.isValid = true;
				}
				
				if(!this.isValid){
					this.markInvalid();
				}else{
					this.clearInvalid();
				}
				return this.isValid;
			},
			markInvalid:function(){
				if(this.enabled && this.rendered ){
					this.el.addClass('nim-field-invalid');
				}
			},
			clearInvalid:function(){
				if(this.rendered ){
					this.el.removeClass('nim-field-invalid');
				}
			},
			enable:function(){
				LUI.Message.warn('警告','必须为集合类型的类提供 enable 方法！');
				return ;
			},
			disable:function(){
				LUI.Message.warn('警告','必须为集合类型的类提供 disable 方法！');
				return ;
			},
			setSizeDesignable:function(node,isEnable){
				if(!this.rendered){
					return;
				}
				if(this.designNode == null && node!=null){
					this.designNode = node;
				}
				//是否启用尺寸的设计模式
				if(isEnable){
					var _this = this;
					this.el.addClass('ui-resizable-border');
					this.el.inputResizable({
						helper: "ui-resizable-helper",
						cancel: ".cancel",
						stop: function( event, ui ) {
							if(_this.designNode!=null){
								//设置字段的width height参数
								_this.designNode.record.setFieldValue('width',ui.size.width+"px");
								_this.designNode.record.setFieldValue('height',ui.size.height+"px");
							}
						}
					});
				}else{
					var as = this.el.inputResizable( "instance" );
					if(as!=null){
						this.el.removeClass('ui-resizable-border');
						this.el.inputResizable( "destroy" );
					}
				}
			}
		});
		return field;
	}
};


//复选框类型的集合字段编辑控件
//
LUI.Form.SetField.CheckboxEditor = {
	uniqueId:0,
	type:'setCheckboxEditor',
	createNew:function(fieldMeta,lui_form){
		var datasourceType = fieldMeta.datasourceType;
		var _datasource = LUI.Datasource.getInstance(fieldMeta.datasourceName);
		if(_datasource == null){
			LUI.Message.warn('创建字段失败','字段('+fieldMeta.name+')未设置数据源！');
			return null;
		}
		//关键字段的显示表达式
		var renderTemplateExpression = null;
		if(fieldMeta.renderTemplate!=null && fieldMeta.renderTemplate.length >0){
			
			//替换表达式模板中 与当前字段名有关的部分（在字段内 使用子对象生成显示内容）
			var renderTemplate = fieldMeta.renderTemplate.replace(fieldMeta.name+'.','') ;
			var renderTemplate = renderTemplate.replace(fieldMeta.keyProperty+'.',"") ;
			renderTemplateExpression = Handlebars.compile(renderTemplate);
		}else{
			LUI.Message.warn('创建字段失败','字段('+fieldMeta.name+')未设置显示表达式！');
			return null;
		}
		
		var field = $.extend(LUI.Form.SetField.createNew(fieldMeta,lui_form),{
			id: '_form_field_set_checkbox_'+(++LUI.Form.SetField.CheckboxEditor.uniqueId),
			type:LUI.Form.SetField.CheckboxEditor.type,
			options:[],
			datasource:_datasource,
			renderTemplateExpression:renderTemplateExpression,
			render:function(){
				if(this.renderType != 'none'){
					//从数据源中取得选项
					if(this.createFieldEl(LUI.Template.Field.setCheckbox)){
						//显示所有选项
						
						//取得第一个元素 作为迭代选项的依据
						var itemEl = this.el.children().first();
						var itemType = itemEl[0].tagName;
						
						//删除所有子元素
						this.el.children(itemType).remove();
						
						this.checkboxes = [];
						
						var contextThis = this;
						//根据option 创建多个checkbox
						for(var i=this.datasource.size()-1;i>=0;i--){
							var r = this.datasource.getRecord(i);
							var keyData = r.getData();
							var text = this.renderTemplateExpression(keyData);
							
							var newLiEl = itemEl.clone().prependTo(this.el);
							
							var itemData = {};
							itemData[this.keyProperty] = keyData;
							
							var newInputEl = newLiEl.find(':checkbox').first();
							newInputEl.attr('id',this.form.name+'_'+this.name+'_option_checkbox_'+i)
								.prop("checked", false)
								.attr("keyValue", r.primaryFieldValue)
								.data("itemData", itemData)
								.bind('change',function(){
									var fieldRecordset = contextThis.form.record.getFieldValue(contextThis.name);
									
									var cValue = $(this).prop("checked");
									if(cValue == true){
										fieldRecordset.addRecord($(this).data("itemData"));//触发form.record的change事件 为当前字段设置最新值 并重新显示
									}else{
										var pkValue = 1 * $(this).attr("keyValue");
										for(var k=0;k<fieldRecordset.size();k++){
											var kr = fieldRecordset.getRecordByIndex(k);
											if(kr.getFieldValue(contextThis.keyProperty).primaryFieldValue == pkValue){
												fieldRecordset.removeRecordByIndex(k);//触发form.record的change事件 为当前字段设置最新值 并重新显示
												break;
											}
										}
									}
//									contextThis.value = fieldRecordset.getData();
								});
							newLiEl.find('label').first()
								.attr('id',this.form.name+'_'+this.name+'_option_label_'+i)
								.attr('for',this.form.name+'_'+this.name+'_option_checkbox_'+i)
								.html(text);
										  
							if (isIE) {
								//在ie浏览器中 checkbox需要失去焦点才能触发change事件
								newLiEl.find(':checkbox').first().click(function () {
									this.blur();
									this.focus();
								});
							};
							this.checkboxes[this.checkboxes.length] = newInputEl;
						}
					
						//显示选中情况
//						this.displayRawValue();
						//将自定义onchange方法 绑定到当前对象的change事件
						if(this.onChangeFunction!=null){
							this.addListener(this.events.change,this._observer,this.onChangeFunction);
						}
						this.rendered = true;
					}
				}
				this.validate(this.value);
			},
			displayRawValue:function (){
				//取消所有选中
				for(var j=0;j<this.checkboxes.length;j++){
					this.checkboxes[j].prop("checked", false);
				}
				//重新显示所有选项的选中情况
				if(this.value!=null){
					for(var j=0;j<this.value.length;j++){
						var keyValue = this.value[j][this.keyProperty][this.datasource.primaryFieldName];
						var oEl = this.el.find("[keyValue='"+keyValue+"']");
						if(oEl.length ==1){
							oEl.prop("checked", true);
						}else if(oEl.length >1){
							LUI.Message.error("警告","找到多个主键值（"+keyValue+"）匹配的选项！");
							return;
						}else{
							LUI.Message.error("警告","未找到主键值（"+keyValue+"）匹配的选项！");
							return;
						}
					}
				}
				
			},
			setValue:function (newVal,silence,isInitial,originSource){
				var oldVal = this.value;
				//如果值有变化
				if(!this.equalsValue(this.value,newVal)){
					this.value = newVal;
					this.validate(this.value)
					//重新显示
					this.displayRawValue();
					
					//触发change事件
					if(!silence && (originSource==null || originSource != this)){
						this.fireEvent(this.events.change,{
							oldValue:oldVal,
							newValue:newVal,
							isInitial: (isInitial ==null?false:isInitial)
						},originSource||this);
					}
				}
			},
			equalsValue:function(val1,val2){
				if((val1==null && val2!=null) || (val1!=null && val2==null)){
					return false;
				}else if(val1==null && val2==null){
					return true;
				}else if(val1.length != val2.length){
					return false;
				}
				//检查是否有不匹配的值
				for(var i=0;i<val1.length;i++){
					var keyValue1 = val1[i][this.keyProperty][this.datasource.primaryFieldName];
					var exists = false;
					for(var j=0;j<val1.length;j++){
						var keyValue2 = val2[j][this.keyProperty][this.datasource.primaryFieldName];
						if(keyValue1 == keyValue2){
							exists = true;
							break;
						}
					}
					if(!exists){
						return false;
					}
				}
				
				return true;
			},

			/**
			 * 将数据值格式化为显示值 (对每个可选对象 处理为checkbox的label)
			 */
			enable:function(){
				this.enabled = true;
				if(!this.isValid){
					this.markInvalid();
				}
				//将字段变为可编辑
				this.el.removeClass('nim-field-disabled');
				this.el.find(':checkbox').removeAttr('disabled');
			},
			disable:function(){
				this.enabled = false;
				if(!this.isValid){
					//disable状态下 不显示数据是否有效
					this.clearInvalid();
				}
				this.el.addClass('nim-field-disabled');
				this.el.find(':checkbox').attr('disabled','true');
			}
		});
		return field;
	}
};



//复选框类型的集合字段编辑控件
//
LUI.Form.SetField.FileEditor = {
	uniqueId:0,
	type:'setFileEditor',
	createNew:function(fieldMeta,lui_form){
		
		var field = $.extend(LUI.Form.SetField.createNew(fieldMeta,lui_form),{
			id: '_form_field_set_file_'+(++LUI.Form.SetField.FileEditor.uniqueId),
			type:LUI.Form.SetField.FileEditor.type,
			fileItemEl:null,
			fileListEl:null,
			render:function(){
				if(this.renderType != 'none'){
					//从数据源中取得选项
					if(this.createFieldEl(LUI.Template.Field.setFile)){
						//生成方式为“关联”的附件集合类型，需要检查是否提供了uploaderEl参数 
						this.uploader = null;
						//检查是否提供了uploaderEl参数 
						if(this.uploaderEl!=null){
							this.uploader = this.form.el.find(this.uploaderEl).first();
							//隐藏
							this.el.find("#toolsbar").remove();
						}else{
							//未提供参数 检查是否存在#uploader .uploader
							this.uploader = this.el.find("#uploader ,.uploader").first();
						}
						//如果disable 隐藏上传按钮
						if(this.enabled == true && this.uploader.length == 0){
							LUI.Message.warn('警告','未找到字段'+this.name+'('+this.label+')的上传按钮元素('+this.uploaderEl+'/uploader)！');
							return false;
						}
						
						//取得第一个li元素 作为迭代显示的依据
						this.fileItemEl = this.el.find('li').first();
						this.fileListEl= this.fileItemEl.parent();
						//上传链接
						var contextThis = this;
						this.uploader.click(function(){
							if(contextThis.enabled){
								LUI.Util.uploadFile({
									context:contextThis,
									multiple:true
								},function(data){
									if(data!=null && data.length >0){
										var fieldRecordset = contextThis.form.record.getFieldValue(contextThis.name);
										for(var i = 0;i<data.length;i++){
											var itemData = {};
											itemData[contextThis.keyProperty] = data[i];
											fieldRecordset.addRecord(itemData);//触发form.record的change事件 为当前字段设置最新值 并重新显示
										}
									}
								});
							}
						});
						//显示内容
						this.displayRawValue();
						//将自定义onchange方法 绑定到当前对象的change事件
						if(this.onChangeFunction!=null){
							this.addListener(this.events.change,this._observer,this.onChangeFunction);
						}
						this.rendered = true;
					}
				}
				this.validate(this.value);
			},
			displayRawValue:function (){
				//删除所有内容
				if(this.fileListEl==null){
					return;
				}
				this.fileListEl.children().remove();
				//重新显示内容
				if(this.value!=null){
					var contextThis = this;
					for(var j=0;j<this.value.length;j++){
						//当前元素 及 附件主键值
						var newLiEl = this.fileItemEl.clone().appendTo(this.fileListEl);
						var newLiData = this.value[j][this.keyProperty];
						var newLiElPKValue = newLiData.fuJianDM;
						//删除按钮
						newLiEl
						.find('#remover')
						.attr("keyValue", newLiElPKValue)
						.click(function(){
							var pkValue = 1 * $(this).attr("keyValue");
							var fieldRecordset = contextThis.form.record.getFieldValue(contextThis.name);
							for(var k=0;k<fieldRecordset.size();k++){
								var kr = fieldRecordset.getRecordByIndex(k);
								if(kr.getFieldValue(contextThis.keyProperty).primaryFieldValue == pkValue){
									fieldRecordset.removeRecordByIndex(k);//触发form.record的change事件 为当前字段设置最新值 并重新显示
									break;
								}
							}
						});
						//下载链接
						newLiEl.find('#shower')
						.attr("keyValue", newLiElPKValue)
						.html(newLiData.shangChuanWJM)
						.click(function(){
							var pkValue = 1 * $(this).attr("keyValue");
							LUI.Util.downloadFile(pkValue);
						});
						
						newLiEl.find('#icon').addClass('nim-file-type-icon-16-'+newLiData.wenJianHZ);
					}
				}
				
			},
			setValue:function (newVal,silence,isInitial,originSource){
				var oldVal = this.value;
				//如果值有变化
				if(!this.equalsValue(this.value,newVal)){
					this.value = newVal;
					this.validate(this.value)
					//重新显示
					this.displayRawValue();
					
					//触发change事件
					if(!silence && (originSource==null || originSource != this)){
						this.fireEvent(this.events.change,{
							oldValue:oldVal,
							newValue:newVal,
							isInitial: (isInitial ==null?false:isInitial)
						},originSource||this);
					}
				}
			},
			equalsValue:function(val1,val2){
				if((val1==null && val2!=null) || (val1!=null && val2==null)){
					return false;
				}else if(val1==null && val2==null){
					return true;
				}else if(val1.length != val2.length){
					return false;
				}
				//检查是否有不匹配的值
				for(var i=0;i<val1.length;i++){
					var keyValue1 = val1[i][this.keyProperty].fuJianDM;
					var exists = false;
					for(var j=0;j<val1.length;j++){
						var keyValue2 = val2[j][this.keyProperty].fuJianDM;
						if(keyValue1 == keyValue2){
							exists = true;
							break;
						}
					}
					if(!exists){
						return false;
					}
				}
				
				return true;
			},

			/**
			 * 将数据值格式化为显示值 (对每个可选对象 处理为checkbox的label)
			 */
			enable:function(){
				this.enabled = true;
				if(!this.isValid){
					this.markInvalid();
				}
				//将字段变为可编辑
				this.el.removeClass('nim-field-disabled');
				this.uploader.css('display','inline-block');
				this.el.find('#remover').css('display','inline');
			},
			disable:function(){
				this.enabled = false;
				if(!this.isValid){
					//disable状态下 不显示数据是否有效
					this.clearInvalid();
				}
				this.el.addClass('nim-field-disabled');
				this.uploader.css('display','none');
				this.el.find('#remover').css('display','none');
			}
		});
		return field;
	}
};

LUI.Form.SetField.GridEditor = {
	uniqueId:0,
	type:'setGridEditor',
	createNew:function(fieldMeta,lui_form){
		var field = $.extend(LUI.Form.SetField.createNew(fieldMeta,lui_form),{
			id: '_form_field_set_grid_'+(++LUI.Form.SetField.GridEditor.uniqueId),
			type:LUI.Form.SetField.GridEditor.type,
			getGrid:function(){
				return this.grid;
			},
			render:function(){
				if(this.renderType != 'none'){
					//生成toolsbar
					this.toolsbar.render();
					//显示表格
					this.grid.render();
					//将自定义onchange方法 绑定到当前对象的change事件
					if(this.onChangeFunction!=null){
						this.addListener(this.events.change,this._observer,this.onChangeFunction);
					}
					this.rendered = true;
				}
//				this.validate();
			},
			_onAdd:function (record,silence,originSource){
				this.grid.addRow(record);
			},
			_onRemove:function (record,silence,originSource){
				this.grid.removeRow(record);
			},
			_onChange:function (record,silence,originSource){
				if(originSource.id != this.grid.id){
					//通知有变化的行重新显示
					var row = this.grid.getRowByRecord(record);
					this.grid.renderRow(row);
				}
			},
			setValue:function (newVal,silence,isInitial,originSource){
				this.value = newVal;
//				this.validate();
				if(isInitial){
					//初始化的时候  从recordset中 直接取得
					var rs = this.form.record.getFieldValue(this.name);
					for(var i=0;i<rs.size();i++){
						this.grid.addRow(rs.getRecordByIndex(i));
					}
				}else{
					//为field setValue 通知resultset改变 通过对resultset的监听间接改变字段的显示
					this.form.record.setFieldValue(this.name,newVal,false,false,null);
				}
			},
			equalsValue:function(val1,val2){
				return false;
			},
			validate:function(){
				//集合字段 默认只检查是否允许为空（以后可以加上最大行数 最小行数）
				this.isValid = true;
				//检查存储值是否 有效
				if((this.value==null || this.value.length ==0) && !this.allowBlank){
					this.isValid = false;
					this.validInfo = '此字段不允许为空!';
				}else{
					this.grid.validate();//表格的校验结果  会通过validchange事件 改变当前字段的校验信息
				}
				return this.isValid;
			},
			/**
			 * 将数据值格式化为显示值 (对每个可选对象 处理为checkbox的label)
			 */
			enable:function(){
				this.enabled = true;
				//将表格变为可编辑
				if(this.grid!=null){
					this.grid.enable();
				}
				//将按钮变为可点击
				if(this.toolsbar!=null){
					this.toolsbar.enable();
				}
				
				if(!this.isValid){
					this.markInvalid();
				}
			},
			disable:function(){
				this.enabled = false;
				if(!this.isValid){
					//disable状态下 不显示数据是否有效
					this.clearInvalid();
				}
				//将表格变为不可编辑
				if(this.grid!=null){
					this.grid.disable();
				}
				//将按钮变为不可点击
				if(this.toolsbar!=null){
					this.toolsbar.disable();
				}
			},
			markInvalid:function(){
				//通知表格标记输入值非法的编辑字段
//				this.grid.markInvalid();
				return;
			},
			clearInvalid:function(){
				//清除表格中编辑字段的输入值非法标志
//				this.grid.clearInvalid();
				return;
			},
			setSizeDesignable:function(node,isEnable){
				return;
			}
		});
		//关联的表格
		var subGrid = LUI.Grid.getInstance(field.gridName);
		if(subGrid!=null){
			subGrid.parentField = field;
			field.grid = subGrid;
			
			subGrid.addListener(subGrid.events.validChange,field,function(sGrid,field,event,eventOrigin){
				field.isValid = sGrid.isValid;
				field.validInfo = sGrid.validInfo;
			});
		}
		//关联的toolsbar 
		field.toolsbar = LUI.Toolsbar.createNew();
		if(field.buttons!=null){
			for(var i=0;i<field.buttons.length;i++){
				var btncfg = field.buttons[i];
				if(btncfg.component =='appendButton'){
					//新增行按钮
					btncfg.action = function(){
						var fieldRecordset = field.form.record.getFieldValue(field.name);
						fieldRecordset.addRecord({});//触发form.record的change事件 为当前字段设置最新值 并重新显示
					}
				}else if (btncfg.component =='removeButton'){
					
				}
				field.toolsbar.addButton(LUI.Toolsbar.Button.createNew(btncfg));
			}
		}
		
		return field;
	}
};