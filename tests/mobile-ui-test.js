// Mobile UI Testing Script
console.log('📱 Mobile UI Test Guide\n');

console.log('🔍 Testing Mobile Detection:');
console.log('Current viewport width:', window.innerWidth);
console.log('Is Mobile?', window.innerWidth < 768 || 'ontouchstart' in window);
console.log('Has touch?', 'ontouchstart' in window);
console.log('Max touch points:', navigator.maxTouchPoints);

console.log('\n📋 Manual Test Checklist:\n');

console.log('1. Mobile Layout Tests:');
console.log('   - Resize browser to < 768px width');
console.log('   - Open DevTools device emulation (iPhone/Android)');
console.log('   - Verify mobile cafe screen loads\n');

console.log('2. Bottom Navigation:');
console.log('   - Check 5 nav items visible at bottom');
console.log('   - Test active states on tap');
console.log('   - Verify navigation between sections\n');

console.log('3. Touch Interactions:');
console.log('   - Pet selection by tap (not drag)');
console.log('   - Smooth scrolling in sections');
console.log('   - Button press feedback\n');

console.log('4. Mobile-Specific Features:');
console.log('   - Pull-to-refresh gesture');
console.log('   - Bottom sheets for menus');
console.log('   - Toast notifications');
console.log('   - Haptic feedback (on supported devices)\n');

console.log('5. Responsive Behavior:');
console.log('   - Rotate device (if testing on real device)');
console.log('   - Check safe area handling');
console.log('   - Verify text remains readable\n');

console.log('💡 Quick Commands:');
console.log('PetCafe.debugAddTestPets() - Add test pets');
console.log('PetCafe.getEventSystem().emit("ui:show_screen", {screenId: "cafe-overview"}) - Navigate to cafe');

// Automated checks
if (window.PetCafe) {
  const screenManager = window.PetCafe.uiManager?.screenManager;
  const currentScreen = screenManager?.currentScreen;
  
  console.log('\n✅ Current Screen:', currentScreen?.id || 'None');
  console.log('✅ Screen Type:', currentScreen?.constructor.name || 'Unknown');
  
  // Check if mobile styles are loaded
  const mobileCSS = Array.from(document.styleSheets).some(sheet => 
    sheet.href && sheet.href.includes('mobile-first.css')
  );
  console.log('✅ Mobile CSS Loaded:', mobileCSS ? 'Yes' : 'No');
  
  // Check viewport meta
  const viewport = document.querySelector('meta[name="viewport"]');
  console.log('✅ Viewport Meta:', viewport ? 'Present' : 'Missing');
  
  // Test mobile navigation
  const isMobileScreen = currentScreen?.id?.includes('mobile-cafe');
  console.log('✅ Mobile Screen Active:', isMobileScreen ? 'Yes' : 'No');
}

console.log('\n📱 Mobile UI Testing Tips:');
console.log('- Use Chrome DevTools Device Mode (Ctrl+Shift+M)');
console.log('- Test on actual mobile devices when possible');
console.log('- Check both portrait and landscape orientations');
console.log('- Verify touch targets are at least 44x44px');
