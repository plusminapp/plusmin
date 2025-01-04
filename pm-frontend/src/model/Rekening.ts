
export type Rekening = {
    id: number;
    rekeningSoort: RekeningSoort;
    nummer: string | undefined;
    naam: string;
    afkorting: string;
    sortOrder: number;
}

export enum RekeningSoort {
    inkomsten = 'INKOMSTEN',
    uitgaven = 'UITGAVEN',
    betaalrekening = 'BETAALREKENING',
    spaarrekening = 'SPAARREKENING',
    contant = 'CONTANT',
    creditcard = 'CREDITCARD',
    lening = 'LENING',
    reservering = 'RESERVERING'
}

export const balansRekeningSoorten: RekeningSoort[] = [
    RekeningSoort.betaalrekening,
    RekeningSoort.spaarrekening,
    RekeningSoort.contant,
    RekeningSoort.creditcard,
    RekeningSoort.lening,
    RekeningSoort.reservering];
export const resultaatRekeningSoorten = [
    RekeningSoort.inkomsten,
    RekeningSoort.uitgaven];

export const betaalmethodeRekeningSoorten = [
    RekeningSoort.betaalrekening,
    RekeningSoort.contant,
    RekeningSoort.creditcard,

]