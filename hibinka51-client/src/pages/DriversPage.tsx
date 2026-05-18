import {useEffect, useRef, useState} from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import TableSortLabel from "@mui/material/TableSortLabel";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {deleteDriver, getDrivers} from "../api/drivers";
import {DriverProfile} from "@shared/types/api";
import {ConfirmDialog} from "../shared/components/ui/ConfirmDialog";
import {DriverModal} from "../features/drivers/DriverModal";

const LIMIT = 20;

type SortKey = "call_sign" | "phone" | "is_external";
type SortDir = "asc" | "desc";

const COLUMNS: [SortKey, string][] = [
    ["call_sign", "Позывной"],
    ["phone", "Телефон"],
    ["is_external", "Тип"],
];

export const DriversPage = () => {
    const [drivers, setDrivers] = useState<DriverProfile[]>([]);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [filterExternal, setFilterExternal] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("call_sign");
    const [sortDir, setSortDir] = useState<SortDir>("asc");

    const [modalOpen, setModalOpen] = useState(false);
    const [editDriver, setEditDriver] = useState<DriverProfile | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const load = async (newSkip: number, append = false) => {
        setLoading(true);
        try {
            const data = await getDrivers({
                skip: newSkip, limit: LIMIT,
                search: search || undefined,
                is_external: filterExternal !== "" ? filterExternal : undefined,
                sort_by: sortKey,
                sort_dir: sortDir,
            });
            setDrivers(prev => append ? [...prev, ...data] : data);
            setHasMore(data.length === LIMIT);
        } finally {
            setLoading(false);
        }
    };

    const reload = () => {
        setSkip(0);
        load(0);
    };

    useEffect(() => {
        reload();
    }, [search, filterExternal, sortKey, sortDir]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
        else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const handleScroll = () => {
        const el = containerRef.current;
        if (!el || loading || !hasMore) return;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
            const next = skip + LIMIT;
            setSkip(next);
            load(next, true);
        }
    };

    const handleDeleteConfirmed = async () => {
        if (!deleteId) return;
        await deleteDriver(deleteId);
        setDeleteId(null);
        reload();
    };

    return (
        <Box sx={{p: 3, maxWidth: 1000, mx: "auto"}}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">Водители</Typography>
                <Button variant="contained" onClick={() => {
                    setEditDriver(null);
                    setModalOpen(true);
                }}>
                    + Новый водитель
                </Button>
            </Stack>

            <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
                <TextField size="small" label="Поиск по позывному или телефону" value={search}
                           onChange={e => setSearch(e.target.value)} sx={{width: 280}}/>
                <ToggleButtonGroup size="small" exclusive value={filterExternal}
                                   onChange={(_, v) => setFilterExternal(v ?? "")}>
                    <ToggleButton value="">Все</ToggleButton>
                    <ToggleButton value="false">Свои</ToggleButton>
                    <ToggleButton value="true">Внешние</ToggleButton>
                </ToggleButtonGroup>
            </Stack>

            {drivers.length === 0 && !loading ? (
                <Alert severity="info">Водители не найдены</Alert>
            ) : (
                <TableContainer ref={containerRef} component={Paper}
                                sx={{maxHeight: 500, overflow: "auto"}} onScroll={handleScroll}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                {COLUMNS.map(([key, label]) => (
                                    <TableCell key={key}>
                                        <TableSortLabel active={sortKey === key}
                                                        direction={sortKey === key ? sortDir : "asc"}
                                                        onClick={() => handleSort(key)}>
                                            {label}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                                <TableCell align="right">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {drivers.map(d => (
                                <TableRow key={d.id}>
                                    <TableCell>{d.call_sign}</TableCell>
                                    <TableCell>{d.phone}</TableCell>
                                    <TableCell>
                                        <Chip label={d.is_external ? "Внешний" : "Свой"}
                                              color={d.is_external ? "warning" : "primary"} size="small"
                                              variant="outlined"/>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                            <Button size="small" variant="contained"
                                                    sx={{minWidth: "unset", px: 1, py: 0.5}}
                                                    onClick={() => {
                                                        setEditDriver(d);
                                                        setModalOpen(true);
                                                    }}>
                                                <EditIcon fontSize="small"/>
                                            </Button>
                                            <Button size="small" variant="contained"
                                                    sx={{minWidth: "unset", px: 1, py: 0.5}}
                                                    onClick={() => setDeleteId(d.id)}>
                                                <DeleteIcon fontSize="small"/>
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {loading &&
                        <Box sx={{display: "flex", justifyContent: "center", p: 2}}><CircularProgress size={24}/></Box>}
                </TableContainer>
            )}

            <ConfirmDialog open={deleteId !== null} title="Удалить водителя?"
                           message="Это действие необратимо. Вы уверены?"
                           onConfirm={handleDeleteConfirmed} onCancel={() => setDeleteId(null)}/>

            <DriverModal open={modalOpen} driver={editDriver}
                         onClose={() => setModalOpen(false)} onSuccess={reload}/>
        </Box>
    );
};