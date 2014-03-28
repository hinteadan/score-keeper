(function (sk, undefined) {
    'use strict';

    function Championship(name) {

        var parties = [];

        function partyExistsAlready(party) {
            return parties.indexOf(party) >= 0;
        }

        function addParty(party) {
            /// <param name='party' type='sk.Party' />
            if (partyExistsAlready(party)) {
                return;
            }
            parties.push(party);
        }

        this.name = name;
        this.timestamp = new Date();
        this.addParty = function (party) {
            addParty(party);
            return this;
        };
        this.parties = function () {
            /// <returns type='Array' elementType='sk.Party' />
            return parties || [];
        };
    }

    sk.Championship = Championship;

}).call(this, this.H.ScoreKeeper);