const memcached = require("../helper/memcached");
const dashboardModel  = require("./utils");
exports.hello = async (event, context, callback) => {
  try {
    let data = await memcached.getData("123");
    if (data) {
      response = {
        statusCode: 200,
        body: data,
      };
      return response;
    } else {
      let res = await dashboardModel.getDashBoardData("abs");
      memcached.setData('123', JSON.stringify(res));
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