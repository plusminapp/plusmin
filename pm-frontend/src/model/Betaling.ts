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
    aflossing_lening = 'AFLOSSING_LENING',
    aflossing_creditcard = 'AFLOSSING_CREDICARD',
    besteding_reservering = 'BESTEDING_RESERVERING',
    opname_spaargeld = 'OPNAME_SPAARGELD',
    storten_spaargeld = 'STORTING_SPAARGELD',
    opname_contant_geld = 'OPNAME_CONTANT_GELD',
  }