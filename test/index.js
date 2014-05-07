
/**
 * Module dependencies.
 */

var Bitid = require('../')
  , should = require('should');

Bitid.version.should.match(/^\d+\.\d+\.\d+$/);

describe('Bitid', function() {
  var nonce ='fe32e61882a71074';
  var callback = 'http://localhost:3000/callback';
  var uri = 'bitid://localhost:3000/callback?x=fe32e61882a71074';
  var address = '1HpE8571PFRwge5coHiFdSCLcwa7qetcn';
  var signature = 'IPKm1/EZ1AKscpwSZI34F5NiEkpdr7QKHeLOPPSGs6TXJHULs7CSNtjurcfg72HNuKvL2YgNXdOetQRyARhX7bg=';

  describe('#qrcode', function() {
    it('should build a qrcode', function() {
      var bitid = new Bitid({nonce:nonce, callback:callback});

      var uri_encoded = escape(bitid.uri);
      ('http://chart.apis.google.com/chart?cht=qr&chs=300x300&chl=' + uri_encoded).should.equal(bitid.qrcode);
    });
  });

  describe('#buildURI', function() {
    it('_uri components', function() {
      var bitid = new Bitid({nonce:nonce, callback:callback});

      should.exist(bitid._uri);
      'bitid:'.should.equal(bitid._uri.protocol);
      'localhost'.should.equal(bitid._uri.hostname);
      bitid._uri.port.should.eql(3000);
      '/callback'.should.equal(bitid._uri.path);
      bitid._uri.href.should.equal(uri);

      nonce.should.equal(bitid._uri.query['x']);
    });

    it('uri string format', function() {
      var bitid = new Bitid({nonce:nonce, callback:callback});

      bitid.uri.should.match(/^bitid\:\/\/localhost\:3000\/callback\?x=[a-z0-9]+$/);
    });

    it('uri string format with unsecure param', function() {
      var bitid = new Bitid({nonce:nonce, callback:callback, unsecure:true});

      bitid.uri.should.match(/^bitid\:\/\/localhost\:3000\/callback\?x=[a-z0-9]+&u=1$/);
    });
  });

  describe('#uriValid', function() {
    it('should accept a valid uri', function() {
      var bitid = new Bitid({address:address, uri:uri, signature:signature, callback:callback});

      bitid.uriValid().should.be.ok;
    });

    it('should fail a bad uri', function() {
      var bitid = new Bitid({address:address, uri:'garbage', signature:signature, callback:callback});

      bitid.uriValid().should.not.be.ok;
    });

    it('should fail a bad protocol', function() {
      var bitid = new Bitid({address:address, uri:'http://localhost:3000/callback?x=fe32e61882a71074', signature:signature, callback:callback});

      bitid.uriValid().should.not.be.ok;
    });

    it('should fail an invalid callback url', function() {
      var bitid = new Bitid({address:address, uri:'site.com/callback?x=fe32e61882a71074', signature:signature, callback:callback});

      bitid.uriValid().should.not.be.ok;
    });
  });

  describe('#signatureValid', function() {
    it('should verify a valid signature', function() {
      var bitid = new Bitid({address:address, uri:uri, signature:signature, callback:callback});

      bitid.signatureValid().should.be.ok;
    });

    it('should not verify an invalid signature', function() {
      var bitid = new Bitid({address:address, uri:uri, signature:'garbage', callback:callback});

      bitid.signatureValid().should.not.be.ok;
    });

    it('should not verify mismatched signature and text', function() {
      var bitid = new Bitid({address:address, uri:uri, signature:'H4/hhdnxtXHduvCaA+Vnf0TM4UqdljTsbdIfltwx9+w50gg3mxy8WgLSLIiEjTnxbOPW9sNRzEfjibZXnWEpde4=', callback:callback});

      bitid.signatureValid().should.not.be.ok;
    });
  });

  describe('#nonce', function() {
    it('should extract the nonce', function() {
      var bitid = new Bitid({address:address, uri:uri, signature:signature, callback:callback});

      bitid.nonce.should.equal('fe32e61882a71074');
    });
  });

  describe('#testnet', function() {
    it('should create a valid signature on testnet', function() {
      var bitid = new Bitid({
        address:'mpsaRD2ugdCY1iFrQdsDYRT4qeZzCnvGHW', 
        uri:'bitid://bitid.bitcoin.blue/callback?x=3893a2a881dd4a1e&u=1',
        signature:'ID5heI0WOeWoryGhZHaxoOH5vkmmcwDsfc4nDQ5vPcXSWh2jyETDGkSNO5zk4nbESGD6k0tgFxYA3HzlEGOf5Uc=',
        callback:'http://bitid.bitcoin.blue/callback'
      });
      bitid.signatureValid().should.be.ok;
    });
  });
});