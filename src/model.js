(function (undefined) {
    'use strict';

    function Individual(firstName, lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }

    function Party(name, details) {
        this.name = name;
        this.individuals = [];
        this.details = details || {};
    }

    function Point(party, details) {
        /// <param name='party' type='Party' />
        this.party = party;
        this.timestamp = new Date();
        this.details = details || {};
    }

    function Clash(parties) {
        /// <param name='parties' type='Array' elementType='Party' />

        var points = [];

        function checkPartyIsPartOfThisClash(party) {
            /// <param name='party' type='Party' />
            if (party) {
                for (var i in parties) {
                    if (parties[i] === party) {
                        return;
                    }
                }
            }
            throw new Error("The given party, named <<" + party.name + ">>, is not part of this clash.");
        }

        function scorePointForPartyWithDetails(party, pointDetails) {
            /// <param name='party' type='Party' />
            checkPartyIsPartOfThisClash(party);
            points.push(new Point(party, pointDetails));
        }

        function undoLastPoint() {
            points.pop();
        }

        //Public API
        this.parties = function () { return parties || []; };
        this.points = function () { return points; };
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
    }

    this.H = this.H || {};
    this.H.ScoreKeeper = this.H.ScoreKeeper || {};
    this.H.ScoreKeeper.Individual = Individual;
    this.H.ScoreKeeper.Party = Party;
    this.H.ScoreKeeper.Point = Point;
    this.H.ScoreKeeper.Clash = Clash;

}).call(this);
