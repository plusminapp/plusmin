import { Rekening } from "./Rekening";

export type Budget = {
    rekening: Rekening;
    budgetNaam: string;
    budgetType: string;
    budgetPeriodiciteit: string;
    bedrag: number;
    betaalDag: number;
}

