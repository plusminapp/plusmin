// import { Gebruiker } from "./Gebruiker";
import dayjs from "dayjs";
import { Rekening, RekeningSoort, RekeningSoortPaar } from "./Rekening";

export type Betaling = {
  id: number;
  boekingsdatum: dayjs.Dayjs;
  bedrag: number;
  omschrijving: string | undefined;
  betalingsSoort: BetalingsSoort;
  bron: Rekening | undefined;
  bestemming: Rekening | undefined;
}

export type BetalingDTO = {
  id: number;
  boekingsdatum: dayjs.Dayjs;
  bedrag: number;
  omschrijving: string | undefined;
  betalingsSoort: BetalingsSoort | undefined;
  bron: string | undefined;
  bestemming: string | undefined;
}

export enum BetalingsSoort {
  inkomsten = 'INKOMSTEN',
  uitgaven = 'UITGAVEN',
  aflossen_creditcard = 'AFLOSSEN_CREDITCARD',
  toevoegen_reservering = 'TOEVOEGEN_RESERVERING',
  besteden_reservering = 'BESTEDEN_RESERVERING',
  // aangaan_lening = 'AANGAAN_LENING',
  aflossen = 'AFLOSSEN',
  opnemen_spaarrekening = 'OPNEMEN_SPAARREKENING',
  storten_spaarrekening = 'STORTEN_SPAARREKENING',
  opnemen_contant = 'OPNEMEN_CONTANT',
  storten_contant = 'STORTEN_CONTANT',
}

export enum BetalingsSuperSoort {
  spaarrekening = 'SPAARREKENING',
  contant = 'CONTANT',
}

export const aflossenReserverenBetalingsSoorten = [
  BetalingsSoort.aflossen_creditcard,
  // BetalingsSoort.aangaan_lening,
  BetalingsSoort.aflossen,
  BetalingsSoort.toevoegen_reservering,
  BetalingsSoort.besteden_reservering,
]

export const aflossenBetalingsSoorten = [
  BetalingsSoort.aflossen_creditcard,
  // BetalingsSoort.aangaan_lening,
  BetalingsSoort.aflossen,
]

export const stortenOpnemenBetalingsSoorten = [
  BetalingsSoort.opnemen_spaarrekening,
  BetalingsSoort.storten_spaarrekening,
  BetalingsSoort.opnemen_contant,
  BetalingsSoort.storten_contant,
]

export const reserverenBetalingsSoorten = [
  BetalingsSoort.toevoegen_reservering,
  BetalingsSoort.besteden_reservering,
]

export const betalingsSoortFormatter = (betalingsSoort: string): string => {
  betalingsSoort = betalingsSoort.split('_').join(' ').toLowerCase();
  return String(betalingsSoort).charAt(0).toUpperCase() + String(betalingsSoort).slice(1);
}

export const currencyFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

export const betalingsSoorten2RekeningenSoorten = new Map<BetalingsSoort, RekeningSoortPaar>([
  [BetalingsSoort.inkomsten, { bron: [RekeningSoort.inkomsten], bestemming: [RekeningSoort.betaalrekening, RekeningSoort.spaarrekening, RekeningSoort.contant] }],
  [BetalingsSoort.uitgaven, { bron: [RekeningSoort.betaalrekening, RekeningSoort.contant, RekeningSoort.creditcard], bestemming: [RekeningSoort.uitgaven] }],
  [BetalingsSoort.aflossen, { bron: [RekeningSoort.betaalrekening], bestemming: [RekeningSoort.creditcard, RekeningSoort.lening] }],
  [BetalingsSoort.besteden_reservering, { bron: [RekeningSoort.betaalrekening, RekeningSoort.contant, RekeningSoort.creditcard], bestemming: [RekeningSoort.reservering] }],
  [BetalingsSoort.opnemen_spaarrekening, { bron: [RekeningSoort.spaarrekening], bestemming: [RekeningSoort.betaalrekening] }],
  [BetalingsSoort.storten_spaarrekening, { bron: [RekeningSoort.betaalrekening], bestemming: [RekeningSoort.spaarrekening] }],
  [BetalingsSoort.opnemen_contant, { bron: [RekeningSoort.betaalrekening], bestemming: [RekeningSoort.contant] }],
  [BetalingsSoort.storten_contant, { bron: [RekeningSoort.contant], bestemming: [RekeningSoort.betaalrekening] }],
]);
