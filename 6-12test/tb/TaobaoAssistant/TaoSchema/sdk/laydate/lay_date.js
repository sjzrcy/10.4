
(function(win){
    var doc = document, creat = 'createElement', byid = 'getElementById', tags = 'getElementsByTagName',

        activeObj = null,

        boxElems = {},

        as = ['laydate_box', 'laydate_void', 'laydate_click', 'LayDateSkin', 'skins/', '/laydate.css'];

    var T = {

        //获取组件存放路径
        getPath: function() {
            var js = document.scripts, jsPath = js[js.length - 1].src;
            return this.config.path ? this.config.path : jsPath.substring(0, jsPath.lastIndexOf("/") + 1);
        },

        use: function(lib, id){
            var link = doc[creat]('link');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = this.getPath() + lib + as[5];
            id && (link.id = id);
            doc[tags]('head')[0].appendChild(link);
            link = null;
        },

        trim: function(str){
            str = str || '';
            return str.replace(/^\s|\s$/g, '').replace(/\s+/g, ' ');
        },

        //补齐数位
        digit: function(num){
            return num < 10 ? '0' + (num|0) : num;
        },

        stopmp: function(e){
            e = e || window.event;
            e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
            return this;
        },

        each: function(arr, fn){
            var i = 0, len = arr.length;
            for(; i < len; i++){
                if(fn(i, arr[i]) === false){
                    break
                }
            }
        },

        hasClass: function(elem, cls){
            elem = elem || {};
            return new RegExp('\\b' + cls +'\\b').test(elem.className);
        },

        addClass: function(elem, cls){
            elem = elem || {};
            this.hasClass(elem, cls) || (elem.className += ' ' + cls);
            elem.className = this.trim(elem.className);
            return this;
        },

        removeClass: function(elem, cls) {
            elem = elem || {};
            if (this.hasClass(elem, cls)) {
                var reg = new RegExp('\\b' + cls +'\\b');
                elem.className = elem.className.replace(reg, '');
            }
            return this;
        },

        //清除css属性
        removeCssAttr: function(elem, attr){
            var s = elem.style;
            if(s.removeProperty){
                s.removeProperty(attr);
            } else {
                s.removeAttribute(attr);
            }
        },

        //显示隐藏
        shde: function(elem, type){
            elem.style.display = type ? 'none' : 'block';
        },

        //简易选择器
        query: function(node){
            if(node && node.nodeType === 1){
                if(node.tagName.toLowerCase() !== 'input'){
                    throw new Error('选择器elem错误');
                }
                return node;
            }

            var node = (this.trim(node)).split(' '), elemId = doc[byid](node[0].substr(1)), arr;
            if(!elemId){
                return;
            } else if(!node[1]){
                return elemId;
            } else if(/^\./.test(node[1])){
                var find, child = node[1].substr(1), exp = new RegExp('\\b' + child +'\\b');
                arr = []
                find = doc.getElementsByClassName ? elemId.getElementsByClassName(child) : elemId[tags]('*');
                T.each(find, function(ii, that){
                    exp.test(that.className) && arr.push(that); 
                });
                return arr[0] ? arr : '';
            } else {
                arr = elemId[tags](node[1]);
                return arr[0] ? elemId[tags](node[1]) : '';
            }
        },

        //事件监听器
        on: function(elem, even, fn){
            elem.attachEvent ? elem.attachEvent('on'+ even, function(){
                fn.call(elem, window.even);
            }) : elem.addEventListener(even, fn, false);
            return this;
        },

        //阻断mouseup
        stopMosup: function(evt, elem){
            var me = this;
            if(evt !== 'mouseup'){
                this.on(elem, 'mouseup', function(ev){
                    T.stopmp(ev);
                });
            }
        },

        scroll: function(type){
            type = type ? 'scrollLeft' : 'scrollTop';
            return doc.body[type] | doc.documentElement[type];
        },

        winarea: function(type){
            return document.documentElement[type ? 'clientWidth' : 'clientHeight']
        },

        isParent: function(obj,parentObj) {
            while (obj != document && obj != undefined && obj != null && obj.tagName.toUpperCase() != 'BODY'){
                if (obj == parentObj){
                    return true;
                }
                obj = obj.parentNode;
            }
            return false;
        },

        //判断闰年
        isleap: function(year){
            return (year%4 === 0 && year%100 !== 0) || year%400 === 0;
        },

        dateToArray: function(dateTime) {
            var a = [];
            if(dateTime) {
                var d = T.trim(dateTime).split(' ');
                a = d[0].split('-').concat(d[1]? d[1].split(':'): []);
            }
            return a;
        },

        arrayToInt: function(arr) {
            if(arr && arr.length) {
                for(var i = 0, l = arr.length; i < l; i++){
                    arr[i] = parseInt(arr[i], 10);
                }
            }
            return arr;
        }
    };

    function Dates(options) {
        // 组件所有默认配置列表
        this.config = { 

            //触发器
            elem: null,

            //初始化皮肤
            skin: 'laydate_box',

            //日期格式 
            format: 'YYYY-MM-DD hh:mm:ss', 

            //最小日期, 为0时以当前时间为准 
            min: '1900-01-01 00:00:00', 

            //最大日期
            max: '3099-12-31 23:59:59',

            //时间差
            timeOffer: 0,

            //显示提示
            placeholder: '请输入时间'
            
        };

        if(options) {
            for (key in options) {
                this.config[key] = options[key];
            };
        }

        this.as = {};

        this.elem = typeof this.config.elem == 'string'? T.query(this.config.elem): this.config.elem;

        this.elem && this.init();
    };

    Dates.prototype = {

        //检测是否在有效期
        checkVoid: function(YY, MM, DD){
            var back = [];
            YY = YY|0;
            MM = MM|0;
            DD = DD|0;
            if(YY < this.minYmd[0]){
                back = ['y'];
            } else if(YY > this.maxYmd[0]){
                back = ['y', 1];
            } else if(YY >= this.minYmd[0] && YY <= this.maxYmd[0]){
                if(YY == this.minYmd[0]){
                    if(MM < this.minYmd[1]){
                        back = ['m'];
                    } else if(MM == this.minYmd[1]){
                        if(DD < this.minYmd[2]){
                            back = ['d'];
                        }
                    }
                }
                if(YY == this.maxYmd[0]){
                    if(MM > this.maxYmd[1]){
                        back = ['m', 1];
                    } else if(MM == this.maxYmd[1]){
                        if(DD > this.maxYmd[2]){
                            back = ['d', 1];
                        }
                    }
                }
            }
            return back;
        },

        //时分秒的有效检测
        timeVoid: function(times, index){
            if(this.curYmd[1] == this.minYmd[1] && this.curYmd[2] == this.minYmd[2]) {
                if(index === 0 && (times < this.minYmd[3])){
                    return 1;
                } else if(index === 1 && this.ymd[3] <= this.minYmd[3] && times < this.minYmd[4]){
                    return 1;
                } else if(index === 2 && this.ymd[3] <= this.minYmd[3] && this.ymd[4] <= this.minYmd[4] && times < this.minYmd[5]){
                    return 1;
                }
            } else if(this.curYmd[1] == this.maxYmd[1] && this.curYmd[2] == this.maxYmd[2]){
                if(index === 0 && times > this.maxYmd[3]){
                    return 1;
                } else if(index === 1 && this.ymd[3] >= this.maxYmd[3] && times > this.maxYmd[4]){
                    return 1;
                } else if(index === 2 && this.ymd[3] >= this.maxYmd[3] && this.ymd[4] >= this.maxYmd[4] && times > this.maxYmd[5]){
                    return 1;
                }
            }
            if(times > (index ? 59 : 23)){
                return 1;
            }
        },

        //检测日期是否合法
        check: function(){
            var reg = this.config.format.replace(/YYYY|MM|DD|hh|mm|ss/g,'\\d+\\').replace(/\\$/g, '');
            var exp = new RegExp(reg), value = this.elem[this.elemv];
            var arr = value.match(/\d+/g) || [], isvoid = this.checkVoid(arr[0], arr[1], arr[2]);
            if(value.replace(/\s/g, '') !== ''){
                if(!exp.test(value)){
                    this.elem[this.elemv] = '';
                    this.msg('日期不符合格式，请重新选择。');
                    return 1;
                } else if(isvoid[0]){
                    //this.elem[this.elemv] = '';
                    //this.msg('日期不在有效期内，请重新选择。');
                    return 1;
                } else {
                    isvoid.value = this.elem[this.elemv].match(exp).join();
                    arr = isvoid.value.match(/\d+/g);
                    if(arr[1] < 1){
                        arr[1] = 1;
                        isvoid.auto = 1;
                    } else if(arr[1] > 12){
                        arr[1] = 12;
                        isvoid.auto = 1;
                    } else if(arr[1] && arr[1].length < 2){
                        isvoid.auto = 1;
                    }
                    if(arr[2] < 1){
                        arr[2] = 1;
                        isvoid.auto = 1;
                    } else if(arr[2] > this.months[(arr[1]|0)-1]){
                        arr[2] = 31;
                        isvoid.auto = 1;
                    } else if(arr[2] && arr[2].length < 2){
                        isvoid.auto = 1;
                    }
                    if(arr.length > 3){
                        if(this.timeVoid(arr[3], 0)){
                            isvoid.auto = 1;
                        };
                        if(this.timeVoid(arr[4], 1)){
                            isvoid.auto = 1;
                        };
                        if(this.timeVoid(arr[5], 2)){
                            isvoid.auto = 1;
                        };
                    }
                    if(isvoid.auto){
                        this.curYmd = [arr[0], arr[1]|0, arr[2]|0, arr[3]|0, arr[4]|0, arr[5]|0];
                        this.creation(this.curYmd, 1);
                        
                    } else if(isvoid.value !== this.elem[this.elemv]){
                        this.elem[this.elemv] = isvoid.value;
                    }
                }
            }
        },

        //生成日期
        months: [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        viewDate: function(){
            var me = this,
                log = {
                    ymd: arguments[0] || this.curYmd
                }, 
                De = new Date(log.ymd[0] + '-' + log.ymd[1] + '-1'),
                Y = parseInt(log.ymd[0], 10);
                M = parseInt(log.ymd[1], 10);
            
            var hmsin = T.query('#laydate_hms input');

            this.months[1] = T.isleap(log.ymd[0]) ? 29 : 28;
            
            log.FDay = De.getDay();
            log.PDay = this.months[M === 1 ? 11 :M - 2] - log.FDay + 1;
            log.NDay = 1;
            
            //渲染日
            T.each(boxElems.tds, function(i, elem){
                var YY = parseInt(log.ymd[0], 10), MM = parseInt(log.ymd[1], 10), DD;
                elem.className = '';

                if(i < log.FDay){
                    elem.innerHTML = DD = i + log.PDay;
                    T.addClass(elem, 'laydate_nothis');
                    MM === 1 && (YY -= 1);
                    MM = MM === 1 ? 12 : MM - 1; 
                } else if(i >= log.FDay && i < log.FDay + me.months[M-1]){
                    elem.innerHTML = DD = i  - log.FDay + 1;
                    if(i - log.FDay + 1 === parseInt(log.ymd[2], 10)){
                        T.addClass(elem, as[2]);
                        log.thisDay = elem;
                    }
                } else {
                    elem.innerHTML = DD = log.NDay++;
                    T.addClass(elem, 'laydate_nothis');
                    MM === 12 && (YY += 1);
                    MM = MM === 12 ? 1 : MM + 1; 
                }
               
                if(me.checkVoid(YY, MM, DD)[0]){
                    T.addClass(elem, as[1]);
                }
                
                me.config.festival && me.festival(elem, MM + '.' + DD);
                elem.setAttribute('y', YY);
                elem.setAttribute('m', MM);
                elem.setAttribute('d', DD);
                YY = MM = DD = null;
            });
            
            me.valid = !T.hasClass(log.thisDay, as[1]);
            me.ymd = log.ymd;

            //锁定年月
            boxElems.year.value = log.ymd[0] + '年';
            boxElems.month.value = T.digit(log.ymd[1]) + '月';

            //定位所有年份
            T.each(boxElems.allYears, function(i, elem) {
                var curYear = Y - 6 + i;
                me.checkVoid(curYear)[0] === 'y'? T.addClass(elem, as[1]): T.removeClass(elem, as[1]);
                curYear == Y? T.addClass(elem, as[2]): T.removeClass(elem, as[2]);
                elem.setAttribute('y', curYear);
                elem.innerHTML = curYear + '年';
            });

            
            //定位月
            T.each(boxElems.mms, function(i, elem){
                var getCheck = me.checkVoid(log.ymd[0], parseInt((elem.getAttribute('m')|0), 10) + 1);

                if(getCheck[0] === 'y' || getCheck[0] === 'm'){
                    T.addClass(elem, as[1]);
                } else {
                    T.removeClass(elem, as[1]);
                }
                T.removeClass(elem, as[2]);
                getCheck = null
            });
            T.addClass(boxElems.mms[log.ymd[1]-1], as[2]);

            //定位所有月份
            T.each(boxElems.allMonth, function(i, elem){
                var getCheck = me.checkVoid(log.ymd[0], parseInt((elem.getAttribute('m')|0), 10));

                if(getCheck[0] === 'y' || getCheck[0] === 'm'){
                    T.addClass(elem, as[1]);
                } else {
                    T.removeClass(elem, as[1]);
                }
                T.removeClass(elem, as[2]);
                getCheck = null
            });
            T.addClass(boxElems.allMonth[log.ymd[1]-1], as[2]);
            
            //定位时分秒
            log.times = [
                log.ymd[3]|0 || 0, 
                log.ymd[4]|0 || 0, 
                log.ymd[5]|0 || 0
            ];

            T.each(new Array(3), function(i){
                hmsin[i].value = T.digit(me.timeVoid(log.times[i], i) ? me.minYmd[i+3]|0 : log.times[i]|0);
            });
            
            //确定按钮状态
            T[me.valid ? 'removeClass' : 'addClass'](me.as.ok, as[1]);
        },

        //节日
        festival: function(td, md){
            var str;
            switch(md){
                case '1.1':
                    str = '元旦';
                break;
                case '3.8':
                    str = '妇女';
                break;
                case '4.5':
                    str = '清明';
                break;
                case '5.1':
                    str = '劳动';
                break;
                case '6.1':
                    str = '儿童';
                break;
                case '9.10':
                    str = '教师';
                break;
                case '10.1':
                    str = '国庆';
                break;
            };
            str && (td.innerHTML = str);
            str = null;
        },

        //生成年列表
        viewYears: function(YY){
            var str = '', me = this;
            T.each(new Array(14), function(i){
                if(i === 7) {
                    str += '<li '+ (parseInt(boxElems.year.value) === YY ? 'class="'+ as[2] +'"' : '') +' y="'+ YY +'">'+ YY +'年</li>';
                } else {
                    str += '<li y="'+ (YY-7+i) +'">'+ (YY-7+i) +'年</li>';
                }
            }); 
            T.query('#laydate_ys').innerHTML = str;
            T.each(T.query('#laydate_ys li'), function(i, elem){
                if(me.checkVoid(elem.getAttribute('y'))[0] === 'y'){
                    T.addClass(elem, as[1]);
                } else {
                   T.on(elem, 'click', function(ev){
                        T.stopmp(ev); 
                        me.reshow();
                        activeObj.curYmd[0] = this.getAttribute('y') | 0;
                        me.viewDate([this.getAttribute('y')|0, me.curYmd[1], me.curYmd[2], me.curYmd[3], me.curYmd[4], me.curYmd[5]]);
                    });
                }
            });
        },

        //是否显示零件
        iswrite: function(){
            var log = {
                time: T.query('#' + this.boxId + 'laydate_hms')
            };
            this.shde(log.time, !this.config.istime);
            this.shde(this.as.oclear, !('isclear' in this.config ? this.config.isclear : 1));
            this.shde(this.as.otoday, !('istoday' in this.config ? this.config.istoday : 1));
            this.shde(this.as.ok, !('issure' in this.config ? this.config.issure : 1));
        },

        //方位辨别
        orien: function(obj, pos){
            var tops, rect = this.elem.getBoundingClientRect();
            obj.style.left = rect.left + (pos ? 0 : T.scroll(1)) + 'px';
            if(rect.bottom + obj.offsetHeight/1.5 <= T.winarea()){
                tops = rect.bottom - 1;         
            } else {
                tops = rect.top > obj.offsetHeight/1.5 ? rect.top - obj.offsetHeight + 1 : T.winarea() - obj.offsetHeight;
            }
            obj.style.top = tops + (pos ? 0 : T.scroll()) + 'px';
        },

        //吸附定位
        follow: function(obj){
            if(this.config.fixed){
                obj.style.position = 'fixed';
                this.orien(obj, 1);
            } else {
                obj.style.position = 'absolute';
                this.orien(obj);
            }
        },

        //生成表格
        viewtb: function(){
            var me = this;
            var tr, view = [], weeks = [ '日', '一', '二', '三', '四', '五', '六'];
            var log = {}, table = doc[creat]('table'), thead = doc[creat]('thead');
            thead.appendChild(doc[creat]('tr'));
            log.creath = function(i){
                var th = doc[creat]('th');
                th.innerHTML = weeks[i];
                thead[tags]('tr')[0].appendChild(th);
                th = null;
            };
            
            T.each(new Array(6), function(i){
                view.push([]);
                tr = table.insertRow(0);
                T.each(new Array(7), function(j){
                    view[i][j] = 0;
                    i === 0 && log.creath(j);
                    tr.insertCell(j);
                });
            });
            
            table.insertBefore(thead, table.children[0]); 
            table.id = 'laydate_table';
            table.className = 'laydate_table date-box';
            tr = view = null;
            return table.outerHTML.toLowerCase();
        },

        viewMouth: function() {
            var html = '<div class="laydate-list-box mouth-box"><ul id="laydate_all_m">';
            T.each(new Array(12), function(i){
                var m = T.digit(i + 1);
                html += '<li m="' + m + '" >' + m + '月</li>';
            });
            html += '</ul></div>';
            return html;
        },

        viewAllYear: function() {
            var html = '<div id="years-box" class="laydate-list-box years-box"><a class="laydate_tab laydate_chtop"><cite></cite></a><ul id="laydate_all_y">';
                            
            T.each(new Array(12), function(i){
                html += '<li> </li>';
            });

            html += '</ul><a class="laydate_tab laydate_chdown"><cite></cite></a></div>';
            
            return html;
        },

        //渲染控件骨架
        view: function(){ 

            var me = this, div, log = {};

            this.boxId =  this.config.id || 'J_lay_date';

            //this.mm = log.mm = [this.config.min, this.config.max];

            /*this.mins = this.config.min;
            this.maxs = this.config.max; */
            
            this.elemv = /textarea|input/.test(this.elem.tagName.toLocaleLowerCase()) ? 'value' : 'innerHTML';
            
            this.box = T.query('#'+this.boxId);
            if(!this.box){ 
                div = doc[creat]('div');
                div.id = this.boxId;
                div.className = this.config.skin;
                div.style.cssText = 'position: absolute;';
                div.innerHTML =  log.html = '<div class="laydate_top">'
                  +'<div class="laydate_ym laydate_y" id="laydate_YY">'
                    +'<a class="laydate_choose laydate_chprev laydate_tab"><cite></cite></a>'
                    +'<input id="laydate_y" readonly><label></label>'
                    +'<a class="laydate_choose laydate_chnext laydate_tab"><cite></cite></a>'
                    +'<div class="laydate_yms">'
                      +'<a class="laydate_tab laydate_chtop"><cite></cite></a>'
                      +'<ul id="laydate_ys"></ul>'
                      +'<a class="laydate_tab laydate_chdown"><cite></cite></a>'
                    +'</div>'
                  +'</div>'
                  +'<div class="laydate_ym laydate_m" id="laydate_MM">'
                    +'<a class="laydate_choose laydate_chprev laydate_tab"><cite></cite></a>'
                    +'<input id="laydate_m" readonly><label></label>'
                    +'<a class="laydate_choose laydate_chnext laydate_tab"><cite></cite></a>'
                    +'<div class="laydate_yms" id="laydate_ms">'+ function(){
                        var str = '';
                        T.each(new Array(12), function(i){
                            str += '<span m="'+ i +'">'+ T.digit(i+1) +'月</span>';
                        });
                        return str;
                    }() +'</div>'
                  +'</div>'
                +'</div>'
                
                + me.viewtb()

                + me.viewMouth()

                + me.viewAllYear()
                
                +'<div class="laydate_bottom">'
                  +'<ul id="laydate_hms">'
                    +'<li class="laydate_sj">时间</li>'
                    +'<li><input readonly></li>'
                    +'<li class="minutes">:<input readonly></li>'
                    +'<li class="seconds">:<input readonly></li>'
                  +'</ul>'
                  +'<div class="laydate_time" id="laydate_time"></div>'
                  +'<div class="laydate_btn">'
                    +'<a id="laydate_clear">清空</a>'
                    +'<a style="display:none;" id="laydate_today">今天</a>'
                    +'<a id="laydate_ok">确认</a>'
                  +'</div>'
                +'</div>';
                doc.body.appendChild(div); 
                me.box = T.query('#'+me.boxId);   
                boxElems.tds = T.query('#laydate_table td');
                boxElems.mms = T.query('#laydate_ms span');
                boxElems.year = T.query('#laydate_y');
                boxElems.month = T.query('#laydate_m');  
                boxElems.allMonth = T.query('#laydate_all_m li');
                boxElems.allYears = T.query('#laydate_all_y li');  
                me.events();
            } else {
                T.shde(me.box);
            }

            
            me.config.zIndex ? me.box.style.zIndex = me.config.zIndex : T.removeCssAttr(me.box, 'z-index');
            me.follow(me.box);
            me.box.className = this.config.skin + ' ' + me.formatClass;
            T.stopMosup('click', me.box);
            this.viewDate();
            /*me.iswrite();*/
            me.check();
        },

        //隐藏内部弹出元素
        reshow: function(){
            var me = this;
            T.each(T.query('#'+ me.boxId +' .laydate_show'), function(i, elem){
                T.removeClass(elem, 'laydate_show');
            });
            return this;
        },

        //关闭控件
        close: function(){
            this.reshow();
            T.shde(T.query('#'+ this.boxId), 1);
        },

        //转换日期格式
        parse: function(ymd, hms, format){
            var me = this;
            ymd = ymd.concat(hms);
            format = format || this.config.format;
            return format.replace(/YYYY|MM|DD|hh|mm|ss/g, function(str, index){
                ymd.index = ++ymd.index|0;
                return T.digit(ymd[ymd.index]);
            });     
        },

        //返回最终日期
        creation: function(hide){
            var getDates = this.parse(activeObj.curYmd);

            if(hide){
                activeObj.close();
                activeObj.elem[activeObj.elemv] = getDates;
                typeof activeObj.config.choose === 'function' && activeObj.config.choose(getDates); 
            }
        },

        //事件
        events: function(){


            var me = this, log; 
            me.log = log = {
                box: '#'+ this.boxId 
            };
            
            T.addClass(doc.body, 'laydate_body');
        
            //显示更多年月
            T.each(T.query(log.box + ' .laydate_ym'), function(i, elem){
                T.on(elem, 'click', function(ev){
                    T.stopmp(ev); 
                    activeObj.reshow();
                    T.addClass(this[tags]('div')[0], 'laydate_show');
                    if(!i){
                        log.YY = parseInt(boxElems.year.value);
                        activeObj.viewYears(log.YY);
                    }
                });
            });
            
            T.on(T.query(log.box), 'click', function(){
                activeObj.reshow();
            });
            
            //切换年
            log.tabYear = function(type){ 
                if(type === 0){
                    activeObj.curYmd[0]--;
                } else if(type === 1) {
                    activeObj.curYmd[0]++;
                } else if(type === 2) {
                    log.YY -= 14;
                } else {
                    log.YY += 14;
                }

                if(type < 2){
                    activeObj.viewDate([activeObj.curYmd[0], activeObj.curYmd[1], activeObj.curYmd[2], activeObj.curYmd[3], activeObj.curYmd[4], activeObj.curYmd[5]]);
                    activeObj.reshow();
                } else {
                    activeObj.viewYears(log.YY);
                }
            };

            T.each(T.query('#laydate_YY .laydate_tab'), function(i, elem){
                T.on(elem, 'click', function(ev) {
                    T.stopmp(ev);
                    log.tabYear(i);
                });
            });


            //只有年份时，选择年份做为当前value
            T.each(boxElems.allYears, function(i, elem){
                T.on(elem, 'click', function(ev){
                    T.stopmp(ev); 
                    activeObj.reshow();
                    if(!T.hasClass(this, as[1])){
                        activeObj.curYmd[0] = T.digit(parseInt(this.getAttribute('y')|0, 10));
                        activeObj.creation(true);
                    }
                });
            });

            log.tabAllYear = function(type) {
                var starYear = boxElems.allYears[0].getAttribute('y') - 12,
                    curYear = activeObj.curYmd[0];

                type && (starYear = parseInt(boxElems.allYears[boxElems.allYears.length-1].getAttribute('y'), 10) + 1);
                T.each(boxElems.allYears, function(i, elem) {
                    elem.innerHTML = starYear + '年';
                    elem.setAttribute('y', starYear);
                    activeObj.checkVoid(starYear)[0] === 'y'? T.addClass(elem, as[1]): T.removeClass(elem, as[1]);
                    curYear == starYear? T.addClass(elem, as[2]): T.removeClass(elem, as[2]);
                    starYear++;
                });
            }

            T.each(T.query('#years-box .laydate_tab'), function(i, elem){
                T.on(elem, 'click', function(ev) {
                    T.stopmp(ev);
                    log.tabAllYear(i);
                });
            });
            
            
            //切换月
            log.tabMonth = function(type){
                if(type){
                    activeObj.curYmd[1]++;
                    if(activeObj.curYmd[1] === 13){
                        activeObj.curYmd[0]++;
                        activeObj.curYmd[1] = 1;
                    }            
                } else {
                    activeObj.curYmd[1]--;
                    if(activeObj.curYmd[1] === 0){
                        activeObj.curYmd[0]--;
                        activeObj.curYmd[1] = 12;
                    }
                }
                activeObj.viewDate([activeObj.curYmd[0], activeObj.curYmd[1], activeObj.curYmd[2], activeObj.curYmd[3], activeObj.curYmd[4], activeObj.curYmd[5]]);
            };

            T.each(T.query('#laydate_MM .laydate_tab'), function(i, elem){
                T.on(elem, 'click', function(ev){
                    T.stopmp(ev); 
                    activeObj.reshow();
                    log.tabMonth(i);
                });
            });
            
            //选择月
            T.each(T.query('#laydate_ms span'), function(i, elem){
                T.on(elem, 'click', function(ev){
                    T.stopmp(ev); 
                    activeObj.reshow();
                    if(!T.hasClass(this, as[1])){
                        activeObj.curYmd[1] = T.digit(parseInt(this.getAttribute('m')|0, 10) + 1);
                        activeObj.viewDate([activeObj.curYmd[0], activeObj.curYmd[1], activeObj.curYmd[2]]);
                    }
                });
            });

            //选择月份做为当前value
            T.each(boxElems.allMonth, function(i, elem){
                T.on(elem, 'click', function(ev){
                    T.stopmp(ev); 
                    activeObj.reshow();
                    if(!T.hasClass(this, as[1])){
                        activeObj.curYmd[1] = T.digit(parseInt(this.getAttribute('m')|0, 10));
                        activeObj.creation(true);
                    }
                });
            });
            

            //选择日
            var tds = T.query('#laydate_table td');
            T.each(tds, function(i, elem){
                T.on(elem, 'click', function(ev){
                    
                    T.each(tds, function(k, e) {
                        T.removeClass(e, 'laydate_click');
                    });

                    T.addClass(this, 'laydate_click');
                    if(!T.hasClass(this, as[1])){
                        if(T.hasClass(elem, 'laydate_nothis')){
                            T.stopmp(ev);
                            activeObj.curYmd[2] = T.digit(elem.getAttribute('d'));
                            activeObj.curYmd[1] = T.digit(elem.getAttribute('m'));
                            activeObj.formatArr.length > 3 && activeObj.viewDate([activeObj.curYmd[0], activeObj.curYmd[1], activeObj.curYmd[2]]);
                            activeObj.creation(activeObj.formatArr.length <= 3);
                            return;
                        }

                        T.stopmp(ev);
                        activeObj.curYmd[2] = T.digit(elem.getAttribute('d'));
                        activeObj.creation(activeObj.formatArr.length <= 3);
                    }
                });
            });
            
            //清空
            me.as.oclear = T.query('#laydate_clear');
            T.on(me.as.oclear, 'click', function(){
                activeObj.elem[activeObj.elemv] = '';
                typeof activeObj.config.choose === 'function' && activeObj.config.choose('');
                activeObj.close();
            });
            
            //今天
            me.as.otoday = T.query('#laydate_today');
            T.on(me.as.otoday, 'click', function(){
                var now = new Date(new Date().getTime() + activeObj.config.timeOffer);
                activeObj.curYmd = [now.getFullYear(), now.getMonth() + 1, now.getDate()];
                activeObj.creation();
            });
            
            //确认
            me.as.ok = T.query('#laydate_ok');
            T.on(me.as.ok, 'click', function(){
                if(activeObj.valid){
                    activeObj.creation(true);
                }
            });
            
            //选择时分秒
            log.times = T.query('#laydate_time');
            me.hmsin = log.hmsin = T.query('#laydate_hms input');
            log.hmss = ['小时', '分钟', '秒数'];
            log.hmsarr = [];
            
            
            log.hmson = function(input, index){

                var span = T.query('#laydate_hmsno span'), set = activeObj.valid ? null : 1;
                
                T.each(span, function(i, elem){
                    if(set){
                        T.addClass(elem, as[1]);
                    } else if(activeObj.timeVoid(i, index)){
                        T.addClass(elem, as[1]);
                    } else {
                        T.on(elem, 'click', function(ev){
                            if(!T.hasClass(this, as[1])){
                                input.value = activeObj.curYmd[parseInt(index, 10) + 3] = T.digit(this.innerHTML|0);
                            }

                        });
                    } 
                });
                T.addClass(span[input.value|0], 'laydate_click');
            };
            
            //展开选择
            T.each(log.hmsin, function(i, elem){
                T.on(elem, 'click', function(ev){
                    T.stopmp(ev); 
                    activeObj.reshow();
                    activeObj.msg(i, log.hmss[i], log);
                    log.hmson(this, i);
                });
            });
            
            T.on(doc, 'click', function(e){
                event = e || window.event;
                var codes = event.keyCode;
                var box = T.query('#' + me.boxId),
                    target = event.srcElement || event.target;
                if(box && box.style.display !== 'none'){
                    target == activeObj.elem || T.isParent(target, box) || activeObj.check() || activeObj.close();
                }
            });

            T.on(doc, 'keydown', function(event){
                event = event || window.event;
                var codes = event.keyCode;

                //如果在日期显示的时候按回车
                if(codes === 13 && me.elem){
                    activeObj.creation();
                }
            });
        },

        //生成时分秒或警告信息
        msg: function(i, title, log){
            var str = '<div class="laydte_hsmtex">'+ (title || '提示') +'<span>×</span></div>',
                me = this,
                log = log || me.log;

            if(typeof i === 'string'){
                str += '<p>'+ i +'</p>';
                T.shde(T.query('#' + me.boxId));
                T.removeClass(log.times, 'laydate_time1').addClass(log.times, 'laydate_msg');
            } else {
                if(!log.hmsarr[i]){
                    str += '<div id="laydate_hmsno" class="laydate_hmsno">';
                    T.each(new Array(i === 0 ? 24 : 60), function(i){
                        str += '<span>'+ i +'</span>';
                    });
                    str += '</div>'
                    log.hmsarr[i] = str;
                } else {
                    str = log.hmsarr[i];
                }
                T.removeClass(log.times, 'laydate_msg');
                T[i=== 0 ? 'removeClass' : 'addClass'](log.times, 'laydate_time1');
            }
            T.addClass(log.times, 'laydate_show');
            log.times.innerHTML = str;
        },

        setMinTime: function(minDate) {
            this.config.min = minDate;
            this.minYmd = T.arrayToInt(T.dateToArray(this.config.min));
        },

        setMaxTime: function(maxDate) {
            this.config.max = maxDate;
            this.maxYmd = T.arrayToInt(T.dateToArray(this.config.max));
        },

        initArg: function () {
            var D = new Date();

            this.curDate = D;

            this.formatClass = this.config.format.replace(/\-|:|\s/ig, '').toLocaleLowerCase();

            this.formatArr = T.dateToArray(this.config.format);

            this.curYmd = T.arrayToInt(T.dateToArray(this.elem.value || D.getFullYear() + '-' + (D.getMonth()+1) + '-' + D.getDate() + ' ' + D.getHours() + ':' +  D.getMinutes() + ':' + D.getSeconds()));

            if(this.config.min == 0){
                var minDate = new Date(D.getTime() - this.config.timeOffer);
                this.config.min = minDate.getFullYear() + '-' + (minDate.getMonth()+1) + '-' + minDate.getDate() + ' ' + minDate.getHours() + ':' +  minDate.getMinutes() + ':' + minDate.getSeconds();
            }

            if(this.config.max == 0 && this.config.timeOffer){
                var maxDate = new Date(D.getTime() + this.config.timeOffer);
                this.config.max = maxDate.getFullYear() + '-' + (maxDate.getMonth()+1) + '-' + maxDate.getDate() + ' ' + maxDate.getHours() + ':' +  maxDate.getMinutes() + ':' + maxDate.getSeconds();
            }

            this.minYmd = T.arrayToInt(T.dateToArray(this.config.min));
            this.maxYmd = T.arrayToInt(T.dateToArray(this.config.max));

        },

        show: function() {
            this.view();
            this.reshow();
        },

        init: function(){
            activeObj = this;
            this.initArg();
            this.show();

            /* 
            var me = this,
                dateMap = {
                    'YYYY': '年',
                    'MM': '月',
                    'DD': '日',
                    'hh': '时',
                    'mm': '分',
                    'ss': '秒'
                };
            
            T.on(this.elem, this.config.event || 'click', function() {
                activeObj = me;
                me.initArg();
                me.view();
                me.reshow();
            });

            if(this.config.placeholder){
                this.elem.setAttribute('placeholder', this.config.format.replace(/(Y{4})|(M{2})|(D{2})|(h{2})|(m{2})|(s{2})/ig, function() {
                    return dateMap[arguments[0]] || ''; 
                }));
            }
            */
        }
    };
    
    var widget;
    var laydate = function(config){
        if(widget){
            widget = undefined;
        }

        widget = new Dates(config);

        // 内部实现为，点击非input都关闭
        // 所有这里要延迟一下，避免可能被自动关闭
        setTimeout(function(){
            widget.show();
        }, 20);
    };

    laydate.now = function(arg0, format){
        return (new Date()).format(format);
    };

    // exports
    win.laydate = laydate;
    
    //
}(window));