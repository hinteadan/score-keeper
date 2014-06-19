(function (sk, map, find) {
    'use strict';

    sk.Individual.revive = function (dto) {
        return new sk.Individual(dto.firstName, dto.lastName);
    };

    sk.Party.revive = function (dto, individualsPool, detailsFactory) {
        /// <param name='individualsPool' optional='true' />
        return new sk.Party(dto.name, detailsFactory ? detailsFactory(dto.details) : dto.details)
            .addMembers(map(dto.individuals, function (individualDto) {
                if (!individualsPool) {
                    return sk.Individual.revive(individualDto);
                }
                return find(individualsPool, function (p) { return p.isMatching(individualDto); }) ||
                    sk.Individual.revive(individualDto);
            }));
    };

    sk.Point.revive = function (dto, partyPool, detailsFactory) {
        /// <param name='partyPool' optional='true' />
        return new sk.Point(
            partyPool ? find(partyPool, function (party) { return party.name === dto.party.name; }) : sk.Party.revive(dto),
            detailsFactory ? detailsFactory(dto.details) : dto.details).setTimestamp(dto.timestamp);
    };

    sk.Clash.revive = function (dto, partyPool, detailsFactory) {
        /// <param name='partyPool' optional='true' />
        var parties = map(dto.parties, function (partyDto) {
                return partyPool ? find(partyPool, function (p) { return p.name === partyDto.name; }) : sk.Party.revive(partyDto);
            }),
            clash = new sk.Clash(parties, detailsFactory ? detailsFactory(dto.details) : dto.details)
            .addPoints(map(dto.points, function (pointDto) {
                return sk.Point.revive(pointDto, parties);
            }));

        if (dto.winnerParty) {
            if (dto.winnerParty.isTie) {
                clash.closeAsTie(dto.winnerNotes);
            }
            else {
                clash.close(find(parties, function (p) { return p.name === dto.winnerParty.name; }), dto.winnerNotes);
            }
        }

        return clash;
    };

    sk.ClashSet.revive = function (dto, partyPool, detailsFactory, clashDetailsFactory) {
        /// <param name='partyPool' optional='true' />
        var parties = map(dto.parties, function (partyDto) {
                return partyPool ? find(partyPool, function (p) { return p.name === partyDto.name; }) : sk.Party.revive(partyDto);
            }),
            clashes = map(dto.clashes, function (clashDto) {
                return sk.Clash.revive(clashDto, parties, clashDetailsFactory);
            });

        return new sk.ClashSet(clashes, parties, detailsFactory ? detailsFactory(dto.details) : dto.details);
    };

}).call(this, this.H.ScoreKeeper, this.H.JsUtils.map, this.H.JsUtils.find);