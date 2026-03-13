# Recibos de Premiação — Cartão de Todos Ceilândia

Sistema web para geração e histórico de recibos de premiação.

---

## Como colocar no ar (passo a passo)

### 1. Supabase (banco de dados)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Clique em **New Project** e escolha um nome
3. Após criar, vá em **SQL Editor** e cole o conteúdo do arquivo `supabase_setup.sql` e clique em **Run**
4. Vá em **Project Settings > API** e copie:
   - **Project URL** (ex: `https://xyzabc.supabase.co`)
   - **anon public** key
5. Abra o arquivo `app.js` e substitua nas linhas iniciais:
   ```js
   const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';  // cole aqui
   const SUPABASE_KEY = 'SUA_ANON_KEY';                     // cole aqui
   ```
6. Para criar o usuário de login: **Authentication > Users > Add user**

---

### 2. GitHub (armazenar os arquivos)

1. Acesse [github.com](https://github.com) e crie uma conta
2. Clique em **New repository**, dê um nome (ex: `recibos-app`)
3. Faça upload dos 3 arquivos:
   - `index.html`
   - `app.js`
   - `supabase_setup.sql` (opcional, só para referência)
4. Confirme o commit

---

### 3. Vercel (publicar online)

1. Acesse [vercel.com](https://vercel.com) e entre com sua conta GitHub
2. Clique em **Add New > Project**
3. Selecione o repositório `recibos-app`
4. Clique em **Deploy** — não precisa configurar nada
5. Em segundos você receberá um link público (ex: `recibos-app.vercel.app`)

---

### 4. UptimeRobot (evitar pausa do Supabase)

1. Acesse [uptimerobot.com](https://uptimerobot.com) e crie uma conta gratuita
2. Clique em **Add New Monitor**
3. Tipo: **HTTP(s)**, URL: seu link do Vercel
4. Intervalo: **a cada 3 dias**
5. Pronto — o Supabase nunca vai pausar

---

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | Interface completa do sistema |
| `app.js` | Lógica, integração Supabase, geração Excel/PDF |
| `supabase_setup.sql` | Script para criar a tabela no banco |
| `README.md` | Este guia |

---

## Funcionalidades

- Login com e-mail e senha
- Geração de recibos para os setores **Gerente** e **Coordenadores**
- Cálculo automático do valor por extenso
- Pré-visualização antes de salvar
- Download em **Excel** (.xlsx)
- Download em **PDF**
- Histórico completo com busca por nome, setor e mês
- Dashboard com totais e últimos recibos
