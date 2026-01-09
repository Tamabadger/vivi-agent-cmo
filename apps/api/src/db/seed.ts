import { db } from './index';
import { orgs, users } from './schema';
import { PlanTier } from '@vivi/common';

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Create a sample organization
    const [org] = await db.insert(orgs).values({
      name: 'Sample Organization',
      planTier: PlanTier.LITE,
      timezone: 'UTC',
      onboardingComplete: false
    }).returning();

    console.log(`✅ Created organization: ${org.name} (${org.id})`);

    // Create a sample user
    const [user] = await db.insert(users).values({
      orgId: org.id,
      email: 'admin@sample.org',
      role: 'admin',
      auth0Id: 'auth0|sample-user-id'
    }).returning();

    console.log(`✅ Created user: ${user.email} (${user.id})`);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export { seed };
