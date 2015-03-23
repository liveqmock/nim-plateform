//alert("LUI.Form.Field");

/**
 * 显示用的字段定义
 */
LUI.Form.DisplayField = {
	uniqueId:0,
	type:'displayField',
	createNew:function(fieldMeta,lui_form){
		var fieldConfig = $.extend({},fieldMeta);
		
		var zeroAsBlank = false;
		if(fieldMeta.zeroAsBlank!=null && (fieldMeta.zeroAsBlank==false || fieldMeta.zeroAsBlank == "true") ){
			zeroAsBlank = true;
		}
		
		var _template = null;
		if(fieldMeta.renderTemplate!=null && fieldMeta.renderTemplate.length >0){
			_template = Handlebars.compile(fieldMeta.renderTemplate);//可以缓存 提高效率
		}

		
		fieldConfig.zeroAsBlank = zeroAsBlank;
		
		//字段定义中的type 与字段对象的type有冲突 因为type定义已经在选择fieldFactory时起作用了 所以可以删除
		fieldConfig.dataType = fieldConfig.type||fieldConfig.fieldType;//字段定义中的type 其实是数据类型
		delete fieldConfig.type;                
		
		var fieldCfg = $.extend({
			name:null,
			label:null,
			config:fieldConfig,
			el:null,
			form:lui_form,
			renderType:'rela',
			zeroAsBlank:zeroAsBlank,
			template:_template,
			/**
			 * 显示字段与数据字段绑定 ：
			 * 0、解除与原数据字段之间的绑定
			 * 1、数据字段监听显示字段的变化：将新值同步到数据字段
			 * 2、显示字段监听数据字段的变化：显示新值
			 */
			/**
			 * 为字段设置值
			 */
			value:null,//实际值
			setValue:function (newVal,silence,isInitial,originSource){
				//记录字段值
				this.value = newVal;
				//校验通过后 重新格式化显示值
				this.rawValue = this.formatRawValue(newVal);
				if(this.rendered ){
					this.displayRawValue();
				}
			},
			rawValue:'',//显示值
			//用户录入了新的内容 不要手工调用此方法 只允许因用户录入改变此值
			/**
			 * 取得字段实际值
			 */
			getValue:function (){
				return this.value;
			},
			/**
			 * 取得字段显示值
			 */
			getRawValue:function (){
				return this.rawValue;
			},
			displayRawValue:function (){
				//将显示值 重新显示到页面
				this.inputEl.html(this.rawValue);
			},
			/**
			 * 将数据值格式化为显示值
			 */
			formatRawValue:function(dataVal){
				var _rawValue = '';
				if(dataVal!=null){
					if(this.template!=null){
						var _value = {};
						_value[this.name] = dataVal;
						_rawValue = this.template(_value);
					}else{
						_rawValue = ''+dataVal;
					}
				}
				return _rawValue;
			},
			el:null,
			inputEl:null,
			oldEl:null,
			createFieldEl:function(_templateString){
				if((this.renderType == 'replace' || this.renderType == 'rela') && this.form.renderType !='rela'){
					LUI.Message.warn('未生成字段','当前表单的生成方式为'+this.form.renderType+',不允许字段'+this.name+'('+this.label+')使用'+this.renderType+'生成方式！');
					return false;
				}
				
				var _template = null;
				var fieldContentString = null;
				
				if(_templateString!=null){
					_template = Handlebars.compile(_templateString);
					fieldContentString = _template(this);
				}
				//根据构建类型 确定如何render
				if(this.renderType == 'append' ){
					//创建新的label、input元素 放置到form内部 
					this.el = $(fieldContentString);
					this.el.appendTo(this.form.formEl);
				}else if(this.renderType == 'insert' ){
					//创建新的input元素 放置到原有元素内部 
					this.el = $(fieldContentString).find('.nim-field-wrapper');
					this.el.appendTo($(this.form.formEl).find(this.renderto).first());
				}else if(this.renderType == 'replace'){
					//替换原有input
					this.oldEl = $(this.form.formEl).find(this.renderto).first();
					if(this.oldEl.length == 0){
						LUI.Message.warn('未替换字段','在当前表单内未找到字段'+this.name+'('+this.label+')的目标元素('+this.renderto+')！');
						return false;
					}
					//在原有元素后 插入新的input元素
					this.oldEl.after($(fieldContentString).find('.nim-field-wrapper'));
					this.el = this.oldEl.next();
					//删除原有元素
					this.oldEl.remove();
				}else if(this.renderType == 'rela'){
					this.el = $(this.form.formEl).find(this.renderto).first();
					if(this.el.length == 0){
						LUI.Message.warn('未关联字段','在当前表单内未找到字段'+this.name+'('+this.label+')的目标元素('+this.renderto+')！');
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
			rendered:false,
			//创建页面元素
			render:function(){
				if(this.renderType != 'none' ){
					//根据构建类型 确定如何render
					if(this.createFieldEl(LUI.Template.Field.displayField)){
						this.fieldWidth = this.inputEl.width();
						this.rendered = true;
						//原值要重新显示出来
						this.displayRawValue();
					}
				}
			},
			isValid:function (){
				return true;
			},
			//撤销对页面元素的创建
			deRender:function(forceDeRender){
				if(this.renderType != 'none' ){
					//根据构建类型 确定如何derender此按钮
					if(this.renderType == 'append'){
						//从form中 删除当前元素
						this.el.remove();
					}else if(this.renderType == 'insert'){
						//删除新的input元素
						this.el.remove();
					}else if(this.renderType == 'replace'){
						//将保存的原有元素信息 放回原处
						this.el.after(this.oldEl);
						//删除新的input元素
						this.el.remove();
					}else if(this.renderType == 'rela'){
						
					}
				}
				
				this.el = null;
				this.inputEl = null;
				this.rendered = false;
			},
			/**
			 * 删除所有监听 以及对数据字段的监听
			 */
			destroy:function(distroyExistsEl){
				if(this.rendered){
					this.deRender(true);
				}
				this.value = null;
				this.rawValue = null;
			},
			designNode:null,
			setSizeDesignable:function(node,isEnable){
				if(!this.rendered){
					return;
				}
				if(this.designNode == null && node!=null){
					this.designNode = node;
				}
			},
			//在设计模式下 监听inputEl的ctrl+click事件 选中设计器中的节点
			setRelationToHTML:function(){
				if(this.inputEl!=null && _isDesignMode ){
					var _fieldName = this.name;
					var _formName = this.form.name;
					var _this = this;
					this.inputEl.bind('click',function(event){
						if(event.ctrlKey){
							var treeObj = LUI.PageDesigner.instance._pageCmpTree;
							if(_this.designNode == null){
								var fieldNodes = treeObj.getNodesByFilter(function(node){
									var fieldsNode = node.getParentNode();
									if(fieldsNode!=null && fieldsNode.getParentNode()!=null && fieldsNode.component!=null && fieldsNode.component.type == 'fields'){
										var formNode = fieldsNode.getParentNode();
										if(node.data.name == _fieldName && formNode.data.name == _formName){
											return true;
										}
									}
									return false;
								});
								_this.designNode = fieldNodes[0];
							}
							if(_this.designNode != null){
								//选中设计器中 对应的节点
								treeObj.selectNode(_this.designNode,false);
								LUI.PageDesigner.instance.onComponentNodeSelected(_this.designNode);
							}
						}
					});
				}
			}
		},fieldConfig);
		
		return $.extend(LUI.Observable.createNew(),fieldCfg);
	}
};



//字符 显示单元格
LUI.Form.DisplayField.StringDisplay = {
	type:'stringDisplay',
	createNew:function(fieldMeta,lui_form){
		return $.extend(LUI.Form.DisplayField.createNew(fieldMeta,lui_form),{
			id: '_form_field_'+LUI.Form.DisplayField.StringDisplay.type+'_'+(++LUI.Form.DisplayField.uniqueId),
			type:LUI.Form.DisplayField.StringDisplay.type
		});
	}
};

//文本 显示单元格
LUI.Form.DisplayField.TextDisplay = {
	type:'textDisplay',
	createNew:function(fieldMeta,lui_form){
		return $.extend(LUI.Form.DisplayField.createNew(fieldMeta,lui_form),{
			id: '_form_field_'+LUI.Form.DisplayField.TextDisplay.type+'_'+(++LUI.Form.DisplayField.uniqueId),
			type:LUI.Form.DisplayField.TextDisplay.type
		});
	}
};

//逻辑 显示列
LUI.Form.DisplayField.BooleanDisplay = {
	type:'booleanDisplay',
	createNew:function(fieldMeta,lui_form){
		return $.extend(LUI.Form.DisplayField.createNew(fieldMeta,lui_form),{
			id: '_form_field_'+LUI.Form.DisplayField.BooleanDisplay.type+'_'+(++LUI.Form.DisplayField.uniqueId),
			type:LUI.Form.DisplayField.BooleanDisplay.type,
			formatRawValue:function(dataVal){
				var _rawValue = '&nbsp;';
				if(dataVal!=null && dataVal!='null'){
					_rawValue = (dataVal == true || dataVal=='true') ?this.trueText:this.falseText;
				}
				return _rawValue;
			}
		});
	}
};

LUI.Form.DisplayField.BooleanRadioDisplay = {
	type:'booleanRadioDisplay',
	createNew:function(fieldMeta,lui_form){
		return $.extend(LUI.Form.DisplayField.createNew(fieldMeta,lui_form),{
			id: '_form_field_'+LUI.Form.DisplayField.BooleanRadioDisplay.type+'_'+(++LUI.Form.DisplayField.uniqueId),
			type:LUI.Form.DisplayField.BooleanRadioDisplay.type,
			formatRawValue:function(dataVal){
				var _rawValue = '&nbsp;';
				if(dataVal!=null && dataVal!='null'){
					_rawValue = '<input type="radio" disabled '+((dataVal == true || dataVal=='true')?'checked':'')+' style="width:14px;" class="nim-field-checkbox ">' +
					'<label class="nim-field-checkbox-text" style="line-height: 19px;" >'+this.trueText+'</label>'+
					'<input type="radio" disabled '+((dataVal == true || dataVal=='true')?'':'checked')+' style="width:14px;" class="nim-field-checkbox ">' +
					'<label class="nim-field-checkbox-text" style="line-height: 19px;" >'+this.falseText+'</label>';
				}else{
					_rawValue = '<input type="radio" disabled style="width:14px;" class="nim-field-checkbox ">' +
					'<label class="nim-field-checkbox-text" style="line-height: 19px;" >'+this.trueText+'</label>'+
					'<input type="radio" disabled style="width:14px;" class="nim-field-checkbox ">' +
					'<label class="nim-field-checkbox-text" style="line-height: 19px;" >'+this.falseText+'</label>';
				}
				return _rawValue;
			}
		});
	}
};

LUI.Form.DisplayField.BooleanCheckDisplay = {
	type:'booleanCheckDisplay',
	createNew:function(fieldMeta,lui_form){
		return $.extend(LUI.Form.DisplayField.createNew(fieldMeta,lui_form),{
			id: '_form_field_'+LUI.Form.DisplayField.BooleanCheckDisplay.type+'_'+(++LUI.Form.DisplayField.uniqueId),
			type:LUI.Form.DisplayField.BooleanCheckDisplay.type,
			formatRawValue:function(dataVal){
				var _rawValue = '&nbsp;';
				if(dataVal!=null && dataVal!='null'){
					_rawValue = '<input type="checkbox" disabled '+((dataVal == true || dataVal=='true')?'checked':'')+' style="width:14px;"  class="nim-field-wrapper text ui-widget-content ui-corner-all nim-field-el ">';
				}
				return _rawValue;
			}
		});
	}
};

//整数 显示列
LUI.Form.DisplayField.IntDisplay = {
	type:'intDisplay',
	createNew:function(fieldMeta,lui_form){
		return $.extend(LUI.Form.DisplayField.createNew(fieldMeta,lui_form),{
			id: '_form_field_'+LUI.Form.DisplayField.IntDisplay.type+'_'+(++LUI.Form.DisplayField.uniqueId),
			type:LUI.Form.DisplayField.IntDisplay.type,
			formatRawValue:function(dataVal){
				var _rawValue = '&nbsp;';
				if(dataVal!=null){
					if(this.template!=null){
						var _value = {};
						_value[this.name] = dataVal;
						_rawValue = this.template(_value);
					}else{
						_rawValue = ''+dataVal;
					}
					
					//不显示零值
					if(this.zeroAsBlank=='true' && parseInt(_rawValue) == 0){
						_rawValue = '&nbsp;';
					}else{
						//如果使用千分符
						if(this.showThousand == 'true'){
							_rawValue = LUI.Util.thousandth(_rawValue);
						}
						//对齐方式
						if(this.textAlign != null){
							this.el.css('text-align',this.textAlign);
						}
					}
				}
				return _rawValue;
			}
		});
	}
};


//小数 显示列
LUI.Form.DisplayField.DoubleDisplay = {
	type:'doubleDisplay',
	createNew:function(fieldMeta,lui_form){
		return $.extend(LUI.Form.DisplayField.createNew(fieldMeta,lui_form),{
			id: '_form_field_'+LUI.Form.DisplayField.DoubleDisplay.type+'_'+(++LUI.Form.DisplayField.uniqueId),
			type:LUI.Form.DisplayField.DoubleDisplay.type,
			formatRawValue:function(dataVal){
				var _rawValue = '&nbsp;';
				if(dataVal!=null){
					if(this.template!=null){
						var _value = {};
						_value[this.name] = dataVal;
						_rawValue = this.template(_value);
					}else{
						_rawValue = ''+dataVal;
					}
					
					//不显示零值
					if(this.zeroAsBlank=='true' && parseInt(_rawValue) == 0){
						_rawValue = '&nbsp;';
					}else{
						//如果使用千分符
						if(this.showThousand == 'true'){
							_rawValue = LUI.Util.thousandth(_rawValue);
						}
						
						//是否需要补齐小数位
						if(this.decLength != null && this.decLength !='0'){
							var cDecLength = 0;
							if(_rawValue.indexOf('.') > 0){
								cDecLength = _rawValue.substr(_rawValue.indexOf('.')).length -1;
							}else{
								_rawValue +='.';
							}
							_rawValue += '000000'.substr(0,parseInt(this.decLength)-cDecLength);
						}
						//对齐方式
						if(this.textAlign != null){
							this.el.css('text-align',this.textAlign);
						}
					}
				}
				return _rawValue;
			}
		});
	}
};

//日期 显示列
LUI.Form.DisplayField.DateDisplay = {
	type:'dateDisplay',
	createNew:function(fieldMeta,lui_form){
		return $.extend(LUI.Form.DisplayField.createNew(fieldMeta,lui_form),{
			id: '_form_field_'+LUI.Form.DisplayField.DateDisplay.type+'_'+(++LUI.Form.DisplayField.uniqueId),
			type:LUI.Form.DisplayField.DateDisplay.type,
			formatRawValue:function(dataVal){
				var _rawValue = '';
				if(dataVal!=null){
					if(this.template!=null){
						var _value = {};
						_value[this.name] = dataVal.substr(0,10);
						_rawValue = this.template(_value);
					}else{
						_rawValue = ''+dataVal;
					}
				}
				return _rawValue;
			}
		});
	}
};

LUI.Form.DisplayField.DateTimeDisplay = {
	type:'dateTimeDisplay',
	createNew:function(fieldMeta,lui_form){
		return $.extend(LUI.Form.DisplayField.createNew(fieldMeta,lui_form),{
			id: '_form_field_'+LUI.Form.DisplayField.DateTimeDisplay.type+'_'+(++LUI.Form.DisplayField.uniqueId),
			type:LUI.Form.DisplayField.DateTimeDisplay.type,
			formatRawValue:function(dataVal){
				var _rawValue = '';
				if(dataVal!=null){
					if(this.template!=null){
						var _value = {};
						_value[this.name] = dataVal.substr(0,19);
						_rawValue = this.template(_value);
					}else{
						_rawValue = ''+dataVal;
					}
				}
				return _rawValue;
			}
		});
	}
};

LUI.Form.DisplayField.TimeDisplay = {
	type:'timeDisplay',
	createNew:function(fieldMeta,lui_form){
		return $.extend(LUI.Form.DisplayField.createNew(fieldMeta,lui_form),{
			id: '_form_field_'+LUI.Form.DisplayField.TimeDisplay.type+'_'+(++LUI.Form.DisplayField.uniqueId),
			type:LUI.Form.DisplayField.TimeDisplay.type,
			formatRawValue:function(dataVal){
				var _rawValue = '';
				if(dataVal!=null){
					if(this.template!=null){
						var _value = {};
						_value[this.name] = dataVal.substr(11,8);
						_rawValue = this.template(_value);
					}else{
						_rawValue = ''+dataVal;
					}
				}
				return _rawValue;
			}
		});
	}
};


//对象 显示列
LUI.Form.DisplayField.ObjectDisplay = {
	type:'objectDisplay',
	createNew:function(fieldMeta,lui_form){
		return $.extend(LUI.Form.DisplayField.createNew(fieldMeta,lui_form),{
			id: '_form_field_'+LUI.Form.DisplayField.ObjectDisplay.type+'_'+(++LUI.Form.DisplayField.uniqueId),
			type:LUI.Form.DisplayField.ObjectDisplay.type
		});
	}
};

LUI.Form.DisplayField.FileDisplay = {
	type:'fileDisplay',
	createNew:function(fieldMeta,lui_form){
		return $.extend(LUI.Form.DisplayField.createNew(fieldMeta,lui_form),{
			id: '_form_field_'+LUI.Form.DisplayField.FileDisplay.type+'_'+(++LUI.Form.DisplayField.uniqueId),
			type:LUI.Form.DisplayField.FileDisplay.type,
			formatRawValue:function(dataVal){
				var _rawValue = '&nbsp;';
				if(dataVal!=null){
					_rawValue =  '<span id="icon" class="nim-file-type-icon-16 "></span>' +
					'<a onclick="LUI.Util.downloadFile('+dataVal.fuJianDM+');" href="javascript:void(0);" class="" style="padding-left: 20px;vertical-align: middle;">'+dataVal.shangChuanWJM+'</a>';
				}
				return _rawValue;
			}
		});
	}
};

//集合 显示列
LUI.Form.DisplayField.SetDisplay = {
	type:'setDisplay',
	createNew:function(fieldMeta,lui_form){
		var field = $.extend(LUI.Form.DisplayField.createNew(fieldMeta,lui_form),{
			id: '_form_field_'+LUI.Form.DisplayField.SetDisplay.type+'_'+(++LUI.Form.DisplayField.uniqueId),
			type:LUI.Form.DisplayField.SetDisplay.type,
			getGrid:function(){
				return this.grid;
			},
			render:function(){
				//显示表格
				this.grid.render();
				this.rendered = true;
			},
			_onAdd:function (record,silence,originSource){
				var row = this.grid._addRow(record);
				row.init();
			},
			_onRemove:function (record,silence,originSource){
				this.grid._onRemove(record);
			},
//			_onChange:function (record,silence,originSource){
//				//表格行内的单元格会监听对应的record变化 更新自身的显示 不需要在这里进行处理
//			},
			setValue:function (newVal,silence,isInitial,originSource){
				var rs = this.form.record.getFieldValue(this.name);
				for(var i=0;i<rs.size();i++){
					this.grid._addRow(rs.getRecordByIndex(i));
				}
				//表格中 所有行列都加入完成后 调用init方法 为每个单元格设置值(发出change事件)
				this.grid.init();
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
		}
		return field;
	}
};

LUI.Form.DisplayField.fileSetDisplay = {
	type:'filesetDisplay',
	createNew:function(fieldMeta,lui_form){
		return $.extend(LUI.Form.DisplayField.createNew(fieldMeta,lui_form),{
			id: '_form_field_'+LUI.Form.DisplayField.fileSetDisplay.type+'_'+(++LUI.Form.DisplayField.uniqueId),
			type:LUI.Form.DisplayField.fileSetDisplay.type,
			formatRawValue:function(dataVal){
				var _rawValue = '&nbsp;';
				if(dataVal!=null){
					for(var j=0;j<dataVal.length;j++){
						//当前元素 及 附件主键值
						var newLiData = dataVal[j][this.keyProperty];
						
						if(newLiData!=null){
							_rawValue = _rawValue +  '<span id="icon" class="nim-file-type-icon-16 "></span>' +
								'<a onclick="LUI.Util.downloadFile('+newLiData.fuJianDM+');" href="javascript:void(0);" class="" style="padding-left: 20px;vertical-align: middle;">'+newLiData.shangChuanWJM+'</a>';
						}
					}
				}
				return _rawValue;
			},
			_onAdd:function (record,silence,originSource){
				alert('显示新增的附件！');
			},
			_onRemove:function (record,silence,originSource){
				alert('不显示删除的附件！');
			}
		});
	}
};


