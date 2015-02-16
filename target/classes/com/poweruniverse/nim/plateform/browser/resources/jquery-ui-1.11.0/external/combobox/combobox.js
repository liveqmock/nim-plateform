$.widget("ui.autocomplete", $.extend({}, $.ui.autocomplete.prototype, {
	_resizeMenu: function() {
		var parentCombo = this.element.data('combo');
		if(parentCombo!=null){
			this.menu.element.outerWidth( 500 );
			var ul = this.menu.element;
			
			ul.css('max-height',parentCombo.options.height);
			ul.outerWidth( Math.max(
				parentCombo.wrapper.outerWidth(),
				parentCombo.input.outerWidth() + parentCombo.trigger.outerWidth()
			) );
		}else{
			var ul = this.menu.element;
			ul.outerWidth( Math.max(
				ul.width( "" ).outerWidth() + 1,
				this.element.outerWidth()
			) );
		}
	}
}));


(function( $ ) {
	$.widget( "custom.combobox", {
		_create: function() {
			this._field = this.options.getObjectField();
			this.wrapper = $( "<span>" )
				.addClass( "custom-combobox" )
				.insertAfter( this.element );
			this.options.appendTo = this.wrapper;
			
			this.element.hide();
			this.input = $( "<input>" )
				.appendTo( this.wrapper )
				.attr( "title", "" )
				.addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
				.autocomplete(this.options)
				.data('combo',this)
				.tooltip({
					tooltipClass: "ui-state-highlight"
				});

			if(is_disabled){
				this.input.attr("disabled","true");
				this.trigger = $( "<a>" )
					.attr( "tabIndex", -1 )
					.attr( "hideFocus",'hide')//ie 隐藏虚线框
					.css('outline',0) //ff 隐藏虚线框
					.tooltip()
					.appendTo( this.wrapper )
					.button({
						icons: {
							primary: "ui-icon-triangle-1-s"
						},
						text: false,
						disabled:is_disabled
					})
					.removeClass( "ui-corner-all" )
					.addClass( "custom-combobox-toggle ui-corner-right" )
					.css('opacity','1')
			}else{
				var input = this.input;
				var wasOpen = false;
				var is_disabled = this.options.disabled;
				
				if(this.options.allowEdit){
					this.trigger = $( "<a>" )
						.attr( "tabIndex", -1 )
						.attr( "hideFocus",'hide')//ie 隐藏虚线框
						.css('outline',0) //ff 隐藏虚线框
						.tooltip()
						.appendTo( this.wrapper )
						.button({
							icons: {
								primary: "ui-icon-triangle-1-s"
							},
							text: false,
							disabled:is_disabled
						})
						.removeClass( "ui-corner-all" )
						.addClass( "custom-combobox-toggle ui-corner-right" )
						.css('opacity','1')
						.mousedown(function() {
							wasOpen = input.autocomplete( "widget" ).is( ":visible" );
						})
						.click(function() {
							input.focus();
							if ( wasOpen ) {
								input.autocomplete( "close" );
							}else{
								//点击下箭头 认为是按空字符串进行搜索
								input.autocomplete( "search", "search all" );
							}
						});
					this._on( this.input, {
						autocompletechange: "_removeIfInvalid"
					});
				}else{
					var _this = this;
					this.trigger = $( "<a>" )
						.attr( "tabIndex", -1 )
						.attr( "hideFocus",'hide')//ie 隐藏虚线框
						.css('outline',0) //ff 隐藏虚线框
						.tooltip()
						.appendTo( this.wrapper )
						.button({
							icons: {
								primary: "ui-icon-triangle-1-s"
							},
							text: false,
							disabled:is_disabled
						})
						.removeClass( "ui-corner-all" )
						.addClass( "custom-combobox-toggle ui-corner-right" )
						.css('opacity','1')
						.mousedown(function() {
							wasOpen = input.autocomplete( "widget" ).is( ":visible" );
						})
						.blur(function(event){
							console.log("activeElement："+document.activeElement.className);
							if(!$(document.activeElement).hasClass('ui-menu-item')){
								input.autocomplete( "close" );
							}
						})
						.click(function() {
							_this.trigger[0].focus();
							if ( wasOpen ) {
								input.autocomplete( "close" );
							}else{
								//点击下箭头 认为是按空字符串进行搜索
								input.autocomplete( "search", "search all" );
							}
						});
					this.input
						.css("cursor","pointer")
						.focus(function(){
							_this.trigger[0].focus();
						})
						.click(function(){
							input.autocomplete( "search", "search all" );
						});
				}
			}
				
			this.wrapper.css('width',this.options.width);
			this.input.outerWidth( parseInt(this.options.width) - this.trigger.outerWidth() );
		},
		_removeIfInvalid: function( event, ui ) {
			// Selected an item, nothing to do
			if ( ui.item ) {
				return;
			}
			// Search for a match (case-insensitive)
			var vText = this.input.val();
			if(vText==null || vText.length ==0){
				//当前字段置为null
				this.input.val( "" );
				this._field.setValue(null);
			}else{
				var valObj = this._field.parseRawValue(vText);
				if(valObj==null){
					this.input.val( "" );
					this._field.setValue(null);
				}else{
					this.input.val(this._field.formatRawValue(valObj));
					this._field.setValue(valObj);
				}
			}
		},
		_destroy: function() {
			this.wrapper.remove();
			this.element.show();
		}
	});
})( jQuery );