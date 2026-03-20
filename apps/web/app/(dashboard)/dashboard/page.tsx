"use client";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PaymentsIcon from "@mui/icons-material/Payments";
import PeopleIcon from "@mui/icons-material/People";
import ScaleIcon from "@mui/icons-material/Scale";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import { alpha, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { MiniCalendar } from "@/components/calendar/MiniCalendar";
import { StatCard } from "@/components/ui/StatCard";
import { useDashboardSummary } from "@/hooks/api/useDashboard";
import type {
  DashboardPetSummary,
  DashboardReminderItem,
} from "@/lib/api/dashboard";
import { formatRelativeDueDate, formatShortDate } from "@/lib/format";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHouseholdStore } from "@/stores/useHouseholdStore";

function formatPeso(value: number): string {
  return `\u20b1${value.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;
}

function getSpeciesLabel(species: string): string {
  return species.charAt(0).toUpperCase() + species.slice(1);
}

function getPetInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

function getTimeGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  const base =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return name ? `${base}, ${name}` : base;
}

// ── Pet Selector ────────────────────────────────────────────────

function PetPillSkeleton() {
  return (
    <Skeleton
      variant="rounded"
      width={130}
      height={44}
      sx={{ borderRadius: "24px", flexShrink: 0 }}
    />
  );
}

function PetPill({
  pet,
  isActive,
  onToggle,
}: {
  pet: DashboardPetSummary;
  isActive: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  return (
    <ButtonBase
      onClick={onToggle}
      sx={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 1,
        pl: 0.75,
        pr: 1.75,
        py: 0.75,
        borderRadius: "24px",
        border: "1.5px solid",
        borderColor: isActive ? "primary.main" : "divider",
        bgcolor: isActive
          ? alpha(theme.palette.primary.main, 0.1)
          : "transparent",
        transition: "border-color 0.15s, background-color 0.15s",
        "&:hover": {
          borderColor: "primary.light",
          bgcolor: alpha(theme.palette.primary.main, 0.06),
        },
      }}
    >
      <Avatar
        src={pet.avatarUrl ?? undefined}
        sx={{
          width: 28,
          height: 28,
          bgcolor: "primary.dark",
          fontSize: "0.65rem",
        }}
      >
        {!pet.avatarUrl && getPetInitials(pet.name)}
      </Avatar>
      <Box sx={{ textAlign: "left" }}>
        <Typography
          variant="body2"
          fontWeight={600}
          lineHeight={1.25}
          color={isActive ? "primary.main" : "text.primary"}
        >
          {pet.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" lineHeight={1}>
          {getSpeciesLabel(pet.species)}
          {pet.latestWeight ? ` · ${pet.latestWeight.weightKg}kg` : ""}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

// ── Section Header ───────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  href,
  linkLabel = "View all",
}: {
  icon?: React.ReactNode;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      {icon && (
        <Box
          sx={{
            color: "text.disabled",
            display: "flex",
            alignItems: "center",
            "& svg": { fontSize: 17 },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1 }}>
        {title}
      </Typography>
      {href && (
        <Link
          component={NextLink}
          href={href}
          variant="caption"
          color="primary"
          sx={{ textDecoration: "none", fontWeight: 500 }}
        >
          {linkLabel}
        </Link>
      )}
    </Box>
  );
}

// ── Quick Actions ────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: <LocalHospitalIcon />, label: "Log Visit", href: "/vet-visits" },
  { icon: <ShoppingCartIcon />, label: "Add Stock", href: "/stock" },
  { icon: <ScaleIcon />, label: "Record Weight", href: "/pets" },
  { icon: <NotificationsIcon />, label: "Set Reminder", href: "/reminders" },
  { icon: <PeopleIcon />, label: "Invite Member", href: "/household" },
] as const;

// ── Page ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { selectedPetId, isPetFilterActive, selectPet, clearPetFilter } =
    useHouseholdStore();

  const petId = isPetFilterActive && selectedPetId ? selectedPetId : undefined;
  const { data, isLoading } = useDashboardSummary(
    petId ? { petId } : undefined,
  );

  const greeting = getTimeGreeting(user?.name);

  const upcomingCount = data?.upcomingReminders.count ?? 0;
  const firstReminder = data?.upcomingReminders.items[0];
  const stockStatus = data?.stockStatus;
  const vetStats = data?.vetVisitStats;
  const monthlySpend = data?.monthlySpend;

  const stockAlertTotal =
    (stockStatus?.criticalCount ?? 0) + (stockStatus?.lowCount ?? 0);

  const changePercent = monthlySpend?.changePercent;
  const changeLabel =
    changePercent !== null && changePercent !== undefined
      ? `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(1)}% vs last month`
      : "No data yet";

  const urgencyColorMap: Record<DashboardReminderItem["urgency"], string> = {
    high: theme.palette.error.main,
    medium: theme.palette.warning.main,
    low: theme.palette.success.main,
  };

  const stockStatCardStatus =
    (stockStatus?.criticalCount ?? 0) > 0
      ? "error"
      : (stockStatus?.lowCount ?? 0) > 0
        ? "warning"
        : "default";

  return (
    <Box sx={{ pb: 4 }}>
      {/* ── Greeting Banner ── */}
      <Paper
        variant="outlined"
        sx={{
          px: 3,
          py: 2.5,
          mb: 3,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderColor: alpha(theme.palette.primary.main, 0.15),
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} mb={0.875}>
              {greeting}
            </Typography>
            {isLoading ? (
              <Skeleton
                variant="rounded"
                width={200}
                height={26}
                sx={{ borderRadius: "13px" }}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                {upcomingCount > 0 && (
                  <Chip
                    size="small"
                    icon={
                      <NotificationsActiveIcon
                        sx={{ fontSize: "14px !important" }}
                      />
                    }
                    label={`${upcomingCount} reminder${upcomingCount > 1 ? "s" : ""} due`}
                    onClick={() => router.push("/reminders")}
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.12),
                      color: "warning.main",
                      border: "1px solid",
                      borderColor: alpha(theme.palette.warning.main, 0.25),
                      fontWeight: 500,
                      cursor: "pointer",
                      "& .MuiChip-icon": { color: "warning.main" },
                    }}
                  />
                )}
                {stockAlertTotal > 0 && (
                  <Chip
                    size="small"
                    icon={
                      <Inventory2Icon sx={{ fontSize: "14px !important" }} />
                    }
                    label={`${stockAlertTotal} stock alert${stockAlertTotal > 1 ? "s" : ""}`}
                    onClick={() => router.push("/stock")}
                    sx={{
                      bgcolor: alpha(theme.palette.error.main, 0.12),
                      color: "error.main",
                      border: "1px solid",
                      borderColor: alpha(theme.palette.error.main, 0.25),
                      fontWeight: 500,
                      cursor: "pointer",
                      "& .MuiChip-icon": { color: "error.main" },
                    }}
                  />
                )}
                {upcomingCount === 0 && stockAlertTotal === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    All clear today
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {new Date().toLocaleDateString("en-PH", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* ── Pet Selector ── */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          overflowX: "auto",
          pb: 0.5,
          mb: 3,
          "&::-webkit-scrollbar": { height: 4 },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 2 },
        }}
      >
        <ButtonBase
          onClick={clearPetFilter}
          sx={{
            flexShrink: 0,
            px: 2,
            py: 0.875,
            borderRadius: "24px",
            border: "1.5px solid",
            borderColor: !isPetFilterActive ? "primary.main" : "divider",
            bgcolor: !isPetFilterActive
              ? alpha(theme.palette.primary.main, 0.1)
              : "transparent",
            transition: "all 0.15s",
            "&:hover": {
              borderColor: "primary.light",
              bgcolor: alpha(theme.palette.primary.main, 0.06),
            },
          }}
        >
          <Typography
            variant="body2"
            fontWeight={600}
            color={!isPetFilterActive ? "primary.main" : "text.secondary"}
          >
            All Pets
          </Typography>
        </ButtonBase>

        {isLoading
          ? ["ps-1", "ps-2", "ps-3"].map((k) => <PetPillSkeleton key={k} />)
          : (data?.petSummaries ?? []).map((pet) => (
              <PetPill
                key={pet.id}
                pet={pet}
                isActive={isPetFilterActive && selectedPetId === pet.id}
                onToggle={() => {
                  if (isPetFilterActive && selectedPetId === pet.id) {
                    clearPetFilter();
                  } else {
                    selectPet(pet.id, pet.name);
                  }
                }}
              />
            ))}
      </Box>

      {/* ── Stats Row (full width) ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={104} />
          ) : (
            <StatCard
              label="Upcoming"
              value={upcomingCount}
              subtitle={firstReminder?.title ?? "No reminders"}
              icon={<NotificationsActiveIcon />}
              status={upcomingCount > 0 ? "warning" : "default"}
            />
          )}
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={104} />
          ) : (
            <StatCard
              label="Food Stock"
              value={
                stockAlertTotal > 0 ? `${stockAlertTotal} alerts` : "All good"
              }
              subtitle={stockStatus?.worstItem?.name ?? "Stock levels normal"}
              icon={<Inventory2Icon />}
              status={stockStatCardStatus}
            />
          )}
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={104} />
          ) : (
            <StatCard
              label="Vet Visits YTD"
              value={vetStats?.countThisYear ?? 0}
              subtitle={
                vetStats?.lastVisitDate
                  ? `Last: ${formatShortDate(vetStats.lastVisitDate)}`
                  : "No visits yet"
              }
              icon={<LocalHospitalIcon />}
              status="info"
            />
          )}
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={104} />
          ) : (
            <StatCard
              label="Monthly Spend"
              value={monthlySpend ? formatPeso(monthlySpend.currentMonth) : "—"}
              subtitle={changeLabel}
              icon={<PaymentsIcon />}
            />
          )}
        </Grid>
      </Grid>

      {/* ── Two-column layout ── */}
      <Grid container spacing={2} alignItems="flex-start">
        {/* ── Left: main content ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Reminders */}
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <SectionHeader
                icon={<NotificationsActiveIcon />}
                title="Upcoming Reminders"
                href="/reminders"
              />
              {isLoading ? (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}
                >
                  {["r1", "r2", "r3"].map((k) => (
                    <Skeleton key={k} variant="rounded" height={52} />
                  ))}
                </Box>
              ) : (data?.upcomingReminders.items ?? []).length === 0 ? (
                <Box sx={{ py: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary" mb={1.5}>
                    No upcoming reminders
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    component={NextLink}
                    href="/reminders"
                    startIcon={<NotificationsIcon />}
                  >
                    Set a reminder
                  </Button>
                </Box>
              ) : (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}
                >
                  {(data?.upcomingReminders.items ?? [])
                    .slice(0, 5)
                    .map((reminder) => (
                      <Box
                        key={reminder.id}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                          px: 1.5,
                          py: 1,
                          borderRadius: 1.5,
                          borderLeft: "3px solid",
                          borderColor: urgencyColorMap[reminder.urgency],
                          bgcolor: alpha(
                            urgencyColorMap[reminder.urgency],
                            0.06,
                          ),
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {reminder.title}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.75,
                              mt: 0.25,
                            }}
                          >
                            {reminder.petName && (
                              <>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {reminder.petName}
                                </Typography>
                                <Box
                                  sx={{
                                    width: 3,
                                    height: 3,
                                    borderRadius: "50%",
                                    bgcolor: "text.disabled",
                                    flexShrink: 0,
                                  }}
                                />
                              </>
                            )}
                            <Typography
                              variant="caption"
                              fontWeight={500}
                              sx={{ color: urgencyColorMap[reminder.urgency] }}
                            >
                              {formatRelativeDueDate(reminder.dueDate)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                </Box>
              )}
            </Paper>

            {/* Food Stock + Vet Visits side by side */}
            <Grid container spacing={2}>
              {/* Food Stock */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 2.5, height: "100%" }}>
                  <SectionHeader
                    icon={<Inventory2Icon />}
                    title="Food Stock"
                    href="/stock"
                    linkLabel="View stock"
                  />
                  {isLoading ? (
                    <Skeleton variant="rounded" height={88} />
                  ) : (
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          flexWrap: "wrap",
                          mb: stockStatus?.worstItem ? 2 : 0,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h4"
                            fontWeight={700}
                            lineHeight={1}
                          >
                            {stockStatus?.totalOpenItems ?? 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Open items
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                          }}
                        >
                          {(stockStatus?.lowCount ?? 0) > 0 && (
                            <Chip
                              label={`${stockStatus?.lowCount} Low`}
                              size="small"
                              sx={{
                                bgcolor: alpha(
                                  theme.palette.warning.main,
                                  0.12,
                                ),
                                color: "warning.main",
                                border: "1px solid",
                                borderColor: alpha(
                                  theme.palette.warning.main,
                                  0.3,
                                ),
                                fontWeight: 600,
                                height: 22,
                                fontSize: "0.7rem",
                                "& .MuiChip-label": { px: 1 },
                              }}
                            />
                          )}
                          {(stockStatus?.criticalCount ?? 0) > 0 && (
                            <Chip
                              label={`${stockStatus?.criticalCount} Critical`}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.error.main, 0.12),
                                color: "error.main",
                                border: "1px solid",
                                borderColor: alpha(
                                  theme.palette.error.main,
                                  0.3,
                                ),
                                fontWeight: 600,
                                height: 22,
                                fontSize: "0.7rem",
                                "& .MuiChip-label": { px: 1 },
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                      {stockStatus?.worstItem ? (
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "baseline",
                              mb: 0.75,
                            }}
                          >
                            <Typography variant="body2" fontWeight={500} noWrap>
                              {stockStatus.worstItem.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight={600}
                              sx={{
                                color:
                                  stockStatus.worstItem.status === "critical"
                                    ? "error.main"
                                    : "warning.main",
                                flexShrink: 0,
                                ml: 1,
                              }}
                            >
                              {stockStatus.worstItem.daysLeft}d left
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(
                              (stockStatus.worstItem.daysLeft / 30) * 100,
                              100,
                            )}
                            color={
                              stockStatus.worstItem.status === "critical"
                                ? "error"
                                : "warning"
                            }
                            sx={{ borderRadius: 1, height: 6 }}
                          />
                        </Box>
                      ) : (stockStatus?.totalOpenItems ?? 0) === 0 ? (
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={1.5}
                          >
                            No stock items tracked
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            component={NextLink}
                            href="/stock"
                            startIcon={<ShoppingCartIcon />}
                          >
                            Add stock item
                          </Button>
                        </Box>
                      ) : null}
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Vet Visits */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 2.5, height: "100%" }}>
                  <SectionHeader
                    icon={<LocalHospitalIcon />}
                    title="Vet Visits"
                    href="/vet-visits"
                  />
                  {isLoading ? (
                    <Skeleton variant="rounded" height={88} />
                  ) : (
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 3,
                          mb: vetStats?.lastVisitDate ? 2 : 0,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h4"
                            fontWeight={700}
                            lineHeight={1}
                            mb={0.25}
                          >
                            {vetStats?.countThisYear ?? 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Visits this year
                          </Typography>
                        </Box>
                        {(vetStats?.totalSpendThisYear ?? 0) > 0 && (
                          <Box>
                            <Typography
                              variant="h4"
                              fontWeight={700}
                              lineHeight={1}
                              mb={0.25}
                            >
                              {formatPeso(vetStats?.totalSpendThisYear ?? 0)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Spent this year
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      {vetStats?.lastVisitDate ? (
                        <Box
                          sx={{
                            pt: 1.5,
                            borderTop: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Last visit
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            mt={0.25}
                          >
                            {formatShortDate(vetStats.lastVisitDate)}
                            {vetStats.lastVisitPetName &&
                              ` — ${vetStats.lastVisitPetName}`}
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={1.5}
                          >
                            No visits recorded yet
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            component={NextLink}
                            href="/vet-visits"
                            startIcon={<LocalHospitalIcon />}
                          >
                            Log first visit
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* ── Right: Sidebar ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Quick Actions */}
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <SectionHeader title="Quick Actions" />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                {QUICK_ACTIONS.map(({ icon, label, href }) => (
                  <ButtonBase
                    key={label}
                    onClick={() => router.push(href)}
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 1.25,
                      py: 0.875,
                      borderRadius: 1.5,
                      transition: "background-color 0.15s",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        flexShrink: 0,
                        "& svg": { fontSize: 18 },
                      }}
                    >
                      {icon}
                    </Box>
                    <Typography variant="body2" fontWeight={500}>
                      {label}
                    </Typography>
                  </ButtonBase>
                ))}
              </Box>
            </Paper>

            {/* Mini Calendar */}
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <SectionHeader
                icon={<CalendarMonthIcon />}
                title="Calendar"
                href="/calendar"
                linkLabel="Open"
              />
              <MiniCalendar />
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
