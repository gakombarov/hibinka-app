import { useEffect, useState, useRef } from "react";
import {
  Box, Typography, CircularProgress, Alert, Stack, Button,
  MenuItem, Select, FormControl, InputLabel, TextField,
  ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { CreateVehicleModal } from "../features/vehicles/CreateVehicleModal";
import { ConfirmDialog } from "../shared/components/ui/ConfirmDialog";
import { deleteVehicle as apiDeleteVehicle } from "../api/vehicles";
import { getAllVehiclesList, setFilters, incrementSkip, SortKey, SortDir } from "../store/vehiclesSlice";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import { Vehicle } from "@shared/types/api";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Checkbox from "@mui/material/Checkbox";

const COLUMNS: [SortKey, string][] = [
  ["alias", "Псевдоним"], ["brand", "Марка"], ["model", "Модель"],
  ["license_plate", "Госномер"], ["capacity", "Вместимость"],
  ["category", "Категория"], ["is_active", "Активный"],
];

export const VehiclesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const { list: vehicles, skip, limit, loading, error, hasMore,
    sortKey, sortDir, filterCategory, filterCapacity, filterActive,
  } = useSelector((state: RootState) => state.vehicles);

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchParams = { skip, limit, sortKey, sortDir, filterCategory, filterCapacity, filterActive };

  // Initial load + re-fetch when filters/sort change (skip resets to 0 in setFilters)
  useEffect(() => {
    dispatch(getAllVehiclesList({ skip: 0, limit, sortKey, sortDir, filterCategory, filterCapacity, filterActive }));
  }, [sortKey, sortDir, filterCategory, filterCapacity, filterActive]);

  // Load next page when skip increments
  useEffect(() => {
    if (skip === 0) return;
    dispatch(getAllVehiclesList(fetchParams));
  }, [skip]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || loading || !hasMore) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
      dispatch(incrementSkip());
    }
  };

  const handleSort = (key: SortKey) => {
    dispatch(setFilters({
      sortKey: key,
      sortDir: sortKey === key && sortDir === "asc" ? "desc" : "asc",
    }));
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteId) return;
    try {
      await apiDeleteVehicle(confirmDeleteId);
      dispatch(setFilters({})); // reset + refetch
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const deleteSelected = async () => {
    try {
      await Promise.all(selected.map(id => apiDeleteVehicle(id)));
      dispatch(setFilters({}));
      dispatch(getAllVehiclesList(fetchParams));
      setSelected([]);
    } catch (err) {
      console.error(err);
    }
  };

  const onSelectAllClick = (event: any) => {
    setSelected(event.target.checked ? vehicles.map(v => v.id) : []);
  };

  const handleClick = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (error) return <Alert severity="error" sx={{ mt: 2, mx: "auto", maxWidth: 1000 }}>{error}</Alert>;

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Автопарк</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => setIsCreateModalOpen(true)} sx={{ borderRadius: "8px" }}>
            + Создать Транспортное средство
          </Button>
          {selected.length > 0 && (
            <Button variant="contained" onClick={deleteSelected}
              sx={{ borderRadius: "8px", minWidth: "unset", px: 1, py: 1 }} title="Удалить выбранные">
              <DeleteIcon />
            </Button>
          )}
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Категория</InputLabel>
          <Select value={filterCategory} label="Категория"
            onChange={e => dispatch(setFilters({ filterCategory: e.target.value }))}>
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="BUS">BUS</MenuItem>
            <MenuItem value="MINIBUS">MINIBUS</MenuItem>
          </Select>
        </FormControl>
        <TextField size="small" label="Вместимость от" type="number" value={filterCapacity}
          onChange={e => dispatch(setFilters({ filterCapacity: e.target.value }))}
          sx={{ width: 140 }} />
        <ToggleButtonGroup size="small" exclusive value={filterActive}
          onChange={(_, v) => dispatch(setFilters({ filterActive: v ?? "" }))}>
          <ToggleButton value="">Все</ToggleButton>
          <ToggleButton value="true">Активные</ToggleButton>
          <ToggleButton value="false">Неактивные</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {vehicles.length === 0 && !loading ? (
        <Alert severity="info">Нет транспортных средств</Alert>
      ) : (
        <TableContainer ref={containerRef} component={Paper} sx={{ maxHeight: 500, overflow: "auto" }} onScroll={handleScroll}>
          <Table sx={{ minWidth: 650 }} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox color="primary"
                    indeterminate={selected.length > 0 && selected.length < vehicles.length}
                    checked={vehicles.length > 0 && selected.length === vehicles.length}
                    onChange={onSelectAllClick} />
                </TableCell>
                {COLUMNS.map(([key, label]) => (
                  <TableCell key={key} align={key === "alias" ? "left" : "right"}>
                    <TableSortLabel active={sortKey === key} direction={sortKey === key ? sortDir : "asc"}
                      onClick={() => handleSort(key)}>
                      {label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map((vehicle: Vehicle, index) => (
                <TableRow key={vehicle.license_plate} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell padding="checkbox">
                    <Checkbox color="primary" checked={selected.includes(vehicle.id)}
                      onClick={() => handleClick(vehicle.id)}
                      slotProps={{ input: { "aria-labelledby": `row-${index}` } }} />
                  </TableCell>
                  <TableCell component="th" scope="row">{vehicle.alias}</TableCell>
                  <TableCell align="right">{vehicle.brand}</TableCell>
                  <TableCell align="right">{vehicle.model}</TableCell>
                  <TableCell align="right">{vehicle.license_plate}</TableCell>
                  <TableCell align="right">{vehicle.capacity}</TableCell>
                  <TableCell align="right">{vehicle.category}</TableCell>
                  <TableCell align="right">{vehicle.is_active ? "Да" : "Нет"}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <Button variant="contained" size="small"
                        onClick={() => { setCurrentVehicle(vehicle); setIsEditModalOpen(true); }}
                        sx={{ minWidth: "unset", px: 1, py: 1 }} title="Редактировать">
                        <EditIcon />
                      </Button>
                      <Button variant="contained" size="small"
                        onClick={() => setConfirmDeleteId(vehicle.id)}
                        sx={{ minWidth: "unset", px: 1, py: 1 }} title="Удалить">
                        <DeleteIcon />
                      </Button>
                    </Stack>
                    {isEditModalOpen && vehicle.id === currentVehicle?.id && (
                      <CreateVehicleModal vehicle={currentVehicle} open={isEditModalOpen}
                        onClose={() => { setIsEditModalOpen(false); setCurrentVehicle(null); }}
                        onSuccess={() => {dispatch(setFilters({})); dispatch(getAllVehiclesList(fetchParams));}} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {loading && <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}><CircularProgress size={24} /></Box>}
        </TableContainer>
      )}

      <ConfirmDialog open={confirmDeleteId !== null} title="Удалить транспортное средство?"
        message="Это действие необратимо. Вы уверены?"
        onConfirm={handleDeleteConfirmed} onCancel={() => setConfirmDeleteId(null)} />

      <CreateVehicleModal open={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setCurrentVehicle(null); }}
        onSuccess={() => {dispatch(setFilters({})); dispatch(getAllVehiclesList(fetchParams));}} />
    </Box>
  );
};
