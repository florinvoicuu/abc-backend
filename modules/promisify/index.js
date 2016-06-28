"use strict";

module.exports = (fun, args, object) => new Promise ((resolve, reject) => {
    args.push((err, res) => err ? reject(err) : resolve(res));
    fun.apply(object || null, args);
});