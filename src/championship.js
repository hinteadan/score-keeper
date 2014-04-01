(function (sk, undefined) {
    'use strict';

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
        this.hasEnded = function () {
            var rounds = this.rounds();
            return rounds[rounds.length - 1][0].hasEnded();
        }
    }

    sk.Championship = Championship;

    sk.Logistics = sk.Logistics || {};
    sk.Logistics.SingleEliminationSystem = SingleEliminationSystem;

}).call(this, this.H.ScoreKeeper);