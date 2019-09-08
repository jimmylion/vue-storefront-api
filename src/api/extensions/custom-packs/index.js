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

  mcApi.post('/add/:storeCode', (req, res) => {

    if (!req.body.cartItem) {
			return apiStatus(res, 'No cartItem element provided within the request body', 500)
		}

    const client = Magento2Client({
      ...config.magento2.api,
      url:
        config.magento2.api.url.replace("/rest", "/") +
        req.params.storeCode +
        "/rest"
    });

    client.addMethods("packs", function(restClient) {
      var module = {};

      module.update = function (customerToken, cartId, cartItem, adminRequest = false) {
        if (adminRequest) {
            return restClient.post('/carts/' + cartId + '/items?separate=1&pack_type=parent', { cartItem: cartItem });
        } else {
            if (customerToken && !isNaN(cartId)) {
                return restClient.post('/carts/mine/items?separate=1&pack_type=parent', { cartItem: cartItem }, customerToken);
            } else 
            {
                return restClient.post('/guest-carts/' + cartId + '/items?separate=1&pack_type=parent', { cartItem: cartItem });
            }
        }
      } 
      return module;
    });

    
		client.packs.update(req.query.token, req.query.cartId ? req.query.cartId : null, req.body.cartItem).then((result) => {
			apiStatus(res, result, 200);
		}).catch(err => {
			apiStatus(res, err, 500);
		})

  })

  return mcApi;
};
