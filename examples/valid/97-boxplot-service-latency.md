<!-- intent: Boxplot of request latency per service from raw samples, with an outlier -->

```chart
type: boxplot
title: Search answers fastest but has the longest tail
unit: ms
x: service
y: latency

service,latency
Search,42
Search,38
Search,45
Search,40
Search,39
Search,44
Search,41
Search,120
Checkout,88
Checkout,92
Checkout,85
Checkout,95
Checkout,90
Checkout,99
Profile,61
Profile,58
Profile,70
Profile,66
Profile,63
Profile,74
```
