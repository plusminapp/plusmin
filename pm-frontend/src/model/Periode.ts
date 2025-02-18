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

export const formatPeriode = (periode: Periode): string => {
    return `van ${periode.periodeStartDatum} tot ${periode.periodeEindDatum} (${periode.periodeStatus})`;
}

export const isPeriodeOpen = (gekozenPeriode: Periode) => gekozenPeriode?.periodeStatus === 'OPEN' || gekozenPeriode?.periodeStatus === 'HUIDIG';

