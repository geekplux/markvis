<!-- intent: E_UNKNOWN_FIELD: gauge min must be less than max -->

```chart
type: gauge
min: 100
max: 10
title: Bad range
x: station
y: uptime

station,uptime
Five Points,99.4
```
