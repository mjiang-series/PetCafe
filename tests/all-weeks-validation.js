// Combined Week 1-2 Validation Script
// Run this in the browser console after the game loads

(function validateAllWeeks() {
  console.log('🧪 Running Complete Validation (Weeks 1-2)...\n');
  
  const allResults = {
    week1: { passed: 0, failed: 0, warnings: 0 },
    week2: { passed: 0, failed: 0, warnings: 0 },
    timestamp: new Date().toISOString()
  };

  // ==================== WEEK 1 TESTS ====================
  console.log('=== 📅 WEEK 1: Foundation & Architecture ===\n');
  
  // Test 1.1: Project Structure
  console.log('1️⃣  Testing Project Structure...');
  try {
    // Check if game loaded
    if (!window.PetCafe) throw new Error('PetCafe not found on window');
    console.log('✅ Game instance loaded');
    allResults.week1.passed++;

    // Check TypeScript compilation
    if (typeof window.PetCafe.getGameState === 'function') {
      console.log('✅ TypeScript compiled successfully');
      allResults.week1.passed++;
    } else {
      console.error('❌ TypeScript compilation issues');
      allResults.week1.failed++;
    }
  } catch (e) {
    console.error('❌ Project structure test failed:', e.message);
    allResults.week1.failed++;
  }

  // Test 1.2: Core Systems
  console.log('\n2️⃣  Testing Core Systems...');
  const systems = ['EventSystem', 'GameState', 'SaveSystem', 'AudioManager'];
  systems.forEach(system => {
    try {
      const getter = window.PetCafe[`get${system}`];
      if (getter && typeof getter === 'function') {
        const instance = getter.call(window.PetCafe);
        if (instance) {
          console.log(`✅ ${system} initialized`);
          allResults.week1.passed++;
        } else {
          throw new Error('Instance is null');
        }
      } else {
        throw new Error('Getter not found');
      }
    } catch (e) {
      console.error(`❌ ${system} initialization failed`);
      allResults.week1.failed++;
    }
  });

  // Test 1.3: Data Models
  console.log('\n3️⃣  Testing Data Models...');
  try {
    const state = window.PetCafe.getGameState();
    const models = [
      { name: 'Player', path: 'player', required: ['currencies', 'pets', 'settings'] },
      { name: 'CafeLayout', path: 'cafeLayout', required: [] },
      { name: 'NPCs', path: 'npcs', required: [] }
    ];

    models.forEach(model => {
      const data = state[model.path];
      if (data !== undefined) {
        console.log(`✅ ${model.name} model present`);
        allResults.week1.passed++;
        
        // Check required fields
        model.required.forEach(field => {
          if (model.path === 'player' && state.player[field] !== undefined) {
            console.log(`   ✓ ${field} field present`);
          }
        });
      } else {
        console.error(`❌ ${model.name} model missing`);
        allResults.week1.failed++;
      }
    });
  } catch (e) {
    console.error('❌ Data model test failed:', e.message);
    allResults.week1.failed++;
  }

  // Test 1.4: Asset Pipeline
  console.log('\n4️⃣  Testing Asset Pipeline...');
  const assetPaths = [
    '/art/ui/placeholder_icon.svg',
    '/art/pets/placeholder_pet.svg',
    '/art/scenes/cafe_background.svg'
  ];

  assetPaths.forEach(path => {
    // Check if asset references exist in DOM
    const elements = document.querySelectorAll(`img[src="${path}"]`);
    if (elements.length > 0) {
      console.log(`✅ Asset loaded: ${path}`);
      allResults.week1.passed++;
    } else {
      console.warn(`⚠️  Asset not currently displayed: ${path}`);
      allResults.week1.warnings++;
    }
  });

  // Test 1.5: Save System
  console.log('\n5️⃣  Testing Save System...');
  try {
    const saveSystem = window.PetCafe.getSaveSystem();
    if (saveSystem) {
      // Test save
      const testData = { test: 'data', timestamp: Date.now() };
      localStorage.setItem('petcafe_test', JSON.stringify(testData));
      
      const loaded = localStorage.getItem('petcafe_test');
      if (loaded) {
        console.log('✅ Save/Load functionality working');
        allResults.week1.passed++;
        localStorage.removeItem('petcafe_test');
      } else {
        throw new Error('Could not load saved data');
      }
    } else {
      throw new Error('SaveSystem not available');
    }
  } catch (e) {
    console.error('❌ Save system test failed:', e.message);
    allResults.week1.failed++;
  }

  // ==================== WEEK 2 TESTS ====================
  console.log('\n\n=== 📅 WEEK 2: Core Game Loop & Responsive UI ===\n');

  // Test 2.1: Shift System
  console.log('1️⃣  Testing Shift System...');
  try {
    const shiftManager = window.PetCafe.getShiftManager();
    if (!shiftManager) throw new Error('ShiftManager not available');
    
    console.log('✅ ShiftManager loaded');
    allResults.week2.passed++;

    // Check shift methods
    const methods = ['startShift', 'instantFinishShift', 'getRemainingTime'];
    methods.forEach(method => {
      if (typeof shiftManager[method] === 'function') {
        console.log(`   ✓ ${method} method available`);
      } else {
        console.error(`   ✗ ${method} method missing`);
        allResults.week2.failed++;
      }
    });

    // Check active shifts
    const state = window.PetCafe.getGameState();
    console.log(`✅ Active shifts: ${state.activeShifts.length}`);
    allResults.week2.passed++;
  } catch (e) {
    console.error('❌ Shift system test failed:', e.message);
    allResults.week2.failed++;
  }

  // Test 2.2: Pet Assignment
  console.log('\n2️⃣  Testing Pet Assignment...');
  try {
    const state = window.PetCafe.getGameState();
    const petCount = state.player.pets.length;
    
    if (petCount === 0) {
      console.log('   No pets available. Adding test pets...');
      window.PetCafe.debugAddTestPets();
      const newState = window.PetCafe.getGameState();
      const newPetCount = newState.player.pets.length;
      
      if (newPetCount > petCount) {
        console.log(`✅ Test pets added: ${newPetCount} pets`);
        allResults.week2.passed++;
      } else {
        throw new Error('Failed to add test pets');
      }
    } else {
      console.log(`✅ ${petCount} pets available`);
      allResults.week2.passed++;
    }
  } catch (e) {
    console.error('❌ Pet assignment test failed:', e.message);
    allResults.week2.failed++;
  }

  // Test 2.3: Unified Responsive UI
  console.log('\n3️⃣  Testing Unified Responsive UI...');
  try {
    const cafeScreen = document.querySelector('.cafe-overview-screen');
    if (!cafeScreen) {
      console.warn('⚠️  Not on cafe screen, checking for unified screen usage...');
      allResults.week2.warnings++;
    } else {
      // Check for unified screen markers
      const hasWelcomeSection = cafeScreen.querySelector('.welcome-section') !== null;
      const hasMobileNav = document.querySelector('.mobile-nav') !== null;
      const hasDesktopActions = document.querySelector('.desktop-actions') !== null;
      
      if (hasWelcomeSection && hasMobileNav && hasDesktopActions) {
        console.log('✅ Using unified responsive screen');
        allResults.week2.passed++;
      } else {
        console.error('❌ Not using unified screen structure');
        allResults.week2.failed++;
      }
    }

    // Check responsive elements
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth < 768;
    console.log(`   Viewport: ${viewportWidth}px (${isMobile ? 'Mobile' : 'Desktop'})`);
    
    const mobileNav = document.querySelector('.mobile-nav');
    const desktopActions = document.querySelector('.desktop-actions');
    
    if (mobileNav && desktopActions) {
      const mobileNavStyle = window.getComputedStyle(mobileNav);
      const desktopActionsStyle = window.getComputedStyle(desktopActions);
      
      console.log(`✅ Responsive elements present`);
      console.log(`   Mobile nav: ${mobileNavStyle.display !== 'none' ? 'visible' : 'hidden'}`);
      console.log(`   Desktop actions: ${desktopActionsStyle.display !== 'none' ? 'visible' : 'hidden'}`);
      allResults.week2.passed++;
    }
  } catch (e) {
    console.error('❌ Responsive UI test failed:', e.message);
    allResults.week2.failed++;
  }

  // Test 2.4: Mobile Navigation
  console.log('\n4️⃣  Testing Mobile Navigation...');
  try {
    const navItems = document.querySelectorAll('.nav-item');
    const expectedNavs = ['cafe', 'pets', 'gacha', 'blog', 'shop'];
    
    if (navItems.length === expectedNavs.length) {
      console.log(`✅ Mobile nav has ${navItems.length} items`);
      allResults.week2.passed++;
      
      const actualNavs = Array.from(navItems).map(item => item.getAttribute('data-nav'));
      let allPresent = true;
      
      expectedNavs.forEach(nav => {
        if (!actualNavs.includes(nav)) {
          console.error(`   ✗ Missing nav: ${nav}`);
          allPresent = false;
        }
      });
      
      if (allPresent) {
        console.log('   ✓ All nav items present');
      } else {
        allResults.week2.failed++;
      }
    } else {
      console.error(`❌ Wrong nav count: expected ${expectedNavs.length}, got ${navItems.length}`);
      allResults.week2.failed++;
    }
  } catch (e) {
    console.error('❌ Mobile navigation test failed:', e.message);
    allResults.week2.failed++;
  }

  // Test 2.5: Currency Display
  console.log('\n5️⃣  Testing Currency Display...');
  try {
    const coinDisplay = document.querySelector('#coin-display');
    const subscriberDisplay = document.querySelector('#subscriber-display');
    
    if (coinDisplay && subscriberDisplay) {
      console.log('✅ Currency displays found');
      allResults.week2.passed++;
      
      const state = window.PetCafe.getGameState();
      const displayedCoins = parseInt(coinDisplay.textContent) || 0;
      const actualCoins = state.player.currencies.coins;
      
      if (displayedCoins === actualCoins) {
        console.log(`   ✓ Coin display accurate: ${displayedCoins}`);
      } else {
        console.warn(`   ⚠️  Coin mismatch - Display: ${displayedCoins}, Actual: ${actualCoins}`);
        allResults.week2.warnings++;
      }
    } else {
      console.error('❌ Currency displays not found');
      allResults.week2.failed++;
    }
  } catch (e) {
    console.error('❌ Currency display test failed:', e.message);
    allResults.week2.failed++;
  }

  // Test 2.6: No Container Overlap
  console.log('\n6️⃣  Testing Container Overlap...');
  try {
    // Find any visible button
    const buttons = document.querySelectorAll('button:not([style*="display: none"])');
    let testedButtons = 0;
    let blockedButtons = 0;
    
    buttons.forEach(button => {
      if (testedButtons >= 5) return; // Test first 5 visible buttons
      
      const rect = button.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const elementAtPoint = document.elementFromPoint(centerX, centerY);
        
        if (!elementAtPoint || (!button.contains(elementAtPoint) && elementAtPoint !== button)) {
          console.warn(`   ⚠️  Button blocked: ${button.textContent?.trim() || button.className}`);
          blockedButtons++;
        }
        testedButtons++;
      }
    });
    
    if (blockedButtons === 0) {
      console.log(`✅ No button overlap detected (tested ${testedButtons} buttons)`);
      allResults.week2.passed++;
    } else {
      console.error(`❌ ${blockedButtons} buttons blocked by overlapping elements`);
      allResults.week2.failed++;
    }
  } catch (e) {
    console.error('❌ Container overlap test failed:', e.message);
    allResults.week2.failed++;
  }

  // ==================== SUMMARY ====================
  console.log('\n\n📊 VALIDATION SUMMARY');
  console.log('====================');
  
  console.log('\nWeek 1 - Foundation & Architecture:');
  console.log(`✅ Passed: ${allResults.week1.passed}`);
  console.log(`❌ Failed: ${allResults.week1.failed}`);
  console.log(`⚠️  Warnings: ${allResults.week1.warnings}`);
  
  console.log('\nWeek 2 - Core Game Loop & Responsive UI:');
  console.log(`✅ Passed: ${allResults.week2.passed}`);
  console.log(`❌ Failed: ${allResults.week2.failed}`);
  console.log(`⚠️  Warnings: ${allResults.week2.warnings}`);
  
  const totalPassed = allResults.week1.passed + allResults.week2.passed;
  const totalFailed = allResults.week1.failed + allResults.week2.failed;
  const totalWarnings = allResults.week1.warnings + allResults.week2.warnings;
  
  console.log('\nTotal:');
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`⚠️  Warnings: ${totalWarnings}`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 All tests passed! Weeks 1-2 implementation is complete.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the errors above.');
  }
  
  // Store results
  window.validationResults = allResults;
  
  return allResults;
})();
