
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

- `POST /auth/register` - Registra novo usuario com auto-geração de refresh token
- `POST /auth/login` - Autentica usuario e retorna access + refresh tokens
- `POST /auth/refresh` - Renova access token usando refresh token
- `POST /auth/logout` - Invalida refresh token do usuario
- `POST /auth/request-email-verification` - Gera token de verificacao de email (7 dias)
- `POST /auth/verify-email` - Valida email do usuario
- `POST /auth/request-password-reset` - Gera token de reset de senha (1 hora)
- `POST /auth/reset-password` - Atualiza senha com token valido

Para endpoints autenticados, passar header:
```
Authorization: Bearer <access_token>
```

```json
{
	"success": false,
	"code": "bad_request",
	"message": "Missing required fields"
}
```

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
		"emailVerifiedAt": null,
		"createdAt": "2026-04-08T21:03:56.294Z"
	},
	"token": "jwt-access-token",
	"accessToken": "jwt-access-token",
	"refreshToken": "opaque-refresh-token",
	"emailVerificationToken": "opaque-verification-token"
}
```

#### Exemplo refresh token

```json
{
	"refreshToken": "opaque-refresh-token"
}
```

Resposta:

```json
{
	"token": "new-jwt-access-token",
	"refreshToken": "new-opaque-refresh-token"
}
```

#### Exemplo request email verification

```json
{
	"email": "medico@teste.com"
}
```

Resposta:

```json
{
	"message": "Verification email sent",
	"verificationToken": "token-para-dev-testing"
}
```

#### Exemplo verify email

```json
{
	"token": "verification-token-recebido-por-email"
}
```

#### Exemplo request password reset

```json
{
	"email": "medico@teste.com"
}
```

#### Exemplo reset password

```json
{
	"token": "reset-token-recebido-por-email",
	"password": "nova-senha",
	"repeatPassword": "nova-senha"
}
```

### Usuario autenticado

- `GET /users/me`
- Header: `Authorization: Bearer <token>`

## Seed de teste

O backend possui um seed para popular o banco com usuarios de teste, util para validar cadastro, login e perfil autenticado.

Executar no backend:

```bash
npm run prisma:seed
```

Usuarios criados pelo seed:

| Nome | Especialidade | CRM/CRP | E-mail | Senha |
| --- | --- | --- | --- | --- |
| Dr. Lucas Almeida | Cardiologia | CRM12345 | lucas.almeida@checkinmed.test | 12345678 |
| Dra. Marina Souza | Dermatologia | CRM54321 | marina.souza@checkinmed.test | 12345678 |

Observacao: o seed e idempotente, entao pode ser executado mais de uma vez sem duplicar registros.

## Scripts uteis

### Backend

- `npm run dev`: sobe API em desenvolvimento
- `npm run build`: compila TypeScript
- `npm run test`: executa testes vitest
- `npm run test:watch`: executa testes em modo watch
- `npm run prisma:generate`: gera client Prisma
- `npm run prisma:migrate`: executa migracoes locais
- `npm run prisma:seed`: popula banco com dados de teste
- `npm run prisma:reset`: reseta banco (dev only!)

### Mobile

- `npm run start`: abre Expo
- `npm run android`: abre no Android emulator
- `npm run ios`: abre no iOS simulator
- `npm run web`: abre no navegador

## Status atual

### Backend ✅

- Cadastro e login funcionando
- Refresh token com opaque tokens hasheados (30 dias TTL)
- Logout com invalidacao de refresh token
- Verificacao de email com token temporario (7 dias TTL)
- Reset de senha com token temporario (1 hora TTL)
- Padronizacao de erros com HttpError class
- Rate limiting global (500/15min) e por endpoint auth (20/15min)
- Security headers via helmet
- Testes automatizados (8 testes, vitest runner)
- 10 migracoes Prisma aplicadas

### Mobile ✅

- Autenticacao com login/register completa
- Persistencia de sessao com SecureStore (nativo) + localStorage (web)
- Auto-sign-in apos registro de novo usuario
- Refresh token automatico em requisicoes 401
- Logout com limpeza de tokens
- ErrorModal para exibir erros de forma amigavel
- Fluxo protegido (authenticated routes)
- Dashboard com perfil do usuario carregado via API
- Traducao completa para portugues das mensagens




