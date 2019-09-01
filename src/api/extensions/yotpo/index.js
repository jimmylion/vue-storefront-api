import { apiStatus } from '../../../lib/util';
import { Router } from 'express';
const Magento2Client = require('magento2-rest-client').Magento2Client;

module.exports = ({ config, db }) => {
  let mcApi = Router();

  mcApi.get('/:storeCode', (req, res) => {
    const client = Magento2Client({
      ...config.magento2.api,
      url:
        config.magento2.api.url.replace('/rest', '/') +
        req.params.storeCode +
        '/rest'
    });
    client.addMethods('reviews', function(restClient) {
      var module = {};

      module.totals = function() {
        return restClient.get(`/jimmylion-yotpo/totals`);
      };
      return module;
    });
    client.reviews
      .totals()
      .then(result => {
        apiStatus(res, result, 200); // just dump it to the browser, result = JSON object
      })
      .catch(err => {
        apiStatus(res, err, 500);
      });
  });

  mcApi.get('/', (req, res) => {
    const client = Magento2Client(config.magento2.api);
    client.addMethods('reviews', function(restClient) {
      var module = {};

      module.totals = function() {
        return restClient.get(`/jimmylion-yotpo/totals`);
      };
      return module;
    });
    client.reviews
      .totals()
      .then(result => {
        apiStatus(res, result, 200); // just dump it to the browser, result = JSON object
      })
      .catch(err => {
        apiStatus(res, err, 500);
      });
  });

  return mcApi;
};
