global.Logger = console;
const OrderModel = require("./OrderModel");
const ProductAssign = require("./ProductAssign");

exports.handler = async (event) => {
    global.Logger = new AppLog('');
    let response = {
        status: "failed",
        message: "init",
        token: '',
    }
    try {
        const token = event.token || '';
        const orderId = event.orderId || '';
        global.Logger = new AppLog(token);
        global.Logger.log("start");
        // const token = "621ded8cf26c378e8e40dda500c3eb446410477d2c2cc39e75138511f42cf3b2";
        let orderData = await OrderModel.getDataByToken(token);
        let ordersInfo = {};

        // skip already completed
        if(orderData.states && orderData.states.order_assignment) {
            response.status = true;
            response.message = "Success, orderAssign already completed";
            response.token = token;
            response.orderId = orderData.orderId;
            return response;
        }

        // attempt update & verification
        const stateKey = 'order_assignment';
        const attempts = orderData.attempts || {};
        const currentAttempt = (attempts[stateKey] || 0) + 1;
        attempts[stateKey] = currentAttempt;
        await OrderModel.updateOrderData(token, {attempts: attempts});
        global.Logger.log("updateOrderData attempts", attempts);

        if(currentAttempt > 3) {
            response.status = false;
            response.message = "Skip, order assignment failed, reach maximum attempt";
            response.data = null,
            response.token = token;
            response.orderId = orderData.orderId;
            return response;
        }

        global.Logger.log("got order data");
        let assignData = {};
        if (typeof orderData.assignment_data != 'undefined') {
            assignData = orderData.assignment_data;
        }

        let status = true;
        let res = await ProductAssign.assignProducts(assignData, orderData);
        global.Logger.log('order assignment response', JSON.stringify(res));
        let data = res.data || [];
        for (let i in data) {
            let resData = data[i] || {};
            if (typeof resData.status == 'undefined' || resData.status != 'Success') {
                status = false;
                break;
            }
        }
        let sspTokenStatus = false;
        try {
            let tokenDetails = orderData.tokenData || {};
            tokenDetails.gid = orderData.gid || '';
            tokenDetails.order_number = orderData.orderNumber || '';
            let tokenData = await ProductAssign.sspTokenGeneration(tokenDetails);
            sspTokenStatus = true;
            global.Logger.log('sspTokenGeneration response', JSON.stringify(tokenData));
        } catch (e) {
            global.Logger.log('sspTokenGeneration failed', JSON.stringify(e));
        }
        await OrderModel.updateState(token, "ssp_token_status", sspTokenStatus);
        response.token = token;
        response.orderId = orderData.orderId;
        response.status = 'success';
        response.message = 'success';
        if(response.status == 'success'){
            let updateData = await OrderModel.updateState(token, "order_assignment", status);
            global.Logger.log("update order assignment data status", updateData);
        }
    } catch (e) {
        global.Logger.log('error in order assignment', JSON.stringify(e));
        throw e;
    }
    return response;
};

const AppLog = function (id) {
    var action_id = id;
    var time = Date.now();
    const self = this;
    var appLog = function (type, args) {
        if (typeof type === 'string' && typeof console[type] !== 'function') {
            type = 'log';
        }
        args.unshift(type.toUpperCase());
        args.unshift(action_id);
        console[type].apply(console, args);
    };
    this.log = function () {
        appLog('log', Array.prototype.slice.call(arguments));
    };
    this.error = function () {
        appLog('error', Array.prototype.slice.call(arguments));
    };
    this.warn = function () {
        appLog('warn', Array.prototype.slice.call(arguments));
    };
    this.resetTime = function () {
        time = Date.now();
    };
    this.logExectionTime = function (message) {
        self.log((message ? message : "") + " execution time - ", (new Date().getTime() - time) / 1000, " sec");
    };
};