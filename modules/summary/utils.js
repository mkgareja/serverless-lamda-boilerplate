const request = require("request");

const getDashBoardData = async (data) => {
    let finalData = getData(data);
    return finalData;
}

var getData = (data) => {
    return new Promise(function (resolve, reject) {
        try {
            var options = {
                method: "GET",
                url: "https://catfact.ninja/fact",
            };
            
            request(options, function (error, response, body) {
                if (error) {
                    console.log(error)
                    throw new Error(error);
                }
                try {
                    // console.log(body)
                    resolve(body);
                } catch (e) {
                    console.log(e)
                    resolve({});
                }
            });
        } catch (e) {
            console.log(e)
            resolve({});
        }
    });
};
exports.getDashBoardData = getDashBoardData;