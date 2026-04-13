import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Stack,
  FormControlLabel,
  Switch,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchAdminTrips } from "../api/trips";
import { AdminTripCard } from "../shared/components/cards/AdminTripCard";

export const TripsJournal = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCancelled, setShowCancelled] = useState(false);

  const loadTrips = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAdminTrips();
      setTrips(data);
    } catch (err) {
      setError("Не удалось загрузить журнал");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const groupedTrips = useMemo(() => {
    const filtered = trips.filter((trip) => {
      if (showCancelled) return true;
      return trip.status !== "CANCELLED";
    });

    return filtered.reduce((acc: any, trip: any) => {
      const date = trip.trip_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(trip);
      return acc;
    }, {});
  }, [trips, showCancelled]);

  const sortedDates = useMemo(
    () => Object.keys(groupedTrips).sort(),
    [groupedTrips],
  );

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight="900">
            Журнал рейсов
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Оперативное управление поездками
          </Typography>
        </Box>

        {/* 3. Переключатель видимости отмененных */}
        <FormControlLabel
          control={
            <Switch
              checked={showCancelled}
              onChange={(e) => setShowCancelled(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" fontWeight="700">
              Показывать отмененные
            </Typography>
          }
        />
      </Stack>

      {sortedDates.length === 0 ? (
        <Alert severity="info">Нет активных рейсов на выбранные даты</Alert>
      ) : (
        sortedDates.map((date) => (
          <Accordion
            key={date}
            defaultExpanded
            elevation={0}
            sx={{
              mb: 2,
              border: "1px solid #eee",
              borderRadius: "12px !important",
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h6" fontWeight="800">
                  {new Date(date).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                  })}
                </Typography>
                <Badge
                  badgeContent={groupedTrips[date].length}
                  color="primary"
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: "grey.50" }}>
              {groupedTrips[date].map((trip: any) => (
                <AdminTripCard
                  key={trip.id}
                  trip={trip}
                  onAssign={() => {
                    /* твоя логика */
                  }}
                />
              ))}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
};
