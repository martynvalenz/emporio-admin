<template>
    <div>
        <h2>Egresos</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="loading_table">
					<v-card-title>
						<v-btn color="primary" class="mx-1">Agregar Egreso<v-icon right>add</v-icon></v-btn>
						<v-btn color="info" class="mx-1" >Nómina<v-icon right>person</v-icon></v-btn>
						<v-btn color="info" class="mx-1" >Comisión<v-icon right>person</v-icon></v-btn>
						<v-btn color="secondary" class="mx-1" >Traspaso<v-icon right>sync_alt</v-icon></v-btn>
						<v-btn color="green" dark class="mx-1" to="/admin/services/comissions" router exact>Exportar<v-icon right>arrow_downward</v-icon></v-btn>
						<v-spacer></v-spacer>
						<v-btn icon @click="Reload"><v-icon>sync</v-icon></v-btn>
					</v-card-title>
                    <v-card-title>
                        <v-row>
                            <v-col cols="6" sm="6" md="4" lg="2">
                                <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y full-width min-width="290px">
                                    <template v-slot:activator="{ on }">
                                        <v-text-field v-model="date" label="Fecha" append-icon="event" outlined readonly v-on="on" @click:append="date_menu = true"></v-text-field>
                                    </template>
                                    <v-date-picker v-model="date" locale="es" color="light-blue darken-3" @input="date_menu = false" :error-messages="errors.date"></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="6" sm="6" md="4" lg="2">
                                <v-menu v-model="date_menu2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y full-width min-width="290px">
                                    <template v-slot:activator="{ on }">
                                        <v-text-field v-model="date2" label="Fecha" append-icon="event" outlined readonly v-on="on" @click:append="date_menu2 = true"></v-text-field>
                                    </template>
                                    <v-date-picker v-model="date2" locale="es" color="light-blue darken-3" @input="date_menu2 = false" :error-messages="errors.date2"></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="6" sm="6" md="4" lg="2">
                                <v-select v-model="is_payed" :items="payed_status" outlined label="Estatus de Pago" item-value="value" item-text="status"></v-select>
                            </v-col>
                            <v-col cols="6" sm="6" md="4" lg="2">
                                <v-select v-model="expense_type" :items="expense_types" outlined label="Tipo de Egreso" item-value="expense" item-text="type"></v-select>
                            </v-col>
                            <v-col cols="6" sm="6" md="4" lg="3">
                                <v-select v-model="account_id" :items="accounts" outlined label="Cuenta" item-value="id" item-text="alias"></v-select>
                            </v-col>
                            <v-col cols="6" sm="6" md="4" lg="4">
                                <v-select v-model="paying_method_id" :items="paying_methods" outlined label="Forma de pago" item-value="id" item-text="paying_method"></v-select>
                            </v-col>
                            <v-col cols="12" xs="12" sm="12" md="5">
                                <v-text-field  outlined color="light-blue darken-2" prepend-icon="search" v-model="search_table" v-on:keyup.enter="Reload" @click:clear="clearSearch" label="Buscar" type="text" clearable></v-text-field>
                            </v-col>
                        </v-row>
					</v-card-title>
                    <v-card-title>
                        <v-btn text color="primary" small><v-icon left>add</v-icon> Egreso</v-btn>
                    </v-card-title>
					<v-divider></v-divider>
					<v-card-text>
						<v-simple-table class="elevation-1" fixed-header height="650px"> 
							<thead>
								<tr>
									<th class="text-left" style="width:10%">Clave</th>
									<th class="text-left" style="width:25%">Servicio</th>
									<th class="text-left" style="width:20%">Bitácora</th>
									<th class="text-center" style="width:5%">Moneda</th>
									<th class="text-center" style="width:12%">Precio</th>
									<th class="text-center" style="width:5%">Servicios</th>
									<th class="text-center" style="width:10%">Status</th>
									<th class="text-right" style="width:13%"></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(reg, index) in services" :key="index">
									<td>{{ reg.code }}</td>
									<td>{{ reg.service }}</td>
									<td>{{ reg.binnacle }}</td>
									<td class="text-center">{{ reg.money_code }}</td>
									<td class="text-right">{{ formatPrice(reg.price) }}</td>
									<td class="text-center">{{ reg.services }}</td>
									<td class="text-center">
										<v-chip v-if="reg.status == 1" color="green" dark>Activo</v-chip>
										<v-chip v-else dark color="red">Inactivo</v-chip>
									</td>
									<td class="text-right">
										<span @click="openProcess(index)">
											<v-badge color="primary" overlap v-if="reg.requisites > 0">
												<template v-slot:badge>
													<span>{{reg.requisites}}</span>
												</template>
												<v-icon color="warning" @click="openProcess(index)">list</v-icon>
											</v-badge>
											<v-badge color="error" overlap v-if="reg.requisites == 0">
												<template v-slot:badge >
													<span>{{reg.requisites}}</span>
												</template>
												<v-icon color="warning" @click="openProcess(index)">list</v-icon>
											</v-badge>
										</span>
										<v-icon color="warning" @click="editService(index)">edit</v-icon>
										<v-icon color="error" v-if="reg.status == 1" @click="editStatus(index, reg.status)">block</v-icon>
										<v-icon color="success" v-else @click="editStatus(index, reg.status)">check</v-icon>
									</td>
								</tr>
								<tr>
									<td style="width:100%" colspan="8">
										<infinite-loading class="text-center" spinner="spiral" @infinite="infiniteScroll" ref="infiniteLoading">
											<div slot="no-more">Ya no hay más registros</div>
											<div slot="no-results">Se llegó al final de los resultados</div>
										</infinite-loading>
									</td>
								</tr>
							</tbody>
						</v-simple-table>
					</v-card-text>
				</v-card>
			</v-flex>
		</v-layout>

		<Catalog :service_dialog="1" ref="services_form" v-on:newService="newService($event)" v-on:updateService="updateService($event)"></Catalog>
		<Process ref="process_form"></Process>

		<v-dialog v-model="status_dialog" width="400">
			<v-form>
				<v-card>
					<v-card-title>
						{{title}}
						<v-spacer></v-spacer>
						<v-btn icon @click="status_dialog = false"><v-icon>close</v-icon></v-btn>
					</v-card-title>
					<v-card-text>
						<div v-if="service_status">¿Quieres inactivar el servicio? Ya no aparecerá como opción seleccionable en servicios nuevos.</div>
						<div v-else>¿Quieres activar el servicio?</div>
					</v-card-text>
					<br>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn text @click="status_dialog = false">Cerrar</v-btn>
						<v-btn v-if="service_status == 1" @click="changeStatus()" class="error" :loading="loading">Desactivar <v-icon right>block</v-icon></v-btn>
						<v-btn v-else class="success" @click="changeStatus()" :loading="loading">Activar<v-icon right>check</v-icon></v-btn>
					</v-card-actions>
				</v-card>
			</v-form>
		</v-dialog>
    </div>
</template>

<script>
import axios from 'axios'
import Catalog from '@/components/Catalog'
import Process from '@/components/Process'
export default {
    layout: 'admin',
	middleware: 'auth',
	head:{
        title: 'Catálogo de servicios'
	},
	components:{Catalog, Process},
    data(){
        return{
            //Date menu
            date:'',
            date2:'',
            date_menu:false,
            date_menu2:false,
            //Filters
            payed_status:[
                {value:'todos', status:'Todo'},
                {value:0, status:'Pendiente'},
                {value:1, status:'Pagado'}
                // {value:'todos', status:'Todos'},
            ],
            is_payed:'',
            expense_types:[
                {expense:'todos', type:'Todos'},
                {expense:'despacho', type:'Despacho'},
                {expense:'hogar', type:'Hogar'},
                {expense:'personal', type:'Personal'},
                {expense:'traspaso', type:'Traspaso'},
                {expense:'nomina', type:'Nómina'},
                {expense:'comision', type:'Comisión'},
            ],
            expense_type:'',
            account_id:'',
            accounts:[],
            paying_method_id:'',
            paying_methods:[],
            // dates: [],
            errors:[],
            services:[],
			loading_table:false,
			loading:false,
			search_table:'',
			page:1,
			title:'',
			catalog_selected:'',
			services_catalog_id:'',
			status_dialog:false,
			service_status:'',
			//snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
			timeout: 6000,
        }
    },
	
	computed: {
		url(){
			return `${process.env.api}/api/catalogs?page=${this.page}`
        },
	},

	created(){
        this.loadInit();
        this.is_payed = 1;
        this.expense_type = 'despacho';
        this.account_id = '';
        this.paying_method_id = '';
        this.Load();
	},

    methods:{
        async loadInit(){
            await this.$axios.get('/api/finances-init-data')
            .then(res => {
                this.date = res.data.date1;
                this.date2 = res.data.date2;
                this.paying_methods = res.data.paying_methods;
                this.accounts = res.data.accounts;
            })
        },

        async Load(){
			this.loading_table = true;
			await this.$axios.post(this.url, {search:this.search_table})
			.then(res => {
				this.services = res.data.data;
				this.loading_table = false;
			})
			.catch(error => {
				this.loading_table = false;
			})
		},

		infiniteScroll($state){
			setTimeout(() => {
				this.page++
				this.$axios.post(this.url, {search:this.search_table})
				.then( res => {

					let services = res.data.data;

					if(services.length > 0){
						this.services = this.services.concat(services);
						$state.loaded()
					}
					else{
						$state.complete()
					}
				})
				.catch(error => {

				})
			}, 500);
		},

		clearSearch(){
			this.search_table = '';
			this.services = {};
			this.page = 1;
			this.$refs.infiniteLoading.stateChanger.reset();
			this.Load();
		},

		Reload(){
			this.services = {};
			this.page = 1;
			this.$refs.infiniteLoading.stateChanger.reset();
			this.Load();
		},
		
		formatPrice(value) {
			let val = (value/1).toFixed(2).replace('.,', '.')
			return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		},

		
    } 
}
</script>
