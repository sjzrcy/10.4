function validatez_contact(param)
{
	var reg = new RegExp('.{0,25}');
	if (!reg.test(param))
	{
		return "厂家联系方式有误,"
	}
	
	return "";
}

function validatez_design_code(param)
{
	var reg = new RegExp(".{0,25}");
	if (!reg.test(param))
	{
		return "产品标准号有误!"
	}
	
	return "";
}

function validatez_factory(param)
{
	var reg = new RegExp(".{0,50}");
	if (!reg.test(param))
	{
		return "厂名有误!"
	}
	
	return "";
}

function validatez_factory_site(param)
{
	var reg = new RegExp(".{0,50}");
	if (!reg.test(param))
	{
		return "厂址有误!"
	}
	
	return "";
}

function validatez_food_additive(param)
{
	var reg = new RegExp(".{0,30}");
	if (!reg.test(param))
	{
		return "食品添加剂有误!"
	}
	
	return "";
}

function validatez_plan_storage(param)
{
	var reg = new RegExp(".{0,25}");
	if (!reg.test(param))
	{
		return "储藏方法有误!"
	}
	
	return "";
}

function validatez_period(param)
{
	var reg = new RegExp(".{0,25}");
	if (!reg.test(param))
	{
		return "保质期有误!"
	}
	
	return "";
}

function validatez_prd_license_no(param)
{
	var reg = new RegExp("\.{0,12}");
	if (!reg.test(param))
	{
		return "生产许可证编号有误!"
	}
	
	return "";
}

function validatez_supplier(param)
{
	var reg = new RegExp(".{0,50}");
	if (!reg.test(param))
	{
		return "供货商有误!"
	}
	
	return "";
}



function validatez_time(product_date_start
							, product_date_end
							, stock_date_start
							, stock_date_end)
{
	if (product_date_start.length == 0
		&& product_date_end.length == 0
		&& stock_date_start.length == 0
		&& stock_date_end.length == 0)
			return "";
			
	var strDate = product_date_start.split("-");
	if (strDate.length < 3
		&& strDate.length != 0)
		return "生产时间有误!";
	var  date_product_date_start = new Date(strDate[0],strDate[1],strDate[2]);
	
	strDate = product_date_end.split("-");
	if (strDate.length < 3
		&& strDate.length != 0)
		return "生产时间有误!";
	var  date_product_date_end = new Date(strDate[0],strDate[1],strDate[2]);
	
	strDate = stock_date_start.split("-");
	if (strDate.length < 3
		&& strDate.length != 0)
		return "进货时间有误!";
	var  date_stock_date_start = new Date(strDate[0],strDate[1],strDate[2]);
	
	strDate = stock_date_end.split("-");
	if (strDate.length < 3
		&& strDate.length != 0)
		return "进货时间有误!";
	var  date_date_end_end = new Date(strDate[0],strDate[1],strDate[2]);
	
	if(date_product_date_start>date_product_date_end)
		return "生产时间的开始时间必须小于结束时间!";
		
	if(date_stock_date_start>date_date_end_end)
		return "进货时间的开始时间必须小于结束时间!";
	
	if (date_stock_date_start < date_product_date_end)
		return "进货时间必须大于生成时间!";
	
	return "";
}

function validate(parameter)
{
	
	parameters = parameter.split(';');

var keys = new Array(parameters.length);
var values = new Array(parameters.length);

for (var i = 0; i < parameters.length; ++i)
{
	var str = parameters[i];
	var keyValue = str.split(':');
	if (keyValue.length >=2)
	{
		keys.push(keyValue[0]);
		values.push(keyValue[1]);
	}
}

var error = "";
var tmp="";

var product_date_start="";
var product_date_end="";
var stock_date_start="";
var stock_date_end="";

for (var i = 0; i < keys.length; ++i)
{
	if (tmp.length > 0)
	{
		error = error + tmp;
		tmp = "";
	}

	switch(keys[i])
	{
	case "contact":
		tmp = validatez_contact(values[i]);
		break;
	case "design_code":
		tmp = validatez_design_code(values[i]);
		break;
	case "factory":
		tmp = validatez_factory(values[i]);
		break;
	case "factory_site":
		tmp = validatez_factory_site(values[i]);
		break;
	case "food_additive":
		tmp = validatez_food_additive(values[i]);
		break;
	case "period":
		tmp = validatez_period(values[i]);
		break;
	case "plan_storage":
		tmp = validatez_plan_storage(values[i]);
		break;
	case "prd_license_no":
		tmp = validatez_prd_license_no(values[i]);
		break;
	case "supplier":
		tmp = validatez_supplier(values[i]);
		break;
	case "product_date_end":
		product_date_end = values[i];
		break;
	case "product_date_start":
		product_date_start = values[i];
		break;
	case "stock_date_start":
		stock_date_start = values[i];
		break;
	case "stock_date_end":
		stock_date_end = values[i];
		break;
	default:
	break;
	}
}

if (tmp.length > 0)
{
	error = error + tmp;
	tmp="";
}

tmp = validatez_time(product_date_start,product_date_end,stock_date_start,stock_date_end);
if (tmp.length > 0)
{
	error = error + tmp;
	tmp="";
}

return error;
	
}


