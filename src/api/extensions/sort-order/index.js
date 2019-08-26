import { apiStatus } from "../../../lib/util";
import { Router } from "express";
const Magento2Client = require("magento2-rest-client").Magento2Client;

module.exports = ({ config, db }) => {
  let mcApi = Router();

  mcApi.get("/category/:cid", (req, res) => {
    const client = Magento2Client(config.magento2.api);
    client.addMethods("sortOrder", function(restClient) {
      var module = {};

      module.all = function(categoryId) {
        return restClient.get(`/categories/${categoryId}/products`);
      };
      return module;
    });
    client.sortOrder
      .all(req.params.cid)
      .then(result => {
        apiStatus(res, result, 200); // just dump it to the browser, result = JSON object
      })
      .catch(err => {
        apiStatus(res, err, 500);
      });
  });

  return mcApi;
};
