const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), "../.env") });

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const seedUsers = [
  {
    name: "Lucas Almeida",
    specialty: "Cardiologia",
    crmCrp: "12345-SP",
    email: "lucas.almeida@checkinmed.test",
    accountType: "PROFESSIONAL",
    password: "12345678",
  },
  {
    name: "Marina Souza",
    specialty: "Dermatologia",
    crmCrp: "54321-RJ",
    email: "marina.souza@checkinmed.test",
    accountType: "PROFESSIONAL",
    password: "12345678",
  },
  {
    name: "João Empresa",
    specialty: "Clinica Geral",
    crmCrp: "00001-EN",
    email: "joao.empresa@checkinmed.test",
    accountType: "ENTERPRISE",
    password: "12345678",
  },
];

const seedRooms = [
  {
    title: "Sala 01 - Consultório",
    displayImage: "https://kannoarquitetura.com.br/wp-content/uploads/2021/06/Consultorio-medico-moderno.jpg",
    floor: "GROUND_FLOOR",
    area: "18",
    characteristic: "AIR_CONDITIONER",
    isAvailable: true,
    prices: {
      pricePerHour: "79.9",
      priceWeek: "599.9",
      pricePerMonth: "899.9",
    },
  },
  {
    title: "Sala 02 - Psicologia",
    displayImage: "https://s2-casaejardim.glbimg.com/YDSDM-LluilU9ssjfRE2TZKyU30=/0x0:1400x933/888x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_a0b7e59562ef42049f4e191fe476fe7d/internal_photos/bs/2023/R/0/0LKjMLQMmeMBUzxzgUuA/1-consultorio-simara-mello.jpg",
    floor: "GROUND_FLOOR",
    area: "16",
    characteristic: "SOUNDPROOFED",
    isAvailable: true,
    prices: {
      pricePerHour: "64.9",
      priceWeek: "479.9",
      pricePerMonth: "779.9",
    },
  },
  {
    title: "Sala 03 - Premium",
    displayImage: "https://cdn.cineart.com.br/cineart_411857079.jpg",
    floor: "FIRST_FLOOR",
    area: "69",
    characteristic: "AIR_CONDITIONER_PLUS_SOUNDPROOFED",
    isAvailable: false,
    prices: {
      pricePerHour: "264.9",
      priceWeek: "1779.9",
      pricePerMonth: "2879.9",
    },
  },
];

async function main() {
  
  for (const user of seedUsers) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: user.email }, { crmCrp: user.crmCrp }],
      },
    });

    if (existingUser) {
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        specialty: user.specialty,
        accountType: user.accountType,
        crmCrp: user.crmCrp,
        email: user.email,
        passwordHash,
      },
    });
  }

  console.log(`${seedUsers.length} usuários processados.`);

  
  const enterpriseUser = await prisma.user.findFirst({
    where: { email: "joao.empresa@checkinmed.test" },
  });

  if (!enterpriseUser) {
    console.error("Usuário enterprise não encontrado para criar salas");
    return;
  }

  for (const room of seedRooms) {
    const existingRoom = await prisma.room.findFirst({
      where: {
        AND: [{ enterpriseOwnerId: enterpriseUser.id }, { title: room.title }],
      },
    });

    if (existingRoom) {
      continue;
    }

    const createdRoom = await prisma.room.create({
      data: {
        title: room.title,
        displayImage: room.displayImage,
        floor: room.floor,
        area: room.area,
        characteristic: room.characteristic,
        isAvailable: room.isAvailable,
        enterpriseOwnerId: enterpriseUser.id,
      },
    });

    
    await prisma.roomPrice.create({
      data: {
        roomId: createdRoom.id,
        pricePerHour: room.prices.pricePerHour,
        priceWeek: room.prices.priceWeek,
        pricePerMonth: room.prices.pricePerMonth,
      },
    });
  }

  console.log(`${seedRooms.length} salas processadas.`);
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
