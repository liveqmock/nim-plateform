
LUI.FieldFactoryManager = {
	types:LUI.Map.createNew(),
	getFieldFactory:function(type,component){
		var dataType = type;
		if(dataType==null || !dataType.endWith("Field") ){
			dataType = (dataType||'string')+"Field";
		}
		var fieldEditSet = LUI.FieldFactoryManager.types.get(dataType);
		if(fieldEditSet==null){
			LUI.Message.warn('创建编辑字段失败','编辑器类型('+dataType+')不存在！');
			console.error('错误:编辑器类型('+dataType+')不存在！');
			return null;
		}
		
		var widgetType = component||'default';
		var fieldFactory = fieldEditSet.get(widgetType);
		if(fieldFactory==null){
			LUI.Message.warn('创建编辑字段失败','编辑器('+dataType+'.'+widgetType+')不存在！');
			console.error('错误:编辑器('+dataType+'.'+widgetType+')不存在！');
		}
		return fieldFactory;
	},
	regsterFieldFactory:function(dataType,field_subclass,isDefault){
		if(field_subclass == null){
//			LUI.Message.warn('注册field失败','未提供字段对象！'+dataType);
			return null;
		}
		var dataTypeMap = LUI.FieldFactoryManager.types.get(dataType);
		if(dataTypeMap==null){
			dataTypeMap = LUI.Map.createNew();
			LUI.FieldFactoryManager.types.put(dataType,dataTypeMap); 
		}
		
		dataTypeMap.put(field_subclass.type,field_subclass);
		if(isDefault){
			dataTypeMap.put('default',field_subclass);
		}
	}
};

$(document).ready(function(){
	LUI.FieldFactoryManager.regsterFieldFactory('filesetField',LUI.Form.DisplayField.fileSetDisplay);//文件集合显示
	LUI.FieldFactoryManager.regsterFieldFactory('filesetField',LUI.Form.SetField.FilesetEditor,true);
	
	LUI.FieldFactoryManager.regsterFieldFactory('setField',LUI.Form.DisplayField.SetDisplay);//表格集合显示
	LUI.FieldFactoryManager.regsterFieldFactory('setField',LUI.Form.SetField.CheckboxEditor);
	LUI.FieldFactoryManager.regsterFieldFactory('setField',LUI.Form.SetField.GridEditor,true);

	LUI.FieldFactoryManager.regsterFieldFactory('dateField',LUI.Form.DisplayField.DateDisplay);
	LUI.FieldFactoryManager.regsterFieldFactory('dateField',LUI.Form.DisplayField.DateTimeDisplay);
	LUI.FieldFactoryManager.regsterFieldFactory('dateField',LUI.Form.DisplayField.TimeDisplay);
	LUI.FieldFactoryManager.regsterFieldFactory('dateField',LUI.Form.Field.Year);
	LUI.FieldFactoryManager.regsterFieldFactory('dateField',LUI.Form.Field.Month);
	LUI.FieldFactoryManager.regsterFieldFactory('dateField',LUI.Form.Field.Time);
	LUI.FieldFactoryManager.regsterFieldFactory('dateField',LUI.Form.Field.Date,true);

	LUI.FieldFactoryManager.regsterFieldFactory('fileField',LUI.Form.DisplayField.FileDisplay);//文件显示
	LUI.FieldFactoryManager.regsterFieldFactory('fileField',LUI.Form.Field.File,true);//文件

	LUI.FieldFactoryManager.regsterFieldFactory('objectField',LUI.Form.DisplayField.ObjectDisplay);//对象显示
//	LUI.FieldFactoryManager.regsterFieldFactory('objectField',LUI.Form.Field.ObjectRadioOther);//无线按钮选择+其它
//	LUI.FieldFactoryManager.regsterFieldFactory('objectField',LUI.Form.Field.ObjectPopup);//弹出式选择
	LUI.FieldFactoryManager.regsterFieldFactory('objectField',LUI.Form.Field.ObjectRadioEditor);//无线按钮选择
	LUI.FieldFactoryManager.regsterFieldFactory('objectField',LUI.Form.Field.ObjectSelectWithPage);//下拉选择 关联页面
	LUI.FieldFactoryManager.regsterFieldFactory('objectField',LUI.Form.Field.ObjectSelect,true);//下拉选择
	
	LUI.FieldFactoryManager.regsterFieldFactory('doubleField',LUI.Form.DisplayField.DoubleDisplay);
	LUI.FieldFactoryManager.regsterFieldFactory('doubleField',LUI.Form.Field.Money);//元
	LUI.FieldFactoryManager.regsterFieldFactory('doubleField',LUI.Form.Field.TenThousandMoney);//万元
	LUI.FieldFactoryManager.regsterFieldFactory('doubleField',LUI.Form.Field.RenMinB);//人民币元
	LUI.FieldFactoryManager.regsterFieldFactory('doubleField',LUI.Form.Field.TenThousandRenMinB);//人民币万元
	LUI.FieldFactoryManager.regsterFieldFactory('doubleField',LUI.Form.Field.Double,true);//小数

	LUI.FieldFactoryManager.regsterFieldFactory('intField',LUI.Form.DisplayField.IntDisplay);
	LUI.FieldFactoryManager.regsterFieldFactory('intField',LUI.Form.Field.Int,true);

	LUI.FieldFactoryManager.regsterFieldFactory('stringField',LUI.Form.DisplayField.StringDisplay);
	LUI.FieldFactoryManager.regsterFieldFactory('stringField',LUI.Form.Field.ChosenSelect);
	LUI.FieldFactoryManager.regsterFieldFactory('stringField',LUI.Form.Field.StringTriggerSelect);
	LUI.FieldFactoryManager.regsterFieldFactory('stringField',LUI.Form.Field.StringSelect);
//	LUI.FieldFactoryManager.regsterFieldFactory('stringField',LUI.Form.Field.StringPlusSelect);
	LUI.FieldFactoryManager.regsterFieldFactory('stringField',LUI.Form.Field.StringChooseEl);
	LUI.FieldFactoryManager.regsterFieldFactory('stringField',LUI.Form.Field.URLField);
	LUI.FieldFactoryManager.regsterFieldFactory('stringField',LUI.Form.Field.StringText);
	LUI.FieldFactoryManager.regsterFieldFactory('stringField',LUI.Form.Field.StringHTML);
	LUI.FieldFactoryManager.regsterFieldFactory('stringField',LUI.Form.Field.Password);
	LUI.FieldFactoryManager.regsterFieldFactory('stringField',LUI.Form.Field.Email);//邮箱
	LUI.FieldFactoryManager.regsterFieldFactory('stringField',LUI.Form.Field.MobileNumber);//手机号
	LUI.FieldFactoryManager.regsterFieldFactory('stringField',LUI.Form.Field.PostCode);//邮编
	LUI.FieldFactoryManager.regsterFieldFactory('stringField',LUI.Form.Field.String,true);

	
	LUI.FieldFactoryManager.regsterFieldFactory('textField',LUI.Form.DisplayField.TextDisplay);
	LUI.FieldFactoryManager.regsterFieldFactory('textField',LUI.Form.Field.EventScript);
	LUI.FieldFactoryManager.regsterFieldFactory('textField',LUI.Form.Field.HTMLArea);
	LUI.FieldFactoryManager.regsterFieldFactory('textField',LUI.Form.Field.Textarea,true);

	LUI.FieldFactoryManager.regsterFieldFactory('booleanField',LUI.Form.DisplayField.BooleanCheckDisplay);
	LUI.FieldFactoryManager.regsterFieldFactory('booleanField',LUI.Form.DisplayField.BooleanRadioDisplay);
	LUI.FieldFactoryManager.regsterFieldFactory('booleanField',LUI.Form.DisplayField.BooleanDisplay);
	LUI.FieldFactoryManager.regsterFieldFactory('booleanField',LUI.Form.Field.BooleanRadioEditor);
	LUI.FieldFactoryManager.regsterFieldFactory('booleanField',LUI.Form.Field.BooleanCheckEditor,true);


});




