"use client";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

export function VaccinationCardSkeleton() {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 2,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={1}
      >
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="rounded" width={80} height={20} />
      </Box>
      <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={16} />
      <Skeleton variant="text" width="70%" height={16} />
    </Box>
  );
}
