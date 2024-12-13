
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

export const balansRekningSoorten: RekeningSoort[] = [
    RekeningSoort.betaalrekening, 
    RekeningSoort.spaarrekening, 
    RekeningSoort.contant_geld, 
    RekeningSoort.creditcard, 
    RekeningSoort.betaalregelingen, 
    RekeningSoort.reserveringen];
export const resultaatRekningSoorten = [
    RekeningSoort.inkomsten, 
    RekeningSoort.uitgaven];