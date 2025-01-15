import dayjs from "dayjs"
import { Rekening } from "./Rekening"

export type Lening = {

    rekening: Rekening,
    startDatum: dayjs.Dayjs,
    eindDatum: dayjs.Dayjs,
    eindBedrag: number,
    aflossingsBedrag: number,
    betaalDag: number,
    dossierNummer: string,
    notities: string,
    leningSaldiDTO: LeningSaldi | undefined
}

export type LeningSaldi = {
    peilDatum: string,
    berekendSaldo: number,
    werkelijkSaldo: number
}
