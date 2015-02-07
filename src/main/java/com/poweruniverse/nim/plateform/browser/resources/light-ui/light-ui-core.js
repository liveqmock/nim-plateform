	var LUI = {};

	LUI.Map = {
		uniqueId:0,
	　　createNew: function(){
	　　　　return {
				id:'_map_'+ (++LUI.Map.uniqueId),
				key:[],
				array:[],
				contains : function(k){
					var exists = false;
					for(var i=0;i<this.key.length;i++){
						if(this.key[i] == k){
							exists = true;
							break;
						}
					}
					return exists;
				},
				put : function(k,v){
					this.key[this.key.length] = k;
					this.array[this.array.length] = v;
				},
				get : function(k){
					var v = null;
					for(var i=0;i<this.key.length;i++){
						if(this.key[i] == k){
							v = this.array[i];
							break;
						}
					}
					return v;
				},
				remove : function(k){
					for(var i=0;i<this.key.length;i++){
						if(this.key[i] == k){
							this.key.splice(i,1);
							this.array.splice(i,1);
							break;
						}
					}
				},
				removeAll : function(){
					this.key = [];
					this.array = [];
				},
				keySet : function(){
					return this.key;
				},
				size:function(){
					return this.key.length;
				}
			};
		}
	};
	
	
	
	LUI.Set = {
		uniqueId:0,
	　　createNew: function(){
	　　　　return {
				id:'_set_'+ (++LUI.Set.uniqueId),
				array:[],
				contains : function(obj){
					var exists = false;
					for(var i=0;i<this.array.length;i++){
						if(this.array[i].id == obj.id){
							exists = true;
							break;
						}
					}
					return exists;
				},
				put : function(obj){
					if(!this.contains(obj)){
						this.array[this.array.length] = obj;
					}
				},
				get : function(index){
					return this.array[index] ;
				},
				indexOf : function(obj){
					var index = -1;
					for(var i=0;i<this.array.length;i++){
						if(this.array[i].id == obj.id){
							index = i;
							break;
						}
					}
					return index;
				},
				remove : function(obj){
					for(var i=0;i<this.array.length;i++){
						if(this.array[i].id == obj.id){
							this.array.splice(i,1);
							break;
						}
					}
				},
				removeAll : function(){
					this.array = [];
				},
				all : function(){
					return this.array;
				},
				size:function(){
					return this.array.length;
				}
			};
		}
	};
	
	LUI.Observable = {
			uniqueId:0,
		　　createNew: function(){
		　　　　return {
					id:'_observer_'+ (++LUI.Observable.uniqueId),
					events:{
					},
					listeners:LUI.Map.createNew(),
					addListener:function(evt_code,observer,fn){
						var listener = null;
						if(observer == null){
							listener = LUI.Listener.createNew(LUI.Observable.createNew(),fn);
						}else if(this == observer){
							alert("不允许为对象"+this.id+"添加对自身事件的监听");
							listener = LUI.Listener.createNew(LUI.Observable.createNew(),fn);
						}else{
							listener = LUI.Listener.createNew(observer,fn);
						}
						var listenerSet = this.listeners.get(evt_code);
						if(listenerSet==null){
							//检查此事件是否支持
							var evExists = false;
							for(var ev in this.events){
								if(this.events[ev] == evt_code ){
									evExists = true;
									break;
								}
							}
							if(evExists){
								listenerSet = LUI.Set.createNew();
								this.listeners.put(evt_code,listenerSet);
							}else{
								alert("对象"+this.id+"不支持此事件("+evt_code+")");
								consol.err("对象"+this.id+"不支持此事件("+evt_code+")");
								return;
							}
						}
						listenerSet.put(listener);
						return listenerSet;
					},
					/**
					 * evt_code:事件代号 
					 * params：参数
					 * eventTopSource：触发此事件的初始对象
					 */
					fireEvent:function(evt_code,params,eventOriginSource){
						if(this.listeners.contains(evt_code)){
							var evListeners = this.listeners.get(evt_code);
							
							var eventOrigin = eventOriginSource||this;
							for(var i=0;i<evListeners.size();i++){
								if(eventOrigin != evListeners.get(i).observer){
									var listener = evListeners.get(i);
									var listenerExec = listener.fn;
									var env = LUI.Event.createNew(evt_code,params);
									listenerExec.call(listener.observer,this,listener.observer,env,eventOrigin);
								}
							}
						}
					},
					removeListener:function(evt_code,observer){
						var evListenerSet = this.listeners.get(evt_code);
						if(evListenerSet!=null){
							for(var i = evListenerSet.size() -1 ; i >= 0;i--){
								if(observer == evListenerSet.get(i).observer || evListenerSet.get(i).observer.id == observer.id ){
									evListenerSet.remove(evListenerSet.get(i));
								}
							}
						}
					},
					removeAllListener:function(){
						this.listeners.removeAll();
					}
				};
			}
		};



		LUI.Listener = {
			uniqueId:0,
		　　createNew: function(observer,fn){
		　　　　return {
					id:'_listener_'+ (++LUI.Listener.uniqueId),
					observer : observer,
					fn : fn
				};
			}
		};

		LUI.Event = {
			uniqueId:0,
		　　createNew: function(code,params){
		　　　　return {
					id:'_event_'+ (++LUI.Event.uniqueId),
					code:code,
					params : params
				};
			}
		};

		LUI.Widget = {
			uniqueId:0,
			createNew:function(){
				return $.extend(LUI.Observable.createNew(),{
					id: 'widget_'+ (++LUI.Widget.uniqueId)
				});
			}
		};

		LUI.Popup = {
			showPage:function(pageUrl,params){
				
			}
		};

		LUI.Message = {
			info:function(title,message,type,option){
				var divEl = $(
					'<div title="'+title+'">'+
						'<p>'+
							'<span class="ui-icon ui-icon-'+(type||'info')+'" style="float:left; margin:0 7px 50px 0;"></span>'+
							message+
						'</p>'+
					'</div>');
//				$('body').append(divEl);
				
				var fOption = option||{};
				
				var dialogCfg = $.extend({
					 modal: true,
					 close:function(){
						 $(this).dialog( "destroy" );
						 $(this).remove();
//						 $('#_pageContent').css('overflow','auto');
					 },
					 open:function(){
						$(".ui-dialog-titlebar-close", $(this).parent()).hide();
					 },
					 autoOpen: true,
					 show: { effect: "scale", percent:100,duration: 400 },
					 hide: { effect: "scale", percent: 0 ,duration: 400},
					 buttons: [{ 
						 text: "确定",
						 click:function() {
							 var cf = $( this).dialog( "option", "callback" );
							 if(cf!=null){
								 cf.call(this,true);
							 }
							 $( this ).dialog( "close" );
						 }
					}]
				},fOption);
				
				divEl.dialog(dialogCfg);
				if(!dialogCfg.autoOpen){
					divEl.dialog( "open" );
				}
				
				$.data( divEl[0], "ui-dialog" )
				.overlay
				.data('dialog-handler',divEl)
				.click(function(){
					$(this).data('dialog-handler').dialog( "close" );
				});
			},
			warn:function(title,message,type,option){
				var divEl = $('<div title="'+title+'">'+
					'<p>'+
						'<span class="ui-icon ui-icon-'+(type||'notice')+'" style="float:left; margin:0 7px 50px 0;"></span>'+
						message+
					'</p>'+
				'</div>');
//				$('body').append(divEl);
				
				var fOption = option||{};
				
				divEl.dialog($.extend({
					 modal: true,
					 close:function(){
						 $(this).dialog( "destroy" );
						 $(this).remove();
					 },
					 open:function(){
						$(".ui-dialog-titlebar-close", $(this).parent()).hide();
					 },
					 autoOpen: true,
					 show: { effect: "scale", percent:100,duration: 400 },
					 hide: { effect: "scale", percent: 0 ,duration: 400},
					 buttons: [{ 
						 text: "确定",
						 click:function() {
							$( this ).dialog( "close" );
						 }
					}]
				},fOption));
				
				if(fOption.autoOpen!=null && !fOption.autoOpen){
					divEl.dialog( "open" );
				}
				
				$.data( divEl[0], "ui-dialog" )
				.overlay
				.data('dialog-handler',divEl)
				.click(function(){
					$(this).data('dialog-handler').dialog( "close" );
				});

			},
			error:function(title,message,type,option){
				var divEl = $('<div title="'+title+'">'+
					'<p>'+
						'<span class="ui-icon ui-icon-'+(type||'notice')+'" style="float:left; margin:0 7px 50px 0;"></span>'+
						message+
					'</p>'+
				'</div>');
				
				var fOption = option||{};
				divEl.dialog($.extend({
					 modal: true,
					 close:function(){
						 $(this).dialog( "destroy" );
						 $(this).remove();
						 if(fOption.callback){
							 fOption.callback.apply(fOption.context||this,[]);
						 }
					 },
					 open:function(){
						$(".ui-dialog-titlebar-close", $(this).parent()).hide();
					 },
					 autoOpen: true,
					 show: { effect: "scale", percent:100,duration: 400 },
					 hide: { effect: "scale", percent: 0 ,duration: 400},
					 buttons: [{ 
						 text: "确定",
						 click:function() {
							$( this ).dialog( "close" );
						 }
					}]
				},fOption));
				
				if(fOption.autoOpen!=null && !fOption.autoOpen){
					divEl.dialog( "open" );
				}
				
				$.data( divEl[0], "ui-dialog" )
					.overlay
					.data('dialog-handler',divEl)
					.click(function(){
						$(this).data('dialog-handler').dialog( "close" );
					});

			},
			confirm:function(title,message,callback){
				if(callback==null){
					alert('调用confirm方法，必须提供callback参数');
				}
				var divEl = $('<div title="'+title+'">'+
					'<p>'+
						'<span class="ui-icon ui-icon-help" style="float:left; margin:0 7px 50px 0;"></span>'+
						message+
					'</p>'+
				'</div>');
//				$('body').append(divEl);
				
				divEl.dialog($.extend({
					 modal: true,
					 close:function(){
						 $(this).dialog( "destroy" );
						 $(this).remove();
					 },
					 callback:callback,
					 autoOpen: true,
					 show: { effect: "scale", percent:100,duration: 400 },
					 hide: { effect: "scale", percent: 0 ,duration: 400},
					 buttons: [{ 
						 text: "确定",
						 click:function() {
							 var cf = $( this).dialog( "option", "callback" );
							 cf.call(this,true);
							 $( this ).dialog( "close" );
						 }
					},{ 
						 text: "取消",
						 click:function() {
							 var cf = $( this).dialog( "option", "callback" );
							 cf.call(this,false);
							$( this ).dialog( "close" );
						 }
					}]
				}));
			}
		};

		
	
	String.prototype.endWith=function(str){
		if(str==null||str==""||this.length==0||str.length>this.length)
		  return false;
		if(this.substring(this.length-str.length)==str)
		  return true;
		else
		  return false;
		return true;
	}
	
	String.prototype.startWith=function(str){
		if(str==null||str==""||this.length==0||str.length>this.length)
		  return false;
		if(this.substring(0,str.length)==str)
		  return true;
		else
		  return false;
		return true;
	}