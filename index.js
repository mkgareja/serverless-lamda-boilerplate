
const dashboardModel = require("./helpers/dashboard");
var Memcached = require('memcached');
const MemObj = new Memcached('104.211.202.29:11211');
exports.handler = async (event, context, callback) => {
  try {
    const variable1 = event.variable1 || '';
    const variable2 = event.variable2 || '';
    let data = await getData("123");
    console.log("here")
    console.log(data)
    if (data) {
      response = {
        statusCode: 200,
        body: data,
      };
      return response;
    } else {
      let res = await dashboardModel.getDashBoardData("abs");
      setData('123', JSON.stringify(res));
      response = {
        statusCode: 200,
        body: res,
      };
      return response;
    }

  } catch (e) {
    throw e;
  }
};
function getData(key) {
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

function setData(key, newData) {
  return new Promise(function (resolve, reject) {
    MemObj.set(key, newData,1000, function (err, data) {
      if (err) {
        console.log(err)
      } else {
        resolve(true);
      }
    })
  })
}