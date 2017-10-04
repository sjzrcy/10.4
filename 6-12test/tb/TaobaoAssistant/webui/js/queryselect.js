/*
 queryselect
*/
var TIP_QUERY = "可输入关键字查询";
var TIP_INPUT = "可直接输入值";

(function( $ ) {
  $.widget("custom.queryselect", {
    isPermitCustomInput_: false, //自定义输入，默认不支持
    autoCloseListener_:null,
    _create: function() {
      this.isPermitCustomInput_ = (this.options["permitCustomInput"] === true);
      this.wrapper = $("<div>")
        .addClass("queryselect_wrapper")
        .insertAfter(this.element);

      this.element.hide();
      this.createAutoComplete_();
      this.createShowAllButton_();
    },

    permitCustomInput:function(isPermit){
      this.isPermitCustomInput_ = (isPermit === true);
      var val = this.input.val();
      var tip = this.isPermitCustomInput_ ? TIP_INPUT : TIP_QUERY;
      if(!val || val == TIP_QUERY || val == TIP_INPUT){
        this.input.val(tip);
        this.input.addClass("query-input-tip");
      }
    },

    setCustomValue:function(value){
      if(this.isPermitCustomInput_ === true){
        this.input.val(value);
      }else{
        if(!this.forceInput_){
          return;
        }
      }

      var val = value;
      var tip = this.isPermitCustomInput_ ? TIP_INPUT : TIP_QUERY;
      if(!val || val == TIP_QUERY || val == TIP_INPUT){
        this.input.val(tip);
        this.input.addClass("query-input-tip");
      }else{
        this.input.removeClass("query-input-tip");
      }
    },

    setDisabled:function(isDisable){
      this.isDisabled = isDisable;
    },

    trySetEmpty:function(){
      var value = this.input.val();
      if(value == config.queryselect.DELETE){
        this.forceInput_ = true;
        this.setCustomValue("");
        this.forceInput_ = false;
      }
    },

    setBorderColor:function(borderColor, fontColor){
      this.input.css("border-color", borderColor).css("color", fontColor);
      this.button.css("border-color", borderColor).css("color", fontColor);
    },

    createAutoComplete_: function() {
      var self = this;
      var sourceNode = this.element;
      var selected = sourceNode.children(":selected");
      var value = selected.text() ? selected.text() : selected.val()

      var $inputWrapper = $("<div>").appendTo(this.wrapper)
                          .addClass("queryselect_input_wrapper");

      this.input = $("<input>")
        .appendTo($inputWrapper)
        .val(value)
        .autocomplete({
          delay: 0,
          minLength: 0,
          source: $.proxy( this, "_source" )
        })
        .addClass("queryselect_input")
        .tooltip()
        .focus(function(){
          if(self.isDisabled){
            $(this).blur();
            return;
          }

          var $input = $(this);
          var val = $input.val();
          if(!val || val == TIP_INPUT || val == TIP_QUERY){
            $input.val("");
            $input.removeClass("query-input-tip");
          }

          $input.autocomplete("search", $input.val());
        })
        .blur(function(){
          var $input = $(this);
          var val = $input.val();
          if(!val){
            $input.val(this.isPermitCustomInput_? TIP_INPUT: TIP_QUERY);
            $input.addClass("query-input-tip");
          }

          $input.autocomplete("close");
        })
        .click(function(){
          event.stopPropagation();
        });

      if(!this.input.val()){
          this.input.val(this.isPermitCustomInput_? TIP_INPUT: TIP_QUERY);
          this.input.addClass("query-input-tip");
      }

      this._on(this.input, {
        autocompleteselect: function(e, ui){
          if(ui.item.value == config.queryselect.DELETE){
            ui.item.label = "";
            ui.item.value = "";
          }

          this.button.removeClass("queryselect_button_hide");
          ui.item.option.selected = true;
          var argumentArray = [];
          argumentArray.push(e);
          argumentArray.push({item: ui.item});
          sourceNode.trigger("select", argumentArray);

          //lastValue
          sourceNode.attr("lastValue", ui.item.option.value);
        },

        autocompletechange: "removeInvalidIfNotPermit_"
      });
    },

    createShowAllButton_: function() {
      var self = this;
      var input = this.input;
      var isOpen = false;

      var $showButton = $("<div>")
        .appendTo(this.wrapper)
        .addClass("queryselect_button")
        .mousedown(function() {
          isOpen = input.autocomplete( "widget" ).is( ":visible" );
        })
        .click(function() {
          if(self.isDisabled){
            return;
          }

          if(isOpen){
            input.autocomplete("close");
            isOpen = false;
            $showButton.removeClass("queryselect_button_hide");
          }else{
            $showButton.addClass("queryselect_button_hide");
            input.autocomplete("search", "");
          }
        });

        this.button = $showButton;
        function rect($widget){
          var r = {};
          var offset = $widget.offset();
          r.x = offset.left;
          r.y = offset.top;
          r.w = $widget.width();
          r.h = $widget.height();
          return r;
        }

        function contain(rect0, rect1){
          return (rect0.x <= rect1.x && (rect1.x + rect1.w) <= (rect0.x + rect0.w)) && 
                  ((rect0.y <= rect1.y && (rect1.y + rect1.h) <= (rect0.y + rect0.h)));
        }

        this.autoCloseListener_ = function(){
            var isVisible = input.autocomplete("widget").is(":visible");
            if(isVisible){
              var rbtn = rect($showButton);
              var rtarget = rect($(event.target));
              if(!contain(rbtn, rtarget)){
                input.autocomplete("close");
                $showButton.removeClass("queryselect_button_hide");
              }
            }
        }

        $(document).bind("click", this.autoCloseListener_);
    },

    _source: function(request, response) {
      var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
      var filterOptions = this.element.children("option").map(function(index){
        var text = $(this).text();
        if (!request.term || matcher.test(text)){
           return {label: text, value: text, option: this};
        }
      }); 

      response(filterOptions);
    },

    removeInvalidIfNotPermit_: function(event, ui) {
      if(ui.item){ // 选择一项，不执行其他动作
        return;
      }

      if(this.isPermitCustomInput_){
        this.element.trigger("custominput", this.input.val());
        return;
      }

      // 检查匹配项（区分大小写）
      var text = this.input.val();
      var valid = false;

      var optionValue = "";
      var optionText = "";
      this.element.children("option").each(function() {
        var $option = $(this);
        if ($option.text() === text){
          optionValue = $option.attr("value");
          optionText = text;

          this.selected = true;
          valid = true;
          return false;
        }
      });

      //失去焦点时，合法数据没有提交，自动提交
      var lastValue = this.element.attr("lastValue");
      if(valid && lastValue != optionValue){
        var item = {
            option:{
            text:optionText, 
            value:optionValue, 
            selected:true,
          }
        };

        var argumentArray = [];
        argumentArray.push({});
        argumentArray.push({item: item});
        this.element.trigger("select", argumentArray);
        this.element.attr("lastValue", optionValue);
        return;
      }

      if (valid || !this.input.val()){ // 找到一个匹配或者输入为空，不执行其他动作
        return;
      }

      // 移除无效的值并提示
      this.input.val("").attr("title", ("'" + text + "'" + "不在选项内")).tooltip("open");
      this.element.val("");
      this._delay(function(){
        this.input.tooltip("close").attr("title", "");
      }, 1200);
      this.input.data("ui-autocomplete").term = "";
    },

    _destroy: function() {
      $(document).unbind("click", this.autoCloseListener_);
      this.wrapper.remove();
    }
  });
})(jQuery);