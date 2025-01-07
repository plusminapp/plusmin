import { Betaling } from "./Betaling";

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

export type RekeningSoortPaar = {
    bron: RekeningSoort[];
    bestemming: RekeningSoort[];
}

export type RekeningPaar = {
    bron: Rekening[];
    bestemming: Rekening[];
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

export const aflossenRekeningSoorten = [
    RekeningSoort.creditcard,
    RekeningSoort.lening];

export const reserverenRekeningSoorten = [
    RekeningSoort.reservering];

export const betaalmethodeRekeningSoorten = [
    RekeningSoort.betaalrekening,
    RekeningSoort.contant,
    RekeningSoort.creditcard,
]

export const berekenBedragVoorRekenining = (betaling: Betaling, rekening: Rekening | undefined) => {
    if (rekening === undefined) return betaling.bedrag // filter = 'all'
    const factor = resultaatRekeningSoorten.includes(rekening.rekeningSoort) ? -1 : 1
    if (betaling.bron?.id === rekening.id) return -betaling.bedrag * factor
    if (betaling.bestemming?.id === rekening.id) return betaling.bedrag * factor
    return 0
  }
  