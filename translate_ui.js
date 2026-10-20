import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

// 1. Sidebar.jsx
replaceInFile('./src/components/layout/Sidebar.jsx', [
  [/>Dashboard</g, ">{t('navigation.dashboard')}<"],
  [/>My Trips</g, ">{t('navigation.trips')}<"],
  [/>Explore</g, ">{t('navigation.explore')}<"],
  [/>Calendar</g, ">{t('navigation.calendar')}<"],
  [/>Budget</g, ">{t('navigation.budget')}<"],
  [/>Saved</g, ">{t('navigation.saved')}<"],
  [/>Profile</g, ">{t('navigation.profile')}<"],
  [/>Settings</g, ">{t('navigation.settings')}<"],
  [/>Log Out</g, ">{t('navigation.logout')}<"]
]);

// 2. Dashboard.jsx
replaceInFile('./src/pages/Dashboard.jsx', [
  [/Good morning/g, "{t('dashboard.greeting')}"],
  [/Good afternoon/g, "{t('dashboard.greeting')}"],
  [/Good evening/g, "{t('dashboard.greeting')}"],
  [/>My Trips</g, ">{t('dashboard.myTrips')}<"],
  [/>Next Adventure</g, ">{t('dashboard.nextAdventure')}<"],
  [/>Recommended For You</g, ">{t('dashboard.recommended')}<"],
  [/>Upcoming Itinerary</g, ">{t('dashboard.upcomingItinerary')}<"],
  [/>Budget Overview</g, ">{t('dashboard.budgetOverview')}<"],
  [/>Quick Actions</g, ">{t('dashboard.quickActions')}<"],
  [/>Create Trip</g, ">{t('dashboard.createTrip')}<"],
  [/>Explore Destinations</g, ">{t('dashboard.explore')}<"],
  [/>View All</g, ">{t('dashboard.viewAll')}<"],
  [/>No upcoming trips</g, ">{t('dashboard.noUpcoming')}<"],
  [/>Plan one now</g, ">{t('dashboard.planOne')}<"]
]);

// 3. Profile.jsx
replaceInFile('./src/pages/Profile.jsx', [
  [/>Profile</g, ">{t('profile.title')}<"],
  [/>About You</g, ">{t('profile.aboutYou')}<"],
  [/>Travel Overview</g, ">{t('profile.travelOverview')}<"],
  [/>Trips</g, ">{t('profile.trips')}<"],
  [/>Destinations</g, ">{t('profile.destinations')}<"],
  [/>Activities</g, ">{t('profile.activities')}<"],
  [/>Saved</g, ">{t('profile.saved')}<"],
  [/>Edit Profile</g, ">{t('profile.editProfile')}<"],
  [/>Member Since</g, ">{t('profile.memberSince')}<"],
  [/>Travel Preferences</g, ">{t('profile.travelPreferences')}<"],
  [/>Account</g, ">{t('profile.account')}<"],
  [/>View saved places</g, ">{t('profile.viewSavedPlaces')}<"]
]);
