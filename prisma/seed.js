const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Clear existing data
  await prisma.promotion.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.masterPortfolio.deleteMany({});
  await prisma.masterProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('Cleared existing data.');

  // 2. Seed Categories
  const plumbers = await prisma.category.create({
    data: {
      name: 'Сантехники',
      slug: 'plumbers',
      icon: 'Droplet',
      imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
    },
  });

  const electricians = await prisma.category.create({
    data: {
      name: 'Электрики',
      slug: 'electricians',
      icon: 'Zap',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    },
  });

  const locks = await prisma.category.create({
    data: {
      name: 'Замки и двери',
      slug: 'locks',
      icon: 'Key',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
    },
  });

  const appliances = await prisma.category.create({
    data: {
      name: 'Ремонт бытовой техники',
      slug: 'appliances',
      icon: 'Wrench',
      imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=600&q=80',
    },
  });

  const ac = await prisma.category.create({
    data: {
      name: 'Кондиционеры',
      slug: 'ac',
      icon: 'Wind',
      imageUrl: 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&w=600&q=80',
    },
  });

  console.log('Seeded 5 categories.');

  // 3. Seed Users & MasterProfiles
  // Admin User
  await prisma.user.create({
    data: {
      email: 'admin@masterhub.kz',
      password: 'adminpassword', // plain for demo auth
      name: 'Администратор MasterHub',
      phone: '+7 (700) 111-22-33',
      role: 'ADMIN',
    },
  });

  // Clients
  const clientAliya = await prisma.user.create({
    data: {
      email: 'aliya@mail.ru',
      password: 'clientpassword',
      name: 'Алия Сабитова',
      phone: '+7 (701) 555-11-22',
      role: 'CLIENT',
    },
  });

  const clientDaniyar = await prisma.user.create({
    data: {
      email: 'daniyar@gmail.com',
      password: 'clientpassword',
      name: 'Данияр Оспанов',
      phone: '+7 (702) 444-33-22',
      role: 'CLIENT',
    },
  });

  const clientMadina = await prisma.user.create({
    data: {
      email: 'madina@gmail.com',
      password: 'clientpassword',
      name: 'Мадина Исенова',
      phone: '+7 (705) 999-88-77',
      role: 'CLIENT',
    },
  });

  console.log('Seeded admin and client users.');

  // Masters
  // Master 1: Plumber (VIP)
  const userAskar = await prisma.user.create({
    data: {
      email: 'askar@masterhub.kz',
      password: 'masterpassword',
      name: 'Аскар Ибраев',
      phone: '+7 (777) 111-22-33',
      role: 'MASTER',
    },
  });

  const profileAskar = await prisma.masterProfile.create({
    data: {
      userId: userAskar.id,
      description: 'Профессиональный сантехник со стажем более 12 лет. Устранение любых засоров, монтаж отопления, водоснабжения и теплых полов. Имею все необходимые инструменты. Работаю быстро, чисто и с гарантией.',
      age: 40,
      experienceYears: 12,
      basePrice: 5000,
      rating: 4.9,
      ordersCount: 142,
      reviewsCount: 3,
      districts: JSON.stringify(['Есиль', 'Нура', 'Сарыарка']),
      certificates: JSON.stringify(['Сертификат монтажника Rehau', 'Диплом слесаря-сантехника V разряда']),
      isVip: true,
      searchPriority: 5,
      categories: {
        connect: [{ id: plumbers.id }],
      },
    },
  });

  // Master 2: Electrician
  const userDias = await prisma.user.create({
    data: {
      email: 'dias@masterhub.kz',
      password: 'masterpassword',
      name: 'Диас Султанов',
      phone: '+7 (777) 222-33-44',
      role: 'MASTER',
    },
  });

  const profileDias = await prisma.masterProfile.create({
    data: {
      userId: userDias.id,
      description: 'Электрик высшего разряда. Полная и частичная замена проводки в квартирах и офисах. Установка и ремонт розеток, выключателей, люстр, сборка электрощитов любой сложности. Соблюдение ПУЭ.',
      age: 34,
      experienceYears: 8,
      basePrice: 4000,
      rating: 4.8,
      ordersCount: 96,
      reviewsCount: 2,
      districts: JSON.stringify(['Алматы', 'Сарыарка', 'Байконур']),
      certificates: JSON.stringify(['IV группа допуска по электробезопасности']),
      isVip: false,
      categories: {
        connect: [{ id: electricians.id }],
      },
    },
  });

  // Master 3: Appliance Repair (VIP)
  const userSergey = await prisma.user.create({
    data: {
      email: 'sergey@masterhub.kz',
      password: 'masterpassword',
      name: 'Сергей Петров',
      phone: '+7 (777) 333-44-55',
      role: 'MASTER',
    },
  });

  const profileSergey = await prisma.masterProfile.create({
    data: {
      userId: userSergey.id,
      description: 'Ремонт стиральных и посудомоечных машин, холодильников, электроплит и духовок. Оригинальные запчасти в наличии, выезд во все районы Астаны. Диагностика бесплатная при выполнении ремонта.',
      age: 45,
      experienceYears: 15,
      basePrice: 6000,
      rating: 4.95,
      ordersCount: 310,
      reviewsCount: 2,
      districts: JSON.stringify(['Есиль', 'Нура', 'Алматы', 'Сарыарка', 'Байконур']),
      certificates: JSON.stringify(['Авторизованный мастер Bosch, Samsung, LG']),
      isVip: true,
      searchPriority: 10,
      categories: {
        connect: [{ id: appliances.id }],
      },
    },
  });

  // Master 4: Locks & Doors
  const userBauyrzhan = await prisma.user.create({
    data: {
      email: 'bauyrzhan@masterhub.kz',
      password: 'masterpassword',
      name: 'Бауыржан Нурланов',
      phone: '+7 (777) 444-55-66',
      role: 'MASTER',
    },
  });

  const profileBauyrzhan = await prisma.masterProfile.create({
    data: {
      userId: userBauyrzhan.id,
      description: 'Экстренное аварийное вскрытие замков без повреждения двери. Замена и ремонт замков, личинок, ручек, установка задвижек. В наличии большой ассортимент замков от мировых брендов (Mottura, Cisa, Border).',
      age: 29,
      experienceYears: 6,
      basePrice: 5000,
      rating: 4.7,
      ordersCount: 82,
      reviewsCount: 2,
      districts: JSON.stringify(['Алматы', 'Сарыарка', 'Есиль']),
      certificates: JSON.stringify(['Сертификат соответствия слесарных работ по замкам']),
      isVip: false,
      categories: {
        connect: [{ id: locks.id }],
      },
    },
  });

  // Master 5: Air Conditioners
  const userKanat = await prisma.user.create({
    data: {
      email: 'kanat@masterhub.kz',
      password: 'masterpassword',
      name: 'Канат Сериков',
      phone: '+7 (777) 555-66-77',
      role: 'MASTER',
    },
  });

  const profileKanat = await prisma.masterProfile.create({
    data: {
      userId: userKanat.id,
      description: 'Профессиональный монтаж, демонтаж, чистка и заправка кондиционеров фреоном. Устранение неприятных запахов, течи, ремонт электроники. Быстрый выезд в день обращения.',
      age: 31,
      experienceYears: 5,
      basePrice: 7000,
      rating: 4.65,
      ordersCount: 54,
      reviewsCount: 1,
      districts: JSON.stringify(['Есиль', 'Нура', 'Алматы']),
      certificates: JSON.stringify(['Сертификат специалиста климатического оборудования Daikin']),
      isVip: false,
      categories: {
        connect: [{ id: ac.id }],
      },
    },
  });

  // Master 6: Electrician (VIP)
  const userVladimir = await prisma.user.create({
    data: {
      email: 'vladimir@masterhub.kz',
      password: 'masterpassword',
      name: 'Владимир Козлов',
      phone: '+7 (777) 777-88-99',
      role: 'MASTER',
    },
  });

  const profileVladimir = await prisma.masterProfile.create({
    data: {
      userId: userVladimir.id,
      description: 'Инженер-электрик с высшим профильным образованием и 20-летним стажем. Разработка схем электроснабжения, монтаж сложных систем освещения и автоматизации, поиск скрытых обрывов проводки.',
      age: 52,
      experienceYears: 20,
      basePrice: 8000,
      rating: 5.0,
      ordersCount: 240,
      reviewsCount: 2,
      districts: JSON.stringify(['Есиль', 'Нура', 'Алматы', 'Сарыарка', 'Байконур']),
      certificates: JSON.stringify(['Диплом инженера-электрика АЭУ', 'V группа допуска по электробезопасности (до и выше 1000В)']),
      isVip: true,
      searchPriority: 7,
      categories: {
        connect: [{ id: electricians.id }],
      },
    },
  });

  console.log('Seeded masters.');

  // 4. Seed Portfolios
  await prisma.masterPortfolio.createMany({
    data: [
      {
        masterProfileId: profileAskar.id,
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
        description: 'Разводка труб водоснабжения REHAU в новостройке ЖК Green Line',
      },
      {
        masterProfileId: profileAskar.id,
        imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
        description: 'Установка инсталляции и скрытого смесителя в санузле',
      },
      {
        masterProfileId: profileDias.id,
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
        description: 'Сборка трехфазного электрического щита для коттеджа в BI Village',
      },
      {
        masterProfileId: profileSergey.id,
        imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=600&q=80',
        description: 'Замена компрессора на холодильнике Samsung Side-by-Side',
      },
      {
        masterProfileId: profileBauyrzhan.id,
        imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
        description: 'Врезка нового итальянского замка Mottura в бронированную дверь',
      },
      {
        masterProfileId: profileVladimir.id,
        imageUrl: 'https://images.unsplash.com/photo-1558224494-ef3b3b4af3f5?auto=format&fit=crop&w=600&q=80',
        description: 'Электромонтаж под ключ в трехкомнатной квартире ЖК Sensata',
      },
    ],
  });

  console.log('Seeded portfolio items.');

  // 5. Seed Orders & Reviews
  // Order 1 (Completed & Reviewed)
  const order1 = await prisma.order.create({
    data: {
      clientId: clientAliya.id,
      masterId: profileAskar.id,
      status: 'COMPLETED',
      scheduledAt: new Date('2026-05-15T10:00:00Z'),
      address: 'ул. Достык 12, кв 45',
      description: 'Замена сифона на кухне и ремонт душевой кабины (подтекала вода)',
      totalPrice: 12000,
    },
  });

  await prisma.review.create({
    data: {
      orderId: order1.id,
      clientId: clientAliya.id,
      masterId: profileAskar.id,
      text: 'Отличный мастер! Приехал вовремя, быстро определил проблему, сам съездил в магазин за недостающей деталью. Рекомендую Аскара!',
      rating: 5,
    },
  });

  // Order 2 (Completed & Reviewed)
  const order2 = await prisma.order.create({
    data: {
      clientId: clientDaniyar.id,
      masterId: profileAskar.id,
      status: 'COMPLETED',
      scheduledAt: new Date('2026-05-20T14:00:00Z'),
      address: 'пр. Кабанбай Батыра 40, кв 122',
      description: 'Установка смесителя в ванной',
      totalPrice: 6000,
    },
  });

  await prisma.review.create({
    data: {
      orderId: order2.id,
      clientId: clientDaniyar.id,
      masterId: profileAskar.id,
      text: 'Все сделано аккуратно. Работает без нареканий уже месяц.',
      rating: 5,
    },
  });

  // Order 3 (Completed & Reviewed with lower rating)
  const order3 = await prisma.order.create({
    data: {
      clientId: clientMadina.id,
      masterId: profileAskar.id,
      status: 'COMPLETED',
      scheduledAt: new Date('2026-05-25T09:00:00Z'),
      address: 'ул. Кенесары 8, кв 90',
      description: 'Устранение засора трубы',
      totalPrice: 7000,
    },
  });

  await prisma.review.create({
    data: {
      orderId: order3.id,
      clientId: clientMadina.id,
      masterId: profileAskar.id,
      text: 'Засор устранил, но опоздал на 40 минут. В целом работу сделал нормально.',
      rating: 4,
    },
  });

  // Reviews for Electrician Dias
  const orderDias1 = await prisma.order.create({
    data: {
      clientId: clientDaniyar.id,
      masterId: profileDias.id,
      status: 'COMPLETED',
      scheduledAt: new Date('2026-05-18T11:00:00Z'),
      address: 'ул. Сарайшык 34, кв 2',
      description: 'Установка 10 новых розеток в гостиной',
      totalPrice: 15000,
    },
  });

  await prisma.review.create({
    data: {
      orderId: orderDias1.id,
      clientId: clientDaniyar.id,
      masterId: profileDias.id,
      text: 'Диас — профессионал своего дела. Подсказал, как лучше распределить нагрузку, розетки стоят идеально ровно.',
      rating: 5,
    },
  });

  const orderDias2 = await prisma.order.create({
    data: {
      clientId: clientMadina.id,
      masterId: profileDias.id,
      status: 'COMPLETED',
      scheduledAt: new Date('2026-05-22T16:00:00Z'),
      address: 'ЖК Времена Года',
      description: 'Навеска и подключение хрустальной люстры',
      totalPrice: 10000,
    },
  });

  await prisma.review.create({
    data: {
      orderId: orderDias2.id,
      clientId: clientMadina.id,
      masterId: profileDias.id,
      text: 'Люстра очень тяжелая, повесил надежно. Единственный минус — оставил немного мусора после сверления.',
      rating: 4,
    },
  });

  // Review for Sergey (Appliances)
  const orderSergey1 = await prisma.order.create({
    data: {
      clientId: clientAliya.id,
      masterId: profileSergey.id,
      status: 'COMPLETED',
      scheduledAt: new Date('2026-05-12T15:00:00Z'),
      address: 'пр. Туран 18, кв 34',
      description: 'Ремонт стиральной машины LG (замена ТЭНа)',
      totalPrice: 18000,
    },
  });

  await prisma.review.create({
    data: {
      orderId: orderSergey1.id,
      clientId: clientAliya.id,
      masterId: profileSergey.id,
      text: 'Стиралка перестала греть воду. Сергей приехал со своей запчастью и починил за 40 минут. Дал гарантийный талон на год. Супер!',
      rating: 5,
    },
  });

  const orderSergey2 = await prisma.order.create({
    data: {
      clientId: clientMadina.id,
      masterId: profileSergey.id,
      status: 'COMPLETED',
      scheduledAt: new Date('2026-05-29T10:00:00Z'),
      address: 'ул. Ташенова 4',
      description: 'Ремонт холодильника (шумел вентилятор)',
      totalPrice: 14000,
    },
  });

  await prisma.review.create({
    data: {
      orderId: orderSergey2.id,
      clientId: clientMadina.id,
      masterId: profileSergey.id,
      text: 'Быстрый ремонт, вежливый мастер. Все объяснил.',
      rating: 5,
    },
  });

  // Review for Bauyrzhan (Locks)
  const orderLocks1 = await prisma.order.create({
    data: {
      clientId: clientDaniyar.id,
      masterId: profileBauyrzhan.id,
      status: 'COMPLETED',
      scheduledAt: new Date('2026-05-10T23:00:00Z'),
      address: 'пр. Республики 19, кв 11',
      description: 'Вскрытие заклинившей входной двери ночью',
      totalPrice: 15000,
    },
  });

  await prisma.review.create({
    data: {
      orderId: orderLocks1.id,
      clientId: clientDaniyar.id,
      masterId: profileBauyrzhan.id,
      text: 'Захлопнулась дверь в 11 вечера. Бауыржан приехал через 20 минут после звонка. Открыл дверь буквально за 10 минут без единой царапины! Спасибо огромное!',
      rating: 5,
    },
  });

  const orderLocks2 = await prisma.order.create({
    data: {
      clientId: clientAliya.id,
      masterId: profileBauyrzhan.id,
      status: 'COMPLETED',
      scheduledAt: new Date('2026-05-14T12:00:00Z'),
      address: 'ул. Сарыарка 11',
      description: 'Замена замка в металлической двери',
      totalPrice: 12000,
    },
  });

  await prisma.review.create({
    data: {
      orderId: orderLocks2.id,
      clientId: clientAliya.id,
      masterId: profileBauyrzhan.id,
      text: 'Замок поменял, но сначала привез неподходящий по размеру, пришлось ждать пока съездит за другим.',
      rating: 4,
    },
  });

  // Review for Kanat (AC)
  const orderAc1 = await prisma.order.create({
    data: {
      clientId: clientAliya.id,
      masterId: profileKanat.id,
      status: 'COMPLETED',
      scheduledAt: new Date('2026-05-30T10:00:00Z'),
      address: 'ЖК Esil Riverside',
      description: 'Комплексная чистка кондиционера и дозаправка фреоном',
      totalPrice: 12000,
    },
  });

  await prisma.review.create({
    data: {
      orderId: orderAc1.id,
      clientId: clientAliya.id,
      masterId: profileKanat.id,
      text: 'Почистил кондиционер, запаха больше нет. Оценка 5 с минусом за небольшое опоздание.',
      rating: 5,
    },
  });

  // Reviews for Vladimir
  const orderVlad1 = await prisma.order.create({
    data: {
      clientId: clientDaniyar.id,
      masterId: profileVladimir.id,
      status: 'COMPLETED',
      scheduledAt: new Date('2026-05-05T09:00:00Z'),
      address: 'Косшы, ул. Лесная 22',
      description: 'Электромонтаж в коттедже 150 кв.м.',
      totalPrice: 280000,
    },
  });

  await prisma.review.create({
    data: {
      orderId: orderVlad1.id,
      clientId: clientDaniyar.id,
      masterId: profileVladimir.id,
      text: 'Владимир делал электрику под ключ в нашем загородном доме. Сделал профессиональный проект, все распределил по группам. Работа выполнена на высочайшем инженерном уровне!',
      rating: 5,
    },
  });

  const orderVlad2 = await prisma.order.create({
    data: {
      clientId: clientAliya.id,
      masterId: profileVladimir.id,
      status: 'COMPLETED',
      scheduledAt: new Date('2026-05-08T14:00:00Z'),
      address: 'ул. Кунаева 14',
      description: 'Поиск короткого замыкания на линии розеток спальни',
      totalPrice: 15000,
    },
  });

  await prisma.review.create({
    data: {
      orderId: orderVlad2.id,
      clientId: clientAliya.id,
      masterId: profileVladimir.id,
      text: 'В розетке что-то закоротило, выбивало автомат. Другой электрик не смог найти причину, а Владимир пришел со специальным прибором и локализовал обрыв за 20 минут. Настоящий мастер!',
      rating: 5,
    },
  });

  // Active / Pending orders for simulation
  // 1. Pending order for Askar (Plumber)
  await prisma.order.create({
    data: {
      clientId: clientAliya.id,
      masterId: profileAskar.id,
      status: 'PENDING',
      scheduledAt: new Date('2026-06-12T10:00:00Z'),
      address: 'ул. Достык 12, кв 45',
      description: 'Замена гибкой подводки к унитазу и установка гигиенического душа',
      totalPrice: 8000,
    },
  });

  // 2. Accepted order for Dias (Electrician)
  await prisma.order.create({
    data: {
      clientId: clientDaniyar.id,
      masterId: profileDias.id,
      status: 'ACCEPTED',
      scheduledAt: new Date('2026-06-11T15:00:00Z'),
      address: 'пр. Кабанбай Батыра 40',
      description: 'Установка светодиодной ленты с блоком питания под кухонные шкафы',
      totalPrice: 12000,
    },
  });

  console.log('Seeded orders and reviews.');

  // 6. Seed Promotions
  await prisma.promotion.createMany({
    data: [
      {
        title: 'Скидка 20% на вызов электрика',
        description: 'Закажите услуги электрика до конца недели и получите скидку 20% на монтажные работы.',
        discountText: '-20%',
        categoryId: electricians.id,
        isActive: true,
      },
      {
        title: 'Бесплатный выезд при первом заказе',
        description: 'Вызов мастера абсолютно бесплатен для новых клиентов при согласии на проведение ремонтных работ.',
        discountText: '0 ₸ выезд',
        isActive: true,
      },
      {
        title: 'Сезонная скидка на кондиционеры',
        description: 'Подготовьте климатическую технику к лету! Чистка кондиционеров со скидкой 15% в июне.',
        discountText: '-15%',
        categoryId: ac.id,
        isActive: true,
      },
    ],
  });

  console.log('Seeded promotions.');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
