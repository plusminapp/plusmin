import React from "react";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
// import ReorderIcon from '@mui/icons-material/Reorder';
// import WavesOutlinedIcon from '@mui/icons-material/WavesOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import VariabeleLastenIcon from "./VariabeleLasten";
import VasteLastenIcon from "./VasteLasten";
import KasIcon from "./Kas";

const ICONS = [ArrowUpwardIcon, ShoppingCartOutlinedIcon, VasteLastenIcon, VariabeleLastenIcon, TaskOutlinedIcon, SavingsOutlinedIcon, KasIcon];
const Legenda = ["Inkomen", "Boodschappen", "Vaste lasten", "Variabele lasten", "Aflossing", "Sparen", "Kas"];
const Voorbeelden = [
  "Salaris, uitkering, AOW, ...",
  "Voedsel, schoonmaakmiddelen, ...",
  "Huur, hypotheek, gemeente belastingen, enrgie, water, verzekeringen, ...",
  "Kleding, ...",
  "Betalingen voor een betaalregeling",
  "Storting op/opname van de spaarrekening",
  "Contant geld, bijvoorbeel in je portemonee"];

const IconList: React.FC = () => {
  return (

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
              <TableCell align="left" size='small' sx={{ p: "6px" }}>
                <Icon key={index} sx={{ fontSize: 20, color: 'grey' }} />
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
  );
};

export default IconList;
