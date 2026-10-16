# Handoff — 2026-10-15 (before restart)

## State

- Repo: ~/Source Code/cosmere interactive guide. Pushed to origin/main.
- Committed (steps 2–3, all validated: typecheck/lint/build/144 tests):
  ROADMAP.md, characters.test.tsx, characterDetails.test.ts, characterStories.ts (new),
  reveal.ts (revealStory), types.ts (StoryItem/CharacterStory), CharacterDetail.tsx (redesign),
  CharacterList.tsx (name filter + Group by dropdown: series/world/species/ability/books, `?group=`), index.css (layout + .app grid minmax phone overflow fix).
- Backup: Copilot session files/ (cig-char-data-backup.tgz for the pipeline).
- Pipeline ~/cig-char-data: story_src.py, story_check.py (incl. HINDSIGHT warnings),
  emit_story.py (writes src/data/stories/<id>.json), STORY_GUIDE.md, story/*.json (34 done).
- Screenshots (session files/): v_kal_story.png, v_kal_pers.png, v_zahel.png, v_list.png, v_m375b.png.

## Waiting on user

1. (Done: committed and pushed.)
2. Flashbacks: answered by History (in-world order). Pilot on Kaladin + Vasher;
   roll out to the other 32 once approved (make_history.py drafts, headings by hand).
3. Collapse Key facts box on phones?
4. Multi-book appearance/personality items appear late — OK?
5. (Done: stories load on demand from src/data/stories/<id>.json; bundle 1.5 MB → 1.0 MB.)

## After that

- Scale details + stories to remaining ~2,100 characters in small batches.
- Travels tab for world hoppers.
