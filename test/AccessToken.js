var AccessToken = require('../lib/AccessToken');
var should = require('should');

describe('AccessToken', function(){
    describe('#isExpired()', function() {
        it('returns false when appropriate', function() {
            var token = new AccessToken('abc', 123);
            token.isExpired().should.be.false;
        });
        it('returns true when appropriate', function() {
            var token = new AccessToken('abc', 123);

            // set the requestedTime in 123 seconds in the past
            token.requestedTime -= 123 * 1000;

            token.isExpired().should.be.true;
        });
    });

    describe('#toString()', function() {
        it('returns the key value', function () {
            var token = new AccessToken('abc', 123);
            token.toString().should.equal('abc');
        });

        it('returns key value when coerced ', function() {
            var token = new AccessToken('abc', 123);
            (token + '').should.equal('abc');
        });
    });
});
