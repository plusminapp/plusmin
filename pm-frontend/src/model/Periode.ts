import { Saldo } from "./Saldo";

export type Periode = {
    periodeStartDatum: string;
    periodeEindDatum: string;
    periodeStatus: string;
    saldoLijst: Saldo[];
}

export const formatPeriode = (periode: Periode): string => {
    return `van ${periode.periodeStartDatum} tot ${periode.periodeEindDatum} (${periode.periodeStatus})`;
}