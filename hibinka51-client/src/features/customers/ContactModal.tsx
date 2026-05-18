import {useEffect, useState} from "react";
import {Box, Button, Grid, MenuItem, Stack, TextField} from "@mui/material";
import {Modal} from "../../shared/components/ui/Modal";
import {createContact, updateContact} from "../../api/customers";
import {Contact, Organization} from "@shared/types/api";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contact?: Contact | null;
    organizations: Organization[];
}

export const ContactModal = ({open, onClose, onSuccess, contact, organizations}: Props) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        organization_id: "",
    });

    useEffect(() => {
        if (open) {
            setForm({
                full_name: contact?.full_name ?? "",
                phone: contact?.phone ?? "",
                organization_id: contact?.organization_id ?? "",
            });
        }
    }, [open, contact]);
    // -------------------------

    const set = (field: string, value: string) => setForm(f => ({...f, [field]: value}));

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const payload = {...form, organization_id: form.organization_id || null};
            if (contact) await updateContact(contact.id, payload);
            else await createContact(payload);
            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title={contact ? "Редактировать контакт" : "Новый контакт"}>
            <Box sx={{mt: 1, p: 1}}>
                <Grid container spacing={2}>
                    <Grid size={{xs: 12}}>
                        <TextField label="ФИО" fullWidth size="small" value={form.full_name}
                                   onChange={e => set("full_name", e.target.value)}/>
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <TextField label="Телефон" fullWidth size="small" value={form.phone}
                                   onChange={e => set("phone", e.target.value)}/>
                    </Grid>

                    {/* Выбор организации */}
                    <Grid size={{xs: 12}}>
                        <TextField select label="Организация (необязательно)" fullWidth size="small"
                                   value={form.organization_id} onChange={e => set("organization_id", e.target.value)}>
                            <MenuItem value="">— Физлицо —</MenuItem>
                            {organizations.map(o => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
                        </TextField>
                    </Grid>

                    <Grid size={{xs: 12}} sx={{mt: 1}}>
                        <Stack direction="row" spacing={2}>
                            <Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading}>
                                {contact ? "Сохранить" : "Создать"}
                            </Button>
                            <Button variant="outlined" fullWidth onClick={onClose}>Отмена</Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </Modal>
    );
};