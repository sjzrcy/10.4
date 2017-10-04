window.npUtil = new (function() {

	this.npLoaded = function(){
	    var json = {};
	    json[Channal.KEY_METHOD] = "npLoaded";
		var widt = $("#htmledit")[0];
		var obj=new Object();
		obj.ctrlid = "htmledit";
		obj.w = $(".desc_editor").width();
		obj.h = $(".desc_editor").height();
		obj.wndid = widt.hwnd;
		var json_data = JSON.stringify(obj); 
	    json[Channal.KEY_PARAMS] = json_data;
	    json[Channal.KEY_CALLBACK] = null;
	    Channal.invoke(json);
	}

	this.npResize = function(){
		var json = {};
	    json[Channal.KEY_METHOD] = "npResize";
		var widt = $("#htmledit")[0];
		var obj=new Object();
		obj.ctrlid = "htmledit";
		obj.wndid = widt.hwnd;		
		obj.w = $(".desc_editor").width();
		obj.h = $(".desc_editor").height();
		var json_data = JSON.stringify(obj); 
		json[Channal.KEY_PARAMS] = json_data;
	    json[Channal.KEY_CALLBACK] = null;
	    Channal.invoke(json);
	 }

    this.setEditorVisible = function(w, h, visible){
        if(visible){
            $(".desc_editor").css({width: w+"px", height: h+"px"});
        }else{
            $(".desc_editor").css({width:"0px", height:"0px"});
        }
    }

	 this.setHtmlEditorContent = function(htmlContent){ 
		var json = {};
	    json[Channal.KEY_METHOD] = "setHtmlEditorContent";
		var widt = $("#htmledit")[0];
		var obj=new Object();
		obj.ctrlid = "htmledit";
		obj.wndid = widt.hwnd;		
		obj.htmlContent = htmlContent; 
		var json_data = JSON.stringify(obj); 
		json[Channal.KEY_PARAMS] = json_data;
	    json[Channal.KEY_CALLBACK] = null;
	    Channal.invoke(json);
	 }	


	this.getHtmlEditorContent = function(callback){
		var json = {};
	    json[Channal.KEY_METHOD] = "getHtmlEditorContent";
		var widt = $("#htmledit")[0];
		var obj=new Object();
		obj.ctrlid = "htmledit";
		obj.wndid = widt.hwnd;
		var json_data = JSON.stringify(obj); 
		json[Channal.KEY_PARAMS] = json_data;
	    json[Channal.KEY_CALLBACK] = Channal.callback.translate(callback);
	    Channal.invoke(json);
	 }	


})();
