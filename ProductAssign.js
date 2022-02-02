const request = require("request");
const BASE_LMS_URL = process.env.BASE_LMS_URL;
const SL_HOST = process.env.SL_HOST;
const ACCOUNTS_HOST = process.env.ACCOUNTS_HOST;
const BASE_ACCOUNTS_URL = process.env.BASE_ACCOUNTS_URL;
const SSP_TOKEN_METHOD = process.env.SSP_TOKEN_METHOD;
const LMS_SECRET_KEY= process.env.LMS_SECRET_KEY;
const md5 = require('md5');
const assignProducts = async (data, order) => {
  let response = {
    status: "success",
    data: [],
    msg: "",
  };
  try {
    const learnerEmails =
      typeof order.registeredEmail != "undefined" ? order.registeredEmail : [];
    const buyerIsLearner =
      typeof order.buyerIsLearner != "undefined" ? order.buyerIsLearner : 1;
    const email = typeof order.email != "undefined" ? order.email : "";
    const type =
      typeof order.order_type != "undefined" && order.order_type
        ? order.order_type
        : "";
    let assignmentData = [];
    if (typeof data != "undefined" && data.length > 0) {
      for (let i = 0; i < data.length > 0; i++) {
        let element = data[i] || {};
        let assignData = typeof element.data != "undefined" ? element.data : {};
        /**
         * undefined checks for data
         */
        for (const key of Object.keys(assignData)) {
          if (typeof assignData[key] == "undefined" || !assignData[key]) {
            assignData[key] = "";
          }
        }
        if (type == "manual_orders") {
          assignData["source"] = "crm";
        }
        let endPoint =
          typeof element.method != "undefined" ? element.method : {};
        for (let j = 0; j < learnerEmails.length; j++) {
          let lernerEmail = learnerEmails[j].email || "";
          let userId = learnerEmails[j].userId || "";
          if (
            typeof buyerIsLearner != "undefined" &&
            buyerIsLearner == 0 &&
            lernerEmail == email
          )
            continue;
          if (
            typeof lernerEmail != "undefined" &&
            lernerEmail &&
            typeof userId != "undefined" &&
            userId
          ) {
            let assignObj = Object.assign({}, assignData);
            assignObj["email"] = lernerEmail;
            assignObj["userId"] = userId;
            assignObj["endPoint"] = endPoint;
            try {
              assignmentData.push(assignObj);
            } catch (error) {
              global.Logger.error(
                "assignProducts::lmsAssignment failed",
                error
              );
            }
          } else {
            global.Logger.error(
              "skipped assignProducts::lmsAssignment userId or email not present "
            );
          }
        }
      }
    }
    let orderAssign = assignmentData.map(lmsAssignment);
    let status = await Promise.all(orderAssign);
    response["data"] = status;
    response["status"] = "success";
  } catch (error) {
    response["msg"] = "assignProducts failed" + JSON.stringify(error);
    global.Logger.error("assignProducts failed", error);
    response["status"] = "failed";
  }
  return response;
};
var lmsAssignment = (data) => {
  return new Promise(function (resolve, reject) {
    try {
      global.Logger.log("asssignment started");
      const timeStamp = new Date().getTime();
      if (
          typeof LMS_SECRET_KEY === "undefined" || !LMS_SECRET_KEY 
      ) {
          throw new Error("LMS_SECRET_KEY is not present");
      }
      const hash = md5(LMS_SECRET_KEY+timeStamp);
      var options = {
        method: "POST",
        url: SL_HOST + BASE_LMS_URL + data["endPoint"],
        formData: data,
        headers: {
          'Authorization': hash,
          'timestamp' : timeStamp
        }
      };
      global.Logger.log("lms Assignment Api Auth Header ", options);
      global.Logger.log("assign input " + JSON.stringify([data]));
      request(options, function (error, response, body) {
        if (error) {
          global.Logger.error("lmsAssignment failed", error);
          reject({});
        }
        global.Logger.log("lmsAssignment request params", data);
        global.Logger.log("lmsAssignment success", body);
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          global.Logger.log("assignProducts > lmsAssignment error", e);
          resolve({});
        }
      });
    } catch (e) {
      global.Logger.error(
        "assignProducts > lmsAssignment error " + e.toString()
      );
      resolve({});
    }
  });
};
let sspTokenGeneration = (data) => {
  return new Promise(function (resolve, reject) {
    try {
      global.Logger.log("sspTokenGeneration started");
      var options = {
        method: "POST",
        url: ACCOUNTS_HOST + BASE_ACCOUNTS_URL + SSP_TOKEN_METHOD,
        formData: data,
      };
      global.Logger.log("sspTokenGeneration input " + JSON.stringify([data]));
      request(options, function (error, response, body) {
        if (error) {
          global.Logger.error("sspTokenGeneration failed", error);
          reject({});
        }
        global.Logger.log("sspTokenGeneration success", body);
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          global.Logger.log("sspTokenGeneration error", e);
          resolve({});
        }
      });
    } catch (e) {
      global.Logger.error("sspTokenGeneration error " + e.toString());
      resolve({});
    }
  });
};
/*
let sendThankYouEmailToManager = (token) => {
    return new Promise(function (resolve, reject) {
        try {
            global.Logger.log('sendThankYouEmailToManager started');
            var options = {
                method: 'GET',
                url: SL_HOST_MASTER,
                qs:
                {
                    method: MANAGER_EMAIL_METHOD,
                    token: token
                }
            };
            global.Logger.log('sendThankYouEmailToManager request params ', options);
            request(options, function (error, response, body) {
                if (error) {
                    global.Logger.error("sendThankYouEmailToManager failed", error);
                    reject({});
                }
                global.Logger.log("sendThankYouEmailToManager success", body);
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    global.Logger.error("sendThankYouEmailToManager error", e);
                    resolve({});
                }
            });
        } catch (e) {
            global.Logger.error("sendThankYouEmailToManager error " + e.toString());
            resolve({});
        }
    });
}
*/
exports.assignProducts = assignProducts;
exports.sspTokenGeneration = sspTokenGeneration;
