(function (undefined) {
    'use strict';

    function Individual(firstName, lastName) {
        /// <param name='firstName' type='String' />
        /// <param name='lastName' type='String' />

        function generateFullName() {
            return firstName && lastName ? firstName + ' ' + lastName :
                firstName && !lastName ? firstName :
                !firstName && lastName ? lastName :
                '<Unknown Individual>';
        }

        function generateShortName() {
            return firstName && lastName ? firstName + ' ' + lastName.substr(0, 1) + '.' :
                firstName && !lastName ? firstName :
                !firstName && lastName ? lastName :
                '<Unknown>';
        }

        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = generateFullName;
        this.shortName = generateShortName;
    }

    function Party(name, details) {

        var individuals = [];

        function addIndividual(person) {
            /// <param name='person' type='Individual' />
            individuals.push(person);
        }

        this.name = name;
        this.individuals = function () {
            /// <returns type='Array' elementType='Individual' />
            return individuals || [];
        };
        this.addMember = function (person) {
            addIndividual(person);
            return this;
        };
        this.addMembers = function (persons) {
            for (var i in persons) {
                addIndividual(persons[i]);
            }
            return this;
        };
        this.details = details || {};
    }
    Party.empty = new Party('Bye Bye');

    function Point(party, details) {
        /// <param name='party' type='Party' />
        this.party = party;
        this.timestamp = new Date();
        this.details = details || {};
    }

    function Clash(parties) {
        /// <param name='parties' type='Array' elementType='Party' />

        var points = [],
            winningParty = null,
            winningNotes;

        function checkPartyIsPartOfThisClash(party) {
            /// <param name='party' type='Party' />
            if (party) {
                for (var i in parties) {
                    if (parties[i] === party) {
                        return;
                    }
                }
            }
            throw new Error('The given party, named <<' + party.name + '>>, is not part of this clash.');
        }

        function scorePointForPartyWithDetails(party, pointDetails) {
            /// <param name='party' type='Party' />
            checkPartyIsPartOfThisClash(party);
            points.push(new Point(party, pointDetails));
        }

        function undoLastPoint() {
            points.pop();
        }

        function closeAndSetWinner(winner, notes) {
            checkPartyIsPartOfThisClash(winner);
            winningParty = winner;
            winningNotes = notes;
        }

        function hasEnded(){
            return winningParty !== null;
        }

        //Public API
        this.parties = function () {
            /// <returns type='Array' elementType='Party' />
            return parties || [];
        };
        this.points = function () {
            /// <returns type='Array' elementType='Point' />
            return points;
        };
        this.pointFor = function (party) {
            scorePointForPartyWithDetails(party, undefined);
        };
        this.pointWith = function (details) {
            return {
                for: function (party) {
                    scorePointForPartyWithDetails(party, details);
                }
            };
        };
        this.undoPoint = undoLastPoint;
        this.close = function (winner, notes) {
            if (hasEnded()) {
                throw new Error('This clash ended already in favor of ' + winningParty.name);
            }
            closeAndSetWinner(winner, notes);
            return this;
        };
        this.hasEnded = hasEnded;
        this.winner = function () {
            /// <returns type='Party' />
            return winningParty;
        };
    }

    function Projector(clash) {
        /// <param name='clash' type='Clash' />

        function getScoreForParty(party) {
            /// <param name='party' type='Party' />
            var score = 0;
            for (var i = 0; i < clash.points().length; i++) {
                if (clash.points()[i].party !== party) {
                    continue;
                }
                score++;
            }
            return score;
        }

        function ScoreInfo(party, score) {
            /// <field name='party' type='Party' />
            /// <field name='score' type='Number' />

            this.party = party;
            this.score = score;
        }

        function projectCurrentScore() {
            /// <returns type='Array' elementType='ScoreInfo' />
            var scoreArray = [];
            for (var i = 0; i < clash.parties().length; i++) {
                scoreArray.push(new ScoreInfo(
                    clash.parties()[i],
                    getScoreForParty(clash.parties()[i]))
                );
            }
            return scoreArray;
        }

        this.score = projectCurrentScore;
    }

    this.H = this.H || {};
    this.H.ScoreKeeper = this.H.ScoreKeeper || {};
    this.H.ScoreKeeper.Individual = Individual;
    this.H.ScoreKeeper.Party = Party;
    this.H.ScoreKeeper.Point = Point;
    this.H.ScoreKeeper.Clash = Clash;
    this.H.ScoreKeeper.Projector = Projector;

}).call(this);
