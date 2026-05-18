import React, {forwardRef, useEffect, useState} from "react";
import {
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControlLabel,
    Grid,
    MenuItem,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import {DatePicker, LocalizationProvider, TimePicker} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {IMaskInput} from "react-imask";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {Modal} from "../../shared/components/ui/Modal";
import {createAdminBooking} from "../../api/bookings";
import {getContacts} from "../../api/customers";

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

export const CreateBookingModal = ({open, onClose, onSuccess}: any) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<any>({
        customer_name: "",
        customer_phone: "+7 ",
        source: "PHONE",
        desired_trip_date: dayjs().add(1, "day").format("YYYY-MM-DD"),
        desired_departure_time: "12:00:00",
        desired_trip_location: "",
        arrival_location: "",
        passenger_count: 1,
        has_trailer: false,
        is_round_trip: false,
        return_date: dayjs().add(2, "day").format("YYYY-MM-DD"),
        return_time: "12:00:00",
        total_amount: 0,
        paid_amount: 0,
        notes: "",
    });

    const [options, setOptions] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (inputValue.length < 2) {
            setOptions([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const results = await getContacts({search: inputValue, limit: 10});
                setOptions(results);
            } catch (error) {
                console.error("Ошибка при поиске контактов:", error);
            } finally {
                setSearchLoading(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [inputValue]);

    const handleSubmit = async () => {
        if (!form.customer_name || form.customer_name.length < 2) {
            alert("Введите имя клиента");
            return;
        }

        try {
            setLoading(true);

            const digits = form.customer_phone.replace(/\D/g, "");
            const finalForm = {
                ...form,
                customer_phone: digits.length > 1 ? form.customer_phone : null
            };

            await createAdminBooking(finalForm);
            onSuccess();
            onClose();
        } catch (e: any) {
            const errorMsg = e.response?.data?.detail?.[0]?.msg || "Ошибка при создании";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
            <Modal open={open} onClose={onClose} title="Новая заявка (Диспетчер)">
                <Box sx={{mt: 1, p: 1}}>
                    <Grid container spacing={2}>

                        <Grid item xs={6}>
                            <Autocomplete
                                freeSolo
                                fullWidth
                                options={options}
                                sx={{
                                    width: "250%",
                                    "& .MuiInputBase-root": {
                                        height: "40px !important",
                                        minHeight: "40px !important",
                                        paddingTop: "0px !important",
                                        paddingBottom: "0px !important",
                                        boxSizing: "border-box"
                                    },
                                    "& .MuiOutlinedInput-root .MuiAutocomplete-input": {
                                        padding: "0px 4px !important"
                                    }
                                }}
                                getOptionLabel={(option: any) =>
                                    typeof option === "string" ? option : option.full_name
                                }
                                renderOption={(props, option: any) => {
                                    const {key, ...optionProps} = props;
                                    return (
                                        <li key={key || option.id} {...optionProps}>
                                            {option.full_name}
                                            <span style={{color: "gray", marginLeft: "8px", fontSize: "0.85em"}}>
                                                {option.phone}
                                            </span>
                                        </li>
                                    );
                                }}
                                filterOptions={(x) => x}
                                inputValue={inputValue}
                                onInputChange={(_, newInputValue) => {
                                    setInputValue(newInputValue);
                                    setForm({...form, customer_name: newInputValue});
                                }}
                                onChange={(_, selectedContact: any) => {
                                    if (selectedContact && typeof selectedContact !== "string") {
                                        setForm({
                                            ...form,
                                            customer_name: selectedContact.full_name,
                                            customer_phone: selectedContact.phone || "+7 ",
                                        });
                                        setInputValue(selectedContact.full_name);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Имя клиента"
                                        size="small"
                                        required
                                        fullWidth
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <React.Fragment>
                                                    {searchLoading ?
                                                        <CircularProgress color="inherit" size={20}/> : null}
                                                    {params.InputProps.endAdornment}
                                                </React.Fragment>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="Телефон"
                                fullWidth
                                size="small"
                                value={form.customer_phone}
                                onChange={(e) =>
                                    setForm({...form, customer_phone: e.target.value})
                                }
                                InputProps={{inputComponent: PhoneMaskCustom as any}}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Источник"
                                fullWidth
                                size="small"
                                value={form.source}
                                onChange={(e) => setForm({...form, source: e.target.value})}
                            >
                                <MenuItem value="PHONE">Телефон</MenuItem>
                                <MenuItem value="MESSENGER">Мессенджер (TG/VK)</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="Откуда"
                                fullWidth
                                size="small"
                                value={form.desired_trip_location}
                                onChange={(e) =>
                                    setForm({...form, desired_trip_location: e.target.value})
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Куда"
                                fullWidth
                                size="small"
                                value={form.arrival_location}
                                onChange={(e) =>
                                    setForm({...form, arrival_location: e.target.value})
                                }
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="Количество мест"
                                type="number"
                                fullWidth
                                size="small"
                                value={form.passenger_count === 0 ? "" : form.passenger_count}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        passenger_count: e.target.value === "" ? 0 : Number(e.target.value),
                                    })
                                }
                            />
                        </Grid>
                        <Grid item xs={6} sx={{display: 'flex', alignItems: 'center'}}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={form.has_trailer}
                                        onChange={(e) =>
                                            setForm({...form, has_trailer: e.target.checked})
                                        }
                                    />
                                }
                                label={<Typography variant="body2" fontWeight="bold">Нужен прицеп</Typography>}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <DatePicker
                                label="Дата туда"
                                format="DD.MM.YYYY"
                                value={dayjs(form.desired_trip_date)}
                                onChange={(v) =>
                                    setForm({
                                        ...form,
                                        desired_trip_date: v?.format("YYYY-MM-DD") || "",
                                    })
                                }
                                slotProps={{textField: {size: "small", fullWidth: true}}}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TimePicker
                                label="Время"
                                ampm={false}
                                value={dayjs(`2000-01-01T${form.desired_departure_time}`)}
                                onChange={(v) =>
                                    setForm({
                                        ...form,
                                        desired_departure_time: v?.format("HH:mm:ss") || "",
                                    })
                                }
                                slotProps={{textField: {size: "small", fullWidth: true}}}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={form.is_round_trip}
                                        onChange={(e) =>
                                            setForm({...form, is_round_trip: e.target.checked})
                                        }
                                    />
                                }
                                label={
                                    <Typography variant="body2" fontWeight="bold">
                                        Нужен обратный рейс
                                    </Typography>
                                }
                            />
                        </Grid>

                        {form.is_round_trip && (
                            <>
                                <Grid item xs={6}>
                                    <DatePicker
                                        label="Дата обратно"
                                        format="DD.MM.YYYY"
                                        value={dayjs(form.return_date)}
                                        onChange={(v) =>
                                            setForm({
                                                ...form,
                                                return_date: v?.format("YYYY-MM-DD") || "",
                                            })
                                        }
                                        slotProps={{
                                            textField: {size: "small", fullWidth: true},
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TimePicker
                                        label="Время обратно"
                                        ampm={false}
                                        value={dayjs(`2000-01-01T${form.return_time}`)}
                                        onChange={(v) =>
                                            setForm({
                                                ...form,
                                                return_time: v?.format("HH:mm:ss") || "",
                                            })
                                        }
                                        slotProps={{
                                            textField: {size: "small", fullWidth: true},
                                        }}
                                    />
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12}>
                            <Divider sx={{my: 1}}/>
                            <Typography variant="subtitle2" color="primary">
                                Финансы
                            </Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="Итого (₽)"
                                type="number"
                                fullWidth
                                size="small"
                                value={form.total_amount === 0 ? "" : form.total_amount}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        total_amount: e.target.value === "" ? 0 : Number(e.target.value),
                                    })
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Аванс (₽)"
                                type="number"
                                fullWidth
                                size="small"
                                value={form.paid_amount === 0 ? "" : form.paid_amount}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        paid_amount: e.target.value === "" ? 0 : Number(e.target.value),
                                    })
                                }
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Заметки"
                                fullWidth
                                multiline
                                rows={2}
                                size="small"
                                value={form.notes}
                                onChange={(e) => setForm({...form, notes: e.target.value})}
                            />
                        </Grid>

                        <Grid item xs={12} sx={{mt: 2}}>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    Создать
                                </Button>
                                <Button variant="outlined" fullWidth onClick={onClose}>
                                    Отмена
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
        </LocalizationProvider>
    );
};