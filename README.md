
# Check-in Med

Marketplace bilateral para conectar medicos especialistas a clinicas com horarios ociosos, com modelo pay-per-use para reserva de consultorios.

## Objetivo

Permitir que medicos reservem salas de atendimento por hora/turno sem custo fixo alto, enquanto clinicas aumentam taxa de ocupacao e receita.

## Stack

- Front-end mobile: React Native + TypeScript + Expo
- Back-end: Node.js + Express + TypeScript
- ORM: Prisma
- Banco de dados: PostgreSQL
- Infra local: Docker Compose

## Estrutura do repositorio

- backend: API REST (auth, usuarios, Prisma)
- mobile: aplicativo Expo/React Native
- docker: arquivos de composicao para infra local

## Requisitos

- Node.js 18+
- npm 9+
- Docker Desktop

## Configuracao rapida

### 1) Subir banco PostgreSQL

Na raiz do projeto:

```bash
docker compose -f docker/docker-compose.yml up -d postgres-master
```

### 2) Configurar backend

```bash
cd backend
cp .env.example .env
```

Se estiver no Windows PowerShell e o `cp` falhar:

```powershell
Copy-Item .env.example .env
```

Instalar dependencias:

```bash
npm install
```

Rodar migracoes:

```bash
npm run prisma:migrate -- --name create_user_table
```

Subir API:

```bash
npm run dev
```

API padrao: `http://localhost:3333`

### 3) Configurar mobile

Em outro terminal:

```bash
cd mobile
npm install
```

Opcional: configure URL da API para mobile criando um `.env` em `mobile`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3333
```

Para emulador Android, normalmente use:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3333
```

Iniciar app:

```bash
npm run start
```

## Endpoints atuais

### Healthcheck

- `GET /health`

Resposta esperada:

```json
{
	"status": "ok"
}
```

### Auth

- `POST /auth/register`
- `POST /auth/login`

#### Exemplo register

```json
{
	"name": "Medico Teste",
	"specialty": "Cardiologia",
	"crmCrp": "CRM12345",
	"email": "medico@teste.com",
	"password": "12345678",
	"repeatPassword": "12345678"
}
```

#### Exemplo login

```json
{
	"email": "medico@teste.com",
	"password": "12345678"
}
```

Resposta de sucesso (register/login):

```json
{
	"user": {
		"id": "uuid",
		"name": "Medico Teste",
		"specialty": "Cardiologia",
		"crmCrp": "CRM12345",
		"email": "medico@teste.com",
		"createdAt": "2026-04-08T21:03:56.294Z"
	},
	"token": "jwt-token"
}
```

### Usuario autenticado

- `GET /users/me`
- Header: `Authorization: Bearer <token>`

## Scripts uteis

### Backend

- `npm run dev`: sobe API em desenvolvimento
- `npm run build`: compila TypeScript
- `npm run prisma:generate`: gera client Prisma
- `npm run prisma:migrate`: executa migracoes locais

### Mobile

- `npm run start`: abre Expo
- `npm run android`: abre no Android
- `npm run ios`: abre no iOS
- `npm run web`: abre no navegador

## Status atual

- Cadastro e login funcionando no backend
- Integracao de login/cadastro no mobile implementada
- Migracao inicial do banco aplicada

## Proximos passos sugeridos

- Persistencia de sessao no mobile (token)
- Fluxo de logout
- Recuperacao de senha
- Catalogo de salas e agenda em tempo real


