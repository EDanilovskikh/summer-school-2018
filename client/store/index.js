import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import { api, apiKey} from '../../config.json'

Vue.use(Vuex);

const state = {
    currentCity: {
        temperature: '',
        name: '',
        description: '',
        imgUrl: '',
        forecast: []
    },
    favouriteCityList: [ // Mock
    ]
};

const getters = {
    favouriteCityList: (state) => {
        return state.favouriteCityList.map((city, index) => {
            if (!city.temperature) {
                store.dispatch('getWeatherForCityList', {index, city: city.name});
            }
            return city;
        });
    }
};

const mutations = {
    setWeather (state, data) {
        const {temp_c, condition} = data.current;

        state.currentCity = {
            ... state.currentCity,
            temperature: temp_c,
            description: condition.text,
            imgUrl: condition.icon,
        };
    },
    setCity (state, cityName) {
        state.currentCity.name = cityName;
    },
    setNotFound (state) {
        state.currentCity = {
            temperature: '',
            name: null,
            description: '',
            imgUrl: ''
        };
    },
    addToFavourite (state, {cityName, weather}) {
        const newCity = {
            name: cityName,
            temperature: weather.current.temp_c,
            conditionText: weather.current.condition.text,
            icon_url: weather.current.condition.icon
        };
        state.favouriteCityList.push(newCity);

        axios.post('http://localhost:3000/cities', newCity);
    },
    removeFromFavourite (state, cityToRemove) {
        const index = state.favouriteCityList
            .findIndex(city => cityToRemove.id === city.id);
        state.favouriteCityList.splice(index, 1);
        axios.delete('http://localhost:3000/cities/' + cityToRemove.id);
    },
    setWeatherForCityInList (state, {index, weather}) {
        state.favouriteCityList[index].conditionText = weather.current.condition.text;
        state.favouriteCityList[index].temperature = weather.current.temp_c;
        state.favouriteCityList[index].icon_url = weather.current.condition.icon;
    },
    forecastLoaded (state, data) {
        const {temp_c, condition} = data.current;

        state.currentCity = {
            ... state.currentCity,
            temperature: temp_c,
            description: condition.text,
            imgUrl: condition.icon,
        };

        state.currentCity.forecast = data.forecast.forecastday;
    },
    setCities (state, list) {
        state.favouriteCityList = list
    }
};

const actions = {
    getWeather ({commit}) {
        api.current(state.currentCity.name, (res) => {
            commit('setWeather', res.data);
        }, () => commit('setNotFound'));
    },

    searchCity ({state}, value) {
        return new Promise((resolve, reject) => {
            api.search(value, resolve, reject);
        });
    },

    getFavList ({commit}) {
        axios.get(`http://localhost:3000/cities`)
            .then((res) => {
                commit('setCities', res.data);
            })
            .catch(() => commit('setNotFound'));
    },

    getWeatherForCityList ({commit}, {index, city}) {
        api.current(city, (res) => {
            commit('setWeatherForCityInList', {index, weather: res.data});
        }, null);
    },

    addToFavourite ({commit}, city) {
        api.current(city, (res) => {
            commit('addToFavourite', {cityName: city, weather: res.data});
        }, null);
    },

    loadForecast ({commit}) {
        api.forecast(state.currentCity.name, (res) => {
            commit('forecastLoaded', res.data);
        }, null);
    }

};

const api = {
    current: (cityName, resolve, reject) => {
        axios
            .get(`${api}?key=${apiKey}&q=${cityName}`)
            .then(resolve)
            .catch(reject);
    },
    search: (searchString, resolve, reject) => {
        axios
            .get(`${api}?key=${apiKey}&q=${searchString}`)
            .then(res => resolve(res.data))
            .catch(() => reject());
    },
    forecast: (cityName, resolve, reject) => {
        axios
            .get(`${api}?key=${apiKey}&q=${cityName}&days=5`)
            .then(resolve)
            .catch(reject)
    }
};

const store = new Vuex.Store({
    state,
    getters,
    mutations,
    actions
});

export default store
