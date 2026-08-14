# Content Authoring

Levels are defined via JSON configurations that map to engine mechanics.

## Guidelines
1. **JSON Driven**: All level narratives, mechanics, and win conditions are defined in JSON in `src/content/`.
2. **No Hardcoded React**: Do not create custom React components for a single level's win condition.
3. **Schema Validation**: All JSON files must validate against predefined schemas before being loaded by the engine.
4. **Narrative Design**: Use the briefing, failure hints, and success explanations to teach. Avoid generic "Wrong answer" dialogs. Let failures be interactive learning moments.

Example level config:
```json
{
  "id": "cicd-03-test-lab",
  "type": "triage",
  "narrative": { "intro": "..." }
}
```
