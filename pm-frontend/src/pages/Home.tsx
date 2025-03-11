import { Typography } from "@mui/material";
import dayjs from "dayjs";
import ChartExample from "../components/Budget/ChartExample";
import { Budget } from "../model/Budget";

// experimenteer
const peilDatum = dayjs();
const budget = {
  budgetNaam: 'budget',
  budgetType: 'continu',
  budgetPeriodiciteit: 'week',
  bedrag: 100,
  budgetten: [],
} as unknown as Budget;

export default function Home() {
  return (
    <>
      <Typography variant='h4'>Dit is de App van de PlusMin gereedschapskist.</Typography>
      <Typography sx={{ my: '25px' }}>
        Deze App is een demo app en dus NIET de uiteindelijke app voor de gebruiker. Het is bedoeld om de werking van de toekomstige app uit te kunnen leggen.
      </Typography>
      <Typography sx={{ my: '25px' }}>
        Op <a href="https://plusmingereedschapskist.nl">https://plusmingereedschapskist.nl</a> kun je meer informatie vinden.
      </Typography>
      <ChartExample peildatum={peilDatum} budget={budget} besteedOpPeildatum={200} />
    </>
  )
}