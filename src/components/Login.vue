<template>
  <b-row class="justify-content-md-center">
    <b-col cols="6">
      <h2>Please Login</h2>
      <!--<div v-if="errors && errors.length">
        <div v-for="error of errors">
          <b-alert show>{{error.message}}</b-alert>
        </div>
      </div>-->
      <div class="alert alert-danger" role="alert" v-if="visibilityAlert">
        {{ msgAlert }}
      </div>
      <b-form v-on:submit.prevent="onSubmit">
        <b-form-group id="fieldsetHorizontal"
                      horizontal
                      :label-cols="4"
                      breakpoint="md"
                      label="Enter Username">
          <b-form-input id="username" placeholder="Username or email" :state="state" v-model.trim="login.username" required></b-form-input>
        </b-form-group>
        <b-form-group id="fieldsetHorizontal"
                      horizontal
                      :label-cols="4"
                      breakpoint="md"
                      label="Enter Password">
          <b-form-input type="password" placeholder="Password" id="password" :state="state" v-model.trim="login.password" required></b-form-input>
        </b-form-group>
        <b-button type="submit" variant="primary">Login</b-button>
        <b-button type="button" variant="success" @click.stop="register()">Register</b-button>
      </b-form>
    </b-col>
  </b-row>
</template>

<script>

  import axios from 'axios'

  export default {
    name: 'Login',
    data () {
      return {
        login: {},
        errors: [],
        visibilityAlert: false,
        msgAlert: null
      }
    },
    watch: {
      login: {
        handler () {
          this.visibilityAlert = false
        },
        deep: true
      }
    },
    methods: {
      checkForm () {
        if (this.login.username && this.login.password) {
          return true
        } else {
          return false
        }
      },
      onSubmit (evt) {
        if (this.checkForm()) {
          evt.preventDefault()
          axios.post(`http://localhost:3000/api/auth/login/`, this.login)
            .then(response => {
              if (response.data.msg === 'email or username not found') {
                this.visibilityAlert = true
                this.msgAlert = "Incorrect username or email address."
              } else if (response.data.msg === 'wrong password') {
                this.visibilityAlert = true
                this.msgAlert = "Incorrect password."
              } else {
                localStorage.setItem('jwtToken', response.data.token)
                this.$router.push({
                  name: 'Home'
                })
              }
            })
            .catch(e => {
              this.errors.push(e)
              this.$router.push({
                name: 'Login'
              })
            })
        } else {
          this.visibilityAlert = true
          this.msgAlert = "Please fill in all informations."
        }
      },
      register () {
        this.$router.push({
          name: 'Register'
        })
      }
    }
  }
</script>
