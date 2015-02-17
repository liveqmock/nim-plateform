//alert("LUI.Form.Field");

/**
 * 校验字段输入值是否符合要求
 * 确定提示信息及错误信息如何显示
 * 值发生变化时 为关联字段设置是否可见、是否允许编辑、及关联的新值
 */
var isIE = /msie/.test(navigator.userAgent.toLowerCase()); 
LUI.Form.Field = {
	uniqueId:0,
	type:'editor',
	createNew:function(fieldMeta,lui_form){
		var fieldConfig = $.extend({},fieldMeta);
		//字段是否allowBlank
		var allowBlank = true;
		if(fieldMeta.allowBlank==false || fieldMeta.allowBlank == "false"){
			allowBlank = false;
		}
//		fieldMeta.allowBlank = allowBlank;
		
		//字段是否enable
		var enabled = true;
		if(fieldMeta.enabled!=null && (fieldMeta.enabled==false || fieldMeta.enabled == "false")){
			enabled = false;
		}
		
		var allowEdit = true;
		if(fieldMeta.allowEdit!=null && (fieldMeta.allowEdit==false || fieldMeta.allowEdit == "false")){
			allowEdit = false;
		}
		
		var zeroAsBlank = false;
		if(fieldMeta.zeroAsBlank!=null && (fieldMeta.zeroAsBlank==false || fieldMeta.zeroAsBlank == "true") ){
			zeroAsBlank = true;
		}
		//字段是否hidden hidden的字段 还是会render 只是不显示
		//同时  renderType = none的 一定是hidden的 
		var hidden = false;
		if((fieldMeta.hidden!=null &&  fieldMeta.hidden == "true" ) || this.renderType == 'none' ){
			hidden = true;
		}
		
		var _template = null;
		if(fieldMeta.renderTemplate!=null && fieldMeta.renderTemplate.length >0){
			_template = Handlebars.compile(fieldMeta.renderTemplate);//可以缓存 提高效率
		}

		
		fieldConfig.allowBlank = allowBlank;
		fieldConfig.allowEdit = allowEdit;
		fieldConfig.enabled = enabled;
		fieldConfig.hidden = hidden;
		fieldConfig.zeroAsBlank = zeroAsBlank;
		
		//字段定义中的type 与字段对象的type有冲突 因为type定义已经在选择fieldFactory时起作用了 所以可以删除
		fieldConfig.dataType = fieldConfig.type;//字段定义中的type 其实是数据类型
		delete fieldConfig.type;                
		
		var onChangeFunctionName = fieldMeta.onChange;
		var onChangeFunc = null;
		if(onChangeFunctionName!=null && onChangeFunctionName.length >0){
			onChangeFunc = window[onChangeFunctionName];
			if(onChangeFunc==null){
				LUI.Message.warn('查询失败','字段onChange事件的处理函数('+onChangeFunctionName+')不存在！');
			}
		}
		
		
		var fieldCfg = $.extend({
			name:null,
			label:null,
			id: '_form_field_'+(++LUI.Form.Field.uniqueId),
			type:LUI.Form.Field.type,
			config:fieldConfig,
			el:null,
			events:{
				change:'_field_change',
				validChange:'_field_valid_change'
			},
			form:lui_form,
			onChangeFunction:onChangeFunc,
			renderType:'append',
			zeroAsBlank:zeroAsBlank,
			template:_template,
			allowEdit:allowEdit,
			allowBlank:allowBlank,
			/**
			 * 修改字段是否允许为空属性
			 */
			setAllowBlank:function(isAllowBlank){
				this.allowBlank = isAllowBlank;
				this.validate(this.rawValue);
			},
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
				var oldVal = this.value;
				//如果值有变化
				if(!this.equalsValue(this.value,newVal)){
					var newRawValue = newVal==null?'':(''+newVal);
					//如果校验通过
					if(this.validate(newRawValue)){
						//记录字段值
						this.value = newVal;
						//校验通过后 重新格式化显示值
						newRawValue = this.formatRawValue(newVal);
					}else{
						//字段值 = null
						this.value = null;
					}
					
					//显示值有变化 
					if(!this.equalsRawValue(this.rawValue,newRawValue)){
						//保存显示值并重新显示
						this.rawValue =newRawValue;
						if(this.rendered ){
							this.displayRawValue();
						}
					}
					
					
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
			rawValue:'',//显示值
			//用户录入了新的内容 不要手工调用此方法 只允许因用户录入改变此值
			_onInputChange:function (newRawVal,preventSetValue){
				//去除显示值首尾空格
				if(newRawVal!=null){
					newRawVal = newRawVal.replace(/(^\s*)|(\s*$)/g,"");
				}else{
					newRawVal = '';
				}
				
				
				//显示值真的有变化 
				if(!this.equalsRawValue(this.rawValue,newRawVal)){
					//记录显示值
					this.rawValue = newRawVal;
					//校验
					if(this.validate(newRawVal)){
						//校验通过 转换字段值
						var _v = this.parseRawValue(newRawVal);
						if(!this.equalsValue(this.value,_v) && ( preventSetValue ==null || preventSetValue==false )){
							//校验通过 且字段值有变化 且需要设置字段值(会按需要重新格式化并显示)
							this.setValue(_v, false,false,null);
						}else{
							//重新格式化显示值 并显示
							newRawVal = this.formatRawValue(_v);
							if(!this.equalsRawValue(this.rawValue,newRawVal)){
								this.rawValue = newRawVal;
								if(this.rendered){
									 this.displayRawValue();
								}
							}
						}
					}else{ 
						//校验不通过 不改变字段值 ！！！
					}
				}
			},
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
				if(this.inputEl.val() != this.rawValue){
					//将显示值 重新显示到页面
					this.inputEl.val(this.rawValue);
				}
			},
			/**
			 * 原显示值与当前显示值是否一致
			 */
			equalsRawValue:function(rawVal1,rawVal2){
				if((rawVal1 ==null && rawVal2 ==null ) || (rawVal1!=null && rawVal1 == rawVal2)){
					return true;
				}
				return false;
			},
			equalsValue:function(val1,val2){
				if((val1==null && val2!=null) || (val1!=null && val2==null)){
					return false;
				}else if(val1==null && val2==null){
					return true;
				}else if(typeof(val1) != typeof(val2)){
					return false;
				}
				return val1 == val2;
			},
			/**
			 * 将显示值转换为数据值
			 */
			parseRawValue:function(rawVal){
				var val = null;
				if(rawVal!=null && (''+rawVal).length > 0){
					val = rawVal;
				}
				return val;
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
			isValid:true,
			validInfo:'',
			/**
			 * 根据显示值 校验值是否有效
			 * 检查数据值是否有效：非空、取值范围、长度等
			 */
			validate:function(dataValue){
				var oldValid = this.isValid;
				this.isValid = true;
				//默认只检查 是否允许为空
				if((dataValue==null || (''+dataValue).length ==0) && !this.allowBlank){
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
				if( oldValid!= this.isValid){
					this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.isValid});
				}
				return this.isValid;
			},
			markInvalid:function(){
				if(this.enabled && this.rendered ){
					this.inputEl.addClass('nim-field-invalid');
				}
			},
			clearInvalid:function(){
				if(this.rendered ){
					this.inputEl.removeClass('nim-field-invalid');
				}
			},
			enabled:enabled,
			enable:function(){
				this.enabled = true;
				if(!this.isValid){
					//enable状态下 需要显示数据是否有效
					this.markInvalid();
				}
				//将字段变为不可编辑
				this.inputEl.removeClass('nim-field-disabled');
				this.inputEl.removeAttr('disabled');
			},
			disable:function(){
				this.enabled = false;
				if(!this.isValid){
					//disable状态下 不显示数据是否有效
					this.clearInvalid();
				}
				//将字段变为不可编辑
				this.inputEl.addClass('nim-field-disabled');
				this.inputEl.attr('disabled','true');
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
			hidden:hidden,
			isHidden:function(){
				return this.hidden;
			},
			setHidden:function(isHidden){
				this.hidden = isHidden;
				if(isHidden){
					this.hide();
				}else{
					this.show();
				}
			},
			hide:function(){
				this.el.css('display','none');
			},
			show:function(){
				this.el.css('display','inline-block');
			},
			focus:function(){
				if(this.rendered){
					this.el[0].focus();
				}
			},
			rendered:false,
			_observer:LUI.Observable.createNew(),
			//创建页面元素
			render:function(){
				if(this.renderType != 'none' ){
					//根据构建类型 确定如何render
					if(this.createFieldEl(LUI.Template.Field.field)){
						this.fieldWidth = this.inputEl.width();
						this.resize(this.fieldWidth);
						//将自定义onchange方法 绑定到当前对象
						if(this.onChangeFunction!=null){
							this.addListener(this.events.change,this._observer,this.onChangeFunction);
						}
						//将input元素的change事件 绑定到当前对象(一个inputEl 同时只能绑定到一个field)
						var contextThis = this;
						this.inputEl.bind('change',function(){
							contextThis._onInputChange($(this).val(), false);
						});
						this.rendered = true;
						//原值要重新显示出来
						this.displayRawValue();
					}
				}
				this.validate(this.rawValue);
			},
			resize:function(fieldWidth){
				//将录入元素的外层大小 限制为定义的宽度
				this.inputEl.outerWidth(fieldWidth);
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
					
					//与页面元素取消关联
					this.inputEl.unbind();
					this.removeListener(this.events.change,this._observer);
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
				//是否启用尺寸的设计模式
				if(isEnable){
					var _this = this;
					this.inputEl.inputResizable({
						helper: "ui-resizable-helper",
						cancel: ".cancel",
						stop: function( event, ui ) {
							if(_this.designNode!=null){
								//设置字段的width height参数
								_this.designNode.record.setFieldValue('width',ui.size.width+"px");
								if(_this.designNode.record.hasField('height')){
									_this.designNode.record.setFieldValue('height',ui.size.height+"px");
								}
							}
						}
					});
				}else{
					var as = this.inputEl.inputResizable( "instance" );
					if(as!=null){
						this.inputEl.inputResizable( "destroy" );
					}
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
							//选中设计器中 对应的节点
							treeObj.selectNode(_this.designNode,false);
							LUI.PageDesigner.instance.onComponentNodeSelected(_this.designNode);
						}
					});
				}
			}
		},fieldConfig);
		
		return $.extend(LUI.Observable.createNew(),fieldCfg);
	}
};



LUI.Form.Field.BooleanRadioEditor = {
	uniqueId:0,
	type:'booleanRadioEditor',
	createNew:function(fieldMeta,lui_form){
		
		var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
			id: '_form_field_booleanradio_'+(++LUI.Form.Field.BooleanRadioEditor.uniqueId),
			type:LUI.Form.Field.BooleanRadioEditor.type,
			options:[],
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
								
								if(_this.designNode.record.hasField('height')){
									_this.designNode.record.setFieldValue('height',ui.size.height+"px");
								}
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
			},
			render:function(){
				if(this.renderType != 'none'){
					//从数据源中取得选项
					if(this.createFieldEl(LUI.Template.Field.objectRadio)){
						//显示所有选项
						
						//取得第一个li元素 作为迭代选项的依据
						var itemEl = this.el.children('li:eq(0)');
						
						//删除所有子元素
						this.el.children('li').remove();
						
						this.radios = [];
						
						var contextThis = this;
						//根据option 创建多个checkbox
						var trueText = "是";
						if(this.trueText!=null){
							trueText = this.trueText;
						}
						var falseText = "否";
						if(this.falseText!=null){
							falseText = this.falseText;
						}
						
						var isTrueChecked = false;
						var isFalseChecked = false;
						if(this.value!=null && (this.value == true || this.value=="true")){
							isTrueChecked = true;
						}else if(this.value!=null && (this.value == false || this.value=="false")){
							isFalseChecked = true;
						}
						
						var trueLiEl = itemEl.clone().prependTo(this.el);
						var trueInputEl = trueLiEl.find(':radio').first();
						trueInputEl.attr('id',this.id+'_option_radio_true')
							.prop("name", this.id)
							.prop("checked", isTrueChecked)
							.attr("keyValue", true)
							.bind('change',function(){
								//radio 只有被选中的时候 才会触发 change
								contextThis.setValue(true);
							});
						trueLiEl.find('label').first()
							.attr('id',this.id+'_option_label_true')
							.attr('for',this.id+'_option_radio_true')
							.html(trueText);
									  
						var falseLiEl = itemEl.clone().prependTo(this.el);
						var falseInputEl = falseLiEl.find(':radio').first();
						falseInputEl.attr('id',this.id+'_option_radio_false')
							.prop("name", this.id)
							.prop("checked", isFalseChecked)
							.attr("keyValue", false)
							.bind('change',function(){
								//radio 只有被选中的时候 才会触发 change
								contextThis.setValue(false);
							});
						falseLiEl.find('label').first()
							.attr('id',this.id+'_option_label_false')
							.attr('for',this.id+'_option_radio_false')
							.html(falseText);
									  
						this.radios[this.radios.length] = trueInputEl;
						this.radios[this.radios.length] = falseInputEl;
					
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
			/**
			 * 将显示值转换为数据值
			 */
			parseRawValue:function(rawVal){
				LUI.Message.warn('错误','radio类型的字段不需要转换数据值！');				
				return null;
			},
			/**
			 * 将数据值格式化为显示值 (对每个可选对象 处理为checkbox的label)
			 */
			formatRawValue:function(dataVal){
				LUI.Message.warn('错误','radio类型的字段不需要转换显示值！');				
				return null;
			},
			displayRawValue:function (){
				//主键值与当前value一致的 设为选中（其他的被自动取消选中）
				if(this.value ==null){
					this.radios[0].prop("checked", false);
					this.radios[1].prop("checked", false);
				}else if(this.value == true || this.value == 'true'){
					this.radios[0].prop("checked", true);
					this.radios[1].prop("checked", false);
				}else {
					this.radios[0].prop("checked", false);
					this.radios[1].prop("checked", true);
				}
			},
			setValue:function (newVal,silence,isInitial,originSource){
				var oldVal = this.value;
				//如果值有变化
				if(!this.equalsValue(this.value,newVal)){
					this.value = newVal;
					this.validate(this.value)
					//重新显示
					if(this.rendered ){
						this.displayRawValue();
					}
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
				}else if(typeof(val1) != typeof(val2)){
					return false;
				}
				return val1 == val2;
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
				this.el.find(':radio').removeAttr('disabled');
			},
			disable:function(){
				this.enabled = false;
				if(!this.isValid){
					//disable状态下 不显示数据是否有效
					this.clearInvalid();
				}
				this.el.addClass('nim-field-disabled');
				this.el.find(':radio').attr('disabled','true');
			}
		});
		return field;
	}
}

LUI.Form.Field.BooleanCheckEditor = {
		uniqueId:0,
		type:'booleanCheckEditor',
		createNew:function(fieldMeta,lui_form){
			
			var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
					id: '_form_field_booleancheck_'+(++LUI.Form.Field.BooleanCheckEditor.uniqueId),
					type:LUI.Form.Field.BooleanCheckEditor.type,
					setValue:function (newValue,silence,isInitial,originSource){
						var oldVal = this.value;
						var newVal = null;
						if(newValue == null){
							newVal = false;
						}else if(typeof(newValue) == 'boolean'){
							newVal = newValue;
						}else if(typeof(newValue) == 'string'){
							newVal = (newValue != 'false');
						}else if(typeof(newValue) == 'number'){
							newVal = (newValue != 0);
						}else{
							LUI.Message.warn('设置值失败','未定义处理方式的值:'+newValue+'！');
						}
						//如果值有变化
						if(!this.equalsValue(this.value,newVal)){
							if(this.validate(''+newVal)){
								//校验通过
								this.value = newVal;
								this.rawValue = ''+this.value;
							}else{
								this.value = null;
								this.rawValue = '';
							}

							//重新显示
							if(this.rendered){
								//重新显示
								this.displayRawValue();
							}
							
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
					render:function(){
						if(this.renderType != 'none'){
							//根据构建类型 确定如何render
							if(this.createFieldEl(LUI.Template.Field.checkbox)){
								//将自定义onchange方法 绑定到当前对象的change事件
								if(this.onChangeFunction!=null){
									this.addListener(this.events.change,this._observer,this.onChangeFunction);
								}
								//在ie浏览器中 checkbox需要失去焦点才能触发change事件
								if (isIE) {
									this.inputEl.click(function () {
										this.blur();
										this.focus();
									});
								}; 
								//将input元素的change事件 绑定到当前对象
								var contextThis = this;
								this.inputEl.bind('change',function(){
									contextThis.setValue($(this).prop("checked"),false,false,null);
								});
								
								this.rendered = true;
								//原值要重新显示出来
								this.displayRawValue();
							}
						}
						this.validate(this.rawValue);
					},
					markInvalid:function(){
						;
					},
					clearInvalid:function(){
						;
					},
					enable:function(){
						this.enabled = true;
					},
					disable:function(){
						this.enabled = false;
					},
					/**
					 * 将显示值转换为数据值
					 */
					parseRawValue:function(rawVal){
						return rawVal!=null && (rawVal == true || rawVal =="true");
					},
					/**
					 * 将数据值格式化为显示值
					 */
					formatRawValue:function(dataVal){
						var vs = "false";
						if(dataVal!=null && (dataVal == true || dataVal =="true")){
							vs =="true";
						}
						return vs;
					},
					displayRawValue:function (){
						//原值要重新显示出来
						if(this.value!=null && (this.value==true || this.value== 'true')){
							this.inputEl.prop("checked", true);
						}else{
							this.inputEl.prop("checked", false);
						}
					}
			});
			return field;
		}
	};

/**
 * 字符单行编辑控件 最基础的控件类型 
 */
LUI.Form.Field.String = {
	uniqueId:0,
	type:'stringEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_text_'+(++LUI.Form.Field.String.uniqueId),
			type:LUI.Form.Field.String.type,
			validate:function(dataValue){
				var oldValid = this.isValid;
				//字符型字段 除了校验是否为空外还需要检查长度是否符合要求
				this.isValid = true;
				//检查值是否 有效
				var stringValue = dataValue==null?'':dataValue;
				if(stringValue.length ==0){
					if(!this.allowBlank){
						this.isValid = false;
						this.validInfo = '不允许为空!';
					}
				}else{
					if(this.minLength!=null){
						var minLength = parseInt(this.minLength);
						if(minLength > 0 && stringValue.length < minLength){
							//检查是否符合最少字符要求
							this.isValid = false;
							this.validInfo = '请至少输入'+minLength+'个字符!';
						}
					}
					
					if(this.maxLength!=null){
						var maxLength = parseInt(this.maxLength);
						if(maxLength > 0 && stringValue.length > maxLength){
							//检查是否符合最大字符要求
							this.isValid = false;
							this.validInfo = '不允许超过'+maxLength+'个字符!';
						}
					}
					
				}
				
				if(!this.isValid){
					this.markInvalid();
				}else{
					this.clearInvalid();
				}
				
				if( oldValid!= this.isValid){
					this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.isValid});
				}
				return this.isValid;
			}
		});
	}
};



/**
 * 密码控件
 */
LUI.Form.Field.Password = {
	uniqueId:0,
	type:'passwordEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_password_'+(++LUI.Form.Field.Password.uniqueId),
			type:LUI.Form.Field.Password.type,
			render:function(){
				if(this.renderType != 'none' ){
					//根据构建类型 确定如何render
					if(this.createFieldEl(LUI.Template.Field.password)){
						this.fieldWidth = this.inputEl.width();
						this.resize(this.fieldWidth);
						//将自定义onchange方法 绑定到当前对象
						if(this.onChangeFunction!=null){
							this.addListener(this.events.change,this._observer,this.onChangeFunction);
						}
						//将input元素的change事件 绑定到当前对象(一个inputEl 同时只能绑定到一个field)
						var contextThis = this;
						this.inputEl.bind('change',function(){
							contextThis._onInputChange($(this).val(), false);
						});
						this.rendered = true;
						//原值要重新显示出来
						this.displayRawValue();
					}
				}
				this.validate(this.rawValue);
			},
			validate:function(dataValue){
				var oldValid = this.isValid;
				//密码型字段 除了校验是否为空外还需要检查长度是否符合要求（以后可以加上 强制字母 大小写等密码强度要求）
				this.isValid = true;
				//检查存储值是否 有效
				var stringValue = dataValue==null?'':dataValue;
				if(stringValue.length ==0){
					if(!this.allowBlank){
						this.isValid = false;
						this.validInfo = '不允许为空!';
					}
				}else{
					
					if(this.minLength!=null){
						var minLength = parseInt(this.minLength);
						if(minLength > 0 && stringValue.length < minLength){
							//检查是否符合最少字符要求
							this.isValid = false;
							this.validInfo = '密码长度至少为'+minLength+'位字符!';
						}
					}
					
					if(this.maxLength!=null){
						var maxLength = parseInt(this.maxLength);
						if(maxLength > 0 && stringValue.length > maxLength){
							//检查是否符合最大字符要求
							this.isValid = false;
							this.validInfo = '密码长度最多为'+maxLength+'个字符!';
						}
					}
				}
				
				if(!this.isValid){
					this.markInvalid();
				}else{
					this.clearInvalid();
				}
				
				if( oldValid!= this.isValid){
					this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.isValid});
				}
				return this.isValid;
			}
		});
	}
};


LUI.Form.Field.MobileNumber = {
	uniqueId:0,
	type:'mobileEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_mobile_'+(++LUI.Form.Field.MobileNumber.uniqueId),
			type:LUI.Form.Field.MobileNumber.type,
			validate:function(dataValue){
				var oldValid = this.isValid;
				//手机号字段 除了校验是否为空外还需要检查号码是否符合要求
				this.isValid = true;
				//检查值是否 有效
				var stringValue = dataValue==null?'':dataValue;
				if(stringValue.length ==0){
					if(!this.allowBlank){
						this.isValid = false;
						this.validInfo = '不允许为空!';
					}
				}else{
					var r   =   /^(13[0-9]|15[0-9]|18[0-9])\d{8}$/ ;//手机号      
					this.isValid = r.test(stringValue);
					if(!this.isValid){
						this.validInfo = '请输入有效的手机号!';
					}
				}
				
				if(!this.isValid){
					this.markInvalid();
				}else{
					this.clearInvalid();
				}
				
				//var oldValid = this.isValid;
				if( oldValid!= this.isValid){
					this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.isValid});
				}
				return this.isValid;
			}
		});
	}
};

LUI.Form.Field.PostCode = {
	uniqueId:0,
	type:'postCodeEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_postcode_'+(++LUI.Form.Field.PostCode.uniqueId),
			type:LUI.Form.Field.PostCode.type,
			validate:function(dataValue){
				var oldValid = this.isValid;
				//手机号字段 除了校验是否为空外还需要检查号码是否符合要求
				this.isValid = true;

				//检查值是否 有效
				var stringValue = dataValue==null?'':dataValue;
				if(stringValue.length ==0){
					if(!this.allowBlank){
						this.isValid = false;
						this.validInfo = '不允许为空!';
					}
				}else{
					var r   =   /^[0-9]\d{5}$/ ;//邮编
					this.isValid = r.test(stringValue);
					if(!this.isValid){
						this.validInfo = '请输入有效的邮编 (6位数字)!';
					}
				}
				
				if(!this.isValid){
					this.markInvalid();
				}else{
					this.clearInvalid();
				}
				
				//var oldValid = this.isValid;
				if( oldValid!= this.isValid){
					this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.isValid});
				}
				return this.isValid;
			}
		});
	}
};


LUI.Form.Field.Email = {
		uniqueId:0,
		type:'emailEditor',
		createNew:function(fieldMeta,lui_form,createNotExistsEl){
			return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
				id: '_form_field_email_'+(++LUI.Form.Field.Email.uniqueId),
				type:LUI.Form.Field.Email.type,
				validate:function(dataValue){
					
					var oldValid = this.isValid;
					
					this.isValid = true;
					//检查值是否 有效
					var stringValue = dataValue==null?'':dataValue;
					if(stringValue.length ==0){
						if(!this.allowBlank){
							this.isValid = false;
							this.validInfo = '不允许为空!';
						}
					}else{
						var r = /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/;//邮箱
						this.isValid = r.test(stringValue);
						if(!this.isValid){
							this.validInfo = '请输入有效的邮箱!';
						}
					}
					
					if(!this.isValid){
						this.markInvalid();
					}else{
						this.clearInvalid();
					}
					
					//var oldValid = this.isValid;
					if( oldValid!= this.isValid){
						this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.isValid});
					}
					return this.isValid;
				}
			});
		}
	};

/**
 * 字符单行编辑+选择控件 可选择也可自主输入 
 */
LUI.Form.Field.StringPlusSelect = {
	uniqueId:0,
	type:'stringPlusEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_text_'+(++LUI.Form.Field.String.uniqueId),
			type:LUI.Form.Field.String.type
		});
	}
};

//w
LUI.Form.Field.StringText = {
		uniqueId:0,
		type:'stringTextEditor',
		createNew:function(fieldMeta,lui_form){
			var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
				id: '_form_field_stringtext_'+(++LUI.Form.Field.StringText.uniqueId),
				type:LUI.Form.Field.StringText.type,
				render:function(){
					
					if(this.renderType != 'none'){
						if(this.createFieldEl(LUI.Template.Field.textarea)){
							this.fieldWidth = this.inputEl.width();
							this.resize(this.fieldWidth);
							//允许点击 打开编辑窗口
							this.el.find('img#_handler').first()
								.data("field",this)
								.click(function(){
									var cField = $(this).data('field');
									var divEl = $(
										'<div title="'+cField.label+'('+cField.name+')'+'">'+
											'<textarea cols=40 rows=10 id="'+cField.name+'_textarea" name="'+cField.name+'_textarea" style="height: 100%;width: 100%;overflow:auto">'+
											'</textarea>'+
										'</div>');
									
									divEl.find('textarea#'+cField.name+'_textarea').val(cField.getValue()==null?"":cField.getValue().replace(/\\n/g,"\n"));
									divEl.dialog({
											 modal: true,
											 width: 413,
											 height: 263,
											 close:function(){
												 $(this).dialog( "destroy" );
												 $(this).remove();
											 },
											 open:function(){
												$(".ui-dialog-titlebar-close", $(this).parent()).hide();
											 },
											 autoOpen: true,
											 show: { effect: "scale", percent:100,duration: 400},
											 hide: { effect: "scale", percent: 0 ,duration: 400},
											 buttons: [{ 
												 text: "确定",
												 click:function() {
													var textareaValue = $(this).find('textarea#'+cField.name+'_textarea').val();
//													textareaValue = textareaValue.replace(/\n/g,"\\n");
													cField.setValue(textareaValue,false,false,null);
													$( this ).dialog( "close" );
												 }
											},{ 
												 text: "取消",
												 click:function() {
													$( this ).dialog( "close" );
												 }
											}]
									});
								});
							
							//将input元素的change事件 绑定到当前对象
							var contextThis = this;
							this.inputEl.bind('change',function(){
								var _v = $(this).val();
//								_v = _v.replace(/\n/g,"\\n");
								contextThis.setValue(_v,false,false,null);
							});
							//将自定义onchange方法 绑定到当前对象的change事件
							if(this.onChangeFunction!=null){
								this.addListener(this.events.change,this._observer,this.onChangeFunction);
							}
							this.rendered = true;
							//原值要重新显示出来
							this.displayRawValue();
						}
					}
					this.validate(this.rawValue);
				},
				resize:function(fieldWidth){
					//将录入元素的外层大小 限制为定义的宽度 -20
					this.inputEl.outerWidth(fieldWidth -20);
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
									//
									var heightFix = (_this.inputEl.outerHeight(true) - _this.inputEl.height()) +2;
									_this.inputEl.css("width",(ui.size.width - 30)+"px");
									_this.inputEl.css("height",(ui.size.height - heightFix)+"px");
									//设置字段的width height参数
									_this.designNode.record.setFieldValue('width',ui.size.width+"px");
									_this.designNode.record.setFieldValue('height',(ui.size.height - heightFix)+"px");
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
				},
				enable:function(){
					//按钮不可点击
					this.enabled = true;
					//
					if(!this.isValid){
						this.markInvalid();
					}
					this.inputEl.removeAttr('disabled');
				},
				disable:function(){
					//按钮可点击
					this.enabled = false;
					//
					if(!this.isValid){
						//disable状态下 不显示数据是否有效
						this.clearInvalid();
					}
					this.inputEl.attr('disabled','true');
				},
				displayRawValue:function (){
					if(this.inputEl.val() != this.rawValue){
						//将显示值 重新显示到页面
						this.inputEl.val(this.rawValue);
					}
				},
				validate:function(dataValue){
					var oldValid = this.isValid;
					//字符型字段 除了校验是否为空外还需要检查长度是否符合要求
					this.isValid = true;
					//检查值是否 有效
					var stringValue = dataValue==null?'':dataValue;
					if(stringValue.length ==0){
						if(!this.allowBlank){
							this.isValid = false;
							this.validInfo = '不允许为空!';
						}
					}else{
						if(this.minLength!=null){
							var minLength = parseInt(this.minLength);
							if(minLength > 0 && stringValue.length < minLength){
								//检查是否符合最少字符要求
								this.isValid = false;
								this.validInfo = '请至少输入'+minLength+'个字符!';
							}
						}
						
						if(this.maxLength!=null){
							var maxLength = parseInt(this.maxLength);
							if(maxLength > 0 && stringValue.length > maxLength){
								//检查是否符合最大字符要求
								this.isValid = false;
								this.validInfo = '不允许超过'+maxLength+'个字符!';
							}
						}
						
					}
					
					if(!this.isValid){
						this.markInvalid();
					}else{
						this.clearInvalid();
					}
					
					//var oldValid = this.isValid;
					if( oldValid!= this.isValid){
						this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.isValid});
					}
					return this.isValid;
				}
			});
		
			return field;
		}

	};

LUI.Form.Field.Textarea = {
	uniqueId:0,
	type:'textareaEditor',
	createNew:function(fieldMeta,lui_form){
		var field = $.extend(LUI.Form.Field.StringText.createNew(fieldMeta,lui_form),{
			id: '_form_field_textarea_'+(++LUI.Form.Field.Textarea.uniqueId),
			type:LUI.Form.Field.Textarea.type
		});
		return field;
	}

};
/**
 * 字符选择控件 预定义范围内选择值 代替用户输入
 */
LUI.Form.Field.StringSelect = {
	uniqueId:0,
	type:'textSelectEditor',
	createNew:function(fieldMeta,lui_form){
		var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
			id: '_form_field_string_select_'+(++LUI.Form.Field.StringSelect.uniqueId),
			type:LUI.Form.Field.StringSelect.type,
			options:fieldMeta.options,
			dataGetter:fieldMeta.dataGetter,
			render:function(){
				if(this.renderType != 'none'){
					if(this.createFieldEl(LUI.Template.Field.select)){
//						this.fieldWidth = this.inputEl.css("width");
//						this.resize(this.fieldWidth);
						//
						var allowSearch = true;
						if(this.allowSearch != null &&  this.allowSearch != "true"){
							allowSearch = false;
						}
						
//						this.inputEl.val(this.value);
						//创建chosen
						this.inputEl.chosen({
							allow_single_deselect:this.allowBlank,
							disable_search_threshold:5,
							disable_search:!allowSearch,
							width:this.inputEl.css("width")
						});
						//添加选项
						this.initOptions(this.options);

						//将自定义onchange方法 绑定到当前对象的change事件
						if(this.onChangeFunction!=null){
							this.addListener(this.events.change,this._observer,this.onChangeFunction);
						}
						//将input元素的change事件 绑定到当前对象
						var contextThis = this;
						this.inputEl.bind('change',function(){
							contextThis.setValue($(this).val());
						});
						this.rendered = true;
						//原值要重新显示出来
						this.displayRawValue();
					}
				}
				this.validate(this.rawValue);
			},
			/**
			 * 将显示值转换为数据值
			 */
			parseRawValue:function(rawVal){
				return (rawVal==null || rawVal=='')?null:rawVal;
			},
			/**
			 * 将数据值格式化为显示值
			 */
			formatRawValue:function(dataVal){
				return dataVal==null?'':dataVal;
			},
			displayRawValue:function(){
				if(this.inputEl.val() != this.value){
					this.inputEl.val(this.value);
					this.inputEl.trigger("chosen:updated");
				}
			},
			initOptions:function(){
				//删除原有选项
				this.inputEl.find('option').remove();
				if(this.allowBlank){
					this.inputEl.append('<option value=""></option>');
				}
				
				var options = [];
				if(this.options !=null && this.options.length >0){
					options = eval(this.options); 
				}else if (this.dataGetter!=null && this.dataGetter.length>0){
					var dataGetterFunc = window[this.dataGetter];
					if(dataGetterFunc==null){
						LUI.Message.warn('查询失败','字段的dataGetter函数('+this.dataGetter+')不存在！');
					}else{
						options = dataGetterFunc.apply(this); 
					}
					
				}
				
				var valueExists = false;
				for(var i=0;i<options.length;i++){
					if(this.value == options[i].value){
						valueExists = true;
					}
					this.inputEl.append('<option  value="'+options[i].value+'"'+(this.value == options[i].value ?'selected':'')+'>'+options[i].text+'</option>');
				}
				if(this.value!=null && !valueExists){
					this.setValue(null);
				}else if(this.value ==null && this.allowBlank== false && options.length >0){
					this.setValue(options[0].value);
				}
				this.inputEl.trigger("chosen:updated");
			}
		});
		return field;
	}
};

/**
 * 字符选择控件 提供参考值 辅助用户输入ui-icon-triangle-1-e
 */
//LUI.Form.Field.StringPlusSelect = {};



LUI.Form.Field.TextRadio = {
	uniqueId:0,
	type:'textRadioEditor',
	createNew:function(fieldMeta,lui_form){
		
		var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
			id: '_form_field_textradio_'+(++LUI.Form.Field.TextRadio.uniqueId),
			type:LUI.Form.Field.TextRadio.type
		});
		
		return field;
	}
};

LUI.Form.Field.StringChooseEl = {
		uniqueId:0,
		type:'textChooseElEditor',
		createNew:function(fieldMeta,lui_form){
			var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
				id: '_form_field_textchooseel_'+(++LUI.Form.Field.StringChooseEl.uniqueId),
				type:LUI.Form.Field.StringChooseEl.type,
				render:function(){
					if(this.renderType != 'none'){
						if(this.createFieldEl(LUI.Template.Field.chooseEl)){
							this.fieldWidth = this.inputEl.width();
							this.resize(this.fieldWidth);
							//允许drag
							var _this = this;
							this.el.find( 'img#_handler').first()
								.data("droppableSelector",this.droppable)
								.data("field",this)
								.draggable({
									appendTo: "body",
									revert: true, 
									helper: "clone" ,
									scroll: true,
									zIndex:1999,
									start:function( event, ui ){
										_this.firstChoosedEl = null;
										_this.lastChoosedEl = null;
										var parentRenerto = "#_pageContent ";
										//显示原始页面
										if(_isOriginalChoose){
											parentRenerto = "#_original ";
											$("#_original")
												.css("height","100%")
												.css("width",$("#_pageContent").width()+"px")
												.css("top","0")
												.css("z-index","99")
												.append(_orginalContent)
												.scrollTop($("#_pageContent").scrollTop());
											$("#_pageContent").css("overflow","hidden").css("opacity","0");
										}
										
										//input失去焦点
										var field = $(this).data("field");
										field.inputEl.blur();
										
										//取到次顶级节点 检查上层节点的renderto属性
										
										var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
										var selectedNode = selectedNodes[0];
			
										var loopNode = selectedNode;
										var loopRenerto = '';
										while(loopNode.getParentNode()!=null &&　loopNode.getParentNode().component!=null &&　loopNode.getParentNode().component.type !='page'){
											loopNode = loopNode.getParentNode();
											if(LUI.PageDesigner.instance.hasProperty(loopNode,'renderto')){
												if(loopNode.data.renderto!=null){
													loopRenerto = loopNode.data.renderto+' ' + loopRenerto;
												}else{
													event.preventDefault();
													alert("上级节点尚未设置renderto属性");
													return;
												}
											}
										}
										
										//根据节点类型 设置dropable的元素
//										var tSelector = $(this).data("droppableSelector");
										var droppableSelector = parentRenerto + loopRenerto +"[id]";
										$(this).data("droppableSelectorWithPath",droppableSelector);
										var droppableEls = $(droppableSelector);
										
										droppableEls.droppable({
											 activeClass: "ui-state-hover",
											 hoverClass: "ui-state-active",
											 drop: function( event, ui ) {
											 	if(_this.firstChoosedEl==null){
											 		_this.firstChoosedEl = event.target;//记录第一个（是最外层的元素）
											 	}
											 	_this.lastChoosedEl = event.target;//记录最后一个（是最内部的元素）
//												 var asd = event.target;
//												 if(this.id){
//													 field.setValue("#"+this.id,false,false,null);
//												 }else{
//												 	//因为html重叠的原因 没有定位到正确的元素
//													 LUI.Message.info("信息","目标元素未定义id!");
//												 }
//												 return false;
											 }
										});
									},
									stop:function( event, ui ){
										var field = $(this).data("field");
										var droppableSelector = $(this).data("droppableSelectorWithPath");
										var droppableEls = $(droppableSelector);
										droppableEls.droppable( "destroy" );
										//弹出窗口 选择元素
										if(_this.lastChoosedEl!=null){
											var idChilrenCount = $(_this.lastChoosedEl).find('[id]').length;
											if(_this.lastChoosedEl==_this.firstChoosedEl && idChilrenCount==0){
												//如果只选择了一个元素 而且内部没有有id的子元素 无需选择
												field.setValue("#"+_this.lastChoosedEl.id,false,false,null);
												field.inputEl[0].focus();
												if(_isOriginalChoose){
													$("#_pageContent").css("overflow","auto").css("opacity","1");
													$("#_original").css("height","0").css("width","0").css("z-index","-1").empty();
												}
											}else{
												//以选中元素为基础 向上创建树
												LUI.Widget.elWin.select(_this.firstChoosedEl,_this.lastChoosedEl,function(nodeDatas){
													if(nodeDatas!=null && nodeDatas.length >0){
														var choosedElId = nodeDatas[0].el[0].id;
														if(choosedElId != null && choosedElId.length >0){
															field.setValue("#"+choosedElId,false,false,null);
															field.inputEl[0].focus();
														}else{
															LUI.Message.info("提示","必须选择id不为空的目标元素!");
														}
													}
													//隐藏原始页面
													if(_isOriginalChoose){
														$("#_pageContent").css("overflow","auto").css("opacity","1");
														$("#_original").css("height","0").css("width","0").css("z-index","-1").empty();
													}
												});
											}
											
										}else{
											if(_isOriginalChoose){
												$("#_pageContent").css("overflow","auto").css("opacity","1");
												$("#_original").css("height","0").css("width","0").css("z-index","-1").empty();
											}
										}
									}
								});
							
							//将input元素的change事件 绑定到当前对象
							var contextThis = this;
							this.inputEl.bind('change',function(){
								contextThis.setValue($(this).val(),false,false,null);
							});
							//将自定义onchange方法 绑定到当前对象的change事件
							if(this.onChangeFunction!=null){
								this.addListener(this.events.change,this._observer,this.onChangeFunction);
							}
							this.rendered = true;
							//原值要重新显示出来
							this.displayRawValue();
						}
					}
					
					this.validate(this.rawValue);
				},
				resize:function(fieldWidth){
					this.inputEl.outerWidth(fieldWidth  -20);
				},
				enable:function(){
					//按钮不可点击 拖拽
					this.enabled = true;
					//
					if(!this.isValid){
						this.markInvalid();
					}
					this.inputEl.removeAttr('disabled');
				},
				disable:function(){
					//按钮可点击 拖拽
					this.enabled = false;
					//
					if(!this.isValid){
						//disable状态下 不显示数据是否有效
						this.clearInvalid();
					}
					this.inputEl.attr('disabled','true');
				},
//				markInvalid:function(){
//					if(this.enabled && this.rendered ){
//						this.inputEl.addClass('nim-field-invalid');
//					}
//				},
//				clearInvalid:function(){
//					if(this.rendered ){
//						this.inputEl.removeClass('nim-field-invalid');
//					}
//				},
				displayRawValue:function (){
					if(this.inputEl.val() != this.rawValue){
						//将显示值 重新显示到页面
						this.inputEl.val(this.rawValue);
					}
				}
			});
			return field;
		}
	};
	
LUI.Form.Field.URLField = {
		uniqueId:0,
		type:'urlEditor',
		createNew:function(fieldMeta,lui_form){
			var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
				id: '_form_field_url_'+(++LUI.Form.Field.URLField.uniqueId),
				type:LUI.Form.Field.URLField.type,
				render:function(){
					if(this.renderType != 'none'){
						if(this.createFieldEl(LUI.Template.Field.urlEditor)){
							this.fieldWidth = this.inputEl.width();
							this.resize(this.fieldWidth);
							//允许drag
							var _this = this;
							this.el.find( 'img#_handler').first()
								.click(function(){
									//打开新页面
									//当前选中的节点
									var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
									var selectedNode = selectedNodes[0];
									
									//当前选中节点关联的数据源名称
									var _relaImportName = selectedNode.data.name;
									var _importInstance = LUI.ImportPage.getInstance(_relaImportName);
									if(_importInstance!=null){
										window.open('http://'+_urlInfo.host+':'+_urlInfo.port+'/nim.html?_pt_='+_this.inputEl.val()+'&_ps_='+unescape(LUI.Util.stringify(_importInstance.lastParams)));
									}else{
										window.open('http://'+_urlInfo.host+':'+_urlInfo.port+'/nim.html?_pt_='+_this.inputEl.val());
									}
								});
							
							//将input元素的change事件 绑定到当前对象
							var contextThis = this;
							this.inputEl.bind('change',function(){
								contextThis.setValue($(this).val(),false,false,null);
							});
							//将自定义onchange方法 绑定到当前对象的change事件
							if(this.onChangeFunction!=null){
								this.addListener(this.events.change,this._observer,this.onChangeFunction);
							}
							this.rendered = true;
							//原值要重新显示出来
							this.displayRawValue();
						}
					}
					
					this.validate(this.rawValue);
				},
				resize:function(fieldWidth){
					this.inputEl.outerWidth(fieldWidth  -20);
				},
				enable:function(){
					//按钮不可点击 拖拽
					this.enabled = true;
					//
					if(!this.isValid){
						this.markInvalid();
					}
					this.inputEl.removeAttr('disabled');
				},
				disable:function(){
					//按钮可点击 拖拽
					this.enabled = false;
					//
					if(!this.isValid){
						//disable状态下 不显示数据是否有效
						this.clearInvalid();
					}
					this.inputEl.attr('disabled','true');
				},
//				markInvalid:function(){
//					if(this.enabled && this.rendered ){
//						this.inputEl.addClass('nim-field-invalid');
//					}
//				},
//				clearInvalid:function(){
//					if(this.rendered ){
//						this.inputEl.removeClass('nim-field-invalid');
//					}
//				},
				displayRawValue:function (){
					if(this.inputEl.val() != this.rawValue){
						//将显示值 重新显示到页面
						this.inputEl.val(this.rawValue);
					}
				}
			});
			return field;
		}
	};

LUI.Form.Field.StringHTML = {
	uniqueId:0,
	type:'stringHTMLEditor',
	createNew:function(fieldMeta,lui_form){
		var field = $.extend(LUI.Form.Field.StringText.createNew(fieldMeta,lui_form),{
			id: '_form_field_stringHtml_'+(++LUI.Form.Field.StringHTML.uniqueId),
			type:LUI.Form.Field.StringHTML.type,
			richEditor:null,
			richEditorSetting:false,
			setValue:function (newVal,silence,isInitial,originSource){
				var oldVal = this.value;
				
				//html类型 不去除显示值首尾空格
//				if(newVal!=null){
//					newVal = newVal.replace(/(^\s*)|(\s*$)/g,"");
//				}else{
//					newVal = '';
//				}
				
				//如果值有变化
				if(!this.equalsValue(this.value,newVal)){
					
					if(this.validate(newVal)){
						//校验通过
						this.value = newVal;
					}else{
						this.value = null;
					}
					//即使校验不通过 错误的显示值也要显示
					this.rawValue = newVal;
					//field renderer的时候 也会触发change事件 导致此field被setValue
					if(this.richEditor!=null && this.richEditorSetting == false){
						this.richEditor.html(this.rawValue);
					}
					
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
			_onInputChange:function (newRawVal,preventSetValue){
				//html类型 不去除显示值首尾空格
//				if(newVal!=null){
//					newVal = newVal.replace(/(^\s*)|(\s*$)/g,"");
//				}else{
//					newVal = '';
//				}
				//显示值真的有变化 保存并重新显示
				if(!this.equalsRawValue(this.rawValue,newRawVal)){
					this.rawValue =newRawVal;
					if(preventSetValue ==null || preventSetValue==false){
						this.setValue(newRawVal, false,false,null);
					}
				}
			},
			render:function(){
				
				var fieldSameNameElCount = $('#'+this.form.name+'_'+this.name).length;
				if(this.renderType == 'replace' && fieldSameNameElCount >0){
					LUI.Message.warn('警告','页面中存在其它id = '+this.form.name+'_'+this.name+'的元素('+fieldSameNameElCount+')，<br/>为表单('
						+this.form.name+' '+this.form.renderto+')中字段('+this.name+' '+this.renderto+')生成HTML编辑器失败，<br/>请将生成方式改为:‘关联输入域’重试！');
					return;
				}
				
				
				if(this.renderType != 'none'){
					if(this.createFieldEl(LUI.Template.Field.htmlArea)){
						this.fieldWidth = this.inputEl.width();
						this.fieldHeight = this.inputEl.height();
						
						this.resize(this.fieldWidth,this.fieldHeight);
							
						
						var _this = this;
						this.richEditor = KindEditor.create(this.form.renderto+' textarea#'+this.form.name+'_'+this.name, {
							allowImageUpload : false,
							minHeight:50,
							minWidth:100,
							items : [
								'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline',
								'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist',
								'insertunorderedlist', '|','table','wordpaste', 'emoticons', 'image', 'insertfile', 'link','hr'],
							afterCreate:function(){
								_this.el.find('div.ke-container').css('display', 'inline-block');
								//在工具栏显示计数
								$(this.toolbar.div[0]).append(
									'<span unselectable="on" style="float:right;font-size: 12px;padding-right: 5px;padding-top: 3px;">字数: 0'+
									'</span>');
							},
							afterChange:function(){
								//在工具栏显示计数
								$(this.toolbar.div[0]).find('span:last').html('字数: '+this.count());
								_this.validate(this.html());
							},
							afterBlur:function(){
								_this.richEditorSetting = true;//通知field不要再把值set回来
								_this.setValue(this.html());
								_this.richEditorSetting = false;
							}
						});
						
						if(this.renderType == 'replace'){
							//允许点击 打开编辑窗口
							this.el.find('img#_handler').first()
								.click(function(){
									var workarea = $('#_pageContent');
									
									var workareaWidth = workarea.width() - 100;
									if(_this.popWidth!=null){
										workareaWidth = parseInt(_this.popWidth);
									}
									var workareaHeight = workarea.height() - 60;
									if(_this.popHeight!=null){
										workareaHeight = parseInt(_this.popHeight);
									}
									$( "body" ).append(
											'<div title="'+_this.label+'('+_this.name+')'+'" id="html_area_'+_this.form.name+'_'+_this.name+'" style="height:100%;">'+
												'<textarea id="'+_this.form.name+'_'+_this.name+'_textarea" name="'+_this.form.name+'_'+_this.name+'_textarea" style="width:100%;height:100%;">'+
												'</textarea>'+
											'</div>'
										);
									divEl = $('#html_area_'+_this.form.name+'_'+_this.name);
									
									divEl.dialog({
											 modal: true,
											 width: workareaWidth,
											 height: workareaHeight,
											 close:function(){
												 $(this).dialog( "destroy" );
												 $(this).remove();
											 },
											 open:function(event, ui){
												$(".ui-dialog-titlebar-close", $(this).parent()).hide();
												var popEditor = KindEditor.create('#html_area_'+_this.form.name+'_'+_this.name, {
													allowImageUpload : false,
													resizeType:0,
													width:workareaWidth -2,
													afterCreate:function(){
														 this.html(_this.richEditor.html());
													}
												});
												_this.popEditor = popEditor;
											 },
											 resizeStop: function( event, ui ) {
												_this.popEditor.resize(
													ui.size.width -1,
													ui.size.height - 78
													,false
												);
											 },
											 autoOpen: true,
											 hide: { effect: "scale", percent: 0 ,duration: 400},
											 buttons: [{ 
												 text: "确定",
												 click:function() {
													 _this.richEditor.html(_this.popEditor.html());
//														var textareaValue = jsCodeMirrorEdit.getValue();
//														textareaValue = textareaValue.replace(/\n/g,"\\n").replace(/\"/g,'\\"');
//														fieldCmp.setValue(textareaValue,false,false,null);
													$( this ).dialog( "close" );
												 }
											},{ 
												 text: "取消",
												 click:function() {
													$( this ).dialog( "close" );
												 }
											}]
									});
								});
						}
					}
					//将自定义onchange方法 绑定到当前对象的change事件
					if(this.onChangeFunction!=null){
						this.addListener(this.events.change,this._observer,this.onChangeFunction);
					}
				}
				this.rendered = true;
				this.validate(this.rawValue);
			},
			resize:function(width,height){
				this.inputEl.css('width',(width  -30) +'px');
				this.inputEl.css('height',(height  -4) +'px');
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
								_this.richEditor.resize(ui.size.width -32,ui.size.height -6,true);
								//设置字段的width height参数
								_this.designNode.record.setFieldValue('width',(ui.size.width -2)+"px");
								_this.designNode.record.setFieldValue('height',(ui.size.height -2)+"px");
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
			},
			setRelationToHTML:function(){
				if(this.el!=null && _isDesignMode ){
					var _fieldName = this.name;
					var _formName = this.form.name;
					var _this = this;
					this.el.bind('click',function(event){
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
							//选中设计器中 对应的节点
							treeObj.selectNode(_this.designNode,false);
							LUI.PageDesigner.instance.onComponentNodeSelected(_this.designNode);
						}
					});
				}
			},
			displayRawValue:function(){
				;//
			},
			deRender:function(forceDeRender){
				KindEditor.remove(this.form.renderto+' textarea#'+this.form.name+'_'+this.name);
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
					
					//与页面元素取消关联
					this.inputEl.unbind();
					this.removeListener(this.events.change,this._observer);
				}
				
				this.el = null;
				this.inputEl = null;
				this.rendered = false;
			},
			markInvalid:function(){
				if(this.enabled && this.rendered && this.richEditor!=null){
					$(this.richEditor.container[0]).addClass('nim-field-invalid');
//						this.inputEl.find('.ke-container').addClass('nim-field-invalid');
				}
			},
			clearInvalid:function(){
				if(this.rendered && this.richEditor!=null){
					$(this.richEditor.container[0]).removeClass('nim-field-invalid');
//						this.inputEl.find('.ke-container').removeClass('nim-field-invalid');
				}
			},
			validate:function(dataValue){
				var oldValid = this.isValid;
				//html型字段 除了校验是否为空外还需要检查长度是否符合要求
				this.isValid = true;
				//检查值是否 有效
				var stringValue = dataValue==null?'':dataValue;
				if(stringValue.length ==0){
					if(!this.allowBlank){
						this.isValid = false;
						this.validInfo = '不允许为空!';
					}
				}else{
					if(this.minLength!=null){
						var minLength = parseInt(this.minLength);
						if(minLength > 0 && stringValue.length < minLength){
							//检查是否符合最少字符要求
							this.isValid = false;
							this.validInfo = '请至少输入'+minLength+'个字符!';
						}
					}
					
					if(this.maxLength!=null){
						var maxLength = parseInt(this.maxLength);
						if(maxLength > 0 && stringValue.length > maxLength){
							//检查是否符合最大字符要求
							this.isValid = false;
							this.validInfo = '不允许超过'+maxLength+'个字符!';
						}
					}
					
				}
				
				if(!this.isValid){
					this.markInvalid();
				}else{
					this.clearInvalid();
				}
				
				//var oldValid = this.isValid;
				if( oldValid!= this.isValid){
					this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.isValid});
				}
				return this.isValid;
			}
		});
		return field;
	}

}

LUI.Form.Field.HTMLArea = {
	uniqueId:0,
	type:'htmlEditor',
	createNew:function(fieldMeta,lui_form){
		var field = $.extend(LUI.Form.Field.StringHTML.createNew(fieldMeta,lui_form),{
			id: '_form_field_HTMLArea_'+(++LUI.Form.Field.HTMLArea.uniqueId),
			type:LUI.Form.Field.HTMLArea.type
		});
		return field;
	}
}


LUI.Form.Field.EventScript = {
		uniqueId:0,
		type:'eventScriptEditor',
		createNew:function(fieldMeta,lui_form){
			var field = $.extend(LUI.Form.Field.Textarea.createNew(fieldMeta,lui_form),{
				id: '_form_field_eventScript_'+(++LUI.Form.Field.EventScript.uniqueId),
				type:LUI.Form.Field.EventScript.type,
				render:function(){
					if(this.renderType != 'none'){
						if(this.createFieldEl(LUI.Template.Field.eventScript)){
							
							this.fieldWidth = this.inputEl.width();
							this.fieldHeight = this.inputEl.height();
							
							this.resize(this.fieldWidth,this.fieldHeight);
						
							var fieldCmp = this;
							//允许点击 打开编辑窗口
							this.el.find('img#_handler').first()
								.click(function(){
									$( "body" ).append(
											'<div title="'+fieldCmp.label+'('+fieldCmp.name+')'+'" id="event_script_'+fieldCmp.name+'">'+
												'<span class="cm-s-default" style="font-size: 13px;font-weight: bold;line-height:22px;height:22px;">'+
													'<span class="cm-keyword">function</span>&nbsp;'+
													'<span class="cm-variable">'+fieldCmp.name+'</span>('+
													'<span class="cm-def">qweqe,qweq</span>,'+
													'<span class="cm-def">qweqw</span>,'+
													'<span class="cm-def">qwe</span>){'+
												'</span>'+
												'<textarea cols=40 rows=10 id="'+fieldCmp.name+'_textarea" name="'+fieldCmp.name+'_textarea" style="height: 136px;width: 100%;overflow:auto">'+
												(fieldCmp.getValue()==null?"":fieldCmp.getValue().replace(/\\n/g,"\n") )+
												'</textarea>'+
												'<span style="font-size: 13px;font-weight: bold;line-height:22px;height:22px;">}</span>'+
											'</div>'
										);
									divEl = $('#event_script_'+fieldCmp.name);
									var jsCodeMirrorEdit = CodeMirror.fromTextArea(divEl.find('#'+fieldCmp.name+'_textarea')[0], {
									     lineNumbers: true,
									     matchBrackets: true,
									     continueComments: "Enter",
									     extraKeys: {"Ctrl-Q": "toggleComment"},
									     mode: "javascript"
									 });
									
									divEl.dialog({
											 modal: true,
											 width: 613,
											 height: 393,
											 close:function(){
												 $(this).dialog( "destroy" );
												 $(this).remove();
											 },
											 open:function(event, ui){
												$(".ui-dialog-titlebar-close", $(this).parent()).hide();
												
												//设置textarea宽度
												divEl.css('padding','0px').css('width','100%');
												// 创建CodeMirror编辑器
												
												jsCodeMirrorEdit.setSize('100%','246px');
											 },
											 resizeStop: function( event, ui ) {
												 jsCodeMirrorEdit.setSize('100%',(ui.size.height - 130)+'px');
											 },
											 autoOpen: true,
											 show: { effect: "scale", percent:100,duration: 400 },
											 hide: { effect: "scale", percent: 0 ,duration: 400},
											 buttons: [{ 
												 text: "确定",
												 click:function() {
													var textareaValue = jsCodeMirrorEdit.getValue();
//													textareaValue = textareaValue.replace(/\n/g,"\\n").replace(/\"/g,'\\"');
													fieldCmp.setValue(textareaValue,false,false,null);
													$( this ).dialog( "close" );
												 }
											},{ 
												 text: "取消",
												 click:function() {
													$( this ).dialog( "close" );
												 }
											}]
									});
								});
							
							//将input元素的change事件 绑定到当前对象
							this.inputEl.bind('change',function(){
								fieldCmp.setValue($(this).val(),false,false,null);
							});
							//将自定义onchange方法 绑定到当前对象的change事件
							if(this.onChangeFunction!=null){
								this.addListener(this.events.change,this._observer,this.onChangeFunction);
							}
							this.rendered = true;
							//原值要重新显示出来
							this.displayRawValue();
						}
					}
					this.validate(this.rawValue);
				},
				resize:function(fieldWidth){
					//将录入元素的外层大小 限制为定义的宽度 -20
					this.inputEl.outerWidth(fieldWidth -20);
				}

			});
			return field;
		}
}


LUI.Form.Field.Int = {
	uniqueId:0,
	type:'intEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_int_'+(++LUI.Form.Field.Int.uniqueId),
			type:LUI.Form.Field.Int.type,
			render:function(){
				if(this.renderType != 'none' ){
					if(this.textAlign == null){
						this.textAlign = "left";
					}
					//根据构建类型 确定如何render
					if(this.createFieldEl(LUI.Template.Field.intField)){
						this.fieldWidth = this.inputEl.width();
						this.resize(this.fieldWidth);
						//将自定义onchange方法 绑定到当前对象
						if(this.onChangeFunction!=null){
							this.addListener(this.events.change,this._observer,this.onChangeFunction);
						}
						//将input元素的change事件 绑定到当前对象(一个inputEl 同时只能绑定到一个field)
						var contextThis = this;
						this.inputEl.bind('change',function(){
							contextThis._onInputChange($(this).val(), false);
						});
						this.rendered = true;
						//原值要重新显示出来
						this.displayRawValue();
					}
				}
				this.validate(this.rawValue);
			},
			validate:function(dataValue){
				var oldValid = this.isValid;
				//数值型字段 除了校验是否为空外还需要检查是否有效 大小是否是否符合要求
				this.isValid = true;

				//检查值是否 有效
				var stringValue = dataValue==null?'':(''+dataValue).replace(/,/g,"");
				if(stringValue.length ==0){
					if(!this.allowBlank){
						this.isValid = false;
						this.validInfo = '不允许为空!';
					}
				}else if(stringValue.length > 0){
					var   r = /^-?\d+$/;　　//整数      
					//检查是否有效数字
					this.isValid = r.test(stringValue);
					if(!this.isValid){
						this.validInfo = '请输入有效的整数!';
					}else{
						//检查取值范围
						if(this.minValue!=null){
							var minValue = parseFloat(this.minValue);
							if(parseFloat(stringValue) < minValue){
								//检查是否符合最少字符要求
								this.isValid = false;
								this.validInfo = '请输入不小于'+minValue+'的整数!';
							}
						}
						
						if(this.maxValue!=null){
							var maxValue = parseFloat(this.maxValue);
							if(parseFloat(stringValue) > maxValue){
								//检查是否符合最少字符要求
								this.isValid = false;
								this.validInfo = '请输入不大于'+maxValue+'的整数!';
							}
						}
					}
				}
				if(!this.isValid){
					this.markInvalid();
				}else{
					this.clearInvalid();
				}
				
				//var oldValid = this.isValid;
				if( oldValid!= this.isValid){
					this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.isValid});
				}
				return this.isValid;
			},
			/**
			 * 将显示值转换为数据值
			 */
			parseRawValue:function(rawVal){
				var _v = null;
				if(rawVal!=null){
					if(rawVal.length ==0 ){
						//没有输入值
						if(this.allowBlank){
							//允许为空的情况下 认为是null
						}else if(this.zeroAsBlank){
							//不允许为空 且 不显示零值的情况下 认为是0
							_v = '0';
						}
					}else{
						_v = (''+rawVal).replace(/,/g,"");
					}
				}
				return _v;
			},
			/**
			 * 将数据值格式化为显示值
			 */
			formatRawValue:function(dataVal){
				var _rawValue = '';
				if(dataVal!=null ){
					var stringValue = ''+dataVal;
					if(stringValue.length >0){
						var _v = parseInt(stringValue);
						if(_v !=0 || !this.zeroAsBlank){
							if(this.template!=null){
								var _value = {};
								_value[this.name] = _v;
								_rawValue = this.template(_value);
							}else{
								_rawValue = ''+_v;
							}
							//是否需要显示千分符
							if(this.showThousand!=null && this.showThousand == "true"){
								_rawValue = LUI.Util.thousandth(_v);
							}
						}
					}
				}
				return _rawValue;
			}
		});
	}
};

LUI.Form.Field.Double = {
	uniqueId:0,
	type:'doubleEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_double_'+(++LUI.Form.Field.Double.uniqueId),
			type:LUI.Form.Field.Double.type,
			render:function(){
				if(this.renderType != 'none' ){
					if(this.textAlign == null){
						this.textAlign = "left";
					}
					//根据构建类型 确定如何render
					if(this.createFieldEl(LUI.Template.Field.doubleField)){
						this.fieldWidth = this.inputEl.width();
						this.resize(this.fieldWidth);
						//将自定义onchange方法 绑定到当前对象
						if(this.onChangeFunction!=null){
							this.addListener(this.events.change,this._observer,this.onChangeFunction);
						}
						//将input元素的change事件 绑定到当前对象(一个inputEl 同时只能绑定到一个field)
						var contextThis = this;
						this.inputEl.bind('change',function(){
							contextThis._onInputChange($(this).val(), false);
						});
						this.rendered = true;
						//原值要重新显示出来
						this.displayRawValue();
					}
				}
				this.validate(this.rawValue);
			},

			validate:function(dataValue){
				var oldValid = this.isValid;
				//数值型字段 除了校验是否为空外还需要检查是否有效 大小是否是否符合要求
				this.isValid = true;

				//检查值是否 有效
				var stringValue = dataValue==null?'':(''+dataValue).replace(/,/g,"");
				if(stringValue.length ==0){
					if(!this.allowBlank){
						this.isValid = false;
						this.validInfo = '不允许为空!';
					}
				}else if(stringValue.length > 0){
					var r = /^-?\d+\.?\d{0,2}$/;　　//最大两位小数      
					if(this.decLength == null || this.decLength =='0'){
						r = /^-?\d+\.?\d*$/;　　//小数不限制
					}else if(this.decLength =='1'){
						r = /^-?\d+\.?\d{0,1}$/;　　//最大1位小数
					}else if(this.decLength =='2'){
						r = /^-?\d+\.?\d{0,2}$/;　　//最大2位小数
					}else if(this.decLength =='3'){
						r = /^-?\d+\.?\d{0,3}$/;　　//最大3位小数
					}else if(this.decLength =='4'){
						r = /^-?\d+\.?\d{0,4}$/;　　//最大4位小数
					}else if(this.decLength =='5'){
						r = /^-?\d+\.?\d{0,5}$/;　　//最大5位小数
					}else if(this.decLength =='6'){
						r = /^-?\d+\.?\d{0,6}$/;　　//最大6位小数
					}
					//检查是否有效数字
					
					this.isValid = r.test(stringValue);
					if(!this.isValid){
						if(this.decLength == null || this.decLength =='0'){
							this.validInfo = '请输入有效的数值!';
						}else{
							this.validInfo = '请输入有效的数值('+this.decLength+'位小数)!';
						}
					}else{
						//检查取值范围
						if(this.minValue!=null){
							var minValue = parseFloat(this.minValue);
							if(parseFloat(stringValue) < minValue){
								//检查是否符合最少字符要求
								this.isValid = false;
								this.validInfo = '请输入不小于'+minValue+'的数值!';
							}
						}
						
						if(this.maxValue!=null){
							var maxValue = parseFloat(this.maxValue);
							if(parseFloat(stringValue) > maxValue){
								//检查是否符合最少字符要求
								this.isValid = false;
								this.validInfo = '请输入不大于'+maxValue+'的数值!';
							}
						}
					}
					
				}
				
				if(!this.isValid){
					this.markInvalid();
				}else{
					this.clearInvalid();
				}
				
				//var oldValid = this.isValid;
				if( oldValid!= this.isValid){
					this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.isValid});
				}
				return this.isValid;
			},
			/**
			 * 将显示值转换为数据值
			 */
			parseRawValue:function(rawVal){
				var _v = null;
				if(rawVal!=null){
					if(rawVal.length ==0 ){
						//没有输入值
						if(this.allowBlank){
							//允许为空的情况下 认为是null
						}else if(this.zeroAsBlank){
							//不允许为空 且 不显示零值的情况下 认为是0
							_v = '0';
						}
					}else{
						_v = (''+rawVal).replace(/,/g,"");
					}
				}
				return _v;
			},
			/**
			 * 将数据值格式化为显示值
			 */
			formatRawValue:function(dataVal){
				var _rawValue = '';
				if(dataVal!=null ){
					var stringValue = ''+dataVal;
					if(stringValue.length >0){
						var _v = parseFloat(stringValue);
						if(_v !=0 || !this.zeroAsBlank){
							if(this.template!=null){
								var _value = {};
								_value[this.name] = _v;
								_rawValue = this.template(_value);
							}else{
								_rawValue = ''+_v;
							}
							//是否需要显示千分符
							if(this.showThousand!=null && this.showThousand == "true"){
								_rawValue = LUI.Util.thousandth(_v);
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
						}
					}
				}
				return _rawValue;
			}
		
		});
	}
};

LUI.Form.Field.Money = {
	uniqueId:0,
	type:'moneyEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_money_'+(++LUI.Form.Field.Money.uniqueId),
			type:LUI.Form.Field.Money.type
		});
	}
};

LUI.Form.Field.ObjectSelect = {
	uniqueId:0,
	type:'objectSelectEditor',
	createNew:function(fieldMeta,lui_form){
		var datasourceType = fieldMeta.datasourceType;
		var _datasource = LUI.Datasource.getInstance(fieldMeta.datasourceName);
		if(_datasource == null){
			LUI.Message.warn('创建字段失败','字段('+fieldMeta.name+')未设置数据源！');
			return null;
		}
		
		//解析生成模板中的字段名 用作查询条件
		var queryFields = [];
		var renderTemplateExpression = null;
		if(fieldMeta.renderTemplate!=null && fieldMeta.renderTemplate.length >0){
			var matchRe = /{{[\S]+?}}/gi;
			var replaceRe = /{{|}}/gi;
			var fields = fieldMeta.renderTemplate.match(matchRe);
			for(var i= 0;i<fields.length;i++){
				queryFields[queryFields.length] = fields[i].replace(replaceRe, "");
			}
			//替换表达式模板中 与当前字段名有关的部分（在字段内 使用子对象生成显示内容）
			var objectRenderTemplate = fieldMeta.renderTemplate.replace(new RegExp(fieldMeta.name+'\\.', "gi"),"") ;
			
			renderTemplateExpression = Handlebars.compile(objectRenderTemplate);
		}else{
			LUI.Message.warn('创建字段失败','字段('+fieldMeta.name+')未设置显示表达式！');
			return null;
		}
		
		var minLength = 0;
		if(fieldMeta.minLength!=null && fieldMeta.minLength.length >0){
			minLength = parseInt(fieldMeta.minLength);
		}
		
//		var allowEdit = true;
//		if(fieldMeta.allowEdit!=null && fieldMeta.allowEdit=='false'){
//			allowEdit = false;
//		}
		
		var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
			id: '_form_field_objectselect_'+(++LUI.Form.Field.ObjectSelect.uniqueId),
			type:LUI.Form.Field.ObjectSelect.type,
			options:[],
			queryFields:queryFields,
			datasource:_datasource,
			renderTemplateExpression:renderTemplateExpression,
			focus:function(){
				var comboboxIns = this.inputEl.combobox("instance");
				if(comboboxIns!=null) {
					comboboxIns.input[0].focus();
				}
			},
			render:function(){
				if(this.renderType != 'none'){
					if(this.createFieldEl(LUI.Template.Field.select)){
//						this.fieldWidth = this.inputEl.width();
//						this.resize(this.fieldWidth);
						
						var contextThis = this;
						this.inputEl.combobox({
							getObjectField:function(){
								return contextThis;
							},
							height:fieldMeta.height,
							width:fieldMeta.width,
							disabled:!this.enabled,
							allowEdit:this.allowEdit,
							source: function( request, response ) {
								var searchString = null;
								var isShowAll = false;
								if(request.term == 'search all'){
									isShowAll = true;
									if(this.options.minLength >0){
										return;
									}
								}else if(request.term!=null && request.term.length>0){
									searchString = request.term.toLowerCase();;
								}
								
								//输入字符或点击下拉箭头 请求显示符合条件的选项 
								if(contextThis.searchMode == 'local'){
									//本地搜索
									if(contextThis.datasource.loaded = true){
										//如果已经load了全部数据 进行本地搜索
										contextThis.initOptions(searchString,isShowAll);
										response(contextThis.options);
									}else{
										//如果还没有load 需要远程取得全部数据 再进行本地搜索
										contextThis.datasource.load({},function(){
											contextThis.initOptions(searchString,isShowAll);
											response(contextThis.options);
										},true,false);
									}
								}else{
									//远程搜索
									var filters = [];
									if(searchString!=null && contextThis.queryFields.length>0){
										var filter = {
											property:contextThis.queryFields[0],
											operator:'like',
											value:searchString,
											assist:contextThis.queryFields
										};
										if(contextThis.queryFields.length>1){
											filter.assist = contextThis.queryFields.slice(1);
										}
										filters[filters.length] = filter;
									}
									
									contextThis.datasource.load({
										filters:filters
									},function(){
										contextThis.initOptions(searchString,isShowAll);
										response(contextThis.options);
									},true,false);
								}
							},
							minLength: minLength,
							select: function( event, ui ) {
								contextThis.setValue(ui.item.data);
							}
						});
						//如果数据源已经loaded 初始化选择项
//						if(this.datasource.loaded = true ){
//							this.initOptions();
//						}
						
						
						
						//将自定义onchange方法 绑定到当前对象的change事件
						if(this.onChangeFunction!=null){
							this.addListener(this.events.change,this._observer,this.onChangeFunction);
						}
		//				//在ie浏览器中 checkbox需要失去焦点才能触发change事件
		//				if (isIE) {
		//					this.inputEl.click(function () {
		//						this.blur();
		//						this.focus();
		//					});
		//				}; 
						this.rendered = true;
						//原值要重新显示出来
						this.displayRawValue();
					}
				}
				this.validate(this.value);
			},
			validate:function(dataVal){
				var oldValid = this.isValid;
				//对象类型的字段 只校验字段值 是否允许为空
				this.isValid = true;
				//将空显示值 变为
				//默认只检查 是否允许为空
				if((dataVal == null || dataVal.length ==0) && !this.allowBlank){
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
				
				//var oldValid = this.isValid;
				if( oldValid!= this.isValid){
					this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.isValid});
				}
				return this.isValid;
			},
			setSizeDesignable:function(node,isEnable){
				if(!this.rendered){
					return;
				}
				if(this.designNode == null && node!=null){
					this.designNode = node;
				}
				//是否启用尺寸的设计模式
				var comboboxIns = this.inputEl.combobox("instance");
				if(comboboxIns!=null) {
					if(isEnable){
						var _this = this;
						comboboxIns.wrapper.inputResizable({
							helper: "ui-resizable-helper",
							cancel: ".cancel",
							stop: function( event, ui ) {
								if(_this.designNode!=null){
									//
									comboboxIns.input.outerWidth( ui.size.width - comboboxIns.trigger.outerWidth() );
									//设置字段的width height参数
									_this.designNode.record.setFieldValue('width',ui.size.width+"px");
								}
							}
						});
					}else{
						var as = comboboxIns.wrapper.inputResizable( "instance" );
						if(as!=null){
							comboboxIns.wrapper.inputResizable( "destroy" );
						}
					}
				}
			},
			setValue:function (val,silence,isInitial,originSource){
				var newVal = val;
				if(typeof(val) == 'number' || typeof(val) == 'string'){
					var oRecord = this.datasource.getRecordByPKValue(val *1);
					if(oRecord!=null){
						newVal = oRecord.getData();
					}
				}
				var oldVal = this.value;
				//如果值有变化
				if(!this.equalsValue(this.value,newVal)){
					if(this.validate(newVal)){
						//校验通过
						this.value = newVal;
						this.rawValue = this.formatRawValue(newVal);
					}else{
						this.value = null;
						this.rawValue = '';
					}
					//无论校验通过与否 都生成显示值
					
					if(this.rendered){
						//重新显示
						this.displayRawValue();
					}
					
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
				}else if(typeof(val1) != typeof(val2)){
					return false;
				}
			
				//检查主键值是否匹配
				var keyValue1 = val1[this.datasource.primaryFieldName];
				var keyValue2 = val2[this.datasource.primaryFieldName];
				if(keyValue1 == keyValue2){
					return true;
				}
				return false;
			},
			/**
			 * 将显示值转换为数据值
			 */
			parseRawValue:function(rawVal){
				var valueLowerCase = rawVal.toLowerCase();
				for(var i=0;i<this.datasource.size();i++){
					var r = this.datasource.getRecord(i);
					var text = this.formatRawValue(r.getData());
					if(text == rawVal){
						return r.getData();
					}
				}
				
//				for(var i=0;i<this.options.length;i++){
//					var item = this.options[i];
//					var elText = item.label.toLowerCase();
//					if ( elText.indexOf(valueLowerCase) >= 0 ) {
//						return item.data;
//					}
//				}
				return null;
			},
			/**
			 * 将数据值格式化为显示值
			 */
			formatRawValue:function(dataVal){
				if(dataVal!=null && this.renderTemplateExpression!=null){
					return this.renderTemplateExpression(dataVal);
				}
				return '';
			},
			displayRawValue:function (){
				var comboInput = this.inputEl.combobox("instance").input;
				if(comboInput.val() != this.rawValue){
					//将显示值 重新显示到页面
					comboInput.val(this.rawValue);
				}
			}, 
			markInvalid:function(){
				if(this.enabled && this.rendered ){
					var comboboxIns = this.inputEl.combobox("instance");
					if(comboboxIns!=null) comboboxIns.wrapper.addClass('custom-combobox-invalid');
				}
			},
			clearInvalid:function(){
				if(this.rendered ){
					var comboboxIns = this.inputEl.combobox("instance");
					if(comboboxIns!=null) comboboxIns.wrapper.removeClass('custom-combobox-invalid');
				}
			},
			enable:function(){
				this.enabled = true;
				if(!this.isValid){
					this.markInvalid();
				}
				var comboboxIns = this.inputEl.combobox("instance");
				//将字段变为可编辑
				comboboxIns.input.removeAttr('disabled');
				//按钮变为diabeld
				comboboxIns.trigger.button("enable");
			},
			disable:function(){
				this.enabled = false;
				if(!this.isValid){
					//disable状态下 不显示数据是否有效
					this.clearInvalid();
				}
				
				var comboboxIns = this.inputEl.combobox("instance");
				//将字段变为不可编辑
				comboboxIns.input.attr('disabled','true');
				//按钮变为diabeld
				comboboxIns.trigger.button("disable");
			},
			initOptions:function(searchString,isShowAll){
				var searchStringLowerCase = null;
				if(searchString!=null){
					searchStringLowerCase = searchString.toLowerCase();
				}
				//删除原有选项
				this.options = [];
				
				if(this.allowBlank && (searchStringLowerCase==null || isShowAll)){
					this.options[this.options.length] = {
						value: null,
						label: "无"
					};
				}
				
				for(var i=0;i<this.datasource.size();i++){
					var r = this.datasource.getRecord(i);
					var rData = r.getData();
					var text = this.formatRawValue(rData);
					if(searchStringLowerCase==null || text.toLowerCase().indexOf(searchStringLowerCase) >= 0){
						this.options[this.options.length] = {
							value: text,
							label: text,
							data:rData
						};
					}
				}
			}
		});
		return field;
	}

};



//对象类型的radio编辑控件
//
LUI.Form.Field.ObjectRadioEditor = {
	uniqueId:0,
	type:'objectRadioEditor',
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
		
		var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
			id: '_form_field_radio_'+(++LUI.Form.Field.ObjectRadioEditor.uniqueId),
			type:LUI.Form.Field.ObjectRadioEditor.type,
			options:[],
			datasource:_datasource,
			renderTemplateExpression:renderTemplateExpression,
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
								
								if(_this.designNode.record.hasField('height')){
									_this.designNode.record.setFieldValue('height',ui.size.height+"px");
								}
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
			},
			render:function(){
				if(this.renderType != 'none'){
					//从数据源中取得选项
					if(this.createFieldEl(LUI.Template.Field.objectRadio)){
						//显示所有选项
						
						//取得第一个li元素 作为迭代选项的依据
						var itemEl = this.el.children('li:eq(0)');
						
						//删除所有子元素
						this.el.children('li').remove();
						
						this.radios = [];
						
						var contextThis = this;
						//根据option 创建多个checkbox
						for(var i=this.datasource.size()-1;i>=0;i--){
							var r = this.datasource.getRecord(i);
							var itemData = r.getData();
							var text = this.renderTemplateExpression(itemData);
							
							var newLiEl = itemEl.clone().prependTo(this.el);
							
							var isChecked = false;
							if(this.value!=null && r.primaryFieldValue == this.value[r.primaryFieldName]){
								isChecked = true;
							}
							var newInputEl = newLiEl.find(':radio').first();
							newInputEl.attr('id',this.id+'_option_radio_'+i)
								.prop("name", this.id)
								.prop("checked", isChecked)
								.attr("keyValue", r.primaryFieldValue)
								.data("itemData", itemData)
								.bind('change',function(){
									//radio 只有被选中的时候 才会触发 change
									contextThis.setValue($(this).data("itemData"));
								});
							newLiEl.find('label').first()
								.attr('id',this.id+'_option_label_'+i)
								.attr('for',this.id+'_option_radio_'+i)
								.html(text);
										  
//							if (isIE) {
//								//在ie浏览器中 checkbox需要失去焦点才能触发change事件
//								newLiEl.find(':checkbox').first().click(function () {
//									this.blur();
//									this.focus();
//								});
//							};
							this.radios[this.radios.length] = newInputEl;
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
			/**
			 * 将显示值转换为数据值
			 */
			parseRawValue:function(rawVal){
				LUI.Message.warn('错误','radio类型的字段不需要转换数据值！');				
				return null;
			},
			/**
			 * 将数据值格式化为显示值 (对每个可选对象 处理为checkbox的label)
			 */
			formatRawValue:function(dataVal){
				LUI.Message.warn('错误','radio类型的字段不需要转换显示值！');				
				return null;
			},
			displayRawValue:function (){
				//主键值与当前value一致的 设为选中（其他的被自动取消选中）
				for(var j=0;j<this.radios.length;j++){
					if(this.value!=null && this.radios[j].attr("keyValue") == this.value[this.datasource.primaryFieldName]){
						this.radios[j].prop("checked", true);
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
					if(this.rendered ){
						this.displayRawValue();
					}
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
				}else if(typeof(val1) != typeof(val2)){
					return false;
				}
			
				//检查主键值是否匹配
				var keyValue1 = val1[this.datasource.primaryFieldName];
				var keyValue2 = val2[this.datasource.primaryFieldName];
				if(keyValue1 == keyValue2){
					return true;
				}
				return false;
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
				this.el.find(':radio').removeAttr('disabled');
			},
			disable:function(){
				this.enabled = false;
				if(!this.isValid){
					//disable状态下 不显示数据是否有效
					this.clearInvalid();
				}
				this.el.addClass('nim-field-disabled');
				this.el.find(':radio').attr('disabled','true');
			}
		});
		return field;
	}
};

LUI.Form.Field.Time = {
	uniqueId:0,
	type:'timeEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_time_'+(++LUI.Form.Field.Time.uniqueId),
			type:LUI.Form.Field.Time.type
		});
	}
};

LUI.Form.Field.Date = {
		uniqueId:0,
		type:'dateEditor',
		createNew:function(fieldMeta,lui_form){
//			var renderType = fieldMeta.renderType||'generate';
//			fieldMeta.renderType = 'rela';
			
			var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
				id: '_form_field_date_'+(++LUI.Form.Field.Date.uniqueId),
				type:LUI.Form.Field.Date.type,
				
				enable:function(){
					this.enabled = true;
					this.inputEl.datepicker({dateFormat:'yy-mm-dd'});
					//按钮可点击
					var _this = this;
					this.el.find('img#_handler').bind('click',function(){
						_this.inputEl.datepicker("show");
					});
					//
					if(!this.isValid){
						this.markInvalid();
					}
					this.inputEl.removeAttr('disabled');
				},
				disable:function(){
					this.enabled = false;
					this.inputEl.datepicker("destroy");
					//按钮不可点击
					this.el.find('img#_handler').unbind('click');
					//
					if(!this.isValid){
						//disable状态下 不显示数据是否有效
						this.clearInvalid();
					}
					this.inputEl.attr('disabled','true');
				},
				focus:function(){
					if(this.rendered){
						this.el[0].focus();
					}
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
						this.el.addClass('ui-resizable-border');
						var _this = this;
						this.el.inputResizable({
							helper: "ui-resizable-helper",
							cancel: ".cancel",
							stop: function( event, ui ) {
								if(_this.designNode!=null){
									//inputEl的新宽度
									_this.inputEl.width(ui.size.width -32);
									//设置字段的width height参数
									_this.designNode.record.setFieldValue('width',(ui.size.width -2)+"px");
//									_this.designNode.record.setFieldValue('height',ui.size.height+"px");
								}
							}
						});
					}else{
						this.el.removeClass('ui-resizable-border');
						var as = this.el.inputResizable( "instance" );
						if(as!=null){
							this.el.inputResizable( "destroy" );
						}
					}
				},
				render:function(){
					
					if(this.renderType != 'none'){
						if(this.createFieldEl(LUI.Template.Field.datepicker)){
							this.fieldWidth = this.inputEl.width();
							this.fieldHeight = this.inputEl.height();
							this.resize(this.fieldWidth,this.fieldHeight);
							
							this.inputEl.datepicker({dateFormat:'yy-mm-dd'});
						
							//点击显示日历
							if(this.enabled){
								var fieldInputEl = this.inputEl;
								var trigger = this.el.find('img#_handler');
								trigger.click(function(){
									fieldInputEl.datepicker("show");
								});
								
								if(!this.allowEdit){
									this.inputEl
										.css("cursor","pointer")
										.focus(function(){
											trigger[0].focus();
										});
									this.inputEl.click(function(){
										fieldInputEl.datepicker("show");
									});
								}
							}
							
							//将input元素的change事件 绑定到当前对象
							var contextThis = this;
							this.inputEl.bind('change',function(){
								contextThis.setValue($(this).val(),false,false,null);
							});
							//将自定义onchange方法 绑定到当前对象的change事件
							if(this.onChangeFunction!=null){
								this.addListener(this.events.change,this._observer,this.onChangeFunction);
							}
							this.rendered = true;
							//原值要重新显示出来
							this.displayRawValue();
						}
					}
					this.validate(this.rawValue);
				},
				resize:function(fieldWidth){
					//将录入元素的外层大小 限制为定义的宽度
					this.inputEl.outerWidth(fieldWidth -16);
				},
				validate:function(dataValue){
					var oldValid = this.isValid;
					//日期型字段 除了校验是否为空外还需要检查是否有效 大小是否是否符合要求
					this.isValid = true;

					//检查值是否 有效
					var stringValue = dataValue==null?'':(''+dataValue);
					if(stringValue.length ==0){
						if(!this.allowBlank){
							this.isValid = false;
							this.validInfo = '不允许为空!';
						}
					}else if(stringValue.length > 0){
						stringValue = stringValue.substr(0,10);
						//检查是否有效数字
						var r =  /^(\d{4})-(\d{2})-(\d{2})$/ ;　　//日期     
						this.isValid = r.test(stringValue);
						if(!this.isValid){
							this.validInfo = '请输入有效的日期，格式为yyyy-mm-dd!';
						}else{
							var thisDate = new Date(stringValue.replace(/-/g,"/"));
							//检查取值范围
							if(this.minDate!=null){
								var minDate = new Date(this.minDate.replace(/-/g,"/"));
								if(thisDate < minDate){
									//检查是否符合最小日期要求
									this.isValid = false;
									this.validInfo = '请输入不小于'+this.minDate+'的日期!';
								}
							}
							
							if(this.maxDate!=null){
								var maxDate = new Date(this.maxDate.replace(/-/g,"/"));
								if(thisDate > maxDate){
									//检查是否符合最大日期要求
									this.isValid = false;
									this.validInfo = '请输入不大于'+this.maxDate+'的日期!';
								}
							}
						}
					}
				
					if(!this.isValid){
						this.markInvalid();
					}else{
						this.clearInvalid();
					}
					
					//var oldValid = this.isValid;
					if( oldValid!= this.isValid){
						this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.isValid});
					}
					return this.isValid;
				}
			});
			return field;
		}

};

LUI.Form.Field.Month = {
	uniqueId:0,
	type:'monthEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_month_'+(++LUI.Form.Field.Month.uniqueId),
			type:LUI.Form.Field.Month.type
		});
	}
};

LUI.Form.Field.Year = {
	uniqueId:0,
	type:'yearEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_year_'+(++LUI.Form.Field.Year.uniqueId),
			type:LUI.Form.Field.Year.type
		});
	}
};

LUI.Form.Field.File = {
	uniqueId:0,
	type:'fileUploaderEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
//		var renderType = fieldMeta.renderType||'generate';
//		fieldMeta.renderType = 'rela';
		
		var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
			id: '_form_field_file_'+(++LUI.Form.Field.File.uniqueId),
			type:LUI.Form.Field.File.type,
			enable:function(){
				//按钮不可点击
				this.enabled = true;
				//
				if(!this.isValid){
					this.markInvalid();
				}
//				this.inputEl.removeClass('nim-field-disabled');
//				this.inputEl.removeAttr('disabled');
			},
			disable:function(){
				//按钮可点击
				this.enabled = false;
				//
				if(!this.isValid){
					//disable状态下 不显示数据是否有效
					this.clearInvalid();
				}
//				this.inputEl.addClass('nim-field-disabled');
//				this.inputEl.attr('disabled','true');
			},
			formatRawValue:function(dataVal){
				return (dataVal==null || dataVal.shangChuanWJM==null )?'':(dataVal.shangChuanWJM);
			},
			displayRawValue:function (){
				if(this.inputEl!=null && this.inputEl.val() != this.rawValue){
					//将显示值 重新显示到页面
					this.inputEl.val(this.rawValue);
				}
			},
			render:function(){
				if(this.renderType != 'none'){
					if(this.createFieldEl(LUI.Template.Field.fileUpload)){
						var contextThis = this;
						this.inputEl
							.focus(function(){
								contextThis.handler[0].focus();
							});
							
						this.fieldWidth = this.inputEl.width();
						this.resize(this.fieldWidth);
						
						var fieldInputEl = this.inputEl;
						//点击上传文件
						this.handler = this.el.find('img#_handler').first();
						this.handler.click(function(){
							if(contextThis.enabled){
								if(contextThis.getValue()!=null){
									contextThis.setValue(null);
								}else{
									LUI.Util.uploadFile({
										context:this,
										multiple:false
									},function(data){
										if(data!=null && data.length >0){
											var fuJian = data[0];
//											fieldInputEl.val(fuJian.shangChuanWJM);
											contextThis.setValue(fuJian);
										}
									});
								}
							}
							
						});
						
						//将自定义onchange方法 绑定到当前对象的change事件
						if(this.onChangeFunction!=null){
							this.addListener(this.events.change,this._observer,this.onChangeFunction);
						}
						
						this.addListener(this.events.change,this._observer,function(eventSource,eventTarget,event,eventOriginal){
							if(contextThis.getValue()!=null){
								contextThis.handler.attr('src','resources/plateformlight-ui/images/file-uoload-remove.gif').attr( "title", "删除" );
							}else{
								contextThis.handler.attr('src','resources/plateformlight-ui/images/file-upload-icon.gif').attr( "title", "上传" );
							}
							if(contextThis.onChangeFunction!=null){
								contextThis.onChangeFunction.apply(eventTarget,[eventSource,eventTarget,event,eventOriginal]);
							}
						});
						this.rendered = true;
						//原值要重新显示出来
						this.displayRawValue();
					}
				}
				//对象类型的字段 校验字段值
				this.validate(this.value);
			},
			resize:function(fieldWidth){
				//将录入元素的外层大小 限制为定义的宽度
				this.inputEl.outerWidth(fieldWidth -30);
			},
			setValue:function (newVal,silence,isInitial,originSource){
				var oldVal = this.value;
				//如果值有变化
				if(!this.equalsValue(this.value,newVal)){
					//如果校验通过
					var newRawValue = '';
					if(this.validate(newVal)){
						//记录字段值
						this.value = newVal;
						//校验通过后 重新格式化显示值
						newRawValue = this.formatRawValue(newVal);
					}else{
						//字段值 = null
						this.value = null;
					}
					
					//显示值有变化 
					if(!this.equalsRawValue(this.rawValue,newRawValue)){
						//保存显示值并重新显示
						this.rawValue =newRawValue;
						if(this.rendered ){
							this.displayRawValue();
						}
					}
					
					
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
			validate:function(dataValue){
				var oldValid = this.isValid;
				//附件类型的字段 只校验字段值 是否允许为空
				this.isValid = true;
				//默认只检查 是否允许为空
				if((dataValue == null || dataValue.fuJianDM==null)&& !this.allowBlank){
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
				
				//var oldValid = this.isValid;
				if( oldValid!= this.isValid){
					this.fireEvent(this.events.validChange,{oldValue:oldValid,newValue:this.isValid});
				}
				return this.isValid;
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
					this.el.addClass('ui-resizable-border');
					var _this = this;
					this.el.inputResizable({
						helper: "ui-resizable-helper",
						cancel: ".cancel",
						stop: function( event, ui ) {
							if(_this.designNode!=null){
								//inputEl的新宽度
								_this.inputEl.width(ui.size.width -32);
								//设置字段的width height参数
								_this.designNode.record.setFieldValue('width',(ui.size.width -2)+"px");
//								_this.designNode.record.setFieldValue('height',ui.size.height+"px");
							}
						}
					});
				}else{
					this.el.removeClass('ui-resizable-border');
					var as = this.el.inputResizable( "instance" );
					if(as!=null){
						this.el.inputResizable( "destroy" );
					}
				}
			}
		});
		return field;
	}
};

