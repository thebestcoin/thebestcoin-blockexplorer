var request = require('request');

var url_scheme = 'https://';
var base_url = 'bestcoin-exchange-demo.axioma.lv/api/v2/';

function get_summary(coin, exchange, http_user, http_password, cb) {
  var req_url;

  if (http_user !== '' && http_password !== '') {
    req_url = url_scheme + http_user + ':' + http_password + '@' + base_url;
  } else {
    req_url = url_scheme + base_url;
  }

  // @todo: currently the exchange supports only btc
  exchange = 'btc';
  req_url = req_url + 'trades_info?market=' + coin + exchange;

  request({uri: req_url}, function (error, response, body) {
    if (body.length < 1) {
      return cb('Pair not found ' + coin + '-' + exchange, null)
    } else {

      body = JSON.parse(body);

      if (body.result !== true) {
        return cb('There is an error: ' + body.result.message, null)
      }

      return get_btc_price_in_usd(body.price, cb);
    }
  });
}

function get_btc_price_in_usd(btcPrice, cb) {
  request({uri: 'https://blockchain.info/ticker'}, function (error, response, body) {
    if (body.length < 1) {
      return cb('Could not fetch data from blockchain.info', null)
    }

    body = JSON.parse(body);

    if (typeof body.USD === 'undefined') {
      return cb('No USD ticker', null)
    }

    var price = btcPrice * body['USD']['15m'];

    // @todo: only "last" price is available for now
    return cb(null, {
      'high': price,
      'low': price,
      'sell': price,
      'buy': price,
      'last': price
    });
  });
}

module.exports = {
  get_data: function (coin, exchange, http_user, http_password, cb) {
    var error = null;

    get_summary(coin, exchange, http_user, http_password, function (err, stats) {
      if (err) {
        error = err;
      }

      return cb(error, {buys: [], sells: [], chartdata: [], trades: [], stats: stats});
    });
  }
};
