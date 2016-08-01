// 展示
var cvs1 = document.getElementById('cvs1');
var ctx1 = cvs1.getContext("2d");
var cvs2 = document.getElementById('cvs2');
var ctx2 = cvs2.getContext("2d");
var cvs3 = document.getElementById('cvs3');
var ctx3 = cvs3.getContext("2d");
// 原图
var imgBase = document.getElementById('base');
// 输入
var btn_r = document.getElementById('setcolorr');
var btn_g = document.getElementById('setcolorg');
var btn_b = document.getElementById('setcolorb');
// 通道
var tunnel = '';



var PIXEL_RATIO = window.devicePixelRatio || 1;

function convertImage(imageData, imageWidth, imageHeight, tunnel) {
    var w;
    var h;

    for (h = 0; h < imageHeight; h++) {
        for (w = 0; w < imageWidth; w++) {
            id = (h * img.width + w) * 4;

            if (tunnel === 'r') {
                imageData.data[id + 1] = 0;
                imageData.data[id + 2] = 0;
            } else if (tunnel === 'g') {
                imageData.data[id] = 0;
                imageData.data[id + 2] = 0;
            } else if (tunnel === 'b') {
                imageData.data[id] = 0;
                imageData.data[id + 1] = 0;
            }
        }
    }
}


// 主处理
var img = new Image();
img.onload = function() {
    imgBase.setAttribute('src', img.src);

    // 配置显示区
    cvs1.width = img.width;
    cvs1.height = img.height;
    cvs1.style.width = img.width / PIXEL_RATIO + 'px';
    cvs1.style.height = img.height / PIXEL_RATIO + 'px';

    cvs2.width = img.width;
    cvs2.height = img.height;
    cvs2.style.width = img.width / PIXEL_RATIO + 'px';
    cvs2.style.height = img.height / PIXEL_RATIO + 'px';

    cvs3.width = img.width;
    cvs3.height = img.height;
    cvs3.style.width = img.width / PIXEL_RATIO + 'px';
    cvs3.style.height = img.height / PIXEL_RATIO + 'px';

    // 绘制图片
    ctx1.drawImage(img, 0, 0, img.width, img.height);
    // 提取图片数据
    var filterData = ctx1.getImageData(0, 0, img.width, img.height);
    ctx1.clearRect(0, 0, img.width, img.height);
    // 放入显示容器
    convertImage(filterData, img.width, img.height, 'r');
    ctx1.putImageData(filterData, 0, 0);

    // 绘制图片
    ctx2.drawImage(img, 0, 0, img.width, img.height);
    // 提取图片数据
    var filterData = ctx2.getImageData(0, 0, img.width, img.height);
    ctx2.clearRect(0, 0, img.width, img.height);
    // 放入显示容器
    convertImage(filterData, img.width, img.height, 'g');
    ctx2.putImageData(filterData, 0, 0);

    // 绘制图片
    ctx3.drawImage(img, 0, 0, img.width, img.height);
    // 提取图片数据
    var filterData = ctx3.getImageData(0, 0, img.width, img.height);
    ctx3.clearRect(0, 0, img.width, img.height);
    // 放入显示容器
    convertImage(filterData, img.width, img.height, 'b');
    ctx3.putImageData(filterData, 0, 0);
}

img.src = '1.jpg';