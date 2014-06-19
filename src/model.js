(function (escape, all, where, each, find, last) {
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
		this.isMatching = function (otherIndividual) {
			return typeof otherIndividual.id === 'function' ?
                this.id() === otherIndividual.id() :
                this.firstName === otherIndividual.firstName && this.lastName === otherIndividual.lastName;
		};
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
	Party.tie = new Party('Tie');
	Party.tie.isTie = true;

	function Point(party, details) {
		/// <param name='party' type='Party' />
		this.party = party;
		this.timestamp = new Date();
		this.details = details || {};
		this.setTimestamp = function (timestamp) {
			if (!(timestamp instanceof Date)) {
				return;
			}
			this.timestamp = timestamp;
			return this;
		};
	}

	function Clash(parties, details) {
		/// <param name='parties' type='Array' elementType='Party' />

		var self = this,
			points = [],
    		pointsPerParty = {},
			winnerParty = null;

		function checkPartyIsPartOfThisClash(party) {
			/// <param name='party' type='Party' />
			if (party === Party.tie) {
				return;
			}
			if (party) {
				for (var i in parties) {
					if (parties[i] === party) {
						return;
					}
				}
			}
			throw new Error('The given party, named <<' + party.name + '>>, is not part of this clash.');
		}

		function scorePoint(point) {
			/// <param name='point' type='Point' />
			checkPartyIsPartOfThisClash(point.party);
			points.push(point);
			if (!pointsPerParty[point.party.name]) {
				pointsPerParty[point.party.name] = [];
			}
			pointsPerParty[point.party.name].push(point);
		}

		function scorePointForPartyWithDetails(party, pointDetails) {
			/// <param name='party' type='Party' />
			scorePoint(new Point(party, pointDetails));
		}

		function pointsFor(party) {
			/// <param name='party' type='Party' />
			return pointsPerParty[party.name] || [];
		}

		function scoreFor(party) {
			return pointsFor(party).length;
		}

		function undoLastPoint() {
			if (!points.length) {
				return;
			}
			pointsPerParty[points.pop().party.name].pop();
		}

		function closeAndSetWinner(winner, notes) {
			checkPartyIsPartOfThisClash(winner);
			winnerParty = winner;
			self.winnerNotes = notes;
			self.winnerParty = winnerParty;
		}

		function hasEnded() {
			return winnerParty !== null;
		}

		//Public API
		this.details = details || {};
		this.parties = parties;
		this.points = points;
		this.pointsFor = pointsFor;
		this.scoreFor = scoreFor;
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
		this.addPoint = function (point) {
			scorePoint(point);
			return this;
		};
		this.addPoints = function (points) {
			for (var i = 0; i < points.length; i++) {
				scorePoint(points[i]);
			}
			return this;
		};
		this.undoPoint = function () {
			undoLastPoint();
			return this;
		};
		this.close = function (winner, notes) {
			if (hasEnded()) {
				throw new Error('This clash ended already');
			}
			closeAndSetWinner(winner, notes);
			return this;
		};
		this.closeAsTie = function (notes) {
			if (hasEnded()) {
				throw new Error('This clash ended already');
			}
			closeAndSetWinner(Party.tie, notes);
			return this;
		};
		this.isTie = function () {
			return hasEnded() && winnerParty === Party.tie;
		};
		this.hasEnded = hasEnded;
		this.winner = function () { return winnerParty; };
		this.winnerNotes = null;
	}

	function ClashSet(clashes, parties, details) {
		///<param name='clashes' type='Array' elementType='Clash' />

		function scoreFor(party) {
			var score = 0;
			/// <param name='party' type='Party' />
			each(clashes, function (c) {
				/// <param name='c' type='Clash' />
				if (c.winner() === party) {
					score++;
				}
			});
			return score;
		}

		//Public API
		this.details = details || {};
		this.parties = parties;
		this.clashes = clashes;
		this.scoreFor = scoreFor;
		this.hasEnded = function () {
			return all(clashes, function (c) { return c.hasEnded(); });
		};
		this.isTie = function () {
		    var tieScore = scoreFor(parties[0]);
		    return all(parties, function (p) {
		        return scoreFor(p) === tieScore;
		    }) || this.winner() === Party.tie;
		};
		this.winner = function () {
			if (!this.hasEnded()) {
				return null;
			}

			var winner = parties[0],
				winnerScore = scoreFor(winner);

			each(parties, function (p) {
				var score = scoreFor(p);
				if (score > winnerScore) {
					winner = p;
					winnerScore = score;
				}
			});

			return winner;
		};
		this.close = function () {
			if (all(clashes, function (c) { return !c.hasEnded(); })) {
				throw new Error('No clash has ended yet. You probably want to close the set when you have a win scenario!');
			}
			while (!last(clashes).hasEnded()) {
				clashes.pop();
			}
		};

		this.activeClash = function () {
			return find(clashes, function (c) { return !c.hasEnded(); });
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
	this.H.ScoreKeeper.ClashSet = ClashSet;
	this.H.ScoreKeeper.Projector = Projector;

}).call(this, this.escape, this.H.JsUtils.all, this.H.JsUtils.where, this.H.JsUtils.each, this.H.JsUtils.find, this.H.JsUtils.last);
