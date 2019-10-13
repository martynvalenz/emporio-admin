<template>
    <div>
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
									<v-icon left>person_add</v-icon>
									Agregar contacto
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
		<v-dialog v-model="contact_dialog" max-width="750" height="auto" style="overflow: auto;">
			<v-form @submit.prevent="Save">
				<v-card>
					<v-card-title class="primary white--text">
						{{ dialog_title }}
						<v-spacer></v-spacer>
						<v-btn icon @click="contact_dialog = false"><v-icon>close</v-icon></v-btn>
					</v-card-title>
					<v-card-text>
						<v-container>
							<v-row>
								<v-col cols="12" sm="12" md="6" lg="5">
									<v-text-field label="Área" outlined v-model="area" append-icon="dashboard" autofocus :error-messages="errors.area"></v-text-field>
								</v-col>
								<v-col cols="12" sm="12" md="6" lg="5">
									<v-text-field label="Puesto" outlined v-model="position" append-icon="assignment_ind" :error-messages="errors.position"></v-text-field>
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="12" sm="12" md="6" lg="4">
									<v-text-field label="Título" outlined v-model="title" append-icon="subject" :error-messages="errors.title"></v-text-field>
								</v-col>
								<v-col cols="12" sm="12" md="6" lg="8">
									<v-text-field label="Nombre *" outlined v-model="name" append-icon="person" :error-messages="errors.name"></v-text-field>
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="12" sm="12" md="12" lg="6">
									<v-text-field label="Email" outlined v-model="email" append-icon="email" :error-messages="errors.email"></v-text-field>
								</v-col>
								<v-col cols="12" sm="8" md="8" lg="4">
									<v-text-field label="Teléfono *" outlined v-model="phone" append-icon="phone" :error-messages="errors.phone"></v-text-field>
								</v-col>
								<v-col cols="12" sm="4" md="4" lg="2">
									<v-text-field label="Ext." outlined v-model="extension" :error-messages="errors.extension"></v-text-field>
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="12" sm="12" md="12">
									<v-textarea outlined label="Comentarios" v-model="comments" rows="4" auto-grow></v-textarea>
								</v-col>
							</v-row>
						</v-container>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn text @click="contact_dialog = false">Cerrar</v-btn>
						<v-btn class="primary" type="submit" :loading="loading">Guardar <v-icon right>save</v-icon></v-btn>
					</v-card-actions>
				</v-card>
			</v-form>
		</v-dialog>
	</div>
</template>

<script>
import axios from "axios";
export default {
	props: ["customer"],
    data(){
        return {
            //snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
            timeout: 6000,
            //Contacts
            contacts_dialog: false,
            contacts: [],
            contacts_loading: false,
            customer_id: '',
			//Contact form
			errors:[],
			contact_dialog: false,
			dialog_title:'',
            loading: false,
            contact_id: '',
            position: '',
            title: '',
			area: '',
			name:'',
			email:'',
			phone:'',
			extension:'',
			comments:''
        };
    },

    methods:
    {
        //Contacts
        openContacts(customer_id)
        {
            this.contacts_dialog = true;
            this.customer_id = customer_id;
            this.LoadContacts();
        },

        async LoadContacts(customer_id)
        {
            this.contacts_loading = true;
            await this.$axios
                .get(`/api/customer/contacts/${customer_id}`)
                .then(res =>
                {
                    this.contacts = res.data;
                    this.contacts_loading = false;
                })
                .catch(error =>
                {
                    console.log(error);
                    this.contacts_loading = false;
                });
        },

        clearContactForm()
        {
			this.contact_id = '';
			this.position = '';
            this.title = '';
			this.area = '';
			this.name ='';
			this.email ='';
			this.phone ='';
			this.unsigned_phone ='';
			this.extension ='';
			this.comments ='';
        },

        createContact()
        {
			if (this.customer_id == ''){
				this.contacts_dialog = false;
			}
			else{
				this.contact_dialog = true;
				this.dialog_title = 'Crear contacto';
				this.clearContactForm();
			}
		},
		
		async Save(){
			//Update
			if(this.contact_id){

			}
			//Store
			else{
				await this.$axios.post('/api/customer', {position:this.position, title:this.title, area:this.area, name:this.name, email:this.email, phone:this.phone, extension:this.extension, comments:this.comments})
				.then(res => {

				})
				.catch(error => {

				})
			}
			
		}
    },
};
</script>

<style>
</style>
