import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function VaccinationsPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Vaccinations
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Vaccination records coming soon.
      </Typography>
    </Box>
  );
}
