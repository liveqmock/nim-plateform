Handlebars.registerHelper('substr', function(passedString, start, length ){
	var resultString = "";
	if(passedString!=null){
		var theString = passedString.substr(start, length);
		resultString = new Handlebars.SafeString(theString);
	}
	return resultString;
});


Handlebars.registerHelper('ellipsis', function(passedString, length ){
	if(passedString!=null){
		var mlength = length,tailS='';
		if(passedString.length> length){
				tailS = '...';
				mlength = mlength -3;
		};
		var theString = passedString.substr(0, mlength) + tailS;
		return new Handlebars.SafeString(theString);
	}
	return "";
});

//对模板中的数值 进行加法运算
Handlebars.registerHelper("add",function(index,plus){
	return parseInt(index)+parseInt(plus);
});

////判断两个变量 是否相等
//Handlebars.registerHelper("equals",function(val1,val2){
//	return val1 == val2;
//});
//
////判断两个变量 是否相等
//Handlebars.registerHelper("notEqual",function(val1,val2){
//	return val1 != val2;
//});

//判断两个变量 是否相等
Handlebars.registerHelper('equals', function(val1,val2, options) {
	var conditional = true;
	if(val1 != val2){
		conditional = false;
	}

	// Default behavior is to render the positive path if the value is truthy and not empty.
	// The `includeZero` option may be set to treat the condtional as purely not empty based on the
	// behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
	if (!conditional) {
		return options.inverse(this);
	} else {
		return options.fn(this);
	}
});

//判断两个变量 是否不相等
Handlebars.registerHelper('notEqual', function(val1,val2, options) {
	var conditional = false;
	if(val1 != val2){
		conditional = true;
	}

	// Default behavior is to render the positive path if the value is truthy and not empty.
	// The `includeZero` option may be set to treat the condtional as purely not empty based on the
	// behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
	if (!conditional) {
		return options.inverse(this);
	} else {
		return options.fn(this);
	}
});

//判断两个变量 是否小于等于
Handlebars.registerHelper('lessEqual', function(val1,val2, options) {
	var conditional = false;
	if(val1 <= val2){
		conditional = true;
	}

	if (!conditional) {
		return options.inverse(this);
	} else {
		return options.fn(this);
	}
});
Handlebars.registerHelper('le', function(val1,val2, options) {
	var conditional = false;
	if(val1 <= val2){
		conditional = true;
	}

	if (!conditional) {
		return options.inverse(this);
	} else {
		return options.fn(this);
	}
});

//判断两个变量 是否小于等于
Handlebars.registerHelper('greaterEqual', function(val1,val2, options) {
	var conditional = false;
	if(val1 >= val2){
		conditional = true;
	}

	if (!conditional) {
		return options.inverse(this);
	} else {
		return options.fn(this);
	}
});
Handlebars.registerHelper('ge', function(val1,val2, options) {
	var conditional = false;
	if(val1 >= val2){
		conditional = true;
	}

	if (!conditional) {
		return options.inverse(this);
	} else {
		return options.fn(this);
	}
});

//判断两个变量 是否小于
Handlebars.registerHelper('lessThan', function(val1,val2, options) {
	var conditional = false;
	if(val1 < val2){
		conditional = true;
	}

	if (!conditional) {
		return options.inverse(this);
	} else {
		return options.fn(this);
	}
});
Handlebars.registerHelper('lt', function(val1,val2, options) {
	var conditional = false;
	if(val1 < val2){
		conditional = true;
	}

	if (!conditional) {
		return options.inverse(this);
	} else {
		return options.fn(this);
	}
});

//判断两个变量 是否小于等于
Handlebars.registerHelper('greaterThan', function(val1,val2, options) {
	var conditional = false;
	if(val1 > val2){
		conditional = true;
	}

	if (!conditional) {
		return options.inverse(this);
	} else {
		return options.fn(this);
	}
});
Handlebars.registerHelper('gt', function(val1,val2, options) {
	var conditional = false;
	if(val1 > val2){
		conditional = true;
	}

	if (!conditional) {
		return options.inverse(this);
	} else {
		return options.fn(this);
	}
});

