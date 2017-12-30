'use strict';
var Mockgen = require('./mockgen.js');
/**
 * Operations on /status
 */
module.exports = {
    /**
     * summary: Get the status of the service
     * description: 
     * parameters: 
     * produces: 
     * responses: 200
     * operationId: status
     */
    get: {
        200: function (req, res, callback) {
            /**
             * Using mock data generator module.
             * Replace this by actual data for the api.
             */
            Mockgen().responses({
                path: '/status',
                operation: 'get',
                response: '200'
            }, callback);
        }
    }
};
