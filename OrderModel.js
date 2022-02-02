var AWS = require("aws-sdk");
AWS.config.update({ region: process.env.DEFAULT_AWS_REGION, apiVersion: 'latest' });
const dynamodb = new AWS.DynamoDB.DocumentClient({convertEmptyValues: true});
const TABLE_NAME = process.env.DYNAMO_DB_TABLE_NAME_ORDER;

const getDataByToken = function(token) {
    const ACTION = 'getDataByToken';
    return new Promise(function (resolve, reject) {
        var params = {
            TableName: TABLE_NAME,
            KeyConditionExpression:"#token = :token",
            ExpressionAttributeNames: {
                "#token": "token",
            },
            ExpressionAttributeValues: {
                ":token" : token,
            }
        };
        dynamodb.query(params, (err, data) => {
            if (err) {
                global.Logger.error(ACTION + " error", err);
                reject(err);
                return;
            }
            if(data && Array.isArray(data.Items)) {
                resolve(data.Items[0] || {});
            } else {
                resolve({});
            }
        });
    });
};
var updateOrderData = function (token, data) {
    return new Promise(function (resolve, reject) {
        try {
            if (typeof token === 'undefined' || !token || typeof data !== 'object') {
                throw new Error("invalid params for update");
            }
            var updateExpressions = [];
            var expressionAttributeNames = {};
            var expressionAttributeValues = {};
            Object.keys(data).forEach(function (key) {
                updateExpressions.push("#" + key + " = :" + key);
                expressionAttributeNames["#" + key] = key;
                expressionAttributeValues[":" + key] = data[key];
            });

            var params = {
                TableName: TABLE_NAME,
                Key: { "token": token },
                UpdateExpression: "set " + updateExpressions.join(", "),
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: "UPDATED_NEW"
            };

            dynamodb.update(params, function (err, data) {
                if (err) {
                    global.Logger.error("Orders Model updateFields failed", err.toString());
                    reject(err);
                } else {
                    global.Logger.log("Orders Model Fields updated succesfully");
                    resolve("updateFields success:", data);
                }
            });
        } catch (e) {
            global.Logger.error("Error::", e.toString());
            reject(e);
        }

    })
}

var updateState = function (token, key, value) {
    return new Promise(function (resolve, reject) {
        try {
            if (typeof token === 'undefined' || !token || !key || typeof value == "undefined") {
                throw new Error("invalid params for update");
            }
            var updateExpressions = [];
            var expressionAttributeNames = {};
            var expressionAttributeValues = {};
            updateExpressions.push(`#states.#${key} = :${key}`);
            expressionAttributeNames["#states"] = "states";
            expressionAttributeNames["#" + key] = key;
            expressionAttributeValues[":" + key] = value;
            var params = {
                TableName: TABLE_NAME,
                Key: { "token": token },
                UpdateExpression: "set " + updateExpressions.join(", "),
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: "UPDATED_NEW"
            };

            dynamodb.update(params, function (err, data) {
                if (err) {
                    global.Logger.error("Orders Model updateFields failed", err.toString());
                    reject(err);
                } else {
                    global.Logger.log("Orders Model Fields updated succesfully");
                    resolve("updateFields success:", data);
                }
            });
        } catch (e) {
            global.Logger.error("Error::", e.toString());
            reject(e);
        }

    })
}

module.exports.updateState = updateState;
module.exports.updateOrderData = updateOrderData;
exports.getDataByToken = getDataByToken;
    
