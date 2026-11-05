---
title: "#30DayMapChallenge Day 5: Senses: Sight"
author: Bala Soundararaj
pubDatetime: 2026-11-05T09:00:00+11:00
postSlug: 30daymapchallenge-2026-day-05-senses-sight
tags:
  - 30DayMapChallenge
  - MapAI
  - Maps
description: "Day 5 of the 2026 #30DayMapChallenge. Theme: Senses: Sight. Which lots in Darlinghurst and Woolloomooloo could see the Sydney Opera House if everything were built to its height limit? A planning-control viewshed in MapAI."
---

Day 5 of the [#30DayMapChallenge](https://30daymapchallenge.com/2026/) 2026.

> **Senses: Sight** — How do you see something? Maybe map a viewshed?

A viewshed answers a simple question: what can you see from here?
For Sydney there is only one view that really matters, so for Day 5 I asked [MapAI](https://mapai.net): **which lots in Darlinghurst and Woolloomooloo could see the Opera House?**

![MapAI showing lots in Darlinghurst and Woolloomooloo, with lots that can see the Opera House in gold, lots that cannot in grey, and hundreds of thin gold sight lines fanning out from the gold lots across the Domain and Woolloomooloo Bay to the Opera House at Bennelong Point](/images/30daymapchallenge/2026/day05_sight_opera_house_views.webp)

## Getting there

This one took a few attempts.
A true viewshed needs building heights or terrain, and neither is available for Sydney in the data I have been using.
My first idea, a 3D test with Overture building heights across 3 km, did not work, and neither did a 2 km version.

So I changed the question.
Instead of today's buildings, I used **planning controls**: the maximum building height allowed on every lot under the Sydney Local Environmental Plan (LEP).
The question becomes: **if every lot were built to its height limit, which ones could still see the Opera House?**
That is arguably the more interesting question anyway, because it shows which views the planning rules protect.

I also shrank the area to two suburbs, Darlinghurst and Woolloomooloo, and split the request into three turns: lots and heights, then sight lines, then the map.

## The rules

- **Viewers:** every lot in Darlinghurst and Woolloomooloo, viewing from the middle of the lot at its maximum allowed height.
- **Target:** the top of the Opera House's highest sail, 67 metres above the ground.
- **Blockers:** every lot in the corridor between the two suburbs and the Opera House. A lot blocks a view if the sight line crosses it and its height limit is equal to or taller than the sight line at that point.
- **Not blockers:** water, and land with no height control, such as the Domain and the Royal Botanic Garden.
- **Ground:** flat. Real views from the Darlinghurst ridge will be better than this.

## What MapAI found

**4,318 lots can see the Opera House.**

| Suburb        | Lots with a view | All lots | Share |
| ------------- | ---------------- | -------- | ----- |
| Darlinghurst  | 1,918            | 9,347    | 20.5% |
| Woolloomooloo | 2,400            | 3,627    | 66.2% |

Height limits range from 6 to 150 metres in Darlinghurst, 6 to 80 metres in Woolloomooloo, and 6 to 70 metres in the corridor between them and the Opera House.

The most distant lot with a view is **184–186 Campbell Street, Darlinghurst**, 2,678.5 metres from the Opera House with a height limit of just 15 metres.
Next come the units at **84–90 McLachlan Avenue, Darlinghurst**, 2,642.7 metres away with a 22-metre limit.

## What MapAI did

By the numbers, this map took:

- **58 tool calls**
- **About 26 minutes 50 seconds** (1,610 seconds) from prompt to finished map
- **About 341 credits**

That makes it the biggest run of the challenge so far by a distance, which is no surprise for more than 12,000 sight lines tested against more than 10,000 lots.
Here is its evidence trail, in its own words where possible.

### How it understood the question

- **Source:** the cadastral lots, suburb boundaries, Opera House point and NSW Planning Portal height controls from MapAI's base database.
- **Measure:** the maximum allowed building height, taken from the numeric Height of Buildings (HOB) values in metres.
- **Geography:** viewing lots assigned to Darlinghurst and Woolloomooloo using the suburb polygons; blocking lots selected inside a convex hull around both suburbs and the Opera House.
- **Assumptions:** lots placed by their `ST_PointOnSurface`; a 67-metre target; flat ground, in EPSG:7845 metres; equal-height or taller lots block a sight line at the first crossing point.

### The workflow

1. Checked the cadastral, suburb, planning and amenity schemas.
2. Selected **12,974** viewing lots and **10,906** corridor lots, excluding the Opera House parcels.
3. Matched each lot to the HOB zone covering the largest part of it.
4. Calculated sight lines from each lot to the 67-metre Opera House target.
5. Tested for blockers using the equal-or-taller rule and saved four layers.
6. Ranked the lots with a view by distance, and the blocking lots by the number of views they block.

### The data

All four layers come from MapAI's base database:

- **Properties** for the lots.
- **Boundaries** for the suburbs.
- **Planning Regulations** for the Height of Buildings controls.
- **Amenities** for the Opera House.

### The SQL

MapAI did the whole analysis in a single SQL statement of about 20 steps.
The heart of it is this test.
`t` is how far along the sight line a blocking lot sits, from 0 at the viewer to 1 at the Opera House, so `viewer_height + t * (67 - viewer_height)` is the height of the sight line at that point:

```sql
blocked_hits AS MATERIALIZED (
  SELECT
    *
  FROM
    hits
  WHERE
    t > 0.0001
    AND t < 0.9999
    AND blocker_height >= viewer_height + t * (67 - viewer_height)
)
```

If any lot along the line is at least as tall as the line itself, the view is blocked.

### Gaps and uncertainties

MapAI flagged five:

- **972 lots had no numeric height control** (333 in Darlinghurst and 639 in Woolloomooloo), so they could not be tested as viewers.
- **Water and lots with no numeric height control were not treated as blockers.**
- **Strata lots share a footprint.** Repeated strata footprints were collapsed for the blocking calculation, and the result copied back to each lot.
- **The sight-line layer uses an approximation** for where a line enters a blocking lot, to make the geometry export work. The view results themselves use the full polygon intersections.
- **The planning data had no separate LEP identifier**, so its maximum height layer was read as the Sydney LEP 2012 Height of Buildings control.

You can explore the live map here: [05 Sight - Opera House Views](https://app.mapai.net/share/9c2a9a36a07c4adaa3df7953e7324e0a).

## What I noticed

Woolloomooloo wins easily: two in every three lots get a view, against one in five in Darlinghurst.
That makes sense once you see the sight lines.
They fan out across Woolloomooloo Bay and the Domain, and with no height control on the parkland, there is nothing in the way.

The most distant view is the surprise.
A lot on Campbell Street with a 15-metre height limit can see the Opera House from more than two and a half kilometres away.
That is not a tall building looking over everything; it is a gap in the skyline that the planning rules happen to keep open.

Darlinghurst is the opposite story.
Most of the suburb is grey: from the lower and southern streets, the sight line has to pass over the taller height limits closer to the city, and it rarely clears them.

A few caveats are worth repeating.
This is a map of views **under the planning rules**, not of today's actual views: some lots are built well below their limit, and some older buildings are above it.
The ground is flat, which undersells the Darlinghurst ridge.
And "lots" here includes every strata unit, so one apartment block can count as dozens of lots with a view.

Still, it is the first proper viewshed of the challenge, made from nothing but lots, height controls and a bit of geometry.

Day 5 done. Tomorrow: vintage.

#30DayMapChallenge #mapai #madewithmapai
