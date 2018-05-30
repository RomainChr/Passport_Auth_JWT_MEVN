<template>
  <b-row>
    <b-col cols="12">
      <h2 v-if="user">
        Welcome Home {{ user.username }}
        <b-link @click="logout()">(Logout)</b-link>
        <router-link :to="'/profile/'+ user.userId" tag="button" class="btn btn-outline-success">Profile</router-link>
      </h2>
      <!--<ul v-if="errors && errors.length">
        <li v-for="error of errors">
          {{error.message}}
        </li>
      </ul>-->
    </b-col>
  </b-row>
</template>

<script>

  import axios from 'axios'

  export default {
    name: 'Home',
    data () {
      return {
        user: null,
        errors: []
      }
    },
    created () {
      axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken')
      axios.get('http://localhost:3000/api/home')
        .then(response => {
          this.user = response.data.user
        })
        .catch(e => {
          this.errors.push(e)
          if(e.response.status === 401) {
            this.$router.push({
              name: 'Login'
            })
          }
        })
    },
    methods: {
      logout () {
        localStorage.removeItem('jwtToken')
        this.$router.push({
          name: 'Login'
        })
      }
    }
  }
</script>
