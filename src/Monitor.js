const request = require('request');
const cheerio = require('cheerio');
const JSEncrypt = require('node-jsencrypt');
const Fingerprint2 = require('fingerprintjs2');
const crypto = require('crypto');

class Monitor {
    constructor(site) {
        this.site = site;
    }

    request() {
        var jsencrypt = new JSEncrypt();
        
        const options = {
            url: this.site,
            headers: {
                'User-Agent': 'Mozilla Firefox 36 (Win 8.1 x64): Mozilla/5.0 (Windows NT 6.3; WOW64; rv:36.0) Gecko/20100101 Firefox/36.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Referer': 'https://brandshop.ru/',
                'Host': 'brandshop.ru',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'ru,en-US;q=0.9,en;q=0.8,de;q=0.7',
            },
            timeout: 20000
        };

        request.get(options,function(error, response, body) {
            if (error) {
                return console.log(error);
            }

            var privateKey = body.split('decrypt.setPrivateKey("')[1].split("\");")[0];
            var stringToDecrypt = body.split('decrypt.decrypt("')[1].split("\");")[0];

            var jsencrypt = new JSEncrypt();
            jsencrypt.setPrivateKey(privateKey);
            var ipp_key = jsencrypt.decrypt(stringToDecrypt);

            var prepare1StringBody = body.split('ipp_uid1=')[1];
            var ipp_uid1 = prepare1StringBody.split(';')[0];

            var prepare2StringBody = body.split("ipp_uid2=")[1];
            var ipp_uid2 = prepare2StringBody.split(";")[0];

            var ipp_uid = ipp_uid1 + "/" + ipp_uid2;

            var salt = body.split("salt=\"")[1].split("\";")[0];
            var fingerprint = "d8111849b1c0ac15d4d4e3a4390520f0";
            var strinToMD5 = fingerprint + salt;
            var md5 = crypto.createHash('md5').update(strinToMD5).digest('hex');
            var ipp_sign = fingerprint + "_" + salt + "_" + md5;

            var cookies = {
                'ipp_key': ipp_key,
                'ipp_uid2': ipp_uid2,
                'ipp_uid': ipp_uid,
                'ipp_uid1:': ipp_uid1,
                'ipp_sign': ipp_sign
            };

            const optionsForCookies = {
                url: this.site,
                headers: {
                    'User-Agent': 'Mozilla Firefox 36 (Win 8.1 x64): Mozilla/5.0 (Windows NT 6.3; WOW64; rv:36.0) Gecko/20100101 Firefox/36.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'Referer': 'https://brandshop.ru/',
                    'Host': 'brandshop.ru',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'ru,en-US;q=0.9,en;q=0.8,de;q=0.7',
                    'Cookie': cookies
                },
                timeout: 20000
            }

            request.get(optionsForCookies,function(error, response, body) {
                if (error) {
                    return console.log(error);
                }
            

                console.log(response.statusCode);
                console.log(response.body);
            })
            
        })
    }
}

module.exports = Monitor;