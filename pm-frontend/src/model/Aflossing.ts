import dayjs from "dayjs"
import { Rekening } from "./Rekening"
import { isDagNaVandaagInPeriode, Periode } from "./Periode"

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

export const berekenAflossingsBedrag = (aflossing: AflossingSamenvattingDTO, gekozenPeriode: Periode): number => {
    if (isDagNaVandaagInPeriode(aflossing.betaalDag, gekozenPeriode)) {
        return 0;
    } else {
        return aflossing.aflossingsBedrag;
    }
};

export const berekenMaandAflossingenBedrag = (aflossingen: AflossingSamenvattingDTO[]) => aflossingen.
    reduce((acc: number, aflossing: AflossingSamenvattingDTO) => acc + aflossing.aflossingsBedrag, 0) ?? 0;

export const berekenAflossingenBedrag = (aflossingen: AflossingSamenvattingDTO[], gekozenPeriode: Periode | undefined) => {
    if (gekozenPeriode === undefined) {
        return 0;
    } else {
        return aflossingen.reduce((acc: number, aflossing: AflossingSamenvattingDTO) => acc + berekenAflossingsBedrag(aflossing, gekozenPeriode), 0) ?? 0;
    }
}