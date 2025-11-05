import React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const DemoPage = () => {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 4, m: 3 }}>
      <Typography variant="h5" gutterBottom>
        Demo Management
      </Typography>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button variant="contained" onClick={() => navigate("/demo/online")}>
          Online Demo
        </Button>
        <Button variant="contained" onClick={() => navigate("/demo/offline")}>
          Offline Demo
        </Button>
        <Button variant="contained" onClick={() => navigate("/demo/one-to-one")}>
          1-1 Demo
        </Button>
        <Button variant="contained" onClick={() => navigate("/demo/live-classes")}>
          Live Classes
        </Button>
      </Box>
    </Paper>
  );
};

export default DemoPage;
