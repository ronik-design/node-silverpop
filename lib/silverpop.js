'use strict';

var utils = require('./utils');
var http = require('request');
var AccessToken = require('./AccessToken');

/**
 * Silverpop constructor
 * @param  {Object} settings
 */
function Silverpop(settings) {
    var defaults = {
        pod: 1
    };

    this.settings = utils.merge(defaults, settings);
    this.accessToken = null;
    this.endpoint = 'https://api' + this.settings.pod + '.silverpop.com/';

}
module.exports = Silverpop;

function silverpopRequest(endpoint, options, cb) {
    http.post(endpoint, options, function(err, resp, body){
        utils.parseXML(body, function (err, result) {
            result = utils.arrayClean(result);
            if (result.Envelope.Body == '') {
                cb(new Error('Invalid request'), result);
            }
            else if(typeof result.Envelope.Body.RESULT != 'undefined') {

                if (result.Envelope.Body.RESULT.SUCCESS == 'false') {
                    cb(new Error(result.Envelope.Body.Fault.FaultString), result);
                }
                else {
                    cb(null, result);
                }
            }
        });
    });
}

/**
 * Request POST request against Silverpop API
 * @param  {Object} params object
 * @param  {function} cb callback function
 */
Silverpop.prototype.request = function(params, cb){
    var endpoint = this.endpoint,
        payload = {
            Envelope: {
                Body: params
            }
        };

    this.getAccessToken(function(err, accessToken) {
        if(err) {
            cb(err);
            return;
        }

        var options = {
            form: 'xml=' + utils.toXML(payload),
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        };

        silverpopRequest(endpoint + 'XMLAPI', options, cb);
    });
};

Silverpop.prototype.getAccessToken = function(cb){
    if(this.accessToken && !this.accessToken.isExpired()) {
        cb(null, this.accessToken);
    } else {
        this.fetchAccessToken(cb);
    }
};

Silverpop.prototype.fetchAccessToken = function(cb){
    var self = this,
        settings = this.settings;

    if(settings.clientId && settings.clientSecret && settings.refreshToken) {
        var form = {
            grant_type: 'refresh_token',
            client_id: settings.clientId,
            client_secret: settings.clientSecret,
            refresh_token: settings.refreshToken
        };

        http.post(this.endpoint + 'oauth/token', { form: form }, function(err, resp, body){
            if(err) {
                cb(new Error(err))
            } else {
                try {
                    var data = JSON.parse(body);
                    if (data.error) {
                        cb(new Error(data.error_description))
                    } else {
                        self.accessToken = new AccessToken(data.access_token, data.expires_in);
                        cb(null, self.accessToken);
                    }
                } catch (e) {
                    cb(new Error('Failed to parse response: ' + e.message));
                }
            }
        });
    } else {
        cb(new Error('fetchAccessToken requires a valid client id/secret and refresh token'));
    }
};