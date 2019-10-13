<template>
  <v-dialog v-model="contacts_dialog" fullscreen transition="dialog-bottom-transition" scrollable>
    <v-card>
      <v-card-title color="primary" style="background-color:#52AF50; color: white;" dark dense>
        Contactos
        <v-spacer></v-spacer>
        <v-btn icon dark @click="contacts_dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pb-4">
        <v-container fluid grid-list-xl>
          <v-layout wrap class="pt-2">
            <v-flex xs12 sm12 md4 lg4 xl4>
              <v-btn color="primary" dark @click="createContact">
                <v-icon left>person_add</v-icon>Agregar contacto
              </v-btn>
            </v-flex>
            <v-flex xs12 sm12 md4 lg4 xl4>
              <v-select label="Agregar contactos existentes" outlined color="primary"></v-select>
            </v-flex>
            <v-flex xs12 sm12 md4 lg4 xl4 class="text-right">
              <v-btn icon class="ma-2 white--text" @click="LoadContacts">
                <v-icon>sync</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
          <v-layout wrap>
            <v-flex xs12>
              <v-card class="elevation-0" :loading="contacts_loading">
                <v-simple-table class="elevation-1">
                  <thead>
                    <tr>
                      <th class="text-left">Nombre</th>
                      <th class="text-left">Puesto</th>
                      <th class="text-left">Correo</th>
                      <th class="text-left">Teléfono</th>
                      <th class="text-left">Estatus</th>
                      <th class="text-left">Agregado</th>
                      <th class="text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(contact, index) in contacts" :key="index">
                      <td>
                        <span v-if="contact.title">{{ contact.title }}</span>
                        {{ contact.name }}
                      </td>
                      <td>{{ contact.position }}</td>
                      <td>{{ contact.email }}</td>
                      <td>
                        {{contact.phone}}
                        <span v-if="contact.extension">{{ contact.extension }}</span>
                      </td>
                      <td>
                        <div v-if="contact.has_access == 0">
                          <v-chip color="orange lighten-1" dark>sin Acceso</v-chip>
                        </div>
                        <div v-if="contact.has_access == 1">
                          <v-chip color="green" dark>con Acceso</v-chip>
                        </div>
                      </td>
                      <td>{{ contact.created_at }}</td>
                      <td class="text-right">
                        <v-icon color="grey">list</v-icon>
                        <v-icon color="warning">edit</v-icon>
                        <v-icon color="red">delete</v-icon>
                      </td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions
        style="background-color:rgba(0,0,0,0.1); color: white; position:absolute; bottom: 0; width:100%;"
      >
        <v-spacer></v-spacer>
        <v-btn color="grey" @click="contacts_dialog = false" dark>Cerrar</v-btn>
      </v-card-actions>
      <div style="flex: 1 1 auto;"></div>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
export default {
  props: ["customer"],
  data() {
    return {
      //snackbar
      snackbar: false,
      snackColor: "",
      snackText: "",
      timeout: 6000,
      //Contacts
      contacts_dialog: false,
      contacts: [],
      contacts_loading: false,
      customer_id: ""
    };
  },

  methods: {
    //Contacts
    openContacts() {
      this.contacts_dialog = true;
      this.customer_id = this.customer;
      this.LoadContacts();
    },

    async LoadContacts() {
      this.contacts_loading = true;
      await this.$axios
        .get(`/api/customer/contacts/${this.customer}`)
        .then(res => {
          this.contacts = res.data;
          this.contacts_loading = false;
        })
        .catch(error => {
          console.log(error);
          this.contacts_loading = false;
        });
    },

    createContact() {}
  }
};
</script>

<style>
</style>
