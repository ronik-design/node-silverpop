var Silverpop = require('../lib/Silverpop');
var should = require('should');
var nock = require('nock');

var scope,
    authTokenResponse = {
    "access_token": "accessToken",
    "token_type": "bearer",
    "refresh_token": "refreshToken",
    "expires_in": 123
};

function mockTokenRequest() {
    scope
        .post('/oauth/token')
        .reply(200, authTokenResponse, {'Content-Type': 'application/json'});
}


describe('Silverpop', function() {
    // set up fake server before each test
    before(function() {
        scope = nock('https://api1.silverpop.com');
    });

    after(function() {
        nock.cleanAll();
    });

    describe('#fetchAccessToken()', function () {
        beforeEach(function () {
            mockTokenRequest();
        });

        afterEach(function () {
            nock.cleanAll();
        });

        it('returns an error when the required credentials are missing', function (done) {
            var silverpop = new Silverpop();
            silverpop.fetchAccessToken(function (err) {
                should(err).not.equal(null);
                done();
            })
        });

        it('returns an AccessToken when required credentials are present', function (done) {
            var silverpop = new Silverpop({
                clientId: 'clientId',
                clientSecret: 'clientSecret',
                refreshToken: 'refreshToken'
            });

            silverpop.fetchAccessToken(function (err, accessToken) {
                should(err).equal(null);

                accessToken.isExpired().should.be.false;
                accessToken.toString().should.equal('accessToken');

                done();
            })
        });
    });

    describe('#getAccessToken()', function () {
        beforeEach(function () {
            mockTokenRequest();
        });

        afterEach(function () {
            nock.cleanAll();
        });

        it('only calls the API once to get a valid token', function (done) {
            var silverpop = new Silverpop({
                clientId: 'clientId',
                clientSecret: 'clientSecret',
                refreshToken: 'refreshToken'
            });

            silverpop.getAccessToken(function (err, tokenA) {
                should(err).equal(null);

                silverpop.getAccessToken(function (err, tokenB) {
                    should(err).equal(null);

                    tokenB.should.equal(tokenA);
                    tokenB.isExpired().should.be.false;
                    tokenB.toString().should.equal('accessToken');

                    done();
                });
            })
        });

    });
});

