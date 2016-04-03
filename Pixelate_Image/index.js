// 缓冲
var tmpCanvas = document.createElement('canvas');
var tmpCtx = tmpCanvas.getContext('2d');
// 展示
var cvs = document.getElementById('cvs');
var ctx = cvs.getContext("2d");
// 原图
var imgBase = document.getElementById('base');
// 输入
var input_control = document.getElementById('control');


var CIRCLE_D = 10;
var CIRCLE_R = CIRCLE_D / 2;
var PIXEL_RATIO = window.devicePixelRatio || 1;

function convertImage(imageData, imageWidth, imageHeight, squareSize) {
    var id;
    var w;
    var h;
    var center = parseInt(squareSize / 2);

    var r, g, b;

    var res = [];
    var lastIndex = 0;

    for (h = 0; h < imageHeight; h++) {
        if (h % squareSize === center) {
            res.push([]);
            lastIndex = res.length - 1;
        }

        for (w = 0; w < imageWidth; w++) {

            id = (h * img.width + w) * 4;

            if (w % squareSize === center && h % squareSize === center) {
                r = ('0' + imageData.data[id].toString(16)).slice(-2);
                g = ('0' + imageData.data[id + 1].toString(16)).slice(-2);
                b = ('0' + imageData.data[id + 2].toString(16)).slice(-2);

                res[lastIndex].push('#' + r + g + b);
            }
            // else {
            //     // imageData.data[id + 3] = 0; // alpha
            // }

            // imageData.data[id] = 255; // r
            // imageData.data[id + 1] = 0; // g
            // imageData.data[id + 2] = 0; // b
            // imageData.data[id + 3] = 128; // alpha
        }
    }

    return res;
}


// 主处理
var img = new Image();
img.onload = function() {
    imgBase.setAttribute('src', img.src);

    // 配置显示区
    cvs.width = img.width * PIXEL_RATIO;
    cvs.height = img.height * PIXEL_RATIO;
    cvs.style.width = img.width + 'px';
    cvs.style.height = img.height + 'px';


    tmpCanvas.width = img.width;
    tmpCanvas.height = img.height;

    tmpCtx.drawImage(img, 0, 0, tmpCanvas.width, tmpCanvas.height);

    // 提取图片数据
    var filterData = tmpCtx.getImageData(0, 0, img.width, img.height);
    tmpCtx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);

    //
    var controlW = parseInt(input_control.value);

    var imgData = convertImage(filterData, img.width, img.height, controlW);

    // 转换尺寸
    tmpCanvas.width = cvs.width;
    tmpCanvas.height = cvs.height;

    var d = controlW * PIXEL_RATIO;
    var r = d / 2;
    for (var i = 0; i < imgData.length; i++) {
        var tmpArr = imgData[i];

        for (var j = 0; j < tmpArr.length; j++) {
            tmpCtx.fillStyle = tmpArr[j];
            tmpCtx.beginPath();
            tmpCtx.arc(r + j * d, r + i * d, r, 0, Math.PI * 2, true);
            tmpCtx.closePath();
            tmpCtx.fill();
        }
    }

    // 放入显示容器
    ctx.putImageData(tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height), 0, 0);

    // input 转换
    input_control.onchange = function() {
        tmpCtx.clearRect(0, 0, cvs.width, cvs.height);

        controlW = parseInt(input_control.value);

        imgData = convertImage(filterData, img.width, img.height, controlW);

        d = controlW * PIXEL_RATIO;
        r = d / 2;
        for (var i = 0; i < imgData.length; i++) {
            var tmpArr = imgData[i];

            for (var j = 0; j < tmpArr.length; j++) {
                tmpCtx.fillStyle = tmpArr[j];
                tmpCtx.beginPath();
                tmpCtx.arc(r + j * d, r + i * d, r, 0, Math.PI * 2, true);
                tmpCtx.closePath();
                tmpCtx.fill();
            }
        }

        ctx.putImageData(tmpCtx.getImageData(0, 0, cvs.width, cvs.height), 0, 0);
    }
}

img.src = '1.jpg';