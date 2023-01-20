<template>
    <v-container fluid>
        <v-overlay :value="overlay">
            <v-progress-circular
                indeterminate
                size="64"
            ></v-progress-circular>
        </v-overlay>
        <v-autocomplete
            v-model="location"
            filled
            label="Location in Japan"
            append-icon="mdi-crosshairs"
            dense
            @change="toggleLocationApi"
            :items="cities"
            item-value="city"
            :item-text="(item) => `${item.city} ( ${item.admin_name} )`"
        ></v-autocomplete>

        <v-row>
            <v-col cols="6" class="text-left">
                <p class="overline">Time : {{currentTime}} </p>
                <p class="overline">Sunrise: {{ cityInfo ?  getConvertedUnixDateTime(cityInfo.sunrise) : '' }}  </p>
                <p class="overline">Sunset: {{ cityInfo ?  getConvertedUnixDateTime(cityInfo.sunset) : ''}} </p>
            </v-col>
            <v-col cols="6" class="text-right">
                <p class="overline">City : {{cityInfo ? cityInfo.name : ''}} </p>
            </v-col>
        </v-row>

        <v-container>
            <v-list>
                <v-list-group
                    v-for="(result, i) in weatherResults"
                    :key="i"
                    no-action
                    active-class="pink--text"
                >
                    <template v-slot:activator>
                        <v-list-item-icon>
                            <v-icon size="65">{{ result.sys.pod == 'd' ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
                        </v-list-item-icon>


                        <v-list-item-content>
                        <span class="overline mx-2 font-weight-bold text-md-body-1 text-xl-h3 text-lg-h3" v-text="getConvertedUnixDateTime(result.dt)"></span>
                        <span class="overline mx-2 font-weight-bold" v-text="`${Math.round(result.main.temp)} \xB0C | ${convertTempToFahr(result.main.temp)} \xB0F`"></span>
                            <!-- <div >
                                <span class="text-left">
                                    <v-chip
                                        v-for="(info, ii) in result.weather" :key="ii+'A'"
                                        class="ma-2"
                                        small
                                        v-text="`${info.main} - ${info.description}`"
                                        >
                                    </v-chip>
                                </span>
                                <span class="text-right">
                                    <v-icon size="30">mdi-water</v-icon>
                                    <span class="overline font-weight-bold" v-text="getPercentage( result.pop )+'%'"></span>
                                </span>
                            </div> -->
                        </v-list-item-content>
                    </template>

                    <v-list-item>
                    <v-list-item-content>
                        <v-list-item-subtitle class="overline font-weight-bold" v-text="`Humidity: ${result.main.humidity} %`"></v-list-item-subtitle>
                        <v-list-item-subtitle class="overline font-weight-bold" v-text="`Wind: ${result.wind.speed} m/s`"></v-list-item-subtitle>
                        <v-list-item-subtitle class="overline font-weight-bold" v-text="`Visibility : ${result.visibility / 1000} km`"></v-list-item-subtitle>
                        <v-list-item-subtitle class="overline font-weight-bold" v-text="`Cloudiness: ${result.clouds.all} %`"></v-list-item-subtitle>
                    </v-list-item-content>
                    </v-list-item>
                </v-list-group>
            </v-list>
        </v-container>

        <div>
            <v-row no-gutters>
                <v-col v-for="(result, i) in results" :key="i" cols="12" sm="6" xs="12" md="4" lg="4" xl="4">
                    <v-card  max-width="600" class="mb-5 mx-2">
                        <template slot="progress">
                            <v-progress-linear
                                color="deep-purple"
                                height="10"
                                indeterminate
                            ></v-progress-linear>
                        </template>

                        <v-img
                            height="75"
                            src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
                        ></v-img>

                        <v-card-title>
                            <span class="overline">{{ result.name }}</span>
                        </v-card-title>

                        <v-card-text>
                            <v-row
                                align="center"
                                class="mx-0"
                            >
                                <v-rating
                                :value="4.5"
                                color="amber"
                                dense
                                half-increments
                                readonly
                                size="14"
                                ></v-rating>

                                <div class="grey--text ms-4">
                                4.5 (413)
                                </div>
                            </v-row>
                            <div class="my-4 text-subtitle-1">
                                $ • {{result.formatted_address}}
                            </div>

                            <div>Small plates, salads & sandwiches - an intimate setting with 12 indoor seats plus patio seating.</div>
                        </v-card-text>

                        <v-divider></v-divider>

                        <v-card-title>Categories</v-card-title>

                        <v-card-text>
                            <v-chip-group
                                active-class="deep-purple accent-4 white--text"
                                row
                                column
                            >
                                <v-chip x-small v-for="(category, ii) in result.categories" :key="category + ii">
                                    {{ category.name }}
                                </v-chip>
                            </v-chip-group>
                        </v-card-text>

                        <v-card-actions>
                           
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </div>

    </v-container>
</template>

<script>
import { foursquare, openWeather } from './api-responses.js' //sample
import japanCities from './jp.json' //sample
export default {
    data(){
        return {
            location: null,
            timeout: null,
            overlay: false,
            context: null,
            results: null,
            latitude: null,
            longitude: null,
            options: {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                }
            },
            cities: japanCities,
            currentTime: null,
            cityInfo: null,
            weatherResults: null,
            selectedWeatherDate: null,
            chunkedData: [],
                   
        }
    },

    methods: {
        toggleLocationApi(){
            const timeOut = 1000
            clearTimeout(this.timeout)
            this.timeout = setTimeout(() => {
                
                this.context = foursquare.context
                this.results = foursquare.results
                // console.log('this.results', this.results)

                this.cityInfo = {...openWeather.city}
                this.weatherResults = [...openWeather.list]
                console.log('this.cityInfo', this.cityInfo)
                console.log('this.weatherResults', this.weatherResults)
        
                // console.log(test)
                this.chunkedData.splice(0)
                this.weatherResults.forEach(el => {
                    if(this.chunkedData.map(res => res.date).includes(this.covertByDate(el.dt))){
                        const index = this.chunkedData.map(res => res.date).indexOf(this.covertByDate(el.dt));
                        this.chunkedData[index].data.push(el)
                    }else{
                        this.chunkedData.push({
                            date: this.covertByDate(el.dt),
                            data: [el]
                        })
                    }
                });

                console.log('this.chunkedData', this.chunkedData)

                this.getTimezoneTime(this.cityInfo.timezone)
            }, timeOut);
        },

        locationApi(){
            const customOptions = {...this.options}
            customOptions.headers.Authorization = 'fsq3kq2va8mH5Gjs51C0yOlLXfTI8/xgmppDy7jNuHKg3Xs='
            // https://api.openweathermap.org/data/2.5/forecast?lat=34.6937&lon=135.5022&appid=8e23e67b2f2928085f70c24a19440492&units=imperial
            fetch(`https://api.foursquare.com/v3/places/search?near=${this.location}%2C%20JP`, customOptions)
            .then(response => response.json())
            .then(({context, results}) => {
                this.context = context;
                this.results = results
                this.latitude = context.geo_bounds.circle.center.latitude
                this.longitude = context.geo_bounds.circle.center.longitude
            })
            .catch(err => console.error(err));
        },

        getTimezoneTime(timezone){
            let offset = timezone * 1000; // offset in milliseconds
            let date = new Date();
            let localTime = date.getTime();
            let localOffset = date.getTimezoneOffset() * 60000;
            let utc = localTime + localOffset;
            let targetTime = new Date(utc + offset);
            let options = {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
                hour: 'numeric',
                minute: 'numeric',
                weekday: 'long',
                hour12: true
            };
            let formattedDate = targetTime.toLocaleString("en-US", options);
            console.log(formattedDate);
            this.currentTime = formattedDate
        },

        getConvertedUnixDateTime(unixDate){
            let offset = this.cityInfo.timezone * 1000; // offset in milliseconds
            let date = new Date(unixDate * 1000);
            let localTime = date.getTime();
            let localOffset = date.getTimezoneOffset() * 60000;
            let utc = localTime + localOffset;
            let targetTime = new Date(utc + offset);
            let options = {
                hour: 'numeric',
                hour12: true
            };

            // let options = {
            //     month: '2-digit',
            //     day: '2-digit',
            //     year: '2-digit',
            //     hour: 'numeric',
            //     minute: 'numeric',
            //     weekday: 'long',
            //     hour12: true
            // };

            return targetTime.toLocaleString("en-US", options);
        },

        getConvertedUnixDate(unixDate){
            let offset = this.cityInfo.timezone * 1000; // offset in milliseconds
            let date = new Date(unixDate * 1000);
            let localTime = date.getTime();
            let localOffset = date.getTimezoneOffset() * 60000;
            let utc = localTime + localOffset;
            let targetTime = new Date(utc + offset);
            let options = {
                dateStyle: 'long',
            };

            return targetTime.toLocaleString("en-US", options);
        },

        covertByDate(unixDate){
            let offset = this.cityInfo.timezone * 1000; // offset in milliseconds
            let date = new Date(unixDate * 1000);
            let localTime = date.getTime();
            let localOffset = date.getTimezoneOffset() * 60000;
            let utc = localTime + localOffset;
            let targetTime = new Date(utc + offset);
            let options = {
                dateStyle: 'short',
            };

            return targetTime.toLocaleString("en-US", options);
        },

        convertTempToFahr(tempInCelcius){
            return Math.round(eval((tempInCelcius * 9/5) + 32))
        },

        getPercentage(pop){
            return eval(pop * 100);
        }



    }
}
</script>