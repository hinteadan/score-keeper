(function (sk, undefined) {
    'use strict';

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
            return names.join('/');
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

    sk.Sattelites = sk.Sattelites || {};
    sk.Sattelites.RandomPartiesGenerator = RandomPartiesGenerator;

}).call(this, this.H.ScoreKeeper);