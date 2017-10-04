/**
 * Created by muhua.gmh on 3/25/2016.
 */
var createJPickerSettings = function(argTitle){
    return {
        window:
        {
            title : argTitle,
            expandable: true,
            position:
            {
                x : "screenCenter",
                y : "screenCenter"
            },
            effects :
            {
                type : 'none',
                speed :
                {
                    show : 'fast',
                    hide : 'fast',
                }
            }
        },
        images :
        {
            clientPath: '../../sdk/jPicker/imgs/jpicker/', // Path to image files
            picker :
            {
                height : 32,
                width : 32,
            }
        },
        localization: // alter these to change the text presented by the picker (e.g. different language)
        {
            text:
            {
                title: '拖动标记来选择一个颜色',
                newColor: '新颜色',
                currentColor: '当前颜色',
                ok: '确定',
                cancel: '取消'
            },
            tooltips:
            {
                colors:
                {
                    newColor: '新颜色 - 按“确定”提交设置',
                    currentColor: '单击以还原原始颜色'
                },
                buttons:
                {
                    ok: '提交此次颜色选择',
                    cancel: '取消并且退回到上次的颜色'
                },
                hue:
                {
                    radio: '设置“色调”值',
                    textbox: '输入一个“色调”值 (0-360°)'
                },
                saturation:
                {
                    radio: '设置“饱和度”值',
                    textbox: '输入一个“饱和度”值 (0-100%)'
                },
                value:
                {
                    radio: '设置“亮度”值',
                    textbox: '输入一个“亮度”值 (0-100%)'
                },
                red:
                {
                    radio: '设置红色值',
                    textbox: '输入红色值 (0-255)'
                },
                green:
                {
                    radio: '设置绿色值',
                    textbox: '输入绿色值 (0-255)'
                },
                blue:
                {
                    radio: '设置蓝色值',
                    textbox: '输入蓝色值 (0-255)'
                },
                alpha:
                {
                    radio: '设置Alpha值',
                    textbox: '输入Alpha值 (0-100)'
                },
                hex:
                {
                    textbox: '输入一个十六进制颜色值 (#000000-#ffffff)',
                    alpha: '输入一个十六进制颜色值 (#00-#ff)'
                }
            }
        }
    };
}
