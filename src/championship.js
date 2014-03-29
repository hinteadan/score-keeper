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

    function ClashFactory(parties) {
        /// <param name='parties' type='Array' elementType='sk.Party' />
        /// <returns type='Array' elementType='sk.Clash' />

        function generateRandomOneOnOneClashes() {
            var randomParties = randomizeArray(parties),
                clashes = [];

            if (randomParties.length % 2 !== 0) {
                randomParties.push(sk.Party.empty);
            }

            while (randomParties.length) {
                clashes.push(new sk.Clash(randomParties.splice(0, 2)));
                if (clashes[clashes.length - 1].parties()[1] === sk.Party.empty) {
                    clashes[clashes.length - 1].close(clashes[clashes.length - 1].parties()[0], 'No opponent, direct advance');
                }
            }
            return clashes;
        }

        return generateRandomOneOnOneClashes();
    }

    function SingleEliminationSystem(parties, clashFactory) {
        /// <param name='parties' type='Array' elementType='sk.Party' />
        /// <param name='clashFactory' type='ClashFactory' optional='true' />
        if (typeof (clashFactory) !== 'function') {
            clashFactory = ClashFactory;
        }

        /// <var type='Array' elementType='sk.Clash' />
        var initialClashes = null;

        function ensureInitialClashes() {
            if (initialClashes && initialClashes.length) {
                return;
            }
            initialClashes = clashFactory(parties);
        }

        function generateVirtualPartyForFutureWinnerOf(clash){
            /// <param name='clash' type='sk.Clash' />
            var vsParts = [];
            for (var i = 0; i < clash.parties().length; i++) {
                vsParts.push(clash.parties()[i].name);
            }
            return new sk.Party('<<Winner of: ' + vsParts.join(' vs ') + '>> ');
        }

        function projectNextRound(currentRound) {
            /// <param name='currentRound' type='Array' elementType='sk.Clash' />
            if (currentRound.length === 1) {
                throw new Error("This is the final round, there is no next round.");
            }
            var clashes = [];
            for (var i = 0; i < currentRound.length; i += 2) {
                clashes.push( new sk.Clash([
                    currentRound[i].winner() || generateVirtualPartyForFutureWinnerOf(currentRound[i]),
                    currentRound[i+1] ? currentRound[i + 1].winner() || generateVirtualPartyForFutureWinnerOf(currentRound[i + 1]) : sk.Party.empty
                ]));
                if (clashes[clashes.length - 1].parties()[1] === sk.Party.empty) {
                    clashes[clashes.length - 1].close(clashes[clashes.length - 1].parties()[0], 'No opponent, direct advance');
                }
            }
            return clashes;
        }

        function projectRounds() {
            ensureInitialClashes();
            if (initialClashes.length <= 1) {
                return [initialClashes];
            }

            var rounds = [initialClashes],
                nextClashes = [];
            
            do {
                nextClashes = projectNextRound(rounds[rounds.length - 1]);
                rounds.push(nextClashes);
            } while (nextClashes.length > 1);

            return rounds;
        }

        function projectWinner() {
            /// <returns type='sk.Party' />
            var rounds = projectRounds(),
                finalClash = rounds[rounds.length - 1][0];
            return finalClash.winner() || generateVirtualPartyForFutureWinnerOf(finalClash);
        }

        this.rounds = projectRounds;
        this.winner = projectWinner;
    }

    function Championship(name, systemOfPlay, details) {
        /// <param name='name' type='String' />
        /// <param name='systemOfPlay' type='SingleEliminationSystem' optional='true' />
        /// <param name='details' type='Object' optional='true' />

        var parties = [];

        if (!systemOfPlay) {
            systemOfPlay = new SingleEliminationSystem(parties);
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

    sk.Championship = Championship;

    sk.Logistics = sk.Logistics || {};
    sk.Logistics.RandomPartiesGenerator = RandomPartiesGenerator;
    sk.Logistics.SingleEliminationSystem = SingleEliminationSystem;

}).call(this, this.H.ScoreKeeper);