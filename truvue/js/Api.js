/**
 * Judge whether the parameter exists
 * 
 * @param {Object} e
 * @returns if exists returns true, otherwise false.
 * @type Boolean
 */
function Exists(e) {
    return(((e) !== undefined) && ((e) !== null));
}

(function () {

	/**
	 * initialize namespace
	 * @param {String} namespace 
	 */
    function initializeNamespace(namespace) {
        var n = namespace.split(".");
        var a = "window";
        for (var i = 0; i < n.length; ++i) {
            a += ".";
            a += n[i];
            eval("if(undefined===" + a + "||null===" + a + ") {" + a + "={};}");
        }
    }
	
	/**
	 * Imports and executes an external javascript file.
	 * 
	 * @param {string} url Absolute URL of the javascript file. Assumed to already be URL encoded.
	 */
	function importJavascript (scriptPath) {
        var ss = "<s" + "cript src=\"" + scriptPath + "\"></s" + "cript>";
        document.writeln(ss);
    }
	
	/**
	 * Imports an external CSS style sheet.
	 *
	 * @param {string} url Absolute URL of the style sheet. Assumed to already be URL encoded.
	 */
	function importStyleSheet(url){
		document.write("<link rel=\"stylesheet\" type=\"text/css\" href=\"" +
			url + "\"/>");
	};

	var array = document.getElementsByTagName('script');
	var queryString = array[0].src.substring(array[0].src.indexOf("?") + 1);
	var apiUrl = array[0].src.substring(0,array[0].src.lastIndexOf('/') + 1);
	if(queryString.indexOf("key") == -1){
		alert("Missing API key.")
		return;
	}
	
	var modules ;
	var key;
	var version;
	if(queryString.indexOf("&") != -1){
		var paramStr = queryString.split("&");
		for(var i in paramStr){
			if(paramStr[i].indexOf("=") != -1){
				var ss = paramStr[i].split("=");
				if(ss[0] === "key"){
					key = ss[1];
				}
				if(ss[0] === "modules"){
					modules = ss[1];
				}
				if(ss[0] === "v"){
					version = ss[1];
				}
			}
		}
	}
	
    initializeNamespace("SKta");
    var ns = window.SKta;
    //the following URL will be replaced by the URL in apiUrl after jsFileName loaded
   // var p = {rpcUrl:"http://ec2-50-112-212-28.us-west-2.compute.amazonaws.com:8080/production/getSwfXMLUrl.do",key:key,apiResourceUrl:"http://192.168.0.101:8080/js_api/"};
 //For dns not work now, using ip instead.
      var p = {rpcUrl:"http://50.112.92.128:8080/production/getSwfXMLUrl.do",key:key,apiResourceUrl:"http://192.168.0.101:8080/js_api/"};

    for (var item in p) {
        ns[item] = p[item];
    }
	
	var jsFileName = ["jquery-1.7.2","apiUrl", "Application", "Error", "Viewer", "Poi", "swfkrpano", "krpanoiphone.license", "krpanoiphone"];
	if(typeof(modules) !== "undefined" && modules !== ""){
		jsFileName.concat(modules.split(","));
	}

	for (s in jsFileName) {
		importJavascript(apiUrl + jsFileName[s] + ".js?key="+ key +"&v=" + version);
	}
})();
