[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs) ![GitHub all releases](https://img.shields.io/github/downloads/aex351/home-assistant-neerslag-card/total)

# Neerslag Card
 Display rain forecast using BuienAlarm and/or BuienRadar data.

![Example](https://github.com/aex351/home-assistant-neerslag-card/raw/main/documentation/example.png)

## Installation
The Rain Card uses custom sensors for data. The installation consist out of setting up the Rain Card and configuring the sensors.
 1) The Rain Card
 2) The Buienalarm and/or Buienradar sensor (via `configuration.yaml`)
> You will need to restart Home-Assistant after changing `configuration.yaml`.

## 1. The Rain Card
Via the interface:
1) Go in to "Configure UI mode" on your dashboard
2) Click on "Add Cards" and find the the "Rain card"

### 1.1 Configuration options:

#### Using one sensor:
```
type: 'custom:neerslag-card'
title: Neerslag
entity: sensor.buienalarm_regen_data_andere
```
#### Using two sensors:
```
type: 'custom:neerslag-card'
title: Neerslag
entities:
  - sensor.buienalarm_regen_data_andere
  - sensor.buienradar_regen_data
```

 ## 2. Setup Buienalarm and/or Buienradar sensor
 These sensors are custom sensors that need to be configured in `configuration.yaml`.
 
 ## Buienalarm sensor configuration
 To add Buienalarm as custom sensor, add the following to `configuration.yaml`:

```
sensor:
  - platform: command_line
    command: python3 -c "import requests; import json; import random; dataRequest = requests.get('https://cdn-secure.buienalarm.nl/api/3.4/forecast.php?lat=<lat-3-decimals>&lon=<lon-3-decimals>&region=nl&unit=mm%2Fu&c='+str(random.randint(0,999999999999999)) ).text; dataRequest = dataRequest.replace('\r\n',' '); data = '{\"data\":'+dataRequest+'}';    print(data);"
    name: Buienalarm_Regen_Data_Andere
    json_attributes:
      - data
    value_template: 'last_changed: {{states.sensor.buienalarm_regen_data_andere.last_changed}}'
    scan_interval: 60
```

 * Replace `<lat-3-decimals>` with your latitude. For example: `55.000`
 * Replace `<lon-3-decimals>` with your longtitude. For example: `5.000`



 ## Buienradar sensor configuration
 To add Buienradar as custom sensor, add the following to `configuration.yaml`:
```
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

