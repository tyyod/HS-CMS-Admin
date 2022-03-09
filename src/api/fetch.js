import {baseUrl} from "@/config/env";

export default async({url, data, method = 'GET'}) => {
    method = method.toUpperCase();
    url = baseUrl + url;

    // 此处规定get请求的参数使用时放在data中，如同post请求
    if (method === 'GET') {
        let dataStr = '';
        Object.keys(data).forEach(key => {
            dataStr += key + '=' + data[key] + '&';
        })

        if (dataStr !== '') {
            dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
            url = url + '?' + dataStr;
        }
    }

    let requestConfig = {
        // fetch默认不会带cookie，需要添加配置项credentials允许携带cookie
        credentials: 'include',
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        mode: "cors", // 以CORS的形式跨域
        cache: "force-cache"
    }

    if (method === 'POST') {
        Object.defineProperty(requestConfig, 'body', {
            value: JSON.stringify(data)
        })
    }

    try {
        const response = await fetch(url, requestConfig);
        const responseJson = await response.json();
        return responseJson
    } catch (error) {
        throw new Error(error)
    }

}