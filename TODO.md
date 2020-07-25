A scratch-pad. Not in any particular order

[ ] TODO: rework to use hooks/functional components instead of classes, also - learn hooks
[ ] TODO: once switched to hooks, review some basic material-ui projects and update this to look less poop
[ ] TODO: should I re-engineer this so we just assume the `textures/` dir prefix at every step? Can I?
[ ] TODO: Other tooling seems to suggest you can have multiple `textures/objects` dirs covered by one tags file - possibly a use-case to support?
[ ] TODO: exit properly when loading badly formatted tag file data - just ignore the input effectively, give the user a message
[ ] TODO: refine TagData loading of existing - including (a) Doing some sensible checks on type, (b) considering sets a bit more
[ ] TODO: implement set management
[ ] TODO: performance improvements
[ ] TODO: switch to TypeScript? Not doing that much param checking or anything
[X] TODO: prevent selection of files if no tag selected
[X] TODO: If Creating a new tag after no tag was selected previously, can't select files :(
[X] TODO: preselect the first tag
[X] TODO: see if we can improve the responsiveness of individual file selection - this sucks less in a production build
[X] TODO: Add image rendering, but make it some level of optional, and include some kind of cache? - not optional, no cache, examine in future maybe
[X] TODO: test operation with NO EXISTING TAG DATA
[X] TODO: add loading of existing files
[X] TODO: test what happens when selecting empty dir, and what happens when switching to emptyDir - works fine
[X] TODO: wrap logging in a debugger method, add a debug toggle