<template>
	<div>
		<h2>Facturas</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="bills_loading">
					<v-card-title>
						<v-btn color="secondary" class="mx-1" @click="addBill">Factura<v-icon right>add</v-icon></v-btn>
						<v-btn color="info" class="mx-1" @click="addCustomer">Cliente<v-icon right>person_add</v-icon></v-btn>
						<v-btn color="primary" class="mx-1" @click="addService">Servicio<v-icon right>add</v-icon></v-btn>
						<v-btn color="primary" class="mx-1" @click="addPackage">Paquete<v-icon right>add</v-icon></v-btn>
						<v-spacer></v-spacer>
						<v-btn class="ml-2" icon @click="Reload"><v-icon>sync</v-icon></v-btn>
					</v-card-title>
					<v-card-title>
						<v-container fluid>
							<v-row>
								<v-col cols="12" sm="12" md="3" lg="5">
									<v-text-field v-model="search_table" v-on:keyup.enter="Reload" filled label="Buscar..." clearable @click:clear="clearSearch"></v-text-field>
								</v-col>
							</v-row>
							<v-row>
								<v-btn text small color="blue" @click="sortBy">
									<v-icon v-if="orderBy == 'asc'" left small>keyboard_arrow_up</v-icon>
									<v-icon v-if="orderBy == 'desc'" left small>keyboard_arrow_down</v-icon>
									<span class="caption text-lowercase">Ordenar por folio</span>
								</v-btn>
							</v-row>
						</v-container>
					</v-card-title>
					<v-card-text>
						<v-simple-table class="elevation-3" fixed-header height="700px">
							<thead>
								<tr>
									<th class="text-left" style="width:10%">Folio</th>
									<th class="text-left" style="width:14%">Fecha</th>
									<th class="text-left" style="width:30%">Cliente</th>
									<th class="text-center" style="width:12%">Total</th>
									<th class="text-center" style="width:12%">Saldo</th>
									<th class="text-center" style="width:8%">Usuario</th>
									<th class="text-center" style="width:8%">Estatus</th>
									<th class="text-right" style="width:6%"></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(bill, index) in bills" :key="index">
									<td :title="bill.id">
                                        <v-chip label small v-if="bill.status == 0" class="orange" dark><b>{{bill.folio}}</b></v-chip>
										<v-chip label small v-if="bill.status == 1" class="green" dark><b>{{bill.folio}}</b></v-chip>
										<v-chip label small v-if="bill.status == 2" color="error"><b>{{bill.folio}}</b></v-chip>
										<v-chip label small v-if="bill.status == 3" class="error"><b>{{bill.folio}}</b></v-chip>
                                    </td>
									<td>{{ bill.date }}</td>
									<td>{{ bill.customer }}</td>
									<td class="text-right">{{ formatPrice(bill.total) }}</td>
									<td class="text-right">{{ formatPrice(bill.balance) }}</td>
									<td class="text-center">{{ bill.initials }}</td>
									<td class="text-center">
										<v-chip label small v-if="bill.status == 0" class="orange" dark>Pendiente</v-chip>
										<v-chip label small v-if="bill.status == 1" class="green" dark>Pagado</v-chip>
										<v-chip label small v-if="bill.status == 2" color="error">Cancelado</v-chip>
										<v-chip label small v-if="bill.status == 3" class="error">Reemplazado</v-chip>
									</td>
									<td>
										<v-menu offset-y class="text-center">
											<template v-slot:activator="{on}">
												<v-btn v-on="on">
													<v-icon>menu</v-icon>
												</v-btn>
											</template>
											<v-list>
												<v-list-item @click="editBill(index)">
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
										</v-menu>
									</td>
								</tr>
								<tr>
									<td style="width:100%" colspan="100%">
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
		<Customer :customer_dialog="1" ref="customer_form"></Customer>
		<Services :service_dialog="1" ref="services_form" v-on:addService="newService($event)" v-on:updateService="updateService($event)"></Services>
		<Bills :billing_dialog="1" ref="bills_form" v-on:newBill="newBill($event)" v-on:updateBill="updateBill($event)" v-on:reloadBills="Reload"></Bills>
	</div>
</template>

<script>
import Customer from '@/components/Customer'
import Services from '@/components/Services'
import Bills from '@/components/Bills'
import axios from 'axios'
export default {
	layout: 'admin',
	middleware: 'auth',
	head:{
        title: 'Control de Servicios'
	},
	components:{Customer, Services, Bills},

	data(){
		return{
			//Data
			bills:[],
			bills_loading:false,
			search_table:'',
			selected_bill:'',
			orderBy:'desc',
			page:1,
		}
	},

	computed: {
		url(){
			return `${process.env.api}/api/bills?page=${this.page}`
		}
	},

	created(){
		this.loadFilters();
		this.Load();
	},

	methods:{
		loadFilters(){
			this.search_table = '';
		},

		async Load(){
			this.bills_loading = true;
			await this.$axios.post(this.url, {search:this.search_table, orderBy:this.orderBy, type:'Factura'})
			.then(res => {
				this.bills = res.data.data;
				this.bills_loading = false;
			})
			.catch(error => {
				this.bills_loading = false; 
			})
		},

		infiniteScroll($state){
			setTimeout(() => {
				this.page++
				this.$axios.post(this.url, {search:this.search_table, orderBy:this.orderBy, type:'Factura'})
				.then( res => {

					let bills = res.data.data;

					if(bills.length > 0){
						this.bills = this.bills.concat(bills);
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
			this.loadFilters();
			this.bills = {};
			this.page = 1;
			this.$refs.infiniteLoading.stateChanger.reset();
			this.Load();
		},

		Reload(){
			this.bills = {};
			this.page = 1;
			this.$refs.infiniteLoading.stateChanger.reset();
			this.Load();
		},

		sortBy(){
			if(this.orderBy == 'desc'){
				this.orderBy = 'asc';
				this.Load();
			}
			else{
				this.orderBy = 'desc';
				this.Load();
			}
		},
		
		formatPrice(value) {
			let val = (value/1).toFixed(2).replace('.,', '.')
			return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		},

		addCustomer(){
			this.$refs.customer_form.addCustomer();
		},

		addService(){
			this.$refs.services_form.addService();
		},

		addPackage(){
			this.$refs.services_form.addPackage();
		},

		addBill(){
			this.$refs.bills_form.addBill(2);
		},

		newBill(data){
			this.bills.unshift(data);
		},

		editBill(index){
			this.selected_bill = index;
			this.$refs.bills_form.editBill(this.bills[index].id,2);
		},

		updateBill(data){
			this.services.splice(this.selected_bill, 1, data);
			this.selected_bill = '';
		},

		formatPrice(value) {
			let val = (value/1).toFixed(2).replace('.,', '.')
			return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		},

		newBill(data){
			this.bills.unshift(data);
		}
	}
}
</script>	

<style>
	small{
		color: grey !important;
	}

	ul {
		list-style-type: none;
	}

	li{
		margin-left: -20px !important;
		text-align: left !important;
	}
</style>