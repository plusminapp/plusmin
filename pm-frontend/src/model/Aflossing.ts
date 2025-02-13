import dayjs from "dayjs"
import { Rekening } from "./Rekening"

export type Aflossing = {

    rekening: Rekening,
    startDatum: dayjs.Dayjs,
    eindDatum: dayjs.Dayjs,
    eindBedrag: number,
    aflossingsBedrag: number,
    betaalDag: number,
    dossierNummer: string,
    notities: string,
    aflossingSaldiDTO: AflossingSaldi | undefined
}

export type AflossingSaldi = {
    peilDatum: string,
    berekendSaldo: number,
    werkelijkSaldo: number,
    betaling: number
}
