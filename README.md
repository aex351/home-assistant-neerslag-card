[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)

# Neerslag Card
 Display rain forecast using Buienalarm and/or Buienradar sensor data.

 The graph will auto-scale (auto-zoom) depending on the amount of  rain. You can interact with the graph to see how much rain will fall on a specific moment. This card is fully functional on both  mobile as well as desktop.

## Features
* Display Buienalarm and/or Buienradar in one graph;
* Fully functional on both desktop and mobile (includes mobile app);
* Graph will auto zoom depending on the amount of rain;
* Customizing the card title;
* Hover with mouse / finger to read details of rain;
* Dutch language;
* Use Home Assistant configured location.

![Example](https://github.com/aex351/home-assistant-neerslag-card/raw/main/documentation/example.png)

## Installation overview
The Neerslag card installation consists out of two actions:
1) Adding the the Neerslag Card to your dashboard
2) Configuring the Buienalarm and/or Buienradar custom sensor via `configuration.yaml`

> Note: Home Assistant requires a restart after making changes in: `configuration.yaml`.

## 1. Adding the Neerslag Card to your dashboard
Via the interface:
1) Go in to "Configure UI mode" on your dashboard
2) Click on "Add Cards" and find the "Neerslag card" in the list of cards

### Configuration options:

#### Using one sensor:
```yaml
type: 'custom:neerslag-card'
title: Neerslag
entity: sensor.neerslag_buienalarm_regen_data
```
#### Using two sensors:
```yaml
type: 'custom:neerslag-card'
title: Neerslag
entities:
  - sensor.neerslag_buienalarm_regen_data
  - sensor.neerslag_buienradar_regen_data
```

 ## 2. Setup Buienalarm and/or Buienradar custom sensor
 
 ### Buienalarm sensor configuration
 Add the following to `configuration.yaml`:

```yaml
sensor:
  - platform: command_line
    command: python3 -c "import requests; import json; import random; dataRequest = requests.get('https://cdn-secure.buienalarm.nl/api/3.4/forecast.php?lat=<lat-3-decimals>&lon=<lon-3-decimals>&region=nl&unit=mm%2Fu&c='+str(random.randint(0,999999999999999)) ).text; dataRequest = dataRequest.replace('\r\n',' '); data = '{\"data\":'+dataRequest+'}';    print(data);"
    name: Neerslag_Buienalarm_Regen_Data
    json_attributes:
      - data
    value_template: 'last_changed: {{states.sensor.neerslag_buienalarm_regen_data.last_changed}}'
    scan_interval: 240
```

 * Replace `<lat-3-decimals>` with your latitude. For example: `55.000`
 * Replace `<lon-3-decimals>` with your longitude. For example: `5.000`
 > Attention: delete the `<>` characters. 


 ### Buienradar sensor configuration
 Add the following to `configuration.yaml`:
```yaml
sensor:
  - platform: command_line
    command: python3 -c "import requests; import json; import random; dataRequest = requests.get('https://gpsgadget.buienradar.nl/data/raintext?lat=<lat-2-decimals>&lon=<lon-2-decimals>&c='+str(random.randint(0,999999999999999)) ).text; dataRequest = dataRequest.replace('\r\n',' '); data = '{\"data\":\"'+dataRequest+'\"}';    print(data);"
    name: Neerslag_Buienradar_Regen_Data
    json_attributes:
      - data
    value_template: 'last_changed: {{states.sensor.neerslag_buienradar_regen_data.last_changed}}'
    scan_interval: 240
```
 * Replace `<lat-2-decimals>` with your latitude. For example: `55.00`
 * Replace `<lon-2-decimals>` with your longitude. For example: `5.00`
 > Attention: delete the `<>` characters. 

 ### Advanced sensor configuration
 Instead of manual configuring the latitude and longitude. There is an option to use the latitude and longitude that has been configured in Home Assistant.

 #### Buienalarm sensor configuration
 * Replace `<lat-3-decimals>` with your latitude. For example: `{{state_attr("zone.home", "latitude") | round(3)}}`
 * Replace `<lon-3-decimals>` with your longitude. For example: `{{state_attr("zone.home", "longitude") | round(3)}}`
 > Attention: delete the `<>` characters. 
 #### Buienradar sensor configuration
 * Replace `<lat-2-decimals>` with your latitude. For example: `{{state_attr("zone.home", "latitude") | round(2)}}`
 * Replace `<lon-2-decimals>` with your longitude. For example: `{{state_attr("zone.home", "longitude") | round(2)}}`
 > Attention: delete the `<>` characters.