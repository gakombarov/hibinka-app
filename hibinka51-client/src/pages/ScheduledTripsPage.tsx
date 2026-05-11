import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays, MapPin, Clock, DollarSign, Route,
  Plus, Trash2, Save, RefreshCw, CheckCircle2
} from 'lucide-react';
import { createScheduledTrip, triggerTripsSync, ScheduledTripStopCreate } from '../api';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const ScheduledTripsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const [routeNumber, setRouteNumber] = useState('');
  const [departureLocation, setDepartureLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [price, setPrice] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // Состояние для остановок
  const [stops, setStops] = useState<ScheduledTripStopCreate[]>([]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const addStop = () => {
    setStops(prev => [
      ...prev,
      { stop_order: prev.length + 1, location: '', stop_time: '', description: '' }
    ]);
  };

  const removeStop = (index: number) => {
    setStops(prev => {
      const newStops = prev.filter((_, i) => i !== index);
      // Пересчитываем stop_order после удаления
      return newStops.map((stop, i) => ({ ...stop, stop_order: i + 1 }));
    });
  };

  const updateStop = (index: number, field: keyof ScheduledTripStopCreate, value: string) => {
    setStops(prev => {
      const newStops = [...prev];
      newStops[index] = { ...newStops[index], [field]: value };
      return newStops;
    });
  };

  const handleSync = async () => {
    try {
      setSyncLoading(true);
      await triggerTripsSync();
      alert('Генерация рейсов успешно запущена в фоне!');
    } catch (error) {
      console.error(error);
      alert('Ошибка при запуске генерации');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      alert('Выберите хотя бы один день недели');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        route_number: Number(routeNumber),
        departure_location: departureLocation,
        destination,
        days_of_week: selectedDays.join(', '),
        departure_time: departureTime + ':00',
        price: Number(price),
        is_active: isActive,
        contract_end_date: contractEndDate || undefined,
        stops: stops.map(s => ({
          ...s,
          stop_time: s.stop_time ? s.stop_time + ':00' : undefined
        }))
      };

      await createScheduledTrip(payload);
      alert('Расписание успешно создано и рейсы начали генерироваться!');

      setRouteNumber('');
      setDepartureLocation('');
      setDestination('');
      setSelectedDays([]);
      setStops([]);
    } catch (error) {
      console.error(error);
      alert('Ошибка при сохранении');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 max-w-5xl mx-auto space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            Маршруты по расписанию
          </h1>
          <p className="text-gray-500 text-sm mt-1">Создание шаблона регулярных рейсов</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncLoading ? 'animate-spin' : ''}`} />
          {syncLoading ? 'Генерация...' : 'Принудительная генерация'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 space-y-8">

          {/* Базовые данные */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Route className="w-4 h-4 text-gray-400" /> Номер маршрута
              </label>
              <input
                type="number" required value={routeNumber} onChange={e => setRouteNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Например: 101"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> Откуда
              </label>
              <input
                type="text" required value={departureLocation} onChange={e => setDepartureLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> Куда
              </label>
              <input
                type="text" required value={destination} onChange={e => setDestination(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" /> Время отправления
              </label>
              <input
                type="time" required value={departureTime} onChange={e => setDepartureTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" /> Стоимость (₽)
              </label>
              <input
                type="number" required value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" /> Конец контракта
              </label>
              <input
                type="date" required value={contractEndDate} onChange={e => setContractEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Дни недели */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Дни выполнения рейса</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`w-12 h-12 rounded-full font-medium transition-all duration-200 ${
                    selectedDays.includes(day)
                      ? 'bg-blue-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Чекбокс активности */}
          <div className="flex items-center gap-2 bg-blue-50 p-4 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900">Показывать на лендинге</h4>
              <p className="text-xs text-blue-700 mt-0.5">Рейс будет виден клиентам на сайте</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <hr className="border-gray-100" />

          {/* Остановки */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-base font-semibold text-gray-900">Промежуточные остановки</label>
              <button
                type="button" onClick={addStop}
                className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1.5 rounded-lg"
              >
                <Plus className="w-4 h-4" /> Добавить
              </button>
            </div>

            <div className="space-y-3">
              {stops.map((stop, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-end bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <div className="w-full md:w-1/3">
                    <label className="text-xs text-gray-500 mb-1 block">Название остановки</label>
                    <input
                      type="text" required value={stop.location} onChange={e => updateStop(index, 'location', e.target.value)}
                      placeholder="Например: Автовокзал"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-full md:w-1/4">
                    <label className="text-xs text-gray-500 mb-1 block">Время (опционально)</label>
                    <input
                      type="time" value={stop.stop_time} onChange={e => updateStop(index, 'stop_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-full md:w-1/3">
                    <label className="text-xs text-gray-500 mb-1 block">Описание (опционально)</label>
                    <input
                      type="text" value={stop.description} onChange={e => updateStop(index, 'description', e.target.value)}
                      placeholder="Например: У магазина Огонек"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button" onClick={() => removeStop(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors md:mb-1 w-full md:w-auto flex justify-center"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
              {stops.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                  Прямой рейс без остановок. Нажмите "Добавить", чтобы внести маршрутные точки.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            type="submit" disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isLoading ? 'Сохранение...' : 'Создать расписание'}
          </button>
        </div>
      </form>
    </motion.div>
  );