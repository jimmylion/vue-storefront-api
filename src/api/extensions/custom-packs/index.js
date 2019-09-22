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

      // 1. We add the pack parent to the cart
      // module.addPackParent = function (customerToken, cartId, cartItem, adminRequest = false) {
      //   if (adminRequest) {
      //       return restClient.post('/carts/' + cartId + '/items?separate=1&pack_type=parent', { cartItem: cartItem });
      //   } else {
      //       if (customerToken && !isNaN(cartId)) {
      //           return restClient.post('/carts/mine/items?separate=1&pack_type=parent', { cartItem: cartItem }, customerToken);
      //       } else 
      //       {
      //           return restClient.post('/guest-carts/' + cartId + '/items?separate=1&pack_type=parent', { cartItem: cartItem });
      //       }
      //   }
      // }

      // // 2. We add the pack packaging to the cart
      // module.addPackPackaging = function (customerToken, cartId, cartItem, packId, adminRequest = false) {
      //   if (adminRequest) {
      //       return restClient.post('/carts/' + cartId + '/items?separate=1&pack_type=packaging&pack_id=' + packId, { cartItem: cartItem });
      //   } else {
      //       if (customerToken && !isNaN(cartId)) {
      //           return restClient.post('/carts/mine/items?separate=1&pack_type=packaging&pack_id=' + packId, { cartItem: cartItem }, customerToken);
      //       } else 
      //       {
      //           return restClient.post('/guest-carts/' + cartId + '/items?separate=1&pack_type=packaging&pack_id=' + packId, { cartItem: cartItem });
      //       }
      //   }
      // }

      // // 3. We add childs to the parent
      // module.addPackChild = function (customerToken, cartId, cartItem, packId, adminRequest = false) {
      //   if (adminRequest) {
      //       return restClient.post('/carts/' + cartId + '/items?separate=1&pack_type=child&pack_id=' + packId, { cartItem: cartItem });
      //   } else {
      //       if (customerToken && !isNaN(cartId)) {
      //           return restClient.post('/carts/mine/items?separate=1&pack_type=child&pack_id=' + packId, { cartItem: cartItem }, customerToken);
      //       } else {
      //           return restClient.post('/guest-carts/' + cartId + '/items?separate=1&pack_type=child&pack_id=' + packId, { cartItem: cartItem });
      //       }
      //   }
      // }


      return module;
    });

    client.packs.addToCart(
      req.query.token,
      req.query.cartId
        ? req.query.cartId
        : null
    ).then(result => {
      apiStatus(res, result, 200);
    }).catch(err => console.error(err))

  //   client.packs.addPackParent(
  //     req.query.token,
  //     req.query.cartId
  //       ? req.query.cartId
  //       : null,
  //     parent
  //   ).then((result) => {

  //     // 1. We added the pack parent to the cart
  //     return client.packs.addPackPackaging(
  //       req.query.token,
  //       req.query.cartId 
  //         ? req.query.cartId 
  //         : null,
  //       packaging,
  //       result.item_id
  //     ).then((result2) => {
      
  //       // 2. We added the pack packaging to the cart
  //       return Promise.all(childs.map(child => {
  //         return client.packs.addPackChild(
  //           req.query.token,
  //           req.query.cartId 
  //             ? req.query.cartId 
  //             : null,
  //           child,
  //           result.item_id
  //         ) 
  //       })).then(lastResult => {

  //         // 3. We added childs to the parent
  //         apiStatus(res, lastResult, 200);
  //       }).catch(err => {

  //         // 3. We could not add childs to the parent
	// 		    apiStatus(res, '3' + err, 500);          
  //       })
  //     }).catch(err => {

  //       // 2. We couldn't add the pack packaging to the cart   
	// 		  apiStatus(res, '2' + err, 500);
  //     })

	// 	}).catch(err => {
  //     // 1. We couldn't add the pack parent to the cart
	// 		apiStatus(res, '1' + err, 500);
	// 	})

  })

  

  return mcApi;
};
