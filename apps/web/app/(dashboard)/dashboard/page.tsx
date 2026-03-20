import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Dashboard coming soon — your pet care overview will appear here.
      </Typography>
    </Box>
  );
}
