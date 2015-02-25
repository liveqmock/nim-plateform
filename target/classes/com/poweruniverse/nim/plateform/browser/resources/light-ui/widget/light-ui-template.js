LUI.Template = {
	Form:'<div><span class="nim-form-title"></span><form class="form nim-form-el"></form></div>',
	FormButton:'<span class="nim-button" style="width:100px;">按钮</span>',
	Field:{
		displayField:
			'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
				'<table width="100%" style="table-layout:fixed;">'+
				'<tr>'+
					'<td width="90px">'+
						'<label class="nim-field-label" style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
					'</td>'+
					'<td width="*">'+
						'<span id="{{form.name}}_{{name}}" style="width:{{#if width}}{{width}}{{else}}220px{{/if}};" class="nim-field-wrapper field text ui-widget-content ui-corner-all nim-field-el"> </span>'+
					'</td>'+
			        '</tr>'+
			    '</table>'+
			'</span>',
		field:
			'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
				'<table width="100%" style="table-layout:fixed;">'+
				'<tr>'+
					'<td width="90px">'+
						'<label class="nim-field-label" style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
					'</td>'+
					'<td width="*">'+
						'<input type="text" id="{{form.name}}_{{name}}" {{#unless enabled}}disabled{{/unless}} style="width:{{#if width}}{{width}}{{else}}220px{{/if}};" class="nim-field-wrapper field text ui-widget-content ui-corner-all nim-field-el {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}">'+
					'</td>'+
			        '</tr>'+
			    '</table>'+
			'</span>',
		intField:
			'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
				'<table width="100%" style="table-layout:fixed;">'+
				'<tr>'+
					'<td width="90px">'+
						'<label class="nim-field-label" style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
					'</td>'+
					'<td width="*">'+
						'<input type="text" id="{{form.name}}_{{name}}" {{#unless enabled}}disabled{{/unless}} style="text-align:{{textAlign}};width:{{#if width}}{{width}}{{else}}220px{{/if}};" class="nim-field-wrapper field text ui-widget-content ui-corner-all nim-field-el {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}">'+
					'</td>'+
			        '</tr>'+
			    '</table>'+
			'</span>',
		doubleField:
			'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
				'<table width="100%" style="table-layout:fixed;">'+
				'<tr>'+
					'<td width="90px">'+
						'<label class="nim-field-label" style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
					'</td>'+
					'<td width="*">'+
						'<input type="text" id="{{form.name}}_{{name}}" {{#unless enabled}}disabled{{/unless}} style="text-align:{{textAlign}};width:{{#if width}}{{width}}{{else}}220px{{/if}};" class="nim-field-wrapper field text ui-widget-content ui-corner-all nim-field-el {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}">'+
					'</td>'+
			        '</tr>'+
			    '</table>'+
			'</span>',
		password:
			'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
				'<table width="100%" style="table-layout:fixed;">'+
				'<tr>'+
					'<td width="90px">'+
						'<label class="nim-field-label" style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
					'</td>'+
					'<td width="*">'+
						'<input type="password" id="{{form.name}}_{{name}}" {{#unless enabled}}disabled{{/unless}} style="width:{{#if width}}{{width}}{{else}}220px{{/if}};" class="nim-field-wrapper field text ui-widget-content ui-corner-all nim-field-el {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}">'+
					'</td>'+
			        '</tr>'+
			    '</table>'+
			'</span>',
		checkbox:
			'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
				'<table width="100%" style="table-layout:fixed;">'+
				'<tr>'+
					'<td width="90px">'+
						'<label class="nim-field-label" style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
					'</td>'+
					'<td width="*">'+
					'<input type="checkbox" id="{{form.name}}_{{name}}" {{#unless enabled}}disabled{{/unless}} style="width:14px;" class="nim-field-wrapper text ui-widget-content ui-corner-all nim-field-el {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}">'+
					'</td>'+
			        '</tr>'+
			    '</table>'+
			'</span>',
		select:
			'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
				'<table width="100%" style="table-layout:fixed;">'+
				'<tr>'+
					'<td width="90px">'+
						'<label style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
					'</td>'+
					'<td width="*" style="font-size: 1em important!;">'+
						'<select id="{{form.name}}_{{name}}" {{#unless enabled}}disabled{{/unless}} data-placeholder="请选择..." style="width:{{#if width}}{{width}}{{else}}220px{{/if}};" class="nim-field-wrapper nim-field-el {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}">'+
						'</select>'+
					'</td>'+
			        '</tr>'+
			    '</table>'+
			'</span>',
		chooseEl:
			'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
				'<table width="100%" style="table-layout:fixed;">'+
				'<tr>'+
					'<td width="90px">'+
						'<label style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
					'</td>'+
					'<td width="*" style="font-size: 1em important!;">'+
						'<span id="{{form.name}}_{{name}}_field_container" class="nim-field-wrapper" style="display:inline-block;width:{{#if width}}{{width}}{{else}}220px{{/if}};">'+
							'<input type="text" id="{{form.name}}_{{name}}" {{#unless enabled}}disabled{{/unless}} style="width:{{#if width}}{{width}}{{else}}220px{{/if}};" class=" text ui-widget-content ui-corner-all nim-field-el {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}" >'+
							'<img id="_handler" src="resources/plateform/light-ui/images/indicator.png" style="margin-left: 4px;vertical-align: middle;" title="拖动选择目标元素">'+
						'</span>'+
					'</td>'+
			        '</tr>'+
			    '</table>'+
			'</span>',
		urlEditor:
			'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
				'<table width="100%" style="table-layout:fixed;">'+
				'<tr>'+
					'<td width="90px">'+
						'<label style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
					'</td>'+
					'<td width="*" style="font-size: 1em important!;">'+
						'<span id="{{form.name}}_{{name}}_field_container" class="nim-field-wrapper" style="display:inline-block;width:{{#if width}}{{width}}{{else}}220px{{/if}};">'+
							'<input type="text" id="{{form.name}}_{{name}}" {{#unless enabled}}disabled{{/unless}} style="width:{{#if width}}{{width}}{{else}}220px{{/if}};" class=" text ui-widget-content ui-corner-all nim-field-el {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}" >'+
							'<img id="_explorer" src="resources/plateform/light-ui/images/file-upload-icon.gif" style="cursor:pointer;width:16px;height:16px;margin-left: 4px;vertical-align: middle;"  title="选择模板文件">'+
							'<img id="_handler" src="resources/plateform/light-ui/images/ie.png" style="cursor:pointer;width:16px;height:16px;margin-left: 4px;vertical-align: middle;"  title="在新窗口打开子页面">'+
						'</span>'+
					'</td>'+
			        '</tr>'+
			    '</table>'+
			'</span>',
			fileUpload:
				'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
					'<table width="100%" style="table-layout:fixed;">'+
					'<tr>'+
						'<td width="90px">'+
							'<label style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
						'</td>'+
						'<td width="*" style="font-size: 1em important!;">'+
							'<span id="{{form.name}}_{{name}}_field_container" class="nim-field-wrapper" style="display:inline-block;width: {{#if width}}{{width}}{{else}}100%{{/if}};" >'+
								'<input type="text" id="{{form.name}}_{{name}}" readonly style="width:{{#if width}}{{width}}{{else}}220px{{/if}};" class="text ui-widget-content ui-corner-all nim-field-el {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}" >'+
								'<img id="_handler" src="resources/plateform/light-ui/images/file-upload-icon.gif" style="margin-left: 4px;vertical-align: middle;cursor:pointer;">'+
							'</span>'+
						'</td>'+
				        '</tr>'+
				    '</table>'+
				'</span>',
			objectRadio:
				'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
					'<table width="100%" style="table-layout:fixed;">'+
					'<tr>'+
						'<td width="90px">'+
							'<label class="nim-field-label" style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
						'</td>'+
						'<td width="*">' +
							'<ul id="{{form.name}}_{{name}}" style="padding-left:0px;display:inline-block;width:{{#if width}}{{width}}{{else}}220px{{/if}};list-style: none outside none;" class="ui-corner-all nim-field-wrapper {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}">'+
								'<li style="float:left;margin-top: 0px;">'+
									'<input id="" type="radio"  style="width:14px;" class="nim-field-checkbox ">' +
									'<label id="" class="nim-field-checkbox-text" style="line-height: 19px;" for=""></label>'+
								'</li>' +
								'<div class="clear"></div>' +
							'</ul>' +
						'</td>'+
				        '</tr>'+
				    '</table>'+
				'</span>',
			textarea:
				'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
					'<table width="100%" style="table-layout:fixed;">'+
					'<tr>'+
						'<td width="90px">'+
							'<label style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
						'</td>'+
						'<td width="*" style="font-size: 1em important!;">'+
							'<span id="{{form.name}}_{{name}}_field_container" class="nim-field-wrapper" style="display:inline-block;width:{{#if width}}{{width}}{{else}}220px{{/if}};">'+
								'<textarea id="{{form.name}}_{{name}}" {{#unless enabled}}disabled{{/unless}} style="height:{{#if height}}{{height}}{{else}}50px{{/if}};width:{{#if width}}{{width}}{{else}}220px{{/if}};" title="{{info}}" class="ui-corner-all nim-field-el {{#unless isValid}}nim-field-invalid{{/unless}}">'+
								'</textarea>'+
								'<img title="编辑" id="_handler" src="resources/plateform/light-ui/images/icon-text.jpg" style="position: relative;margin-left: 4px;cursor:hand;cursor:pointer;">'+
							'</span>'+
						'</td>'+
				    '</tr>'+
				    '</table>'+
				'</span>',
			htmlArea:
				'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
					'<table width="100%" style="table-layout:fixed;">'+
					'<tr>'+
						'<td width="90px">'+
							'<label style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
						'</td>'+
						'<td width="*" style="font-size: 1em important!;">'+
							'<span id="{{form.name}}_{{name}}_field_container" class="nim-field-wrapper" style="display:inline-block;height:{{#if height}}{{height}}{{else}}100%{{/if}};width:{{#if width}}{{width}}{{else}}220px{{/if}};">'+
								'<textarea id="{{form.name}}_{{name}}" {{#unless enabled}}disabled{{/unless}} style="height:{{height}};width:{{#if width}}{{width}}{{else}}220px{{/if}};" class="nim-field-el {{#unless isValid}}nim-field-invalid{{/unless}}">'+
								'</textarea>'+
								'<img title="编辑" id="_handler" src="resources/plateform/light-ui/images/icon-text.jpg" style="margin-left: 4px;cursor:hand;cursor:pointer;">'+
							'</span>'+
						'</td>'+
				    '</tr>'+
				    '</table>'+
				'</span>',
			datepicker:
				'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
					'<table width="100%" style="table-layout:fixed;">'+
					'<tr>'+
						'<td width="90px">'+
							'<label style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
						'</td>'+
						'<td width="*" style="font-size: 1em important!;">'+
							'<span id="{{form.name}}_{{name}}_field_container" class="nim-field-wrapper" style="display:inline-block;width:{{#if width}}{{width}}{{else}}220px{{/if}};">'+
								'<input type="text" id="{{id}}{{name}}" {{#unless enabled }}disabled{{/unless}} style="width:{{#if width}}{{width}}{{else}}220px{{/if}};" class="text ui-widget-content ui-corner-all nim-field-el {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}">'+
								'<img title="显示日历" id="_handler" src="resources/plateform/light-ui/images/date-pic.png" style="margin-left: 4px;vertical-align: middle;cursor:hand;{{#if enabled}}cursor:pointer;{{/if}}">'+
							'</span>'+
						'</td>'+
				    '</tr>'+
				    '</table>'+
				'</span>',
			eventScript:
				'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
					'<table width="100%" style="table-layout:fixed;">'+
					'<tr>'+
						'<td width="90px">'+
							'<label style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
						'</td>'+
						'<td width="*" style="font-size: 1em important!;">'+
							'<span id="{{form.name}}_{{name}}_field_container" class="nim-field-wrapper" style="display:inline-block;width:  {{#if width}}{{width}}{{else}}100%{{/if}};">'+
								'<textarea id="{{form.name}}_{{name}}" {{#unless enabled}}disabled{{/unless}} style="height:{{height}};width:{{#if width}}{{width}}{{else}}220px{{/if}};" class="nim-field-el {{#unless isValid}}nim-field-invalid{{/unless}}">'+
								'</textarea>'+
								'<img title="编辑" id="_handler" src="resources/plateform/light-ui/images/icon-text.jpg" style="position: relative;margin-left: 4px;cursor:hand;cursor:pointer;">'+
							'</span>'+
						'</td>'+
				    '</tr>'+
				    '</table>'+
				'</span>',
			setCheckbox:
				'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
					'<table width="100%" style="table-layout:fixed;">'+
					'<tr>'+
						'<td width="90px">'+
							'<label class="nim-field-label" style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
						'</td>'+
						'<td width="*">' +
							'<ul id="{{form.name}}_{{name}}" style="width:{{#if width}}{{width}}{{else}}220px{{/if}};list-style: none outside none;" class="nim-field-wrapper {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}">'+
								'<li style="float:left;">'+
									'<input id="" type="checkbox"  style="width:14px;" class="nim-field-checkbox ">' +
									'<label id="" class="nim-field-checkbox-text" style="line-height: 19px;" for=""></label>'+
								'</li>' +
								'<div class="clear"></div>' +
							'</ul>' +
						'</td>'+
				        '</tr>'+
				    '</table>'+
				'</span>',
			setFile:
				'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
					'<table width="100%" style="table-layout:fixed;">'+
					'<tr>'+
						'<td width="90px">'+
							'<label class="nim-field-label" style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{form.name}}_{{name}}">{{label}}</label>'+
						'</td>'+
						'<td width="*">' +
							'<span id="{{form.name}}_{{name}}" style="width:{{#if width}}{{width}}{{else}}220px{{/if}};display: inline-block;" class="nim-field-wrapper {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}" >' +
								'<div id="toolsbar" style=""><a id="uploader" class="nim-setfield-file-uploader " href="#" >上传</a></div>' +
								'<ul class="nim-setfield-file-list" style="">' +
									'<li class="nim-setfield-file-item" style="" >' +
										'<span id="icon" class="nim-file-type-icon-16 "></span>' +
							            '<a id="shower" onclick="" href="#" class="nim-setfield-file-item-text" style="cursor:pointer;">文件名称</a>' +
							            '<a id="remover" onclick="" href="#" class="nim-setfield-file-remover" style="" >删除</a>' +
									'</li>' +
								'</ul>' +
							'</span>' +
						'</td>'+
				        '</tr>'+
				    '</table>'+
				'</span>'
			 
	},
	Toolsbar:{
		button:''
	}
};
