var sk = this.H.ScoreKeeper,
    fed = new sk.Party('Fed Team').addMember(new sk.Individual('Dan', 'Hintea')),
    rafa = new sk.Party('Rafa Team').addMember(new sk.Individual('Gicu', 'Traian')),
    clash = new sk.Clash([fed, rafa]),
    projector = new sk.Projector(clash);