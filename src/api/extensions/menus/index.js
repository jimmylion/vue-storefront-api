import { apiStatus } from "../../../lib/util";
import { Router } from "express";
const Magento2Client = require("magento2-rest-client").Magento2Client;

module.exports = ({ config, db }) => {
  let mcApi = Router();

  mcApi.get("/menus/:storeCode", (req, res) => {
    const client = Magento2Client({
      ...config.magento2.api,
      url:
        config.magento2.api.url.replace("/rest", "/") +
        req.params.storeCode +
        "/rest"
    });
    client.addMethods("menus", function(restClient) {
      var module = {};

      module.get = function() {
        return restClient.post(`/menus?criteria=`);
      };
      return module;
    });
    client.menus
      .get()
      .then(result => {
        apiStatus(res, result, 200); // just dump it to the browser, result = JSON object
      })
      .catch(err => {
        apiStatus(res, err, 500);
      });
  });

  mcApi.get("/menus", (req, res) => {
    const client = Magento2Client(config.magento2.api);
    client.addMethods("menus", function(restClient) {
      var module = {};

      module.get = function() {
        return restClient.post(`/menus?criteria=`);
      };
      return module;
    });
    client.menus
      .get()
      .then(result => {
        apiStatus(res, result, 200); // just dump it to the browser, result = JSON object
      })
      .catch(err => {
        apiStatus(res, err, 500);
      });
  });

  mcApi.get("/nodes/:storeCode/:menuId", (req, res) => {
    const client = Magento2Client({
      ...config.magento2.api,
      url:
        config.magento2.api.url.replace("/rest", "/") +
        req.params.storeCode +
        "/rest"
    });
    client.addMethods("nodes", function(restClient) {
      var module = {};

      module.get = function(menuId) {
        return restClient.post(`/nodes?menuId=${menuId}`);
      };
      return module;
    });
    client.nodes
      .get(req.params.menuId)
      .then(result => {
        apiStatus(res, result, 200); // just dump it to the browser, result = JSON object
      })
      .catch(err => {
        apiStatus(res, err, 500);
      });
  });

  mcApi.get("/nodes/:menuId", (req, res) => {
    const client = Magento2Client(config.magento2.api);
    client.addMethods("nodes", function(restClient) {
      var module = {};

      module.get = function(menuId) {
        return restClient.post(`/nodes?menuId=${menuId}`);
      };
      return module;
    });
    client.nodes
      .get(req.params.menuId)
      .then(result => {
        apiStatus(res, result, 200); // just dump it to the browser, result = JSON object
      })
      .catch(err => {
        apiStatus(res, err, 500);
      });
  });

  return mcApi;
};
