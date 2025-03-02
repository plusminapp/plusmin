import dayjs from "dayjs";
import { Saldo } from "./Saldo";

export type Periode = {
    id: number;
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

export const eersteOpenPeriode = (periodes: Periode[]): Periode | undefined => {
    const openPeriodes = periodes
        .filter(p => p.periodeStatus === 'OPEN')
        .sort((a, b) => dayjs(a.periodeStartDatum).diff(dayjs(b.periodeStartDatum)));
    
    return openPeriodes.length > 0 ? openPeriodes[0] : undefined;
}

export const laatsteGeslotenPeriode= (periodes: Periode[]): Periode | undefined => {
    const geslotenPeriodes = periodes
        .filter(p => p.periodeStatus === 'GESLOTEN')
        .sort((a, b) => dayjs(b.periodeStartDatum).diff(dayjs(a.periodeStartDatum)));
    
    return geslotenPeriodes.length > 0 ? geslotenPeriodes[0] : undefined;
}

export const formateerNlDatum = (datum: string): string => {
    return new Date(datum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
}
export const formateerNlVolgendeDag = (datum: string): string => {
    const date = new Date(datum);
    date.setDate(date.getDate() + 1); 
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });
}

export const voegEenDagToe = (datum: string): string => {
    const date = new Date(datum);
    date.setDate(date.getDate() + 1); 
    return date.toISOString().split('T')[0];
}