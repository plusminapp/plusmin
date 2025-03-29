import dayjs from "dayjs";
import { BudgetDTO } from "../model/Budget";
import { berekenPeriodeBijPeildatum } from "../model/Periode";

export const inkomstenBudgetten: BudgetDTO[] = [{
    budgetNaam: 'Salaris',
    budgetPeriodiciteit: 'maand',
    bedrag: 1800,
    betaalDag: 24,
    rekeningNaam: "Inkomsten",
    rekeningSoort: "inkomsten",
    budgetSaldoPeildatum: dayjs().format('YYYY-MM-DD'),
    budgetSaldoBetaling: 1800,
}, {
    budgetNaam: 'Toeslagen',
    budgetPeriodiciteit: 'maand',
    bedrag: 450,
    betaalDag: 4,
    rekeningNaam: "Inkomsten",
    rekeningSoort: "inkomsten",
    budgetSaldoPeildatum: dayjs().format('YYYY-MM-DD'),
    budgetSaldoBetaling: 450,
}];

const periode = berekenPeriodeBijPeildatum(dayjs());
const verwachtIniteelBudget = (budget: number): number => {
    const periodeLengte = dayjs(periode.periodeEindDatum).diff(dayjs(periode.periodeStartDatum), 'day') + 1;
    const dagenTotPeilDatum = dayjs().diff(dayjs(periode.periodeStartDatum), 'day') + 1;
    return Math.round((dagenTotPeilDatum / periodeLengte) * budget);
}

export const boodschappenBudgetten: BudgetDTO[] = [{
    budgetNaam: 'Supermakt',
    budgetPeriodiciteit: 'maand',
    bedrag: 200,
    betaalDag: undefined,
    rekeningNaam: "Boodschappen",
    rekeningSoort: "uitgaven",
    budgetSaldoPeildatum: dayjs().format('YYYY-MM-DD'),
    budgetSaldoBetaling: verwachtIniteelBudget(200),
}, {
    budgetNaam: 'Overig',
    budgetPeriodiciteit: 'maand',
    bedrag: 100,
    betaalDag: undefined,
    rekeningNaam: "Boodschappen",
    rekeningSoort: "uitgaven",
    budgetSaldoPeildatum: dayjs().format('YYYY-MM-DD'),
    budgetSaldoBetaling: verwachtIniteelBudget(100),
}];

export const vastelastenBudgetten: BudgetDTO[] = [{
    budgetNaam: 'Huur',
    budgetPeriodiciteit: 'maand',
    bedrag: 724,
    betaalDag: 1,
    rekeningNaam: "Vaste lasten",
    rekeningSoort: "uitgaven",
    budgetSaldoPeildatum: dayjs().format('YYYY-MM-DD'),
    budgetSaldoBetaling: 724,
}, {
    budgetNaam: 'Greenchoice',
    budgetPeriodiciteit: 'maand',
    bedrag: 169,
    betaalDag: 2,
    rekeningNaam: "Vaste lasten",
    rekeningSoort: "uitgaven",
    budgetSaldoPeildatum: dayjs().format('YYYY-MM-DD'),
    budgetSaldoBetaling: 169,
}, {
    budgetNaam: 'ONVZ',
    budgetPeriodiciteit: 'maand',
    bedrag: 135,
    betaalDag: 7,
    rekeningNaam: "Vaste lasten",
    rekeningSoort: "uitgaven",
    budgetSaldoPeildatum: dayjs().format('YYYY-MM-DD'),
    budgetSaldoBetaling: 135,
}, {
    budgetNaam: 'Overig',
    budgetPeriodiciteit: 'maand',
    bedrag: 150,
    betaalDag: 19,
    rekeningNaam: "Vaste lasten",
    rekeningSoort: "uitgaven",
    budgetSaldoPeildatum: dayjs().format('YYYY-MM-DD'),
    budgetSaldoBetaling: 150,
}];
