# Human Playtest Protocol (No-DevOps Background)

## Objective
Observe real humans interacting with DeployLand for the first time without prior knowledge of CI/CD or DevOps. Discover friction points, confusion, and UX failures.

## Participant Profile
- 3 to 5 individuals.
- Comfortable using computers.
- NO professional DevOps, CI/CD, or SRE experience.

## Protocol

1. **Setup**: Seat the participant at a desktop computer with DeployLand loaded to the Landing Page.
2. **Instruction**: "Please play this. Explore the game as you normally would."
3. **Constraint**: The moderator MUST REMAIN SILENT. Do not explain CI/CD concepts. Do not guide them through levels.
4. **Intervention**: Only intervene if the participant is completely blocked for more than 3 minutes or specifically asks "What am I supposed to do?" and cannot proceed.

## Observation Metrics

Do not just ask for opinions. Watch their behavior and note:

- **Hesitation**: Where does the mouse hover? Which screens cause them to stop?
- **Terminology**: Do they express confusion at terms like "Artifact", "Pipeline", "Deploy"?
- **Mission Abandonment**: If they quit, exactly which level and stage of the level prompted it?
- **Failure Comprehension**: When a mission fails (e.g. Graph build breaks), do they understand *why* it failed based on the error logs?
- **Engineer Mode**: Do they open it? Do they read the code? Does it help them understand the concept better?
- **Perceived Difficulty**: Is the leap from Level 1 to Level 3 too steep?
- **Paywall Reaction**: How do they react upon hitting the Level 3 paywall? Is the value proposition clear?

## Post-Play Interview
1. "In your own words, what is this game trying to teach you?"
2. "What was the most confusing part?"
3. "Did you feel like you were learning something, or just solving puzzles?"
