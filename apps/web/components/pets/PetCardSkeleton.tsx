"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";

export function PetCardSkeleton() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={2} alignItems="flex-start">
          <Skeleton variant="circular" width={56} height={56} />
          <Box flexGrow={1}>
            <Skeleton variant="text" width="60%" height={28} />
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="text" width="25%" height={18} sx={{ mb: 1 }} />
            <Box display="flex" gap={0.5}>
              <Skeleton variant="rounded" width={60} height={24} />
              <Skeleton variant="rounded" width={60} height={24} />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
