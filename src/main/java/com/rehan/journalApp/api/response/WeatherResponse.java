package com.rehan.journalApp.api.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class WeatherResponse{
    private Location location;
    private Current current;

    public Current getCurrent() {
        return current;
    }

    public void setCurrent(Current current) {
        this.current = current;
    }

    public class AirQuality{
        private double co;
        private double no2;
        private int o3;
        private double so2;
        @JsonProperty("pm2_5")
        private double pm25;
        private double pm10;
        @JsonProperty("us-epa-index")
        private int us_epa_index;
        @JsonProperty("gb-defra-index")
        private int gb_defra_index;
    }

    public class Condition{
        private String text;
        private String icon;
        private int code;
    }

    public class Current{
        @JsonProperty("last_updated_epoch")
        private int lastUpdatedEpoch;

        @JsonProperty("last_updated")
        private String lastUpdated;

        @JsonProperty("temp_c")
        private double tempC;

        @JsonProperty("temp_f")
        private double tempF;

        @JsonProperty("is_day")
        private int isDay;

        private Condition condition;

        @JsonProperty("wind_mph")
        private double windMph;

        @JsonProperty("wind_kph")
        private double windKph;

        @JsonProperty("wind_degree")
        private int windDegree;

        @JsonProperty("wind_dir")
        private String windDir;

        @JsonProperty("pressure_mb")
        private int pressureMb;

        @JsonProperty("pressure_in")
        private double pressureIn;

        @JsonProperty("precip_mm")
        private int precipMm;

        @JsonProperty("precip_in")
        private int precipIn;

        private int humidity;
        private int cloud;

        @JsonProperty("feelslike_c")
        private int feelslikeC;

        @JsonProperty("feelslike_f")
        private double feelslikeF;

        @JsonProperty("windchill_c")
        private double windchillC;

        @JsonProperty("windchill_f")
        private double windchillF;

        @JsonProperty("heatindex_c")
        private int heatindexC;

        @JsonProperty("heatindex_f")
        private double heatindexF;

        @JsonProperty("dewpoint_c")
        private double dewpointC;

        @JsonProperty("dewpoint_f")
        private int dewpointF;

        @JsonProperty("vis_km")
        private int visKm;

        @JsonProperty("vis_miles")
        private int visMiles;

        private int uv;

        @JsonProperty("gust_mph")
        private double gustMph;

        @JsonProperty("gust_kph")
        private double gustKph;

        @JsonProperty("air_quality")
        private AirQuality airQuality;

        @JsonProperty("short_rad")
        private int shortRad;

        @JsonProperty("diff_rad")
        private int diffRad;

        private int dni;
        private int gti;

        public int getFeelslikeC() {
            return feelslikeC;
        }

        public void setFeelslikeC(int feelslikeC) {
            this.feelslikeC = feelslikeC;
        }
    }

    public class Location{
        private String name;
        private String region;
        private String country;
        private double lat;
        private double lon;

        @JsonProperty("tz_id")
        private String tzId;

        @JsonProperty("localtime_epoch")
        private int localtimeEpoch;

        private String localtime;
    }

}

