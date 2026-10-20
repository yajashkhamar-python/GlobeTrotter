export const GENERIC_IMG = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80';

export const COUNTRY_IMAGES = {
  France: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  Japan: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  Thailand: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80',
  Italy: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
  India: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
  Singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
  'United Kingdom': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  'United Arab Emirates': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  Australia: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  Spain: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
  Indonesia: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  Greece: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
  Turkey: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
  Morocco: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80',
  Egypt: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80',
  'South Africa': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80',
  Brazil: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80',
  'United States': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  Mexico: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80',
  Netherlands: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80',
  Nepal: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&q=80',
  'Sri Lanka': 'https://images.unsplash.com/photo-1573946435680-ae0b48bc07be?w=800&q=80',
  Malaysia: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80',
  Canada: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=800&q=80',
};

export const ACT_TYPE_IMAGES = {
  Museum:      'https://images.unsplash.com/photo-1562832135-14a35d25edef?w=600&q=80',
  Sightseeing: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
  Food:        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
  Culture:     'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600&q=80',
  History:     'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80',
  Nature:      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
  Shopping:    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
  Adventure:   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
  Experience:  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
  Architecture:'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=80',
  Entertainment:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
};

export function getCountryImg(name) { return COUNTRY_IMAGES[name] || GENERIC_IMG; }
export function getCityImg(city) {
  if (city?.image) return city.image;
  return COUNTRY_IMAGES[city?.country] || GENERIC_IMG;
}
export function getActImg(act) {
  if (act?.image) return act.image;
  return ACT_TYPE_IMAGES[act?.type] || GENERIC_IMG;
}
