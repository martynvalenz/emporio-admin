<template>
	<div>
		<h2>Clientes</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="loading_table">
					<v-card-title>
						<v-btn class="primary mx-1" @click="create">Agregar Cliente<v-icon right>person_add</v-icon></v-btn>
						<v-btn color="info" class="mx-1" @click="createStrategy">Agregar Estrategia<v-icon right>add</v-icon></v-btn>
						<v-spacer></v-spacer>
						<v-btn icon @click="Refresh"><v-icon>sync</v-icon></v-btn>
					</v-card-title>
					<v-card-title>
						<v-layout>
							<v-flex xs12 sm12 md6>
								<v-text-field  outlined color="light-blue darken-2" prepend-icon="search" v-model="search_customers" @change="Load" label="Buscar" type="text" clearable></v-text-field>
							</v-flex>
						</v-layout>
					</v-card-title>
					<v-divider></v-divider>
					<v-card-text>
						<v-simple-table class="elevation-1">
							<thead>
								<tr>
									<th class="text-left">Cliente</th>
									<th class="text-left">Estrategia</th>
									<th class="text-left">Saldo</th>
									<th class="text-left">Usuario</th>
									<th class="text-left">Estatus</th>
									<th class="text-left">Agregado</th>
									<th class="text-right"></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(customer, index) in customers" :key="index">
									<td>{{ customer.customer }}</td>
									<td v-if="customer.referred_by">Ref: {{ customer.referral }}</td>
									<td v-else>{{ customer.strategy }}</td>
									<td>{{ customer.balance }}</td>
									<td>{{ customer.initials }}</td>
									<td>
										<v-chip v-if="customer.status" color="green" dark>Activo</v-chip>
										<v-chip v-else dark color="red">Inactivo</v-chip>
									</td>
									<td>{{ customer.created_at }}</td>
									<td class="text-right">
										<v-icon color="grey">all_inbox</v-icon>
										<v-icon color="grey">list</v-icon>
										<v-icon color="grey">copyright</v-icon>
										<v-icon color="grey" @click="openContacts(customer.id)">person</v-icon>
										<v-icon v-if="customer.folder" @click="openFolder(customer.folder)" color="success">folder</v-icon>
										<v-icon v-else @click="editFolder(index)" color="grey">folder</v-icon>
										<v-icon icon @click="edit(index)" color="warning">edit</v-icon>
										<v-icon @click="statusModal(index)" v-if="customer.status" color="error">block</v-icon>
										<v-icon @click="statusModal(index)" v-else color="success">check</v-icon>
									</td>
								</tr>
							</tbody>
						</v-simple-table>
						<!-- <v-data-table :headers="headers"  sort-by="customer" class="elevation-4">

						</v-data-table> -->
					</v-card-text>
				</v-card>
			</v-flex>
		</v-layout>
		<v-dialog v-model="strategy_dialog" width="400">
			<v-form @submit.prevent="saveStrategy">
				<v-card>
					<v-alert v-model="error_alert" border="left" close-text="Close Alert" color="red" dark dismissible>
						<span class="white--text" v-if="errors.strategy">{{ errors.strategy[0] }}</span>
					</v-alert>
					<v-card-title>
						Agregar Estrategia
						<v-spacer></v-spacer>
						<v-btn icon @click="strategy_dialog = false"><v-icon>close</v-icon></v-btn>
					</v-card-title>
					<v-card-text>
						<v-layout>
							<v-flex xs12>
								<v-text-field outlined v-model="strategy" label="Estrategia" append-icon="thumb_up"></v-text-field>
							</v-flex>
						</v-layout>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn text @click="strategy_dialog = false">Cerrar</v-btn>
						<v-btn class="primary" type="submit" :loading="loading">Guardar<v-icon right>save</v-icon></v-btn>
					</v-card-actions>
				</v-card>
			</v-form>
		</v-dialog>
		<v-dialog v-model="customer_dialog" max-width="750" height="auto" style="overflow: auto;">
			<v-form @submit.prevent="Save">
				<v-card>
					<v-alert v-model="error_alert" border="left" close-text="Close Alert" color="red" dark dismissible>
						<span class="white--text" v-if="errors.customer">{{ errors.customer[0] }}</span>
						<span class="white--text" v-if="errors.id">{{ errors.id[0] }}</span>
					</v-alert>
					<v-card-title class="primary white--text">
						{{ dialogTitle }}
						<v-spacer></v-spacer>
						<v-btn icon @click="customer_dialog = false"><v-icon>close</v-icon></v-btn>
					</v-card-title>
					<v-card-text>
						<v-container>
							<v-row>
								<v-col cols="12" sm="12" md="12">
									<v-text-field label="Nombre comercial *" outlined v-model="customer" append-icon="person_add" autofocus></v-text-field>
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="12" sm="12" md="5">
									<v-select v-model="strategy_id" @change="changeStrategy" outlined item-value="id" item-text="strategy" :items="strategies" label="Seleccionar estrategia"></v-select>
								</v-col>
								<v-col cols="12" sm="12" md="7" v-if="strategy_id == 1">
									<v-autocomplete v-model="referred" :items="referrals" outlined :loading="referralLoading" :search-input.sync="search" hide-no-data hide-selected item-text="customer" item-value="id" placeholder="Referido por..." prepend-icon="person" return-object clearable label="Seleccionar cliente..."></v-autocomplete>
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="12" sm="12" md="12">
									<v-text-field label="Carpeta de Google drive" outlined v-model="folder" append-icon="folder"></v-text-field>
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
						<v-btn text @click="customer_dialog = false">Cerrar</v-btn>
						<v-btn class="primary" type="submit" :loading="loading">Guardar <v-icon right>save</v-icon></v-btn>
					</v-card-actions>
				</v-card>
			</v-form>
		</v-dialog>
		<v-dialog v-model="status_dialog" width="400">
			<v-form @submit.prevent="changeStatus">
				<v-card>
					<v-card-title>
						<div v-if="customer_status">¿Quieres inactivar el cliente?</div>
						<div v-else>¿Quieres activar el cliente?</div>
					</v-card-title>
					<br>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn text @click="status_dialog = false">Cerrar</v-btn>
						<v-btn v-if="customer_status" class="error" type="submit" :loading="loading">Desactivar<v-icon right>block</v-icon></v-btn>
						<v-btn v-else class="success" type="submit" :loading="loading">Activar<v-icon right>check</v-icon></v-btn>
					</v-card-actions>
				</v-card>
			</v-form>
		</v-dialog>
		<Contacts :customer="customer_id" :bus="bus" ref="contacts_form"></Contacts>
		<v-snackbar
            v-model="snackbar"
            :timeout="timeout"
            top
            right
            :color="snackColor"
            >
            {{ snackText }}
            <v-btn
                color="white"
                text
                @click="snackbar = false"
                >
                Cerrar
            </v-btn>
        </v-snackbar>
	</div>
</template>

<script>
import Contacts from '@/components/Contacts'
import axios from 'axios'
import Vue from 'vue'
export default {
	layout: 'admin',
	middleware: 'auth',
	head:{
        title: 'Clientes'
	},
	components:{Contacts},
	data(){
		return{
			//Strategies
			strategy_dialog: false,
			strategy: '',
			search_customers:'',
			//Customers
			customers:[],
			loading_table:false,
			customer_selected: '',
			customer_dialog: false,
			dialogTitle: '',
			customer_id: '',
			customer: '',
			strategy_id: '',
			referred_by: '',
			referred_loading: false,
			folder: '',
			// web_page: '',
			//Referrals
			referrals: [],
			referred: null,
			search: null,
			referralLoading: false,
			descriptionLimit: 60,
			//Stop referrals
			comments: '',
			strategies: [],
			customer_status: '',
			status_dialog: false,
			loading: false,
			errors: {},
			error_alert: false,
			//snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
			timeout: 6000,
			//Contacts
			bus: new Vue(),
		}
	},

	created(){
		this.Load();
	},

	computed: {
		
	},

	watch: {
		search(val){
			if(val){
				val && val !== this.referred && this.customerSelect(val)
			}
			else{
				this.referred_by = '';
				this.referrals = '';
				this.referred = null;
			}
		}
	},

	methods:{
		async Load(){
			this.loading_table = true;
			await this.$axios.post('/api/customers', {search:this.search_customers})
			.then(res => {
				this.customers = res.data.data;
				this.loading_table = false;
			})
			.catch(error =>{
				console.log(error);
				this.loading_table = false;
			});
		},

		async Refresh(){
			this.loading_table = true;
			this.search_customers = '';
			this.Load();
		},

		customerSelect(val){
			this.referralLoading = true;
			this.$axios.get(`/api/customers/list/${val}`)
			.then(res => {
				this.referrals = res.data;
				this.referred_by = this.referred.id;
				this.referralLoading = false;
			})
			.catch(error => {
				console.log(error);
				this.referralLoading = false;
			})
		},

		changeStrategy(){
			if(this.strategy_id !== 1){
				this.referred_by = '';
				this.referrals = '';
				this.referred = null;
			}
		},

		createStrategy(){
			this.strategy_dialog = true;
			this.strategy = '';
			this.errors = {};
			this.error_alert = false;
		},

		async saveStrategy(){
			await this.$axios.post(`/api/strategy`, {strategy:this.strategy})
				.then(res => {
					this.loading = false;
					this.strategy = '';
					this.strategy_dialog = false;
					this.snackColor = 'success';
					this.snackbar = true;
					this.snackText = 'Se agregó el registro "' + res.data.strategy + '"';
				})
				.catch(error => {
					this.loading = false;
					this.errors = error.response.data.errors;
					this.error_alert = true;
				})
		},

		async getStrategies(){
			await this.$axios.get('/api/getStrategies')
			.then(res => {
				this.strategies = res.data;
			})
			.catch(error =>{
				console.log(error);
			});
		},

		clearCustomer(){
			this.customer_selected = '';
			this.customer_id = '';
			this.customer = '';
			this.strategy_id = '';
			this.referred_by = '';
			this.referrals = '';
			this.folder = '';
			// this.web_page = '';
			this.comments = '';
		},

		create(){
			this.getStrategies();
			this.dialogTitle = 'Agregar Cliente',
			this.customer_dialog = true;
			this.clearCustomer();
			this.errors = {};
			this.error_alert = false;
		},

		edit(index){
			this.getStrategies();
			this.customer_dialog = true;
			const customer = this.customers[index];
			this.customer_selected = index;
			this.dialogTitle = 'Editar cliente: '+customer.customer;
			this.customer_id = customer.id;
			this.customer = customer.customer;
			this.strategy_id = customer.strategy_id;
			this.referred_by = customer.referred_by;
			this.folder = customer.folder;
			// this.web_page = customer.web_page;
			this.comments = customer.comments;
			// this.customers.splice(index, 1, customer.id)
			this.errors = {};
			this.error_alert = false;

			if(customer.referred_by){
				this.customerSelect(customer.referred);
				this.referrals = customer.referred;
			}
		},

		async Save(){
			this.loading = true;
			//Update
			if(this.customer_id){
				await this.$axios.put(`/api/customer/${this.customer_id}`, {customer:this.customer, strategy_id:this.strategy_id, referred_by:this.referred_by, folder:this.folder, comments:this.comments})
				.then(res => {
					this.customers[this.customer_selected] = res.data;
					this.customer_dialog = false;
					this.snackColor = 'success';
					this.snackbar = true;
					this.snackText = 'Se actualizó el cliente '+res.data.customer;
					this.loading = false;
					this.clearCustomer();
				})
				.catch(error => {
					this.loading = false;
					this.errors = error.response.data.errors;
					this.error_alert = true;
				})
			}
			//Store
			else{
				await this.$axios.post(`/api/customer`, {customer:this.customer, strategy_id:this.strategy_id, referred_by:this.referred_by, folder:this.folder, comments:this.comments})
				.then(res => {
					this.customers.unshift(res.data);
					this.loading = false;
					this.clearCustomer();
					this.customer_dialog = false;
					this.snackColor = 'success';
					this.snackbar = true;
					this.snackText = 'Se agregó el cliente '+res.data.customer;
				})
				.catch(error => {
					this.loading = false;
					this.errors = error.response.data.errors;
					this.error_alert = true;
				})
			}
		},

		statusModal(index){
			this.status_dialog = true;
			const customer = this.customers[index];
			this.customer_selected = index;
			this.customer_id = customer.id;
			this.customer_status = customer.status;
		},

		async changeStatus(){
			this.loading = true;
			await this.$axios.put(`/api/customer/status/${this.customer_id}`, {status:this.customer_status})
			.then(res => {
				this.customers[this.customer_selected] = res.data;
				this.loading = false;
				this.status_dialog = false;
				this.clearCustomer();
				this.snackColor = 'success';
                this.snackbar = true;
                this.snackText = 'Se actualizó el registro.';
			})
			.catch(error => {
				console.log(error);
				this.loading = false;
				this.customer_id = '';
				this.customer_status = '';
				this.status_dialog = false;
				this.snackColor = 'error';
                this.snackbar = true;
                this.snackText = 'No se pudo actualizar el registro.';
			});
		},

		openFolder(folder){
			window.open(folder, '_blank');    
		},

		editFolder(index){
			alert('No hay url de carpeta, agréguela en el formulario de edición.');
			this.edit(index);
		},

		openContacts(customer_id){
			this.customer_id = customer_id;
			// this.$refs.contactComponent.openContacts(customer_id);
			// this.bus.$emit('openContacts');
			this.$refs.contacts_form.openContacts();
		}
	}
}
</script>

