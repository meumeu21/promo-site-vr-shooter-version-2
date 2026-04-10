'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';
import type { BookingPayload } from '@/types/api';
import { siteContent } from '@/content/placeholders';
import { apiUrl, parseError } from '@/lib/api';
import { extractSourceFromParams } from '@/lib/source';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type StepId = 1 | 2 | 3 | 4 | 5;

type BookingFormState = {
  city: string;
  club: string;
  date: string;
  slot: string;
  players: string;
  name: string;
  phone: string;
  comment: string;
};

export const getPhoneDigits = (value: string) => value.replace(/\D/g, '');

export const buildBookingPayload = (form: BookingFormState, source?: string): BookingPayload => ({
  city: form.city,
  club: form.club,
  date: form.date,
  slot: form.slot,
  name: form.name.trim(),
  phone: form.phone.trim(),
  comment: form.comment.trim() || undefined,
  source
});

export const generateDates = (daysCount: number) => {
  const dates = [];
  const now = new Date();
  const days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
  const months = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];

  for (let i = 0; i < daysCount; i++) {
    const d = new Date();
    d.setDate(now.getDate() + i);
    dates.push({
      full: d.toISOString().slice(0, 10),
      dayName: days[d.getDay()],
      dayNum: d.getDate().toString().padStart(2, '0'),
      month: months[d.getMonth()]
    });
  }

  return dates;
};

const initialFormState: BookingFormState = {
  city: '',
  club: '',
  date: '',
  slot: '',
  players: '',
  name: '',
  phone: '',
  comment: ''
};

export const BookingWizard = () => {
  const { cities, clubsByCity, slots } = siteContent.booking;
  const dates = useMemo(() => generateDates(21), []);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<BookingFormState>(initialFormState);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const availableClubs = useMemo(() => (form.city ? (clubsByCity[form.city] ?? []) : []), [clubsByCity, form.city]);

  const fieldErrors = useMemo(
    () => ({
      city: form.city ? '' : 'Выберите город.',
      club: form.club ? '' : 'Выберите клуб.',
      date: form.date ? '' : 'Выберите дату.',
      slot: form.slot ? '' : 'Выберите слот игры.',
      players: form.players ? '' : 'Укажите примерное количество игроков.',
      name: form.name.trim().length >= 2 ? '' : 'Введите имя.',
      phone: getPhoneDigits(form.phone).length >= 10 ? '' : 'Введите телефон.'
    }),
    [form]
  );

  const stepValidity = useMemo<Record<StepId, boolean>>(
    () => ({
      1: !fieldErrors.city && !fieldErrors.club,
      2: !fieldErrors.players,
      3: !fieldErrors.date && !fieldErrors.slot,
      4: !fieldErrors.name && !fieldErrors.phone,
      5: true
    }),
    [fieldErrors]
  );

  const canSubmit = stepValidity[1] && stepValidity[2] && stepValidity[3] && stepValidity[4];

  const isStepUnlocked = (step: StepId) => {
    if (step === 1) return true;
    if (step === 2) return stepValidity[1];
    if (step === 3) return stepValidity[1] && stepValidity[2];
    if (step === 4) return stepValidity[1] && stepValidity[2] && stepValidity[3];

    return canSubmit;
  };

  const scrollDates = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const amount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setStatus('error');
      setMessage('Пожалуйста, завершите все шаги бронирования.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const source = typeof window === 'undefined' ? undefined : extractSourceFromParams(new URLSearchParams(window.location.search));
      const payload = buildBookingPayload(form, source);

      const response = await fetch(apiUrl('/bookings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      setStatus('success');
      setMessage('Бронирование принято. Подтверждение придет по телефону.');
      setForm(initialFormState);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Ошибка бронирования');
    }
  };

  const stepSectionClassName = 'relative border-b border-white/5 py-8 transition-all duration-500 last:border-0 sm:py-12';
  const stepHeaderClassName = 'mb-6 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-center sm:gap-4';
  const stepNumClassName = 'font-heading text-[10px] uppercase tracking-[0.3em] text-primary opacity-60';
  const stepTitleClassName = 'font-heading text-2xl font-bold uppercase tracking-tight text-white italic sm:text-3xl';

  return (
    <div className="grid min-w-0 gap-8 overflow-x-clip lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
      <form id="booking-form" onSubmit={onSubmit} className="min-w-0 space-y-4 overflow-x-clip">
        <section className={stepSectionClassName}>
          <div className={stepHeaderClassName}>
            <span className={stepNumClassName}>Шаг 1/5</span>
            <h2 className={stepTitleClassName}>Выбор площадки</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
            <div className="space-y-3">
              <Label htmlFor="booking-city" className="font-mono text-[10px] uppercase tracking-widest text-primary/70">Город *</Label>
              <Select value={form.city} onValueChange={(value) => setForm({ ...form, city: value, club: '' })}>
                <SelectTrigger id="booking-city" className="h-14 rounded-xl border-white/10 bg-white/[0.02] text-white focus:ring-primary/40">
                  <SelectValue placeholder="Выберите город" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900 text-white">
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="booking-club" className="font-mono text-[10px] uppercase tracking-widest text-primary/70">Площадка *</Label>
              <Select value={form.club} onValueChange={(value) => setForm({ ...form, club: value })} disabled={!form.city}>
                <SelectTrigger id="booking-club" className="h-14 rounded-xl border-white/10 bg-white/[0.02] text-white focus:ring-primary/40">
                  <SelectValue placeholder={form.city ? 'Выберите площадку' : 'Сначала выберите город'} />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900 text-white">
                  {availableClubs.map((club) => (
                    <SelectItem key={club} value={club}>
                      {club}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className={`${stepSectionClassName} ${!isStepUnlocked(2) ? 'pointer-events-none opacity-20 grayscale' : ''}`}>
          <div className={stepHeaderClassName}>
            <span className={stepNumClassName}>Шаг 2/5</span>
            <h2 className={stepTitleClassName}>Количество игроков</h2>
          </div>
          <div className="mb-4 rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm leading-relaxed text-slate-300">
            Укажите ориентир по составу команды. Оператор после заявки поможет подобрать подходящий формат и подтвердит детали.
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 sm:gap-3">
            {Array.from({ length: 10 }, (_, index) => (index + 1).toString()).map((num) => (
              <button
                key={num}
                type="button"
                aria-label={`${num} игроков`}
                onClick={() => setForm({ ...form, players: num })}
                className={`flex aspect-square min-h-12 w-full items-center justify-center rounded-lg border text-sm font-black transition-all duration-300 sm:text-base ${form.players === num ? 'border-primary bg-primary text-background shadow-[0_0_25px_rgba(13,166,166,0.4)] sm:scale-110' : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/30'}`}
              >
                {num}
              </button>
            ))}
          </div>
        </section>

        <section className={`${stepSectionClassName} ${!isStepUnlocked(3) ? 'pointer-events-none opacity-20 grayscale' : ''}`}>
          <div className={stepHeaderClassName}>
            <span className={stepNumClassName}>Шаг 3/5</span>
            <h2 className={stepTitleClassName}>Дата и слот</h2>
          </div>

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-slate-300">
            Слот — это предпочтительное время начала игры. Финальное подтверждение и свободность слота оператор уточнит после отправки заявки.
          </div>

          <div className="group relative mb-8 flex items-center sm:mb-10">
            <button
              type="button"
              onClick={() => scrollDates('left')}
              className="absolute -left-2 z-20 hidden rounded-full border border-white/10 bg-slate-900/80 p-2 text-primary opacity-0 transition-opacity group-hover:opacity-100 sm:block lg:-left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div ref={scrollContainerRef} className="-mx-4 flex items-center gap-3 overflow-x-auto px-4 pb-4 scroll-smooth sm:mx-0 sm:gap-4 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {dates.map((date) => (
                <button
                  key={date.full}
                  type="button"
                  aria-label={`Дата ${date.full}`}
                  onClick={() => setForm({ ...form, date: date.full, slot: '' })}
                  className={`flex w-[4.25rem] flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border px-2 py-2.5 transition-all duration-300 sm:w-20 sm:gap-1 sm:py-4 ${form.date === date.full ? 'border-primary bg-primary text-background shadow-[0_0_25px_rgba(13,166,166,0.3)]' : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/30'}`}
                >
                  <span className="font-mono text-[10px] font-bold uppercase">{date.dayName}</span>
                  <span className="text-xl leading-none font-black sm:text-2xl">{date.dayNum}</span>
                  <span className="font-mono text-[10px] font-bold uppercase opacity-60">{date.month}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollDates('right')}
              className="absolute -right-2 z-20 hidden rounded-full border border-white/10 bg-slate-900/80 p-2 text-primary opacity-0 transition-opacity group-hover:opacity-100 sm:block lg:-right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-6 text-[11px] uppercase tracking-[0.16em] text-slate-500 sm:hidden">
            Листайте даты по горизонтали
          </p>

          <div className={`transition-all duration-500 ${form.date ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-20 blur-[2px]'}`}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  aria-label={`Слот ${slot}`}
                  onClick={() => setForm({ ...form, slot })}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-3 py-4 text-center transition-all duration-300 ${form.slot === slot ? 'border-primary bg-primary text-background shadow-[0_0_25px_rgba(13,166,166,0.3)]' : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/30'}`}
                >
                  <span className="text-lg font-black sm:text-xl">{slot}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className={`${stepSectionClassName} ${!isStepUnlocked(4) ? 'pointer-events-none opacity-20 grayscale' : ''}`}>
          <div className={stepHeaderClassName}>
            <span className={stepNumClassName}>Шаг 4/5</span>
            <h2 className={stepTitleClassName}>Контактные данные</h2>
          </div>
          <div className="grid gap-5 sm:gap-8">
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
              <div className="space-y-3">
                <Label htmlFor="booking-name" className="font-mono text-[10px] uppercase tracking-widest text-primary/70">Имя *</Label>
                <Input
                  id="booking-name"
                  placeholder="Ваше имя"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="h-14 rounded-xl border-white/10 bg-white/[0.02] text-white focus:ring-primary/40"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="booking-phone" className="font-mono text-[10px] uppercase tracking-widest text-primary/70">Телефон *</Label>
                <Input
                  id="booking-phone"
                  placeholder="+7 (___) ___-__-__"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  className="h-14 rounded-xl border-white/10 bg-white/[0.02] text-white focus:ring-primary/40"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="booking-comment" className="font-mono text-[10px] uppercase tracking-widest text-primary/70 opacity-60">Комментарий</Label>
              <Textarea
                id="booking-comment"
                placeholder="Например: детский день рождения, корпоративная группа, нужен звонок после 18:00"
                value={form.comment}
                onChange={(event) => setForm({ ...form, comment: event.target.value })}
                className="min-h-[140px] rounded-xl border-white/10 bg-white/[0.02] text-white placeholder:text-white/10 focus:ring-primary/40"
              />
            </div>
          </div>
        </section>
      </form>

      <aside className="min-w-0 h-fit lg:sticky lg:top-32">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_0_60px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:rounded-[2.5rem] sm:p-8">
          <h2 className="mb-6 border-b border-white/10 pb-4 text-xl font-black uppercase italic tracking-tight text-white sm:mb-10 sm:pb-6 sm:text-2xl">
            Ваш <span className="text-primary [text-shadow:0_0_15px_rgba(13,166,166,0.5)]">матч</span>
          </h2>
          <div className="mb-6 space-y-4 sm:mb-10 sm:space-y-6">
            {[
              { label: 'Площадка', value: form.club },
              { label: 'Город', value: form.city },
              { label: 'Дата', value: form.date },
              { label: 'Слот', value: form.slot },
              { label: 'Игроков', value: form.players ? `${form.players} чел.` : '' }
            ].map((item) => (
              <div key={item.label} className="flex min-w-0 items-end justify-between gap-3">
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{item.label}:</span>
                <span className="min-w-0 break-words text-right text-xs font-bold uppercase text-white sm:text-sm">{item.value || '---'}</span>
              </div>
            ))}
          </div>
          <Button
            form="booking-form"
            type="submit"
            disabled={status === 'loading'}
            className={`h-14 w-full rounded-2xl px-3 text-sm font-black uppercase italic tracking-[0.12em] transition-all duration-500 sm:h-16 sm:px-4 sm:text-xl sm:tracking-widest ${canSubmit ? 'bg-primary text-background shadow-[0_0_30px_rgba(13,166,166,0.4)]' : 'border-white/5 bg-white/5 text-slate-500'}`}
          >
            {status === 'loading' ? 'ОТПРАВКА...' : 'ЗАБРОНИРОВАТЬ'}
          </Button>
          {message && (
            <p className={`mt-6 break-words text-center font-mono text-[11px] uppercase tracking-[0.14em] sm:text-xs sm:tracking-widest ${status === 'success' ? 'text-emerald-400' : 'animate-pulse text-primary'}`}>
              {message}
            </p>
          )}
        </div>
      </aside>

    </div>
  );
};
