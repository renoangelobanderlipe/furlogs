"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";

export function VisitCardSkeleton() {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Skeleton variant="rounded" width={80} height={24} />
          <Skeleton variant="text" width={90} />
        </Box>
        <Skeleton variant="text" width="90%" height={24} />
        <Skeleton variant="text" width="65%" height={24} sx={{ mb: 1.5 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={50} />
        </Box>
      </CardContent>
    </Card>
  );
}
