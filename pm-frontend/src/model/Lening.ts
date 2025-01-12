export type Lening = {

    rekeningNaam: string,
    startDatum: string,
    eindDatum: string,
    eindBedrag: number,
    aflossingsBedrag: number,
    betaalDag: number,
    dossierNummer: string,
    notities: string,
    sortOrder: number,
    leningSaldiDTO: LeningSaldi
}

export type LeningSaldi = {
    peilDatum: string,
    berekendSaldo: number,
    werkelijkSaldo: number
}
