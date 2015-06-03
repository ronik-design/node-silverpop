function AccessToken(value, expiresIn) {
    this.value = value;
    this.expiresIn = expiresIn * 1000;
    this.requestedTime = Date.now();
}

AccessToken.prototype = {
    isExpired: function() {
        return Date.now() >= this.expiresIn + this.requestedTime;
    },
    toString: function() {
        return this.value;
    }
};

module.exports = AccessToken;