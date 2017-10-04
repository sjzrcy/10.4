function InitEvent() {
    $("img[name=up]").unbind("click").click(function() {
        Up(this);
    });

    $("img[name=down]").unbind("click").click(function() {
        Down(this);
    });

    $("input[type=radio]").unbind("click").click(function() {
        SetProperty(this);
    });
}

function Up(img) {
    var currentIndex = $(img).parents('tr').index();
    if (currentIndex < 1) {
        return;
    }

    var tr = $(img).parents('tr');
    $(tr).insertBefore($("table tbody tr:eq(" + (currentIndex - 1) + ")"));
    $(".index", tr).html(currentIndex);
    $(".index", $("table tbody tr:eq(" + currentIndex + ")")).html(currentIndex + 1)
}

function Down(img) {
    var currentIndex = $(img).parents('tr').index();
    var lastIndex = $("table tbody tr:last-child").index();
    if (currentIndex == lastIndex) {
        return;
    }

    var tr = $(img).parents('tr');
    $(tr).insertAfter($("table tbody tr:eq(" + (currentIndex + 1) + ")"));
    $(".index", tr).html(currentIndex + 2);
    $(".index", $("table tbody tr:eq(" + currentIndex + ")")).html(currentIndex + 1)
}

//将价格类型、是否采集无图商品的值设为tr的属性
function SetProperty(selector) {
    var name = $(selector).attr("class");
    if (name == "priceType") {
        $(selector).parents('tr').attr("priceType", $(selector).val());
    } else if (name == "isGatherItem") {
        $(selector).parents('tr').attr("isGatherItem", $(selector).val());
    }
}