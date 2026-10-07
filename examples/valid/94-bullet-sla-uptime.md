<!-- intent: Bullet of service uptime against SLA on a fixed 99–100 percent scale -->

```chart
type: bullet
title: Payments missed its 99.95% uptime SLA in September
unit: %
x: service
y: uptime
target: sla
min: 99
max: 100

service,uptime,sla
Checkout,99.98,99.95
Payments,99.91,99.95
Search,99.97,99.9
Notifications,99.62,99.5
```
