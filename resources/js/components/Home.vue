<template>
    <v-card>
        <v-card-title style="background-color:#B2DFDB">Home</v-card-title>
        <v-card-text>
                <v-btn color="success" @click="getAreaInfo">getAreaInfo</v-btn>
            <v-container>
                <p>latitude: {{latitude}}</p>
                <p>longitude: {{longitude}}</p>
                <v-divider></v-divider>
                <v-card v-for="(result, i) in results" :key="i" class="my-2">
                    <p>{{result.fsq_id}}</p>
                    <p>{{result.categories}}</p>
                </v-card>
            </v-container>
            <v-divider></v-divider>
            <v-container >
                <v-btn @click="getWeatherData">getWeatherData</v-btn>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    data(){
        return {
            Area: null,
            context: null,
            results: null,
            latitude: 34.69374,
            longitude: 135.50218,
            options: {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                }
            },
        }
    },

    methods: {
        getAreaInfo(){
                const customOptions = {...this.options}
                customOptions.headers.Authorization = ' fsq3kq2va8mH5Gjs51C0yOlLXfTI8/xgmppDy7jNuHKg3Xs='

                fetch('https://api.foursquare.com/v3/places/search?near=Osaka%2C%20JP', customOptions)
                .then(response => response.json())
                .then(({context, results}) => {
                    this.context = context;
                    this.results = results
                    this.latitude = context.geo_bounds.circle.center.latitude
                    this.longitude = context.geo_bounds.circle.center.longitude
                })
                .catch(err => console.error(err));
        },

        getWeatherData(){
            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                }
            };

            fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${this.latitude}&lon=${this.longitude}&appid=8e23e67b2f2928085f70c24a19440492`, options)
            .then(response => response.json())
            .then((response) => {
                console.log(response)
            })
            .catch(err => console.error(err));
        }

            
    }
}
</script>