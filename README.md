# Check-in Med

Marketplace para conectar médicos especialistas a clínicas com horários ociosos.

## Requisitos

- Node.js 18+
- npm 9+
- Docker Desktop

---

## Como rodar

### 1. Banco de dados

```bash
docker compose -f docker/docker-compose.yml up -d postgres-master
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # Windows: Copy-Item .env.example .env
npm install
npm run prisma:migrate
npm run dev
```

API disponível em `http://localhost:3333`

### 3. Mobile

Em outro terminal:

```bash
cd mobile
npm install
npm run start
```

> Por padrão o mobile aponta para `http://localhost:3333`.
> Para emulador Android, crie um `.env` em `mobile/` com:
> ```
> EXPO_PUBLIC_API_URL=http://10.0.2.2:3333
> ```

---

## Dados de teste

```bash
cd backend && npm run prisma:seed
```

| E-mail | Senha |
|---|---|
| lucas.almeida@checkinmed.test | 12345678 |
| marina.souza@checkinmed.test | 12345678 |

---

## Scripts úteis

**Backend** — `cd backend`

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe a API |
| `npm run test` | Roda os testes |
| `npm run prisma:seed` | Popula o banco |
| `npm run prisma:reset` | Reseta o banco |

**Mobile** — `cd mobile`

| Comando | O que faz |
|---|---|
| `npm run start` | Abre o Expo |
| `npm run android` | Emulador Android |
| `npm run ios` | Simulador iOS |