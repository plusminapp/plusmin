import React from "react";
import { Box } from "@mui/material";
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined';
import EuroIcon from "@mui/icons-material/Euro";

const VariabeleLastenIcon: React.FC = () => {
  return (
    <Box
      sx={{
        position: "relative",
        width: 24, // Match icon size
        height: 24,
      }}
    >
      <ChangeCircleOutlinedIcon
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          fontSize: 24, // Adjust size
        }}
      />
      <EuroIcon
        sx={{
          position: "absolute",
          top: 14, // Offset for better alignment
          left: 14,
          fontSize: 8, // Smaller size for the second icon
        }}
      />
    </Box>
  );
};

export default VariabeleLastenIcon;
