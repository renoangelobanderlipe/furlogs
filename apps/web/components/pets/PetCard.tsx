"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import type { Pet } from "@/lib/api/pets";

interface PetCardProps {
  pet: Pet;
  onClick?: () => void;
}

function getSpeciesEmoji(species: string): string {
  return species === "dog" ? "🐶" : "🐱";
}

function formatAge(birthday: string | null, age: number | null): string {
  if (age !== null) {
    return age === 1 ? "1 year" : `${age} years`;
  }
  if (!birthday) return "—";
  return "—";
}

export function PetCard({ pet, onClick }: PetCardProps) {
  const { name, species, breed, sex, birthday, age, size, thumbUrl } =
    pet.attributes;
  const ageStr = formatAge(birthday, age);

  return (
    <Card
      variant="outlined"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" gap={2} alignItems="flex-start">
            <Avatar
              src={thumbUrl ?? undefined}
              sx={{
                width: 56,
                height: 56,
                fontSize: 28,
                bgcolor: "action.hover",
                flexShrink: 0,
              }}
            >
              {!thumbUrl && getSpeciesEmoji(species)}
            </Avatar>

            <Box flexGrow={1} minWidth={0}>
              <Typography
                variant="h6"
                fontWeight={700}
                noWrap
                sx={{ lineHeight: 1.3 }}
              >
                {name}
              </Typography>
              {breed ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                  sx={{ mb: 1 }}
                >
                  {breed}
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  color="text.disabled"
                  sx={{ mb: 1 }}
                >
                  {species.charAt(0).toUpperCase() + species.slice(1)}
                </Typography>
              )}

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mb={1}
              >
                {ageStr}
              </Typography>

              <Box display="flex" gap={0.5} flexWrap="wrap">
                <Chip
                  label={sex.charAt(0).toUpperCase() + sex.slice(1)}
                  size="small"
                  variant="outlined"
                />
                {size && (
                  <Chip
                    label={size.charAt(0).toUpperCase() + size.slice(1)}
                    size="small"
                    variant="outlined"
                    color="secondary"
                  />
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
