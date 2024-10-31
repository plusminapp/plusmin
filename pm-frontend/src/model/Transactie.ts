export type Transactie = {
    id: number;
    referentie: string;
    boekingsdatum: string;
    tegenrekening: string;
    naam_tegenrekening: string;
    saldo_vooraf: number | undefined;
    bedrag: number;
    betalingskenmerk: string | undefined;
    omschrijving_bank: string | undefined;
    omschrijving: string | undefined;
    categorie: string | undefined;
    status: string;
}