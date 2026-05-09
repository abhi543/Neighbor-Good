import { db } from './db';
import { PrismaClient } from '@prisma/client';

const DEMO_USER_ID = 'demo_alex_cuid001';
const BASE_LAT = 40.7128;
const BASE_LNG = -74.006;

function offset(lat: number, lng: number, dlat: number, dlng: number) {
  return { lat: lat + dlat, lng: lng + dlng };
}

async function seed() {
  console.log('🌱 Seeding demo data...');

  // Clean existing data
  await db.message.deleteMany();
  await db.exchange.deleteMany();
  await db.flag.deleteMany();
  await db.post.deleteMany();
  await db.user.deleteMany();

  // Create demo user (current user)
  const alex = await db.user.create({
    data: {
      id: DEMO_USER_ID,
      name: 'Alex Rivera',
      avatar: null,
      unitNumber: '4B',
      lat: BASE_LAT,
      lng: BASE_LNG,
      bio: 'I have a drill, measuring tape, and basic tools. I love cooking and can help with tech setup.',
      warmthScore: 8,
      gaveCount: 3,
      receivedCount: 2,
    },
  });

  // Create neighbor users
  const maria = await db.user.create({
    data: {
      id: 'neighbor_maria_002',
      name: 'Maria Chen',
      unitNumber: '2A',
      lat: offset(BASE_LAT, BASE_LNG, 0.001, 0.0005).lat,
      lng: offset(BASE_LAT, BASE_LNG, 0.001, 0.0005).lng,
      bio: 'I bake sourdough bread and have a stand mixer. Happy to share recipes!',
      warmthScore: 15,
      gaveCount: 7,
      receivedCount: 3,
    },
  });

  const jordan = await db.user.create({
    data: {
      id: 'neighbor_jordan_003',
      name: 'Jordan Patel',
      unitNumber: '6C',
      lat: offset(BASE_LAT, BASE_LNG, -0.001, 0.001).lat,
      lng: offset(BASE_LAT, BASE_LNG, -0.001, 0.001).lng,
      bio: 'Dog walker & plant enthusiast. I have basic woodworking tools.',
      warmthScore: 12,
      gaveCount: 5,
      receivedCount: 4,
    },
  });

  const sam = await db.user.create({
    data: {
      id: 'neighbor_sam_004',
      name: 'Sam Thompson',
      unitNumber: '1D',
      lat: offset(BASE_LAT, BASE_LNG, 0.0005, -0.001).lat,
      lng: offset(BASE_LAT, BASE_LNG, 0.0005, -0.001).lng,
      bio: 'Electrician by trade. Can help with anything electrical.',
      warmthScore: 20,
      gaveCount: 12,
      receivedCount: 2,
    },
  });

  const priya = await db.user.create({
    data: {
      id: 'neighbor_priya_005',
      name: 'Priya Sharma',
      unitNumber: '3A',
      lat: offset(BASE_LAT, BASE_LNG, -0.0008, -0.0005).lat,
      lng: offset(BASE_LAT, BASE_LNG, -0.0008, -0.0005).lng,
      bio: 'Gardener and yoga teacher. I compost and grow herbs on my balcony.',
      warmthScore: 10,
      gaveCount: 4,
      receivedCount: 5,
    },
  });

  const kevin = await db.user.create({
    data: {
      id: 'neighbor_kevin_006',
      name: 'Kevin O\'Brien',
      unitNumber: '5B',
      lat: offset(BASE_LAT, BASE_LNG, 0.0012, 0.0008).lat,
      lng: offset(BASE_LAT, BASE_LNG, 0.0012, 0.0008).lng,
      bio: 'Former chef. I have an air fryer, pressure cooker, and lots of spices.',
      warmthScore: 6,
      gaveCount: 2,
      receivedCount: 1,
    },
  });

  const now = new Date();

  // Create posts
  const posts = await Promise.all([
    // Alex's posts
    db.post.create({
      data: {
        type: 'OFFER',
        title: 'Power Drill Available This Weekend',
        description: 'Got a DeWalt 20V drill with full bit set. Perfect for hanging shelves or small repairs. Available Sat & Sun.',
        category: 'TOOLS',
        lat: alex.lat,
        lng: alex.lng,
        expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        status: 'ACTIVE',
        authorId: alex.id,
      },
    }),
    db.post.create({
      data: {
        type: 'ASK',
        title: 'Need a Ladder for One Hour',
        description: 'Need to change a lightbulb in my high ceiling. Just need a step ladder, nothing fancy. Happy to return it clean!',
        category: 'TOOLS',
        lat: alex.lat,
        lng: alex.lng,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        authorId: alex.id,
      },
    }),
    // Maria's posts
    db.post.create({
      data: {
        type: 'OFFER',
        title: 'Fresh Sourdough Bread — First Loaf Free!',
        description: 'I bake sourdough every Sunday. If you\'ve never tried homemade bread, come get your first loaf on me!',
        category: 'KITCHEN',
        lat: maria.lat,
        lng: maria.lng,
        expiresAt: new Date(now.getTime() + 72 * 60 * 60 * 1000),
        status: 'ACTIVE',
        authorId: maria.id,
      },
    }),
    db.post.create({
      data: {
        type: 'OFFER',
        title: 'Stand Mixer for Holiday Baking',
        description: 'KitchenAid stand mixer available for 2-day loans. Great for cookie season!',
        category: 'KITCHEN',
        lat: maria.lat,
        lng: maria.lng,
        expiresAt: new Date(now.getTime() + 12 * 60 * 60 * 1000),
        status: 'ACTIVE',
        authorId: maria.id,
      },
    }),
    // Jordan's posts
    db.post.create({
      data: {
        type: 'OFFER',
        title: 'Dog Walking — Mornings Free',
        description: 'I walk my dog every morning at 7am. Happy to take yours along too if you\'re in the building!',
        category: 'SERVICE',
        lat: jordan.lat,
        lng: jordan.lng,
        expiresAt: new Date(now.getTime() + 72 * 60 * 60 * 1000),
        status: 'ACTIVE',
        authorId: jordan.id,
      },
    }),
    db.post.create({
      data: {
        type: 'ASK',
        title: 'Anyone Have a Saw?',
        description: 'Need to cut a piece of plywood for a shelf project. A hand saw would work fine.',
        category: 'TOOLS',
        lat: jordan.lat,
        lng: jordan.lng,
        expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        status: 'ACTIVE',
        authorId: jordan.id,
      },
    }),
    // Sam's posts
    db.post.create({
      data: {
        type: 'OFFER',
        title: 'Free Electrical Safety Check',
        description: 'Licensed electrician here. I can check your outlets and breaker panel for free. Safety first, neighbors!',
        category: 'SERVICE',
        lat: sam.lat,
        lng: sam.lng,
        expiresAt: new Date(now.getTime() + 72 * 60 * 60 * 1000),
        status: 'ACTIVE',
        authorId: sam.id,
      },
    }),
    db.post.create({
      data: {
        type: 'OFFER',
        title: 'Voltage Tester + Multimeter',
        description: 'Professional-grade tools available for borrow. Know how to use them or I can teach you.',
        category: 'TOOLS',
        lat: sam.lat,
        lng: sam.lng,
        expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        status: 'ACTIVE',
        authorId: sam.id,
      },
    }),
    // Priya's posts
    db.post.create({
      data: {
        type: 'OFFER',
        title: 'Free Herb Cuttings (Basil, Mint, Rosemary)',
        description: 'My balcony garden is thriving! Come grab cuttings to start your own. I\'ll include a small pot.',
        category: 'OTHER',
        lat: priya.lat,
        lng: priya.lng,
        expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        status: 'ACTIVE',
        authorId: priya.id,
      },
    }),
    db.post.create({
      data: {
        type: 'ASK',
        title: 'Need Help Moving a Couch',
        description: 'Just bought a new couch. Need someone strong to help me carry it up to the 3rd floor. Will order pizza!',
        category: 'SERVICE',
        lat: priya.lat,
        lng: priya.lng,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        authorId: priya.id,
      },
    }),
    // Kevin's posts
    db.post.create({
      data: {
        type: 'OFFER',
        title: 'Air Fryer — Available This Week',
        description: 'My kitchen is being renovated, so my air fryer is up for grabs until the weekend. Makes amazing fries!',
        category: 'KITCHEN',
        lat: kevin.lat,
        lng: kevin.lng,
        expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        status: 'ACTIVE',
        authorId: kevin.id,
      },
    }),
    db.post.create({
      data: {
        type: 'ASK',
        title: 'Borrowing a Slow Cooker?',
        description: 'Want to try making pulled pork this weekend. Anyone have a slow cooker I can use?',
        category: 'KITCHEN',
        lat: kevin.lat,
        lng: kevin.lng,
        expiresAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        status: 'ACTIVE',
        authorId: kevin.id,
      },
    }),
  ]);

  // Create some exchanges with messages
  const drillPost = posts[0]; // Alex's drill offer
  const ladderPost = posts[1]; // Alex's ladder ask
  const breadPost = posts[2]; // Maria's bread offer

  const exchange1 = await db.exchange.create({
    data: {
      postId: drillPost.id,
      requesterId: jordan.id,
      ownerId: alex.id,
      status: 'ACCEPTED',
      rating: 1,
      badgeGiven: true,
    },
  });

  await db.message.createMany({
    data: [
      {
        exchangeId: exchange1.id,
        senderId: jordan.id,
        content: 'Hey! I could really use the drill this Saturday. I\'m building a small shelf.',
        isSystem: false,
      },
      {
        exchangeId: exchange1.id,
        senderId: alex.id,
        content: 'Sure thing! I can leave it at the front desk around 10am. Just return it by Sunday evening?',
        isSystem: false,
      },
      {
        exchangeId: exchange1.id,
        senderId: jordan.id,
        content: 'Perfect, that works great. Thanks so much!',
        isSystem: false,
      },
      {
        exchangeId: exchange1.id,
        senderId: alex.id,
        content: 'Meet in the lobby for your first exchange! 🤝',
        isSystem: true,
      },
    ],
  });

  const exchange2 = await db.exchange.create({
    data: {
      postId: breadPost.id,
      requesterId: alex.id,
      ownerId: maria.id,
      status: 'PENDING',
    },
  });

  await db.message.createMany({
    data: [
      {
        exchangeId: exchange2.id,
        senderId: alex.id,
        content: 'Your sourdough looks amazing! I\'d love to try a loaf. Do you need anything in return?',
        isSystem: false,
      },
    ],
  });

  const exchange3 = await db.exchange.create({
    data: {
      postId: ladderPost.id,
      requesterId: sam.id,
      ownerId: alex.id,
      status: 'COMPLETED',
      rating: 1,
      badgeGiven: false,
    },
  });

  await db.message.createMany({
    data: [
      {
        exchangeId: exchange3.id,
        senderId: sam.id,
        content: 'I\'ve got a 6-foot step ladder. When do you need it?',
        isSystem: false,
      },
      {
        exchangeId: exchange3.id,
        senderId: alex.id,
        content: 'This afternoon if possible? Just for an hour.',
        isSystem: false,
      },
      {
        exchangeId: exchange3.id,
        senderId: sam.id,
        content: 'Done — I\'ll leave it outside my door (1D). Just put it back when you\'re done.',
        isSystem: false,
      },
      {
        exchangeId: exchange3.id,
        senderId: alex.id,
        content: 'Returned! Thanks Sam, you\'re a lifesaver. ⭐',
        isSystem: false,
      },
    ],
  });

  // Update warmth scores based on completed exchanges
  await db.user.update({
    where: { id: sam.id },
    data: { warmthScore: { increment: 1 } },
  });

  console.log('✅ Demo data seeded successfully!');
  console.log(`   Users: 6`);
  console.log(`   Posts: ${posts.length}`);
  console.log(`   Exchanges: 3`);
  console.log(`   Messages: 8`);
  console.log(`   Demo user ID: ${DEMO_USER_ID}`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
