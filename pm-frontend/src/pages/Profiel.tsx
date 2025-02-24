import React, { Fragment } from 'react';

import { Accordion, AccordionDetails, AccordionSummary, Box, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

import { useAuthContext } from "@asgardeo/auth-react";

import { useCustomContext } from '../context/CustomContext';
import { betalingsSoort2Categorie, betalingsSoortFormatter, currencyFormatter } from '../model/Betaling';
import { PeriodeSelect } from '../components/PeriodeSelect';
import { inkomstenRekeningSoorten, Rekening, RekeningSoort, uitgavenRekeningSoorten } from '../model/Rekening';
import { AflossingSamenvattingDTO } from '../model/Aflossing';
import { berekenPeriodeBudgetBedrag } from '../model/Budget';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import { InkomstenIcon } from '../icons/Inkomsten';
import { UitgavenIcon } from '../icons/Uitgaven';
import { InternIcon } from '../icons/Intern';
import NieuweAflossingDialoog from '../components/Aflossing/NieuweAflossingDialoog';

const Profiel: React.FC = () => {
  const { state } = useAuthContext();

  const { gebruiker, actieveHulpvrager, hulpvragers, rekeningen, betaalMethoden, betalingsSoorten2Rekeningen, gekozenPeriode } = useCustomContext();

  const aflossingSamenvatting = (rekening: Rekening): AflossingSamenvattingDTO | undefined =>
    actieveHulpvrager?.aflossingen.filter(a => a.aflossingNaam === rekening.naam)[0]

  const gebudgeteerdPerPeriode = (rekeningSoorten: RekeningSoort[]) => {
    return rekeningen?.
      filter(rekening => rekeningSoorten.includes(rekening.rekeningSoort)).
      reduce((uitgavenAcc, rekening) => {
        const budgetUitgaven = rekening.budgetten.reduce((acc, budget) => {
          return acc + Number(berekenPeriodeBudgetBedrag(gekozenPeriode, budget));
        }, 0);
        const aflossing = aflossingSamenvatting(rekening)
          ? Number(aflossingSamenvatting(rekening)?.aflossingsBedrag)
          : 0;
        return uitgavenAcc + budgetUitgaven + aflossing;
      }, 0) || 0;
  };

  const heeftInkomstenBudgetten = () => {
    return rekeningen?.some(rekening => rekening.budgetten.length > 0 && rekening.rekeningSoort === RekeningSoort.inkomsten);
  }

  const heeftUitgaveBudgetten = () => {
    return rekeningen?.some(rekening => rekening.budgetten.length > 0 && rekening.rekeningSoort === RekeningSoort.uitgaven);
  }

  const creeerBudgetTekst = (): string => {
    const budgetTekst =
      (heeftInkomstenBudgetten() ? `Verwachte inkomsten: ${currencyFormatter.format(gebudgeteerdPerPeriode(inkomstenRekeningSoorten))}. ` : "Er zijn geen Inkomsten budgetten. ") +
      (heeftUitgaveBudgetten() ? `Verwachte uitgaven: ${currencyFormatter.format(gebudgeteerdPerPeriode(uitgavenRekeningSoorten))}. ` : "Er zijn geen Uitgave budgetten. ") +
      (heeftInkomstenBudgetten() && heeftUitgaveBudgetten() ?
        `Verwacht over aan t einde van de maand: ${currencyFormatter.format(gebudgeteerdPerPeriode(inkomstenRekeningSoorten) - gebudgeteerdPerPeriode(uitgavenRekeningSoorten))}.` : "");
    return budgetTekst
  }

  const berekenCategorieIcon = (categorie: string) => {
    switch (categorie) {
      case 'INKOMSTEN':
        return <InkomstenIcon />
      case 'UITGAVEN':
        return <UitgavenIcon />;
      case 'INTERN':
        return <InternIcon />;
      default: return <></>;
    }
  }
  return (
    <Container maxWidth="xl">
      {!state.isAuthenticated &&
        <Typography variant='h4' sx={{ mb: '25px' }}>Je moet eerst inloggen ...</Typography>
      }
      {state.isAuthenticated &&
        <>
          <Typography variant='h4' sx={{ mb: '25px' }}>Hi {gebruiker?.bijnaam}, hoe is 't?</Typography>
          <Typography sx={{ my: '25px' }}>Je bent ingelogd met email "{state.username}".<br />
            Je hebt "{gebruiker?.bijnaam}" als bijnaam gekozen.<br />
            Je {gebruiker?.roles.length && gebruiker?.roles.length > 1 ? " rollen zijn " : " rol is "}
            "{gebruiker?.roles.map(x => x.split('_')[1].toLowerCase()).join('", "')}".
          </Typography>
          {gebruiker?.roles.includes("ROLE_HULPVRAGER") &&
            <Typography sx={{ my: '25px' }}>Je wordt begeleid door "{gebruiker?.vrijwilligerEmail}".
            </Typography>
          }
          {gebruiker?.roles.includes("ROLE_VRIJWILLIGER") &&
            <Typography sx={{ my: '25px' }}>Je begeleidt
              {hulpvragers.length === 0 ? " (nog) niemand " : hulpvragers.length > 1 ? " de hulpvragers " : " de hulpvrager "}
              "{hulpvragers.map(x => x.bijnaam).join('", "')}".
            </Typography>
          }
        </>
      }
      <>
        <Typography variant='h4' sx={{ my: '25px' }}>
          {actieveHulpvrager === gebruiker ? 'Je hebt jezelf gekozen als hulpvrager' : `De gekozen hulpvrager is ${actieveHulpvrager?.bijnaam}`}.</Typography>
        {actieveHulpvrager !== gebruiker &&
          <Typography sx={{ my: '25px' }}>Haar/zijn email is "{actieveHulpvrager?.email}".<br />
            Haar/zijn {actieveHulpvrager?.roles.length && actieveHulpvrager?.roles.length > 1 ? " rollen zijn " : " rol is "}
            "{actieveHulpvrager?.roles.map(x => x.split('_')[1].toLowerCase()).join('", "')}".
          </Typography>}

        <Typography sx={{ my: '25px' }}>{creeerBudgetTekst()}
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
            <Typography sx={{ mt: '25px' }}>De periode wisseldag is de {actieveHulpvrager?.periodeDag}e; de periodes zijn:</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <PeriodeSelect isProfiel={true} />
          </AccordionDetails>
        </Accordion>
        {rekeningen && rekeningen.length > 0 &&
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography >De rekeningen (incl. eventuele Budgetten en Schulden/Aflossingen) zijn:</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', mt: '10px' }}>
                <Table sx={{ width: "100%" }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Soort rekening</TableCell>
                      <TableCell>Gekozen naam</TableCell>
                      <TableCell>Gekoppelde budgetten</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.from(rekeningen.map((rekening) => (
                      <Fragment key={rekening.naam}>
                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} aria-haspopup="true" >
                          <TableCell align="left" size='small' sx={{ p: "6px" }}>{rekening.rekeningSoort}</TableCell>
                          <TableCell align="left" size='small' sx={{ p: "6px" }}>{rekening.naam}</TableCell>
                          <TableCell align="left" size='small' sx={{ p: "6px" }}>
                            {rekening.budgetten.length > 0 &&
                              <span dangerouslySetInnerHTML={{
                                __html: rekening.budgetten.map(b =>
                                  `${b.budgetNaam} (${currencyFormatter.format(Number(b.bedrag))}/${b.budgetPeriodiciteit.toLowerCase()}
                                 ${b.budgetPeriodiciteit.toLowerCase() === 'week' ? `= ${currencyFormatter.format(berekenPeriodeBudgetBedrag(gekozenPeriode, b) ?? 0)}/maand` : ''}
                                 ${b.budgetType.toLowerCase() === 'continu' ? 'doorlopend' : 'op de ' + b.betaalDag + 'e'})`)
                                  .join('<br />') +
                                  (rekening.budgetten.length > 1 ? `<br />Totaal: ${currencyFormatter.format(rekening.budgetten.reduce((acc, b) => acc + Number(b.bedrag), 0))}/maand` : '')
                              }} />}
                            {aflossingSamenvatting(rekening) &&
                              `${aflossingSamenvatting(rekening)?.aflossingNaam} (${currencyFormatter.format(Number(aflossingSamenvatting(rekening)?.aflossingsBedrag))}/maand)`}
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    )))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        }
        {betaalMethoden && betaalMethoden.length > 0 &&
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography >De betaalMethoden zijn:</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {betaalMethoden.map(b => (
                <Typography sx={{ my: '3px' }} key={b.naam}>{b.naam}</Typography>
              ))}
            </AccordionDetails>
          </Accordion>
        }
        {betalingsSoorten2Rekeningen && (Array.from(betalingsSoorten2Rekeningen.entries())).length > 0 &&
          <Accordion>
            <AccordionSummary sx={{ mb: 0 }} expandIcon={<ArrowDropDownIcon />}>
              <Typography >De manier waarop een betaling wordt omgezet naar rekeningen is:</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ mt: 0 }}>
              <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', mt: '10px' }}>
                <Table sx={{ width: "100%" }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Betaling categorie</TableCell>
                      <TableCell>Soort betaling</TableCell>
                      <TableCell>Bron (debet)</TableCell>
                      <TableCell>Bestemming (credit)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.from(betalingsSoorten2Rekeningen.entries()).map((entry) => (
                      <Fragment key={entry[0]}>
                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} aria-haspopup="true" >
                          <TableCell align="left" size='small' sx={{ p: "6px", pl: '16px' }}>{berekenCategorieIcon(betalingsSoort2Categorie(entry[0]) ?? '')}</TableCell>
                          <TableCell align="left" size='small' sx={{ p: "6px" }}>{betalingsSoortFormatter(entry[0])}</TableCell>
                          <TableCell align="left" size='small' sx={{ p: "6px" }}>{entry[1].bron.map(c => c.naam).join(', ')}</TableCell>
                          <TableCell align="left" size='small' sx={{ p: "6px" }}>{entry[1].bestemming.map(c => c.naam).join(', ')}</TableCell>
                        </TableRow>
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>}
        {actieveHulpvrager?.aflossingen && actieveHulpvrager?.aflossingen?.length === 0 &&
          <Accordion expanded={false}>
            <AccordionSummary sx={{ mb: 0 }} expandIcon={<></>}>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Typography >{actieveHulpvrager?.bijnaam} heeft geen Schulden/Aflossingen ingericht.</Typography>
                <NieuweAflossingDialoog
                  onAflossingBewaardChange={() => { }} />
              </Box>
            </AccordionSummary>
          </Accordion>}
        {actieveHulpvrager?.aflossingen && actieveHulpvrager?.aflossingen?.length > 0 &&
          <Accordion >
            <AccordionSummary sx={{ mb: 0 }} expandIcon={<ArrowDropDownIcon />}>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" sx={{ pr: ' 20px' }}>
                <Typography >De Schulden/Aflossingen van {actieveHulpvrager.bijnaam}:</Typography>
                <NieuweAflossingDialoog
                  onAflossingBewaardChange={() => { }} />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ mt: 0 }}>
              <Typography sx={{ m: '10px' }}>
                Maandelijkse aflossing totaal: {currencyFormatter.format(actieveHulpvrager?.aflossingen.reduce((acc, aflossing) => acc + Number(aflossing.aflossingsBedrag), 0))}.
              </Typography>
              {actieveHulpvrager?.aflossingen.map((aflossing: AflossingSamenvattingDTO) => (
                <Typography key={aflossing.aflossingNaam}>
                  {aflossing.aflossingNaam}: maandelijks {currencyFormatter.format(aflossing.aflossingsBedrag)} op de ({aflossing.betaalDag})e.
                </Typography>
              ))}
            </AccordionDetails>
          </Accordion>}
      </>
    </Container >
  );
};

export default Profiel;
