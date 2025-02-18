import dayjs from "dayjs";
import { Rekening } from "./Rekening";
import { Periode } from "./Periode";

export type Budget = {
    rekening: Rekening;
    budgetNaam: string;
    budgetType: string;
    budgetPeriodiciteit: string;
    bedrag: number;
    betaalDag: number;
}

export const berekenBudgetBedrag = (budget: Budget): number => {
    if (budget.budgetPeriodiciteit.toLowerCase() === 'maand') {
        // TODO: implementeer de berekening van het budget bedrag voor de volgende maand
        if (budget.betaalDag > dayjs().date()) {
            return 0;
        } else {
            return budget.bedrag;
        }
    } else { //budget.budgetPeriodiciteit.toLowerCase() === 'week'
        const daysGoneBy = dayjs().diff(dayjs().startOf('month'), 'day') + 1;
        return budget.bedrag * daysGoneBy / 7;
    }
};
export const berekenPeriodeBudgetBedrag = (gekozenPeriode: Periode | undefined, budget: Budget): number | undefined => {
    console.log('budget.naam', budget.budgetNaam);
    if (gekozenPeriode === undefined) {
        return undefined;
    }
    if (budget.budgetPeriodiciteit.toLowerCase() === 'maand') {
        return budget.bedrag;
    } else { //budget.budgetPeriodiciteit.toLowerCase() === 'week'
        const dagenInPeriode = dayjs(gekozenPeriode.periodeEindDatum).diff(dayjs(gekozenPeriode.periodeStartDatum), 'day') + 1;
        return budget.bedrag * dagenInPeriode / 7;
    }
};

