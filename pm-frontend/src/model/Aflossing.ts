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

export type AflossingSamenvattingDTO = {
    aflossingNaam: string,
    aflossingsBedrag: number,
    betaalDag: number,
}

export const berekenAflossingTotaal = (aflossingen: Aflossing[]): number => {
    return aflossingen.reduce((acc, aflossing) => acc + aflossing.aflossingsBedrag, 0)
}  