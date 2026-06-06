# Check-in Med

Marketplace para conectar médicos especialistas a clínicas com horários ociosos.

## Requisitos

- Node.js 18+
- npm 9+
- Docker Desktop

---

## Como rodar

### 1. Docker

```powershell
Copy-Item .env.example .env  # Windows
docker compose -f docker/docker-compose.yml up -d postgres-master postgres-slave traefik api
```

Esse `.env` único alimenta o backend e o Docker. O compose sobe o master na porta `5432`, o slave na `5433` e a API atrás do Traefik em `http://localhost`.
A API continua apontando para o master, então a leitura/escrita fica consistente e a réplica consegue acompanhar os dados.
Se você já estiver com o Node local usando a `3333`, a API do container fica exposta em `http://localhost:3334`.

### 2. Backend

```bash
cd backend
npm install
npm run prisma:migrate
npm run dev
```

O backend passa a ler as variáveis do `.env` da raiz do projeto.

API disponível em `http://localhost:3333` quando rodar localmente sem Docker.

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

| E-mail | Senha | Tipo |
|---|---|---|
| lucas.almeida@checkinmed.test | 12345678 | PROFESSIONAL |
| marina.souza@checkinmed.test | 12345678 | PROFESSIONAL |
| joao.empresa@checkinmed.test | 12345678 | ENTERPRISE |

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