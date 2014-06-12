(function (sk, map, find) {
    'use strict';

    sk.Individual.revive = function (dto) {
        return new sk.Individual(dto.firstName, dto.lastName);
    };

    sk.Party.revive = function (dto, individualsPool) {
        /// <param name='individualsPool' optional='true' />
        return new sk.Party(dto.name, dto.details)
            .addMembers(map(dto.individuals, function (individualDto) {
                if (!individualsPool) {
                    return sk.Individual.revive(individualDto);
                }
                return find(individualsPool, function (p) { return p.isMatching(individualDto); }) ||
                    sk.Individual.revive(individualDto);
            }));

    };

    sk.Point.revive = function (dto, partyPool) {
        /// <param name='partyPool' optional='true' />
        return new sk.Point(
            partyPool ? find(partyPool, function (party) { return party.name === dto.party.name; }) : sk.Party.revive(dto),
            dto.details).setTimestamp(dto.timestamp);

    };

}).call(this, this.H.ScoreKeeper, this.H.JsUtils.map, this.H.JsUtils.find);