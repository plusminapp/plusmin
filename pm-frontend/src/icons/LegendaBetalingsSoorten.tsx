import React from "react";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
// import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCard';

import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

import VariabeleLastenIcon from "./VariabeleLasten";
import VasteLastenIcon from "./VasteLasten";
import KasIcon from "./Kas";

const ICONS = [ArrowUpwardIcon, ShoppingCartOutlinedIcon, VasteLastenIcon, VariabeleLastenIcon, TaskOutlinedIcon, CreditCardIcon, SavingsOutlinedIcon, SavingsOutlinedIcon, SavingsOutlinedIcon, KasIcon];
const Legenda = ["Inkomen", "Boodschappen", "Vaste lasten", "Andere uitgave", "Aflossen betalingsregeling", "Aflossen creditcard", "Besteding reservering", "Opname spaargeld", "Storten spaargeld", "Opname contant geld"];
const Voorbeelden = [
  "Salaris, uitkering, AOW, ...",
  "Voedsel, schoonmaakmiddelen, ...",
  "Huur, hypotheek, gemeente belastingen, enrgie, water, verzekeringen, ...",
  "Kleding, Niet vergoede medische kosten,  ...",
  "Betalingen voor een betaalregeling",
  "Betalingen van de creditcardschuld",
  "Betaling van iets waarvoor je hebt gespaard",
  "Opname van de spaarrekening",
  "Storting op de spaarrekening",
  "Opname contant geld bij een geldautomaat"];

const LegendaBetalingsSoorten: React.FC = () => {
  return (
    <>
      <Typography variant='h6'>Legenda iconen per betalingssoort</Typography>

      <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', my: '10px' }}>
        <Table sx={{ width: "100%" }} aria-label="simple table">
          <colgroup>
            <col width="10%" />
            <col width="25%" />
            <col width="65%" />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell>&nbsp;</TableCell>
              <TableCell>Legenda</TableCell>
              <TableCell>Voorbeelden</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ICONS.map((Icon, index) => (
              <TableRow >
                <TableCell
                  align="center"
                  size='small'
                  sx={{ p: "6px" }}>
                  <Icon key={index} sx={{ fontSize: 20, color: 'grey', m: '0 auto' }} />
                </TableCell>
                <TableCell>
                  {Legenda[index]}
                </TableCell>
                <TableCell>
                  {Voorbeelden[index]}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default LegendaBetalingsSoorten;
