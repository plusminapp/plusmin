import dayjs from "dayjs";
import { Rekening } from "./Rekening";

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

