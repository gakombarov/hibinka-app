import React, {forwardRef, useEffect, useState} from "react";
import {Box, Button, FormControlLabel, Grid, Stack, Switch, TextField, Typography} from "@mui/material";
import {IMaskInput} from "react-imask";
import {Modal} from "../../shared/components/ui/Modal";
import {createDriver, updateDriver} from "../../api/drivers";
import {DriverProfile} from "@shared/types/api";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    driver?: DriverProfile | null;
}

const PhoneMaskCustom = forwardRef<HTMLInputElement, any>(
    function PhoneMaskCustom(props, ref) {
        const {onChange, ...other} = props;
        return (
            <IMaskInput
                {...other}
                mask="+7 (#00) 000-00-00"
                definitions={{"#": /[1-9]/}}
                inputRef={ref}
                onAccept={(value: any) =>
                    onChange({target: {name: props.name, value}})
                }
                overwrite
            />
        );
    },
);

export const DriverModal = ({open, onClose, onSuccess, driver}: Props) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        call_sign: "",
        phone: "+7 ",
        is_external: false,
    });

    useEffect(() => {
        if (open) {
            setForm({
                first_name: (driver as any)?.user?.first_name ?? (driver as any)?.first_name ?? "",
                last_name: (driver as any)?.user?.last_name ?? (driver as any)?.last_name ?? "",
                call_sign: driver?.call_sign ?? "",
                phone: driver?.phone ?? "+7 ",
                is_external: driver?.is_external ?? false,
            });
        }
    }, [open, driver]);

    const set = (field: string, value: any) => setForm(f => ({...f, [field]: value}));

    const handleSubmit = async () => {
        if (!form.first_name.trim()) {
            alert("Введите имя водителя");
            return;
        }

        const digits = form.phone.replace(/\D/g, "");
        if (digits.length < 11) {
            alert("Введите корректный номер телефона");
            return;
        }

        try {
            setLoading(true);
            if (driver) {
                await updateDriver(driver.id, form);
            } else {
                await createDriver(form);
            }
            onSuccess();
            onClose();
        } catch (e: any) {
            alert(e.response?.data?.detail || "Ошибка при сохранении данных водителя");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title={driver ? "Редактировать водителя" : "Новый водитель"}>
            <Box sx={{mt: 1, p: 1}}>
                <Grid container spacing={2}>
                    <Grid size={{xs: 6}}>
                        <TextField
                            label="Имя"
                            fullWidth
                            size="small"
                            required
                            value={form.first_name}
                            onChange={e => set("first_name", e.target.value)}
                        />
                    </Grid>
                    <Grid size={{xs: 6}}>
                        <TextField
                            label="Фамилия"
                            fullWidth
                            size="small"
                            value={form.last_name}
                            onChange={e => set("last_name", e.target.value)}
                        />
                    </Grid>

                    <Grid size={{xs: 12}}>
                        <TextField
                            label="Позывной (опционально)"
                            fullWidth
                            size="small"
                            placeholder="Например: Спринтер 101"
                            value={form.call_sign}
                            onChange={e => set("call_sign", e.target.value)}
                        />
                    </Grid>

                    <Grid size={{xs: 12}}>
                        <TextField
                            label="Телефон"
                            fullWidth
                            size="small"
                            required
                            value={form.phone}
                            onChange={e => set("phone", e.target.value)}
                            InputProps={{inputComponent: PhoneMaskCustom as any}}
                        />
                    </Grid>

                    <Grid size={{xs: 12}}>
                        <FormControlLabel
                            control={<Switch checked={form.is_external}
                                             onChange={e => set("is_external", e.target.checked)}/>}
                            label={<Typography variant="body2" fontWeight="bold">Внешний партнёр (наемный)</Typography>}
                        />
                    </Grid>

                    <Grid size={{xs: 12}} sx={{mt: 1}}>
                        <Stack direction="row" spacing={2}>
                            <Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading}>
                                {driver ? "Сохранить" : "Создать"}
                            </Button>
                            <Button variant="outlined" fullWidth onClick={onClose}>Отмена</Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </Modal>
    );
};