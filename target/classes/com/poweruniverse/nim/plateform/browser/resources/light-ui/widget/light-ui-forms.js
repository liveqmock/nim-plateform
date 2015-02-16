	

LUI.Form = {
	uniqueId:0,
	instances:LUI.Set.createNew(),
	createNew:function(formCfg,noDatasource){
		//检查参数
		if(formCfg.name==null){
			LUI.Message.error('创建表单失败','必须提供name参数！');
			return null;
		}
		
		if(LUI.Form.instances.contains(formCfg.name)){
			LUI.Message.error('创建表单失败','同名表单('+formCfg.name+')已存在！');
			return null;
		}
		
		var fieldsCfg = formCfg.fields||[];
		delete formCfg.fields;
		
		var buttonsCfg = formCfg.buttons||[];
		delete formCfg.buttons;
		
		if(formCfg.renderto == null){
			formCfg.renderto = "#"+formCfg.name;
		}
		
		var datasource = null;
		if(!noDatasource){
			if(formCfg.datasourceName==null){
				LUI.Message.error('创建表单失败',"表单"+formCfg.name+"未提供datasourceName参数,不能自动加载！");
				return null;
			}else{
				datasource = LUI.Datasource.getInstance(formCfg.datasourceName);
				if(datasource == null){
					LUI.Message.info("创建表单失败","表单"+formCfg.name+"指定的数据源"+formCfg.datasourceName+"不存在!");
					return null;
				}
			}
		}
		
		//记录第一行内容 作为迭代的模板
		var formTargetEl = $(formCfg.renderto);
		var formTargetElContent = $("<p>").append(formTargetEl.clone()).html();
		
		//预处理(参数)
		var cFormCfg = $.extend({
			id:'_form_'+ (++LUI.Form.uniqueId),
			name:null,
			autoRender:false,
			fields:[],
			datasource:datasource,
			xiTongDH:null,
			gongNengDH:null,
			caoZuoDH:null,
			renderType:'append',
			formTargetElContent:formTargetElContent,
			addField:function(lui_field){
				for(var i=0;i<this.fields.length;i++){
					var eField = this.fields[i];
					if(eField.name ==lui_field.name ){
						LUI.Message.info("错误","表单'"+this.formName+"'中已存在名称为'"+lui_field.name+"'的字段!");
						return;
					}
				}
				this.fields[this.fields.length] = lui_field;
			},
			buttons:[],
			addButton:function(lui_button){
				for(var i=0;i<this.buttons.length;i++){
					var button = this.buttons[i];
					if(button.name ==lui_button.name ){
						LUI.Message.info("错误","表单'"+this.formName+"'中已存在名称为'"+lui_button.name+"'的按钮!");
						return;
					}
				}
				this.buttons[this.buttons.length] = lui_button;
			},
			getAllFields:function(){
				return this.fields;
			},
			hasField:function(name){
				var hasField = false;
				for(var i=0;i<this.fields.length;i++){
					if(this.fields[i].name == name){
						hasField = true;
						break;
					}
				}
				return hasField;
			},
			getField:function(name,notWarn){
				var field = null;
				for(var i=0;i<this.fields.length;i++){
					if(this.fields[i].name == name){
						field = this.fields[i];
						break;
					}
				}
				if(field == null && !notWarn){
					LUI.Message.info("取字段失败","字段'"+name+"'不存在!");
				}
				return field;
			},
			setFieldValue:function(name,value){
				var field = this.getField(name);
				if(field == null){
					LUI.Message.info("设置字段值失败","字段'"+name+"'不存在!");
				}else{
					field.setValue(value);
				}
			},
			getFieldValue:function(name){
				var field = this.getField(name);
				if(field == null){
					LUI.Message.info("取字段值失败","字段'"+name+"'不存在!");
					return null;
				}

				return field.getValue();
			},
			//从数据源中 加最新数据
			loaded:false,
			record:null,
			load:function(){
				
				if(!this.datasource.loaded){
					LUI.Message.info("加载数据失败","请监听数据源的onload事件，为表单加载数据!");
					return;
				}else if(this.datasource.size()==0){
					LUI.Message.info("加载数据失败","数据源的记录数为0!");
					return;
				}
				
				//如果表单已经rendered 将数据显示到页面元素中
				this.loaded = true;
				if(this.binded == true){
					this.deBindRecord();
				}
				this.record = this.datasource.getRecord(0);
				this.bindRecord();
				
			},
			//加载数据记录 并通过对双方的监听 建立关联
			binded:false,
			bindRecord:function(record){
				if(record!=null){
					this.record = record;
				}
				//从数据源中 取得第一条数据记录
				for(var i=0;i<this.fields.length;i++){
					var field = this.fields[i];
					
					if((field.fieldType=='string') && (field.maxLength == null || field.maxLength.length == 0)){
						var fieldDef = this.record.getFieldDefine(field.name);
						field.maxLength = ""+parseInt(fieldDef.fieldLength /2);
					}
					
					var v = this.record.getFieldValue(field.name);
					if(v!=null && (field.fieldType =='object' || field.fieldType =='set' ) ){
						v = v.getData();
					}
					//初始化值的时候
					field.setValue(v,true,true,this.record);
					
					//控件与数据之间的监听
					if(field.fieldType =='set'){
						//集合类型的字段 监听 增、删、改事件
						var rs = this.record.getFieldValue(field.name);//肯定不为空
						//1、field监听recordSet的变化 不继续发出事件
						rs.addListener(rs.events.add,field,function(sRecordSet,tField,event,eventOrigin){
							tField._onAdd(event.params.record,true,eventOrigin||sRecordSet);
						});
						rs.addListener(rs.events.remove,field,function(sRecordSet,tField,event,eventOrigin){
							tField._onRemove(event.params.record,true,eventOrigin||sRecordSet);
						});
						rs.addListener(rs.events.change,field,function(sRecordSet,tField,event,eventOrigin){
							tField._onChange(event.params.record,true,eventOrigin||sRecordSet);
						});
					}else{
						//其他类型 监听change事件即可
						//1、record监听field的变化 修改自身的值
						if(field.events.change!=null){
							field.addListener(field.events.change,this.record,function(sField,tRecord,event,eventOrigin){
								tRecord.setFieldValue(sField.name,event.params.newValue,false,false,eventOrigin||sField);
							});
						}
						//2、field监听record的变化 修改field的值
						this.record.addListener(this.record.events.change,field,function(sRecord,tField,event,eventOrigin){
							if(event.params.fieldName == tField.name){
								var evtNewVal = sRecord.getFieldValue(tField.name);
								if(evtNewVal!=null && (tField.fieldType =='object' || tField.fieldType =='set' ) ){
									evtNewVal = evtNewVal.getData();
								}
								tField.setValue(evtNewVal,true,false,eventOrigin||sRecord);
							}
						});
					}
					
				}
				//初始化数据后 为字段触发一次change(isInitial=true)事件（因为关联的字段 是否隐藏等 都是在onchange事件中处理的）
				for(var i=0;i<this.fields.length;i++){
					var field = this.fields[i];
					field.fireEvent(field.events.change,{
						oldValue:null,
						newValue:field.getValue(),
						isInitial:true
					},this.record);
				}
				this.binded = true;
			},
			deBindRecord:function(){
				for(var i=0;i<this.fields.length;i++){
					var field = this.fields[i];
					//取消监听field的变化
					field.removeListener(field.events.change,this.record);
					//取消监听record的变化
					this.record.removeListener(this.record.events.change,field);
				}
				this.binded = false;
				this.record = null;
			},
			reset:function(){
				//表单重置 
				this.record.reset();
			},
			//加载自定义数据 相当于批量修改表单/记录中的数据
			loadData:function(data){
				//修改field中的值,通过监听修改关联的record
				for(var p in data){
					var field = this.getField(p);
					field.setValue(data[p],false,false,field);
				}
			},
			isValid:function(){
				//所有field都valid form就valid
				for(var j=0;j<this.fields.length;j++){
					if(!this.fields[j].isValid && !this.fields[j].hidden && this.fields[j].enabled){
						return false;
					}
				}
				return true;
			},
			getFirstInvalidField:function(){
				var field = null;
				//所有field都valid form就valid
				for(var j=0;j<this.fields.length;j++){
					if(!this.fields[j].isValid && !this.fields[j].hidden && this.fields[j].enabled){
						field = this.fields[j];
						break;
					}
				}
				return field;
			},
			rendered:false,
			//生成或绑定页面元素
			el:null,
			formEl:null,
			oldEl:null,
			render:function(forceFieldRender){
				if(!this.rendered){
					//根据构建类型 确定如何render
					if(this.renderType == 'append' ){
						//创建新的标题、form 放置到目标元素内部 
						this.el = $(LUI.Template.Form);
						this.formEl = this.el.find('.nim-form-el');
						this.el.appendTo($(this.renderto).first());
					}else if(this.renderType == 'insert' ){
						//创建新的form 放置到原有元素内部 
						this.el = $(LUI.Template.Form).find('.nim-form-el');
						this.formEl = this.el;
						this.el.appendTo($(this.renderto).first());
					}else if(this.renderType == 'replace'){
						//替换原有form
						this.oldEl = $(this.renderto).first();
						//在原有form元素后 插入新的 form元素
						this.el = $(LUI.Template.Form).find('.nim-form-el');
						this.formEl = this.el;
						this.oldEl.after(this.el);
						//删除原有form元素
						this.oldEl.remove();
					}else if(this.renderType == 'rela'){
						//关联原有form容器
//							this.el = oldEl;
//							this.formEl = this.el;
						this.el = $(this.renderto).first();
						this.formEl = this.el;
					}
					
					//通知未构建button按照预定义规则render 
					for(var i=0;i<this.buttons.length;i++){
						var button = this.buttons[i];
						if(!button.rendered ){
							button.render();
						}
					}
				}
				//通知未构建field按照预定义规则 render
				var setRelationOrNot = false;
				if(!this.name.startWith('_designer')){
					setRelationOrNot = true;
				}
				for(var i=0;i<this.fields.length;i++){
					var field = this.fields[i];
					if(!field.rendered || forceFieldRender ){
						field.render();
						
						//设计模式下 为字段和设计器建立关联
						if(setRelationOrNot){
							field.setRelationToHTML();
						}
					}
				}
				//生成后 如果需要自动加载且已加载完成 绑定加载的数据
				if(this.loaded == true && this.autoLoad == true && this.binded == false){
					this.bindRecord();
				}
				//
				this.rendered = true;
			},
			//撤销对页面元素的改变
			deRender:function(forceDeRender){
				//根据构建类型 确定如何deRender
				if(this.renderType == 'append' ){
					this.el.remove;
				}else if(this.renderType == 'insert' ){
					this.el.remove;
				}else if(this.renderType == 'replace'){
					//将保存的原有元素信息 放回原处
					this.el.after(this.oldEl);
					//删除新的input元素
					this.el.remove();
				}else if(this.renderType == 'rela'){
					
				}
				
				//通知未构建field按照预定义规则 render
				for(var i=0;i<this.fields.length;i++){
					var field = this.fields[i];
					if(field.rendered || forceDeRender ){
						field.deRender();
					}
				}
				//通知未构建button按照预定义规则render 
				for(var i=0;i<this.buttons.length;i++){
					var button = this.buttons[i];
					if(button.rendered || forceDeRender ){
						button.deRender();
					}
				}
				//
				this.rendered = false;
			},
			//彻底销毁form
			destroy:function(){
				if(this.rendered){
					this.deRender(true);
				}
				//取消与record的绑定
				this.deBindRecord();
				
				//通知未构建field按照预定义规则 render
				for(var i=0;i<this.fields.length;i++){
					var field = this.fields[i];
					field.destroy();
				}
				//通知未构建button按照预定义规则render 
				for(var i=0;i<this.buttons.length;i++){
					var button = this.buttons[i];
					button.destroy();
				}
				
				this.fields = [];
				this.buttons = [];
				this.datasource = null;
				
				this.removeAllListener();
				LUI.Form.instances.remove(this);
			}
		},formCfg);
		//创建form对象
		var lui_form = $.extend(LUI.Widget.createNew(),cFormCfg);
		if(LUI.Form.hasInstance(lui_form.name)){
			LUI.Message.warn('警告','同名表单控件(LUI.Form:'+lui_form.name+')已存在！');
		}
		LUI.Form.instances.put(lui_form);
		//为form添加字段信息
		for(var i=0;i<fieldsCfg.length;i++){
			var fieldFactory = LUI.FieldFactoryManager.getFieldFactory(fieldsCfg[i].type || fieldsCfg[i].fieldType,fieldsCfg[i].widget || fieldsCfg[i].component);
			
			if(fieldsCfg[i].renderto == null){
				fieldsCfg[i].renderto = '#'+fieldsCfg[i].name;
			}
			var field = fieldFactory.createNew(fieldsCfg[i],lui_form);
			if(field!=null){
				lui_form.addField(field);
			}
		}
		//为form添加按钮信息
		for(var i=0;i<buttonsCfg.length;i++){
			var buttonObj = LUI.Form.Button.createNew(buttonsCfg[i],lui_form);
			lui_form.addButton(buttonObj);
		}
		//是否生成并关联字段 按钮
		if(lui_form.autoRender){
			lui_form.render();
		}
		//是否自动取得数据 并将数据显示到字段中
		if(lui_form.autoLoad){
			
			lui_form.datasource.addListener(lui_form.datasource.events.load,lui_form,function(e_datasource,e_form,event,eventOrigin){
				if(e_datasource.size()>0){
					e_form.load();
				}
			});
		}
		
		return lui_form;
	},
	hasInstance:function(formName){
		var formInstance = null;
		for(var i =0;i<LUI.Form.instances.size();i++){
			var _instance = LUI.Form.instances.get(i);
			if(_instance.name == formName){
				return true;
			}
		}
		return false;
	},
	getInstance:function(formName){
		var formInstance = null;
		for(var i =0;i<LUI.Form.instances.size();i++){
			var _instance = LUI.Form.instances.get(i);
			if(_instance.name == formName){
				formInstance = _instance;
				break;
			}
		}
		return formInstance;
	},
	removeInstance:function(formName){
		for(var i =0;i<LUI.Form.instances.size();i++){
			var _instance = LUI.Form.instances.get(i);
			if(_instance.name == formName){
				LUI.Form.instances.remove(_instance);
				break;
			}
		}
		
	}
};


LUI.Form.Button = {
	uniqueId:0,
	createNew:function(btnCfg,lui_form){
		//检查参数
		if(btnCfg.name==null){
			LUI.Message.error('创建表单按钮失败','必须提供name参数！');
			return null;
		}
		if(btnCfg.renderto==null){
			LUI.Message.error('创建表单按钮失败','必须提供renderto参数！');
			return null;
		}
		
		var btnType = btnCfg.type;
		if(btnType==null){
			if(btnCfg.component == 'submitButton'){
				btnType = 'submit';
			}else if(btnCfg.component == 'resetButton'){
				btnType = 'reset';
			}else{
				btnType = 'custom';
			}
		}
		if(btnType == 'custom'){
			if(btnCfg.onClick == null){
				LUI.Message.error('创建表单自定义按钮失败','必须提供onClick参数！');
				return null;
			}
			
			var onClickFunc = window[btnCfg.onClick];
			if(onClickFunc==null){
				LUI.Message.error('创建表单自定义按钮失败','名称为('+btnCfg.onClick+')的onClick方法不存在！');
				return null;
			}
			btnCfg.onClickFunc = onClickFunc;
		}
		
		
		//预处理(参数)
		var cBtnCfg = $.extend({
			id:'_form_btn_'+ (++LUI.Form.Button.uniqueId),
			form:lui_form,
			renderto:null,
			renderType:'none',
			type:btnType,
			onClickFunc:null,
			submit:function(){
				if(this.form.isValid()){
					var xiTongDH = null;
					if(this.form.xiTongDH!=null){
						xiTongDH = this.form.xiTongDH;
					}
					var gongNengDH = null;
					if(this.form.gongNengDH!=null){
						gongNengDH = this.form.gongNengDH;
					}
					var caoZuoDH = null;
					if(this.form.caoZuoDH!=null){
						caoZuoDH = this.form.caoZuoDH;
					}
					
					this.form.datasource.save(xiTongDH,gongNengDH,caoZuoDH,true);
				}else{
					var invalidField = this.form.getFirstInvalidField();
					
					LUI.Message.error('表单验证不通过','字段('+invalidField.label+'):'+invalidField.validInfo,null,{
						callback:function(){
							if(invalidField.component =='setGridEditor' && (invalidField.value!=null && invalidField.value.length >0 && invalidField.grid!=null && invalidField.grid.rendered)){
								invalidField = invalidField.grid.getFirstInvalidField();
								invalidField.focus();
							}
						}
					});
					
//						LUI.Message.error('提示','表单中有未检查通过的字段，请修改后重试！');
					return ;
				}
			},
			reset:function(){
				this.form.reset();
//					this.form.datasource.reset();
			},
			//生成或绑定页面元素
			el:null,
			oldEl:null,
			rendered:false,
			render:function(forceRender){
				if(this.renderType != 'none' ){
					//根据构建类型 确定如何render此按钮
					if(this.renderType == 'append' || this.renderType == 'insert' ){
//							//创建新的按钮元素 放置到form元素内部 
//							this.el = $(LUI.Template.FormButton);
//							this.el.appendTo(this.form.formEl);
//						}else if(this.renderType == 'insert' ){
						//创建新的按钮元素 放置到原有元素内部 
						this.el = $(LUI.Template.FormButton);
						this.el.appendTo($(lui_form.renderto + " " +this.renderto).first());
					}else if(this.renderType == 'replace'){
						//替换
						this.oldEl = $(lui_form.renderto + " " +this.renderto).first();
						//在原有元素后 插入新的按钮元素
						this.el = $(LUI.Template.FormButton);
						this.oldEl.after(this.el);
						//删除原有按钮元素
						this.oldEl.remove();
					}else if(this.renderType == 'rela'){
						this.el = $(this.form.renderto +' ' +this.renderto).first();
					}
					
					//与页面元素建立关联
					var _this = this;
					if(this.type == 'submit'){
						this.el.click(function(){
							_this.submit();
						});
					}else if(this.type == 'reset'){
						this.el.click(function(){
							_this.reset();
						});
//							this.el.bind('click',this.reset);
					}else{
						this.el.click(function(){
							_this.onClickFunc();
						});
//							this.el.bind('click',this.onClickFunc);
					}
					this.rendered = true;
				}
			},
			//撤销对页面元素的改变
			deRender:function(forceDeRender){
				//根据构建类型 确定如何derender此按钮
				if(this.renderType == 'append'){
					//删除新的按钮元素
					this.el.remove();
				}else if(this.renderType == 'insert'){
					//删除新的按钮元素
					this.el.remove();
				}else if(this.renderType == 'replace'){
					//将保存的原有元素信息 放回原处
					this.el.after(this.oldEl);
					//删除新的按钮元素
					this.el.remove();
				}else if(this.renderType == 'rela'){
					
				}
				
				//与页面元素取消关联
				if(this.type == 'submit'){
					this.el.unbind('click',this.submit);
				}else if(this.type == 'reset'){
					this.el.unbind('click',this.reset);
				}else{
					this.el.unbind('click',this.onClickFunc);
				}
				this.el = null;
				this.rendered = false;
			},
			//彻底销毁buttom
			destroy:function(){
				if(this.rendered){
					this.deRender(true);
				}
				this.removeAllListener();
				
				$(this.renderto).children().remove();
			}
		},btnCfg);
		//创建form对象
		var lui_btn = $.extend(LUI.Widget.createNew(),cBtnCfg);
		return lui_btn;
	}
};

	
///////////////////////////////////////////////////////////////////
LUI.SearchDatasourceForm = {
		uniqueId:0,
		instances:LUI.Set.createNew(),
		createNew:function(config){
			//检查参数
			if(config.filters==null){
				LUI.Message.info("错误","必须为查询表单"+config.label+":"+config.name+"提供filters参数!");
				return null;
			}
			
			if(config.datasourceName==null){
				LUI.Message.info("错误","必须为查询表单"+config.label+":"+config.name+"提供datasourceName参数!");
				return null;
			}
			var dataset = LUI.Datasource.getInstance(config.datasourceName);
			if(dataset == null){
				LUI.Message.info("错误","未找到查询表单"+name+"的数据源"+config.datasourceName+"!");
				return null;
			}
			//将filter转换为field (searchFieldFilter类型的 字段查询条件)
			var fields = [];
			if(config.filters !=null){
				for(var i=0;i<config.filters.length;i++){
					if(config.filters[i].component == 'searchFieldFilter'){
						fields[fields.length] = {
							name:config.filters[i].name,
							label:config.filters[i].label,
							fieldType:config.filters[i].fieldType,
							renderType:config.filters[i].renderType,
							renderto:config.filters[i].renderto
						}
					}
				}
				config.fields = fields;
			}
			
			//
			var formInstance = $.extend(LUI.Form.createNew(config),{
				id:'_searchDatasourceForm_'+ (++LUI.SearchDatasourceForm.uniqueId),
				dataset:dataset,
				filters:config.filters||[],
				removeAllFilters:function(){
					this.filters = [];
				},
				removeFilter:function(fieldName){
					for(var i=0;i<this.filters.length;i++){
						if(this.filters[i].name == fieldName){
							this.filters.splice(i,1);
							break;
						}
					}
				},
				addFilter:function(fieldName,operator,value,assist){
					this.filters[this.filters.length] = {
						name:fieldName,
						operator:operator||'eq',
						value:value,
						assist:assist
					}
				},
//					setValue:function(fieldName,value){
//						var fieldExists = false;
//						for(var i=0;i<this.filters.length;i++){
//							if(this.filters[i].name == fieldName){
//								this.filters[i].value = value;
//								fieldExists = true;
//								break;
//							}
//						}
//						if(!fieldExists){
//							LUI.Message.warn('设置查询参数失败','字段('+fieldName+')不存在！');
//						}
//					},
				submit:function(){
					if(this.events!=null ){
						var beforeSearchFunction = null;
						var beforeSearchFunctionName = this.listenerDefs.beforeSearch;
						if(beforeSearchFunctionName!=null){
							beforeSearchFunction = window[beforeSearchFunctionName];
							
							if(beforeSearchFunction==null){
								LUI.Message.warn('查询失败','事件beforeSearch的处理函数('+beforeSearchFunctionName+')不存在！');
								return ;
							}
							
							var callRet = beforeSearchFunction.call(this);
							if(!callRet){
								return;
							}
						}
					}
					var cfilters = [];
					for(var i=0;i<this.filters.length;i++){
						if(this.filters[i].value != null && this.filters[i].value != ''){
							cfilters[cfilters.length] = {
								property:this.filters[i].name,
								operator:this.filters[i].operator||'eq',
								value:this.filters[i].value,
								assist:this.filters[i].assist||''
							};
						}
					}
					dataset.load({filters:cfilters});
				}
			});
			//监听field的变化
			for(var i=0;i<formInstance.fields.length;i++){
				var field = formInstance.fields[i];
				
				field.addListener(field.events.change,formInstance,function(source,target,event){
					//监听field的变化 将新值保存到filter的value中
					for(var i=0;i<formInstance.filters.length;i++){
						if(formInstance.filters[i].name == source.name ){
							formInstance.filters[i].value = source.getValue();
							break;
						}
					}
				});
			}
			//为buttons添加点击事件
			if(config.renderto!=null){
				for(var i=0;i<formInstance.buttons.length;i++){
					var button = formInstance.buttons[i];
					if(button.renderto !=null){
						if(button.type =='submit'){
							//提交
							$(config.renderto+' '+button.renderto).click(function(){
								formInstance.submit();
							});
						}else{
							//重置
							$(config.renderto+' '+button.renderto).click(function(){
								formInstance.filters = formInstance.config.filters;
							});
						}
					}
				}
			}
			
			//登记此form
			if(LUI.SearchDatasourceForm.hasInstance(formInstance.name)){
				LUI.Message.warn('警告','同名查询表单控件(LUI.SearchDatasourceForm:'+formInstance.name+')已存在！');
			}
			LUI.SearchDatasourceForm.instances.put(formInstance);
			return formInstance;
		},
		hasInstance:function(formName){
			var formInstance = null;
			for(var i =0;i<LUI.SearchDatasourceForm.instances.size();i++){
				var _instance = LUI.SearchDatasourceForm.instances.get(i);
				if(_instance.name == formName){
					return true;
				}
			}
			return false;
		},
		getInstance:function(formName){
			var formInstance = null;
			for(var i =0;i<LUI.SearchDatasourceForm.instances.size();i++){
				var _instance = LUI.SearchDatasourceForm.instances.get(i);
				if(_instance.name == formName){
					formInstance = _instance;
					break;
				}
			}
			return formInstance;
		}
	};

LUI.SearchPageForm = {
		uniqueId:0,
		instances:LUI.Set.createNew(),
		createNew:function(config){
			//检查参数
			if(config.filters==null){
				LUI.Message.info("错误","必须为查询表单"+config.label+":"+config.name+"提供filters参数!");
				return null;
			}
			
			//检查参数
			if(config.target==null){
				LUI.Message.info("错误","必须为查询表单"+config.label+":"+config.name+"提供target参数!");
				return null;
			}
			
			var fields = [];
			if(config.filters !=null){
				for(var i=0;i<config.filters.length;i++){
					if(config.filters[i].component == 'searchFieldFilter'){
						fields[fields.length] = {
							name:config.filters[i].name,
							label:config.filters[i].label,
							fieldType:config.filters[i].fieldType,
							renderType:config.filters[i].renderType,
							renderto:config.filters[i].renderto
						}
					}
				}
				config.fields = fields;
			}
			
			//
			var formInstance = $.extend(LUI.Form.createNew(config,true),{
				id:'_searchPageForm_'+ (++LUI.SearchPageForm.uniqueId),
				filters:config.filters||[],
				removeAllFilters:function(){
					this.filters = [];
				},
				removeFilter:function(fieldName){
					for(var i=0;i<this.filters.length;i++){
						if(this.filters[i].name == fieldName){
							this.filters.splice(i,1);
							break;
						}
					}
				},
				addFilter:function(fieldName,operator,value,assist){
					this.filters[this.filters.length] = {
						name:fieldName,
						operator:operator||'eq',
						value:value,
						assist:assist
					}
				},
				setValue:function(fieldName,value){
					var fieldExists = false;
					for(var i=0;i<this.filters.length;i++){
						if(this.filters[i].name == fieldName){
							this.filters[i].value = value;
							fieldExists = true;
							break;
						}
					}
					if(!fieldExists){
						LUI.Message.warn('设置查询参数失败','字段('+fieldName+')不存在！');
					}
				},
				submit:function(){
					if(this.events!=null ){
						var beforeSearchFunction = null;
						var beforeSearchFunctionName = this.listenerDefs.beforeSearch;
						if(beforeSearchFunctionName!=null){
							beforeSearchFunction = window[beforeSearchFunctionName];
							
							if(beforeSearchFunction==null){
								LUI.Message.warn('查询失败','事件beforeSearch的处理函数('+beforeSearchFunctionName+')不存在！');
								return ;
							}
							
							var callRet = beforeSearchFunction.call(this);
							if(!callRet){
								return;
							}
						}
					}
					var cfilters = [];
					for(var i=0;i<this.filters.length;i++){
						if(this.filters[i].value != null && this.filters[i].value != ''){
							var cfilter = {
								property:this.filters[i].name,
								operator:this.filters[i].operator||'eq',
								value:this.filters[i].value
							};
							if(this.filters[i].assist!=null && this.filters[i].assist.length >0){
								cfilter.assist = this.filters[i].assist;
							}
							cfilters[cfilters.length] = cfilter;
						}
					}
					//拼在url里 打开新页面 
					var pageUrl = this.target + "&_ps_={params:"+ $.toJSON(cfilters)+"}";
					window.open(pageUrl);
				}
			});
			
			//监听field的变化
			for(var i=0;i<formInstance.fields.length;i++){
				var field = formInstance.fields[i];
				
				field.addListener(field.events.change,formInstance,function(source,target,event){
					//监听field的变化 将新值保存到filter的value中
					for(var i=0;i<formInstance.filters.length;i++){
						if(formInstance.filters[i].name == source.name ){
							formInstance.filters[i].value = source.getValue();
							break;
						}
					}
				});
			}
			//为buttons添加点击事件
			if(config.renderto!=null){
				for(var i=0;i<formInstance.buttons.length;i++){
					var button = formInstance.buttons[i];
					if(button.renderto !=null){
						if(button.type =='submit'){
							//提交
							$(config.renderto+' '+button.renderto).click(function(){
								formInstance.submit();
							});
						}else{
							//重置
							$(config.renderto+' '+button.renderto).click(function(){
								formInstance.filters = formInstance.config.filters;
							});
						}
					}
				}
			}
			formInstance.render();
			//登记此form
			if(LUI.SearchPageForm.hasInstance(formInstance.name)){
				LUI.Message.warn('警告','同名查询表单控件(LUI.SearchPageForm:'+formInstance.name+')已存在！');
			}
			LUI.SearchPageForm.instances.put(formInstance);
			return formInstance;
		},
		hasInstance:function(formName){
			var formInstance = null;
			for(var i =0;i<LUI.SearchPageForm.instances.size();i++){
				var _instance = LUI.SearchPageForm.instances.get(i);
				if(_instance.name == formName){
					return true;
				}
			}
			return false;
		},
		getInstance:function(formName){
			var formInstance = null;
			for(var i =0;i<LUI.SearchPageForm.instances.size();i++){
				var _instance = LUI.SearchPageForm.instances.get(i);
				if(_instance.name == formName){
					formInstance = _instance;
					break;
				}
			}
			return formInstance;
		}
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
LUI.DisplayForm = {
	createNew:function(formCfg,noDatasource){
		//检查参数
		if(formCfg.name==null){
			LUI.Message.error('创建表单失败','必须提供name参数！');
			return null;
		}
		
		if(LUI.Form.instances.contains(formCfg.name)){
			LUI.Message.error('创建表单失败','同名表单('+formCfg.name+')已存在！');
			return null;
		}
		
		var fieldsCfg = formCfg.fields||[];
		delete formCfg.fields;
		
		if(formCfg.renderto == null){
			formCfg.renderto = "#"+formCfg.name;
		}
		
		var datasource = null;
		if(!noDatasource){
			if(formCfg.datasourceName==null){
				LUI.Message.error('创建表单失败',"表单"+formCfg.name+"未提供datasourceName参数,不能自动加载！");
				return null;
			}else{
				datasource = LUI.Datasource.getInstance(formCfg.datasourceName);
				if(datasource == null){
					LUI.Message.info("创建表单失败","表单"+formCfg.name+"指定的数据源"+formCfg.datasourceName+"不存在!");
					return null;
				}
			}
		}
		
		//记录第一行内容 作为迭代的模板
		var formTargetEl = $(formCfg.renderto);
		var formTargetElContent = $("<p>").append(formTargetEl.clone()).html();
		
		//预处理(参数)
		var cFormCfg = $.extend({
			id:'_form_'+ (++LUI.Form.uniqueId),
			name:null,
			fields:[],
			datasource:datasource,
			xiTongDH:null,
			gongNengDH:null,
			caoZuoDH:null,
			renderType:'append',
			formTargetElContent:formTargetElContent,
			addField:function(lui_field){
				for(var i=0;i<this.fields.length;i++){
					var eField = this.fields[i];
//					if(eField.name ==lui_field.name ){
//						LUI.Message.info("错误","表单'"+this.formName+"'中已存在名称为'"+lui_field.name+"'的字段!");
//						return;
//					}
				}
				this.fields[this.fields.length] = lui_field;
			},
			getAllFields:function(){
				return this.fields;
			},
			hasField:function(name){
				var hasField = false;
				for(var i=0;i<this.fields.length;i++){
					if(this.fields[i].name == name){
						hasField = true;
						break;
					}
				}
				return hasField;
			},
			getField:function(name,notWarn){
				var field = null;
				for(var i=0;i<this.fields.length;i++){
					if(this.fields[i].name == name){
						field = this.fields[i];
						break;
					}
				}
				if(field == null && !notWarn){
					LUI.Message.info("取字段失败","字段'"+name+"'不存在!");
				}
				return field;
			},
			getFieldValue:function(name){
				var field = this.getField(name);
				if(field == null){
					LUI.Message.info("取字段值失败","字段'"+name+"'不存在!");
					return null;
				}

				return field.getValue();
			},
			//从数据源中 加最新数据
			loaded:false,
			record:null,
			load:function(){
				
				if(!this.datasource.loaded){
					LUI.Message.info("加载数据失败","请监听数据源的onload事件，为表单加载数据!");
					return;
				}else if(this.datasource.size()==0){
					LUI.Message.info("加载数据失败","数据源的记录数为0!");
					return;
				}
				
				//如果表单已经rendered 将数据显示到页面元素中
				this.loaded = true;
				if(this.binded == true){
					this.deBindRecord();
				}
				this.record = this.datasource.getRecord(0);
				this.bindRecord();
				
			},
			//加载数据记录 并通过对双方的监听 建立关联
			binded:false,
			bindRecord:function(record){
				if(record!=null){
					this.record = record;
				}
				//从数据源中 取得第一条数据记录
				for(var i=0;i<this.fields.length;i++){
					var field = this.fields[i];
					
					if(this.record.hasField(field.name)){
						//检查下 因为表单中的字段名有可能不是真实的字段
						var fieldDef = this.record.getFieldDefine(field.name);
						
						if(fieldDef.fieldType!=field.fieldType){
							LUI.Message.warn('绑定数据失败','字段('+field.label+':'+field.name+')的类型('+field.fieldType+')不正确，应为('+fieldDef.fieldType+')！');
							console.error('错误:字段('+field.label+':'+field.name+')的类型('+field.fieldType+')不正确，应为('+fieldDef.fieldType+')！');
						}else{
							var v = this.record.getFieldValue(field.name);
							if(v!=null && (field.fieldType =='object' || field.fieldType =='set' ) ){
								v = v.getData();
							}
							//初始化值的时候
							field.setValue(v,true,true,this.record);
							
							//field监听record的变化 修改field的值
							this.record.addListener(this.record.events.change,field,function(sRecord,tField,event,eventOrigin){
								if(event.params.fieldName == tField.name){
									var evtNewVal = sRecord.getFieldValue(tField.name);
									if(evtNewVal!=null && (tField.fieldType =='object' || tField.fieldType =='set' ) ){
										evtNewVal = evtNewVal.getData();
									}
									tField.setValue(evtNewVal,true,false,eventOrigin||sRecord);
								}
							});
						}
					}else{
						LUI.Message.warn('绑定数据失败','数据源('+this.datasourceName+')中不存在('+field.label+':'+field.name+')字段！');
						console.error('错误:数据源('+this.datasourceName+')中不存在('+field.label+':'+field.name+')字段！');
					}
//					if((field.fieldType=='string') && (field.maxLength == null || field.maxLength.length == 0)){
//						//字符类型没有设置最大字符数的 需要按照数据定义 添加最大字符数设置
//						if(fieldDef!=null){
//							field.maxLength = ""+parseInt(fieldDef.fieldLength /2);
//						}
//					}
					
					
				}
				this.binded = true;
			},
			deBindRecord:function(){
				for(var i=0;i<this.fields.length;i++){
					var field = this.fields[i];
					//取消监听record的变化
					this.record.removeListener(this.record.events.change,field);
				}
				this.binded = false;
				this.record = null;
			},
			//加载自定义数据 相当于批量修改表单/记录中的数据
			loadData:function(data){
				//修改field中的值,通过监听修改关联的record
				for(var p in data){
					var field = this.getField(p);
					field.setValue(data[p],false,false,field);
				}
			},
			rendered:false,
			//生成或绑定页面元素
			el:null,
			formEl:null,
			oldEl:null,
			render:function(forceFieldRender){
				if(!this.rendered){
					//根据构建类型 确定如何render
					if(this.renderType == 'append' ){
						//创建新的标题、form 放置到目标元素内部 
						this.el = $(LUI.Template.Form);
						this.formEl = this.el.find('.nim-form-el');
						this.el.appendTo($(this.renderto).first());
					}else if(this.renderType == 'insert' ){
						//创建新的form 放置到原有元素内部 
						this.el = $(LUI.Template.Form).find('.nim-form-el');
						this.formEl = this.el;
						this.el.appendTo($(this.renderto).first());
					}else if(this.renderType == 'replace'){
						//替换原有form
						this.oldEl = $(this.renderto).first();
						//在原有form元素后 插入新的 form元素
						this.el = $(LUI.Template.Form).find('.nim-form-el');
						this.formEl = this.el;
						this.oldEl.after(this.el);
						//删除原有form元素
						this.oldEl.remove();
					}else if(this.renderType == 'rela'){
						//关联原有form容器
//							this.el = oldEl;
//							this.formEl = this.el;
						this.el = $(this.renderto).first();
						this.formEl = this.el;
					}
					
				}
				//通知未构建field按照预定义规则 render
				var setRelationOrNot = false;
				if(!this.name.startWith('_designer')){
					setRelationOrNot = true;
				}
				for(var i=0;i<this.fields.length;i++){
					var field = this.fields[i];
					if(!field.rendered || forceFieldRender ){
						field.render();
						
						//设计模式下 为字段和设计器建立关联
						if(setRelationOrNot){
							field.setRelationToHTML();
						}
					}
				}
				//生成后 如果需要自动加载且已加载完成 绑定加载的数据
				if(this.loaded == true && this.autoLoad == true && this.binded == false){
					this.bindRecord();
				}
				//
				this.rendered = true;
			},
			//撤销对页面元素的改变
			deRender:function(forceDeRender){
				//根据构建类型 确定如何deRender
				if(this.renderType == 'append' ){
					this.el.remove;
				}else if(this.renderType == 'insert' ){
					this.el.remove;
				}else if(this.renderType == 'replace'){
					//将保存的原有元素信息 放回原处
					this.el.after(this.oldEl);
					//删除新的input元素
					this.el.remove();
				}else if(this.renderType == 'rela'){
					
				}
				
				//通知未构建field按照预定义规则 render
				for(var i=0;i<this.fields.length;i++){
					var field = this.fields[i];
					if(field.rendered || forceDeRender ){
						field.deRender();
					}
				}
				//
				this.rendered = false;
			},
			//彻底销毁form
			destroy:function(){
				if(this.rendered){
					this.deRender(true);
				}
				//取消与record的绑定
				this.deBindRecord();
				
				//通知未构建field按照预定义规则 render
				for(var i=0;i<this.fields.length;i++){
					var field = this.fields[i];
					field.destroy();
				}
				
				this.fields = [];
				this.datasource = null;
				
				this.removeAllListener();
				LUI.Form.instances.remove(this);
			}
		},formCfg);
		//创建form对象
		var lui_form = $.extend(LUI.Widget.createNew(),cFormCfg);
		if(LUI.Form.hasInstance(lui_form.name)){
			LUI.Message.warn('警告','同名表单控件(LUI.Form:'+lui_form.name+')已存在！');
		}
		LUI.Form.instances.put(lui_form);
		//为form添加字段信息
		for(var i=0;i<fieldsCfg.length;i++){
			//兼容老代码
			var cmpName = fieldsCfg[i].component;
			if(cmpName == 'simpleField' || cmpName==null || cmpName.indexOf('Display') == -1){
				cmpName = fieldsCfg[i].fieldType+'Display';
			}
			//
			var fieldCmpType = fieldsCfg[i].type || fieldsCfg[i].fieldType;
			var fieldCmpName = fieldsCfg[i].widget || cmpName;
			var fieldFactory = LUI.FieldFactoryManager.getFieldFactory(fieldCmpType,fieldCmpName);
			if(fieldFactory==null){
				LUI.Message.warn('创建字段失败','字段('+fieldsCfg[i].label+':'+fieldsCfg[i].name+')未找到符合条件的控件设置('+fieldCmpType+':'+fieldCmpName+')！');
			}
			
			if(fieldsCfg[i].renderto == null){
				fieldsCfg[i].renderto = '#'+fieldsCfg[i].name;
			}
			var field = fieldFactory.createNew(fieldsCfg[i],lui_form);
			if(field!=null){
				lui_form.addField(field);
			}
		}
		//是否生成字段
		if(lui_form.autoRender){
			lui_form.render();
		}
		//是否自动取得数据 并将数据显示到字段中
		if(lui_form.autoLoad){
			lui_form.datasource.addListener(lui_form.datasource.events.load,lui_form,function(e_datasource,e_form,event,eventOrigin){
				if(e_datasource.size()>0){
					e_form.load();
				}
			});
		}
		
		return lui_form;
	}
};


LUI.WorkflowForm = {
	createNew:function(formCfg,noDatasource){
		//检查参数
		if(formCfg.name==null){
			LUI.Message.error('创建表单失败','必须提供name参数！');
			return null;
		}
		
		if(LUI.Form.instances.contains(formCfg.name)){
			LUI.Message.error('创建表单失败','同名表单('+formCfg.name+')已存在！');
			return null;
		}
		
		var fieldsCfg = formCfg.fields||[];
		delete formCfg.fields;
		
		var formsCfg = formCfg.forms||[];
		delete formCfg.forms;
		
		if(formCfg.renderto == null){
			formCfg.renderto = "#"+formCfg.name;
		}
		
		var datasource = null;
		if(!noDatasource){
			if(formCfg.datasourceName==null){
				LUI.Message.error('创建表单失败',"表单"+formCfg.name+"未提供datasourceName参数,不能自动加载！");
				return null;
			}else{
				datasource = LUI.Datasource.getInstance(formCfg.datasourceName);
				if(datasource == null){
					LUI.Message.info("创建表单失败","表单"+formCfg.name+"指定的数据源"+formCfg.datasourceName+"不存在!");
					return null;
				}
			}
		}
		
		//记录第一行内容 作为迭代的模板
		var formTargetEl = $(formCfg.renderto+' li:eq(0)');
		var formTargetElContent = $("<p>").append(formTargetEl.clone()).html();

		//预处理(参数)
		var cFormCfg = $.extend({
			id:'_form_'+ (++LUI.Form.uniqueId),
			fields:[],
			datasource:datasource,
			formTargetElContent:formTargetElContent,
			//从数据源中 加最新数据
			load:function(){
				
				if(!this.datasource.loaded){
					LUI.Message.info("加载数据失败","请监听数据源的onload事件，为表单加载数据!");
					return;
				}
				//将数据显示到页面元素中
				this.render();
			},
			rendered:false,
			//生成或绑定页面元素
			el:null,
			formEl:null,
			render:function(forceFieldRender){
				//用于默认字段显示的html内容
				var fieldTargetContent = $(this.formTargetElContent).find("ul li:eq(0)");
				var defaultFieldContent = $("<p>").append(fieldTargetContent.clone()).html();
				
				//删除所有的行 
				$(this.renderto+' li').remove();
				//重新显示流程列表
				var newLineEl = null;
				for(var i=0;i<this.datasource.size();i++){
					var rowRecord = this.datasource.getRecord(i);
					//检查是否存在特定的表单定义
					var caoZuoDH = rowRecord.getFieldValue('caoZuoDH');
					var caoZuoDHForm = null;
					if(this.forms!=null){
						for(var j=0;j<this.forms.length;j++){
							if(this.forms[j].caoZuoDH == caoZuoDH){
								caoZuoDHForm = this.forms[j];
								break;
							}
						}
					}
					//确定流程检视子表单的内容
					var formContent = null;
					if(caoZuoDHForm!=null){
						//用预定义的子表单 显示流程检视子表单
						formContent = $(caoZuoDHForm.formContent);
					}else{
						//准备一个空的表单 用于显示流程检视子表单
						formContent = $(this.formTargetElContent);
						formContent.find("ul li").remove();
					}
					//显示流程检视子表单 到最后部分
					if(newLineEl == null){
						newLineEl = formContent.appendTo($(this.renderto));
					}else{
						newLineEl = formContent.insertAfter(newLineEl);
					}
					newLineEl.attr('_row_index',i);
					newLineEl.attr('_record_id',rowRecord.id);
					//显示流程信息
					for(var j=0;j<this.fields.length;j++){
						var f = this.fields[j];
						var v = rowRecord.getFieldValue(f.name);
						if(v!=null && (f.fieldType =='object' || f.fieldType =='set' ) ){
							v = v.getData();
						}
						var displayValue = f.formatRawValue(v);
						
						var fieldEl = newLineEl.find(f.renderto);
						fieldEl.html(displayValue);
					}
					
					//显示流程字段信息
					
					//自定义流程子表单存在的情况下 先隐藏所有字段目标
					if(caoZuoDHForm!=null && caoZuoDHForm.hideNullValue == 'true'){
						for(var k=0;k<caoZuoDHForm.fields.length;k++){
							//隐藏表单目标元素的外层li
							var formFieldEl = newLineEl.find(caoZuoDHForm.fields[k].renderto);
							formFieldEl.closest('li').hide();
						}
					}
							
					var lcbls = rowRecord.getFieldValue('bls');
					for(var j=0;j<lcbls.length;j++){
						var lcblData = lcbls[j];
						if(caoZuoDHForm!=null){
							var lcblZDDH = lcblData.liuChengJSBLDH;
							//按照表单中的字段定义 显示字段内容
							var formField = null;
							for(var k=0;k<caoZuoDHForm.fields.length;k++){
								if(caoZuoDHForm.fields[k].name == lcblZDDH){
									formField = caoZuoDHForm.fields[k];
									break;
								}
							}
							
							var formFieldValue = lcblData.liuChengJSBLZ;
							if(formFieldValue!=null || caoZuoDHForm.hideNullValue == 'false'){
								//只处理不为空的字段 或子表单设置为显示空值==true
								if(formField!=null){
									var formFieldEl = newLineEl.find(formField.renderto);
									
									//显示字段内容
									if(formField.component == 'objectFileDisplay' ){
										var _rawValue =  '<span id="icon" class="nim-file-type-icon-16 "></span>' +
											'<a onclick="LUI.Util.downloadFile('+lcblData.liuChengJSBLZ+');" href="javascript:void(0);" class="" style="padding-left: 20px;vertical-align: middle;">'+lcblData.liuChengJSBLZXS+'</a>';
										formFieldEl.html(_rawValue);
									}else if(formFieldValue!=null && (formField.fieldType =='object' || formField.fieldType =='set' ) ){
										var formFieldDisplayValue = lcblData.liuChengJSBLZXS;
										formFieldEl.html(formFieldDisplayValue);
									}else{
										var formFieldDisplayValue = formField.formatRawValue(formFieldValue);
										formFieldEl.html(formFieldDisplayValue);
									}
									formFieldEl.closest('li').show();
								}else if(caoZuoDHForm.showUndefined == 'true'){
									//在当前流程子表单中 未找到流程检视变量对应的字段定义 但是设置为显示未定义字段
									//在目标表单中 插入新行 显示此字段
									var fieldEl = $(defaultFieldContent).appendTo(newLineEl.find('ul'));
									//显示字段内容
									fieldEl.find('.label').html(lcblData.liuChengJSBLMC+":");
									fieldEl.find('.field').html(lcblData.liuChengJSBLZXS);
								}
							}
						}else{
							//在默认目标表单中 插入字段所在行
							if(this.hideNullValue == 'false' || lcblData.liuChengJSBLZXS!=null){
								var fieldEl = $(defaultFieldContent).appendTo(newLineEl.find('ul'));
								//显示字段内容
								fieldEl.find('.label').html(lcblData.liuChengJSBLMC+":");
								fieldEl.find('.field').html(lcblData.liuChengJSBLZXS);
							}
							
						}
					}
					//点击展开/关闭
					newLineEl.find('#workflow_title').click(function(){
					   $(this).find('#workflow_switch').toggleClass('tc_up')
					   $(this).parent().parent().find('#workflow_content').stop().slideToggle('fast');
					})
					//
//					this.fireEvent(this.events.rowRendered,{
//						grid:this,
//						rowIndex:i,
//						rowEl:newLineEl,
//						rowData:rowData
//					});
				}
			
			}
		},formCfg);
		//创建form对象
		var lui_form = $.extend(LUI.Widget.createNew(),cFormCfg);
		if(LUI.Form.hasInstance(lui_form.name)){
			LUI.Message.warn('警告','同名表单控件(LUI.Form:'+lui_form.name+')已存在！');
		}
		LUI.Form.instances.put(lui_form);
		//为form添加字段信息
		for(var i=0;i<fieldsCfg.length;i++){
			//兼容老代码
			var cmpName = fieldsCfg[i].component;
			if(cmpName == 'simpleField'){
				cmpName = fieldsCfg[i].fieldType+'Display';
			}
			//
			var fieldFactory = LUI.FieldFactoryManager.getFieldFactory(fieldsCfg[i].type || fieldsCfg[i].fieldType,fieldsCfg[i].widget || cmpName);
			
			if(fieldsCfg[i].renderto == null){
				fieldsCfg[i].renderto = '#'+fieldsCfg[i].name;
			}
			var field = fieldFactory.createNew(fieldsCfg[i],lui_form);
			if(field!=null){
				lui_form.fields[lui_form.fields.length] = field;
			}
		}
		
		//为form添加子表单定义信息
		var subForms = [];
		if(formsCfg!=null){
			for(var i=0;i<formsCfg.length;i++){
				var subFormCfg = formsCfg[i];
				if(subFormCfg.hideNullValue==null){
					subFormCfg.hideNullValue == 'true';
				}
				if(subFormCfg.showUndefined==null){
					subFormCfg.showUndefined == 'true';
				}
				
				var subFormFields = subFormCfg.fields;
				delete subFormCfg.fields;
				var subFormfields = [];
				
				for(var j=0;j<subFormFields.length;j++){
					var fieldFactory = LUI.FieldFactoryManager.getFieldFactory(subFormFields[j].type || subFormFields[j].fieldType,subFormFields[j].widget || subFormFields[j].component);
					
					var subFormfield = fieldFactory.createNew(subFormFields[j],null);
					if(subFormfield!=null){
						subFormfields[subFormfields.length] = subFormfield;
					}
				}
				subFormCfg.fields = subFormfields;
				//子表单的目标元素内容
				var formContentEl = $(lui_form.renderto+' li'+subFormCfg.renderto);
				if(formContentEl.length ==0 ){
					console.error('错误:'+'页面中未找到子表单'+subFormCfg.label+':'+subFormCfg.name+'的目标元素'+subFormCfg.renderto+'！');
//					LUI.Message.warn('错误','页面中未找到表单'+subFormCfg.label+':'+subFormCfg.name+'的目标元素'+subFormCfg.renderto+'！');
				}else{
					subFormCfg.formContent = $("<p>").append(formContentEl.clone()).html();
					subForms[subForms.length] = subFormCfg;
				}
			}
		}
		lui_form.forms = subForms;
		
		//是否自动取得数据 并将数据显示到字段中
		if(lui_form.autoLoad){
			lui_form.datasource.addListener(lui_form.datasource.events.load,lui_form,function(e_datasource,e_form,event,eventOrigin){
				e_form.load();
			});
		}
		return lui_form;
	}
};

