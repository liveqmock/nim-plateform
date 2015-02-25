(function(){
    $.extend($.fn,{
        mask: function(msg,maskDivClass){
            // 参数
            var op = {
                opacity: 0.45,
                z: 50,
                bgcolor: '#EEE'
            };
            var position={top:this.scrollTop(),left:0};
           
            var maskDiv=$(this).find("> div.maskdivgen");
            if(maskDiv.length == 0){
            	// 创建一个 Mask 层，追加到对象中
	            maskDiv=$('<div class="maskdivgen">&nbsp;</div>');
	            maskDiv.appendTo(this);
	            var maskWidth=this.outerWidth();
	            if(!maskWidth){
	                maskWidth=this.width();
	            }
	            var maskHeight=this.outerHeight();
	            if(!maskHeight){
	                maskHeight=this.height();
	            }
	            maskDiv.css({
	                position: 'absolute',
	                top: position.top+"px",
	                left: position.left+"px",
	                'z-index': op.z,
	                width: '100%',
	                height:'100%',
	                'background-color': op.bgcolor,
	                opacity: 0
	            });
	            if(maskDivClass){
	                maskDiv.addClass(maskDivClass);
	            }
	            
                var msgDiv=$('<div style="padding:2px;background:#ccca;"><div style="border:#a3bad9 1px solid;background:white;padding:2px 10px 2px 10px"><img style="display: inline;float: left;margin: 10px 15px;" src="resources/plateform/light-ui/images/loading.gif">'+
	                	'<ul class="maskInfo" style="width: 200px;list-style: none outside none;min-height:50px;"></ul>'+
		                '</div></div>');
                var heightspace=(maskDiv.height()-50);
                msgDiv.css({
                   cursor:'wait',
                   width:'280px',
                   margin:(heightspace/2-2)+"px auto 1px"
                });
                msgDiv.appendTo(maskDiv);
                
	            maskDiv.fadeIn('fast', function(){
	                // 淡入淡出效果
	                $(this).fadeTo('slow', op.opacity);
	            })
            }
            var maskInfoEl = maskDiv.find("ul.maskInfo");
            //根据msg类型 显示消息内容
            if(typeof(msg) == 'string'){
            	$('<li class="maskInfoItem">'+msg+'</li>').appendTo(maskInfoEl);
            }else if(typeof(msg) == 'object'){
            	for (var i=0;i<msg.length;i++){
            		$('<li class="maskInfoItem">'+msg[i]+'</li>').appendTo(maskInfoEl);
				}
            }
            
            return maskDiv;
        },
        maskInfo:function(msg){
        	var maskDiv=$(this).find("> div.maskdivgen");
            if(maskDiv.length == 0){
            	this.mask(msg);
            }else{
            	var maskInfoEl = maskDiv.find("ul.maskInfo");
            	maskInfoEl.html('');
	            //根据msg类型 显示消息内容
	            if(typeof(msg) == 'string'){
	            	$('<li class="maskInfoItem">'+msg+'</li>').appendTo(maskInfoEl);
	            }else if(typeof(msg) == 'object'){
	            	for (var i=0;i<msg.length;i++){
	            		$('<li class="maskInfoItem">'+msg[i]+'</li>').appendTo(maskInfoEl);
					}
	            }
            }
        },
     	unmask: function(){
//           this.unbind("scroll",maskWithScroll);
           $(this).find("> div.maskdivgen").fadeOut('slow',0,function(){
              $(this).remove();
           });
        }
    });
})();

//function maskWithScroll(){
//	$("div.maskdivgen:first").css('top',$(this).scrollTop()+'px')
//}