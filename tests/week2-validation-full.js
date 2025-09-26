// Week 2 Complete Validation Script
// Run this in the browser console after the game loads

(function validateWeek2() {
  console.log('🧪 Running Week 2 Complete Validation...\n');
  
  const testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  function logTest(name, result, message) {
    if (result === 'pass') {
      console.log(`✅ ${name}`);
      testResults.passed++;
    } else if (result === 'fail') {
      console.error(`❌ ${name}: ${message}`);
      testResults.failed++;
    } else if (result === 'warn') {
      console.warn(`⚠️  ${name}: ${message}`);
      testResults.warnings++;
    }
    testResults.details.push({ name, result, message });
  }

  // Test 1: Core Systems
  console.log('1️⃣  Testing Core Systems...');
  try {
    const game = window.PetCafe;
    if (!game) throw new Error('PetCafe not found on window');
    
    const systems = {
      'GameState': game.getGameState,
      'EventSystem': game.getEventSystem,
      'SaveSystem': game.getSaveSystem,
      'ShiftManager': game.getShiftManager
    };
    
    for (const [name, getter] of Object.entries(systems)) {
      try {
        const system = getter.call(game);
        if (!system) throw new Error(`${name} is null`);
        logTest(`${name} initialized`, 'pass');
      } catch (e) {
        logTest(`${name} initialized`, 'fail', e.message);
      }
    }
  } catch (e) {
    logTest('Core systems available', 'fail', e.message);
  }

  // Test 2: Game State Structure
  console.log('\n2️⃣  Testing Game State...');
  try {
    const state = window.PetCafe.getGameState();
    const requiredFields = [
      'player.currencies.coins',
      'player.pets',
      'activeShifts',
      'cafeLayout',
      'npcs'
    ];
    
    for (const field of requiredFields) {
      const value = field.split('.').reduce((obj, key) => obj?.[key], state);
      if (value === undefined) {
        logTest(`State field: ${field}`, 'fail', 'Field missing');
      } else {
        logTest(`State field: ${field}`, 'pass');
      }
    }
  } catch (e) {
    logTest('Game state structure', 'fail', e.message);
  }

  // Test 3: UI Screen Management
  console.log('\n3️⃣  Testing UI Screens...');
  try {
    const currentScreen = document.querySelector('.screen--visible');
    if (!currentScreen) throw new Error('No visible screen');
    
    const screenId = currentScreen.id;
    logTest('Active screen present', 'pass', `Current: ${screenId}`);
    
    // Check for unified cafe screen
    if (screenId === 'cafe-overview-screen') {
      const isUnified = currentScreen.querySelector('.welcome-section') !== null;
      if (isUnified) {
        logTest('Using unified cafe screen', 'pass');
      } else {
        logTest('Using unified cafe screen', 'fail', 'Old screen structure detected');
      }
    }
  } catch (e) {
    logTest('UI screen management', 'fail', e.message);
  }

  // Test 4: Responsive Layout
  console.log('\n4️⃣  Testing Responsive Layout...');
  try {
    const elements = {
      'Mobile nav': '.mobile-nav',
      'Mobile FAB': '.mobile-fab',
      'Desktop actions': '.desktop-actions',
      'Header': '.cafe-header',
      'Main content': '.cafe-main'
    };
    
    for (const [name, selector] of Object.entries(elements)) {
      const element = document.querySelector(selector);
      if (element) {
        logTest(`${name} exists`, 'pass');
      } else {
        logTest(`${name} exists`, 'fail', 'Element not found');
      }
    }
    
    // Check viewport-based visibility
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth < 768;
    console.log(`\n   Viewport: ${viewportWidth}px (${isMobile ? 'Mobile' : 'Desktop'})`);
    
    const mobileNav = document.querySelector('.mobile-nav');
    const desktopActions = document.querySelector('.desktop-actions');
    
    if (mobileNav && desktopActions) {
      const mobileNavVisible = window.getComputedStyle(mobileNav).display !== 'none';
      const desktopActionsVisible = window.getComputedStyle(desktopActions).display !== 'none';
      
      if (isMobile) {
        logTest('Mobile nav visible on mobile', mobileNavVisible ? 'pass' : 'warn', 'Check CSS media queries');
        logTest('Desktop actions hidden on mobile', !desktopActionsVisible ? 'pass' : 'warn', 'Check CSS media queries');
      } else {
        logTest('Mobile nav hidden on desktop', !mobileNavVisible ? 'pass' : 'warn', 'Check CSS media queries');
        logTest('Desktop actions visible on desktop', desktopActionsVisible ? 'pass' : 'warn', 'Check CSS media queries');
      }
    }
  } catch (e) {
    logTest('Responsive layout', 'fail', e.message);
  }

  // Test 5: Mobile Navigation
  console.log('\n5️⃣  Testing Mobile Navigation...');
  try {
    const navItems = document.querySelectorAll('.nav-item');
    const expectedCount = 5;
    
    if (navItems.length === expectedCount) {
      logTest('Mobile nav item count', 'pass', `Found ${navItems.length} items`);
      
      const expectedNavs = ['cafe', 'pets', 'gacha', 'blog', 'shop'];
      const actualNavs = Array.from(navItems).map(item => item.getAttribute('data-nav'));
      
      for (const nav of expectedNavs) {
        if (actualNavs.includes(nav)) {
          logTest(`Nav item: ${nav}`, 'pass');
        } else {
          logTest(`Nav item: ${nav}`, 'fail', 'Missing from navigation');
        }
      }
    } else {
      logTest('Mobile nav item count', 'fail', `Expected ${expectedCount}, found ${navItems.length}`);
    }
  } catch (e) {
    logTest('Mobile navigation', 'fail', e.message);
  }

  // Test 6: Pet Assignment (if pets available)
  console.log('\n6️⃣  Testing Pet Assignment...');
  try {
    const state = window.PetCafe.getGameState();
    if (state.player.pets.length === 0) {
      console.log('   No pets available. Adding test pets...');
      window.PetCafe.debugAddTestPets();
      logTest('Test pets added', 'pass');
    } else {
      logTest('Pets available', 'pass', `${state.player.pets.length} pets found`);
    }
  } catch (e) {
    logTest('Pet system', 'fail', e.message);
  }

  // Test 7: Shift System
  console.log('\n7️⃣  Testing Shift System...');
  try {
    const shiftManager = window.PetCafe.getShiftManager();
    if (!shiftManager) throw new Error('ShiftManager not available');
    
    // Check if we can access shift methods
    if (typeof shiftManager.startShift === 'function') {
      logTest('ShiftManager methods available', 'pass');
    } else {
      logTest('ShiftManager methods available', 'fail', 'Methods not accessible');
    }
    
    // Check active shifts
    const state = window.PetCafe.getGameState();
    logTest('Active shifts accessible', 'pass', `${state.activeShifts.length} active shifts`);
  } catch (e) {
    logTest('Shift system', 'fail', e.message);
  }

  // Test 8: Currency Display
  console.log('\n8️⃣  Testing Currency Display...');
  try {
    const coinDisplay = document.querySelector('#coin-display');
    const subscriberDisplay = document.querySelector('#subscriber-display');
    
    if (coinDisplay && subscriberDisplay) {
      logTest('Currency displays found', 'pass');
      
      const state = window.PetCafe.getGameState();
      const displayedCoins = parseInt(coinDisplay.textContent);
      const actualCoins = state.player.currencies.coins;
      
      if (displayedCoins === actualCoins) {
        logTest('Coin display accurate', 'pass', `Showing ${displayedCoins} coins`);
      } else {
        logTest('Coin display accurate', 'fail', `Display: ${displayedCoins}, Actual: ${actualCoins}`);
      }
    } else {
      logTest('Currency displays found', 'fail', 'Elements not found');
    }
  } catch (e) {
    logTest('Currency display', 'fail', e.message);
  }

  // Test 9: Section Cards
  console.log('\n9️⃣  Testing Section Cards...');
  try {
    const sectionCards = document.querySelectorAll('.section-card');
    const expectedSections = ['bakery', 'playground', 'styling'];
    
    if (sectionCards.length === expectedSections.length) {
      logTest('Section card count', 'pass', `Found ${sectionCards.length} sections`);
      
      for (const section of expectedSections) {
        const card = document.querySelector(`[data-section="${section}"]`);
        if (card) {
          logTest(`Section card: ${section}`, 'pass');
        } else {
          logTest(`Section card: ${section}`, 'fail', 'Card not found');
        }
      }
    } else {
      logTest('Section card count', 'fail', `Expected ${expectedSections.length}, found ${sectionCards.length}`);
    }
  } catch (e) {
    logTest('Section cards', 'fail', e.message);
  }

  // Test 10: No Container Overlap
  console.log('\n🔟 Testing Container Overlap...');
  try {
    // Check if Start Game button is clickable
    const titleScreen = document.querySelector('#title-screen');
    if (titleScreen && titleScreen.classList.contains('screen--visible')) {
      const startButton = titleScreen.querySelector('[data-action="start"]');
      if (startButton) {
        const rect = startButton.getBoundingClientRect();
        const elementAtPoint = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
        
        if (elementAtPoint === startButton || startButton.contains(elementAtPoint)) {
          logTest('Start button clickable', 'pass', 'No overlapping elements');
        } else {
          logTest('Start button clickable', 'fail', `Blocked by: ${elementAtPoint?.className}`);
        }
      }
    } else {
      logTest('Start button test', 'warn', 'Not on title screen');
    }
  } catch (e) {
    logTest('Container overlap check', 'fail', e.message);
  }

  // Summary
  console.log('\n📊 Validation Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⚠️  Warnings: ${testResults.warnings}`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Week 2 implementation is complete.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the errors above.');
  }
  
  // Store results for access
  window.week2ValidationResults = testResults;
  
  return testResults;
})();
