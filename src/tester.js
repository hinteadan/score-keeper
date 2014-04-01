﻿var sk = this.H.ScoreKeeper,
    fed = new sk.Party('Fed Team').addMember(new sk.Individual('Dan', 'Hintea')),
    rafa = new sk.Party('Rafa Team').addMember(new sk.Individual('Gicu', 'Traian')),
    clash = new sk.Clash([fed, rafa]),
    projector = new sk.Projector(clash),
    championship = new sk.Championship('Hintee\'s Awesome Tournament').addParties(new sk.Logistics.RandomPartiesGenerator([
        new sk.Individual('Dan', 'Hintea'),
        new sk.Individual('Vlad', 'Latis'),
        new sk.Individual('Gicu', 'Traian'),
        new sk.Individual('Andi', 'Roth'),
        new sk.Individual('Paul', 'Parau'),
        new sk.Individual('Dan', 'Podina'),
        new sk.Individual('Sergiu', 'Paraschiv'),
        new sk.Individual('Anca', 'Pascalau'),
        new sk.Individual('Georgiana', 'Pacurar'),
        new sk.Individual('Dora', 'Sipos'),
        new sk.Individual('Cristina', 'Muresan'),
        new sk.Individual('Ioana', 'Gligan'),
        new sk.Individual('Diana', 'Mis')
    ]).cutAndPairParties(2));
