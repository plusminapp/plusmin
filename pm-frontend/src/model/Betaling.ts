// import { Gebruiker } from "./Gebruiker";
import { Rekening, RekeningSoort, RekeningSoortPaar } from "./Rekening";

export type Betaling = {
  id: number;
  // gebruiker: Gebruiker;
  boekingsdatum: string;
  bedrag: number;
  saldo_achteraf: number | undefined;
  omschrijving: string | undefined;
  betalingsSoort: BetalingsSoort;
  bron: Rekening | undefined;
  bestemming: Rekening | undefined;
}

export enum BetalingsSoort {
  inkomsten = 'INKOMSTEN',
  uitgaven = 'UITGAVEN',
  aflossen_creditcard = 'AFLOSSEN_CREDITCARD',
  besteden_reservering = 'BESTEDEN_RESERVERING',
  aangaan_lening = 'AANGAAN_LENING',
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
  [BetalingsSoort.inkomsten, { debet: [RekeningSoort.inkomsten], credit: [RekeningSoort.betaalrekening, RekeningSoort.contant, RekeningSoort.creditcard] }],
  [BetalingsSoort.uitgaven, { debet: [RekeningSoort.betaalrekening, RekeningSoort.contant, RekeningSoort.creditcard], credit: [RekeningSoort.uitgaven] }],
  [BetalingsSoort.aflossen_creditcard, { debet: [RekeningSoort.betaalrekening], credit: [RekeningSoort.creditcard] }],
  [BetalingsSoort.besteden_reservering, { debet: [RekeningSoort.betaalrekening, RekeningSoort.contant, RekeningSoort.creditcard], credit: [RekeningSoort.reservering] }],
  [BetalingsSoort.aangaan_lening, { debet: [RekeningSoort.lening], credit: [RekeningSoort.betaalrekening, RekeningSoort.contant, RekeningSoort.creditcard] }],
  [BetalingsSoort.aflossen_lening, { debet: [RekeningSoort.betaalrekening, RekeningSoort.contant, RekeningSoort.creditcard], credit: [RekeningSoort.lening] }],
  [BetalingsSoort.opnemen_spaarrekening, { debet: [RekeningSoort.spaarrekening], credit: [RekeningSoort.betaalrekening] }],
  [BetalingsSoort.storten_spaarrekening, { debet: [RekeningSoort.betaalrekening], credit: [RekeningSoort.spaarrekening] }],
  [BetalingsSoort.opnemen_contant_geld, { debet: [RekeningSoort.betaalrekening], credit: [RekeningSoort.contant] }],
  [BetalingsSoort.storten_contant_geld, { debet: [RekeningSoort.contant], credit: [RekeningSoort.betaalrekening] }],
]);
