import { useEffect, useState, useRef } from "react";
import {
  Box, Typography, Stack, Button, Alert, CircularProgress,
  TextField, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { getContacts, getOrganizations, deleteContact, deleteOrganization } from "../api/customers";
import { Contact, Organization } from "@shared/types/api";
import { ConfirmDialog } from "../shared/components/ui/ConfirmDialog";
import { ContactModal } from "../features/customers/ContactModal";
import { OrganizationModal } from "../features/customers/OrganizationModal";

const LIMIT = 20;

export const CustomersPage = () => {
  const [tab, setTab] = useState(0);

  // ── Contacts state ──
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [contactSkip, setContactSkip] = useState(0);
  const [contactHasMore, setContactHasMore] = useState(true);
  const [contactLoading, setContactLoading] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);

  // ── Organizations state ──
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [orgSearch, setOrgSearch] = useState("");
  const [orgSkip, setOrgSkip] = useState(0);
  const [orgHasMore, setOrgHasMore] = useState(true);
  const [orgLoading, setOrgLoading] = useState(false);
  const [editOrg, setEditOrg] = useState<Organization | null>(null);
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [deleteOrgId, setDeleteOrgId] = useState<string | null>(null);

  const contactContainerRef = useRef<HTMLDivElement>(null);
  const orgContainerRef = useRef<HTMLDivElement>(null);

  // ── Contacts fetch ──
  const loadContacts = async (skip: number, search: string, append = false) => {
    setContactLoading(true);
    try {
      const data = await getContacts({ skip, limit: LIMIT, search: search || undefined });
      setContacts(prev => append ? [...prev, ...data] : data);
      setContactHasMore(data.length === LIMIT);
    } finally {
      setContactLoading(false);
    }
  };

  // ── Organizations fetch ──
  const loadOrgs = async (skip: number, search: string, append = false) => {
    setOrgLoading(true);
    try {
      const data = await getOrganizations({ skip, limit: LIMIT, search: search || undefined });
      setOrgs(prev => append ? [...prev, ...data] : data);
      setOrgHasMore(data.length === LIMIT);
    } finally {
      setOrgLoading(false);
    }
  };

  // Initial loads
  useEffect(() => { loadContacts(0, contactSearch); setContactSkip(0); }, []);
  useEffect(() => { loadOrgs(0, orgSearch); setOrgSkip(0); }, []);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => { setContactSkip(0); loadContacts(0, contactSearch); }, 400);
    return () => clearTimeout(t);
  }, [contactSearch]);

  useEffect(() => {
    const t = setTimeout(() => { setOrgSkip(0); loadOrgs(0, orgSearch); }, 400);
    return () => clearTimeout(t);
  }, [orgSearch]);

  // Infinite scroll — contacts
  const handleContactScroll = () => {
    const el = contactContainerRef.current;
    if (!el || contactLoading || !contactHasMore) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
      const next = contactSkip + LIMIT;
      setContactSkip(next);
      loadContacts(next, contactSearch, true);
    }
  };

  // Infinite scroll — orgs
  const handleOrgScroll = () => {
    const el = orgContainerRef.current;
    if (!el || orgLoading || !orgHasMore) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
      const next = orgSkip + LIMIT;
      setOrgSkip(next);
      loadOrgs(next, orgSearch, true);
    }
  };

  const handleDeleteContact = async () => {
    if (!deleteContactId) return;
    await deleteContact(deleteContactId);
    setDeleteContactId(null);
    setContactSkip(0);
    loadContacts(0, contactSearch);
  };

  const handleDeleteOrg = async () => {
    if (!deleteOrgId) return;
    await deleteOrganization(deleteOrgId);
    setDeleteOrgId(null);
    setOrgSkip(0);
    loadOrgs(0, orgSearch);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>База клиентов</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Контакты" />
        <Tab label="Организации" />
      </Tabs>

      {/* ── CONTACTS TAB ── */}
      {tab === 0 && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <TextField size="small" label="Поиск по имени или телефону" value={contactSearch}
              onChange={e => setContactSearch(e.target.value)} sx={{ width: 320 }} />
            <Button variant="contained" onClick={() => { setEditContact(null); setContactModalOpen(true); }}>
              + Новый контакт
            </Button>
          </Stack>

          {contacts.length === 0 && !contactLoading ? (
            <Alert severity="info">Контакты не найдены</Alert>
          ) : (
            <TableContainer ref={contactContainerRef} component={Paper}
              sx={{ maxHeight: 500, overflow: "auto" }} onScroll={handleContactScroll}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ФИО</TableCell>
                    <TableCell>Телефон</TableCell>
                    <TableCell>Организация</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contacts.map(c => (
                    <TableRow key={c.id}>
                      <TableCell>{c.full_name}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell>
                        {c.organization
                          ? <Chip label={c.organization.name} size="small" />
                          : <Typography variant="caption" color="text.secondary">Физлицо</Typography>}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                          <Button size="small" variant="contained" sx={{ minWidth: "unset", px: 1, py: 0.5 }}
                            onClick={() => { setEditContact(c); setContactModalOpen(true); }}>
                            <EditIcon fontSize="small" />
                          </Button>
                          <Button size="small" variant="contained" sx={{ minWidth: "unset", px: 1, py: 0.5 }}
                            onClick={() => setDeleteContactId(c.id)}>
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {contactLoading && <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}><CircularProgress size={24} /></Box>}
            </TableContainer>
          )}
        </>
      )}

      {/* ── ORGANIZATIONS TAB ── */}
      {tab === 1 && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <TextField size="small" label="Поиск по названию" value={orgSearch}
              onChange={e => setOrgSearch(e.target.value)} sx={{ width: 320 }} />
            <Button variant="contained" onClick={() => { setEditOrg(null); setOrgModalOpen(true); }}>
              + Новая организация
            </Button>
          </Stack>

          {orgs.length === 0 && !orgLoading ? (
            <Alert severity="info">Организации не найдены</Alert>
          ) : (
            <TableContainer ref={orgContainerRef} component={Paper}
              sx={{ maxHeight: 500, overflow: "auto" }} onScroll={handleOrgScroll}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Комментарии</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orgs.map(o => (
                    <TableRow key={o.id}>
                      <TableCell>{o.name}</TableCell>
                      <TableCell sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {o.notes ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Chip label={o.is_active ? "Активна" : "Неактивна"}
                          color={o.is_active ? "success" : "default"} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                          <Button size="small" variant="contained" sx={{ minWidth: "unset", px: 1, py: 0.5 }}
                            onClick={() => { setEditOrg(o); setOrgModalOpen(true); }}>
                            <EditIcon fontSize="small" />
                          </Button>
                          <Button size="small" variant="contained" sx={{ minWidth: "unset", px: 1, py: 0.5 }}
                            onClick={() => setDeleteOrgId(o.id)}>
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {orgLoading && <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}><CircularProgress size={24} /></Box>}
            </TableContainer>
          )}
        </>
      )}

      <ConfirmDialog open={deleteContactId !== null} title="Удалить контакт?"
        message="Это действие необратимо. Вы уверены?"
        onConfirm={handleDeleteContact} onCancel={() => setDeleteContactId(null)} />

      <ConfirmDialog open={deleteOrgId !== null} title="Удалить организацию?"
        message="Это действие необратимо. Вы уверены?"
        onConfirm={handleDeleteOrg} onCancel={() => setDeleteOrgId(null)} />

      <ContactModal open={contactModalOpen} contact={editContact} organizations={orgs}
        onClose={() => setContactModalOpen(false)}
        onSuccess={() => { setContactSkip(0); loadContacts(0, contactSearch); }} />

      <OrganizationModal open={orgModalOpen} organization={editOrg}
        onClose={() => setOrgModalOpen(false)}
        onSuccess={() => { setOrgSkip(0); loadOrgs(0, orgSearch); }} />
    </Box>
  );
};
