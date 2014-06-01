(function (escape, undefined) {
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

		function generateId() {
			return escape(generateFullName().toLowerCase().replace(/ /g, ''));
		}

		this.id = generateId;
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

		function removeIndividual(person) {
			var index = individuals.indexOf(person);
			if (index < 0) {
				return;
			}
			individuals.splice(index, 1);
		}

		this.name = name;
		this.individuals = individuals;
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
		this.zapMember = function (person) {
			removeIndividual(person);
			return this;
		};
		this.zapMembers = function (persons) {
			for (var i in persons) {
				removeIndividual(persons[i]);
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

	function Clash(parties, details) {
		/// <param name='parties' type='Array' elementType='Party' />

		var self = this,
			points = [],
    		pointsPerParty = {};

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
			var point = new Point(party, pointDetails);
			points.push(point);
			if (!pointsPerParty[party.name]) {
				pointsPerParty[party.name] = [];
			}
			pointsPerParty[party.name].push(point);
		}

		function pointsFor(party) {
			/// <param name='party' type='Party' />
			return pointsPerParty[party.name] || [];
		}

		function undoLastPoint() {
			if (!points.length) {
				return;
			}
			pointsPerParty[points.pop().party.name].pop();
		}

		function closeAndSetWinner(winner, notes) {
			checkPartyIsPartOfThisClash(winner);
			self.winner = winner;
			self.winnerNotes = notes;
		}

		function hasEnded() {
			return self.winner !== null;
		}

		//Public API
		this.details = details || {};
		this.parties = parties;
		this.points = points;
		this.pointsFor = pointsFor;
		this.pointFor = function (party) {
			scorePointForPartyWithDetails(party, undefined);
			return this;
		};
		this.pointWith = function (details) {
			return {
				for: function (party) {
					scorePointForPartyWithDetails(party, details);
					return this;
				}
			};
		};
		this.undoPoint = function () {
			undoLastPoint();
			return this;
		};
		this.close = function (winner, notes) {
			if (hasEnded()) {
				throw new Error('This clash ended already in favor of ' + self.winner.name);
			}
			closeAndSetWinner(winner, notes);
			return this;
		};
		this.hasEnded = hasEnded;
		this.winner = null;
		this.winnerNotes = null;
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

}).call(this, this.escape);
