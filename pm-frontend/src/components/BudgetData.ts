import dayjs from "dayjs";
import { BudgetDTO } from "../model/Budget";
import { berekenPeriodeBijPeildatum } from "../model/Periode";

const periode = berekenPeriodeBijPeildatum(dayjs());

export const inkomstenBudgetten: BudgetDTO[] = [{
    budgetNaam: 'Salaris',
    budgetPeriodiciteit: 'maand',
    bedrag: 1800,
    betaalDag: 24,
    rekeningNaam: "Inkomsten",
    rekeningSoort: "inkomsten",
    budgetSaldoPeildatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    budgetSaldoBetaling: 0,
}, {
    budgetNaam: 'Toeslagen',
    budgetPeriodiciteit: 'maand',
    bedrag: 450,
    betaalDag: 4,
    rekeningNaam: "Inkomsten",
    rekeningSoort: "inkomsten",
    budgetSaldoPeildatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    budgetSaldoBetaling: 0,
}];

export const boodschappenBudgetten: BudgetDTO[] = [{
    budgetNaam: 'Supermarkt',
    budgetPeriodiciteit: 'maand',
    bedrag: 200,
    betaalDag: undefined,
    rekeningNaam: "Boodschappen",
    rekeningSoort: "uitgaven",
    budgetSaldoPeildatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    budgetSaldoBetaling: 0,
}, {
    budgetNaam: 'Overig',
    budgetPeriodiciteit: 'maand',
    bedrag: 100,
    betaalDag: undefined,
    rekeningNaam: "Boodschappen",
    rekeningSoort: "uitgaven",
    budgetSaldoPeildatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    budgetSaldoBetaling: 0,
}];

export const vastelastenBudgetten: BudgetDTO[] = [{
    budgetNaam: 'Huur',
    budgetPeriodiciteit: 'maand',
    bedrag: 724,
    betaalDag: 1,
    rekeningNaam: "Vaste lasten",
    rekeningSoort: "uitgaven",
    budgetSaldoPeildatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    budgetSaldoBetaling: 0,
}, {
    budgetNaam: 'Greenchoice',
    budgetPeriodiciteit: 'maand',
    bedrag: 169,
    betaalDag: 2,
    rekeningNaam: "Vaste lasten",
    rekeningSoort: "uitgaven",
    budgetSaldoPeildatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    budgetSaldoBetaling: 0,
}, {
    budgetNaam: 'ONVZ',
    budgetPeriodiciteit: 'maand',
    bedrag: 135,
    betaalDag: 7,
    rekeningNaam: "Vaste lasten",
    rekeningSoort: "uitgaven",
    budgetSaldoPeildatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    budgetSaldoBetaling: 0,
}, {
    budgetNaam: 'Overig',
    budgetPeriodiciteit: 'maand',
    bedrag: 150,
    betaalDag: 19,
    rekeningNaam: "Vaste lasten",
    rekeningSoort: "uitgaven",
    budgetSaldoPeildatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    budgetSaldoBetaling: 0,
}];
