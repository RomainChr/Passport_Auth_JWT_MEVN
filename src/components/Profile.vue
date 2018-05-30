<template>
  <div>
    <b-row class="justify-content-md-center">
      <b-col cols="6">
        <h2>Your profile</h2>
        <!--<div v-if="errors && errors.length">
          <div v-for="error of errors">
            <b-alert show>{{error.message}}</b-alert>
          </div>
        </div>-->
        <b-form v-on:submit.prevent="" v-if="user">
          <p id="email">Email : {{ user.email }}</p>
          <p id="username">Username : {{ user.username }}</p>
          <p id="password">Password : <b-btn @click="modalShow = !modalShow" @click="cleanInput" variant="primary">Change my password</b-btn></p>
          <p id="firstname">Firstname : {{ user.firstname }}</p>
          <p id="surname">Surname : {{ user.surname }}</p>
          <b-button type="submit" variant="primary" @click="$router.push({name: 'EditProfile'})">Edit profile</b-button>
          <b-button type="button" variant="success" @click="$router.push({name: 'Home'})">Back</b-button>
        </b-form>
      </b-col>
      <!--<b-btn v-b-modal.modal1>Launch demo modal</b-btn>-->
    </b-row>


    <!-- Modal Component -->
    <b-modal id="modalShow" v-model="modalShow" title="Change password" hide-footer @ok="onSubmit" ok-title="Save new password" cancel-title="Cancel" no-close-on-backdrop="false">
      <b-form v-on:submit.prevent="onSubmit">
        <div class="alert alert-danger" role="alert" v-if="visibilityAlert2">
          {{ msgAlert2 }}
        </div>
        <div class="alert alert-danger" role="alert" v-if="visibilityAlert">
          {{ msgAlert }}
        </div>
        <b-form-group id="fieldsetHorizontal"
                      horizontal
                      :label-cols="4"
                      breakpoint="md"
                      label="Old password">
          <b-form-input type="password" placeholder="Old password" id="oldPassword" v-model.trim="password.oldPassword" @keyup.native="compareOldPassword" required></b-form-input>
        </b-form-group>
        <p class="alert alert-danger" role="alert" v-if="errorPassword">  {{ errorPassword }}   </p>
        <b-form-group id="fieldsetHorizontal"
                      horizontal
                      :label-cols="4"
                      breakpoint="md"
                      label="New password">
          <b-form-input type="password" placeholder="New password" id="newPassword" v-model.trim="password.newPassword" @keyup.native="checkNewPassword" required></b-form-input>
        </b-form-group>
        <b-form-group id="fieldsetHorizontal"
                      horizontal
                      :label-cols="4"
                      breakpoint="md"
                      label="Confirm new password">
          <b-form-input type="password" placeholder="Confirm new password" id="confirmNewPassword" @keyup.native="checkNewPassword" v-model.trim="password.confirmNewPassword" required></b-form-input>
        </b-form-group>
        <b-btn @click="modalShow = !modalShow" variant="secondary">Cancel</b-btn>
        <b-btn variant="outline-success" type="submit">Save Password</b-btn>
      </b-form>
    </b-modal>
  </div>
</template>

<script>

import axios from 'axios'

export default {
  name: 'Profile',
  data  () {
    return {
      user: null,
      errors: [],
      visibilityAlert: false,
      visibilityAlert2: false,
      msgAlert: null,
      msgAlert2: null,
      password: {oldPassword: '', newPassword: '', confirmNewPassword: ''},
      errorPassword: null,
      timerOut: null,
      timerOut2: null,
      modalShow: false
    }
  },
  created () {
    axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken')
    axios.get(`http://localhost:3000/api/auth/profile/` + this.$route.params.id)
      .then(response => {
        this.user = response.data.user
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
    cleanInput () {
      this.password = {oldPassword: '', newPassword: '', confirmNewPassword: ''}
      this.visibilityAlert2 = false
      this.visibilityAlert = false
    },
    compareOldPassword () {
      this.visibilityAlert2 = false
      if (this.password.oldPassword !== '') {
        clearTimeout(this.timerOut2)
        this.timerOut2 = setTimeout(function () {
          axios.post('http://localhost:3000/api/auth/profile/' + this.$route.params.id + '/comparepassword/', this.password)
            .then(response => {
              if (response.data.msg === 'correct password') {
                return true
              } else {
                this.visibilityAlert2 = true
                this.msgAlert2 = "Incorrect password."
                return false
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

        }.bind(this), 1500)
      }
    },
    checkNewPassword (evt) {
      this.visibilityAlert = false
      if (this.password.newPassword !== '' && this.password.confirmNewPassword !== '') {
        clearTimeout(this.timerOut)
        this.timerOut = setTimeout(function () {
          clearTimeout(this.timerOut)
          if (this.password.newPassword !== this.password.confirmNewPassword) {
            this.errorPassword = 'New password and Confirm new password are different.'
            document.getElementById('confirmNewPassword').value = ''
          } else {
            this.errorPassword = null
          }
        }.bind(this), 1500)
      }
    },
    checkFormPassword () {
      if (this.password.oldPassword && this.password.newPassword && this.password.confirmNewPassword) {
        if (this.password.oldPassword !== this.password.newPassword && this.password.oldPassword !== this.password.confirmNewPassword) {
          return true
        } else {
          this.msgAlert = "You didn't change your password."
          return false
        }
      } else {
        this.msgAlert = "Please fill in all informations."
        return false
      }
    },
    onSubmit (evt) {
      evt.preventDefault()
      if (this.checkFormPassword()) {
        let updateUser = this.user
        updateUser.password = this.password.newPassword
        axios.put('http://localhost:3000/api/auth/profile/' + this.$route.params.id + '/edit', updateUser)
          .then(response => {
            if (response.data.msg === 'Successful updated user.') {
              this.modalShow = false
              this.cleanInput()
              this.$router.push({
                name: 'Login'
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
        this.visibilityAlert = true
      }
    }
  }
}
</script>

<style>
  .modal-title{
    width: 100% !important;
  }
  .form-row > legend{
    font-size: 15px !important;
  }
  [v-cloak] {
    display: none;
  }
</style>
