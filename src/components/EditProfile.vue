<template>
  <b-row class="justify-content-md-center">
    <b-col cols="6">
      <h2>Edit my profile</h2>
      <!--<div v-if="errors && errors.length">
        <div v-for="error of errors">
          <b-alert show>{{error.message}}</b-alert>
        </div>
      </div>-->
      <div class="alert alert-danger" role="alert" v-if="visibilityAlert">
        {{ msgAlert }}
      </div>


      <b-form v-on:submit.prevent="onSubmit" v-if="updateUser">
        <b-form-group id="fieldsetHorizontal"
                      horizontal
                      :label-cols="4"
                      breakpoint="md"
                      label="Email">
          <b-form-input id="email" type="email" placeholder="email" :state="state" v-model.trim="updateUser.email" value="toto" required></b-form-input>
        </b-form-group>
        <b-form-group id="fieldsetHorizontal"
                      horizontal
                      :label-cols="4"
                      breakpoint="md"
                      label="Username">
          <b-form-input id="username" placeholder="username" :state="state" v-model.trim="updateUser.username" value="" required></b-form-input>
        </b-form-group>
        <b-form-group id="fieldsetHorizontal"
                      horizontal
                      :label-cols="4"
                      breakpoint="md"
                      label="Firstname">
          <b-form-input id="firstname" placeholder="firstname" :state="state" v-model.trim="updateUser.firstname" value="" required></b-form-input>
        </b-form-group>
        <b-form-group id="fieldsetHorizontal"
                      horizontal
                      :label-cols="4"
                      breakpoint="md"
                      label="Surname">
          <b-form-input id="surname" placeholder="surname" :state="state" v-model.trim="updateUser.surname" value="" required></b-form-input>
        </b-form-group>
        <b-button type="submit" variant="primary">Save my profile</b-button>
        <b-button type="button" variant="success" @click="$router.go(-1)">Back</b-button>
      </b-form>
    </b-col>
  </b-row>
</template>

<script>

import axios from 'axios'

export default {
  name: 'EditProfile',
  data () {
    return {
      user: null,
      updateUser: null,
      errors: [],
      visibilityAlert: false,
      msgAlert: null
    }
  },
  created () {
    axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken')
    axios.get(`http://localhost:3000/api/auth/profile/` + this.$route.params.id)
      .then(response => {
        this.user = response.data.user
        this.updateUser = Object.assign({}, this.user)
      })
      .catch(e => {
        this.errors.push(e)
        if (e.response.status === 401) {
          this.$router.push({
            name: 'Login'
          })
        }
      })
  },
  methods: {
    checkForm () {
      if (this.updateUser.email && this.updateUser.username && this.updateUser.firstname && this.updateUser.surname) {
        return true
      } else {
        return false
      }
    },
    checkModified () {
      if (this.updateUser.email !== this.user.email || this.updateUser.username !== this.user.username || this.updateUser.firstname !== this.user.firstname || this.updateUser.surname !== this.user.surname) {
        return true
      } else {
        return false
      }
    },
    onSubmit (evt) {
      evt.preventDefault()
      if (this.checkForm()) {
        if (this.checkModified()) {
          axios.put('http://localhost:3000/api/auth/profile/' + this.$route.params.id + '/edit', this.updateUser)
            .then(response => {
              if (response.data.msg === 'email already exists') {
                this.visibilityAlert = true
                this.msgAlert = "Email used already exist. Try to login."
              } else if (response.data.msg === 'username already exists') {
                this.visibilityAlert = true
                this.msgAlert = "Usernamed used already exist. Please use something else."
              } else {
                this.$router.push({
                  name: 'Profile'
                })
              }
            })
            .catch(e => {
              this.errors.push(e)
              if (e.response.status === 401) {
                this.$router.push({
                  name: 'Login'
                })
              }
            })
        } else {
          this.$router.push({
            name: 'Profile'
          })
        }
      } else {
        this.visibilityAlert = true
        this.msgAlert = "Please fill in all informations."
      }
    }
  }
}
</script>
