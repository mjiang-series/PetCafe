// Week 2 Automated Validation
console.log('🎮 Week 2 Core Game Loop Validation\n');

function validateWeek2() {
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  try {
    // 1. Check game instance
    if (!window.PetCafe) {
      results.failed.push('Game instance not found');
      return results;
    }
    results.passed.push('Game instance loaded');

    const game = window.PetCafe;

    // 2. Check ShiftManager
    const shiftManager = game.getShiftManager();
    if (!shiftManager) {
      results.failed.push('ShiftManager not loaded');
    } else {
      results.passed.push('ShiftManager system loaded');
    }

    // 3. Check game state structure
    const state = game.getGameState();
    if (!state.activeShifts) {
      results.failed.push('activeShifts not in game state');
    } else {
      results.passed.push('Active shifts tracking ready');
    }

    if (!state.cafeLayout || state.cafeLayout.length === 0) {
      results.failed.push('Cafe sections not initialized');
    } else {
      results.passed.push(`${state.cafeLayout.length} cafe sections loaded`);
      
      // Check section structure
      const bakery = state.cafeLayout.find(s => s.sectionType === 'Bakery');
      if (bakery) {
        if (bakery.isUnlocked) {
          results.passed.push('Bakery section unlocked');
        }
        if (bakery.helper && bakery.helper.npcId) {
          results.passed.push(`Bakery helper: ${bakery.helper.npcId}`);
        }
      }
    }

    // 4. Check player structure
    const player = state.player;
    if (!player.pets) {
      results.failed.push('Player pets array missing');
    } else {
      results.passed.push(`Player has ${player.pets.length} pets`);
      if (player.pets.length === 0) {
        results.warnings.push('No pets available - use PetCafe.debugAddTestPets() to add test pets');
      }
    }

    // 5. Check currencies
    if (player.currencies && typeof player.currencies.coins === 'number') {
      results.passed.push(`Starting coins: ${player.currencies.coins}`);
    } else {
      results.failed.push('Player currencies not properly initialized');
    }

    // 6. Check debug commands
    if (typeof game.debugAddCoins === 'function') {
      results.passed.push('Debug command: debugAddCoins available');
    }
    if (typeof game.debugSetShiftTime === 'function') {
      results.passed.push('Debug command: debugSetShiftTime available');
    }
    if (typeof game.debugCompleteShift === 'function') {
      results.passed.push('Debug command: debugCompleteShift available');
    }
    if (typeof game.debugAddTestPets === 'function') {
      results.passed.push('Debug command: debugAddTestPets available');
    }

    // 7. Check UI screens
    const screenManager = game.uiManager?.screenManager;
    if (screenManager) {
      const currentScreen = screenManager.currentScreen;
      if (currentScreen) {
        results.passed.push(`Current screen: ${currentScreen.id}`);
      }
    }

    // 8. Test shift functionality (if pets available)
    if (player.pets.length > 0) {
      console.log('\n📋 Testing shift functionality...');
      
      // Try to start a shift
      const testPets = [player.pets[0].petId];
      console.log(`Attempting to start shift with pet: ${testPets[0]}`);
      
      try {
        const shiftId = shiftManager.startShift('Bakery', testPets);
        if (shiftId) {
          results.passed.push('Successfully started test shift');
          
          // Check remaining time
          const remainingTime = shiftManager.getRemainingTime(shiftId);
          if (remainingTime > 0) {
            results.passed.push(`Shift timer active: ${Math.floor(remainingTime/1000)}s remaining`);
          }
          
          // Complete the shift
          const rewards = shiftManager.completeShift(shiftId, true);
          if (rewards && rewards.coins > 0) {
            results.passed.push(`Shift completed with ${rewards.coins} coins reward`);
          }
        } else {
          results.warnings.push('Could not start test shift - check console for errors');
        }
      } catch (e) {
        results.failed.push(`Shift test error: ${e.message}`);
      }
    }

  } catch (e) {
    results.failed.push(`Validation error: ${e.message}`);
  }

  // Print results
  console.log('\n📊 Week 2 Validation Results:');
  console.log('✅ Passed:', results.passed.length);
  results.passed.forEach(msg => console.log(`   ✓ ${msg}`));
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:', results.warnings.length);
    results.warnings.forEach(msg => console.log(`   ! ${msg}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed:', results.failed.length);
    results.failed.forEach(msg => console.log(`   ✗ ${msg}`));
  }

  const success = results.failed.length === 0;
  console.log(`\n${success ? '✅' : '❌'} Week 2 Validation ${success ? 'PASSED' : 'FAILED'}!`);
  
  if (success) {
    console.log('\n🎉 Week 2 Core Game Loop is ready!');
    console.log('\n📝 Next steps:');
    console.log('1. Run PetCafe.debugAddTestPets() to add test pets');
    console.log('2. Navigate to a section (click Bakery)');
    console.log('3. Assign pets and start a shift');
    console.log('4. Use PetCafe.debugSetShiftTime(10) for 10-second shifts');
    console.log('5. Test instant completion and rewards');
  }

  return results;
}

// Auto-run validation
if (window.PetCafe) {
  validateWeek2();
} else {
  console.log('⏳ Waiting for game to load...');
  window.addEventListener('load', () => {
    setTimeout(validateWeek2, 1000);
  });
}

// Export for manual testing
window.validateWeek2 = validateWeek2;
