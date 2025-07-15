import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a sample user
  const user = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      name: 'John Doe',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    },
  })

  // Create sample categories
  const techCategory = await prisma.category.upsert({
    where: { slug: 'technology' },
    update: {},
    create: {
      name: 'Technology',
      slug: 'technology',
    },
  })

  const networkingCategory = await prisma.category.upsert({
    where: { slug: 'networking' },
    update: {},
    create: {
      name: 'Networking',
      slug: 'networking',
    },
  })

  // Create a sample event
  const event = await prisma.event.upsert({
    where: { slug: 'tech-meetup-2025' },
    update: {},
    create: {
      slug: 'tech-meetup-2025',
      title: 'Tech Meetup 2025',
      subtitle: 'Connect with fellow developers',
      description: 'Join us for an evening of networking, learning, and fun!',
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      startDate: new Date('2025-08-15T18:00:00Z'),
      endDate: new Date('2025-08-15T21:00:00Z'),
      timezone: 'America/New_York',
      locationType: 'PHYSICAL',
      venueName: 'Tech Hub',
      venueAddress: '123 Innovation St, San Francisco, CA 94105',
      capacity: 100,
      isPublished: true,
      status: 'PUBLISHED',
      hostId: user.id,
      categories: {
        create: [{ categoryId: techCategory.id }, { categoryId: networkingCategory.id }],
      },
      ticketTiers: {
        create: [
          {
            name: 'General Admission',
            priceCents: 0, // Free
            quantityTotal: 80,
          },
          {
            name: 'VIP',
            priceCents: 2500, // $25.00
            quantityTotal: 20,
          },
        ],
      },
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Created user: ${user.email}`)
  console.log(`🎯 Created event: ${event.title}`)
  console.log(`📚 Created categories: Technology, Networking`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
