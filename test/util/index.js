
"use strict";

module.exports = {
    errMsg: (res, name) => `
        ${name || 'error'}:
        
        ${JSON.stringify(res[name])}
        
        ${res.statusCode} : ${res.statusMessage}
        `,
    getJWTCookie: headers => {
        if (headers['set-cookie']) {
            for (let cookie of headers['set-cookie']) {
                if (cookie.indexOf('jwt=') === 0) {
                    return cookie.split(';')[0];
                }
            }
        }
        return null;
    },
    getXSRFToken: headers => {
        if (headers['set-cookie']) {
            for (let cookie of headers['set-cookie']) {
                if (cookie.indexOf('XSRF-TOKEN=') === 0) {
                    return cookie.split(';')[0].split('XSRF-TOKEN=')[1];
                }
            }
        }
        return null;
    }
};