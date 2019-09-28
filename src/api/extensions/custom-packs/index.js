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

  mcApi.delete('/:packId/:storeCode', (req, res) => {
    
    if (!req.params.packId) {
			return apiStatus(res, 'packId not provided', 500)
    }

    if (!req.params.storeCode) {
			return apiStatus(res, 'storeCode not provided', 500)
    }

    if (!req.query.cartId) {
			return apiStatus(res, 'cartId not provided', 500)
    }
    
    const { packId, storeCode } = req.params

    const client = Magento2Client({
      ...config.magento2.api,
      url:
        config.magento2.api.url.replace("/rest", "/") +
        storeCode +
        "/rest"
    });

    client.addMethods("packs", function(restClient) {
      var module = {};

      // All in one
      module.remove = function (customerToken, cartId, adminRequest = false) {
        if (adminRequest) {
            return restClient.delete('/carts/' + cartId + '/packs/' + packId);
        } else {
            if (customerToken && !isNaN(cartId)) {
                return restClient.delete('/carts/mine/packs/' + packId, customerToken);
            } else 
            {
                return restClient.delete('/guest-carts/' + cartId + '/packs/' + packId);
            }
        }
      }

      return module;
    });

    client.packs.remove(
      req.query.token,
      req.query.cartId
        ? req.query.cartId
        : null
    ).then(result => {
      apiStatus(res, result, 200);
    }).catch(err => console.error(err))

  })

  mcApi.post('/add/:storeCode', (req, res) => {
    if (!req.body.packType) {
			return apiStatus(res, 'packType not provided', 500)
    }
    
    if (!req.body.packSize) {
			return apiStatus(res, 'packSize not provided', 500)
    }
    
    if (!req.body.childs) {
			return apiStatus(res, 'Child products [childs] not provided', 500)
    }

    if (!req.body.packagingId) {
			return apiStatus(res, 'packagingId not provided', 500)
    }

    if (!req.body.cartId) {
			return apiStatus(res, 'cartId not provided', 500)
    }
    
    const { packSize, packType, childs, cartId, packagingId } = req.body
    const packCapacity = +(packSize.split('-')[0])

    if (childs.length !== packCapacity) {
			return apiStatus(res, 'Bad amount of childs provided', 500)
    }

    const packItems = [
      {
        sku: `${packSize}-${packType}`,
        qty: 1,
        price: 0,
        pack_type: 'parent'
      },
      {
        sku: packagingId,
        qty: 1,
        price: 0,
        pack_type: 'packaging'
      },
      ...childs
    ]

    const client = Magento2Client({
      ...config.magento2.api,
      url:
        config.magento2.api.url.replace("/rest", "/") +
        req.params.storeCode +
        "/rest"
    });

    client.addMethods("packs", function(restClient) {
      var module = {};

      // All in one
      module.addToCart = function (customerToken, cartId, adminRequest = false) {
        if (adminRequest) {
            return restClient.post('/carts/' + cartId + '/packs', { packItems });
        } else {
            if (customerToken && !isNaN(cartId)) {
                return restClient.post('/carts/mine/packs', { packItems }, customerToken);
            } else 
            {
                return restClient.post('/guest-carts/' + cartId + '/packs', { packItems });
            }
        }
      }

      return module;
    });

    client.packs.addToCart(
      req.query.token,
      cartId ? cartId : null
    ).then(result => {
      apiStatus(res, result, 200);
    }).catch(err => console.error(err))

  })

  return mcApi;
};
