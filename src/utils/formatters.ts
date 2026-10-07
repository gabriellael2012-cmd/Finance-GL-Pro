import { PeriodFilter, TransactionStatus, TransactionType } from '../types';

export const formatBRL = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatCurrency = formatBRL;

export const formatCompactBRL = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1).replace('.', ',')}k`;
  }
  return formatBRL(value);
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
};

export const formatDateBR = formatDate;

export const formatDateShort = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [, month, day] = parts;
      return `${day}/${month}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
};

export const formatMonthYear = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
};

export const formatPercent = (value: number, withSign: boolean = true): string => {
  if (isNaN(value)) return '0%';
  const sign = withSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1).replace('.', ',')}%`;
};

export const getPaymentMethodLabel = (method: string): string => {
  const map: Record<string, string> = {
    pix: 'PIX',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    bank_transfer: 'Transferência / TED',
    cash: 'Dinheiro em Espécie',
    boleto: 'Boleto Bancário',
    other: 'Outros',
  };
  return map[method] || method || 'Outro';
};

export const getStatusDetails = (status: TransactionStatus, type: TransactionType) => {
  switch (status) {
    case 'completed':
      return {
        label: type === 'income' ? 'Recebido' : type === 'expense' ? 'Pago' : 'Concluído',
        bg: 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400',
        dot: 'bg-emerald-400',
        badge: '🟢',
      };
    case 'pending':
      return {
        label: 'Pendente',
        bg: 'bg-amber-950/40 border-amber-800/40 text-amber-400',
        dot: 'bg-amber-400',
        badge: '🟡',
      };
    case 'scheduled':
      return {
        label: 'Agendado',
        bg: 'bg-blue-950/40 border-blue-800/40 text-blue-400',
        dot: 'bg-blue-400',
        badge: '🔵',
      };
    case 'overdue':
      return {
        label: 'Vencido',
        bg: 'bg-rose-950/40 border-rose-800/40 text-rose-400',
        dot: 'bg-rose-400',
        badge: '🔴',
      };
    default:
      return {
        label: 'Normal',
        bg: 'bg-slate-800/60 border-slate-700 text-slate-300',
        dot: 'bg-slate-400',
        badge: '⚪',
      };
  }
};

export const getPeriodDates = (
  period: PeriodFilter,
  customStart?: string,
  customEnd?: string
): { start: string; end: string; prevStart: string; prevEnd: string; label: string } => {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const toYMD = (d: Date) => d.toISOString().slice(0, 10);

  switch (period) {
    case 'today': {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        start: todayStr,
        end: todayStr,
        prevStart: toYMD(yesterday),
        prevEnd: toYMD(yesterday),
        label: 'Hoje',
      };
    }
    case 'this_week': {
      const dayOfWeek = now.getDay(); // 0 is Sunday
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const prevMonday = new Date(monday);
      prevMonday.setDate(monday.getDate() - 7);
      const prevSunday = new Date(prevMonday);
      prevSunday.setDate(prevMonday.getDate() + 6);

      return {
        start: toYMD(monday),
        end: toYMD(sunday),
        prevStart: toYMD(prevMonday),
        prevEnd: toYMD(prevSunday),
        label: 'Esta semana',
      };
    }
    case 'this_month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      return {
        start: toYMD(startOfMonth),
        end: toYMD(endOfMonth),
        prevStart: toYMD(startOfPrevMonth),
        prevEnd: toYMD(endOfPrevMonth),
        label: 'Este mês',
      };
    }
    case 'prev_month': {
      const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const startOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const endOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 1, 0);

      return {
        start: toYMD(startOfPrevMonth),
        end: toYMD(endOfPrevMonth),
        prevStart: toYMD(startOfTwoMonthsAgo),
        prevEnd: toYMD(endOfTwoMonthsAgo),
        label: 'Mês anterior',
      };
    }
    case 'last_3_months': {
      const startOf3m = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const endOf3m = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const startOfPrev3m = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const endOfPrev3m = new Date(now.getFullYear(), now.getMonth() - 2, 0);

      return {
        start: toYMD(startOf3m),
        end: toYMD(endOf3m),
        prevStart: toYMD(startOfPrev3m),
        prevEnd: toYMD(endOfPrev3m),
        label: 'Últimos 3 meses',
      };
    }
    case 'last_6_months': {
      const startOf6m = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const endOf6m = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const startOfPrev6m = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      const endOfPrev6m = new Date(now.getFullYear(), now.getMonth() - 5, 0);

      return {
        start: toYMD(startOf6m),
        end: toYMD(endOf6m),
        prevStart: toYMD(startOfPrev6m),
        prevEnd: toYMD(endOfPrev6m),
        label: 'Últimos 6 meses',
      };
    }
    case 'this_year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);

      const startOfPrevYear = new Date(now.getFullYear() - 1, 0, 1);
      const endOfPrevYear = new Date(now.getFullYear() - 1, 11, 31);

      return {
        start: toYMD(startOfYear),
        end: toYMD(endOfYear),
        prevStart: toYMD(startOfPrevYear),
        prevEnd: toYMD(endOfPrevYear),
        label: 'Este ano',
      };
    }
    case 'custom': {
      const s = customStart || todayStr;
      const e = customEnd || todayStr;
      return {
        start: s,
        end: e,
        prevStart: s,
        prevEnd: e,
        label: 'Personalizado',
      };
    }
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        start: toYMD(start),
        end: toYMD(end),
        prevStart: toYMD(start),
        prevEnd: toYMD(end),
        label: 'Este mês',
      };
    }
  }
};
