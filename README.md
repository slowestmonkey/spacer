# Spacer 🚀

## Table of Contents
- [Philosophy 🤔](#philosophy)
- [Demo 🎥](#demo)
- [Build and Run 💻](#build-and-run)
- [Story 📖](#story)
- [Short-term TODOs 🏋️](#short-term-todos)
- [Contribute 🙌](#contribute)
- [Acknowledgments 🙇](#acknowledgments)

## Philosophy

**Consistency is the key!**

While many step counters motivate users with rewards for achieving goals, **fear of loss** can be an even stronger motivator.  

Spacer leverages this principle by tying the survival of the user's customizable spaceship—and its crew—to their daily activity. Failing to meet step goals results in severe consequences, such as the complete destruction of the user's ship and crew. This high-stakes mechanic serves as a compelling motivator, encouraging users to remain active and consistent in their daily routines.

## Demo

![Spacer Gameplay](./docs/spacer.gif)  
*Experience the thrill of piloting your ship while staying active! Fuel is calculated as steps per day divided by 10, while your goal dynamically adjusts based on your activity.*

## Build and Run

### Prerequisites
Before proceeding, ensure the following are installed:
- **Xcode**: Required for building and running the iOS project.
- **Godot 4.4**: Used for game development and exporting the project.

### Steps

1. **Build the HealthKit Plugin**  
   Follow the instructions in the [HealthKit plugin repository](https://github.com/slowestmonkey/godot-healthkit-plugin).

2. **Copy the Built Artifact**  
   After building, locate the artifact (e.g., `libHealthKitPlugin.a`) in the `Library/Developer/Xcode/DerivedData` folder.  
   Copy it to the `ios/plugins/healthkit` directory.  
   > **Note**: If the app cannot detect the HealthKit plugin, it will simulate random step counts and goals to ensure functionality during testing or in unsupported environments.

3. **Export the Game**  
   Export the game using Godot with the **iOS preset**.  
   - Ensure the HealthKit plugin is enabled in the export settings.  
   - Disable the "Export with Debug" option when selecting the export directory.  
   For more details, refer to the [troubleshooting section](https://github.com/slowestmonkey/godot-healthkit-plugin?tab=readme-ov-file#troubleshooting).  
   > **Note**: The app requires Apple Health access to Steps. If unsure, review the code for confirmation.

4. **Open in Xcode**  
   Open the exported project in Xcode.

5. **Build and Run**  
   Build and run the project on a real device (e.g., iPhone 13 mini).  
   > **Note**: The game has not been tested on a simulator.

## Story

*Walk to the Galactic Center?*

### Galaxy

The galaxy is being conquered by aliens.

### Space Ship

The user pilots a customizable, high-speed spaceship with a dedicated crew, tasked with reaching the Galactic Center. The Galactic Center houses a black hole capable of sending the user back in time to prevent the alien conquest.  

If the user fails to meet their daily step goal, the ship and its crew face **total destruction**, with no chance of repair—unless the ship is equipped with specific upgrades. This mechanic serves as a powerful motivator, encouraging users to stay active to protect their uniquely customized ship and its crew.

### Fuel

Fuel is earned by steps achieved per day divided by 10.  
For example, 1000 steps = 100 fuel units.  

Fuel is automatically converted to parsecs, allowing the user's ship to travel further. However, if the user exceeds the enemy's leap by earning additional fuel units beyond their daily goal, they gain **extra fuel**. This bonus fuel can be strategically used for upgrades or stored for future challenges, giving the user an edge in their journey.

**Extra fuel can be traded for:**
- **Spaceship upgrades** to gain bonuses:
  - Invisible module (rest day).
  - Teleport module (saved you once).
  - Fuel decomposer (multiplies velocity; 1 step becomes 1.2 fuel units).
- **Visual upgrades to the ship** (the user becomes more attached to the ship).

### Enemy

The enemy, represented by aliens, adapts its velocity periodically (e.g., weekly or monthly).  
If the user increases their step count (velocity), the aliens will also increase theirs to match the challenge.  
This creates a dynamic competition, encouraging the user to consistently improve their activity levels to stay ahead.

### Crew (For Later)

You can pair with another person to achieve the needed velocity to escape the enemy.

### Fuel Consumption (Extra Idea - Not Priority)

Apart from main fuel consumption, fuel can be deducted for:
- **Device unlocking** (e.g., 0.5 fuel units).
- **Using apps from the blacklist** (e.g., 1 fuel unit).

## Short-term TODOs

- **Design and Animations**: Create original designs and animations to replace placeholder references currently used in the app.
- **Customizable Ships**: Implement a feature allowing users to customize their ships in the hangar.
- **Test Coverage**: Write and implement tests to ensure the app's functionality and stability.
- **Add Difficulty Levels**: Introduce levels that influence how daily step goals are calculated and when they are updated.

## Contribute
We need your help to make **Spacer** ready for release! 🚀  
If you're passionate about fitness, gaming, or space exploration, consider contributing to the project.  

**Spacer is completely free** and aims to motivate users to stay active while enjoying an engaging space adventure. Your contributions can help make this vision a reality.  

### How to Contribute

1. **Report Issues**  
   Found a bug or have a suggestion? Open an issue in the repository.

2. **Submit Pull Requests**  
   Fork the repository, make your changes, and submit a pull request.  
   Be sure to follow the coding guidelines and include detailed descriptions of your changes.

3. **Help with Testing**  
   Test the game on different devices and provide feedback to improve compatibility and performance.

4. **Spread the Word**  
   Share the project with your friends, family, and community to help us grow.

### Areas Where Help is Needed

- Improving the **game mechanics** and balancing.
- Enhancing the **user interface** and **visual design**.
- Testing and debugging on various devices.
- Writing documentation.

Together, we can make **Spacer** an engaging and motivating experience for everyone.  
Thank you for your support! 🙇

## Acknowledgments

- [uheartbeast](https://github.com/uheartbeast) for the space shooter [tutorial series](https://www.youtube.com/watch?v=zUeLesdL7lE&list=PL9FzW-m48fn09w6j8NowI_pSBVcsb3V78).
- [bodeville-games](https://github.com/bodeville-games) for creating the original [godot-healthkit-plugin](https://github.com/bodeville-games/godot-healthkit-plugin) and providing valuable assistance.
- GrafxKid for the [space-themed assets](https://opengameart.org/content/arcade-space-shooter-game-assets) and Pixel by Pixel for the [spaceship asset pack](https://pixel-by-pixel.itch.io/alcwilliam-space-ship-pack).
