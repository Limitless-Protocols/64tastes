export type District = { id: string; 
                         nameEn: string; 
                         nameBn: string; 
                         division: string 
                       };
export type Dish = { id: number; 
                     slug: string; 
                     districtId: string; 
                     nameEn: string; 
                     nameBn: string; 
                     category: string 
                   };