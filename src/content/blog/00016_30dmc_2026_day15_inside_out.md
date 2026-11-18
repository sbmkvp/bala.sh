---
title: "#30DayMapChallenge Day 15: Inside out"
author: Bala Soundararaj
pubDatetime: 2026-11-15T09:00:00+11:00
postSlug: 30daymapchallenge-2026-day-15-inside-out
tags:
  - 30DayMapChallenge
  - MapAI
  - Maps
description: "Day 15 of the 2026 #30DayMapChallenge. Theme: Inside out. 244,165 addresses in the City of Sydney checked against the suburb they sit in, and the 282 that say they are somewhere else, mapped in MapAI."
---

Day 15 of the [#30DayMapChallenge](https://30daymapchallenge.com/2026/) 2026.

> **Inside out** — Inside out, upside down. Something on this map is not quite right.

Every address in Australia carries a suburb name.
Every suburb also has a boundary on a map.
Most of the time the two agree: an address that says "Glebe" sits inside the Glebe polygon.

But not always.
For Day 15 I went looking for the addresses that are **not quite right**: points that sit inside one suburb while their address says they belong to another.
They are inside out, in the most literal way a map can manage.

It also follows on from [yesterday](/posts/30daymapchallenge-2026-day-14-borgesian-map/), where MapAI's Rosebery address layer kept only points labelled `ROSEBERY`.
Any address inside Rosebery but labelled with a neighbouring suburb was quietly dropped.
So how many addresses does that kind of filter miss?

![MapAI showing the City of Sydney on a dark basemap with thin suburb boundaries and 282 yellow and orange dots, clustered along suburb boundary roads in Glebe and Forest Lodge, The Rocks and Dawes Point, Beaconsfield and Alexandria, with a results panel listing the mismatch counts, distance bands, top suburb pairs and most extreme mismatches](/images/30daymapchallenge/2026/day15_inside_out_wrong_suburb_addresses.webp)

## The prompt

> Inside out: addresses in the wrong suburb, City of Sydney LGA.
>
> 1. Select every G-NAF address in the City of Sydney LGA.
> 2. Spatially join each address point to the suburb (locality) polygon it falls inside.
> 3. Compare the address's own locality name with the name of the suburb polygon it sits in. Normalise case, spacing and abbreviations (e.g. "St" vs "Saint") before comparing.
> 4. For each mismatched address, calculate the distance in metres to the boundary of the suburb named in its address.
>
> Output 2 layers on a dark basemap:
>
> 1. Suburb boundaries as thin grey lines with suburb labels.
> 2. Mismatched addresses as points, coloured by distance to their named suburb: yellow under 20 m, orange 20–100 m, red over 100 m.
>
> Tooltips: full address, address locality, suburb it sits in, distance to named suburb (m).
>
> Tell me:
>
> - total addresses checked and the number and share that mismatch
> - a breakdown by distance band
> - the top 10 suburb pairs (address says X, point sits in Y) by count
> - the 5 most extreme mismatches (furthest from their named suburb)
> - likely reasons for mismatches (boundary changes, geocoding precision, building-level points on boundary roads), and your assumptions

## What MapAI found

**244,165 addresses checked. 282 mismatches. That's 0.12%.**

| Distance to the named suburb | Addresses | Share of mismatches |
| ---------------------------- | --------- | ------------------- |
| Under 20 m                   | 186       | 66.0%               |
| 20–100 m                     | 96        | 34.0%               |
| Over 100 m                   | 0         | 0%                  |

No address is more than 100 metres from the suburb it names.
So there is no red on the map at all.

The top suburb pairs, where the address says one suburb and the point sits in another:

| Address says | Point sits in | Addresses |
| ------------ | ------------- | --------- |
| Forest Lodge | Glebe         | 37        |
| Glebe        | Forest Lodge  | 36        |
| The Rocks    | Dawes Point   | 25        |
| Beaconsfield | Alexandria    | 24        |
| Surry Hills  | Redfern       | 15        |
| Chippendale  | Ultimo        | 14        |
| Kensington   | Moore Park    | 14        |
| Alexandria   | Zetland       | 12        |
| Sydney       | The Rocks     | 12        |
| Alexandria   | Erskineville  | 8         |

And the five furthest from home:

1. **10–18 William Street, Beaconsfield**: 64.8 m from Beaconsfield.
2. **100 Murray Street, Pyrmont**: 38.0 m from Pyrmont.
3. **53A Ross Street, Forest Lodge**: 35.0 m from Forest Lodge.
4. **77 Ross Street, Forest Lodge**: 34.0 m from Forest Lodge.
5. **55 Ross Street, Forest Lodge**: 32.6 m from Forest Lodge.

## What MapAI did

By the numbers, this map took:

- **21 tool calls**
- **About 9 minutes 20 seconds** (562 seconds) from prompt to finished map
- **About 59 credits**

Here is its evidence trail, in its own words where possible.

### How it understood the question

- **Source:** G-NAF address points and national suburb boundaries.
- **Geography:** City of Sydney, read as the official Sydney local government area.
- **Measure:** a mismatch means the normalised address locality differs from the suburb polygon that contains the point.
- **Assumption:** text in brackets was removed, and "St" treated as "Saint", before comparing.
- **Assumption:** where suburb polygons overlap, the smallest one wins.
- **Measure:** distance is the straight line from the address to the named suburb's boundary.

### The workflow

1. Checked the G-NAF and boundary schemas and confirmed the City of Sydney geography.
2. Selected the **244,165** G-NAF points inside the City of Sydney.
3. Assigned every address to the suburb polygon it sits in.
4. Normalised case, punctuation, spacing, bracketed qualifiers and St/Saint.
5. Measured each mismatch's distance to the boundary of its named suburb.
6. Grouped the mismatches into distance bands, and ranked the suburb pairs and extreme cases.
7. Saved the suburb boundary and mismatch layers.

### The data

Two sources: **G-NAF Addresses** for the points, and **Boundaries** for the City of Sydney and its suburbs.

### The SQL

The tricky part of this question isn't the geometry, it's the text.
"St Peters", "Saint Peters" and "ST PETERS (NSW)" are the same place, so MapAI normalised both names the same way before comparing them: lower case, drop anything in brackets, turn punctuation into spaces, and turn a standalone "st" into "saint":

```sql
regexp_replace(
  regexp_replace(
    regexp_replace(
      lower(trim(split_part(coalesce(a.suburb, ''), '(', 1))),
      '[^a-z0-9]+', ' ', 'g'
    ),
    '(^| )st( |$)', '\1saint\2', 'g'
  ),
  ' +', ' ', 'g'
) AS address_norm
```

Then each address takes the smallest suburb polygon that contains it:

```sql
SELECT DISTINCT ON (a.gnaf_id) a.*, s.name AS sitting_suburb
FROM addresses a
LEFT JOIN local_suburbs s
  ON s.geometry && a.geometry
 AND ST_Covers (s.geometry, a.geometry)
ORDER BY a.gnaf_id, ST_Area (s.geometry)
```

A mismatch is simply where the two normalised names differ.

### Gaps and uncertainties

MapAI flagged four:

- **The address and boundary datasets may come from different vintages.**
- **Points on or near a boundary are sensitive** to geocoding precision and to exactly where the polygon edge is drawn.
- **Distances are straight lines**, not road distances.
- **The dark basemap is set in the map interface**, not by the layer data.

You can explore the live map here: [15 Inside Out - Wrong Address](https://app.mapai.net/share/aaea751d8a2d4b79b0a6f7700be841c7).

## What I noticed

### 99.88% right

The headline is how few there are.
Out of nearly a quarter of a million addresses, 282 disagree with the map, and none of them by more than 65 metres.
For two datasets maintained by different processes, that is remarkably good.

### Mismatches live on boundary roads

The map shows where they are.
The dots don't scatter across suburbs; they line up along suburb boundaries, in a few tight clusters: Glebe and Forest Lodge, The Rocks and Dawes Point, Beaconsfield and Alexandria.

Glebe and Forest Lodge are the clearest case.
37 Forest Lodge addresses sit in Glebe, and 36 Glebe addresses sit in Forest Lodge.
A near-perfect swap like that doesn't look like random geocoding error.
It looks like the two datasets draw the boundary in slightly different places, so a strip of addresses on each side ends up in the other suburb.
Three of the five most extreme cases are on one street, Ross Street, Forest Lodge.

### Wrong, or just different?

It's tempting to call these 282 addresses "wrong", but that isn't quite fair.
The suburb in an address is what the address authority assigned.
The suburb polygon is a separate boundary dataset, possibly from a different year.
When they disagree, the useful question isn't which one is wrong, but **which one your analysis should trust**.

That matters in practice.
If you count homes "in Glebe" by address name, you get one answer.
If you count them by polygon, you get a slightly different one.
At 0.12% it rarely changes a headline, but at the scale of a single street, or a suburb boundary like Forest Lodge, it can.

### Back to Rosebery

So was yesterday's `suburb = 'ROSEBERY'` filter a problem?
For the City of Sydney as a whole, 0.12% of addresses disagree with their polygon, and Rosebery doesn't appear in the top ten pairs.
So it probably dropped a handful of addresses, not hundreds.
But I only know that because I checked, and checking took one prompt.

Day 15 done. Next up: light and dark.

#30DayMapChallenge #mapai #madewithmapai
