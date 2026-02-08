const axios = require('axios');

exports.searchPeople = async (accessToken, keywords, limit = 10) => {
  try {
    // Note: Real LinkedIn people search requires Sales Navigator or Marketing API approval
    // This is mock data for testing
    console.log(`🔍 Searching LinkedIn for: "${keywords}" with token: ${accessToken.substring(0, 20)}... (limit: ${limit})`);
    
    const mockProfiles = Array.from({ length: limit }, (_, i) => ({
      id: `mock-profile-${Date.now()}-${i + 1}`,
      localizedFirstName: `John ${i + 1}`,
      localizedLastName: `Doe ${i + 1}`,
      title: { localizedEnUS: `Software Engineer ${i + 1}` },
      companyName: { localizedEnUS: `Tech Corp ${i + 1}` },
      publicProfileUrl: `https://www.linkedin.com/in/johndoe${i + 1}`,
      emailAddress: `john${i + 1}@techcorp${i + 1}.com`,
      location: { localizedEnUS: `San Francisco, CA` },
      industry: `Software Development`
    }));

    return mockProfiles;
  } catch (error) {
    console.error('LinkedIn search error:', error);
    throw new Error(`Search failed: ${error.message}`);
  }
};