import { Gebruiker } from "./Gebruiker";
import { Rekening } from "./Rekening";

export type Betaling = {
    id: number;
    gebruiker: Gebruiker;
    boekingsdatum: string;
    bedrag: number;
    saldo_achteraf: number | undefined;
    omschrijving: string | undefined;
    categorie: string | undefined;
    bron: Rekening | undefined;
    bestemming: Rekening | undefined;
    bank_informatie: string | undefined;
    status: string;
}