import dayjs from "dayjs";
import { Saldo } from "./Saldo";

export type Periode = {
    periodeStartDatum: string;
    periodeEindDatum: string;
    periodeStatus: string;
    saldoLijst: Saldo[];
}

export const dagenSindsStartPeriode = (gekozenPeriode: Periode | undefined): number | undefined => {
    if (gekozenPeriode === undefined) {
        return undefined;
    }
    if (dayjs().isAfter(dayjs(gekozenPeriode.periodeEindDatum))) {
        return dayjs(gekozenPeriode.periodeEindDatum).diff(dayjs(gekozenPeriode.periodeStartDatum), 'day') + 1;
    } else {
        return dayjs().diff(dayjs(gekozenPeriode.periodeStartDatum), 'day') + 1;
    }
}

export const dagenInPeriode = (gekozenPeriode: Periode | undefined): number | undefined => {
    if (gekozenPeriode === undefined) {
        return undefined;
    }
    return dayjs(gekozenPeriode.periodeEindDatum).diff(dayjs(gekozenPeriode.periodeStartDatum), 'day') + 1;
}

export const isDagNaVandaagInPeriode = (dag: number, gekozenPeriode: Periode | undefined): boolean => {
    if (gekozenPeriode === undefined) {
        return false;
    }
    const startDatum = dayjs(gekozenPeriode.periodeStartDatum);
    const eindDatum = dayjs(gekozenPeriode.periodeEindDatum);
    const vandaag = dayjs();

    if (vandaag.isBefore(startDatum) || vandaag.isAfter(eindDatum)) {
        return false;
    }
    const dagVanVandaag = vandaag.date();
    const dagVanStart = startDatum.date();
    if ((dagVanVandaag <= dagVanStart && dag <= dagVanStart) || (dagVanVandaag > dagVanStart && dag > dagVanStart)) {
        return dag > dagVanVandaag;
    } else {
        return (dagVanVandaag >= dagVanStart);
    }
}

export const formatPeriode = (periode: Periode): string => {
    return `van ${periode.periodeStartDatum} tot ${periode.periodeEindDatum} (${periode.periodeStatus})`;
}

export const isPeriodeOpen = (gekozenPeriode: Periode) => gekozenPeriode?.periodeStatus === 'OPEN' || gekozenPeriode?.periodeStatus === 'HUIDIG';

