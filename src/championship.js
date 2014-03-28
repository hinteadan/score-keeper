(function (sk, undefined) {
    'use strict';

    function cloneArray(source) {
        var clone = [];
        for (var i = 0; i < source.length; i++) {
            clone.push(source[i]);
        }
        return clone;
    }

    function splitArray(source, count) {
        /// <param name='source' type='Array' />
        var arrayToSplit = cloneArray(source),
            chunks = [];
        while (arrayToSplit.length) {
            chunks.push(arrayToSplit.splice(0, count));
        }
        return chunks;
    }

    function randomizeArray(source) {
        /// <param name='source' type='Array' />
        var clone = cloneArray(source),
            result = [];

        while (clone.length) {
            var index = Math.round(Math.random() * (clone.length - 1));
            result.push(clone.splice(index, 1)[0]);
        }

        return result;
    }

    function Championship(name, details) {

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
    }

    function RandomPartiesGenerator(individuals) {
        /// <param name='individuals' type='Array' elementType='sk.Individual' />

        function randomizeIndividuals() {
            return randomizeArray(individuals);
        }

        function randomizeChunks(chunks) {
            /// <param name='chunks' type='Array' elementType='Array' />
            for (var i in chunks) {
                chunks[i] = randomizeArray(chunks[i]);
            }
            return chunks;
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

        function pairChunksInParties(chunks) {
            /// <param name='chunks' type='Array' elementType='Array' />
            var parties = [];
            randomizeChunks(chunks);
            for (var row = 0; row < chunks[0].length; row++) {
                var members = [];
                for (var col = 0; col < chunks.length; col++) {
                    if (!chunks[col][row]) {
                        continue;
                    }
                    members.push(chunks[col][row]);
                }
                parties.push(new sk.Party(generatePartyName(members)).addMembers(members));
            }
            return parties;
        }

        this.parties = generateParties;
        this.partiesOf = function (membersCount) {
            return generateParties(membersCount);
        };
        this.cutAndPairParties = function (membersCount) {
            return pairChunksInParties(splitArray(individuals, Math.ceil(individuals.length / membersCount)));
        };
    }

    sk.Championship = Championship;

    sk.Logistics = sk.Logistics || {};
    sk.Logistics.RandomPartiesGenerator = RandomPartiesGenerator;

}).call(this, this.H.ScoreKeeper);