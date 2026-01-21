/**
 * Hardkodet mapping av universitet-navn til bilder
 * Dette brukes som fallback når universitetet ikke har et bilde i databasen
 */

export const universityImageMap: Record<string, string> = {
  // Italia
  'Università degli Studi di Bologna': 'https://images.unsplash.com/photo-1635469019177-7264fc1e013c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'Università di Bologna': 'https://images.unsplash.com/photo-1635469019177-7264fc1e013c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'University of Bologna': 'https://images.unsplash.com/photo-1635469019177-7264fc1e013c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'The University of Bologna': 'https://images.unsplash.com/photo-1635469019177-7264fc1e013c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  
  'Politecnico di Milano': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200',
  'Politecnico de Milano': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200',
  'Politecnico di Torino': 'https://images.unsplash.com/photo-1548356258-dec6c4c6548d?w=1200',
  'Politec de Torino': 'https://images.unsplash.com/photo-1548356258-dec6c4c6548d?w=1200',
  
  'Università degli Studi di Padova': 'https://images.unsplash.com/photo-1589665039574-fa69bc87d71d?w=1200',
  'Universita Degli Studi de Padova': 'https://images.unsplash.com/photo-1589665039574-fa69bc87d71d?w=1200',
  'Università degli Studi di Firenze': 'https://images.unsplash.com/photo-1541990538-1e3e36515c39?w=1200',
  'Universita degli studi Firenze': 'https://images.unsplash.com/photo-1541990538-1e3e36515c39?w=1200',
  'Università degli Studi di Genova': 'https://images.unsplash.com/photo-1548683206-97d652e05e7c?w=1200',
  'Università degli studi di Genova (UniGe)': 'https://images.unsplash.com/photo-1548683206-97d652e05e7c?w=1200',
  'Università di Pisa': 'https://images.unsplash.com/photo-1580719567710-e3b83c44bb7e?w=1200',
  'Universita de Pisa': 'https://images.unsplash.com/photo-1580719567710-e3b83c44bb7e?w=1200',
  'Università di Siena': 'https://images.unsplash.com/photo-1567299327725-56e8000cf71e?w=1200',
  'Universita Di Siena': 'https://images.unsplash.com/photo-1567299327725-56e8000cf71e?w=1200',
  'Sapienza Università di Roma': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200',
  'University of Rome Tor Vergata': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200',
  'Tor Vergata - University of Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200',
  'University of Bergamo': 'https://images.unsplash.com/photo-1548683206-97d652e05e7c?w=1200',
  'University of Venice': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200',
  'Libera Università di Bolzano': 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200',
  'Libero Universita di Bolzano': 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200',
  
  // Australia
  'The University of Queensland': 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1920&q=90&auto=format',
  'University of New South Wales': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200',
  'University of Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200',
  'University of Melbourne': 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1200',
  'Australian National University': 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1200',
  'Griffith University': 'https://images.unsplash.com/photo-1598948485421-33a1655d3c18?w=1200',
  'Queensland University of Technology': 'https://images.unsplash.com/photo-1598948485421-33a1655d3c18?w=1200',
  'RMIT University': 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1200',
  'University of Newcastle': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200',
  'University of the Sunshine Coast': 'https://images.unsplash.com/photo-1598948485421-33a1655d3c18?w=1200',
  'University of the Sunshine Coast (Queensland)': 'https://images.unsplash.com/photo-1598948485421-33a1655d3c18?w=1200',
  
  // USA
  'University of California, Berkeley': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=90&auto=format',
  'UC Berkeley': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=90&auto=format',
  'Berkeley': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=90&auto=format',
  'Stanford University': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200',
  'Harvard University': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200',
  'Yale University': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200',
  'University of Michigan': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200',
  'University of Wisconsin - Madison': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200',
  'University of California, Santa Barbara': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200',
  'University of Colorado Boulder': 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=1200',
  'University of Hawaii at Manoa': 'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=1200',
  
  // Danmark
  'Copenhagen Business School': 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200',
  
  // Nederland
  'Delft University of Technology': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1920&q=90&auto=format',
  'Technische Universiteit Delft': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1920&q=90&auto=format',
  
  // Tyskland
  'Technische Universität München': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1920&q=90&auto=format',
  
  // Spania
  'Universitat Politècnica de València': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d2?w=1200',
  
  // Singapore
  'National University of Singapore': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200',
  
  // Japan
  'University of Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200',
  'Tokyo Institute of Technology': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200',
  'Kyoto University': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200',
  
  // Portugal
  'Instituto Superior Técnico': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=90&auto=format',
};

/**
 * Henter bilde-URL for et universitet
 * @param universityName - Navnet på universitetet
 * @param databaseImageUrl - Bildet fra databasen (kan være null)
 * @returns Bildet fra databasen hvis det finnes, ellers fra hardkodet mapping, eller null
 */
export function getUniversityImage(
  universityName: string | null | undefined,
  databaseImageUrl: string | null | undefined
): string | null {
  // Bruk database-bildet hvis det finnes
  if (databaseImageUrl) {
    return databaseImageUrl;
  }
  
  // Hvis ikke, prøv hardkodet mapping
  if (universityName) {
    // Prøv eksakt match først
    if (universityImageMap[universityName]) {
      return universityImageMap[universityName];
    }
    
    // Prøv case-insensitive match
    const normalizedName = universityName.trim();
    const match = Object.keys(universityImageMap).find(
      (key) => key.toLowerCase() === normalizedName.toLowerCase()
    );
    
    if (match) {
      return universityImageMap[match];
    }
    
    // Prøv partial match (hvis universitetet navnet inneholder et kjent navn)
    for (const [key, value] of Object.entries(universityImageMap)) {
      if (
        normalizedName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(normalizedName.toLowerCase())
      ) {
        return value;
      }
    }
  }
  
  // Ingen match funnet
  return null;
}

