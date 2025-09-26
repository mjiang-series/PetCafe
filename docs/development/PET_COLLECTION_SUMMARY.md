# Pet Collection Summary - Love & Pets Café

## Overview
The game currently features **15 unique pets** across three rarity tiers. Each pet has a specific affinity for one of the three café sections (Bakery, Playground, or Styling Salon) and helps strengthen the bond with the corresponding NPC helper.

## Rarity Distribution
- **Common**: 5 pets (70% drop rate)
- **Rare**: 7 pets (27% drop rate)
- **Ultra Rare**: 3 pets (3% drop rate)

## Complete Pet Roster

### Common Pets (70% drop rate)

#### Bakery Affinity (Aria)
1. **Muffin**
   - Species: Corgi
   - Description: "Muffin wandered into Aria's bakery one rainy morning and never left after tasting her signature honey buns. This cheerful Corgi now serves as the official taste-tester, wagging enthusiastically at every new recipe."
   - Bond Bonus: +5 points

2. **Peanut**
   - Species: Pomeranian
   - Description: "Peanut followed the scent of cinnamon rolls right into Aria's kitchen and charmed her with puppy eyes. Despite being tiny, this Pomeranian can detect the perfect baking temperature by smell alone."
   - Bond Bonus: +5 points

#### Playground Affinity (Kai)
3. **Buddy**
   - Species: Golden Retriever
   - Description: "Buddy met Kai during a frisbee game at the park and became his most devoted playmate. This loyal Golden Retriever believes every visitor deserves a warm welcome and a game of fetch."
   - Bond Bonus: +5 points

#### Styling Salon Affinity (Elias)
4. **Prince**
   - Species: Persian Cat
   - Description: "Prince was Elias's first client who refused to leave after experiencing his gentle grooming techniques. This dignified Persian now judges every styling session with regal approval or disdain."
   - Bond Bonus: +5 points

5. **Patches**
   - Species: Calico Cat
   - Description: "Patches appeared at Elias's salon with fur so uniquely patterned that it inspired an entire season of designs. This playful Calico loves to 'help' by batting at ribbons and rolling in glitter."
   - Bond Bonus: +5 points

### Rare Pets (27% drop rate)

#### Bakery Affinity (Aria)
6. **Chip**
   - Species: Hamster
   - Description: "Chip impressed Aria by sorting sprinkles by color during a busy morning rush. This clever hamster has since become the bakery's tiny organizational expert, with a special fondness for chocolate chips."
   - Bond Bonus: +10 points

7. **Luna**
   - Species: Rabbit
   - Description: "Luna hopped into Aria's life during Easter season and created the most beautiful egg designs she'd ever seen. This artistic rabbit can paint delicate flowers on cookies with just her whiskers and a steady paw."
   - Bond Bonus: +10 points

#### Playground Affinity (Kai)
8. **Turbo**
   - Species: Tortoise
   - Description: "Turbo challenged Kai to a race and won, teaching him that determination beats speed every time. This surprisingly quick tortoise loves obstacle courses and proving everyone's assumptions wrong."
   - Bond Bonus: +10 points

9. **Sunny**
   - Species: Parakeet
   - Description: "Sunny flew down to join Kai's playground games, creating victory songs for every child who visited. This musical parakeet composes a unique melody for each game, turning playtime into a concert."
   - Bond Bonus: +10 points

#### Styling Salon Affinity (Elias)
10. **Whiskers**
    - Species: Ferret
    - Description: "Whiskers became Elias's assistant after perfectly matching accessories to a client's outfit. This elegant ferret has an uncanny ability to find the one loose thread or misplaced bow tie."
    - Bond Bonus: +10 points

11. **Storm**
    - Species: Chinchilla
    - Description: "Storm's impossibly soft fur gave Elias the idea for his signature 'cloud wash' grooming technique. This graceful chinchilla takes dust baths at precisely 3 PM and considers them performance art."
    - Bond Bonus: +10 points

12. **Rue**
    - Species: Betta Fish
    - Description: "Rue's shimmering fins inspired Elias to add color-therapy to his styling services. This beautiful betta fish seems to sense each client's mood, displaying colors that bring them peace."
    - Bond Bonus: +10 points

### Ultra Rare Pets (3% drop rate)

#### Bakery Affinity (Aria)
13. **Harmony**
    - Species: Cockatiel
    - Description: "Harmony perched in Aria's window one morning, singing a lullaby her grandmother used to hum while baking. This wise cockatiel remembers every song ever sung in the bakery and weaves them into new melodies."
    - Bond Bonus: +20 points
    - Special: Has unique "flourish" animation

#### Playground Affinity (Kai)
14. **Blaze**
    - Species: Fox Kit
    - Description: "Blaze appeared during Kai's loneliest day at the playground, initiating a game of tag that lasted until sunset. This spirited fox kit believes the best games are the ones you invent together on the spot."
    - Bond Bonus: +20 points
    - Special: Has unique "flourish" animation

#### Styling Salon Affinity (Elias)
15. **Iris**
    - Species: Peacock
    - Description: "Iris arrived at Elias's salon with damaged feathers, teaching him that true beauty comes from patient, gentle care. This magnificent peacock only displays their full plumage when they sense someone needs reminding of their own beauty."
    - Bond Bonus: +20 points
    - Special: Has unique "flourish" animation

## Section Distribution
- **Bakery (Aria)**: 5 pets total (2 Common, 2 Rare, 1 Ultra Rare)
- **Playground (Kai)**: 4 pets total (1 Common, 2 Rare, 1 Ultra Rare)
- **Styling Salon (Elias)**: 6 pets total (2 Common, 3 Rare, 1 Ultra Rare)

## Starter Pull Guarantee
New players receive a special 10-pull that guarantees:
- **Muffin** (Common - Bakery)
- **Buddy** (Common - Playground)
- **Prince** (Common - Styling)
- At least 1 Rare pet
- 6 additional random pets

## Art Assets
Each pet has:
- Portrait image (`art/pets/{petId}_portrait.png`)
- Showcase image (currently same as portrait)
- Idle animation reference
- Interact animation reference
- Ultra Rare pets have additional "flourish" animation

## Gameplay Impact
- Pets assigned to shifts provide efficiency bonuses
- Each pet strengthens the bond with their affinity NPC
- Duplicate pets can be converted to tokens for shop purchases
- Pet collection progress unlocks new conversation topics and scenes with NPCs

## Notes for Development
- All pet portraits currently use placeholder paths
- Animation references exist but animations not yet implemented
- Pet showcase images are duplicates of portraits (could be enhanced)
- Consider adding seasonal/event pets in future updates
