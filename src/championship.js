(function (sk, undefined) {
    'use strict';

    function Championship(name, systemOfPlay, details) {
        /// <param name='name' type='String' />
        /// <param name='systemOfPlay' type='sk.Logistics.SingleEliminationSystem' optional='true' />
        /// <param name='details' type='Object' optional='true' />

        var parties = [];

        if (!systemOfPlay) {
            systemOfPlay = new sk.Logistics.SingleEliminationSystem(parties);
        }

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
        this.details = details || {};
        this.timestamp = new Date();
        this.addParty = function (party) {
            addParty(party);
            return this;
        };
        this.addParties = function (parties) {
            /// <param name='parties' type='Array' elementType='sk.Party' />
            for (var i in parties) {
                addParty(parties[i]);
            }
            return this;
        };
        this.parties = function () {
            /// <returns type='Array' elementType='sk.Party' />
            return parties || [];
        };
        this.rounds = systemOfPlay.rounds;
        this.winner = systemOfPlay.winner;
        this.hasEnded = function () {
            var rounds = this.rounds();
            return rounds[rounds.length - 1][0].hasEnded();
        };
    }

    sk.Championship = Championship;

}).call(this, this.H.ScoreKeeper);