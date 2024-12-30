
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
    contant_geld = 'CONTANT_GELD',
    creditcard = 'CREDITCARD',
    lening = 'LENING',
    reservering = 'RESERVERING'
    }

export const balansRekeningSoorten: RekeningSoort[] = [
    RekeningSoort.betaalrekening, 
    RekeningSoort.spaarrekening, 
    RekeningSoort.contant_geld, 
    RekeningSoort.creditcard, 
    RekeningSoort.lening,
    RekeningSoort.reservering];
export const resultaatRekeningSoorten = [
    RekeningSoort.inkomsten, 
    RekeningSoort.uitgaven];