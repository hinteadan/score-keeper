(function (sk, randomizeArray, undefined) {
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
        var initialClashes = null,
            lastProjectedRounds = null;

        function ensureInitialClashes() {
            if (initialClashes && initialClashes.length) {
                return;
            }
            initialClashes = clashFactory(parties);
        }

        function generateVirtualPartyForFutureWinnerOf(clash) {
            /// <param name='clash' type='sk.Clash' />
            var vsParts = [];
            for (var i = 0; i < clash.parties().length; i++) {
                vsParts.push(clash.parties()[i].name);
            }
            return new sk.Party('<<Winner of: ' + vsParts.join(' vs ') + '>> ', { isVirtual: true });
        }

        function isClashVirtual(clash) {
            /// <param name='clash' type='sk.Clash' />
            return clash.parties()[0].details.isVirtual === true;
        }

        function projectNextRound(currentRound, lastProjectedRound) {
            /// <param name='currentRound' type='Array' elementType='sk.Clash' />
            /// <param name='lastProjectedRound' type='Array' elementType='sk.Clash' />
            if (currentRound.length === 1) {
                throw new Error('This is the final round, there is no next round.');
            }
            var clashes = [];
            for (var i = 0; i < currentRound.length; i += 2) {
                var clash = lastProjectedRound && !isClashVirtual(lastProjectedRound[i / 2]) ?
                            lastProjectedRound[i / 2] :
                            new sk.Clash([
                    currentRound[i].winner() || generateVirtualPartyForFutureWinnerOf(currentRound[i]),
                    currentRound[i + 1] ? currentRound[i + 1].winner() || generateVirtualPartyForFutureWinnerOf(currentRound[i + 1]) : sk.Party.empty
                ]);
                clashes.push(clash);
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
                nextClashes = projectNextRound(rounds[rounds.length - 1], lastProjectedRounds ? lastProjectedRounds[rounds.length] : null);
                rounds.push(nextClashes);
            } while (nextClashes.length > 1);

            lastProjectedRounds = rounds;

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

    sk.Logistics = sk.Logistics || {};
    sk.Logistics.SingleEliminationSystem = SingleEliminationSystem;

}).call(this, this.H.ScoreKeeper, this.H.JsUtils.randomizeArray);