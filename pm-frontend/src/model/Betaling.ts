// import { Gebruiker } from "./Gebruiker";
import { Rekening } from "./Rekening";

export type Betaling = {
    id: number;
    // gebruiker: Gebruiker;
    boekingsdatum: string;
    bedrag: number;
    saldo_achteraf: number | undefined;
    omschrijving: string | undefined;
    betalingsSoort: string | undefined;
    bron: Rekening | undefined;
    bestemming: Rekening | undefined;
}

export enum BetalingsSoort {
    inkomsten = 'INKOMSTEN',
    uitgaven = 'UITGAVEN',
    aflossen_lening = 'AFLOSSEN_LENING',
    aflossen_creditcard = 'AFLOSSEN_CREDITCARD',
    besteden_reservering = 'BESTEDEN_RESERVERING',
    opnemen_spaargeld = 'OPNEMEN_SPAARREKENING',
    storten_spaargeld = 'STORTEN_SPAARREKENING',
    opnemen_contant_geld = 'OPNEMEN_CONTANT_GELD',
  }

  export const betalingsSoortFormatter = (betalingsSoort: string): string => {
    betalingsSoort = betalingsSoort.split('_').join(' ').toLowerCase();
    return String(betalingsSoort).charAt(0).toUpperCase() + String(betalingsSoort).slice(1);
  }

  export const currencyFormatter = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  });

