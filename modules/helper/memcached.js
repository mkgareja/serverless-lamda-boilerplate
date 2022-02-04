var Memcached = require('memcached');
const MemObj = new Memcached('104.211.202.29:11211');

const getData = async (key) => {
    return new Promise(function (resolve, reject) {
        MemObj.get(key, function (err, data) {
            if (err) {
                console.log(err)
            } else {
                console.log('here 2')
                console.log(data)
                resolve(data);
            }
        })
    })
}

const setData = async (key, newData) => {
    return new Promise(function (resolve, reject) {
        MemObj.set(key, newData, 1000, function (err, data) {
            if (err) {
                console.log(err)
            } else {
                resolve(true);
            }
        })
    })
}

exports.getData = getData;
exports.setData = setData;