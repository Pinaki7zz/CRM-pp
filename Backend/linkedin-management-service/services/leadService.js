const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const linkedInService = require('./linkedinService');

exports.validateLinkedInAccess = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { linkedinAccessToken: true }
  });
  return !!user?.linkedinAccessToken;
};

exports.fetchAndStoreLeads = async (userId, query, limit) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { linkedinAccessToken: true },
    });

    if (!user?.linkedinAccessToken) {
      throw new Error('LinkedIn access token not found. Complete LinkedIn login first.');
    }

    // Search LinkedIn for profiles
    const linkedinProfiles = await linkedInService.searchPeople(user.linkedinAccessToken, query, limit);

    const leads = [];
    
    for (const profile of linkedinProfiles) {
      const leadData = {
        name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
        title: profile.title?.localizedEnUS || null,
        company: profile.companyName?.localizedEnUS || null,
        linkedinUrl: profile.publicProfileUrl || null,
        email: profile.emailAddress || null,
        phone: null,
        userId,
      };

      // Check for existing lead to avoid duplicates
      const existingLead = await prisma.lead.findFirst({
        where: { 
          linkedinUrl: leadData.linkedinUrl, 
          userId 
        },
      });

      if (!existingLead) {
        const lead = await prisma.lead.create({ 
          data: leadData 
        });
        leads.push(lead);
        console.log(`✅ New lead created: ${lead.name}`);
      } else {
        console.log(`⏭️  Lead already exists: ${leadData.name}`);
      }
    }

    return leads;
  } catch (error) {
    console.error('Lead service error:', error);
    throw error;
  }
};

exports.getUserLeads = async (userId) => {
  return await prisma.lead.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });
};