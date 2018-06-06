<template>
  <b-row class="justify-content-md-center">
    <b-col cols="6">
      <h2>Please Register</h2>
      <!--<div v-if="errors && errors.length">
        <div v-for="error of errors">
          <b-alert show>{{error.message}}</b-alert>
        </div>
      </div>-->
      <div class="alert alert-danger" role="alert" v-if="msgAlert">
        {{ msgAlert }}
      </div>
      <b-form v-on:submit.prevent="registerUser">
        <b-form-group id="fieldsetHorizontal"
                      horizontal
                      :label-cols="4"
                      breakpoint="md"
                      label="Enter Email">
          <b-form-input id="email" type="email" placeholder="email" :state="state" v-model.trim="register.email" required></b-form-input>
        </b-form-group>
        <b-form-group id="fieldsetHorizontal"
                      horizontal
                      :label-cols="4"
                      breakpoint="md"
                      label="Enter Username">
          <b-form-input id="username" placeholder="username" :state="state" v-model.trim="register.username" required></b-form-input>
        </b-form-group>
        <b-form-group id="fieldsetHorizontal"
                      horizontal
                      :label-cols="4"
                      breakpoint="md"
                      label="Enter Password">
          <b-form-input type="password" placeholder="password" id="password" :state="state" v-model.trim="register.password" required></b-form-input>
        </b-form-group>
        <b-form-group id="fieldsetHorizontal"
                      horizontal
                      :label-cols="4"
                      breakpoint="md"
                      label="Enter firstname">
          <b-form-input id="firstname" placeholder="firstname" :state="state" v-model.trim="register.firstname" required></b-form-input>
        </b-form-group>
        <b-form-group id="fieldsetHorizontal"
                      horizontal
                      :label-cols="4"
                      breakpoint="md"
                      label="Enter surname">
          <b-form-input id="surname" placeholder="surname" :state="state" v-model.trim="register.surname" required></b-form-input>
        </b-form-group>

        <b-button type="submit" variant="primary">Register</b-button>
        <b-button type="button" variant="success" @click="$router.go(-1)">Cancel</b-button>
      </b-form>
    </b-col>
  </b-row>
</template>

<script>

  import axios from 'axios'

  export default {
    name: 'Register',
    data () {
      return {
        register: {},
        errors: [],
        msgAlert: null
      }
    },
    watch: {
      // hide alert if field modified
      register: {
        handler () {
          this.msgAlert = null
        },
        deep: true
      }
    },
    methods: {
      checkEmail () {
        let regex = /\S+@\S+\.\S+/
        console.log('checkEmail ' + regex.test(this.register.email))
        return regex.test(this.register.email)
      },
      registerUser (evt) {
        evt.preventDefault()

        if( !this.checkEmail() ){
          this.msgAlert = "Email not valid"
          return
        }

        if ( !this.register.email || !this.register.username || !this.register.password || !this.register.firstname || !this.register.surname ) {
          this.msgAlert = "Please fill in all informations."
          return
        }

        axios.post(`http://localhost:3000/api/auth/register/`, this.register)
          .then(response => {
            if (response.data.msg === 'email already exists') {
              this.msgAlert = "Email used already exist. Try to login."
              return
            }

            if (response.data.msg === 'username already exists') {
              this.msgAlert = "Usernamed used already exist. Please use something else."
              return
            }

            this.$router.push({ name: 'Login' })
          })
          .catch(e => {
            this.errors.push(e)
            this.$router.push({ name: 'Register' })
          })
      }
    }
  }
</script>
