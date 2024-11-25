import React from "react";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ReorderIcon from '@mui/icons-material/Reorder';
// import WavesOutlinedIcon from '@mui/icons-material/WavesOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import { Typography } from "@mui/material";

const ICONS = [ArrowUpwardIcon, ShoppingCartOutlinedIcon, ReorderIcon, WavesOutlinedIcon, TaskOutlinedIcon, SavingsOutlinedIcon];
const Legenda = ["Inkomen", "Boodschappen", "Vaste lasten", "Variabele lasten", "Aflossing", "Sparen"];

const IconList: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: 'column', gap: "16px" }}>
      {ICONS.map((Icon, index) => (
        <Typography variant='body1' >
          <Icon key={index} sx={{ fontSize: 20, color: 'grey' }} />
          &nbsp;{Legenda[index]}
        </Typography>
      ))}
    </div>
  );
};

export default IconList;
