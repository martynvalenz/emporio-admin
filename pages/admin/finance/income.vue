<template>
    <div>
        <h2>Ingresos</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="loading_table">
					<v-card-title>
						<!-- <v-btn color="primary" class="mx-1" @click="createExpense">Agregar Ingreso<v-icon right>add</v-icon></v-btn> -->
						<!-- <v-btn color="green" dark class="mx-1" to="/admin/services/comissions" router exact>Exportar<v-icon right>arrow_downward</v-icon></v-btn> -->
					</v-card-title>
                    <v-card-title>
                        <v-row>
                            <v-col cols="6" sm="6" md="4" lg="2">
                                <v-menu v-model="date_menu1" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y full-width min-width="290px">
                                    <template v-slot:activator="{ on }">
                                        <v-text-field v-model="date1" label="Fecha inicial" append-icon="event" outlined readonly v-on="on" @click:append="date_menu1 = true"></v-text-field>
                                    </template>
                                    <v-date-picker v-model="date1" locale="es" color="light-blue darken-3" @input="date_menu1 = false" :error-messages="errors.date1" @change="Reload"></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="6" sm="6" md="4" lg="2">
                                <v-menu v-model="date_menu2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y full-width min-width="290px">
                                    <template v-slot:activator="{ on }">
                                        <v-text-field v-model="date2" label="Fecha final" append-icon="event" outlined readonly v-on="on" @click:append="date_menu2 = true"></v-text-field>
                                    </template>
                                    <v-date-picker v-model="date2" locale="es" color="light-blue darken-3" @input="date_menu2 = false" :error-messages="errors.date2"  @change="Reload"></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="6" sm="6" md="4" lg="2">
                                <v-select v-model="is_payed" @change="Reload" :items="payed_status" outlined label="Estatus de Pago" item-value="value" item-text="status"></v-select>
                            </v-col>
                            <v-col cols="6" sm="6" md="4" lg="3">
                                <v-select v-model="income_type" @change="Reload" :items="income_types" outlined label="Tipo de Ingreso" item-value="expense" item-text="type"></v-select>
                            </v-col>
                            <v-col cols="6" sm="6" md="4" lg="3">
                                <v-select v-model="account_id" @change="Reload" :items="accounts" outlined label="Cuenta" item-value="id" item-text="alias" clearable></v-select>
                            </v-col>
                            <v-col cols="6" sm="6" md="4" lg="4">
                                <v-select v-model="paying_method_id" @change="Reload" :items="paying_methods" outlined label="Forma de pago" item-value="id" item-text="paying_method" clearable></v-select>
                            </v-col>
                            <v-col cols="12" xs="12" sm="12" md="5">
                                <v-text-field outlined color="light-blue darken-2" append-icon="search" v-model="search_table" v-on:keyup.enter="Reload" @click:clear="clearSearch" label="Buscar" type="text" clearable></v-text-field>
                            </v-col>
                        </v-row>
					</v-card-title>
					<v-divider></v-divider>
					<v-card-title>
						<v-btn text color="primary" small @click="changeOrder"><v-icon v-if="order == 'asc'">keyboard_arrow_up</v-icon><v-icon v-if="order == 'desc'">keyboard_arrow_down</v-icon>Ordenar por fecha</v-btn>
						<v-spacer></v-spacer>
						<v-btn icon @click="Reload"><v-icon>sync</v-icon></v-btn>
					</v-card-title>
					<v-card-text>
						<v-simple-table class="elevation-1" fixed-header height="650px"> 
							<thead>
								<tr>
									<th class="text-left" style="width:15%">Fecha</th>
									<th class="text-left" style="width:15%">Concepto</th>
									<th class="text-left" style="width:25%">Cliente</th>
									<th class="text-center" style="width:5%">Cuenta</th>
									<th class="text-right" style="width:10%">Monto</th>
									<th class="text-center" style="width:10%">Usuario</th>
									<th class="text-center" style="width:10%">Estatus</th>
									<th class="text-right" style="width:10%"></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(reg, index) in expenses" :key="index">
									<td v-if="!reg.date_ini">{{ reg.date }}</td>
									<td v-if="reg.date_ini">
										<span>
											<div>{{ reg.date_ini }}</div>
											<div>{{ reg.date }}</div>
										</span>
									</td>
									<td>
										<div style="padding-top:3px;"></div>
										<v-chip v-if="reg.type == 1" color="green" dark label small>Despacho</v-chip>
										<v-chip v-if="reg.type == 2" color="blue" dark label small>Hogar</v-chip>
										<v-chip v-if="reg.type == 3" color="purple darken-4" dark label small>Personal</v-chip>
										<v-chip v-if="reg.type == 4" color="cyan" dark label small>Traspaso</v-chip>
										<v-chip v-if="reg.type == 5" color="orange darken-4" dark label small>Nómina</v-chip>
										<v-chip v-if="reg.type == 6" color="lime darken-4" dark label small>Comisión</v-chip>
										<v-chip v-if="reg.type == 8" color="teal darken-1" dark label small>Tarjeta Crédito</v-chip>
										<v-chip v-if="reg.type == 9" color="purple accent-4" dark label small>Préstamo</v-chip>
										<v-chip v-if="reg.type == 10" color="red accent-4" dark label small>Error</v-chip>
										<v-chip v-if="reg.type == 11" color="pink darken-2" dark label small>FEPS</v-chip>
										<p v-if="reg.comment">{{reg.comment}}</p>
										<span>
											<div v-if="reg.type == 4"><v-icon left color="red">arrow_forward</v-icon>{{reg.transfer}}</div>
											<div v-if="reg.type == 4"><v-icon left color="green">arrow_forward</v-icon>{{reg.received}}</div>
										</span>
									</td>
									<td>{{reg.customer}}</td>
									<td class="text-center">
										<v-chip v-if="reg.account_id == 1" color="green" dark label small>{{reg.alias}}</v-chip>
										<v-chip v-else style="background-color:transparent" label>{{reg.alias}}</v-chip>
									</td>
									<td class="text-right">{{ formatPrice(reg.deposit) }}</td>
									<td class="text-center">{{ reg.initials }}</td>
									<td class="text-center">
										<v-chip v-if="reg.status == 1" color="green" dark label small>Pagado</v-chip>
										<v-chip v-if="reg.status == 0" color="warning" dark label small>Pendiente</v-chip>
										<v-chip v-if="reg.status == 2" dark label small color="error">Cancelado</v-chip>
									</td>
									<td class="text-right">
										<!-- <v-menu offset-y class="text-center">
											<template v-slot:activator="{on}">
												<v-btn v-on="on">
													<v-icon>menu</v-icon>
												</v-btn>
											</template>
											<v-list>
												<v-list-item>
													<v-list-item-content>
														<v-list-item-title>Info</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon color="primary">list</v-icon>
													</v-list-item-action>
												</v-list-item>
												<v-list-item @click="editExpense(index)">
													<v-list-item-content>
														<v-list-item-title>Editar</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon color="warning">edit</v-icon>
													</v-list-item-action>
												</v-list-item>
												<v-list-item>
													<v-list-item-content>
														<v-list-item-title>Cancelar</v-list-item-title>
													</v-list-item-content>
													<v-list-item-action>
														<v-icon color="error">block</v-icon>
													</v-list-item-action>
												</v-list-item>
											</v-list>
										</v-menu> -->
									</td>
								</tr>
								<tr>
									<td style="width:100%" colspan="10">
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

		<Expense ref="expenses_form" v-on:newExpense="newExpense($event)" v-on:updateExpense="updateExpense($event)"></Expense>

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
		<v-snackbar
            v-model="snackbar"
            :timeout="timeout"
            top
            center
            :color="snackColor"
            >
            {{ snackText }}
        </v-snackbar>
    </div>
</template>

<script>
import axios from 'axios'
import Expense from '@/components/Expense'
export default {
    layout: 'admin',
	middleware: 'auth',
	head:{
        title: 'Ingresos'
	},
	components:{Expense},
    data(){
        return{
            //Date menu
            date1:'',
			date2:'',
			// date1:new Date().toISOString().substr(0, 10),
			// date2:new Date().toISOString().substr(0, 10),
            date_menu1:false,
            date_menu2:false,
			order:'asc',
            //Filters
            payed_status:[
                {value:'todos', status:'Todo'},
                {value:0, status:'Pendiente'},
                {value:1, status:'Pagado'},
                {value:2, status:'Cancelado'}
            ],
            is_payed:'',
            income_types:[
                {expense:'', type:'Todos'},
                // {expense:1, type:'Despacho'},
                // {expense:2, type:'Hogar'},
                // {expense:3, type:'Personal'},
                // {expense:4, type:'Traspasos'},
                // {expense:5, type:'Nómina'},
                // {expense:6, type:'Comisiones'},
                {expense:7, type:'Ingresos'},
                // {expense:8, type:'Tarjeta de crédito'},
                // {expense:9, type:'Préstamo'},
            ],
            income_type:'',
            account_id:'',
            accounts:[],
            paying_method_id:'',
			paying_methods:[],
			searcher:0,
            // dates: [],
            errors:[],
            expenses:[],
			loading_table:false,
			loading:false,
			search_table:'',
			page:1,
			title:'',
			catalog_selected:'',
			services_catalog_id:'',
			status_dialog:false,
			service_status:'',
			selected_expense:'',
			//snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
			timeout: 6000,
        }
	},
	
	computed: {
		url(){
			return `${process.env.api}/api/balance?page=${this.page}`
        },
	},

	created(){
        this.loadInit();
	},

    methods:{
        async loadInit(){
			this.page = 1;
			this.date1 = this.user.session.original.date1;
			this.date2 = this.user.session.original.date2;
			this.is_payed = 1;
			this.income_type = '';
			this.account_id = '';
			this.paying_method_id = '';
            this.$axios.post('/api/finances-init-data', {movement:0, status:1})
            .then(res => {
                this.paying_methods = res.data.paying_methods;
				this.accounts = res.data.accounts;
				this.Load();
			})
        },

        async Load(){
			this.loading_table = true;
			if(this.date1 && this.date2){
				if(this.date1 > this.date2){
					this.snackbar = true;
					this.snackColor = 'error';
					this.snackText = 'La fecha final no puede ser menor a la fecha inicial.';
					this.timeout = 2500;
					this.loading_table = false;
					this.date1 = this.user.session.original.date1;
					this.date2 = this.user.session.original.date2; 
					this.Reload();
				}
				else{
					await this.$axios.post(this.url, {date1:this.date1, date2:this.date2, status:this.is_payed, type:this.income_type, movement:0, account:this.account_id, paying_method:this.paying_method_id, search:this.search_table, order:this.order})
					.then(res => {
						this.expenses = res.data.data;
						this.errors = {};
						this.loading_table = false;
					})
					.catch(error => {
						this.errors = error.response.data.errors;
						this.loading_table = false;
					})
				}
			}
		},

		infiniteScroll($state){
			setTimeout(() => {
				this.page++
				this.$axios.post(this.url, {date1:this.date1, date2:this.date2, status:this.is_payed, type:this.income_type, movement:0, account:this.account_id, paying_method:this.paying_method_id, search:this.search_table, order:this.order})
				.then( res => {

					let expenses = res.data.data;

					if(expenses.length > 0){
						this.expenses = this.expenses.concat(expenses);
						$state.loaded()
						this.loading_table = false;
					}
					else{
						$state.complete()
						this.loading_table = false;
					}

					this.errors = {};
				})
				.catch(error => {
					this.errors = error.response.data.errors;
					this.loading_table = false;
				})
			}, 500);
		},

		clearSearch(){
			this.search_table = '';
			this.expenses = {};
			this.page = 1;
			this.$refs.infiniteLoading.stateChanger.reset();
			this.Load();
		},

		Reload(){
			this.expenses = {};
			this.page = 1;
			this.$refs.infiniteLoading.stateChanger.reset();
			this.Load();
		},

		changeOrder(){
			if(this.order == 'asc'){
				this.order = 'desc';
			}
			else{
				this.order = 'asc';
			}

			this.Reload();
		},
		
		formatPrice(value) {
			let val = (value/1).toFixed(2).replace('.,', '.')
			return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		},

		createExpense(){
			this.$refs.expenses_form.createExpense();
		},

		createSalary(){
			this.$refs.expenses_form.createSalary();
		},

		createTransfer(){
			this.$refs.expenses_form.createTransfer();
		},

		newExpense(data){
			this.expenses.unshift(data);
		},

		editExpense(index){
			const expense = this.expenses[index];
			this.selected_expense = index;
			let expense_id = expense.id;
			let income_type = expense.type;
			this.$refs.expenses_form.editExpense(expense_id, income_type);
		},

		async updateExpense(data){
			const index = this.selected_expense;
			this.expenses.splice(index, 1, data);
			this.selected_expense = '';
			// await this.$axios.get(`/api/balance/view/${data}`)
			// .then(res => {
			// 	// this.expenses[index] = res.data;
			// 	this.expenses.splice(index, 1, data)
			// 	this.selected_expense = '';
			// })
			// .catch(error => {
			// 	console.log(error);
			// })
		}
    } 
}
</script>
