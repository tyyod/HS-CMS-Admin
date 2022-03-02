import {baseUrl} from "@/config/env";

export default async({url, data, method = 'GET'}) => {
    method = method.toUpperCase()
    url = baseUrl + url
    if (method === 'GET' && data) {
        let paramsArray = []
        Object.keys(data).forEach(key => {
            paramsArray.push(key + '=' + data[key])
        })
        if (paramsArray) {
            url = url + '?' + paramsArray.join('&');
        }
    }

    if (window.fetch) {
        let config = {
            headers: {
                'Content-Type': 'application/json'
            },
        }
        if (method === 'POST') {
            Object.defineProperty(config, 'body', {
                value: JSON.stringify(data)
            })
        }
        try {
            const response = await fetch(url, config);
            return await response.json()
        } catch (error) {
            throw new Error(error)
        }
    } else {
        return new Promise((resolve, reject) => {
            let requestObj;
            if (window.XMLHttpRequest) {
                requestObj = new XMLHttpRequest();
            } else {
                // eslint-disable-next-line no-undef
                requestObj = new ActiveXObject;
            }

            let sendData = '';
            if (method === 'POST') {
                sendData = JSON.stringify(data);
            }

            requestObj.open(method, url, true);
            requestObj.setRequestHeader("Content-type", "application/json");
            requestObj.send(sendData);

            requestObj.onreadystatechange = () => {
                if (requestObj.readyState === 4) {
                    if (requestObj.status === 200) {
                        let obj = requestObj.response
                        if (typeof obj !== 'object') {
                            obj = JSON.parse(obj);
                        }
                        resolve(obj)
                    } else {
                        reject(requestObj)
                    }
                }
            }
        })
    }
}