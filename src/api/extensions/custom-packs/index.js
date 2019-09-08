import { apiStatus } from "../../../lib/util";
import { Router } from "express";
const Magento2Client = require("magento2-rest-client").Magento2Client;

module.exports = ({ config, db }) => {
  let mcApi = Router();

  mcApi.get("/creator/:packId/:storeCode", (req, res) => {

    const client = Magento2Client({
      ...config.magento2.api,
      url:
        config.magento2.api.url.replace("/rest", "/") +
        req.params.storeCode +
        "/rest"
    });

    client.addMethods("packs", function(restClient) {
      var module = {};

      module.get = function() {
        return restClient.get(`/jimmylion/pack/${req.params.packId}`);
      };
      return module;
    });

    client.packs
      .get()
      .then(result => {
        apiStatus(res, result, 200); // just dump it to the browser, result = JSON object
      })
      .catch(err => {
        apiStatus(res, err, 500);
      });

  });

  mcApi.get("/creator/:packId", (req, res) => {

    const client = Magento2Client(config.magento2.api);

    client.addMethods("packs", function(restClient) {
      var module = {};

      module.get = function() {
        return restClient.get(`/jimmylion/pack/${req.params.packId}`);
      };
      return module;
    });

    client.packs
      .get()
      .then(result => {
        apiStatus(res, result, 200); // just dump it to the browser, result = JSON object
      })
      .catch(err => {
        apiStatus(res, err, 500);
      });

  });

  return mcApi;
};
