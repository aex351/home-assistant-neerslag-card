[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs) ![GitHub all releases](https://img.shields.io/github/downloads/aex351/home-assistant-neerslag-card/total)

# Neerslag Card
 Display rain forecast using Buienalarm and/or Buienradar sensor data.

 The graph will auto-scale (auto-zoom) depending on the amount of  rain. You can interact with the graph to see how much rain will fall on a specific moment. This card is fully functional on both  mobile as well as desktop.

**Features**
* Display Buienalarm and/or Buienradar in one graph;
* Fully functional on both desktop and mobile (includes mobile app);
* Customizing the card title;
* The graph contains Dutch language.

![Example](https://github.com/aex351/home-assistant-neerslag-card/raw/main/documentation/example.png)

## Installation overview
The Neerslag card installation consists out of two actions:
1) Configuring the Buienalarm and/or Buienradar sensor (via `configuration.yaml`
2) Adding the the Neerslag Card to your dashboard

> Home Assistant needs to be restarted after making changes to `configuration.yaml`.

## 1. The Neerslag card
Via the interface:
1) Go in to "Configure UI mode" on your dashboard
2) Click on "Add Cards" and find the the "Neerslag card"

### 1.1 Configuration options:

#### Using one sensor:
```yaml
type: 'custom:neerslag-card'
title: Neerslag
entity: sensor.buienalarm_regen_data
```
#### Using two sensors:
```yaml
type: 'custom:neerslag-card'
title: Neerslag
entities:
  - sensor.buienalarm_regen_data
  - sensor.buienradar_regen_data
```

 ## 2. Setup Buienalarm and/or Buienradar custom sensor
 These sensors are custom sensors that need to be configured in `configuration.yaml`.
 
 ### Buienalarm sensor configuration
 To add Buienalarm as custom sensor, add the following to `configuration.yaml`:

```yaml
sensor:
  - platform: command_line
    command: python3 -c "import requests; import json; import random; dataRequest = requests.get('https://cdn-secure.buienalarm.nl/api/3.4/forecast.php?lat=<lat-3-decimals>&lon=<lon-3-decimals>&region=nl&unit=mm%2Fu&c='+str(random.randint(0,999999999999999)) ).text; dataRequest = dataRequest.replace('\r\n',' '); data = '{\"data\":'+dataRequest+'}';    print(data);"
    name: Buienalarm_Regen_Data
    json_attributes:
      - data
    value_template: 'last_changed: {{states.sensor.buienalarm_regen_data.last_changed}}'
    scan_interval: 60
```

 * Replace `<lat-3-decimals>` with your latitude. For example: `55.000`
 * Replace `<lon-3-decimals>` with your longtitude. For example: `5.000`



 ### Buienradar sensor configuration
 To add Buienradar as custom sensor, add the following to `configuration.yaml`:
```yaml
sensor:
  - platform: command_line
    command: python3 -c "import requests; import json; import random; dataRequest = requests.get('https://gpsgadget.buienradar.nl/data/raintext?lat=<lat-2-decimals>&lon=<lon-2-decimals>&c='+str(random.randint(0,999999999999999)) ).text; dataRequest = dataRequest.replace('\r\n',' '); data = '{\"data\":\"'+dataRequest+'\"}';    print(data);"
    name: Buienradar_Regen_Data
    json_attributes:
      - data
    value_template: 'last_changed: {{states.sensor.buienradar_regen_data.last_changed}}'
    scan_interval: 240
```
 * Replace `<lat-2-decimals>` with your latitude. For example: `55.00`
 * Replace `<lon-2-decimals>` with your longtitude. For example: `5.00`

