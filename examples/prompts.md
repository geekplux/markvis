# prompts.md

Natural language → markvis fence. Thirty pairs for `scripts/eval-prompts`.

## 1. Bar of monthly revenue

```chart
markvis: 2
type: bar
title: Q3 Revenue
unit: USD k
x: month
y: revenue

month,revenue
Jan,120
Feb,180
Mar,150
```

## 2. Line chart of free vs pro users

```chart
type: line
title: Users
x: month
y: count
series: plan

month,plan,count
Jan,free,40
Jan,pro,12
Feb,free,55
Feb,pro,18
```

## 3. Area chart of weekly deals using vis tag

```vis
type: area
title: Pipeline
x: week
y: deals

week,deals
1,8
2,11
3,9
```

## 4. Scatter height vs weight

```chart
type: scatter
title: Height vs weight
x: height_cm
y: weight_kg

height_cm,weight_kg
160,55
175,70
182,78
```

## 5. Pie of shares that do not sum to 100

```markvis
type: pie
title: Share
x: name
y: value

name,value
A,40
B,35
C,30
```

## 6. Histogram of latency samples

```chart
type: hist
title: Latency ms
x: ms

ms
12
15
14
40
42
18
```

## 7. Bar from a markdown table

```chart
type: bar
title: Headcount
x: team
y: n

| team | n |
| --- | --- |
| Eng | 24 |
| Design | 6 |
| Ops | 9 |
```

## 8. Progressive comment then table for Q3 revenue

<!-- chart: bar x=month y=revenue title="Q3 Revenue" -->
| month | revenue |
| --- | --- |
| Jan | 120 |
| Feb | 180 |
| Mar | 150 |

## 9. Bar with twelve categories

```chart
type: bar
title: Tickets by queue
x: queue
y: n

queue,n
A,3
B,5
C,2
D,8
E,1
F,4
G,6
H,2
I,7
J,3
K,5
L,4
```

## 10. Unicode city labels on a bar chart

```chart
type: bar
title: Visits
x: city
y: n

city,n
北京,120
東京,95
서울,80
```

## 11. Line without a title

```chart
type: line
x: day
y: signups

day,signups
Mon,10
Tue,14
Wed,9
```

## 12. Bar with zeros and a large number

```chart
type: bar
title: Bytes
x: shard
y: bytes

shard,bytes
a,0
b,0
c,1500000000
```

## 13. Line that keeps out-of-order months

```chart
type: line
title: Sales
x: month
y: n

month,n
Mar,10
Jan,7
Feb,9
```

## 14. Pie summing to 105

```chart
type: pie
title: Mix
x: name
y: value

name,value
x,50
y,30
z,25
```

## 15. Area chart tagged markvis

```markvis
type: area
title: Stock
x: week
y: units

week,units
1,20
2,22
3,19
```

## 16. Scatter tagged vis

```vis
type: scatter
title: Speed vs mpg
x: mph
y: mpg

mph,mpg
30,40
50,32
70,25
```

## 17. Bar with long category labels

```chart
type: bar
title: NPS buckets
x: label
y: n

label,n
"Very satisfied customers",40
"Somewhat satisfied",25
"Neutral responses",10
```

## 18. Multi-series line by region

```chart
type: line
title: Revenue
x: month
y: usd
series: region

month,region,usd
Jan,east,10
Jan,west,8
Feb,east,12
Feb,west,9
```

## 19. Hist of response times

```chart
type: hist
title: RTT
x: ms

ms
5
6
5
20
22
7
```

## 20. Show me a simple bar of fruit counts

```chart
type: bar
title: Fruit
x: name
y: n

name,n
apple,4
pear,2
kiwi,5
```

## 21. Chart bookings over three months as a line

```chart
type: line
title: Bookings
x: month
y: n

month,n
Jan,11
Feb,15
Mar,13
```

## 22. Area for cumulative signups

```chart
type: area
title: Signups
x: week
y: total

week,total
1,100
2,180
3,250
```

## 23. Scatter plot of price vs rating

```chart
type: scatter
title: Price vs rating
x: price
y: rating

price,rating
10,3.2
20,4.1
35,4.5
```

## 24. Pie of browser share

```chart
type: pie
title: Browsers
x: name
y: pct

name,pct
Chrome,55
Safari,25
Other,20
```

## 25. Histogram of ages

```chart
type: hist
title: Age
x: years

years
22
23
25
40
41
22
```

## 26. Bar using language tag markvis

```markvis
type: bar
title: Deploys
x: day
y: n

day,n
Mon,3
Tue,5
Wed,2
```

## 27. Vis-tagged line of errors

```vis
type: line
title: Errors
x: hour
y: n

hour,n
0,1
1,0
2,4
```

## 28. GFM table bar of office sizes

```chart
type: bar
title: Seats
x: office
y: seats

| office | seats |
| --- | --- |
| SF | 40 |
| NYC | 55 |
| LON | 30 |
```

## 29. Comment form bar of bugs closed

<!-- chart: bar x=week y=closed title="Bugs closed" -->
| week | closed |
| --- | --- |
| 1 | 12 |
| 2 | 9 |
| 3 | 15 |

## 30. Grouped bar via series column

```chart
type: bar
title: Plan mix
x: month
y: n
series: plan

month,plan,n
Jan,free,40
Jan,pro,12
Feb,free,44
Feb,pro,15
```

