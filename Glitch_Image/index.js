// 展示
var cvs = document.getElementById('cvs');
var ctx = cvs.getContext("2d");

var PIXEL_RATIO = window.devicePixelRatio || 1;

//glitch thresholds - increase maximum if you want things really fukd
var MAXIMUM_OF_PARAMETER = 10; //max=100
var MINIMUM_OF_PARAMETER = 5; //min=0

// 主处理
var img = new Image();
img.onload = function() {

    // 配置显示区
    cvs.width = img.width;
    cvs.height = img.height;
    cvs.style.width = (img.width / PIXEL_RATIO) + 'px';
    cvs.style.height = (img.height / PIXEL_RATIO) + 'px';

    ctx.drawImage(img, 0, 0, img.width, img.height);
    var image_data_new = ctx.getImageData(0, 0, img.width, img.height);

    // 参数
    var amount_random = Math.floor((Math.random() * MAXIMUM_OF_PARAMETER) + MINIMUM_OF_PARAMETER);
    var speed_random = Math.floor((Math.random() * MAXIMUM_OF_PARAMETER) + MINIMUM_OF_PARAMETER);
    var iterations_random = Math.floor((Math.random() * MAXIMUM_OF_PARAMETER) + MINIMUM_OF_PARAMETER);
    // var quality_random = Math.floor((Math.random() * 60) + MINIMUM_OF_PARAMETER);
    var parameters = {
        amount: amount_random,
        seed: speed_random,
        iterations: iterations_random,
        quality: 70
    };


    var tmpImg = new Image();
    tmpImg.onload = function() {
        ctx.drawImage(tmpImg, 0, 0, img.width, img.height);
    };
    // tmpImg.src = glitchImageData(image_data_new, parameters);


    var intervalId;
    cvs.onmouseover = function() {
        intervalId = setInterval(function() {
            parameters.amount = Math.floor((Math.random() * MAXIMUM_OF_PARAMETER) + MINIMUM_OF_PARAMETER);
            parameters.seed = Math.floor((Math.random() * MAXIMUM_OF_PARAMETER) + MINIMUM_OF_PARAMETER);
            parameters.iterations = Math.floor((Math.random() * MAXIMUM_OF_PARAMETER) + MINIMUM_OF_PARAMETER);

            if (intervalId) {
                tmpImg.src = glitchImageData(image_data_new, parameters);
            }
        }, 60);
    };
    cvs.onmouseleave = function() {
        clearInterval(intervalId);
        intervalId = null;

        setTimeout(function() {
            ctx.drawImage(img, 0, 0, img.width, img.height);
        }, 60);
    };
}

img.src = '1.jpg';