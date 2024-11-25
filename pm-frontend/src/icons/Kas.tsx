import React from "react";
import { Box } from "@mui/material";
import EuroIcon from "@mui/icons-material/Euro";

const KasIcon: React.FC = () => {
  return (
    <Box
      sx={{
        position: "relative",
        width: 24, // Match icon size
        height: 24,
      }}
    >
     <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      version="1.1"
      id="svg1"
      fill="grey">
      <path
     d="M 20,4 H 4 C 2.89,4 2.01,4.89 2.01,6 L 2,18 c 0,1.11 0.89,2 2,2 h 16 c 1.11,0 2,-0.89 2,-2 V 6 C 22,4.89 21.11,4 20,4 m 0,14 H 4 V 6 h 16 z"
     id="path1" />
    </svg>

      <EuroIcon
        sx={{
          position: "absolute",
          top: 7,
          left: 7,
          fontSize: 10,
        }}
      />
    </Box>
  );
};

export default KasIcon;
