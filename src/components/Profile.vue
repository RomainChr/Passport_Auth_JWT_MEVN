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
          <p id="password">Password : <b-btn @click="modalShow = !modalShow" @click="cleanInputField" variant="primary">Change my password</b-btn></p>
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
      <b-form v-on:submit.prevent="updatePassword">
        <div class="alert alert-danger" role="alert" v-if="msgAlert2">
          {{ msgAlert2 }}
        </div>
        <div class="alert alert-danger" role="alert" v-if="msgAlert">
          {{ msgAlert }}
        </div>
        <b-form-group id="fieldsetHorizontal"
                      horizontal
                      :label-cols="4"
                      breakpoint="md"
                      label="Your password">
          <b-form-input type="password" placeholder="Old password" id="oldPassword" v-model.trim="password.oldPassword" @keyup.native="compareOldPassword" required></b-form-input>
        </b-form-group>
        <p class="alert alert-danger" role="alert" v-if="msgAlertPassword">  {{ msgAlertPassword }}   </p>
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
      msgAlert: null,
      msgAlert2: null,
      msgAlertPassword: null,
      password: {oldPassword: '', newPassword: '', confirmNewPassword: ''},
      timerOut: null,
      timerOut2: null,
      modalShow: false
    }
  },
  created () {
    // GET profile datas
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
  watch: {
    // hide alert if field modified
    password: {
      handler () {
        this.msgAlert = null
        this.msgAlert2 = null
        this.msgAlertPassword = null
      },
      deep: true
    }
  },
  methods: {
    compareOldPassword () {

      if ( this.password.oldPassword !== '' ) {

        clearTimeout(this.timerOut2)

        // setTimeout for wait user finish
        this.timerOut2 = setTimeout(function () {

          axios.post('http://localhost:3000/api/auth/profile/' + this.$route.params.id + '/comparepassword/', this.password)
            .then(response => {

              if (response.data.msg !== 'correct password') {
                this.msgAlert2 = "Incorrect password."
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

        }.bind(this), 1000)
      }
    },
    // check if New password and Confirm new password fields are different
    checkNewPassword () {

      if ( this.password.newPassword !== '' && this.password.confirmNewPassword !== '' ) {

        clearTimeout(this.timerOut)
        // setTimeout for wait user finish
        this.timerOut = setTimeout(function () {

          if ( this.password.newPassword !== this.password.confirmNewPassword ) {
            this.msgAlertPassword = 'New password and Confirm new password are different.'
            return
          }

          this.msgAlertPassword = null

        }.bind(this), 1000)
      }
    },
    updatePassword (evt) {
      evt.preventDefault()

      // check if fields filled
      if ( !this.password.oldPassword || !this.password.newPassword || !this.password.confirmNewPassword ) {
        this.msgAlert = "Please fill in all informations."
        return
      }

      // check if old password different of new password and confirm new password
      if (this.password.oldPassword === this.password.newPassword || this.password.oldPassword === this.password.confirmNewPassword) {
        this.msgAlert = "You didn't change your password."
        return
      }

      // check if new password and confirm new password are equal
      if ( this.password.newPassword !== this.password.confirmNewPassword) {
        this.msgAlertPassword = "New password and Confirm new password are different."
        return
      }

      // SET new password
      let updateUser = this.user
      updateUser.password = this.password.newPassword

      axios.put('http://localhost:3000/api/auth/profile/' + this.$route.params.id + '/edit', updateUser)
        .then(response => {
          if (response.data.msg === 'Successful updated user.') {
            this.modalShow = false
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

    },
    // clean field change password
    cleanInputField () {
      this.password = {oldPassword: '', newPassword: '', confirmNewPassword: ''}
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
