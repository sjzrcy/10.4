/**
 * 数据加载器，理论上只要html文件里面有的都能拿出来
 * 1.数据放在html文件中
 * 2.异步读取
 */
define(function(require, exports, module) {
    //
    var map = {};
    var paths = [];

    var load = function(path, cbLoadFinished) {
        if (!path || !cbLoadFinished) {
            return;
        }

        if (_.find(paths, function(p) {
                return (p === path);
            })) {
            cbLoadFinished();
        }

        var $iframe = $("<iframe>").attr('src', path)
            .css({ width: 0, height: 0 })
            .appendTo($('body'));

        $iframe.bind("load", function() {
            doLoad(this);
            paths.push(path);
            $iframe.remove();
            cbLoadFinished();
        });
    };

    var doLoad = function(iframe) {
        var iframeWindow = iframe.contentWindow;
        var templates = iframeWindow.load();

        _.each(templates, function(template, id) {
            if (!map[id]) {
                map[id] = template;
            } else {
                error('数据索引重复！！ id:' + id);
            }
        });
    };

    var get = function(id) {
        return map[id];
    };

    var getJson = function(id) {
        var content = map[id];
        if (content) {
            try {
                return JSON.parse(content);
            } catch (e) {
                error('非法的JSON！资源ID：' + id);
                error(e.name + ' >> ' + e.message);
            }
        }
    };

    var clear = function() {
        map = {};
        paths = [];
    };

    var cssPaths = [];
    var loadCss = function(url) {
        /** 避免重复加载 */
        if (cssPaths.indexOf(url) === -1) {
            cssPaths.push(url);
        } else {
            return;
        }

        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    //
    exports.load = load;
    exports.get = get;
    exports.getJson = getJson;
    exports.clear = clear;
    exports.loadCss = loadCss;
});
