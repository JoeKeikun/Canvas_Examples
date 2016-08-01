(function(scope) {
    var base64_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var base64_map = base64_chars.split('');
    var reversed_base64_map = {};
    base64_map.forEach(function(val, key) {
        reversed_base64_map[val] = key;
    });

    var global_canvas = document.createElement('canvas');
    var global_c = global_canvas.getContext('2d');

    var i;
    var len;


    /*----- 数据格式判断 -----*/
    // 是否为合理的imageData数据
    function isValidImageData(image_data) {
        if (
            checkType(image_data, 'image_data', 'object') &&
            checkType(image_data.width, 'image_data.width', 'number') &&
            checkType(image_data.height, 'image_data.height', 'number') &&
            checkType(image_data.data, 'image_data.data', 'object') &&
            checkType(image_data.data.length, 'image_data.data.length', 'number') &&
            checkNumber(image_data.data.length, 'image_data.data.length', isPositive, '> 0')
        ) {
            return true;
        } else {
            return false;
        }
    }
    // 检查数据类型
    function checkType(it, name, expected_type) {
        if (typeof it === expected_type) {
            return true;
        } else {
            error(it, 'typeof ' + name, '"' + expected_type + '"', '"' + typeof it + '"');
            return false;
        }
    }
    // 检查数字是否满足要求
    function checkNumber(it, name, condition, condition_name) {
        if (condition(it) === true) {
            return true;
        } else {
            error(it, name, condition_name, 'not');
        }
    }
    // 是否为正数
    function isPositive(nr) {
        return (nr > 0);
    }
    // 抛出异常
    function error(it, name, expected, result) {
        throw new Error('glitch(): Expected ' + name + ' to be ' + expected + ', but it was ' + result + '.');
    }


    /*----- 处理函数 -----*/
    // 常用参数
    function getNormalizedParameters(parameters) {
        return {
            seed: (parameters.seed || 0) / 100,
            quality: (parameters.quality || 0) / 100,
            amount: (parameters.amount || 0) / 100,
            iterations: (parameters.iterations || 0)
        };
    }
    // 重设canvas尺寸
    function resizeCanvas(canvas, size) {
        if (canvas.width !== size.width) {
            canvas.width = size.width;
        }

        if (canvas.height !== size.height) {
            canvas.height = size.height;
        }
    }
    // imageData备份
    function getImageDataCopy(image_data) {
        var copy = global_c.createImageData(image_data.width, image_data.height);
        copy.data.set(image_data.data);
        return copy;
    }
    // 从image_data数据提取对应quality质量的base64编码格式数据
    function getBase64FromImageData(image_data, quality) {
        var q = typeof quality === 'number' && quality < 1 && quality > 0 ? quality : 0.1;
        global_c.putImageData(image_data, 0, 0);
        return global_canvas.toDataURL('image/jpeg', q);
    }
    // https://github.com/mutaphysis/smackmyglitchupjs/blob/master/glitch.html, base64 is 2^6, byte is 2^8, every 4 base64 values create three bytes
    // base64转换成字节数组
    function base64ToByteArray(str) {
        var result = [];
        var digit_num;
        var cur;
        var prev;

        for (i = 23, len = str.length; i < len; i++) {
            cur = reversed_base64_map[str.charAt(i)];
            digit_num = (i - 23) % 4;

            switch (digit_num) {
                // case 0: first digit - do nothing, not enough info to work with
                case 1: // second digit
                    result.push(prev << 2 | cur >> 4);
                    break;

                case 2: // third digit
                    result.push((prev & 0x0f) << 4 | cur >> 2);
                    break;

                case 3: // fourth digit
                    result.push((prev & 3) << 6 | cur);
                    break;
            }

            prev = cur;
        }

        return result;
    }
    // 字节数组转换成base64
    function byteArrayToBase64(arr) {
        var result = ['data:image/jpeg;base64,'];
        var byte_num;
        var cur;
        var prev;

        for (i = 0, len = arr.length; i < len; i++) {
            cur = arr[i];
            byte_num = i % 3;

            switch (byte_num) {
                case 0: // first byte
                    result.push(base64_map[cur >> 2]);
                    break;
                case 1: // second byte
                    result.push(base64_map[(prev & 3) << 4 | (cur >> 4)]);
                    break;
                case 2: // third byte
                    result.push(base64_map[(prev & 0x0f) << 2 | (cur >> 6)]);
                    result.push(base64_map[cur & 0x3f]);
                    break;
            }

            prev = cur;
        }

        if (byte_num === 0) {
            result.push(base64_map[(prev & 3) << 4]);
            result.push('==');
        } else if (byte_num === 1) {
            result.push(base64_map[(prev & 0x0f) << 2]);
            result.push('=');
        }

        return result.join('');
    }
    // 获取jpg头的大小
    function getJpegHeaderSize(data) {
        var result = 417;

        for (i = 0, len = data.length; i < len; i++) {
            if (
                data[i] === 0xFF &&
                data[i + 1] === 0xDA
            ) {
                result = i + 2;
                break;
            }
        }

        return result;
    }
    // 图片毛刺效果处理
    function glitchJpegBytes(byte_array, jpg_header_length, seed, amount, i, len) {
        var max_index = byte_array.length - jpg_header_length - 4;
        var px_min = parseInt(max_index / len * i, 10);
        var px_max = parseInt(max_index / len * (i + 1), 10);

        var delta = px_max - px_min;
        var px_i = parseInt(px_min + delta * seed, 10);

        if (px_i > max_index) {
            px_i = max_index;
        }

        var index = Math.floor(jpg_header_length + px_i);

        byte_array[index] = Math.floor(amount * 256);
    }


    /*----- 主处理 -----*/
    scope.glitchImageData = function(image_data, parameters) {
        if (
            isValidImageData(image_data) &&
            checkType(parameters, 'parameters', 'object')
        ) {

            // normalize parameters
            var params = getNormalizedParameters(parameters);

            // resize temp canvases to size of imagedata object
            resizeCanvas(global_canvas, image_data);

            // convert imageData to byte array and get jpg header size
            var base64 = getBase64FromImageData(image_data, params.quality);
            var byte_array = base64ToByteArray(base64);
            var jpg_header_length = getJpegHeaderSize(byte_array);

            // change bytes in the bytearray
            for (i = 0, len = params.iterations; i < len; i++) {
                glitchJpegBytes(
                    byte_array,
                    jpg_header_length,
                    params.seed,
                    params.amount,
                    i,
                    params.iterations
                );
            }

            return byteArrayToBase64(byte_array);
        }
    }
})(window);