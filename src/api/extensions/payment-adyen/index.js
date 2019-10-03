import { apiStatus } from "../../../lib/util";
import { Router } from "express";
const Magento2Client = require("magento2-rest-client").Magento2Client;

module.exports = ({ config, db }) => {
  let mcApi = Router();

  mcApi.post("/methods/:storeCode/:cartId", (req, res) => {

    const client = Magento2Client({
      ...config.magento2.api,
      url:
        config.magento2.api.url.replace("/rest", "/") +
        req.params.storeCode +
        "/rest"
    });

    client.addMethods("adyen", function(restClient) {
      var module = {};

      module.methods = function(customerToken, cartId) {
        if (customerToken && !isNaN(cartId)) {
          return restClient.post('/carts/mine/retrieve-adyen-payment-methods', customerToken);
        } else {
          if (req.body.shippingAddress) {
            return restClient.post(`/guest-carts/${cartId}/retrieve-adyen-payment-methods`, {
              shippingAddress: req.body.shippingAddress,
              cartId
            });
          }
          return restClient.post(`/guest-carts/${cartId}/retrieve-adyen-payment-methods`);
        }
      };
      return module;
    });

    client.adyen
      .methods(req.query.token ? req.query.token : null, req.params.cartId)
      .then(result => {
        apiStatus(res, result, 200);
      })
      .catch(err => {
        apiStatus(res, err, 500);
      });
  });

  return mcApi;
};
