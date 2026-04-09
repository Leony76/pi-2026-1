require("dotenv/config");

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const seedUsers = [
  {
    name: "Dr. Lucas Almeida",
    specialty: "Cardiologia",
    crmCrp: "CRM12345",
    email: "lucas.almeida@checkinmed.test",
    password: "12345678",
  },
  {
    name: "Dra. Marina Souza",
    specialty: "Dermatologia",
    crmCrp: "CRM54321",
    email: "marina.souza@checkinmed.test",
    password: "12345678",
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
        crmCrp: user.crmCrp,
        email: user.email,
        passwordHash,
      },
    });
  }

  console.log(`Seed concluido: ${seedUsers.length} registros processados.`);
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
