// As datas vêm da API já como string ISO completa (o driver do Neon serializa
// colunas DATE como timestamp UTC). Usamos timeZone: 'UTC' na formatação pra
// exibir o mesmo dia que está salvo no banco, sem deslocar por causa do fuso do
// navegador (ex: meia-noite UTC vira 21h do dia anterior em horário de Brasília).

export function formatarData(data) {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

export function formatarDataAbrev(data) {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

export function formatarDataCurta(data) {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC'
  });
}
