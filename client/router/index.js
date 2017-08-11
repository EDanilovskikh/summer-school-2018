import Vue from 'vue';
import Router from 'vue-router';
import List from './../views/List';
import Details from './../views/Details';

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: List
        },
        {
            name: 'city',
            path: '/city/:cityName',
            component: Details
        }
    ]
});
