
export type Rekening = {
    id: number;
    rekeningSoort: RekeningSoort;
    nummer: string | undefined;
    naam: string;
    afkorting: string;
}

export enum RekeningSoort {
    inkomsten = 'INKOMSTEN',
    uitgaven = 'UITGAVEN',
    betaalrekening = 'BETAALREKENING',
    spaarrekening = 'SPAARREKENING',
    contant_geld = 'CONTANT_GELD',
    creditcard = 'CREDITCARD',
    betaalregelingen = 'BETAALREGELINGEN',
    reserveringen = 'RESERVERINGEN'
    }

export const balansRekningSoorten: RekeningSoort[] = [RekeningSoort.betaalrekening, 'spaarrekening', 'contant_geld', 'creditcard', 'betaalregelingen', 'reserveringen'];
export const resultaatRekningSoorten = ['inkomsten', 'uitgaven'];