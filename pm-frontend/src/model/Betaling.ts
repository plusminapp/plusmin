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
  betalingsSoort: BetalingsSoort;
  bron: string | undefined;
  bestemming: string | undefined;
}

export enum BetalingsSoort {
  inkomsten = 'INKOMSTEN',
  uitgaven = 'UITGAVEN',
  aflossen_creditcard = 'AFLOSSEN_CREDITCARD',
  besteden_reservering = 'BESTEDEN_RESERVERING',
  aflossen_lening = 'AFLOSSEN_LENING',
  opnemen_spaarrekening = 'OPNEMEN_SPAARREKENING',
  storten_spaarrekening = 'STORTEN_SPAARREKENING',
  opnemen_contant_geld = 'OPNEMEN_CONTANT_GELD',
  storten_contant_geld = 'STORTEN_CONTANT_GELD',
}

export const aflossenReserverenBetalingsSoorten = [
  BetalingsSoort.aflossen_creditcard,
  BetalingsSoort.aflossen_lening,
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
  [BetalingsSoort.inkomsten, { bron: [RekeningSoort.inkomsten], bestemming: [RekeningSoort.betaalrekening, RekeningSoort.contant] }],
  [BetalingsSoort.uitgaven, { bron: [RekeningSoort.betaalrekening, RekeningSoort.contant, RekeningSoort.creditcard], bestemming: [RekeningSoort.uitgaven] }],
  [BetalingsSoort.aflossen_creditcard, { bron: [RekeningSoort.betaalrekening], bestemming: [RekeningSoort.creditcard] }],
  [BetalingsSoort.besteden_reservering, { bron: [RekeningSoort.betaalrekening, RekeningSoort.contant, RekeningSoort.creditcard], bestemming: [RekeningSoort.reservering] }],
  [BetalingsSoort.aflossen_lening, { bron: [RekeningSoort.betaalrekening, RekeningSoort.contant, RekeningSoort.creditcard], bestemming: [RekeningSoort.lening] }],
  [BetalingsSoort.opnemen_spaarrekening, { bron: [RekeningSoort.spaarrekening], bestemming: [RekeningSoort.betaalrekening] }],
  [BetalingsSoort.storten_spaarrekening, { bron: [RekeningSoort.betaalrekening], bestemming: [RekeningSoort.spaarrekening] }],
  [BetalingsSoort.opnemen_contant_geld, { bron: [RekeningSoort.betaalrekening], bestemming: [RekeningSoort.contant] }],
  [BetalingsSoort.storten_contant_geld, { bron: [RekeningSoort.contant], bestemming: [RekeningSoort.betaalrekening] }],
]);

