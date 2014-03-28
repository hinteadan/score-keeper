(function (sk, undefined) {
    'use strict';

    function cloneArray(source) {
        var clone = [];
        for (var i = 0; i < source.length; i++) {
            clone.push(source[i]);
        }
        return clone;
    }

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

    function RandomPartiesGenerator(individuals) {
        /// <param name='individuals' type='Array' elementType='sk.Individual' />

        function randomizeIndividuals() {
            var members = cloneArray(individuals),
                result = [];

            while (members.length) {
                var index = Math.round(Math.random() * (members.length - 1));
                result.push(members.splice(index, 1)[0]);
            }

            return result;
        }

        function generatePartyName(partyMembers) {
            /// <param name='partyMembers' type='Array' elementType='sk.Individual' />
            var names = [];
            for (var i = 0; i < partyMembers.length; i++) {
                names.push(partyMembers[i].shortName);
            }
            return names.join(' / ');
        }

        function generateParties(maxMembers) {
            var teamCount = Number(maxMembers) || 2,
                members = randomizeIndividuals(),
                parties = [];

            while (members.length) {
                var partyMembers = members.splice(0, teamCount);
                parties.push(new sk.Party(generatePartyName(partyMembers)).addMembers(partyMembers));
            }

            return parties;
        }

        this.parties = generateParties;
    }

    sk.Championship = Championship;

    sk.Logistics = sk.Logistics || {};
    sk.Logistics.RandomPartiesGenerator = RandomPartiesGenerator;

}).call(this, this.H.ScoreKeeper);