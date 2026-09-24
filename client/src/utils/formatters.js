// Currency format (ex: R$ 1.250,00)
export function formatCurrency(value) {
  const num = Number(value) || 0;
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

// Date format (YYYY-MM-DD to DD/MM/YYYY)
export function formatDateBR(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Calculate age from YYYY-MM-DD
export function calculateAge(birthDateStr) {
  if (!birthDateStr) return '';
  const [year, month, day] = birthDateStr.split('-').map(Number);
  const birth = new Date(year, month - 1, day);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 ? `${age} anos` : 'Menos de 1 ano';
}

// Today formatted as YYYY-MM-DD
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Clean phone for WhatsApp (ex: (11) 98765-4321 -> 5511987654321)
export function getWhatsAppLink(phone, message = '') {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  const full = digits.startsWith('55') ? digits : `55${digits}`;
  const textParam = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${full}${textParam}`;
}
