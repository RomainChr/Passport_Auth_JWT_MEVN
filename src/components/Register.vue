<template>
  <b-row class="justify-content-md-center">
    <b-col cols="6">
      <h2>Please Register</h2>
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
        visibilityAlert: false,
        msgAlert: null
      }
    },
    methods: {
      checkForm () {
        if (this.register.email && this.register.username && this.register.password && this.register.firstname && this.register.surname) {
          return true
        } else {
          return false
        }
      },
      onSubmit (evt) {
        if (this.checkForm()) {
          evt.preventDefault()
          axios.post(`http://localhost:3000/api/auth/register/`, this.register)
            .then(response => {
              if (response.data.msg === 'email already exists') {
                this.visibilityAlert = true
                this.msgAlert = "Email used already exist. Try to login."
              } else if (response.data.msg === 'username already exists') {
                this.visibilityAlert = true
                this.msgAlert = "Usernamed used already exist. Please use something else."
              } else {
                this.$router.push({
                  name: 'Login'
                })
              }
            })
            .catch(e => {
              this.errors.push(e)
              this.$router.push({
                name: 'Register'
              })
            })
        } else {
          this.visibilityAlert = true
          this.msgAlert = "Please fill in all informations."
        }
      }
    }
  }
</script>
