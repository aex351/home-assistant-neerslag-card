[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)

# Neerslag Card
 > Recommendation: Use the `Neerslag App` or migrate from the `Neerslag Card` to the `Neerslag App` (all-one-package: sensors + card). The Neerslag App is part of the default HACS repository.

 Display rain forecast using Buienalarm and/or Buienradar sensor data.

 The graph will auto-scale (auto-zoom) depending on the amount of  rain. You can interact with the graph to see how much rain will fall on a specific moment. This card is fully functional on both  mobile as well as desktop.


## Features
* Display Buienalarm and/or Buienradar in one graph;
* Fully functional on both desktop and mobile (includes mobile app);
* Graph will auto zoom depending on the amount of rain;
* Customizing the card title;
* Hover with mouse / finger to read details of rain;
* Dutch / English language;
* Use Home Assistant configured location.

![Example](https://github.com/aex351/home-assistant-neerslag-card/raw/main/documentation/example.png)

## Installation overview
The Neerslag card installation consists out of three actions:
1) Install via HACS or manual;
2) Configuring the Buienalarm and/or Buienradar custom sensor via `configuration.yaml`
3) Adding the the Neerslag Card to your dashboard

> Note: Home Assistant requires a restart after making changes in: `configuration.yaml`.

## 1a. Install via HACS (recommended)
This is the recommended option and also allows for easy updates.
1) Find this repository in HACS;
2) Add the Neerslag Card in the Home Assistant Community Store as front-end plugin.

For updates go to the Community Store (HACS) and click update

## 1b. Manual install (with HACS installed)
Not recommended, you will need to track updates manually by browsing to the repository;
1) Download the latest release of the Neerslag Card from this repository;
2) In Home Assistant, create the folder `config/www/community` if it does not exist;
3) Add the Neerslag Card to the `community` folder. (i.e. `community/neerslag-card/`);
4) Add the Neerslag Card as a resource in Home Assistant (config/lovelace/resources);
5) Using the following details as resource: `/hacsfiles/neerslag-card/neerslag-card.js` as Javascript module.

For updates: repeat step 1 to 3. Home Assistant will not delete any settings.
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
    value_template: 'last_changed: {{states.sensor.neerslag_buienalarm_regen_data.last_changed | default(now())}}'
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
    value_template: 'last_changed: {{states.sensor.neerslag_buienradar_regen_data.last_changed | default(now())}}'
    scan_interval: 240
```
 * Replace `<lat-2-decimals>` with your latitude. For example: `55.00`
 * Replace `<lon-2-decimals>` with your longitude. For example: `5.00`
 > Attention: delete the `<>` characters. 

 ### Advanced sensor configuration
 Instead of manual configuring the latitude and longitude. There is an option to use the latitude and longitude that has been configured in Home Assistant.

 #### Buienalarm sensor configuration
 * Replace `<lat-3-decimals>` with your latitude. For example: `{{state_attr("zone.home", "latitude") | round(3, default="not available")}}`
 * Replace `<lon-3-decimals>` with your longitude. For example: `{{state_attr("zone.home", "longitude") | round(3, default="not available")}}`
 > Attention: delete the `<>` characters. 
 #### Buienradar sensor configuration
 * Replace `<lat-2-decimals>` with your latitude. For example: `{{state_attr("zone.home", "latitude") | round(2, default="not available")}}`
 * Replace `<lon-2-decimals>` with your longitude. For example: `{{state_attr("zone.home", "longitude") | round(2, default="not available")}}`
 > Attention: delete the `<>` characters.

 ## 3. Adding the Neerslag Card to your dashboard
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

### Advanced configuration options:
Enable auto zoom to have the graph dynamically zoom in or out depending on the amount of rainfall. 

Note: By default auto zoom is disabled. Which gives the graph a fixed starting position displaying low, medium and heavy rainfall. Auto zoom will continue on extreme rainfall. Before version 2022.07.07.1 this setting was set to true.

```yaml
autozoom: false
```