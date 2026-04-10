'use client';

import { FormEvent, useMemo, useState } from 'react';
import type { PartnerPayload } from '@/types/api';
import { Target } from 'lucide-react';
import { apiUrl, parseError } from '@/lib/api';
import { extractSourceFromParams } from '@/lib/source';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type BusinessFormState = {
  name: string;
  company: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  message: string;
};

const initialFormState: BusinessFormState = {
  name: '',
  company: '',
  city: '',
  phone: '',
  email: '',
  website: '',
  message: ''
};

export const buildPartnerPayload = (form: BusinessFormState, source?: string): PartnerPayload => ({
  name: form.name.trim(),
  company: form.company.trim(),
  city: form.city.trim(),
  phone: form.phone.trim() || undefined,
  email: form.email.trim() || undefined,
  website: form.website.trim() || undefined,
  message: form.message.trim() || undefined,
  source
});

export const BusinessForm = () => {
  const [form, setForm] = useState<BusinessFormState>(initialFormState);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const fieldErrors = useMemo(
    () => ({
      name: form.name.trim() ? '' : 'Введите имя',
      company: form.company.trim() ? '' : 'Введите компанию',
      city: form.city.trim() ? '' : 'Введите город',
      contact: form.phone.trim() || form.email.trim() ? '' : 'Укажите телефон или email'
    }),
    [form]
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (fieldErrors.name || fieldErrors.company || fieldErrors.city || fieldErrors.contact) {
      setStatus('error');
      setMessage('Пожалуйста, заполните обязательные поля.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const source = typeof window === 'undefined' ? undefined : extractSourceFromParams(new URLSearchParams(window.location.search));
      const payload = buildPartnerPayload(form, source);

      const response = await fetch(apiUrl('/partners'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      setStatus('success');
      setMessage('Заявка отправлена. Мы свяжемся с вами для обсуждения запуска площадки.');
      setForm(initialFormState);
      setSubmitAttempted(false);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Произошла ошибка при отправке');
    }
  };

  const isInvalid = (field: keyof typeof fieldErrors) => submitAttempted && !!fieldErrors[field];
  const nameErrorId = isInvalid('name') ? 'partner-name-error' : undefined;
  const companyErrorId = isInvalid('company') ? 'partner-company-error' : undefined;
  const cityErrorId = isInvalid('city') ? 'partner-city-error' : undefined;
  const contactErrorId = isInvalid('contact') ? 'partner-contact-error' : undefined;

  return (
    <div id="partner-form" className="shrink-0 lg:w-[450px]">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_0_60px_rgba(13,166,166,0.15)] backdrop-blur-md">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-white">
            Подключить <span className="text-primary [text-shadow:0_0_15px_rgba(13,166,166,0.5)]">SHOOTER VR</span>
          </h2>
          <Target className="h-6 w-6 animate-pulse text-primary" />
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="partner-name">Имя *</Label>
              <Input
                id="partner-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                aria-invalid={isInvalid('name')}
                aria-describedby={nameErrorId}
                className={isInvalid('name') ? 'border-rose-500/50 ring-1 ring-rose-500/20' : ''}
                placeholder="Алексей"
              />
              {nameErrorId ? <p id={nameErrorId} className="font-mono text-[10px] uppercase tracking-widest text-rose-400">{fieldErrors.name}</p> : null}
            </div>
            <div className="space-y-1">
              <Label htmlFor="partner-company">Компания *</Label>
              <Input
                id="partner-company"
                value={form.company}
                onChange={(event) => setForm({ ...form, company: event.target.value })}
                aria-invalid={isInvalid('company')}
                aria-describedby={companyErrorId}
                className={isInvalid('company') ? 'border-rose-500/50 ring-1 ring-rose-500/20' : ''}
                placeholder="Название компании"
              />
              {companyErrorId ? <p id={companyErrorId} className="font-mono text-[10px] uppercase tracking-widest text-rose-400">{fieldErrors.company}</p> : null}
            </div>
            <div className="space-y-1">
              <Label htmlFor="partner-city">Город *</Label>
              <Input
                id="partner-city"
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
                aria-invalid={isInvalid('city')}
                aria-describedby={cityErrorId}
                className={isInvalid('city') ? 'border-rose-500/50 ring-1 ring-rose-500/20' : ''}
                placeholder="Ваш город"
              />
              {cityErrorId ? <p id={cityErrorId} className="font-mono text-[10px] uppercase tracking-widest text-rose-400">{fieldErrors.city}</p> : null}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="partner-phone">Телефон</Label>
                <Input
                  id="partner-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  aria-invalid={isInvalid('contact')}
                  aria-describedby={contactErrorId}
                  className={isInvalid('contact') ? 'border-rose-500/50 ring-1 ring-rose-500/20' : ''}
                  placeholder="+7..."
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="partner-email">Email</Label>
                <Input
                  id="partner-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  aria-invalid={isInvalid('contact')}
                  aria-describedby={contactErrorId}
                  className={isInvalid('contact') ? 'border-rose-500/50 ring-1 ring-rose-500/20' : ''}
                  placeholder="mail@company.ru"
                />
              </div>
            </div>
            {contactErrorId ? <p id={contactErrorId} className="font-mono text-[10px] uppercase tracking-widest text-rose-400">{fieldErrors.contact}</p> : null}
            <div className="space-y-1">
              <Label htmlFor="partner-website">Сайт</Label>
              <Input
                id="partner-website"
                type="url"
                value={form.website}
                onChange={(event) => setForm({ ...form, website: event.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="partner-message">Сообщение</Label>
              <Textarea
                id="partner-message"
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                className="min-h-[120px]"
                placeholder="Расскажите о площадке..."
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={status === 'loading'}
            className="font-heading h-16 w-full rounded-xl bg-primary font-black uppercase tracking-widest text-background shadow-[0_0_20px_rgba(13,166,166,0.3)] transition-transform hover:scale-[1.02]"
          >
            {status === 'loading' ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ ЗАЯВКУ'}
          </Button>

          {message && (
            <p
              role={status === 'success' ? 'status' : 'alert'}
              aria-live={status === 'success' ? 'polite' : 'assertive'}
              className={`mt-4 text-center font-mono text-xs uppercase tracking-widest ${status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
